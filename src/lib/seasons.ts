export type SeasonKey =
  | "move-in"
  | "welcome-week"
  | "homecoming"
  | "bhm"
  | "entrepreneurship"
  | "finals"
  | "spring-break"
  | "graduation"
  | "everyday";

export type Season = {
  key: SeasonKey;
  label: string;
  emoji: string;
  tagline: string;
  hero: string;                 // hero body copy
  accent: string;               // hex accent color
  gradient: string;             // css gradient
  promo: { title: string; body: string; discount?: string }[];
  challenge: { title: string; steps: string[]; reward: string };
  badge: { key: string; label: string };
  window: string;               // human-readable window
};

const SEASONS: Record<Exclude<SeasonKey, "everyday">, Season> = {
  "move-in": {
    key: "move-in", label: "Move-In Week", emoji: "🏠",
    tagline: "Everything you need for a smooth landing.",
    hero: "Discounts on dorm essentials, moving help, and campus rides. Your first week, easier.",
    accent: "#f4c96a",
    gradient: "linear-gradient(160deg, rgba(244,201,106,0.35), rgba(28,20,10,0.9))",
    promo: [
      { title: "10% off dorm essentials", body: "Kitted mini fridges, storage cubes, twin-XL bedding.", discount: "MOVEIN10" },
      { title: "Free ride from the airport", body: "First 2 rides free from verified student drivers.", discount: "LANDING" },
      { title: "Move-In Concierge", body: "Book upperclass help to carry, assemble, and set up." },
    ],
    challenge: {
      title: "Land like a Plug",
      steps: ["Verify your .edu", "Add your dorm to the map", "Refer 1 roommate"],
      reward: "Move-In Plug badge",
    },
    badge: { key: "movein_plug", label: "Move-In Plug" },
    window: "Aug 1 – Aug 25",
  },
  "welcome-week": {
    key: "welcome-week", label: "Welcome Week", emoji: "👋",
    tagline: "Meet your yard. Find your people.",
    hero: "Yard tours, free events, mixers, and every plug you'll actually use this semester.",
    accent: "#c68a52",
    gradient: "linear-gradient(160deg, rgba(198,138,82,0.35), rgba(20,14,8,0.9))",
    promo: [
      { title: "$5 off first food order", body: "Every campus vendor. New students only.", discount: "WELCOME5" },
      { title: "Free haircut booking hold", body: "Reserve your barber before syllabus week." },
      { title: "Study crew matcher", body: "Get placed into a real study group in 3 taps." },
    ],
    challenge: {
      title: "Meet 5 new plugs",
      steps: ["Follow your campus feed", "Save 3 vendors", "Message 2 new students"],
      reward: "Welcome Week badge",
    },
    badge: { key: "welcome_week", label: "Welcome Week" },
    window: "Aug 26 – Sep 8",
  },
  homecoming: {
    key: "homecoming", label: "Homecoming Week", emoji: "🏈",
    tagline: "The greatest week in college.",
    hero: "Yardfest, tailgate hookups, alumni mixers, and every vendor going crazy for the culture.",
    accent: "#a855f7",
    gradient: "linear-gradient(160deg, rgba(168,85,247,0.35), rgba(15,10,25,0.9))",
    promo: [
      { title: "Yardfest pre-sale", body: "Verified students unlock $15 early bird tickets." },
      { title: "Homecoming Drop", body: "Custom tees, chains, and beads from campus vendors." },
      { title: "Ride bundles", body: "Group ride packages for the game and afterparties." },
    ],
    challenge: {
      title: "Rep The Yard",
      steps: ["Post to the campus feed", "Buy from a campus vendor", "Refer an alum"],
      reward: "Homecoming Legend badge",
    },
    badge: { key: "homecoming_legend", label: "Homecoming Legend" },
    window: "Oct 1 – Oct 21",
  },
  bhm: {
    key: "bhm", label: "Black History Month", emoji: "✊🏾",
    tagline: "Culture. History. Right now.",
    hero: "Featured Black-owned businesses, alumni stories, and history that shaped every yard.",
    accent: "#d4a017",
    gradient: "linear-gradient(160deg, rgba(212,160,23,0.35), rgba(15,10,5,0.9))",
    promo: [
      { title: "Featured Black-owned brands", body: "Discover a new plug every day this month." },
      { title: "Legacy Alumni stories", body: "Video drops from alumni who changed the game." },
      { title: "History → Now", body: "Daily then-and-now spotlights across every HBCU." },
    ],
    challenge: {
      title: "Support 28",
      steps: ["Buy from 3 Black-owned plugs", "Share 3 alumni stories", "Refer 3 students"],
      reward: "Legacy Plug badge",
    },
    badge: { key: "legacy_plug", label: "Legacy Plug" },
    window: "Feb 1 – Feb 28",
  },
  entrepreneurship: {
    key: "entrepreneurship", label: "Entrepreneurship Month", emoji: "🚀",
    tagline: "Build. Ship. Repeat.",
    hero: "Daily founder tips, pitch nights, free promo tools, and matched mentors.",
    accent: "#f4c96a",
    gradient: "linear-gradient(160deg, rgba(244,201,106,0.4), rgba(20,15,5,0.9))",
    promo: [
      { title: "Founder spotlight", body: "Free feature for new student businesses this month." },
      { title: "Free logo pack", body: "AI-crafted brand kit for every new business." },
      { title: "Pitch night ticket", body: "Reserve a slot at your yard's founder mixer." },
    ],
    challenge: {
      title: "Launch something",
      steps: ["List your first offer", "Get your first sale", "Refer another founder"],
      reward: "Founder Plug badge",
    },
    badge: { key: "founder_plug", label: "Founder Plug" },
    window: "Nov 1 – Nov 30",
  },
  finals: {
    key: "finals", label: "Finals Week", emoji: "📚",
    tagline: "Lock in. We got you.",
    hero: "Study hookups, tutoring plugs, food delivery, and late-night rides.",
    accent: "#c9c9c9",
    gradient: "linear-gradient(160deg, rgba(201,201,201,0.28), rgba(10,10,10,0.9))",
    promo: [
      { title: "Free tutor swap", body: "Trade one hour of tutoring for one hour back." },
      { title: "Late-night rides", body: "Verified drivers on standby until 3am." },
      { title: "$3 coffee credit", body: "Every campus café that's on PlugU." },
    ],
    challenge: {
      title: "Survive with the plug",
      steps: ["Book a tutor", "Order once from a food plug", "Save 3 study spots"],
      reward: "Finals Survivor badge",
    },
    badge: { key: "finals_survivor", label: "Finals Survivor" },
    window: "Dec 6 – Dec 18",
  },
  "spring-break": {
    key: "spring-break", label: "Spring Break", emoji: "🌴",
    tagline: "Vibes only.",
    hero: "Travel plugs, group rides, kits, and campus-to-city bundles.",
    accent: "#22d3ee",
    gradient: "linear-gradient(160deg, rgba(34,211,238,0.28), rgba(5,15,20,0.9))",
    promo: [
      { title: "Group flight finder", body: "See which campus is going where — and split it." },
      { title: "Break kit drop", body: "Sunscreen, chargers, disposable cams, all in one." },
      { title: "House splits", body: "Verified group rentals with roommate escrow." },
    ],
    challenge: {
      title: "Enjoy responsibly",
      steps: ["Book with a group", "Share your itinerary", "Check in daily"],
      reward: "Break Plug badge",
    },
    badge: { key: "break_plug", label: "Break Plug" },
    window: "Mar 6 – Mar 20",
  },
  graduation: {
    key: "graduation", label: "Graduation", emoji: "🎓",
    tagline: "You did it. Now what?",
    hero: "Regalia, photos, dinners, moving-out plugs, and alumni network onboarding.",
    accent: "#f4c96a",
    gradient: "linear-gradient(160deg, rgba(244,201,106,0.4), rgba(15,10,5,0.9))",
    promo: [
      { title: "Cap & gown reserve", body: "Book yours before campus runs out." },
      { title: "Grad photo plugs", body: "Verified student photographers, all yards." },
      { title: "Move-out helpers", body: "Book help to pack, ship, and store." },
    ],
    challenge: {
      title: "Cross the stage",
      steps: ["Update your profile with your degree", "Join the alumni network", "Refer a rising senior"],
      reward: "Alumni Plug badge",
    },
    badge: { key: "alumni_plug", label: "Alumni Plug" },
    window: "May 1 – May 25",
  },
};

export const ALL_SEASONS: Season[] = Object.values(SEASONS);

export function currentSeason(now: Date = new Date()): Season | null {
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const inRange = (m1: number, d1: number, m2: number, d2: number) => {
    const a = m * 100 + d;
    return a >= m1 * 100 + d1 && a <= m2 * 100 + d2;
  };
  if (inRange(8, 1, 8, 25)) return SEASONS["move-in"];
  if (inRange(8, 26, 9, 8)) return SEASONS["welcome-week"];
  if (inRange(10, 1, 10, 21)) return SEASONS["homecoming"];
  if (inRange(11, 1, 11, 30)) return SEASONS["entrepreneurship"];
  if (inRange(12, 6, 12, 18)) return SEASONS["finals"];
  if (inRange(2, 1, 2, 28)) return SEASONS["bhm"];
  if (inRange(3, 6, 3, 20)) return SEASONS["spring-break"];
  if (inRange(5, 1, 5, 25)) return SEASONS["graduation"];
  return null;
}

export function seasonBySlug(slug: string): Season | null {
  return ALL_SEASONS.find((s) => s.key === slug) ?? null;
}