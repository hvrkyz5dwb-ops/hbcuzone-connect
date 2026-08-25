// School-scoped community posts — students share what's happening on campus.
// Persisted in localStorage so posts survive reloads without a backend.

export type Comment = {
  id: string;
  postId: string;
  author: string;
  text: string;
  createdAt: number;
};

/** Fizz-style intent tags so buyers and sellers can scan the feed fast. */
export type PostTag = "chatter" | "selling" | "looking" | "hiring" | "event" | "heads_up";

export type CommunityPost = {
  id: string;
  school: string;
  author: string;
  text: string;
  createdAt: number;
  likes: number;
  likedByMe: boolean;
  visibility: "campus" | "public";
  tag: PostTag;
  comments: Comment[];
};

const KEY = "plugu:community-posts:v2";

function readAll(): CommunityPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CommunityPost[];
    // Backfill new fields for legacy v1 posts.
    return parsed.map((p) => ({
      ...p,
      visibility: p.visibility || "campus",
      tag: p.tag || "chatter",
      comments: p.comments || [],
    }));
  } catch {
    return [];
  }
}

function writeAll(list: CommunityPost[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("plugu:community-updated"));
  } catch {}
}

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function listCommunityPosts(school?: string): CommunityPost[] {
  const all = readAll().sort((a, b) => b.createdAt - a.createdAt);
  if (!school) return all.filter((p) => p.visibility === "public");
  const n = norm(school);
  return all.filter((p) => {
    if (p.visibility === "public") return true;
    const ps = norm(p.school);
    return ps.includes(n) || n.includes(ps);
  });
}

export function addCommunityPost(input: {
  school: string;
  author: string;
  text: string;
  visibility?: "campus" | "public";
  tag?: PostTag;
}): CommunityPost {
  const post: CommunityPost = {
    id: `cp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    school: input.school,
    author: input.author || "Plug",
    text: input.text.trim(),
    createdAt: Date.now(),
    likes: 0,
    likedByMe: false,
    visibility: input.visibility || "campus",
    comments: [],
  };
  writeAll([post, ...readAll()]);
  return post;
}

export function toggleLikeCommunityPost(id: string) {
  writeAll(
    readAll().map((p) =>
      p.id === id
        ? { ...p, likedByMe: !p.likedByMe, likes: Math.max(0, p.likes + (p.likedByMe ? -1 : 1)) }
        : p,
    ),
  );
}

export function removeCommunityPost(id: string) {
  writeAll(readAll().filter((p) => p.id !== id));
}

export function addComment(postId: string, author: string, text: string): Comment {
  const comment: Comment = {
    id: `cc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    postId,
    author: author || "Plug",
    text: text.trim(),
    createdAt: Date.now(),
  };
  writeAll(
    readAll().map((p) =>
      p.id === postId ? { ...p, comments: [...p.comments, comment] } : p,
    ),
  );
  return comment;
}

export function removeComment(postId: string, commentId: string) {
  writeAll(
    readAll().map((p) =>
      p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p,
    ),
  );
}

export function subscribeCommunityPosts(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("plugu:community-updated", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("plugu:community-updated", handler);
    window.removeEventListener("storage", handler);
  };
}
