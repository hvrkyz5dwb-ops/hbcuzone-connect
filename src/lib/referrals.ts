export type Referral = {
  code: string;      // code used
  name: string;      // referred person label
  campus?: string;
  verified: boolean; // .edu confirmed
  business: boolean; // opened a seller account
  at: string;
};

export type ReferralState = {
  code: string;
  createdAt: string;
  referrals: Referral[];
  streak: number;
  lastReferralAt?: string;
};

const KEY = "plugu.referrals.v1";

function newCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `PU-${out}`;
}

export function getReferralState(): ReferralState {
  if (typeof window === "undefined") {
    return { code: "PU-XXXXXX", createdAt: new Date().toISOString(), referrals: [], streak: 0 };
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial: ReferralState = {
    code: newCode(),
    createdAt: new Date().toISOString(),
    referrals: [],
    streak: 0,
  };
  window.localStorage.setItem(KEY, JSON.stringify(initial));
  return initial;
}

function save(state: ReferralState) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function referralLink(code: string): string {
  if (typeof window === "undefined") return `https://plugu.app/join/${code}`;
  return `${window.location.origin}/signup?ref=${encodeURIComponent(code)}`;
}

export function addReferral(r: Omit<Referral, "at">) {
  const state = getReferralState();
  const now = new Date();
  const last = state.lastReferralAt ? new Date(state.lastReferralAt) : null;
  const withinWeek = last && now.getTime() - last.getTime() < 1000 * 60 * 60 * 24 * 7;
  state.referrals.unshift({ ...r, at: now.toISOString() });
  state.streak = withinWeek ? state.streak + 1 : 1;
  state.lastReferralAt = now.toISOString();
  save(state);
  return state;
}

export type ReferralAchievement = {
  key: string;
  label: string;
  hint: string;
  earned: boolean;
  progress: number; // 0-100
};

export function referralAchievements(state: ReferralState): ReferralAchievement[] {
  const total = state.referrals.length;
  const verified = state.referrals.filter((r) => r.verified).length;
  const businesses = state.referrals.filter((r) => r.business).length;
  const streak = state.streak;

  return [
    { key: "pioneer", label: "Plug Pioneer", hint: "Refer your first student", earned: total >= 1, progress: Math.min(100, total * 100) },
    { key: "builder", label: "Campus Builder", hint: "10 verified students", earned: verified >= 10, progress: Math.min(100, (verified / 10) * 100) },
    { key: "recruiter", label: "Top Recruiter", hint: "25 total referrals", earned: total >= 25, progress: Math.min(100, (total / 25) * 100) },
    { key: "ambassador", label: "School Ambassador", hint: "50 verified + 5 businesses", earned: verified >= 50 && businesses >= 5, progress: Math.min(100, ((verified / 50) * 60) + ((businesses / 5) * 40)) },
    { key: "kingpin", label: "KingPin Recruiter", hint: "100 verified referrals", earned: verified >= 100, progress: Math.min(100, verified) },
    { key: "streak", label: "Momentum Streak", hint: `${streak} in a row`, earned: streak >= 5, progress: Math.min(100, streak * 20) },
  ];
}
