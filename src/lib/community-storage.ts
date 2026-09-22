// School-scoped community posts, stored in the shared database so a post a
// student makes is actually visible to other students — not just on their own
// device. A small in-memory cache keeps the existing synchronous read API while
// every write goes straight to the backend.
import { supabase } from "@/integrations/supabase/client";

export type Comment = {
  id: string;
  postId: string;
  author: string;
  text: string;
  createdAt: number;
};

/** Intent tags so students can scan the board fast. */
export type PostTag = "chatter" | "selling" | "looking" | "hiring" | "event" | "heads_up";

export type CommunityPost = {
  id: string;
  school: string;
  author: string;
  authorId: string;
  text: string;
  createdAt: number;
  likes: number;
  likedByMe: boolean;
  visibility: "campus" | "public";
  tag: PostTag;
  comments: Comment[];
};

let cache: CommunityPost[] = [];
let loading: Promise<void> | null = null;

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("plugu:community-updated"));
  }
}

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function nameFor(row: { display_name?: string | null; full_name?: string | null; username?: string | null } | null) {
  return row?.display_name?.trim() || row?.full_name?.trim() || row?.username?.trim() || "Student";
}

/** Pull the board from the database into the cache. Safe to call repeatedly. */
export async function refreshCommunityPosts(): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    try {
      const { data: posts, error } = await supabase
        .from("campus_posts")
        .select("id, author_id, school_name, body, visibility, tag, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error || !posts) return;

      const ids = posts.map((p) => p.id);
      const authorIds = Array.from(new Set(posts.map((p) => p.author_id)));

      const [{ data: comments }, { data: likes }, { data: people }, { data: me }] = await Promise.all([
        ids.length
          ? supabase
              .from("campus_post_comments")
              .select("id, post_id, author_id, body, created_at")
              .in("post_id", ids)
              .eq("status", "active")
              .order("created_at", { ascending: true })
          : Promise.resolve({ data: [] as never[] }),
        ids.length
          ? supabase.from("campus_post_likes").select("post_id, user_id").in("post_id", ids)
          : Promise.resolve({ data: [] as never[] }),
        authorIds.length
          ? supabase.from("public_profiles").select("id, display_name, full_name, username").in("id", authorIds)
          : Promise.resolve({ data: [] as never[] }),
        supabase.auth.getUser(),
      ]);

      const myId = (me as { user?: { id: string } } | null)?.user?.id ?? null;
      const nameById = new Map<string, string>();
      for (const p of (people ?? []) as { id: string }[]) nameById.set(p.id, nameFor(p as never));

      const commentAuthorIds = Array.from(new Set(((comments ?? []) as { author_id: string }[]).map((c) => c.author_id)));
      const missing = commentAuthorIds.filter((id) => !nameById.has(id));
      if (missing.length) {
        const { data: more } = await supabase
          .from("public_profiles")
          .select("id, display_name, full_name, username")
          .in("id", missing);
        for (const p of (more ?? []) as { id: string }[]) nameById.set(p.id, nameFor(p as never));
      }

      cache = posts.map((p) => ({
        id: p.id,
        school: p.school_name ?? "",
        author: nameById.get(p.author_id) ?? "Student",
        authorId: p.author_id,
        text: p.body,
        createdAt: +new Date(p.created_at),
        likes: ((likes ?? []) as { post_id: string }[]).filter((l) => l.post_id === p.id).length,
        likedByMe: !!myId && ((likes ?? []) as { post_id: string; user_id: string }[]).some((l) => l.post_id === p.id && l.user_id === myId),
        visibility: (p.visibility === "public" ? "public" : "campus") as "campus" | "public",
        tag: ((p.tag as PostTag) ?? "chatter") as PostTag,
        comments: ((comments ?? []) as { id: string; post_id: string; author_id: string; body: string; created_at: string }[])
          .filter((c) => c.post_id === p.id)
          .map((c) => ({
            id: c.id,
            postId: c.post_id,
            author: nameById.get(c.author_id) ?? "Student",
            text: c.body,
            createdAt: +new Date(c.created_at),
          })),
      }));
      emit();
    } finally {
      loading = null;
    }
  })();
  return loading;
}

export function listCommunityPosts(school?: string): CommunityPost[] {
  const all = [...cache].sort((a, b) => b.createdAt - a.createdAt);
  if (!school) return all.filter((p) => p.visibility === "public");
  const n = norm(school);
  return all.filter((p) => {
    if (p.visibility === "public") return true;
    const ps = norm(p.school);
    return !!ps && (ps.includes(n) || n.includes(ps));
  });
}

export async function addCommunityPost(input: {
  school: string;
  schoolId?: string | null;
  author?: string;
  text: string;
  visibility?: "campus" | "public";
  tag?: PostTag;
}): Promise<CommunityPost | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from("campus_posts")
    .insert({
      author_id: uid,
      school_id: input.schoolId ?? null,
      school_name: input.school,
      body: input.text.trim(),
      visibility: input.visibility ?? "campus",
      tag: input.tag ?? "chatter",
    })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("Post failed");
  await refreshCommunityPosts();
  return cache.find((p) => p.id === data.id) ?? null;
}

export async function toggleLikeCommunityPost(id: string) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  const liked = cache.find((p) => p.id === id)?.likedByMe;
  if (liked) {
    await supabase.from("campus_post_likes").delete().eq("post_id", id).eq("user_id", uid);
  } else {
    await supabase.from("campus_post_likes").insert({ post_id: id, user_id: uid });
  }
  await refreshCommunityPosts();
}

export async function removeCommunityPost(id: string) {
  await supabase.from("campus_posts").delete().eq("id", id);
  await refreshCommunityPosts();
}

export async function addComment(postId: string, _author: string, text: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  const { error } = await supabase
    .from("campus_post_comments")
    .insert({ post_id: postId, author_id: uid, body: text.trim() });
  if (error) throw error;
  await refreshCommunityPosts();
}

export async function removeComment(_postId: string, commentId: string) {
  await supabase.from("campus_post_comments").delete().eq("id", commentId);
  await refreshCommunityPosts();
}

export function subscribeCommunityPosts(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("plugu:community-updated", handler);
  void refreshCommunityPosts();
  return () => window.removeEventListener("plugu:community-updated", handler);
}
