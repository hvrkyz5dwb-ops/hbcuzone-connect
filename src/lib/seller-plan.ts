export type SellerTier = "free" | "pro" | "kingpin";

export type BillingCycle = "monthly" | "semester" | "year";

export type SellerPlan = {
  tier: SellerTier;
  cycle?: BillingCycle;
  since: string;
};

const KEY = "plugu.sellerPlan.v1";

export const SELLER_TIERS: {
  key: SellerTier;
  name: string;
  fee: number; // percent
  price: number; // /mo (base monthly price)
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
    pricing: { monthly: 0 },
    tagline: "Get started. Sell anything on your campus.",
    badge: "Starter",
    accent: "#9aa0a6",
    perks: [
      "5% PlugU transaction fee",
      "Unlimited listings",
      "Basic analytics",
      "Standard search placement",
      "Standard seller badge",
    ],
  },
  {
    key: "pro",
    name: "Verified Pro",
    fee: 2,
    price: 7.99,
    pricing: { monthly: 7.99, semester: 39.99, year: 69.99 },
    tagline: "For hustlers who ship every week.",
    badge: "Verified Pro",
    accent: "#c9c9c9",
    roi: "Sell just 2\u20133 extra items each month and this membership typically pays for itself.",
    perks: [
      "2% transaction fee",
      "Verified Pro badge",
      "Priority search ranking",
      "Better feed placement",
      "Advanced analytics",
      "Priority support",
      "Early access to new features",
    ],
  },
  {
    key: "kingpin",
    name: "KingPin Seller",
    fee: 0,
    price: 14.99,
    pricing: { monthly: 14.99, semester: 79.99, year: 129.99 },
    tagline: "You run the campus. Keep 100%.",
    badge: "KingPin",
    accent: "#f4c96a",
    roi: "One successful week of sales can easily cover this membership. Keep 100% of every sale.",
    perks: [
      "0% PlugU transaction fee",
      "Gold KingPin badge",
      "Highest campus search ranking",
      "Featured seller priority",
      "Premium analytics",
      "Exclusive promotions",
      "Early feature access",
      "Priority support",
    ],
  },
];

export function getSellerPlan(): SellerPlan {
  if (typeof window === "undefined") return { tier: "free", since: new Date().toISOString() };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial: SellerPlan = { tier: "free", since: new Date().toISOString() };
  window.localStorage.setItem(KEY, JSON.stringify(initial));
  return initial;
}

export function setSellerPlan(tier: SellerTier, cycle: BillingCycle = "monthly"): SellerPlan {
  const plan: SellerPlan = { tier, cycle, since: new Date().toISOString() };
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(plan));
  return plan;
}

export function currentFeePercent(): number {
  return SELLER_TIERS.find((t) => t.key === getSellerPlan().tier)?.fee ?? 5;
}

export function currentSellerTierMeta() {
  const plan = getSellerPlan();
  return SELLER_TIERS.find((t) => t.key === plan.tier)!;
}