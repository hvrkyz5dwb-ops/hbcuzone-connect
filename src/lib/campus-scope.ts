// Campus scope — which campus the student is currently *looking at*.
//
// PlugU is one app for every HBCU campus (one Bundle ID, one account). A
// verified student's home campus always comes from their verified .edu
// school; this module only holds the optional "explore another campus"
// override so the feed, market, events and search can be pointed at a
// different supported campus without signing out or installing anything.
//
// The override is browser-local, never written to the database, and never
// changes the student's verified school.

const KEY = "plugu:explore-campus";
const EVENT = "plugu:explore-campus-change";

let current: string | null = null;
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    current = window.localStorage.getItem(KEY);
  } catch {
    current = null;
  }
}

export function getExploreCampus(): string | null {
  hydrate();
  return current;
}

export function setExploreCampus(name: string | null) {
  current = name && name.trim() ? name.trim() : null;
  hydrated = true;
  try {
    if (current) window.localStorage.setItem(KEY, current);
    else window.localStorage.removeItem(KEY);
  } catch {
    /* storage blocked — the override just stays in memory */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT));
  }
}

export function subscribeExploreCampus(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}
