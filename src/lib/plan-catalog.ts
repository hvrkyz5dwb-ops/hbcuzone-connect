// Digital purchases (memberships, promotion boosts, Plug Reach™ packages)
// are NOT sold in PlugU. Every in-app feature is free for verified students,
// and the only payments the app handles are buyer-to-seller payments for
// real-world goods and services.
//
// This module remains the single source of truth for plan keys so that any
// legacy link or stored key resolves to "not purchasable" instead of opening
// a checkout session.

export type ResolvedPlan = {
  key: string;
  name: string;
  unitAmountCents: number;
  kind: "membership" | "boost" | "reach";
  tier?: string;
  cycle?: string;
};

/**
 * Always returns null: there is nothing digital to buy. Callers must treat
 * null as "this key cannot be purchased" and show the free-access notice.
 */
export function resolvePlanKey(_raw: string): ResolvedPlan | null {
  return null;
}
