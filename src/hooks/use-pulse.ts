// Live campus data hooks. Realtime listeners are scoped to the viewer's
// campus and torn down on unmount.
import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { subscribeChannel } from "@/lib/realtime";
import { useProfile } from "./use-profile";
import { useSession } from "./use-session";
import {
  fetchAvailability, fetchDrops, fetchMyAvailability, fetchMyDrops, fetchSellers,
  fetchCampusActivity, fetchMyClaims, fetchZones, type AvailabilityRow, type DropRow, type SellerLite,
} from "@/lib/pulse-db";

export function useCampusId(): string | null {
  const { profile } = useProfile();
  return profile?.school_id ?? null;
}

/** Refetches Pulse queries whenever availability or drops change on this campus. */
function useLiveInvalidation(schoolId: string | null) {
  const qc = useQueryClient();
  // Unique per hook instance: reusing one channel name across mounted
  // components throws "cannot add postgres_changes callbacks after subscribe".
  const idRef = useRef<string>("");
  if (!idRef.current) idRef.current = Math.random().toString(36).slice(2, 9);
  const instanceId = idRef.current;
  useEffect(() => {
    return subscribeChannel(`pulse-${schoolId ?? "all"}-${instanceId}`, (ch) =>
      ch
      .on("postgres_changes", { event: "*", schema: "public", table: "seller_availability" }, () => {
        qc.invalidateQueries({ queryKey: ["availability"] });
        qc.invalidateQueries({ queryKey: ["campus-activity"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "drops" }, () => {
        qc.invalidateQueries({ queryKey: ["drops"] });
        qc.invalidateQueries({ queryKey: ["campus-activity"] });
      })
    );
  }, [qc, schoolId, instanceId]);
}

export type AvailabilityWithSeller = AvailabilityRow & { seller: SellerLite | null };
export type DropWithSeller = DropRow & { seller: SellerLite | null };

export function useAvailability(opts: { category?: string; limit?: number } = {}) {
  const schoolId = useCampusId();
  useLiveInvalidation(schoolId);
  return useQuery({
    queryKey: ["availability", schoolId, opts.category ?? "all", opts.limit ?? 30],
    staleTime: 20_000,
    queryFn: async (): Promise<AvailabilityWithSeller[]> => {
      const rows = await fetchAvailability({ schoolId, category: opts.category, limit: opts.limit });
      const sellers = await fetchSellers(rows.map((r) => r.seller_user_id));
      return rows.map((r) => ({ ...r, seller: sellers.get(r.seller_user_id) ?? null }));
    },
  });
}

export function useDrops(opts: { flashOnly?: boolean; limit?: number } = {}) {
  const schoolId = useCampusId();
  const { user } = useSession();
  useLiveInvalidation(schoolId);
  return useQuery({
    queryKey: ["drops", schoolId, opts.flashOnly ?? false, opts.limit ?? 30, user?.id ?? null],
    staleTime: 20_000,
    queryFn: async (): Promise<{ items: DropWithSeller[]; claimed: Set<string> }> => {
      const rows = await fetchDrops({ schoolId, flashOnly: opts.flashOnly, limit: opts.limit });
      const sellers = await fetchSellers(rows.map((r) => r.seller_user_id));
      const claimed = user?.id ? await fetchMyClaims(user.id, rows.map((r) => r.id)) : new Set<string>();
      return {
        items: rows.map((r) => ({ ...r, seller: sellers.get(r.seller_user_id) ?? null })),
        claimed,
      };
    },
  });
}

export function useMyAvailability() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["my-availability", user?.id ?? null],
    enabled: !!user?.id,
    queryFn: () => fetchMyAvailability(user!.id),
  });
}

export function useMyDrops() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["my-drops", user?.id ?? null],
    enabled: !!user?.id,
    queryFn: () => fetchMyDrops(user!.id),
  });
}

export function useCampusActivity() {
  const schoolId = useCampusId();
  useLiveInvalidation(schoolId);
  return useQuery({
    queryKey: ["campus-activity", schoolId],
    staleTime: 30_000,
    queryFn: () => fetchCampusActivity(schoolId),
  });
}

export function useCampusZones() {
  const schoolId = useCampusId();
  return useQuery({
    queryKey: ["campus-zones", schoolId],
    staleTime: 5 * 60_000,
    queryFn: () => fetchZones(schoolId),
  });
}
