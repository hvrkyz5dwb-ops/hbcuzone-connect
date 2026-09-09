// Phase 2 — Campus Economy mock model.
// All values are deterministic mocks for demo. No backend yet.

export type EconomyStats = {
  totalRevenue: number;
  today: number;
  week: number;
  month: number;
  transactions: number;
  marketSales: number;
  servicesBooked: number;
  businesses: number;
  activeBusinesses: number;
  activeUsers: number;
  productsSold: number;
  ordersCompleted: number;
  avgRating: number;
  growthPct: number;
};

export type CampusEconomy = {
  id: string;
  campus: string;
  short: string;
  conference: string;
  state: string;
  type: "HBCU" | "Public" | "Private";
  stats: EconomyStats;
  fastestGrowing: string;
  topEntrepreneur: string;
};

export const campusEconomies: CampusEconomy[] = [
  {
    id: "tc", campus: "Talladega College", short: "TC", conference: "SIAC", state: "AL", type: "HBCU",
    stats: { totalRevenue: 482_300, today: 4_120, week: 28_400, month: 102_500, transactions: 9_842,
      marketSales: 5_210, servicesBooked: 4_632, businesses: 184, activeBusinesses: 121, activeUsers: 1_842,
      productsSold: 6_204, ordersCompleted: 5_988, avgRating: 4.82, growthPct: 38 },
    fastestGrowing: "Crown Roots Hair Co.", topEntrepreneur: "Jordan M.",
  },
  {
    id: "spelman", campus: "Spelman College", short: "SPL", conference: "SIAC", state: "GA", type: "HBCU",
    stats: { totalRevenue: 612_900, today: 5_780, week: 41_200, month: 148_700, transactions: 12_004,
      marketSales: 7_310, servicesBooked: 5_120, businesses: 232, activeBusinesses: 167, activeUsers: 2_415,
      productsSold: 8_021, ordersCompleted: 7_840, avgRating: 4.87, growthPct: 44 },
    fastestGrowing: "Lux Lash Studio", topEntrepreneur: "Kennedy J.",
  },
  {
    id: "howard", campus: "Howard University", short: "HU", conference: "MEAC", state: "DC", type: "HBCU",
    stats: { totalRevenue: 781_400, today: 6_980, week: 52_300, month: 184_200, transactions: 15_220,
      marketSales: 9_010, servicesBooked: 6_512, businesses: 312, activeBusinesses: 224, activeUsers: 3_180,
      productsSold: 10_204, ordersCompleted: 9_812, avgRating: 4.79, growthPct: 41 },
    fastestGrowing: "Bison Bites", topEntrepreneur: "Marcus L.",
  },
  {
    id: "famu", campus: "Florida A&M", short: "FAMU", conference: "SWAC", state: "FL", type: "HBCU",
    stats: { totalRevenue: 564_120, today: 5_010, week: 36_800, month: 130_400, transactions: 11_120,
      marketSales: 6_400, servicesBooked: 4_990, businesses: 208, activeBusinesses: 152, activeUsers: 2_240,
      productsSold: 7_512, ordersCompleted: 7_204, avgRating: 4.84, growthPct: 36 },
    fastestGrowing: "Rattler Threads", topEntrepreneur: "Imani P.",
  },
  {
    id: "morehouse", campus: "Morehouse College", short: "MH", conference: "SIAC", state: "GA", type: "HBCU",
    stats: { totalRevenue: 498_700, today: 4_320, week: 31_900, month: 115_300, transactions: 9_980,
      marketSales: 5_600, servicesBooked: 4_410, businesses: 196, activeBusinesses: 134, activeUsers: 2_010,
      productsSold: 6_710, ordersCompleted: 6_504, avgRating: 4.81, growthPct: 33 },
    fastestGrowing: "House Cuts", topEntrepreneur: "Trey W.",
  },
  {
    id: "uga", campus: "University of Georgia", short: "UGA", conference: "SEC", state: "GA", type: "Public",
    stats: { totalRevenue: 421_300, today: 3_700, week: 25_900, month: 91_500, transactions: 8_412,
      marketSales: 4_980, servicesBooked: 3_620, businesses: 168, activeBusinesses: 108, activeUsers: 1_690,
      productsSold: 5_810, ordersCompleted: 5_604, avgRating: 4.71, growthPct: 22 },
    fastestGrowing: "Dawg Eats", topEntrepreneur: "Riley T.",
  },
  {
    id: "duke", campus: "Duke University", short: "DUKE", conference: "ACC", state: "NC", type: "Private",
    stats: { totalRevenue: 389_400, today: 3_410, week: 23_120, month: 84_200, transactions: 7_604,
      marketSales: 4_320, servicesBooked: 3_180, businesses: 152, activeBusinesses: 96, activeUsers: 1_510,
      productsSold: 5_240, ordersCompleted: 5_010, avgRating: 4.74, growthPct: 19 },
    fastestGrowing: "Blue Devil Prints", topEntrepreneur: "Avery S.",
  },
];

