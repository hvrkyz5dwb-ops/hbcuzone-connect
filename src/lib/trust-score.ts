import { getOrders, getReviews, type Order } from "./orders-storage";

export type TrustLevel = "Bronze" | "Silver" | "Gold" | "Diamond";

export type TrustMetrics = {
  totalSales: number;
  completedSales: number;
  responseTimeMin: number;   // average, mocked
  completionRate: number;    // 0-100
  repeatCustomerPct: number; // 0-100
  favoriteCount: number;
  refundCount: number;
  refundRate: number;        // 0-100
  score: number;             // 0-100
  level: TrustLevel;
};

function pctClamp(n: number) { return Math.max(0, Math.min(100, Math.round(n))); }

export function computeTrustMetrics(seller?: string): TrustMetrics {
  const orders = getOrders().filter((o) => (seller ? o.seller === seller : true));
  const total = orders.length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const refunded = orders.filter((o) => o.status === "refunded").length;
  const buyerCounts = new Map<string, number>();
  orders.forEach((o) => buyerCounts.set(o.buyer, (buyerCounts.get(o.buyer) ?? 0) + 1));
  const repeat = [...buyerCounts.values()].filter((c) => c > 1).length;
  const reviews = getReviews(seller);
  const avgRating = reviews.length
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : 4.6;
  const completionRate = total === 0 ? 100 : (delivered / total) * 100;
  const refundRate = total === 0 ? 0 : (refunded / total) * 100;
  const repeatCustomerPct = buyerCounts.size === 0 ? 0 : (repeat / buyerCounts.size) * 100;

  // Composite score: rating (0-40) + completion (0-25) + repeat (0-15) + tenure/volume (0-15) - refund penalty (0-15)
  const ratingPart = (avgRating / 5) * 40;
  const completionPart = (completionRate / 100) * 25;
  const repeatPart = (repeatCustomerPct / 100) * 15;
  const volumePart = Math.min(15, total * 1.5);
  const refundPenalty = Math.min(15, refundRate * 0.5);
  const score = pctClamp(ratingPart + completionPart + repeatPart + volumePart - refundPenalty + 5);

  const level: TrustLevel =
    score >= 92 ? "Diamond" : score >= 80 ? "Gold" : score >= 65 ? "Silver" : "Bronze";

  return {
    totalSales: total,
    completedSales: delivered,
    responseTimeMin: 4 + (total % 7),
    completionRate: pctClamp(completionRate),
    repeatCustomerPct: pctClamp(repeatCustomerPct),
    favoriteCount: 12 + total * 2,
    refundCount: refunded,
    refundRate: pctClamp(refundRate),
    score,
    level,
  };
}

export function levelAccent(level: TrustLevel): string {
  return level === "Diamond" ? "#b9f2ff"
    : level === "Gold" ? "#f4c96a"
    : level === "Silver" ? "#d5d5d5"
    : "#c68a52";
}

export function statusLabel(o: Order): string {
  return {
    paid: "Paid — awaiting seller",
    in_progress: "In progress",
    delivered: "Delivered",
    disputed: "Disputed",
    refunded: "Refunded",
  }[o.status];
}