export type PlugUHit = {
  kind: "listing" | "available" | "drop";
  id: string;
  listingId: string | null;
  title: string;
  subtitle: string;
  category: string;
  priceCents: number | null;
};

export type AskPlugUResult = {
  answer: string;
  hits: PlugUHit[];
  links: { label: string; url: string; source: "instagram" | "tiktok" | "youtube" | "web" }[];
  error?: string;
};
