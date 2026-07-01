import { schoolProfiles, schoolSlug } from "./hbcus-data";
import { getOrders } from "./orders-storage";
import { getReferralState } from "./referrals";
import { getStreak } from "./daily-feed";
import { getStudent } from "./auth";

export type MetricKey =
  | "students"
  | "businesses"
  | "sales"
  | "activity"
  | "reviews"
  | "referrals"
  | "engagement";

export type CampusScore = {
  slug: string;
  campus: string;
  score: number;
  metrics: Record<MetricKey, number>;
  weekly: number; // change vs. last week
};

function seedFor(name: string): number {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

// Deterministic mock — refreshes daily as the day-key seeds shift the +/-.
function mockMetrics(name: string): Record<MetricKey, number> {
  const base = seedFor(name);
  const rand = (offset: number, ceiling: number) => ((base + offset) % ceiling);
  return {
    students: 500 + rand(1, 2400),
    businesses: 20 + rand(7, 260),
    sales: 220 + rand(13, 4200),
    activity: 400 + rand(19, 6400),
    reviews: 80 + rand(23, 900),
    referrals: 120 + rand(29, 1600),
    engagement: 30 + rand(31, 70),
  };
}

function score(m: Record<MetricKey, number>): number {
  // Weighted composite; caps roughly at 1000.
  return Math.round(
    m.students * 0.15 +
    m.businesses * 0.9 +
    m.sales * 0.12 +
    m.activity * 0.06 +
    m.reviews * 0.3 +
    m.referrals * 0.25 +
    m.engagement * 3.0
  );
}

export function nationalBoard(): CampusScore[] {
  const student = typeof window !== "undefined" ? getStudent() : null;
  const yourCampus = student?.school ?? null;

  const orders = getOrders();
  const referrals = getReferralState();
  const streak = getStreak();
  const yourContribution: Partial<Record<MetricKey, number>> = {
    sales: orders.length,
    referrals: referrals.referrals.length,
    engagement: Math.min(70, streak.count * 5),
    reviews: orders.filter((o) => o.reviewed).length,
  };

  return schoolProfiles.map((s) => {
    const m = mockMetrics(s.name);
    if (yourCampus && s.name.toLowerCase().includes(yourCampus.toLowerCase().split(" ")[0])) {
      m.sales += yourContribution.sales ?? 0;
      m.referrals += yourContribution.referrals ?? 0;
      m.engagement = Math.min(100, m.engagement + (yourContribution.engagement ?? 0));
      m.reviews += yourContribution.reviews ?? 0;
    }
    return {
      slug: schoolSlug(s.name),
      campus: s.name,
      score: score(m),
      metrics: m,
      weekly: (seedFor(s.name) % 41) - 12,
    };
  }).sort((a, b) => b.score - a.score);
}

export function metricLabel(k: MetricKey): string {
  return ({
    students: "Verified Students",
    businesses: "Businesses Launched",
    sales: "Marketplace Sales",
    activity: "Community Activity",
    reviews: "Verified Reviews",
    referrals: "Referrals",
    engagement: "Daily Engagement",
  } as Record<MetricKey, string>)[k];
}

export function yourRank(): { rank: number; score: number; campus: string } | null {
  const board = nationalBoard();
  const student = typeof window !== "undefined" ? getStudent() : null;
  if (!student?.school) return null;
  const idx = board.findIndex((b) => b.campus.toLowerCase().includes(student.school.toLowerCase().split(" ")[0]));
  if (idx === -1) return null;
  return { rank: idx + 1, score: board[idx].score, campus: board[idx].campus };
}