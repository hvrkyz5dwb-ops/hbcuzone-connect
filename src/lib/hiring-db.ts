// "Hire a Student Plug" — local businesses ↔ student data access.
// Every read/write goes through RLS; contact details of students are never
// selected here (businesses reach students through PlugU messaging only).
import { supabase } from "@/integrations/supabase/client";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type LocalBusiness = {
  id: string;
  owner_user_id: string;
  name: string;
  rep_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  website: string | null;
  services_needed: string[];
  description: string | null;
  school_id: string | null;
  campus_name: string | null;
  verification_status: VerificationStatus;
  verification_note: string | null;
  created_at: string;
  updated_at: string;
};

export type Opportunity = {
  id: string;
  business_id: string;
  owner_user_id: string;
  school_id: string | null;
  title: string;
  category: string;
  description: string;
  compensation: string;
  location: string;
  is_remote: boolean;
  deadline: string | null;
  required_skills: string[];
  status: "open" | "paused" | "filled" | "closed";
  moderation_status: string;
  applicant_count: number;
  created_at: string;
};

export type OpportunityWithBusiness = Opportunity & {
  business: Pick<LocalBusiness, "id" | "name" | "campus_name" | "verification_status"> | null;
};

export type Application = {
  id: string;
  opportunity_id: string;
  student_user_id: string;
  business_user_id: string;
  message: string | null;
  status: "applied" | "shortlisted" | "declined" | "hired" | "withdrawn";
  created_at: string;
};

export const OPPORTUNITY_CATEGORIES = [
  "Flyering & promo",
  "Social media & content",
  "Photography & video",
  "Graphic design",
  "Event staffing",
  "Catering & food service",
  "Delivery & driving",
  "Tutoring & training",
  "Retail & front desk",
  "Cleaning & setup",
  "Hair, nails & beauty",
  "Music & DJ",
  "Tech & web help",
  "Warehouse & moving",
  "Other",
] as const;

export const BUSINESS_DISCLAIMER =
  "PlugU is an introduction platform, not an employer or staffing agency. We do not guarantee employment, income, or the accuracy of any claim made in a posting. Never pay to apply, never share bank or Social Security details, and meet in a safe public place.";

async function uid() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/* ───────────────── Local business profile ───────────────── */

export async function fetchMyLocalBusiness(): Promise<LocalBusiness | null> {
  const me = await uid();
  if (!me) return null;
  const { data, error } = await supabase
    .from("local_businesses")
    .select("*")
    .eq("owner_user_id", me)
    .maybeSingle();
  if (error) throw error;
  return (data as LocalBusiness | null) ?? null;
}

export type BusinessInput = {
  name: string;
  rep_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  website: string | null;
  services_needed: string[];
  description: string | null;
  campus_name: string | null;
};

export async function saveLocalBusiness(input: BusinessInput): Promise<LocalBusiness> {
  const me = await uid();
  if (!me) throw new Error("Sign in first.");
  const existing = await fetchMyLocalBusiness();
  if (existing) {
    const { data, error } = await supabase
      .from("local_businesses")
      .update(input)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data as LocalBusiness;
  }
  const { data, error } = await supabase
    .from("local_businesses")
    .insert({ ...input, owner_user_id: me, verification_status: "pending" })
    .select("*")
    .single();
  if (error) throw error;
  return data as LocalBusiness;
}

/* ───────────────── Opportunities ───────────────── */

export type OpportunityFilters = {
  q?: string;
  category?: string;
  remote?: "any" | "remote" | "in-person";
};

type PublicBusiness = Pick<LocalBusiness, "id" | "name" | "campus_name" | "verification_status">;

/** Business rows carry contact details that are owner/admin-only, so public
 *  surfaces read a safe projection through a signed-in-only RPC. */
