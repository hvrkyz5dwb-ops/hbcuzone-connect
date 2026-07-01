import { schoolProfiles, schoolSlug } from "./hbcus-data";

export type LaunchStatus = "live" | "coming-soon";

export type LaunchInfo = {
  slug: string;
  campus: string;
  status: LaunchStatus;
  waitlist: number;
  businessesSigned: number;
  unlockPct: number;   // 0-100
  goal: number;        // waitlist goal
  launchDate: string;  // ISO date
};

// Live yards (already unlocked). Everything else uses a mocked countdown.
const LIVE_SLUGS = new Set([
  "howard-university",
  "spelman-college",
  "morehouse-college",
  "hampton-university",
  "famu",
  "talladega-college",
]);

const COMING_SOON: Record<string, { unlockPct: number; daysOut: number; waitlist: number; businessesSigned: number; goal: number }> = {
  "tuskegee-university": { unlockPct: 74, daysOut: 21, waitlist: 812, businessesSigned: 34, goal: 1200 },
  nccu:                  { unlockPct: 62, daysOut: 34, waitlist: 604, businessesSigned: 22, goal: 1000 },
};

const WAITLIST_KEY = "plugu.launchWaitlist.v1";
const HANDLE_KEY   = "plugu.launchHandles.v1";
const UNLOCK_KEY   = "plugu.launchUnlocked.v1";

function readMap<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(key) || "{}"); } catch { return {}; }
}
function writeMap<T>(key: string, value: Record<string, T>) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

export function getLaunchInfo(slug: string): LaunchInfo | null {
  const school = schoolProfiles.find((s) => schoolSlug(s.name) === slug);
  if (!school) return null;
  const now = new Date();
  if (LIVE_SLUGS.has(slug)) {
    return {
      slug, campus: school.name, status: "live",
      waitlist: school.pluguStudents, businessesSigned: Math.round(school.pluguStudents / 24),
      unlockPct: 100, goal: school.pluguStudents, launchDate: now.toISOString(),
    };
  }
  const base = COMING_SOON[slug] ?? { unlockPct: 48, daysOut: 45, waitlist: 380, businessesSigned: 15, goal: 900 };
  const localWait = (readMap<number>(WAITLIST_KEY)[slug] ?? 0);
  const localBiz  = (readMap<number>(HANDLE_KEY)[slug] ?? 0);
  const waitlist = base.waitlist + localWait;
  const businessesSigned = base.businessesSigned + localBiz;
  const unlockPct = Math.min(100, Math.round((waitlist / base.goal) * 100));
  const launchDate = new Date(now.getTime() + base.daysOut * 24 * 60 * 60 * 1000).toISOString();
  const unlocked = readMap<boolean>(UNLOCK_KEY)[slug];
  return {
    slug, campus: school.name,
    status: unlocked || unlockPct >= 100 ? "live" : "coming-soon",
    waitlist, businessesSigned, unlockPct, goal: base.goal, launchDate,
  };
}

export function joinWaitlist(slug: string) {
  const map = readMap<number>(WAITLIST_KEY);
  map[slug] = (map[slug] ?? 0) + 1;
  writeMap(WAITLIST_KEY, map);
}

export function reserveHandle(slug: string) {
  const map = readMap<number>(HANDLE_KEY);
  map[slug] = (map[slug] ?? 0) + 1;
  writeMap(HANDLE_KEY, map);
}

export function markUnlocked(slug: string) {
  const map = readMap<boolean>(UNLOCK_KEY);
  map[slug] = true;
  writeMap(UNLOCK_KEY, map);
}

export function launchStatusFor(slug: string): LaunchStatus {
  return getLaunchInfo(slug)?.status ?? "coming-soon";
}

export function countdownParts(iso: string): { days: number; hours: number; minutes: number; seconds: number; total: number } {
  const diff = Math.max(0, new Date(iso).getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, total: diff };
}