// Campus OS data layer. Every verified campus fact (places, entrances,
// routes, tours) comes from the database and is only shown once an
// administrator has published it — we never invent buildings, hours or
// entrances. Live pins are time-boxed and self-expire.
import { supabase } from "@/integrations/supabase/client";

export type PlaceCategory =
  | "academic"
  | "housing"
  | "dining"
  | "athletics"
  | "student_services"
  | "health"
  | "safety"
  | "historic"
  | "recreation"
  | "parking"
  | "accessibility";

export const PLACE_CATEGORIES: { key: PlaceCategory; label: string; shape: string }[] = [
  { key: "academic", label: "Academic", shape: "▲" },
  { key: "housing", label: "Housing", shape: "■" },
  { key: "dining", label: "Dining", shape: "●" },
  { key: "athletics", label: "Athletics", shape: "◆" },
  { key: "student_services", label: "Student services", shape: "★" },
  { key: "health", label: "Health", shape: "✚" },
  { key: "safety", label: "Safety", shape: "▮" },
  { key: "historic", label: "Historic landmark", shape: "❖" },
  { key: "recreation", label: "Recreation", shape: "◐" },
  { key: "parking", label: "Parking", shape: "▬" },
  { key: "accessibility", label: "Accessibility", shape: "♿" },
];

export const PLACE_CATEGORY_LABEL = Object.fromEntries(
  PLACE_CATEGORIES.map((c) => [c.key, c.label]),
) as Record<string, string>;

/** Non-color glyph per category — status is never conveyed by color alone. */
export function categoryShape(cat?: string | null) {
  return PLACE_CATEGORIES.find((c) => c.key === cat)?.shape ?? "◇";
}

export type Campus = {
  id: string;
  school_id: string | null;
  name: string;
  type: string;
  is_hbcu: boolean;
  city: string | null;
  state: string | null;
  center_lat: number | null;
  center_lng: number | null;
  verification_status: string;
  is_published: boolean;
};

export type CampusPlace = {
  id: string;
  campus_id: string;
  name: string;
  nicknames: string[];
  category: string;
  subcategory: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
  entrances: { label: string; lat?: number; lng?: number; accessible?: boolean }[];
  hours: Record<string, string> | null;
  services: string[];
  accessibility: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  address: string | null;
  media: { url: string; caption?: string }[];
  video_url: string | null;
  verification_status: string;
  verification_source: string | null;
  last_verified_at: string | null;
  is_published: boolean;
};

export type LivePin = {
  id: string;
  campus_id: string | null;
  owner_user_id: string;
  kind: string;
  category: string | null;
  title: string;
  note: string | null;
  place_id: string | null;
  safe_location_label: string;
  lat: number | null;
  lng: number | null;
  price_range: string | null;
  response_time_min: number | null;
  appointment_required: boolean;
  accepting_orders: boolean;
  starts_at: string;
  expires_at: string;
  status: string;
  moderation_status: string;
};

export type CampusTour = {
  id: string;
  campus_id: string;
  title: string;
  description: string | null;
  audience: string;
  duration_min: number | null;
  cover_url: string | null;
};

const db = supabase as any;

/* ------------------------------- campuses ------------------------------- */

export async function fetchCampuses(): Promise<Campus[]> {
  const { data, error } = await db
    .from("campuses")
    .select("*")
    .eq("is_published", true)
    .order("name");
  if (error) throw error;
  return (data ?? []) as Campus[];
}

/** Resolve the campus record for a school name (the student's verified .edu). */
export async function resolveCampus(schoolName?: string | null): Promise<Campus | null> {
  const all = await fetchCampuses();
  if (!all.length) return null;
  if (!schoolName) return all[0];
  const norm = schoolName.toLowerCase();
  return all.find((c) => c.name.toLowerCase() === norm)
    ?? all.find((c) => norm.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(norm))
    ?? null;
}

/* -------------------------------- places -------------------------------- */

