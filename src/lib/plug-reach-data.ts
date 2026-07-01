export type ReachDuration = {
  label: string;
  original?: number;
  price: number;
  bestValue?: boolean;
};

export type ReachPackage = {
  key: "campus" | "local" | "statewide" | "ultimate";
  name: string;
  tagline: string;
  description: string;
  badge?: string; // Launch Pricing / Limited Time
  tier: "bronze" | "silver" | "gold" | "diamond";
  durations: ReachDuration[];
};

export const reachPackages: ReachPackage[] = [
  {
    key: "campus",
    name: "Campus",
    tagline: "Your School Only",
    description: "Reach students at your school.",
    tier: "bronze",
    durations: [
      { label: "3 Days", price: 2.99 },
      { label: "7 Days", price: 5.99 },
      { label: "Semester", price: 39.99, bestValue: true },
      { label: "Full Year", price: 79.99, bestValue: true },
    ],
  },
  {
    key: "local",
    name: "Local",
    tagline: "Nearby Colleges",
    description: "Reach nearby colleges.",
    badge: "Launch Pricing",
    tier: "silver",
    durations: [
      { label: "3 Days", original: 8.99, price: 5.99 },
      { label: "7 Days", original: 16.99, price: 11.99 },
      { label: "Semester", original: 99.99, price: 69.99, bestValue: true },
      { label: "Full Year", original: 199.99, price: 139.99, bestValue: true },
    ],
  },
  {
    key: "statewide",
    name: "Statewide",
    tagline: "Every PlugU User in Your State",
    description: "Reach every PlugU user in your state.",
    badge: "Limited Time",
    tier: "gold",
    durations: [
      { label: "3 Days", original: 9.99, price: 7.99 },
      { label: "7 Days", original: 17.99, price: 13.99 },
      { label: "Semester", original: 99.99, price: 79.99, bestValue: true },
      { label: "Full Year", original: 179.99, price: 149.99, bestValue: true },
    ],
  },
  {
    key: "ultimate",
    name: "Ultimate",
    tagline: "Every PlugU User Nationwide",
    description: "Reach the entire PlugU network nationwide.",
    badge: "Launch Pricing",
    tier: "diamond",
    durations: [
      { label: "3 Days", original: 19.99, price: 14.99 },
      { label: "7 Days", original: 34.99, price: 24.99 },
      { label: "Semester", original: 199.99, price: 149.99, bestValue: true },
      { label: "Full Year", original: 349.99, price: 249.99, bestValue: true },
    ],
  },
];

export function savePct(original: number, price: number): number {
  return Math.round((1 - price / original) * 100);
}