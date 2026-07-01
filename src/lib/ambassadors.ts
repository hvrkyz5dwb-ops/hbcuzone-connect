export type AmbassadorStatus = "none" | "pending" | "approved";

export type AmbassadorApp = {
  status: AmbassadorStatus;
  name?: string;
  campus?: string;
  why?: string;
  socials?: string;
  appliedAt?: string;
  approvedAt?: string;
};

const KEY = "plugu.ambassador.v1";

export function getAmbassador(): AmbassadorApp {
  if (typeof window === "undefined") return { status: "none" };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { status: "none" };
}

function save(app: AmbassadorApp) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(app));
}

export function applyAmbassador(input: Omit<AmbassadorApp, "status" | "appliedAt">) {
  const app: AmbassadorApp = { ...input, status: "pending", appliedAt: new Date().toISOString() };
  save(app);
  return app;
}

// Demo-approve after 6 seconds so the dashboard becomes explorable.
export function autoApproveIfDue(): AmbassadorApp {
  const app = getAmbassador();
  if (app.status === "pending" && app.appliedAt) {
    const elapsed = Date.now() - new Date(app.appliedAt).getTime();
    if (elapsed > 6000) {
      const next: AmbassadorApp = { ...app, status: "approved", approvedAt: new Date().toISOString() };
      save(next);
      return next;
    }
  }
  return app;
}

export const AMBASSADOR_PERKS = [
  { title: "Ambassador badge", body: "Silver crown on your profile everywhere." },
  { title: "Free premium membership", body: "KingPin tier at no cost while active." },
  { title: "Referral dashboard", body: "Track recruits, campus growth, and national rank." },
  { title: "Early access", body: "New features drop in your hands first." },
  { title: "Exclusive merchandise", body: "PlugU drops built for ambassadors only." },
  { title: "Scholarship pool", body: "Compete for the semester scholarship." },
  { title: "Monthly rewards", body: "Top ambassadors earn cash + swag every month." },
  { title: "Exclusive networking", body: "Private ambassador group + national meetups." },
];

// Playful mocked leaderboards.
export const CAMPUS_LEADERBOARD = [
  { name: "Marcus J.", campus: "Talladega", recruits: 218 },
  { name: "Aaliyah T.", campus: "Spelman", recruits: 197 },
  { name: "Kri$Havn", campus: "Talladega", recruits: 184 },
  { name: "Jordan P.", campus: "Howard", recruits: 176 },
  { name: "Simone R.", campus: "Hampton", recruits: 152 },
];

export const NATIONAL_LEADERBOARD = [
  { name: "Marcus J.", campus: "Talladega", recruits: 218 },
  { name: "Aaliyah T.", campus: "Spelman", recruits: 197 },
  { name: "Ivy K.", campus: "FAMU", recruits: 189 },
  { name: "Kri$Havn", campus: "Talladega", recruits: 184 },
  { name: "Amir L.", campus: "Morehouse", recruits: 172 },
];