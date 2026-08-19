// PlugScore — PlugU's trust score, computed only from real profile signals.
// 0-100 composite: rating quality, verified transaction volume, verification
// status and account tenure. No mock inputs.

export type PlugTier = "New" | "Rising" | "Trusted" | "Elite" | "Legend";

export type PlugScoreInput = {
  rating_avg?: number | null;
  rating_count?: number | null;
  completed_transactions?: number | null;
  verification_status?: string | null;
  created_at?: string | null;
};

export type PlugScore = {
  score: number;          // 0-100
  tier: PlugTier;
  color: string;          // css color for the tier
  breakdown: { label: string; value: number; max: number }[];
  isNew: boolean;         // not enough history yet
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export function computePlugScore(input: PlugScoreInput): PlugScore {
  const ratingAvg = Number(input.rating_avg ?? 0);
  const ratingCount = Number(input.rating_count ?? 0);
  const deals = Number(input.completed_transactions ?? 0);
  const verified = input.verification_status === "verified";

  // Rating quality (0-40) — weighted by how many reviews back it up.
  const confidence = ratingCount === 0 ? 0 : Math.min(1, ratingCount / 8);
  const ratingPart = ratingCount === 0 ? 0 : (ratingAvg / 5) * 40 * confidence;

  // Completed transactions (0-30) — saturates around 25 deals.
  const dealsPart = Math.min(30, Math.sqrt(Math.max(0, deals)) * 6);

  // Verified student (0-20)
  const verifiedPart = verified ? 20 : 0;

  // Tenure (0-10) — one point per month, capped at 10.
  let tenurePart = 0;
  if (input.created_at) {
    const months = (Date.now() - new Date(input.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30.4);
    tenurePart = clamp(months, 0, 10);
  }

  const score = Math.round(clamp(ratingPart + dealsPart + verifiedPart + tenurePart));
  const isNew = ratingCount === 0 && deals === 0;

  const tier: PlugTier =
    isNew ? "New"
    : score >= 90 ? "Legend"
    : score >= 75 ? "Elite"
    : score >= 55 ? "Trusted"
    : "Rising";

  return {
    score,
    tier,
    color: tierColor(tier),
    isNew,
    breakdown: [
      { label: "Review quality", value: Math.round(ratingPart), max: 40 },
      { label: "Completed deals", value: Math.round(dealsPart), max: 30 },
      { label: "Verified student", value: verifiedPart, max: 20 },
      { label: "Time on PlugU", value: Math.round(tenurePart), max: 10 },
    ],
  };
}

export function tierColor(tier: PlugTier): string {
  switch (tier) {
    case "Legend": return "#b9f2ff";
    case "Elite": return "var(--plugu-gold, #f4c96a)";
    case "Trusted": return "#7dd6a0";
    case "Rising": return "#c68a52";
    default: return "#9a9a9a";
  }
}

export function tierBlurb(tier: PlugTier): string {
  switch (tier) {
    case "Legend": return "Top-rated plug with a long, clean track record.";
    case "Elite": return "Consistently great reviews and lots of completed deals.";
    case "Trusted": return "Verified with solid reviews from real transactions.";
    case "Rising": return "Building a track record — early reviews look good.";
    default: return "New to PlugU. No completed transactions yet.";
  }
}
