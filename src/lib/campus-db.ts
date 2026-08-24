// Campus Hub data layer — real Supabase reads/writes for campus events,
// RSVPs, comments, recaps and student organizations.
import { supabase } from "@/integrations/supabase/client";
import { screenBeforePublish } from "@/lib/screen";

export type EventCategory =
  | "free_food" | "party" | "greek" | "business" | "sports" | "service"
  | "career" | "study" | "networking" | "performance" | "volunteer" | "community";

export const EVENT_CATEGORIES: { key: EventCategory; label: string; color: string }[] = [
  { key: "free_food", label: "Free Food", color: "#22c55e" },
  { key: "party", label: "Parties", color: "#ef4444" },
  { key: "greek", label: "Greek Life", color: "#3b82f6" },
  { key: "business", label: "Business", color: "#eab308" },
  { key: "sports", label: "Sports", color: "#a855f7" },
  { key: "service", label: "Community Service", color: "#e5e7eb" },
  { key: "career", label: "Career Fairs", color: "#f59e0b" },
  { key: "study", label: "Study Groups", color: "#38bdf8" },
  { key: "networking", label: "Networking", color: "#14b8a6" },
  { key: "performance", label: "Live Performances", color: "#fb7185" },
  { key: "volunteer", label: "Volunteer", color: "#94a3b8" },
  { key: "community", label: "Community", color: "#d4af37" },
];

export function categoryMeta(key: string) {
  return EVENT_CATEGORIES.find((c) => c.key === key) ?? EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1];
}

export type CampusEvent = {
  id: string;
  creator_user_id: string;
  school_id: string | null;
  org_id: string | null;
  title: string;
  description: string | null;
  cover_url: string | null;
  category: string;
  location: string;
  lat: number | null;
  lng: number | null;
  starts_at: string;
  ends_at: string | null;
  host_name: string | null;
  contact_info: string | null;
  status: string;
  rsvp_count: number;
  is_featured: boolean;
  boost_tier: number;
  created_at: string;
};

export type EventInput = {
  title: string;
  description?: string;
  cover_url?: string | null;
  category: EventCategory;
  location: string;
  starts_at: string;
  ends_at?: string | null;
  host_name?: string | null;
  contact_info?: string | null;
  school_id?: string | null;
};

const SELECT = "*";

export async function fetchEvents(opts: { schoolId?: string | null; limit?: number } = {}) {
  let q = supabase
    .from("campus_events")
    .select(SELECT)
    .eq("status", "active")
    .gte("starts_at", new Date(Date.now() - 12 * 3600_000).toISOString())
    .order("is_featured", { ascending: false })
    .order("starts_at", { ascending: true })
    .limit(opts.limit ?? 60);
  if (opts.schoolId) q = q.eq("school_id", opts.schoolId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as CampusEvent[];
}

export async function fetchMyEvents(userId: string) {
  const { data, error } = await supabase
    .from("campus_events")
    .select(SELECT)
    .eq("creator_user_id", userId)
    .order("starts_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CampusEvent[];
}

export async function createEvent(input: EventInput, userId: string) {
  await screenBeforePublish("event", `${input.title ?? ""}\n${input.description ?? ""}`);
  const { data, error } = await supabase
    .from("campus_events")
    .insert({ ...input, creator_user_id: userId })
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as CampusEvent;
}

export async function updateEvent(id: string, patch: Partial<EventInput> & { status?: string }) {
  const { error } = await supabase.from("campus_events").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("campus_events").delete().eq("id", id);
  if (error) throw error;
}

// ---- RSVPs ----
export async function fetchMyRsvps(userId: string) {
  const { data, error } = await supabase.from("event_rsvps").select("event_id").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.event_id as string);
}

export async function addRsvp(eventId: string, userId: string) {
  // upsert keeps RSVPs idempotent — no duplicates on double taps.
  const { error } = await supabase
    .from("event_rsvps")
    .upsert({ event_id: eventId, user_id: userId }, { onConflict: "event_id,user_id", ignoreDuplicates: true });
  if (error) throw error;
}

export async function removeRsvp(eventId: string, userId: string) {
  const { error } = await supabase.from("event_rsvps").delete().eq("event_id", eventId).eq("user_id", userId);
  if (error) throw error;
}

// ---- Comments ----
export type EventComment = { id: string; event_id: string; user_id: string; body: string; created_at: string };

export async function fetchComments(eventId: string) {
  const { data, error } = await supabase
    .from("event_comments").select("*").eq("event_id", eventId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as EventComment[];
}

export async function addComment(eventId: string, userId: string, body: string) {
  await screenBeforePublish("comment", body, eventId);
  const { error } = await supabase.from("event_comments").insert({ event_id: eventId, user_id: userId, body });
  if (error) throw error;
}

// ---- Organizations ----
export type StudentOrg = {
  id: string; owner_user_id: string; school_id: string | null; name: string; slug: string;
  category: string; bio: string | null; avatar_url: string | null; contact_email: string | null;
  instagram: string | null; is_verified: boolean; follower_count: number;
};

export async function fetchOrgs(schoolId?: string | null) {
  let q = supabase.from("student_orgs").select("*").order("follower_count", { ascending: false }).limit(50);
  if (schoolId) q = q.eq("school_id", schoolId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as StudentOrg[];
}

export async function fetchMyFollows(userId: string) {
  const { data, error } = await supabase.from("org_follows").select("org_id").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.org_id as string);
}

export async function followOrg(orgId: string, userId: string) {
  const { error } = await supabase
    .from("org_follows").upsert({ org_id: orgId, user_id: userId }, { onConflict: "org_id,user_id", ignoreDuplicates: true });
  if (error) throw error;
}

export async function unfollowOrg(orgId: string, userId: string) {
  const { error } = await supabase.from("org_follows").delete().eq("org_id", orgId).eq("user_id", userId);
  if (error) throw error;
}

// ---- Time buckets ----
export function bucketOf(ev: CampusEvent): "now" | "today" | "tomorrow" | "week" | "later" {
  const start = new Date(ev.starts_at).getTime();
  const end = ev.ends_at ? new Date(ev.ends_at).getTime() : start + 2 * 3600_000;
  const now = Date.now();
  if (start <= now && end >= now) return "now";
  const d = new Date();
  const endToday = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).getTime();
  if (start <= endToday) return "today";
  if (start <= endToday + 86_400_000) return "tomorrow";
  if (start <= endToday + 7 * 86_400_000) return "week";
  return "later";
}

export function calendarUrl(ev: CampusEvent) {
  const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "");
  const start = fmt(ev.starts_at);
  const end = fmt(ev.ends_at ?? new Date(new Date(ev.starts_at).getTime() + 2 * 3600_000).toISOString());
  const p = new URLSearchParams({
    action: "TEMPLATE", text: ev.title, dates: `${start}/${end}`,
    details: ev.description ?? "", location: ev.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
