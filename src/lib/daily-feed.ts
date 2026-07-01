// Deterministic daily feed. Seeds by yyyy-mm-dd so content rotates each day.

export type DailyItem = {
  id: string;
  section: DailySectionKey;
  headline: string;
  body: string;
  tag?: string;
  meta?: string;
};

export type DailySectionKey =
  | "trending"
  | "success"
  | "events"
  | "scholarships"
  | "internships"
  | "entrepreneurship"
  | "tips"
  | "money"
  | "hbcu"
  | "live";

export const DAILY_SECTIONS: { key: DailySectionKey; label: string; hint: string }[] = [
  { key: "trending", label: "Trending Businesses", hint: "Rising plugs on your yard" },
  { key: "success", label: "Student Success Stories", hint: "Wins from across the network" },
  { key: "events", label: "Campus Events", hint: "This week on your yard" },
  { key: "scholarships", label: "Scholarships", hint: "Money for school — closing soon" },
  { key: "internships", label: "Internships", hint: "Freshly dropped openings" },
  { key: "entrepreneurship", label: "Entrepreneurship News", hint: "How students are building" },
  { key: "tips", label: "Business Tips", hint: "Play smart. Ship faster." },
  { key: "money", label: "Financial Literacy", hint: "Grown-up money moves" },
  { key: "hbcu", label: "HBCU News", hint: "News from The Yard" },
  { key: "live", label: "Live College News", hint: "Refreshed today" },
];

const POOLS: Record<DailySectionKey, { headline: string; body: string; tag?: string }[]> = {
  trending: [
    { headline: "Kri$Havn Cuts drops flash Homecoming booking window", body: "Nine chairs, one afternoon — every slot filled in 12 minutes.", tag: "Barber" },
    { headline: "Yard Bowls hits 500 orders in a weekend", body: "Vegan bowl plug added a Sunday shift after Instagram went off.", tag: "Food" },
    { headline: "Braids by Nia goes fully booked for the month", body: "Now offering a $10 referral credit for every new client.", tag: "Hair" },
    { headline: "The Plug Print Co. runs Homecoming tee drop", body: "Custom tees delivered same-day to your dorm.", tag: "Apparel" },
  ],
  success: [
    { headline: "Junior from FAMU flips $200 into $12K side business", body: "Started with 3D-printed keychains, now stocking two campus shops.", tag: "Founder" },
    { headline: "Spelman senior signs offer at Blackstone", body: "Credits PlugU mentors + networking channel for the intro.", tag: "Career" },
    { headline: "Morehouse coder ships a study-group app used by 1,200", body: "Bootstrapped over a semester, no funding, no cap.", tag: "Builder" },
    { headline: "Talladega freshman wins pitch competition", body: "Community laundry pickup — took home $5,000 in seed money.", tag: "Pitch" },
  ],
  events: [
    { headline: "Homecoming Yardfest — Friday, 4pm", body: "Marching band, food trucks, KingPin lounge on the quad.", tag: "Yardfest" },
    { headline: "Kickback @ The Punchout — Sat 9pm", body: "PlugU verified vendors + free entry with your .edu.", tag: "Nightlife" },
    { headline: "Alumni x Student Mixer — Sunday brunch", body: "Bring one question you actually want answered.", tag: "Networking" },
    { headline: "Study Marathon — finals countdown", body: "24-hour library takeover with food, coffee, and free tutoring.", tag: "Finals" },
  ],
  scholarships: [
    { headline: "Coca-Cola First Gen Scholars — $20K", body: "Rolling review. Priority deadline in 9 days.", tag: "First-Gen" },
    { headline: "UNCF STEM Scholars — up to $12K", body: "Open to STEM sophomores and juniors.", tag: "STEM" },
    { headline: "Thurgood Marshall Grad Bridge — $5K", body: "For seniors headed to graduate school in the fall.", tag: "Grad" },
    { headline: "Google Generation Scholarship — $10K", body: "Now including a summer internship interview slot.", tag: "Tech" },
  ],
  internships: [
    { headline: "Google Summer SWE — priority round open", body: "HBCU pipeline recruiters review first. Apply this week.", tag: "Tech" },
    { headline: "Goldman Sachs IB Analyst — early apps", body: "Junior + senior track. Networking session on Thursday.", tag: "Finance" },
    { headline: "White House Fellows — internship pipeline", body: "For rising seniors in policy, comms, or law.", tag: "Gov" },
    { headline: "Netflix Content Strategy Intern", body: "LA + NYC. HBCU shortlist reviewed weekly.", tag: "Media" },
  ],
  entrepreneurship: [
    { headline: "Student-founded brands raised $4.2M last quarter", body: "PlugU sellers accounted for one in five HBCU-run rounds.", tag: "Funding" },
    { headline: "The new playbook: pop-up shops beat storefronts", body: "Why campus founders are going nomadic in Q3.", tag: "Playbook" },
    { headline: "How a Hampton junior sold out 3 drops in a row", body: "Waitlist, scarcity, one clean landing page — repeat.", tag: "Drops" },
    { headline: "Group buying is quietly the biggest campus trend", body: "Cheaper, safer, and it doubles your reach overnight.", tag: "Trend" },
  ],
  tips: [
    { headline: "Price for value, not for time", body: "Charge what the outcome is worth, not the hour it takes.", tag: "Pricing" },
    { headline: "Your response time is your marketing", body: "Answer in under 5 minutes and you'll close 3x more.", tag: "Ops" },
    { headline: "Ship the ugly version this week", body: "Real feedback beats a perfect launch you never do.", tag: "Ship" },
    { headline: "Build a waitlist before you build the product", body: "If nobody signs up, save yourself the effort.", tag: "Validate" },
  ],
  money: [
    { headline: "The high-yield savings play for students", body: "5% APY, no minimums, and it takes 6 minutes to open.", tag: "Savings" },
    { headline: "Understand your 1099 before the year ends", body: "If you sold $600+, the IRS is watching. Here's the fix.", tag: "Taxes" },
    { headline: "Credit at 19 vs. credit at 25", body: "Building 6 years of history is the cheat code most miss.", tag: "Credit" },
    { headline: "The 50/20/30 rule for hustlers", body: "Rework the classic budget when your income is uneven.", tag: "Budget" },
  ],
  hbcu: [
    { headline: "Homecoming week ratings hit all-time high", body: "The Yard trended #1 across social for three days straight.", tag: "Culture" },
    { headline: "New HBCU medical school approved", body: "First class enrolls fall 2027; scholarships already opening.", tag: "Academics" },
    { headline: "Divine Nine chapters cross a record 4,200 lines", body: "Numbers up 18% year over year across the SWAC + MEAC.", tag: "Greek" },
    { headline: "HBCU endowments cross $6B combined", body: "Fastest single-year growth in the last three decades.", tag: "Endowments" },
  ],
  live: [
    { headline: "AI refresh available — tap to update", body: "Live headlines from Gemini + AP wires.", tag: "Live" },
  ],
};

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function pickN<T>(items: T[], n: number, seed: number): T[] {
  const out: T[] = [];
  const used = new Set<number>();
  let s = seed;
  for (let i = 0; i < n && used.size < items.length; i++) {
    do {
      s = (s * 1664525 + 1013904223) >>> 0;
    } while (used.has(s % items.length));
    const idx = s % items.length;
    used.add(idx);
    out.push(items[idx]);
  }
  return out;
}

