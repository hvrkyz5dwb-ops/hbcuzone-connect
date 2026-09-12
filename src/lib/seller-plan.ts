export type SellerTier = "free" | "pro" | "kingpin";

export type BillingCycle = "monthly" | "semester" | "year";

export type SellerPlan = {
  tier: SellerTier;
  cycle?: BillingCycle;
  since: string;
  validUntil?: string;
};

const KEY = "plugu.sellerPlan.v1";

export const SELLER_TIERS: {
  key: SellerTier;
  name: string;
  fee: number; // percent
  price: number; // price for the tier's fixed billing cycle
  cycle: BillingCycle; // each tier has one fixed billing cycle
  monthlyEquiv: number; // "about $X/month"
  pricing: { monthly: number; semester?: number; year?: number };
  tagline: string;
  perks: string[];
  badge: string;
  accent: string;
  roi?: string;
}[] = [
  {
    key: "free",
    name: "Free Seller",
    fee: 5,
    price: 0,
    cycle: "monthly",
    monthlyEquiv: 0,
    pricing: { monthly: 0 },
    tagline: "Start Selling",
    badge: "Starter",
    accent: "#9aa0a6",
    perks: [
      "Create listings",
      "Sell products and services",
      "Standard search ranking",
      "Standard category placement",
      "Standard analytics",
    ],
  },
  {
    key: "pro",
    name: "Verified Seller",
    fee: 2,
    price: 0,
    cycle: "semester",
    monthlyEquiv: 0,
    pricing: { monthly: 0, semester: 0 },
    tagline: "Earned by verified students",
    badge: "Verified Seller",
    accent: "#c9c9c9",
    perks: [
      "Verified seller badge",
      "Pinned near the top of category pages",
      "Featured on the “Businesses & Events You Should Know” slide",
      "Shown to students on your campus",
      "Detailed seller analytics",
    ],
  },
  {
    key: "kingpin",
    name: "Top Plug",
    fee: 0,
    price: 0,
    cycle: "year",
    monthlyEquiv: 0,
    pricing: { monthly: 0, year: 0 },
    tagline: "Earned through reviews and completed sales",
    badge: "Top Plug",
    accent: "#f4c96a",
    perks: [
      "Gold Top Plug badge",
      "Highest placement within categories",
      "Featured on the “Businesses & Events You Should Know” slide",
      "Expanded visibility: nearby campuses, statewide, regional, national",
      "Full seller analytics",
      "Priority support",
    ],
  },
];

export function getSellerPlan(): SellerPlan {
  return getSellerPlanState().plan;
}

/** How long each billing cycle keeps a paid membership active. */
export const CYCLE_VALIDITY: Record<BillingCycle, { days: number; label: string; short: string }> = {
  monthly: { days: 30, label: "30 days", short: "30 days" },
  semester: { days: 150, label: "a full semester (150 days)", short: "full semester" },
  year: { days: 365, label: "a full year (365 days)", short: "full year" },
};

function readPlan(): SellerPlan {
  if (typeof window === "undefined") return { tier: "free", since: new Date().toISOString() };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial: SellerPlan = { tier: "free", since: new Date().toISOString() };
  window.localStorage.setItem(KEY, JSON.stringify(initial));
  return initial;
}

/**
 * Reads the plan and auto-downgrades to Free when a paid membership
 * has passed its validity window. `expired` is true when a downgrade happened.
 */
export function getSellerPlanState(): { plan: SellerPlan; expired: boolean } {
  const plan = readPlan();
  if (
    plan.tier !== "free" &&
    plan.validUntil &&
    new Date(plan.validUntil).getTime() < Date.now()
  ) {
    const reset: SellerPlan = { tier: "free", since: new Date().toISOString() };
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(reset));
    return { plan: reset, expired: true };
  }
  return { plan, expired: false };
}

export function setSellerPlan(tier: SellerTier, cycle?: BillingCycle): SellerPlan {
  const meta = SELLER_TIERS.find((t) => t.key === tier);
  const resolvedCycle = cycle ?? meta?.cycle ?? "monthly";
  const now = Date.now();
  const { days } = CYCLE_VALIDITY[resolvedCycle];
  const plan: SellerPlan = {
    tier,
    cycle: resolvedCycle,
    since: new Date(now).toISOString(),
    ...(tier === "free" ? {} : { validUntil: new Date(now + days * 86_400_000).toISOString() }),
  };
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(plan));
  return plan;
}

/** Days left on a paid membership, or null for Free / legacy plans without an expiry. */
export function planDaysRemaining(plan: SellerPlan): number | null {
  if (plan.tier === "free" || !plan.validUntil) return null;
  return Math.max(0, Math.ceil((new Date(plan.validUntil).getTime() - Date.now()) / 86_400_000));
}

export function currentFeePercent(): number {
  return SELLER_TIERS.find((t) => t.key === getSellerPlan().tier)?.fee ?? 5;
}

export function currentSellerTierMeta() {
  const plan = getSellerPlan();
  return SELLER_TIERS.find((t) => t.key === plan.tier)!;
}