export type RankingFilter = "National" | "State" | "Conference" | "HBCUs" | "Public" | "Private";
export const rankingFilters: RankingFilter[] = ["National", "State", "Conference", "HBCUs", "Public", "Private"];

export type RankingCategory =
  | "Highest Revenue" | "Most Active Marketplace" | "Most Student Businesses"
  | "Most Transactions" | "Fastest Growing Campus" | "Highest User Activity"
  | "Best Rated Businesses" | "Most Services Completed" | "Most Verified Businesses"
  | "Top Selling School" | "Most Active School" | "Most Businesses"
  | "Most Student Creators" | "Most Marketplace Sales" | "Top Ambassador School";

export const rankingCategories: RankingCategory[] = [
  "Top Selling School", "Most Active School", "Most Businesses",
  "Most Student Creators", "Most Marketplace Sales", "Most Verified Businesses",
  "Top Ambassador School",
  "Highest Revenue", "Most Active Marketplace", "Most Student Businesses",
  "Most Transactions", "Fastest Growing Campus", "Highest User Activity",
  "Best Rated Businesses", "Most Services Completed",
];

export function rankBy(cat: RankingCategory, list: CampusEconomy[]): CampusEconomy[] {
  const get = (c: CampusEconomy) => {
    switch (cat) {
      case "Highest Revenue": return c.stats.totalRevenue;
      case "Top Selling School": return c.stats.totalRevenue;
      case "Most Active Marketplace": return c.stats.marketSales;
      case "Most Marketplace Sales": return c.stats.marketSales;
      case "Most Student Businesses": return c.stats.businesses;
      case "Most Businesses": return c.stats.businesses;
      case "Most Transactions": return c.stats.transactions;
      case "Fastest Growing Campus": return c.stats.growthPct;
      case "Highest User Activity": return c.stats.activeUsers;
      case "Most Active School": return c.stats.activeUsers + c.stats.transactions;
      case "Best Rated Businesses": return c.stats.avgRating;
      case "Most Services Completed": return c.stats.servicesBooked;
      case "Most Verified Businesses": return c.stats.activeBusinesses;
      case "Most Student Creators": return Math.round(c.stats.activeUsers * 0.18);
      case "Top Ambassador School": return Math.round(c.stats.activeBusinesses * 0.22 + c.stats.growthPct);
    }
  };
  return [...list].sort((a, b) => get(b) - get(a));
}

export type AwardCategory = {
  name: string;
  blurb: string;
  emoji: string;
};

export const awardCategories: AwardCategory[] = [
  { name: "Plug of the Year",       blurb: "The #1 student hustler on PlugU.",         emoji: "👑" },
  { name: "Student Entrepreneur",   blurb: "Founder building real revenue.",           emoji: "🚀" },
  { name: "Best Creator",           blurb: "Top content creator on campus.",           emoji: "🎬" },
  { name: "Top Business",           blurb: "Highest-performing student business.",     emoji: "🏆" },
  { name: "Best Photographer",      blurb: "Premier campus lens.",                     emoji: "📸" },
  { name: "Best Barber",            blurb: "Sharpest cuts on the yard.",               emoji: "💈" },
  { name: "Best Beauty Business",   blurb: "Hair, lashes, nails, brows — top tier.",   emoji: "💅" },
  { name: "Most Helpful Student",   blurb: "Always plugs the community in.",           emoji: "🤝" },
  { name: "Top Organization",       blurb: "Student org with the biggest impact.",     emoji: "🎓" },
];

export const scholarshipCategories = [
  { name: "Plug of the Year Scholarship", amount: "$5,000", focus: "Top student entrepreneur on PlugU" },
  { name: "Entrepreneurship Scholarship", amount: "$3,000", focus: "Student-run business with traction" },
  { name: "Community Leadership Scholarship", amount: "$2,500", focus: "Service & campus leadership" },
  { name: "Innovation Scholarship", amount: "$2,500", focus: "Tech, product or social innovation" },
  { name: "HBCU Excellence Scholarship", amount: "$3,500", focus: "HBCU student of the year" },
  { name: "Creative Arts Scholarship", amount: "$2,000", focus: "Visual, music, or design" },
  { name: "Future Founder Scholarship", amount: "$1,500", focus: "Freshmen & sophomore builders" },
];

