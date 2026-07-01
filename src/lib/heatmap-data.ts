// Layer definitions for the campus heat map. Purely presentational data —
// coordinates are on a 100×100 normalized grid so any map surface can render them.

export type HeatLayerKey =
  | "businesses"
  | "food"
  | "events"
  | "hotspots"
  | "popups"
  | "pickup"
  | "activity";

export type HeatPoint = { x: number; y: number; weight: number; label?: string };

export type HeatLayer = {
  key: HeatLayerKey;
  label: string;
  color: string;         // css color
  emoji: string;
  description: string;
  privacy: "public" | "aggregated" | "opt-in";
  points: HeatPoint[];
};

export const HEAT_LAYERS: HeatLayer[] = [
  {
    key: "businesses", label: "Popular Businesses", color: "#f4c96a", emoji: "🛍️",
    description: "Verified student businesses ranked by sales.",
    privacy: "public",
    points: [
      { x: 22, y: 34, weight: 0.9, label: "Kri$Havn Cuts" },
      { x: 58, y: 28, weight: 0.7, label: "Braids by Nia" },
      { x: 71, y: 63, weight: 0.8, label: "Plug Print Co." },
      { x: 41, y: 71, weight: 0.6, label: "Sneaker Plug" },
    ],
  },
  {
    key: "food", label: "Food", color: "#f97316", emoji: "🍔",
    description: "Meal plugs, food trucks, and campus favorites.",
    privacy: "public",
    points: [
      { x: 34, y: 52, weight: 1.0, label: "Yard Bowls" },
      { x: 62, y: 42, weight: 0.85, label: "The Punchout" },
      { x: 18, y: 66, weight: 0.7, label: "Wingman Truck" },
      { x: 79, y: 22, weight: 0.6, label: "Late Night Waffles" },
    ],
  },
  {
    key: "events", label: "Campus Events", color: "#a855f7", emoji: "🎉",
    description: "Live events, tabling, and yardfest activity.",
    privacy: "public",
    points: [
      { x: 50, y: 44, weight: 1.0, label: "Yardfest — 4pm" },
      { x: 30, y: 24, weight: 0.65, label: "Divine Nine Stroll" },
      { x: 66, y: 74, weight: 0.7, label: "Alumni Mixer" },
    ],
  },
  {
    key: "hotspots", label: "Hot Spots", color: "#ef4444", emoji: "🔥",
    description: "Where the yard is right now — aggregated only.",
    privacy: "aggregated",
    points: [
      { x: 48, y: 48, weight: 1.0, label: "The Quad" },
      { x: 26, y: 60, weight: 0.75, label: "Student Center" },
      { x: 74, y: 40, weight: 0.65, label: "Gym Plaza" },
    ],
  },
  {
    key: "popups", label: "Pop-Up Shops", color: "#06b6d4", emoji: "🎪",
    description: "Traveling drops, verified sellers only.",
    privacy: "public",
    points: [
      { x: 55, y: 60, weight: 0.9, label: "Homecoming Drop" },
      { x: 82, y: 55, weight: 0.6, label: "Sunday Vintage" },
    ],
  },
  {
    key: "pickup", label: "Pickup Locations", color: "#22c55e", emoji: "📦",
    description: "Suggested meetup points on camera.",
    privacy: "public",
    points: [
      { x: 44, y: 40, weight: 0.9, label: "Library Steps" },
      { x: 62, y: 66, weight: 0.7, label: "Blackburn Lobby" },
      { x: 24, y: 44, weight: 0.65, label: "Bookstore Bench" },
    ],
  },
  {
    key: "activity", label: "Student Activity", color: "#eab308", emoji: "✨",
    description: "Anonymous, aggregated presence — opt in to share.",
    privacy: "opt-in",
    points: [
      { x: 48, y: 48, weight: 0.85 },
      { x: 52, y: 50, weight: 0.7 },
      { x: 46, y: 46, weight: 0.6 },
      { x: 68, y: 60, weight: 0.55 },
      { x: 30, y: 42, weight: 0.5 },
      { x: 70, y: 32, weight: 0.45 },
    ],
  },
];

const PRIVACY_KEY = "plugu.heatmap.privacy.v1";

export type HeatPrivacy = { shareActivity: boolean; showAggregatesOnly: boolean };

export function getPrivacy(): HeatPrivacy {
  if (typeof window === "undefined") return { shareActivity: false, showAggregatesOnly: true };
  try {
    const raw = window.localStorage.getItem(PRIVACY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { shareActivity: false, showAggregatesOnly: true };
}

export function setPrivacy(p: HeatPrivacy) {
  if (typeof window !== "undefined") window.localStorage.setItem(PRIVACY_KEY, JSON.stringify(p));
}