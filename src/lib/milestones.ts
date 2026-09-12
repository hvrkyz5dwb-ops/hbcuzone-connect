import { getOrders, getReviews } from "./orders-storage";

export type Milestone = {
  key: string;
  label: string;
  hint: string;
  earned: boolean;
  earnedAt?: string;
  accent: string;
};

const KEY = "plugu.milestones.v1";

function readCache(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function writeCache(cache: Record<string, string>) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(cache));
}

export function computeMilestones(): Milestone[] {
  const orders = getOrders();
  const reviews = getReviews();
  const totalSales = orders.length;
  const revenue = orders.reduce((a, o) => a + o.price, 0);
  const topRated = reviews.length >= 5 && reviews.reduce((a, r) => a + r.rating, 0) / reviews.length >= 4.7;

  const defs: Omit<Milestone, "earnedAt">[] = [
    { key: "first_sale", label: "First Sale", hint: "Your first paid order", earned: totalSales >= 1, accent: "#c68a52" },
    { key: "first_100", label: "First $100", hint: "Crossed $100 in sales", earned: revenue >= 100, accent: "#d5d5d5" },
    { key: "first_1k", label: "First $1,000", hint: "Crossed $1,000 in sales", earned: revenue >= 1000, accent: "#f4c96a" },
    { key: "hundred_sales", label: "100 Sales", hint: "One hundred orders delivered", earned: totalSales >= 100, accent: "#f4c96a" },
    { key: "top_rated", label: "Top Rated", hint: "5+ reviews at 4.7★", earned: topRated, accent: "#b9f2ff" },
    { key: "campus_fav", label: "Campus Favorite", hint: "Featured on your campus page", earned: totalSales >= 25, accent: "#f4c96a" },
    { key: "top_plug_status", label: "Top Plug", hint: "Ranked #1 on your campus for a week", earned: false, accent: "#f4c96a" },
    { key: "anniversary", label: "Business Anniversary", hint: "One year of hustling on PlugU", earned: false, accent: "#c9c9c9" },
  ];

  const cache = readCache();
  const now = new Date().toISOString();
  const withDates = defs.map((m) => {
    if (m.earned && !cache[m.key]) cache[m.key] = now;
    return { ...m, earnedAt: cache[m.key] };
  });
  writeCache(cache);
  return withDates;
}

export function newlyEarned(prev: Milestone[], next: Milestone[]): Milestone[] {
  const prevSet = new Set(prev.filter((m) => m.earned).map((m) => m.key));
  return next.filter((m) => m.earned && !prevSet.has(m.key));
}