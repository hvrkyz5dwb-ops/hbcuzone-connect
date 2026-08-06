// First-launch experience state — splash gating, guest intro, member
// onboarding, coach-mark tour, welcome card, and the one-time animated
// feed entrance. Everything degrades silently when storage is blocked.

function get(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function set(key: string, value: string) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, value); } catch {}
}
function remove(key: string) {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(key); } catch {}
}

/* — Cinematic splash gating — */
// PLAYED (sessionStorage): once the splash plays in a tab, refreshing that
//   tab won't replay it. Cleared when the tab closes.
// RECENT (localStorage): timestamp of the most recent play in ANY tab, so a
//   second tab opened right after the first skips instead of doubling up.
export const SPLASH_PLAYED_KEY = "plugu.splash.playedThisSession";
export const SPLASH_RECENT_KEY = "plugu.splash.lastPlayedAt";
const MULTI_TAB_WINDOW_MS = 15_000;

let splashShownThisRuntime = false;

export function shouldPlaySplash(): boolean {
  if (typeof window === "undefined") return false;
  if (splashShownThisRuntime) return false;
  try {
    if (window.sessionStorage.getItem(SPLASH_PLAYED_KEY)) return false;
  } catch {}
  const recent = Number(get(SPLASH_RECENT_KEY) ?? 0);
  if (recent && Date.now() - recent < MULTI_TAB_WINDOW_MS) return false;
  return true;
}

export function markSplashPlayed() {
  if (typeof window === "undefined") return;
  splashShownThisRuntime = true;
  try { window.sessionStorage.setItem(SPLASH_PLAYED_KEY, "1"); } catch {}
  set(SPLASH_RECENT_KEY, String(Date.now()));
}

/* — Guest intro (pre-auth slides) — */
const INTRO_SEEN_KEY = "plugu.intro.seen";
export function hasSeenIntro(): boolean { return !!get(INTRO_SEEN_KEY); }
export function markIntroSeen() { set(INTRO_SEEN_KEY, "1"); }

/* — Member onboarding slides — */
const ONBOARDED_KEY = "plugu.onboarded";
export function hasOnboarded(): boolean { return !!get(ONBOARDED_KEY); }
export function markOnboarded() { set(ONBOARDED_KEY, "1"); }

/* — Coach-mark tour — */
const TOUR_KEY = "plugu.tour.done";
export function hasToured(): boolean { return !!get(TOUR_KEY); }
export function markToured() { set(TOUR_KEY, "1"); }

/* — Post-signup welcome card — */
const WELCOME_PENDING_KEY = "plugu.welcome.pending";
export function consumeWelcomePending(): boolean {
  const pending = !!get(WELCOME_PENDING_KEY);
  if (pending) remove(WELCOME_PENDING_KEY);
  return pending;
}

/* — One-time animated feed entrance after the tour — */
const FEED_STAGGER_KEY = "plugu.feed.staggerPending";
export const FIRST_FEED_EVENT = "plugu:first-feed";
export function setFeedStaggerPending() { set(FEED_STAGGER_KEY, "1"); }
export function consumeFeedStaggerPending(): boolean {
  const pending = !!get(FEED_STAGGER_KEY);
  if (pending) remove(FEED_STAGGER_KEY);
  return pending;
}