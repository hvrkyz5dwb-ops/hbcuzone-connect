// Local, per-device progress for the PlugU learn decks: furthest slide seen,
// completion badges and saved quotes from reading mode.
const KEY = "plugu.learn.progress.v1";
const QUOTES_KEY = "plugu.learn.savedQuotes.v1";

export type TrackProgress = {
  slide: number;
  completed: boolean;
  quizBest?: number;
  completedAt?: string;
};

type Store = Record<string, TrackProgress>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}") as Store;
  } catch {
    return {};
  }
}

function write(store: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {}
}

export function getProgress(slug: string): TrackProgress {
  return read()[slug] ?? { slide: 0, completed: false };
}

export function setSlide(slug: string, slide: number) {
  const store = read();
  const cur = store[slug] ?? { slide: 0, completed: false };
  store[slug] = { ...cur, slide: Math.max(cur.slide, slide) };
  write(store);
}

export function markCompleted(slug: string, quizScore?: number) {
  const store = read();
  const cur = store[slug] ?? { slide: 0, completed: false };
  store[slug] = {
    ...cur,
    completed: true,
    completedAt: cur.completedAt ?? new Date().toISOString(),
    quizBest: Math.max(cur.quizBest ?? 0, quizScore ?? 0),
  };
  write(store);
}

export type SavedQuote = { text: string; author: string; book: string; savedAt: string };

export function getSavedQuotes(): SavedQuote[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(QUOTES_KEY) || "[]") as SavedQuote[];
  } catch {
    return [];
  }
}

export function toggleSavedQuote(q: Omit<SavedQuote, "savedAt">): SavedQuote[] {
  const list = getSavedQuotes();
  const idx = list.findIndex((s) => s.text === q.text);
  const next = idx >= 0 ? list.filter((_, i) => i !== idx) : [{ ...q, savedAt: new Date().toISOString() }, ...list];
  try {
    window.localStorage.setItem(QUOTES_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function isQuoteSaved(list: SavedQuote[], text: string) {
  return list.some((s) => s.text === text);
}