export async function fetchPlaces(campusId: string, category?: string): Promise<CampusPlace[]> {
  let q = db.from("campus_places").select("*").eq("campus_id", campusId).eq("is_published", true);
  if (category) q = q.eq("category", category);
  const { data, error } = await q.order("name");
  if (error) throw error;
  return (data ?? []) as CampusPlace[];
}

export async function fetchPlace(id: string): Promise<CampusPlace | null> {
  const { data, error } = await db.from("campus_places").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as CampusPlace | null;
}

/** Search verified places by official name, nickname, service or department. */
export function matchPlace(p: CampusPlace, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    p.name.toLowerCase().includes(needle) ||
    (p.nicknames ?? []).some((n) => n.toLowerCase().includes(needle)) ||
    (p.services ?? []).some((s) => s.toLowerCase().includes(needle)) ||
    (p.subcategory ?? "").toLowerCase().includes(needle) ||
    (p.description ?? "").toLowerCase().includes(needle)
  );
}

export function isVerified(p: Pick<CampusPlace, "verification_status">) {
  return p.verification_status === "verified";
}

/* ---------------------------- saved places ------------------------------ */

export async function fetchSavedPlaceIds(): Promise<string[]> {
  const { data } = await db.from("saved_places").select("place_id");
  return (data ?? []).map((r: any) => r.place_id as string);
}

export async function toggleSavedPlace(placeId: string, saved: boolean) {
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id;
  if (!uid) throw new Error("Sign in to save places");
  if (saved) {
    const { error } = await db.from("saved_places").delete().eq("place_id", placeId).eq("user_id", uid);
    if (error) throw error;
  } else {
    const { error } = await db.from("saved_places").upsert({ user_id: uid, place_id: placeId });
    if (error) throw error;
  }
}

/* ------------------------------- live pins ------------------------------ */

export async function fetchLivePins(campusId?: string | null): Promise<LivePin[]> {
  let q = db
    .from("campus_live_pins")
    .select("*")
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .gt("expires_at", new Date().toISOString());
  if (campusId) q = q.eq("campus_id", campusId);
  const { data, error } = await q.order("starts_at", { ascending: false }).limit(200);
  if (error) throw error;
  return (data ?? []) as LivePin[];
}

export async function fetchMyLivePins(): Promise<LivePin[]> {
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id;
  if (!uid) return [];
  const { data } = await db
    .from("campus_live_pins")
    .select("*")
    .eq("owner_user_id", uid)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as LivePin[];
}

export type GoActiveInput = {
  campusId: string | null;
  title: string;
  category: string;
  safeLocation: string;
  minutes: number;
  responseTimeMin: number | null;
  appointmentRequired: boolean;
  note?: string;
  priceRange?: string;
  lat?: number | null;
  lng?: number | null;
};