export const monthlyChallenges = [
  { name: "Highest Revenue Campus", reward: "PlugU Trophy + Feature", ends: "Apr 30" },
  { name: "Best Small Business", reward: "$500 boost credit", ends: "Apr 30" },
  { name: "Most Community Service", reward: "Trophy + spotlight", ends: "Apr 30" },
  { name: "Best New Business", reward: "Featured for 90 days", ends: "Apr 30" },
  { name: "Most Orders Completed", reward: "Verified Gold badge", ends: "Apr 30" },
  { name: "Marketplace Challenge", reward: "Homepage feature", ends: "Apr 30" },
];

export const trendingBoards = {
  // Top seller identity is intentionally hidden. #1 is auto-promoted to KingPin
  // (with payout) regardless of paid membership tier.
  topEarners:   [
    { n: "Anonymous Plug", v: "👑 KingPin" },
    { n: "Anonymous Plug", v: "👑 KingPin" },
    { n: "Anonymous Plug", v: "👑 KingPin" },
  ],
  mostBooked:   [{ n: "Fade God", v: "48 bookings" }, { n: "Lux Lash", v: "39 bookings" }, { n: "Bison Bites", v: "31 bookings" }],
  mostViewed:   [{ n: "Rattler Threads", v: "4.2K views" }, { n: "Crown Roots", v: "3.8K views" }, { n: "House Cuts", v: "3.1K views" }],
  fastestGrow:  [{ n: "Crown Roots", v: "+312% MoM" }, { n: "Lux Lash", v: "+248% MoM" }, { n: "Bison Bites", v: "+201% MoM" }],
  highestRated: [{ n: "House Cuts", v: "4.98 ★" }, { n: "Lux Lash", v: "4.96 ★" }, { n: "Crown Roots", v: "4.95 ★" }],
  newTrending:  [{ n: "Studio 1867", v: "Joined 5d ago" }, { n: "Hilltop Eats", v: "Joined 8d ago" }, { n: "AUC Threads", v: "Joined 11d ago" }],
  rising:       [{ n: "Bison Bites", v: "Rank +14" }, { n: "Rattler Threads", v: "Rank +9" }, { n: "Dawg Eats", v: "Rank +7" }],
};

export const verificationLevels = [
  { name: "Verified Business",  blurb: "ID + ownership confirmed", tone: "gold" as const },
  { name: "Campus Favorite",    blurb: "Loved by your campus",     tone: "purple" as const },
  { name: "Top Rated",          blurb: "4.8+ stars · 50+ reviews", tone: "gold" as const },
  { name: "Fastest Growing",    blurb: "Top growth this month",    tone: "purple" as const },
  { name: "Ultimate Plug",      blurb: "Elite tier · invite only", tone: "gold" as const },
];

// PlugU-wide live counters
export function platformInsights() {
  const total = campusEconomies.reduce(
    (acc, c) => ({
      money: acc.money + c.stats.today,
      orders: acc.orders + Math.round(c.stats.ordersCompleted / 30),
      open: acc.open + c.stats.activeBusinesses,
      hired: acc.hired + Math.round(c.stats.activeUsers / 40),
      scholarships: acc.scholarships + 12,
      internships: acc.internships + 28,
      revenue: acc.revenue + c.stats.totalRevenue,
      growth: acc.growth + c.stats.growthPct,
    }),
    { money: 0, orders: 0, open: 0, hired: 0, scholarships: 0, internships: 0, revenue: 0, growth: 0 },
  );
  return {
    moneyToday: total.money,
    ordersToday: total.orders,
    businessesOpen: total.open,
    studentsHired: total.hired,
    scholarshipsPosted: total.scholarships,
    internshipsAvailable: total.internships,
    marketplaceGrowthPct: Math.round(total.growth / campusEconomies.length),
    totalRevenue: total.revenue,
  };
}

// Countdown to end of academic year for the PlugU Campus Grant.
export function grantCountdown(now = new Date()) {
  const year = now.getMonth() >= 4 ? now.getFullYear() + 1 : now.getFullYear();
  const end = new Date(year, 4, 15); // May 15
  const diff = Math.max(0, end.getTime() - now.getTime());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return { days, hours, minutes, target: end };
}

export function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}