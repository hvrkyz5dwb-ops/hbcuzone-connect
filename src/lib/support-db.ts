import { supabase } from "@/integrations/supabase/client";

export const SUPPORT_CATEGORIES = [
  { key: "general", label: "General question" },
  { key: "bug", label: "Bug or broken feature" },
  { key: "account", label: "Account or verification" },
  { key: "payments", label: "Payments or payouts" },
  { key: "safety", label: "Safety concern" },
  { key: "report_problem", label: "Report a problem" },
  { key: "delete_account", label: "Delete my account" },
  { key: "other", label: "Other" },
] as const;

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number]["key"];

export type SupportRequest = {
  id: string;
  user_id: string;
  category: SupportCategory;
  subject: string;
  description: string;
  related_order_id: string | null;
  related_listing_id: string | null;
  status: "open" | "in_progress" | "resolved" | "closed";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export async function submitSupportRequest(input: {
  category: SupportCategory;
  subject: string;
  description: string;
  relatedOrderId?: string | null;
  relatedListingId?: string | null;
}): Promise<SupportRequest> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user.id;
  if (!uid) throw new Error("Sign in to contact support");
  const subject = input.subject.trim().slice(0, 200);
  const description = input.description.trim().slice(0, 5000);
  if (!subject) throw new Error("Please add a subject");
  if (!description) throw new Error("Please describe the issue");
  const payload = {
    user_id: uid,
    category: input.category,
    subject,
    description,
    related_order_id: input.relatedOrderId?.trim() || null,
    related_listing_id: input.relatedListingId?.trim() || null,
    status: "open" as const,
  };
  const { data, error } = await (supabase as any)
    .from("support_requests")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as SupportRequest;
}

export async function fetchMySupportRequests(): Promise<SupportRequest[]> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user.id;
  if (!uid) return [];
  const { data, error } = await (supabase as any)
    .from("support_requests")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as SupportRequest[];
}