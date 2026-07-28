import { supabase } from "@/integrations/supabase/client";

export type NotifRow = {
  id: string;
  user_id: string;
  kind: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export const NOTIF_LABEL: Record<string, string> = {
  "message.new": "Messages",
  "order.new": "Orders",
  "order.status": "Orders",
  "order.accepted": "Orders",
  "order.declined": "Orders",
  "order.cancelled": "Orders",
  "order.completed": "Orders",
  "order.refunded": "Refunds",
  "booking.new": "Bookings",
  "booking.status": "Bookings",
  "booking.reminder": "Bookings",
  "listing.approved": "Listings",
  "listing.rejected": "Listings",
  "listing.removed": "Listings",
  "review.new": "Reviews",
  "report.update": "Reports",
  "dispute.new": "Disputes",
  "dispute.update": "Disputes",
  "verify.confirmed": "Verification",
  "seller.completed": "Seller",
};

export function labelFor(kind: string): string {
  return NOTIF_LABEL[kind] ?? "PlugU";
}

export function emojiFor(kind: string): string {
  if (kind.startsWith("message")) return "💬";
  if (kind === "order.refunded") return "💸";
  if (kind.startsWith("order") || kind === "booking.new" || kind === "booking.status") return "📦";
  if (kind === "booking.reminder") return "⏰";
  if (kind.startsWith("listing")) return "🛍️";
  if (kind === "review.new") return "⭐";
  if (kind.startsWith("report")) return "🚩";
  if (kind.startsWith("dispute")) return "⚖️";
  if (kind === "verify.confirmed") return "✔️";
  if (kind === "seller.completed") return "🧾";
  return "🔔";
}

export function titleFor(n: NotifRow): string {
  const p = n.payload ?? {};
  switch (n.kind) {
    case "message.new": return "New message";
    case "order.new": return "New order";
    case "order.accepted": return "Order accepted";
    case "order.declined": return "Order declined";
    case "order.cancelled": return "Order cancelled";
    case "order.completed": return "Order completed";
    case "order.refunded": return "Refund issued";
    case "order.status": return `Order ${String(p.status ?? "updated")}`;
    case "booking.new": return "New booking request";
    case "booking.status": return `Booking ${String(p.status ?? "updated")}`;
    case "booking.reminder": return "Booking reminder";
    case "listing.approved": return "Listing approved";
    case "listing.rejected": return "Listing rejected";
    case "listing.removed": return "Listing removed";
    case "review.new": return `New ${p.rating ?? ""}★ review`.trim();
    case "report.update": return `Report ${String(p.status ?? "updated")}`;
    case "dispute.new": return "Dispute opened";
    case "dispute.update": return `Dispute ${String(p.status ?? "updated")}`;
    case "verify.confirmed": return "You're verified";
    case "seller.completed": return "Seller application complete";
    default: return "PlugU update";
  }
}

export function bodyFor(n: NotifRow): string {
  const p = n.payload ?? {} as any;
  switch (n.kind) {
    case "message.new": return typeof p.preview === "string" && p.preview ? p.preview : "Open your inbox";
    case "order.refunded": return "The buyer has been refunded.";
    case "order.accepted": return "Your order was accepted.";
    case "order.declined": return "Your order was declined.";
    case "order.cancelled": return p.reason ? String(p.reason) : "This order was cancelled.";
    case "order.completed": return "Marked complete — leave a review.";
    case "order.new": return "You have a new order to review.";
    case "order.status": return "Tap to see the latest status.";
    case "booking.new": return "A student requested a time slot.";
    case "booking.status": return p.reason ? String(p.reason) : "Tap to view your booking.";
    case "booking.reminder": return "Your appointment is coming up.";
    case "listing.approved": return p.title ? `"${p.title}" is live in the market.` : "Your listing is live.";
    case "listing.rejected": return "It didn't meet the guidelines — edit and resubmit.";
    case "listing.removed": return "Removed by moderators.";
    case "review.new": return "A verified student left you a review.";
    case "report.update": return "Our team reviewed your report.";
    case "dispute.new": return p.reason ? String(p.reason) : "A dispute was opened on this order.";
    case "dispute.update": return "There's an update on the dispute.";
    case "verify.confirmed": return p.school_name ? `Verified as ${String(p.school_name)}.` : "Your .edu email is confirmed.";
    case "seller.completed": return "You're all set to accept orders.";
    default: return "";
  }
}

export function hrefFor(n: NotifRow): string | undefined {
  const p = n.payload ?? {} as any;
  if (n.kind === "message.new" && p.conversation_id) return `/messages/${p.conversation_id}`;
  if (n.kind.startsWith("order") && p.order_id) return `/orders/${p.order_id}`;
  if ((n.kind === "booking.new" || n.kind === "booking.status" || n.kind === "booking.reminder") && p.order_id)
    return `/orders/${p.order_id}`;
  if (n.kind.startsWith("listing")) return "/seller/listings";
  if (n.kind === "review.new" && p.order_id) return `/orders/${p.order_id}`;
  if (n.kind === "report.update") return "/safety";
  if (n.kind.startsWith("dispute") && p.order_id) return `/orders/${p.order_id}`;
  if (n.kind === "verify.confirmed") return "/profile";
  if (n.kind === "seller.completed") return "/seller";
  return undefined;
}

export async function fetchNotifications(limit = 100): Promise<NotifRow[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as NotifRow[];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.rpc("mark_notification_read", { _id: id });
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.rpc("mark_all_notifications_read");
  if (error) throw error;
}

export async function clearAllNotifications() {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user.id;
  if (!uid) return;
  const { error } = await supabase.from("notifications").delete().eq("user_id", uid);
  if (error) throw error;
}