async function fetchPublicBusinesses(ids: string[]): Promise<Map<string, PublicBusiness>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return new Map();
  const { data, error } = await supabase.rpc("get_public_local_businesses", { _ids: unique });
  if (error) return new Map();
  return new Map(((data ?? []) as any[]).map((b) => [b.id as string, b as PublicBusiness]));
}

export async function fetchOpportunities(
  f: OpportunityFilters = {},
): Promise<OpportunityWithBusiness[]> {
  let query = supabase
    .from("opportunities")
    .select("*")
    .eq("status", "open")
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false })
    .limit(120);

  if (f.category && f.category !== "All") query = query.eq("category", f.category);
  if (f.remote === "remote") query = query.eq("is_remote", true);
  if (f.remote === "in-person") query = query.eq("is_remote", false);
  if (f.q?.trim()) {
    const term = `%${f.q.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term},compensation.ilike.${term}`);
  }
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as any[];
  const byId = await fetchPublicBusinesses(rows.map((r) => r.business_id));
  return rows.map((r) => ({
    ...r,
    business: byId.get(r.business_id) ?? null,
  })) as unknown as OpportunityWithBusiness[];
}

export async function fetchOpportunity(id: string): Promise<OpportunityWithBusiness | null> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const byId = await fetchPublicBusinesses([(data as any).business_id]);
  return {
    ...(data as any),
    business: byId.get((data as any).business_id) ?? null,
  } as unknown as OpportunityWithBusiness;
}


export async function fetchMyOpportunities(): Promise<Opportunity[]> {
  const me = await uid();
  if (!me) return [];
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("owner_user_id", me)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Opportunity[];
}

export type OpportunityInput = {
  title: string;
  category: string;
  description: string;
  compensation: string;
  location: string;
  is_remote: boolean;
  deadline: string | null;
  required_skills: string[];
};

export async function createOpportunity(
  biz: LocalBusiness,
  input: OpportunityInput,
): Promise<Opportunity> {
  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      ...input,
      business_id: biz.id,
      owner_user_id: biz.owner_user_id,
      school_id: biz.school_id,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Opportunity;
}

export async function setOpportunityStatus(id: string, status: Opportunity["status"]) {
  const { error } = await supabase.from("opportunities").update({ status }).eq("id", id);
  if (error) throw error;
}

/* ───────────────── Applications ───────────────── */

export async function applyToOpportunity(opp: Opportunity, message: string) {
  const me = await uid();
  if (!me) throw new Error("Sign in first.");
  const { error } = await supabase.from("opportunity_applications").insert({
    opportunity_id: opp.id,
    student_user_id: me,
    business_user_id: opp.owner_user_id,
    message: message.trim() || null,
  });
  if (error) {
    if (error.code === "23505") throw new Error("You already applied to this opportunity.");
    throw error;
  }
}

export async function fetchMyApplications(): Promise<
  (Application & { opportunity: OpportunityWithBusiness | null })[]
> {
  const me = await uid();
  if (!me) return [];
  const { data, error } = await supabase
    .from("opportunity_applications")
    .select("*, opportunity:opportunities(*)")
    .eq("student_user_id", me)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as any[];
  const byId = await fetchPublicBusinesses(
    rows.map((r) => r.opportunity?.business_id).filter(Boolean),
  );
  return rows.map((r) => ({
    ...r,
    opportunity: r.opportunity
      ? { ...r.opportunity, business: byId.get(r.opportunity.business_id) ?? null }
      : null,
  })) as any;

}

export type Applicant = Application & {
  profile: {
    id: string;
    username: string | null;
    display_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
    school_name: string | null;
    major: string | null;
    rating_avg: number;
    rating_count: number;
    verification_status: string;
  } | null;
};

