// Client-side content controls required by App Store UGC rules: a user can
// hide an individual post and block an author so their content disappears
// immediately, independent of moderation turnaround.
const HIDDEN_KEY = "plugu.hidden_posts";
const MUTED_KEY = "plugu.muted_authors";

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, list: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(new Set(list))));
  } catch {}
}

export function hideCommunityPost(id: string) {
  write(HIDDEN_KEY, [...read(HIDDEN_KEY), id]);
}
export function isPostHidden(id: string) {
  return read(HIDDEN_KEY).includes(id);
}
export function muteAuthor(name: string) {
  write(MUTED_KEY, [...read(MUTED_KEY), name.toLowerCase()]);
}
export function unmuteAuthor(name: string) {
  write(MUTED_KEY, read(MUTED_KEY).filter((n) => n !== name.toLowerCase()));
}
export function isAuthorMuted(name: string) {
  return read(MUTED_KEY).includes(name.toLowerCase());
}
export function mutedAuthors() {
  return read(MUTED_KEY);
}
