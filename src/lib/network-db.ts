// HBCUS cross-campus network: circles, collab board, discover, connections.
// Every row here is real user-created data. Nothing is seeded.
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export const CIRCLES = [
  { slug: "fashion", name: "Fashion & clothing design", blurb: "Brands, sewing, styling, lookbooks and drops." },
  { slug: "design-media", name: "Graphic design & media", blurb: "Logos, photo, video, content and portfolios." },
  { slug: "money-markets", name: "Money & markets", blurb: "Learn investing, budgeting and spotting scams. Education only." },
  { slug: "politics", name: "Politics & organizing", blurb: "Civil discussion, campaigns and voter education." },
  { slug: "music", name: "Music & entertainment", blurb: "Producers, artists, band, DJs and live shows." },
  { slug: "tech", name: "Tech & entrepreneurship", blurb: "Code, startups, pitch nights and side hustles." },
  { slug: "careers", name: "Careers & academics", blurb: "Study groups, internships, grad school and resumes." },
  { slug: "culture", name: "Culture & campus life", blurb: "Traditions, homecoming, Greek life and campus knowledge." },
] as const;
export type CircleSlug = (typeof CIRCLES)[number]["slug"];
export const circleBySlug = (s: string) => CIRCLES.find((c) => c.slug === s);

export const CIRCLE_RULES = [
  "Be respectful. No harassment, hate speech or threats.",
  "No scams, spam, or pressure to move money off PlugU.",
  "Don't impersonate people, schools or organizations.",
  "Keep private information private — yours and others'.",
  "Label opinions as opinions. Link sources for facts.",
];

export type PublicPerson = {
  id: string;
  username: string | null;
  display_name: string | null;
  full_name: string | null;
  school_name: string | null;
  major: string | null;
  status: string | null;
  avatar_url: string | null;
  is_hbcu_student: boolean | null;
  verification_status: string | null;
  graduation_year: number | null;
};

export function personName(p?: PublicPerson | null) {
  return p?.display_name || p?.full_name || (p?.username ? `@${p.username}` : "PlugU member");
}

/** "school verified" | "alumni verified" | "unverified" — never inflated. */
export function verificationLabel(p?: PublicPerson | null): { label: string; verified: boolean } {
  if (p?.verification_status === "verified") {
    return p.status === "alumni"
      ? { label: "Alumni verified", verified: true }
      : { label: "School verified", verified: true };
  }
  return { label: "Unverified", verified: false };
}

export async function fetchPeople(ids: string[]): Promise<Map<string, PublicPerson>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map();
  const { data } = await db
    .from("public_profiles")
    .select("id,username,display_name,full_name,school_name,major,status,avatar_url,is_hbcu_student,verification_status,graduation_year")
    .in("id", unique);
  return new Map(((data ?? []) as PublicPerson[]).map((p) => [p.id, p]));
}

async function uid() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/* ------------------------------ Circles ------------------------------ */

export async function fetchMyCircles(): Promise<string[]> {
  const me = await uid();
  if (!me) return [];
  const { data, error } = await db.from("circle_memberships").select("circle").eq("user_id", me);
  if (error) throw error;
  return (data ?? []).map((r: any) => r.circle);
}

export async function fetchCircleMemberCounts(): Promise<Record<string, number>> {
  const { data } = await db.from("circle_memberships").select("circle");
  const out: Record<string, number> = {};
  for (const r of data ?? []) out[r.circle] = (out[r.circle] ?? 0) + 1;
  return out;
}

export async function fetchCircleMembers(circle: string): Promise<string[]> {
  const { data, error } = await db.from("circle_memberships").select("user_id").eq("circle", circle).limit(200);
  if (error) throw error;
  return (data ?? []).map((r: any) => r.user_id);
}

export async function setCircleMembership(circle: string, join: boolean) {
  const me = await uid();
  if (!me) throw new Error("Sign in required");
  const q = join
    ? db.from("circle_memberships").upsert({ user_id: me, circle }, { onConflict: "user_id,circle" })
    : db.from("circle_memberships").delete().eq("user_id", me).eq("circle", circle);
  const { error } = await q;
  if (error) throw error;
}

export type CirclePost = {
  id: string;
  circle: string;
  author_id: string;
  kind: "discussion" | "project" | "resource";
  title: string;
  body: string;
  link_url: string | null;
  school_name: string | null;
  created_at: string;
};

