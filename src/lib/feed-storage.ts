// Unified persistence for CampusFeed interactions.
// Backed by localStorage under plugu.feed.v1, with change subscribers so
// multiple components stay in sync.

export type FeedComment = { id: string; postId: string; text: string; author: string; ts: number };

export type FeedState = {
  liked: string[];
  saved: string[];
  follows: string[];
  comments: Record<string, FeedComment[]>;
};

const KEY = "plugu.feed.v1";
const LEGACY = { liked: "plugu.feed.liked", saved: "plugu.feed.saved", follows: "plugu.feed.follows" };
const listeners = new Set<() => void>();

function empty(): FeedState { return { liked: [], saved: [], follows: [], comments: {} }; }

function read(): FeedState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch {}
  // migrate legacy sets
  const migrated = empty();
  try {
    migrated.liked = JSON.parse(window.localStorage.getItem(LEGACY.liked) || "[]");
    migrated.saved = JSON.parse(window.localStorage.getItem(LEGACY.saved) || "[]");
    migrated.follows = JSON.parse(window.localStorage.getItem(LEGACY.follows) || "[]");
    window.localStorage.setItem(KEY, JSON.stringify(migrated));
  } catch {}
  return migrated;
}

function write(next: FeedState) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  listeners.forEach((cb) => cb());
}

export function getFeedState(): FeedState { return read(); }

export function subscribeFeed(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function toggle(arr: string[], id: string): string[] {
  return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
}

export function toggleLike(id: string): boolean {
  const s = read();
  s.liked = toggle(s.liked, id);
  write(s);
  return s.liked.includes(id);
}

export function toggleSave(id: string): boolean {
  const s = read();
  s.saved = toggle(s.saved, id);
  write(s);
  return s.saved.includes(id);
}

export function toggleFollow(name: string): boolean {
  const s = read();
  s.follows = toggle(s.follows, name);
  write(s);
  return s.follows.includes(name);
}

export function addComment(postId: string, text: string, author = "You"): FeedComment {
  const s = read();
  const c: FeedComment = { id: `c_${Date.now()}`, postId, text, author, ts: Date.now() };
  s.comments[postId] = [...(s.comments[postId] ?? []), c];
  write(s);
  return c;
}

export function isLiked(id: string) { return read().liked.includes(id); }
export function isSaved(id: string) { return read().saved.includes(id); }
export function isFollowing(name: string) { return read().follows.includes(name); }
export function commentsFor(postId: string): FeedComment[] { return read().comments[postId] ?? []; }