export async function fetchApplicants(opportunityId?: string): Promise<Applicant[]> {
  const me = await uid();
  if (!me) return [];
  let q = supabase
    .from("opportunity_applications")
    .select("*")
    .eq("business_user_id", me)
    .order("created_at", { ascending: false });
  if (opportunityId) q = q.eq("opportunity_id", opportunityId);
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as Application[];
  if (rows.length === 0) return [];
  // profiles are fetched separately: the FK points at auth.users, so PostgREST
  // cannot embed the profile row through the application table.
  const ids = Array.from(new Set(rows.map((r) => r.student_user_id)));
  const { data: profs } = await supabase
    .from("public_profiles")
    .select("id,username,display_name,full_name,avatar_url,school_name,major,rating_avg,rating_count,verification_status")
    .in("id", ids);
  const byId = new Map((profs ?? []).map((p: any) => [p.id, p]));
  return rows.map((r) => ({ ...r, profile: byId.get(r.student_user_id) ?? null })) as Applicant[];
}

export async function setApplicationStatus(id: string, status: Application["status"]) {
  const { error } = await supabase
    .from("opportunity_applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/* ───────────────── Saves ───────────────── */

export async function fetchSavedOpportunityIds(): Promise<string[]> {
  const me = await uid();
  if (!me) return [];
  const { data, error } = await supabase
    .from("opportunity_saves")
    .select("opportunity_id")
    .eq("user_id", me);
  if (error) throw error;
  return (data ?? []).map((r) => r.opportunity_id as string);
}

export async function toggleSaveOpportunity(id: string, saved: boolean) {
  const me = await uid();
  if (!me) throw new Error("Sign in first.");
  if (saved) {
    const { error } = await supabase
      .from("opportunity_saves")
      .delete()
      .eq("user_id", me)
      .eq("opportunity_id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("opportunity_saves")
      .insert({ user_id: me, opportunity_id: id });
    if (error) throw error;
  }
}

/* ───────────────── Student Plug directory (business-facing) ───────────────── */

export type StudentPlug = {
  id: string;
  username: string | null;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  school_name: string | null;
  major: string | null;
  bio: string | null;
  open_to_work_note: string | null;
  rating_avg: number;
  rating_count: number;
  completed_transactions: number;
  verification_status: string;
};

export async function searchStudentPlugs(opts: {
  q?: string;
  school?: string;
  minRating?: number;
}): Promise<StudentPlug[]> {
  let query = supabase
    .from("public_profiles")
    .select(
      "id,username,display_name,full_name,avatar_url,school_name,major,bio,open_to_work_note,rating_avg,rating_count,completed_transactions,verification_status",
    )
    .eq("open_to_work", true)
    .eq("account_type", "student")
    
    .order("rating_avg", { ascending: false })
    .limit(60);
  if (opts.school?.trim()) query = query.ilike("school_name", `%${opts.school.trim()}%`);
  if (opts.minRating) query = query.gte("rating_avg", opts.minRating);
  if (opts.q?.trim()) {
    const t = `%${opts.q.trim()}%`;
    query = query.or(`display_name.ilike.${t},full_name.ilike.${t},major.ilike.${t},bio.ilike.${t},open_to_work_note.ilike.${t}`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as StudentPlug[];
}

/* ───────────────── Open to work toggle ───────────────── */

export async function setOpenToWork(open: boolean, note: string | null) {
  const me = await uid();
  if (!me) throw new Error("Sign in first.");
  const { error } = await supabase
    .from("profiles")
    .update({ open_to_work: open, open_to_work_note: note })
    .eq("id", me);
  if (error) throw error;
}

/* ───────────────── Admin ───────────────── */

export async function adminListBusinesses(status: VerificationStatus): Promise<LocalBusiness[]> {
  const { data, error } = await supabase
    .from("local_businesses")
    .select("*")
    .eq("verification_status", status)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as LocalBusiness[];
}

export async function adminSetBusinessStatus(
  id: string,
  status: VerificationStatus,
  note?: string,
) {
  const { error } = await supabase
    .from("local_businesses")
    .update({
      verification_status: status,
      verification_note: note ?? null,
      verified_at: status === "verified" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw error;
}
