import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listMyOrders, getOrder, getOrderHistory, getBookingHistory,
  transitionOrder, transitionBooking, openDispute,
  listOpenSlots, listSellerSlots, addSellerSlot, deleteSellerSlot,
  type OrderRole, type OrderStatus, type BookingStatus,
} from "@/lib/orders-db";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function useMyOrders(role: OrderRole = "all") {
  const qc = useQueryClient();
  const key = ["orders", role];
  const q = useQuery({ queryKey: key, queryFn: () => listMyOrders(role) });

  // Live invalidate on new / updated orders and bookings.
  useEffect(() => {
    const ch = supabase
      .channel(`orders-${role}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => qc.invalidateQueries({ queryKey: key }))
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => qc.invalidateQueries({ queryKey: key }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc, role]);

  return q;
}

export function useOrder(id: string) {
  const qc = useQueryClient();
  const key = ["order", id];
  const q = useQuery({ queryKey: key, queryFn: () => getOrder(id), enabled: !!id });
  useEffect(() => {
    if (!id) return;
    const ch = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `id=eq.${id}` }, () => {
        qc.invalidateQueries({ queryKey: key });
        qc.invalidateQueries({ queryKey: ["order-history", id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `order_id=eq.${id}` }, () => {
        qc.invalidateQueries({ queryKey: key });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, qc]);
  return q;
}

export function useOrderHistory(orderId: string) {
  return useQuery({ queryKey: ["order-history", orderId], queryFn: () => getOrderHistory(orderId), enabled: !!orderId });
}
export function useBookingHistory(bookingId: string | null | undefined) {
  return useQuery({
    queryKey: ["booking-history", bookingId],
    queryFn: () => getBookingHistory(bookingId as string),
    enabled: !!bookingId,
  });
}

export function useTransitionOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; next: OrderStatus; note?: string }) => transitionOrder(v.id, v.next, v.note),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["order", v.id] });
      qc.invalidateQueries({ queryKey: ["order-history", v.id] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useTransitionBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; orderId: string; next: BookingStatus; reason?: string }) =>
      transitionBooking(v.id, v.next, v.reason),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["order", v.orderId] });
      qc.invalidateQueries({ queryKey: ["booking-history", v.id] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useOpenDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; reason: string }) => openDispute(v.id, v.reason),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["order", v.id] });
      qc.invalidateQueries({ queryKey: ["order-history", v.id] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useOpenSlots(listingId: string) {
  return useQuery({ queryKey: ["slots", listingId], queryFn: () => listOpenSlots(listingId), enabled: !!listingId });
}
export function useSellerSlots(listingId: string) {
  return useQuery({ queryKey: ["seller-slots", listingId], queryFn: () => listSellerSlots(listingId), enabled: !!listingId });
}
export function useAddSellerSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addSellerSlot,
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["seller-slots", v.listingId] });
      qc.invalidateQueries({ queryKey: ["slots", v.listingId] });
    },
  });
}
export function useDeleteSellerSlot(listingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slotId: string) => deleteSellerSlot(slotId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-slots", listingId] });
      qc.invalidateQueries({ queryKey: ["slots", listingId] });
    },
  });
}