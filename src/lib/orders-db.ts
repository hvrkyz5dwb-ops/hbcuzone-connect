// Supabase-backed orders + bookings.
// All money numbers are set by SECURITY DEFINER RPCs — the client never posts
// totals, fees or unit prices. Status transitions go through
// transition_order_status / transition_booking_status which enforce the
// state machine and write to the history tables.

import { supabase } from "@/integrations/supabase/client";

export type OrderStatus =
  | "pending" | "accepted" | "preparing" | "ready_for_pickup"
  | "out_for_delivery" | "completed" | "cancelled" | "refunded" | "disputed";

export type PaymentStatus = "pending" | "held" | "captured" | "refunded" | "failed";
export type OrderKind = "product" | "service";

export type BookingStatus =
  | "pending" | "accepted" | "declined" | "completed" | "cancelled" | "no_show";

export type DbOrder = {
  id: string;
  kind: OrderKind;
  status: OrderStatus;
  payment_status: PaymentStatus;
  buyer_user_id: string;
  seller_user_id: string;
  listing_id: string | null;
  subtotal_cents: number;
  platform_fee_cents: number;
  processing_fee_cents: number;
  total_cents: number;
  fulfillment_method: string | null;
  meetup_location: string | null;
  note: string | null;
  cancel_reason: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DbBooking = {
  id: string;
  order_id: string;
  listing_id: string;
  buyer_user_id: string | null;
  seller_user_id: string | null;
  slot_start: string | null;
  slot_end: string | null;
  scheduled_at: string;
  duration_min: number;
  status: BookingStatus;
  cancel_reason: string | null;
  decline_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type DbSlot = {
  id: string;
  listing_id: string;
  seller_user_id: string;
  slot_start: string;
  slot_end: string;
  is_booked: boolean;
  booking_id: string | null;
};

export type OrderWithExtras = DbOrder & {
  listing: { id: string; title: string; kind: string; image_url: string | null } | null;
  booking: DbBooking | null;
  counterparty: { id: string; display_name: string | null; username: string | null; avatar_url: string | null } | null;
};

export type OrderRole = "buyer" | "seller" | "all";

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user?.id) throw new Error("Sign in required");
  return data.user.id;
}

// ---------- create ----------

