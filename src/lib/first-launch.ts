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

/* — Cinematic intro gating — */
// Change this release id only for a major, approved intro update. A local,
// versioned flag means the full film runs once after installation/update and
// never needs an account, cookie, session, or database request.
export const INTRO_RELEASE = "monument-campus-2026-09";
export const INTRO_RELEASE_KEY = "plugu.intro.release";

let splashShownThisRuntime = false;

export function shouldPlaySplash(): boolean {
  if (typeof window === "undefined") return false;
  if (splashShownThisRuntime) return false;
  try {
    return window.localStorage.getItem(INTRO_RELEASE_KEY) !== INTRO_RELEASE;
  } catch {
    // If persistence is unavailable, skip rather than replaying every launch.
    return false;
  }
}

export function markSplashPlayed() {
  if (typeof window === "undefined") return;
  splashShownThisRuntime = true;
  set(INTRO_RELEASE_KEY, INTRO_RELEASE);
}

/* — Onboarding slides —
 * The same slide deck serves guests (pre-auth) and new members (post-auth),
 * so completing it in either place satisfies both gates. Keeping two
 * independent flags made a new user watch the identical intro twice: once
 * before signing up and again on their first signed-in home screen. */
const INTRO_SEEN_KEY = "plugu.intro.seen";
const ONBOARDED_KEY = "plugu.onboarded";
function markSlidesSeen() {
  set(INTRO_SEEN_KEY, "1");
  set(ONBOARDED_KEY, "1");
}
export function hasSeenIntro(): boolean { return !!get(INTRO_SEEN_KEY) || !!get(ONBOARDED_KEY); }
export function markIntroSeen() { markSlidesSeen(); }
export function hasOnboarded(): boolean { return hasSeenIntro(); }
export function markOnboarded() { markSlidesSeen(); }

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