// Client-side content controls required by App Store UGC rules: a user can
// hide an individual piece of content and block an author so it disappears
// immediately, independent of moderation turnaround.
const HIDDEN_KEY = "plugu.hidden_posts";
const MUTED_KEY = "plugu.muted_authors";
const HIDDEN_CONTENT_KEY = "plugu.hidden_content";

export const HIDDEN_CONTENT_EVENT = "plugu:hidden-content";

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

/* ---- Generic "hide this content from me, right now" store ---------------- */

const tag = (type: string, id: string) => `${type}:${id}`;

export function hideContent(type: string, id: string) {
  write(HIDDEN_CONTENT_KEY, [...read(HIDDEN_CONTENT_KEY), tag(type, id)]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(HIDDEN_CONTENT_EVENT));
  }
}

export function unhideContent(type: string, id: string) {
  write(
    HIDDEN_CONTENT_KEY,
    read(HIDDEN_CONTENT_KEY).filter((t) => t !== tag(type, id)),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(HIDDEN_CONTENT_EVENT));
  }
}

export function isContentHidden(type: string, id: string) {
  return read(HIDDEN_CONTENT_KEY).includes(tag(type, id));
}

export function hiddenContentTags(): string[] {
  return read(HIDDEN_CONTENT_KEY);
}
