// MVP marketplace categories for PlugU (Phase 3).
// Rides is intentionally disabled during closed beta but kept in code
// so designs and copy stay intact for launch.

export type CategoryKey =
  | "hair"
  | "nails"
  | "food"
  | "clothing"
  | "dorm"
  | "photo"
  | "design"
  | "music"
  | "events"
  | "tutoring"
  | "rides";

export type CategoryDef = {
  key: CategoryKey;
  label: string;
  emoji: string;
  kind: "product" | "service" | "either";
  betaDisabled?: boolean;
};

export const MVP_CATEGORIES: CategoryDef[] = [
  { key: "hair", label: "Hair & Barbering", emoji: "💈", kind: "service" },
  { key: "nails", label: "Nails & Lashes", emoji: "💅", kind: "service" },
  { key: "food", label: "Food", emoji: "🍔", kind: "either" },
  { key: "clothing", label: "Clothing", emoji: "👕", kind: "product" },
  { key: "dorm", label: "Dorm Items", emoji: "🛏️", kind: "product" },
  { key: "photo", label: "Photography", emoji: "📸", kind: "service" },
  { key: "design", label: "Graphic Design", emoji: "🖌️", kind: "service" },
  { key: "music", label: "Music & Creative", emoji: "🎙️", kind: "service" },
  { key: "events", label: "Campus Events", emoji: "🎉", kind: "either" },
  { key: "tutoring", label: "Tutoring", emoji: "📚", kind: "service" },
  { key: "rides", label: "Rides", emoji: "🚗", kind: "service", betaDisabled: true },
];

export const AVAILABLE_CATEGORIES = MVP_CATEGORIES.filter((c) => !c.betaDisabled);

export function categoryLabel(key: string): string {
  return MVP_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export type PriceType = "fixed" | "starting_at" | "hourly" | "quote";

export const PRICE_TYPES: { key: PriceType; label: string; hint: string }[] = [
  { key: "fixed", label: "Fixed", hint: "One set price" },
  { key: "starting_at", label: "Starting at", hint: "Base price, can go up" },
  { key: "hourly", label: "Hourly", hint: "Per hour" },
  { key: "quote", label: "Quote", hint: "Contact for pricing" },
];

export function formatPrice(price_cents: number, type: PriceType = "fixed"): string {
  if (type === "quote") return "Quote";
  const dollars = (price_cents / 100).toFixed(price_cents % 100 === 0 ? 0 : 2);
  const prefix = type === "starting_at" ? "From " : "";
  const suffix = type === "hourly" ? "/hr" : "";
  return `${prefix}$${dollars}${suffix}`;
}

export const FULFILLMENT_OPTIONS = [
  { key: "pickup", label: "Pickup" },
  { key: "delivery", label: "Delivery" },
  { key: "appointment", label: "Appointment" },
  { key: "digital", label: "Digital" },
] as const;