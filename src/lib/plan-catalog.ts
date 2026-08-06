// Canonical catalog of everything a student can buy directly
// (memberships, promotion boosts, Plug Reach™ packages).
//
// This module is the single source of truth for plan keys and prices.
// The server uses it to price Stripe Checkout Sessions — the client
// NEVER sends an amount, only a plan key — and the UI uses it to render
// plan names/prices on checkout and post-payment screens.

import { pricingTiers } from "./mock-data";
import { reachPackages } from "./plug-reach-data";
import { SELLER_TIERS } from "./seller-plan";

export type ResolvedPlan = {
  key: string;
  name: string;
  unitAmountCents: number;
  kind: "membership" | "boost" | "reach";
  tier?: string;
  cycle?: string;
};

function slug(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Resolve a plan key to its canonical name and price.
 * Supported key formats:
 *   seller_<pro|kingpin>_<monthly|semester|year>        (memberships)
 *   reach-<campus|local|statewide|ultimate>-<duration>  (Plug Reach)
 *   <durationKey> from boostPackages / pricingTiers     (boosts)
 * Returns null for unknown keys and for free (price = 0) memberships,
 * which must never go through paid checkout.
 */
export function resolvePlanKey(raw: string): ResolvedPlan | null {
  const key = raw.trim();

  const seller = key.match(/^seller_(pro|kingpin)_(monthly|semester|year)$/);
  if (seller) {
    const tier = SELLER_TIERS.find((t) => t.key === seller[1]);
    const cycle = seller[2] as "monthly" | "semester" | "year";
    // Each paid tier has exactly one fixed billing cycle (Pro = semester,
    // KingPin = annual). Keys for any other cycle are invalid.
    if (!tier || cycle !== tier.cycle) return null;
    const p = tier.price;
    if (!tier || p <= 0) return null;
    return {
      key,
      name: `${tier.name} · ${cycle === "semester" ? "Semester" : "Annual"}`,
      unitAmountCents: Math.round(p * 100),
      kind: "membership",
      tier: tier.key,
      cycle,
    };
  }

  const reach = key.match(/^reach[-_](campus|local|statewide|ultimate)[-_](.+)$/);
  if (reach) {
    const pkg = reachPackages.find((p) => p.key === reach[1]);
    const wanted = reach[2].replace(/_/g, "-");
    const d = pkg?.durations.find((dur) => slug(dur.label) === wanted);
    if (pkg && d) {
      return {
        key,
        name: `Plug Reach™ — ${pkg.name} · ${d.label}`,
        unitAmountCents: Math.round(d.price * 100),
        kind: "reach",
      };
    }
    return null;
  }

  const boost = pricingTiers.find((t) => t.key === key);
  if (boost && boost.price > 0) {
    return {
      key,
      name: boost.name,
      unitAmountCents: Math.round(boost.price * 100),
      kind: "boost",
    };
  }

  return null;
}