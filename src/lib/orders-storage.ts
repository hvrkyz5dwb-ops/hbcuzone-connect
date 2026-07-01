// Local-first order/dispute/view store. Same shape as a future createServerFn.

export type OrderStatus = "paid" | "in_progress" | "delivered" | "disputed" | "refunded";
export type PaymentMethod = "apple_pay" | "cash_app" | "card";

export type Order = {
  id: string;
  listingId: string;
  title: string;
  image?: string;
  price: number;        // dollars
  fee: number;          // PlugU fee in dollars
  total: number;        // price + fee
  seller: string;
  campus: string;
  buyer: string;
  method: PaymentMethod;
  status: OrderStatus;
  note?: string;
  meetup?: string;
  createdAt: string;
  updatedAt: string;
  timeline: { at: string; label: string }[];
  disputeReason?: string;
  reviewed?: boolean;
};

export type Review = {
  orderId: string;
  seller: string;
  rating: number;
  body: string;
  at: string;
};

const ORDERS_KEY = "plugu.orders.v1";
const REVIEWS_KEY = "plugu.reviews.v1";
const VIEWS_KEY = "plugu.listingViews.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(window.localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function getOrders(): Order[] {
  return read<Order[]>(ORDERS_KEY, []).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export type CreateOrderInput = {
  listingId: string;
  title: string;
  image?: string;
  price: number;
  seller: string;
  campus: string;
  method: PaymentMethod;
  note?: string;
  meetup?: string;
  feePercent?: number; // default 5%
};

export function createOrder(input: CreateOrderInput): Order {
  const fee = +(input.price * ((input.feePercent ?? 5) / 100)).toFixed(2);
  const total = +(input.price + fee).toFixed(2);
  const now = new Date().toISOString();
  const order: Order = {
    id: `PU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    listingId: input.listingId,
    title: input.title,
    image: input.image,
    price: input.price,
    fee,
    total,
    seller: input.seller,
    campus: input.campus,
    buyer: "You",
    method: input.method,
    status: "paid",
    note: input.note,
    meetup: input.meetup,
    createdAt: now,
    updatedAt: now,
    timeline: [
      { at: now, label: "Payment received — held in PlugU escrow" },
      { at: now, label: "Seller notified" },
    ],
  };
  const all = read<Order[]>(ORDERS_KEY, []);
  all.unshift(order);
  write(ORDERS_KEY, all);
  return order;
}

export function updateOrder(id: string, patch: Partial<Order> & { addTimeline?: string }): Order | undefined {
  const all = read<Order[]>(ORDERS_KEY, []);
  const idx = all.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  const now = new Date().toISOString();
  const current = all[idx];
  const next: Order = {
    ...current,
    ...patch,
    updatedAt: now,
    timeline: patch.addTimeline
      ? [...current.timeline, { at: now, label: patch.addTimeline }]
      : current.timeline,
  };
  delete (next as unknown as { addTimeline?: string }).addTimeline;
  all[idx] = next;
  write(ORDERS_KEY, all);
  return next;
}

export function markDelivered(id: string) {
  return updateOrder(id, { status: "delivered", addTimeline: "Buyer confirmed delivery — funds released" });
}

export function openDispute(id: string, reason: string) {
  return updateOrder(id, { status: "disputed", disputeReason: reason, addTimeline: `Dispute opened: ${reason}` });
}

export function refundOrder(id: string) {
  return updateOrder(id, { status: "refunded", addTimeline: "Refund processed — original method" });
}

// Reviews — only allowed on delivered orders (verified purchase).
export function canReview(order: Order) {
  return order.status === "delivered" && !order.reviewed;
}

export function submitReview(orderId: string, rating: number, body: string): Review | undefined {
  const order = getOrder(orderId);
  if (!order || !canReview(order)) return undefined;
  const review: Review = { orderId, seller: order.seller, rating, body, at: new Date().toISOString() };
  const all = read<Review[]>(REVIEWS_KEY, []);
  all.unshift(review);
  write(REVIEWS_KEY, all);
  updateOrder(orderId, { reviewed: true, addTimeline: `Review posted — ${rating}★` });
  return review;
}

export function getReviews(seller?: string): Review[] {
  const all = read<Review[]>(REVIEWS_KEY, []);
  return seller ? all.filter((r) => r.seller === seller) : all;
}

// Listing views — for analytics/conversion.
export function recordListingView(listingId: string) {
  const map = read<Record<string, number>>(VIEWS_KEY, {});
  map[listingId] = (map[listingId] ?? 0) + 1;
  write(VIEWS_KEY, map);
}

export function getListingViews(): Record<string, number> {
  return read<Record<string, number>>(VIEWS_KEY, {});
}

export function totalViews(): number {
  return Object.values(getListingViews()).reduce((a, b) => a + b, 0);
}

export function ordersByStatus(status: OrderStatus): Order[] {
  return getOrders().filter((o) => o.status === status);
}

export function paymentLabel(m: PaymentMethod): string {
  return m === "apple_pay" ? "Apple Pay" : m === "cash_app" ? "Cash App Pay" : "Card";
}