export async function createProductOrder(input: {
  listingId: string;
  qty?: number;
  fulfillmentMethod: string;
  note?: string;
  meetupLocation?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("create_order_secure", {
    _listing_id: input.listingId,
    _qty: input.qty ?? 1,
    _fulfillment_method: input.fulfillmentMethod,
    _note: input.note ?? "",
    _meetup_location: input.meetupLocation ?? "",
  });
  if (error) throw error;
  return data as string;
}

export async function createServiceBooking(input: {
  slotId: string;
  note?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("create_booking_secure", {
    _slot_id: input.slotId,
    _note: input.note ?? "",
  });
  if (error) throw error;
  return data as string;
}

// ---------- read ----------

export async function listMyOrders(role: OrderRole = "all"): Promise<OrderWithExtras[]> {
  const me = await currentUserId();
  let q = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (role === "buyer") q = q.eq("buyer_user_id", me);
  else if (role === "seller") q = q.eq("seller_user_id", me);
  else q = q.or(`buyer_user_id.eq.${me},seller_user_id.eq.${me}`);

  const { data: orders, error } = await q;
  if (error) throw error;
  const rows = (orders ?? []) as unknown as DbOrder[];
  if (rows.length === 0) return [];

  // Batch listing lookup.
  const listingIds = Array.from(new Set(rows.map((r) => r.listing_id).filter((v): v is string => !!v)));
  const listingMap = new Map<string, { id: string; title: string; kind: string; image_url: string | null }>();
  if (listingIds.length > 0) {
    const { data: listings } = await supabase
      .from("listings")
      .select("id,title,kind,listing_images(url,position)")
      .in("id", listingIds);
    for (const l of (listings ?? []) as Array<{ id: string; title: string; kind: string; listing_images: { url: string; position: number }[] | null }>) {
      const imgs = (l.listing_images ?? []).slice().sort((a, b) => a.position - b.position);
      listingMap.set(l.id, { id: l.id, title: l.title, kind: l.kind, image_url: imgs[0]?.url ?? null });
    }
  }

  // Bookings for service orders.
  const orderIds = rows.map((r) => r.id);
  const { data: bookings } = await supabase.from("bookings").select("*").in("order_id", orderIds);
  const bookingByOrder = new Map<string, DbBooking>();
  for (const b of (bookings ?? []) as unknown as DbBooking[]) bookingByOrder.set(b.order_id, b);

  // Counter-party profiles.
  const otherIds = Array.from(new Set(rows.map((r) => (r.buyer_user_id === me ? r.seller_user_id : r.buyer_user_id))));
  const profileMap = new Map<string, { id: string; display_name: string | null; username: string | null; avatar_url: string | null }>();
  if (otherIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id,display_name,username,avatar_url")
      .in("id", otherIds);
    for (const p of (profs ?? []) as Array<{ id: string; display_name: string | null; username: string | null; avatar_url: string | null }>) {
      profileMap.set(p.id, p);
    }
  }

  return rows.map((o) => ({
    ...o,
    listing: o.listing_id ? listingMap.get(o.listing_id) ?? null : null,
    booking: bookingByOrder.get(o.id) ?? null,
    counterparty: profileMap.get(o.buyer_user_id === me ? o.seller_user_id : o.buyer_user_id) ?? null,
  }));
}

export async function getOrder(id: string): Promise<OrderWithExtras | null> {
  const { data: o, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!o) return null;
  const order = o as unknown as DbOrder;

  const me = await currentUserId();
  let listing = null;
  if (order.listing_id) {
    const { data: l } = await supabase
      .from("listings")
      .select("id,title,kind,listing_images(url,position)")
      .eq("id", order.listing_id).maybeSingle();
    if (l) {
      const imgs = ((l as { listing_images: { url: string; position: number }[] | null }).listing_images ?? []).slice().sort((a, b) => a.position - b.position);
      listing = { id: l.id as string, title: l.title as string, kind: l.kind as string, image_url: imgs[0]?.url ?? null };
    }
  }
  const { data: b } = await supabase.from("bookings").select("*").eq("order_id", id).maybeSingle();
  const otherId = order.buyer_user_id === me ? order.seller_user_id : order.buyer_user_id;
  const { data: p } = await supabase.from("profiles").select("id,display_name,username,avatar_url").eq("id", otherId).maybeSingle();

  return {
    ...order,
    listing,
    booking: (b as unknown as DbBooking) ?? null,
    counterparty: (p as { id: string; display_name: string | null; username: string | null; avatar_url: string | null } | null) ?? null,
  };
}

export type StatusHistoryRow = {
  id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  note: string | null;
  created_at: string;
};

export async function getOrderHistory(orderId: string): Promise<StatusHistoryRow[]> {
  const { data, error } = await supabase
    .from("order_status_history")
    .select("id,from_status,to_status,changed_by,note,created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as StatusHistoryRow[];
}

export async function getBookingHistory(bookingId: string): Promise<StatusHistoryRow[]> {
  const { data, error } = await supabase
    .from("booking_status_history")
    .select("id,from_status,to_status,changed_by,note,created_at")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as StatusHistoryRow[];
}

// ---------- transition ----------

export async function transitionOrder(orderId: string, next: OrderStatus, note?: string): Promise<void> {
  const { error } = await supabase.rpc("transition_order_status", {
    _order_id: orderId,
    _next: next,
    _note: note ?? "",
  });
  if (error) throw error;
}

export async function transitionBooking(bookingId: string, next: BookingStatus, reason?: string): Promise<void> {
  const { error } = await supabase.rpc("transition_booking_status", {
    _booking_id: bookingId,
    _next: next,
    _reason: reason ?? "",
  });
  if (error) throw error;
}

export async function openDispute(orderId: string, reason: string): Promise<void> {
  await transitionOrder(orderId, "disputed", reason);
  // Persist a dedicated dispute record for admin review.
  const me = await currentUserId();
  await supabase.from("disputes").insert({ order_id: orderId, opened_by: me, reason, status: "open" });
}

// ---------- slots ----------

export async function listOpenSlots(listingId: string): Promise<DbSlot[]> {
  const { data, error } = await supabase
    .from("service_availability_slots")
    .select("*")
    .eq("listing_id", listingId)
    .eq("is_booked", false)
    .gte("slot_start", new Date().toISOString())
    .order("slot_start", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as DbSlot[];
}

export async function listSellerSlots(listingId: string): Promise<DbSlot[]> {
  const { data, error } = await supabase
    .from("service_availability_slots")
    .select("*")
    .eq("listing_id", listingId)
    .order("slot_start", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as DbSlot[];
}

export async function addSellerSlot(input: { listingId: string; slotStart: string; slotEnd: string }): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase.from("service_availability_slots").insert({
    listing_id: input.listingId,
    seller_user_id: me,
    slot_start: input.slotStart,
    slot_end: input.slotEnd,
  });
  if (error) throw error;
}

export async function deleteSellerSlot(slotId: string): Promise<void> {
  const { error } = await supabase.from("service_availability_slots").delete().eq("id", slotId).eq("is_booked", false);
  if (error) throw error;
}

// ---------- formatting ----------

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  disputed: "Disputed",
};

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  accepted: "Confirmed",
  declined: "Declined",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

export function statusToneClass(s: OrderStatus | BookingStatus): string {
  switch (s) {
    case "completed":
    case "accepted":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "cancelled":
    case "declined":
    case "refunded":
    case "no_show":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    case "disputed":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

export function centsToDollars(n: number): string {
  return `$${(n / 100).toFixed(2)}`;
}

/**
 * Allowed next-states from the current status for the given role.
 * Mirrors the transition_order_status guard in the database.
 */
export function allowedOrderTransitions(status: OrderStatus, role: "buyer" | "seller"): OrderStatus[] {
  if (role === "seller") {
    switch (status) {
      case "pending": return ["accepted", "cancelled"];
      case "accepted": return ["preparing", "cancelled"];
      case "preparing": return ["ready_for_pickup", "out_for_delivery", "cancelled"];
      case "ready_for_pickup": return ["completed", "cancelled"];
      case "out_for_delivery": return ["completed", "cancelled"];
      default: return [];
    }
  }
  // buyer
  switch (status) {
    case "pending":
    case "accepted":
      return ["cancelled", "disputed"];
    case "preparing":
      return ["disputed"];
    case "ready_for_pickup":
    case "out_for_delivery":
      return ["completed", "disputed"];
    default: return [];
  }
}

export function allowedBookingTransitions(status: BookingStatus, role: "buyer" | "seller"): BookingStatus[] {
  if (role === "seller") {
    switch (status) {
      case "pending": return ["accepted", "declined", "cancelled"];
      case "accepted": return ["completed", "no_show", "cancelled"];
      default: return [];
    }
  }
  // buyer
  switch (status) {
    case "pending":
    case "accepted":
      return ["cancelled"];
    default: return [];
  }
}