export function dailyItems(section: DailySectionKey, count = 3): DailyItem[] {
  const seed = hashSeed(`${todayKey()}:${section}`);
  const picks = pickN(POOLS[section], count, seed);
  return picks.map((p, i) => ({
    id: `${section}-${todayKey()}-${i}`,
    section,
    headline: p.headline,
    body: p.body,
    tag: p.tag,
  }));
}

// Streak tracking — a badge for opening PlugU every day.
const STREAK_KEY = "plugu.daily.streak.v1";
type Streak = { last: string; count: number; longest: number };

function loadStreak(): Streak {
  if (typeof window === "undefined") return { last: "", count: 0, longest: 0 };
  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { last: "", count: 0, longest: 0 };
}

function saveStreak(s: Streak) {
  if (typeof window !== "undefined") window.localStorage.setItem(STREAK_KEY, JSON.stringify(s));
}

export function recordDailyOpen(): Streak {
  const s = loadStreak();
  const today = todayKey();
  if (s.last === today) return s;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
  const next: Streak = {
    last: today,
    count: s.last === yesterday ? s.count + 1 : 1,
    longest: 0,
  };
  next.longest = Math.max(next.count, s.longest);
  saveStreak(next);
  return next;
}

export function getStreak(): Streak {
  return loadStreak();
}

export function streakLabel(count: number): string {
  if (count >= 30) return "Legend Streak";
  if (count >= 14) return "On Fire";
  if (count >= 7) return "Weekly Plug";
  if (count >= 3) return "Warming Up";
  return "Day 1";
}