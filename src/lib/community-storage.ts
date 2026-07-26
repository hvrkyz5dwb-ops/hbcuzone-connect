// School-scoped community posts — students share what's happening on campus.
// Persisted in localStorage so posts survive reloads without a backend.
export type CommunityPost = {
  id: string;
  school: string;
  author: string;
  text: string;
  createdAt: number;
  likes: number;
  likedByMe: boolean;
};

const KEY = "plugu:community-posts:v1";

function readAll(): CommunityPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CommunityPost[]) : [];
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
  if (!school) return all;
  const n = norm(school);
  return all.filter((p) => {
    const ps = norm(p.school);
    return ps.includes(n) || n.includes(ps);
  });
}

export function addCommunityPost(input: { school: string; author: string; text: string }): CommunityPost {
  const post: CommunityPost = {
    id: `cp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    school: input.school,
    author: input.author || "Plug",
    text: input.text.trim(),
    createdAt: Date.now(),
    likes: 0,
    likedByMe: false,
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