export async function fetchCirclePosts(circle: string): Promise<CirclePost[]> {
  const { data, error } = await db
    .from("circle_posts")
    .select("*")
    .eq("circle", circle)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createCirclePost(input: {
  circle: string; kind: CirclePost["kind"]; title: string; body: string; link_url?: string | null; school_name?: string | null;
}) {
  const me = await uid();
  if (!me) throw new Error("Sign in required");
  const { error } = await db.from("circle_posts").insert({ ...input, author_id: me, link_url: input.link_url || null });
  if (error) throw error;
}

export async function deleteCirclePost(id: string) {
  const { error } = await db.from("circle_posts").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------- Collab board ---------------------------- */

export const COMPENSATION = {
  paid: "Paid",
  stipend: "Stipend",
  revenue_share: "Revenue share",
  negotiable: "Negotiable",
  unpaid: "Unpaid / volunteer",
} as const;
export const MODES = { remote: "Remote", in_person: "In person", hybrid: "Hybrid" } as const;

export type CollabRequest = {
  id: string;
  author_id: string;
  circle: string | null;
  title: string;
  description: string;
  skills: string[];
  location: string | null;
  mode: keyof typeof MODES;
  timeline: string | null;
  compensation: keyof typeof COMPENSATION;
  compensation_note: string | null;
  status: "open" | "closed";
  created_at: string;
};

export async function fetchCollabRequests(opts: { includeClosed?: boolean; authorId?: string } = {}): Promise<CollabRequest[]> {
  let q = db.from("collab_requests").select("*").order("created_at", { ascending: false }).limit(100);
  if (!opts.includeClosed) q = q.eq("status", "open");
  if (opts.authorId) q = q.eq("author_id", opts.authorId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createCollabRequest(input: Omit<CollabRequest, "id" | "author_id" | "status" | "created_at">) {
  const me = await uid();
  if (!me) throw new Error("Sign in required");
  const { error } = await db.from("collab_requests").insert({ ...input, author_id: me });
  if (error) throw error;
}

export async function setCollabStatus(id: string, status: "open" | "closed") {
  const { error } = await db.from("collab_requests").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function respondToCollab(requestId: string, message: string) {
  const me = await uid();
  if (!me) throw new Error("Sign in required");
  const { error } = await db.from("collab_responses").insert({ request_id: requestId, responder_id: me, message });
  if (error) {
    if (error.code === "23505") throw new Error("You already responded to this request.");
    throw error;
  }
}

export async function fetchMyResponses(): Promise<string[]> {
  const me = await uid();
  if (!me) return [];
  const { data } = await db.from("collab_responses").select("request_id").eq("responder_id", me);
  return (data ?? []).map((r: any) => r.request_id);
}

export async function fetchResponsesFor(requestId: string) {
  const { data, error } = await db
    .from("collab_responses")
    .select("id,responder_id,message,created_at")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as { id: string; responder_id: string; message: string; created_at: string }[];
}

/* --------------------------- Network profile --------------------------- */

export type NetworkProfile = {
  user_id: string;
  interests: string[];
  skills: string[];
  portfolio_url: string | null;
  goals: string | null;
  is_discoverable: boolean;
  show_major: boolean;
};

export async function fetchMyNetworkProfile(): Promise<NetworkProfile | null> {
  const me = await uid();
  if (!me) return null;
  const { data } = await db.from("network_profiles").select("*").eq("user_id", me).maybeSingle();
  return data ?? null;
}

export async function saveNetworkProfile(p: Omit<NetworkProfile, "user_id">) {
  const me = await uid();
  if (!me) throw new Error("Sign in required");
  const { error } = await db
    .from("network_profiles")
    .upsert({ ...p, user_id: me, portfolio_url: p.portfolio_url || null }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function fetchDiscoverable(): Promise<NetworkProfile[]> {
  const { data, error } = await db
    .from("network_profiles")
    .select("*")
    .eq("is_discoverable", true)
    .order("updated_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

/* ----------------------------- Connections ----------------------------- */

export type Connection = {
  id: string; requester_id: string; addressee_id: string; status: "pending" | "accepted" | "declined"; created_at: string;
};

export async function fetchMyConnections(): Promise<Connection[]> {
  const me = await uid();
  if (!me) return [];
  const { data, error } = await db
    .from("connections")
    .select("*")
    .or(`requester_id.eq.${me},addressee_id.eq.${me}`);
  if (error) throw error;
  return data ?? [];
}

export async function requestConnection(otherId: string) {
  const me = await uid();
  if (!me) throw new Error("Sign in required");
  const { error } = await db.from("connections").insert({ requester_id: me, addressee_id: otherId });
  if (error) {
    if (error.code === "23505") throw new Error("Request already sent.");
    throw error;
  }
}

export async function respondConnection(id: string, status: "accepted" | "declined") {
  const { error } = await db.from("connections").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function removeConnection(id: string) {
  const { error } = await db.from("connections").delete().eq("id", id);
  if (error) throw error;
}
