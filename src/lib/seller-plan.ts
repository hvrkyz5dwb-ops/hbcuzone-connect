export type SellerTier = "free" | "pro" | "kingpin";

export type SellerPlan = {
  tier: SellerTier;
  since: string;
};

const KEY = "plugu.sellerPlan.v1";

export const SELLER_TIERS: {
  key: SellerTier;
  name: string;
  fee: number; // percent
  price: number; // /mo
  tagline: string;
  perks: string[];
  badge: string;
  accent: string;
}[] = [
  {
    key: "free",
    name: "Free Seller",
    fee: 5,
    price: 0,
    tagline: "Get started. Sell anything on your campus.",
    badge: "Starter",
    accent: "#9aa0a6",
    perks: [
      "Unlimited listings",
      "In-app messaging tied to orders",
      "Protected by PlugU checkout",
      "5% platform fee",
    ],
  },
  {
    key: "pro",
    name: "Pro Seller",
    fee: 2,
    price: 9,
    tagline: "For hustlers who ship every week.",
    badge: "Verified Pro",
    accent: "#c9c9c9",
    perks: [
      "Verified Pro badge",
      "Priority feed + search placement",
      "Advanced seller analytics",
      "Promotional discount tools",
      "Only 2% platform fee",
    ],
  },
  {
    key: "kingpin",
    name: "KingPin Seller",
    fee: 0,
    price: 29,
    tagline: "You run the campus. Keep 100%.",
    badge: "KingPin",
    accent: "#f4c96a",
    perks: [
      "Gold KingPin badge",
      "0% PlugU fee — keep everything",
      "Featured on campus pages",
      "Featured inside PlugU Daily",
      "Exclusive KingPin opportunities",
      "Priority dispute handling",
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

export function setSellerPlan(tier: SellerTier): SellerPlan {
  const plan: SellerPlan = { tier, since: new Date().toISOString() };
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