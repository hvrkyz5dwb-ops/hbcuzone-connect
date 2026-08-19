// PlugU Pulse data layer — live campus activity built from real rows only.
// Availability, Drops / Flash Drops, campus zones and aggregated heat data.
import { supabase } from "@/integrations/supabase/client";

export type AvailabilityRow = {
  id: string;
  seller_user_id: string;
  school_id: string | null;
  listing_id: string | null;
  category: string | null;
  service_label: string | null;
  zone_name: string | null;
  price_from_cents: number | null;
  slots_remaining: number | null;
  available_until: string | null;
  note: string | null;
  is_active: boolean;
  updated_at: string;
};

export type DropRow = {
  id: string;
  seller_user_id: string;
  school_id: string | null;
  listing_id: string | null;
  event_id: string | null;
  body: string;
  image_url: string | null;
  category: string | null;
  zone_name: string | null;
  price_cents: number | null;
  cta: string;
  is_flash: boolean;
  discount_percent: number | null;
  discount_cents: number | null;
  quantity_limit: number | null;
  quantity_claimed: number;
  expires_at: string;
  created_at: string;
};

export type SellerLite = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  school_name: string | null;
  verification_status: string | null;
  rating_avg: number | null;
  rating_count: number | null;
  completed_transactions: number | null;
};

export type CampusZone = {
  id: string;
  school_id: string | null;
  name: string;
  kind: string;
  x: number;
  y: number;
};

const PROFILE_COLS =
  "id,display_name,username,avatar_url,school_name,verification_status,rating_avg,rating_count,completed_transactions";

export async function fetchSellers(ids: string[]): Promise<Map<string, SellerLite>> {
  const unique = [...new Set(ids)].filter(Boolean);
  if (unique.length === 0) return new Map();
  const { data } = await supabase.from("profiles").select(PROFILE_COLS).in("id", unique);
  return new Map((data ?? []).map((p) => [p.id as string, p as SellerLite]));
}

/** Live "Available Now" rows for a campus (expired rows are filtered out server-side). */
export async function fetchAvailability(opts: { schoolId?: string | null; category?: string; limit?: number } = {}) {
  let q = supabase
    .from("seller_availability")
    .select("*")
    .eq("is_active", true)
    .or(`available_until.is.null,available_until.gt.${new Date().toISOString()}`)
    .order("updated_at", { ascending: false })
    .limit(opts.limit ?? 30);
  if (opts.schoolId) q = q.eq("school_id", opts.schoolId);
  if (opts.category && opts.category !== "all") q = q.eq("category", opts.category);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as AvailabilityRow[];
}

export async function fetchMyAvailability(userId: string): Promise<AvailabilityRow | null> {
  const { data, error } = await supabase
    .from("seller_availability")
    .select("*")
    .eq("seller_user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as AvailabilityRow) ?? null;
}

export type AvailabilityInput = {
  service_label: string;
  category: string | null;
  zone_name: string | null;
  price_from_cents: number | null;
  slots_remaining: number | null;
  available_until: string | null;
  listing_id?: string | null;
  note?: string | null;
};

export async function setAvailability(userId: string, schoolId: string | null, input: AvailabilityInput) {
  const { error } = await supabase.from("seller_availability").upsert(
    {
      seller_user_id: userId,
      school_id: schoolId,
      is_active: true,
      updated_at: new Date().toISOString(),
      ...input,
    },
    { onConflict: "seller_user_id" },
  );
  if (error) throw error;
}

export async function clearAvailability(userId: string) {
  const { error } = await supabase
    .from("seller_availability")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("seller_user_id", userId);
  if (error) throw error;
}

/** Unexpired drops for a campus. */
export async function fetchDrops(opts: { schoolId?: string | null; flashOnly?: boolean; limit?: number } = {}) {
  let q = supabase
    .from("drops")
    .select("*")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 30);
  if (opts.schoolId) q = q.eq("school_id", opts.schoolId);
  if (opts.flashOnly) q = q.eq("is_flash", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as DropRow[];
}

export async function fetchMyDrops(userId: string) {
  const { data, error } = await supabase
    .from("drops")
    .select("*")
    .eq("seller_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []) as DropRow[];
}

export type DropInput = {
  body: string;
  image_url?: string | null;
  category?: string | null;
  zone_name?: string | null;
  price_cents?: number | null;
  listing_id?: string | null;
  event_id?: string | null;
  cta?: string;
  is_flash?: boolean;
  discount_percent?: number | null;
  quantity_limit?: number | null;
  expires_at?: string;
};

export async function createDrop(userId: string, schoolId: string | null, input: DropInput) {
  const { data, error } = await supabase
    .from("drops")
    .insert({
      seller_user_id: userId,
      school_id: schoolId,
      cta: input.cta ?? "none",
      ...input,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as DropRow;
}

export async function deleteDrop(id: string) {
  const { error } = await supabase.from("drops").delete().eq("id", id);
  if (error) throw error;
}

export async function claimFlashDrop(dropId: string) {
  const { data, error } = await supabase.rpc("claim_flash_drop", { _drop_id: dropId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row as { claimed: boolean; remaining: number | null; reason: string };
}

export async function fetchMyClaims(userId: string, dropIds: string[]) {
  if (dropIds.length === 0) return new Set<string>();
  const { data } = await supabase
    .from("drop_claims")
    .select("drop_id")
    .eq("user_id", userId)
    .in("drop_id", dropIds);
  return new Set((data ?? []).map((r) => r.drop_id as string));
}

export async function fetchZones(schoolId?: string | null) {
  let q = supabase.from("campus_zones").select("*").order("sort", { ascending: true });
  if (schoolId) q = q.eq("school_id", schoolId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as CampusZone[];
}

export type ZoneActivity = {
  zone_name: string;
  available_count: number;
  drop_count: number;
  event_count: number;
  total: number;
};

export async function fetchCampusActivity(schoolId: string | null) {
  const { data, error } = await supabase.rpc("campus_activity_summary", { _school_id: schoolId as string });
  if (error) throw error;
  return (data ?? []) as unknown as ZoneActivity[];
}

// ---- helpers ----
export function minutesLeft(iso: string | null): number | null {
  if (!iso) return null;
  return Math.round((new Date(iso).getTime() - Date.now()) / 60000);
}

export function untilLabel(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function countdown(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  return `${Math.floor(hrs / 24)}d`;
}

export function sellerName(s?: SellerLite | null): string {
  return s?.display_name || s?.username || "Student seller";
}
