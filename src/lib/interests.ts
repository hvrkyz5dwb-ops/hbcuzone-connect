// Lightweight, on-device interest signal.
// Every time a student opens a slide, a news topic or a hub category we bump a
// counter in localStorage. The top topics are then handed to the AI feeds so
// news, scholarships and internships lean toward what the student actually
// taps. Nothing leaves the device except the topic words themselves.

const KEY = "plugu.interests.v1";
const MAX_TOPICS = 40;

type Store = Record<string, { n: number; t: number }>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage full or blocked — interests are best-effort */
  }
}

export function recordInterest(topic: string, weight = 1) {
  const t = topic.trim().toLowerCase().slice(0, 40);
  if (!t) return;
  const s = read();
  const prev = s[t]?.n ?? 0;
  s[t] = { n: prev + weight, t: Date.now() };
  // Keep the map small: drop the least recently touched entries.
  const keys = Object.keys(s);
  if (keys.length > MAX_TOPICS) {
    keys
      .sort((a, b) => (s[a].t ?? 0) - (s[b].t ?? 0))
      .slice(0, keys.length - MAX_TOPICS)
      .forEach((k) => delete s[k]);
  }
  write(s);
}

/** Top interests, strongest first (recency-weighted). */
export function topInterests(limit = 6): string[] {
  const s = read();
  const now = Date.now();
  return Object.entries(s)
    .map(([k, v]) => {
      const days = (now - (v.t ?? now)) / 86_400_000;
      return { k, score: v.n / (1 + days / 14) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.k);
}

export function clearInterests() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