/** "Go active" — a seller intentionally appears on the Live Map, time-boxed. */
export async function goActive(input: GoActiveInput) {
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id;
  if (!uid) throw new Error("Sign in required");
  const expires = new Date(Date.now() + input.minutes * 60_000).toISOString();
  const { data, error } = await db
    .from("campus_live_pins")
    .insert({
      campus_id: input.campusId,
      owner_user_id: uid,
      kind: "business",
      category: input.category,
      title: input.title,
      note: input.note ?? null,
      safe_location_label: input.safeLocation,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      price_range: input.priceRange ?? null,
      response_time_min: input.responseTimeMin,
      appointment_required: input.appointmentRequired,
      expires_at: expires,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function endLivePin(id: string) {
  const { error } = await db.from("campus_live_pins").update({ status: "ended" }).eq("id", id);
  if (error) throw error;
}

/**
 * Legitimate live ranking: currently accepting orders, verified availability,
 * response time and recency. No paid placement, ever.
 */
export function rankPins(pins: LivePin[]) {
  return [...pins].sort((a, b) => score(b) - score(a));
}
function score(p: LivePin) {
  let s = 0;
  if (p.accepting_orders) s += 40;
  if (!p.appointment_required) s += 5;
  if (p.response_time_min != null) s += Math.max(0, 30 - p.response_time_min);
  const minsLeft = (new Date(p.expires_at).getTime() - Date.now()) / 60_000;
  s += Math.min(20, Math.max(0, minsLeft / 10));
  return s;
}

/* --------------------------------- tours -------------------------------- */

export async function fetchTours(campusId: string): Promise<CampusTour[]> {
  const { data, error } = await db
    .from("campus_tours")
    .select("*")
    .eq("campus_id", campusId)
    .eq("is_published", true)
    .order("sort");
  if (error) throw error;
  return (data ?? []) as CampusTour[];
}

export async function fetchTourStops(tourId: string) {
  const { data, error } = await db
    .from("campus_tour_stops")
    .select("id, sort, note, place:campus_places(*)")
    .eq("tour_id", tourId)
    .order("sort");
  if (error) throw error;
  return (data ?? []) as { id: string; sort: number; note: string | null; place: CampusPlace }[];
}

/* ------------------------------- searches -------------------------------- */

export async function recordSearch(query: string) {
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id;
  if (!uid || query.trim().length < 2) return;
  await db.from("search_history").insert({ user_id: uid, query: query.trim() });
}

export async function fetchRecentSearches(): Promise<string[]> {
  const { data } = await db
    .from("search_history")
    .select("query")
    .order("created_at", { ascending: false })
    .limit(24);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of (data ?? []) as { query: string }[]) {
    const k = r.query.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(r.query);
    }
    if (out.length >= 8) break;
  }
  return out;
}

export async function clearRecentSearches() {
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id;
  if (!uid) return;
  await db.from("search_history").delete().eq("user_id", uid);
}

export async function fetchSavedSearches() {
  const { data } = await db
    .from("saved_searches")
    .select("id, label, query")
    .order("created_at", { ascending: false });
  return (data ?? []) as { id: string; label: string; query: string }[];
}

export async function saveSearch(label: string, query: string) {
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id;
  if (!uid) throw new Error("Sign in to save searches");
  const { error } = await db.from("saved_searches").insert({ user_id: uid, label, query });
  if (error) throw error;
}

export async function deleteSavedSearch(id: string) {
  await db.from("saved_searches").delete().eq("id", id);
}

/* --------------------------- location settings --------------------------- */

export type LocationMode = "never" | "while_using" | "temporary" | "live_business";

export async function fetchLocationSettings() {
  const { data } = await db.from("location_settings").select("*").maybeSingle();
  return (data ?? null) as
    | { user_id: string; mode: LocationMode; live_business_availability: boolean; temporary_share_until: string | null }
    | null;
}

export async function saveLocationSettings(patch: {
  mode?: LocationMode;
  live_business_availability?: boolean;
  temporary_share_until?: string | null;
}) {
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id;
  if (!uid) throw new Error("Sign in required");
  const { error } = await db
    .from("location_settings")
    .upsert({ user_id: uid, ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

/* ------------------------------ home layout ------------------------------ */

export const HOME_SECTIONS = [
  { key: "right_now", label: "Right Now", locked: true },
  { key: "around_you", label: "Around You", locked: false },
  { key: "tonight", label: "Tonight", locked: false },
  { key: "opportunities", label: "Opportunities", locked: false },
  { key: "campus_updates", label: "Campus Updates", locked: false },
  { key: "your_activity", label: "Your Activity", locked: false },
] as const;

export type HomeSectionKey = (typeof HOME_SECTIONS)[number]["key"];

export async function fetchHomeLayout() {
  const { data } = await db.from("home_layout_prefs").select("*").maybeSingle();
  return (data ?? null) as { section_order: string[]; hidden_sections: string[] } | null;
}

export async function saveHomeLayout(order: string[], hidden: string[]) {
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id;
  if (!uid) throw new Error("Sign in required");
  const { error } = await db.from("home_layout_prefs").upsert(
    { user_id: uid, section_order: order, hidden_sections: hidden, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}
