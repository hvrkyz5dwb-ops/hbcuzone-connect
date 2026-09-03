import { supabase } from "@/integrations/supabase/client";
import { hideContent } from "@/lib/ugc-safety";

export type ReportTargetType =
  | "user" | "listing" | "message" | "review" | "order" | "business"
  | "event" | "post" | "comment" | "image" | "opportunity" | "local_business";

// Reason set required by App Review.
export const REPORT_REASONS = [
  { key: "harassment", label: "Harassment or bullying" },
  { key: "hate_speech", label: "Hate speech" },
  { key: "sexual", label: "Sexual or inappropriate content" },
  { key: "violence", label: "Violence or threats" },
  { key: "drugs", label: "Drugs or illegal activity" },
  { key: "scam_fraud", label: "Scam or fraud" },
  { key: "prohibited_item", label: "Prohibited item" },
  { key: "impersonation", label: "Impersonation or fake account" },
  { key: "privacy", label: "Private information" },
  { key: "spam", label: "Spam" },
  { key: "other", label: "Other" },
] as const;


export type ReportReason = (typeof REPORT_REASONS)[number]["key"];

export const PROHIBITED_ITEMS = [
  "Illegal drugs",
  "Drug distribution",
  "Weapons",
  "Stolen property",
  "Fake identification",
  "Academic cheating",
  "Counterfeit goods",
  "Sexual services",
  "Harassment",
  "Threats",
  "Fraudulent events",
  "Any illegal product or service",
] as const;

export class DuplicateReportError extends Error {
  constructor() {
    super("You already reported this. Our safety team is reviewing it.");
    this.name = "DuplicateReportError";
  }
}

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function hasReported(targetType: ReportTargetType, targetId: string) {
  const uid = await currentUserId();
  if (!uid) return false;
  const { data } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_user_id", uid)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();
  return !!data;
}

export async function submitReport(input: {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
  reportedUserId?: string | null;
  /** Copy of the reported content, stored so moderators can act even if it is edited or deleted. */
  snapshot?: string | null;
}) {
  const uid = await currentUserId();
  if (!uid) throw new Error("Sign in to report");
  const label = REPORT_REASONS.find((r) => r.key === input.reason)?.label ?? input.reason;
  const details = (input.details ?? "").trim().slice(0, 800);
  const reason = [label, details].filter(Boolean).join(" — ").slice(0, 1000);
  const snapshot = (input.snapshot ?? "").trim().slice(0, 4000) || null;

  const { error } = await (supabase as any).from("reports").insert({
    reporter_user_id: uid,
    reported_user_id: input.reportedUserId ?? null,
    target_type: input.targetType,
    target_id: input.targetId,
    reason,
    reason_code: input.reason,
    details: details || null,
    content_snapshot: snapshot,
    status: "open",
  });

  if (error) {
    if ((error as { code?: string }).code === "23505") {
      // Let the student add new information to the report they already filed.
      await (supabase as any)
        .from("reports")
        .update({ reason, details: details || null, content_snapshot: snapshot })
        .eq("reporter_user_id", uid)
        .eq("target_type", input.targetType)
        .eq("target_id", input.targetId);
      hideContent(input.targetType, input.targetId);
      throw new DuplicateReportError();
    }
    throw error;
  }

  // Hide the reported content from the reporter immediately.
  hideContent(input.targetType, input.targetId);
}


export async function blockUser(otherUserId: string) {
  const uid = await currentUserId();
  if (!uid) throw new Error("Sign in to block");
  if (uid === otherUserId) throw new Error("You can't block yourself");
  const { error } = await supabase
    .from("blocked_users")
    .upsert(
      { blocker_user_id: uid, blocked_user_id: otherUserId },
      { onConflict: "blocker_user_id,blocked_user_id" },
    );
  if (error) throw error;
}

export async function unblockUser(otherUserId: string) {
  const uid = await currentUserId();
  if (!uid) throw new Error("Sign in required");
  const { error } = await supabase
    .from("blocked_users")
    .delete()
    .eq("blocker_user_id", uid)
    .eq("blocked_user_id", otherUserId);
  if (error) throw error;
}

export type BlockedUser = {
  user_id: string;
  created_at: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export async function fetchBlockedUserIds(): Promise<string[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data, error } = await supabase
    .from("blocked_users")
    .select("blocked_user_id")
    .eq("blocker_user_id", uid);
  if (error) return [];
  return (data ?? []).map((r) => r.blocked_user_id as string);
}

export async function fetchBlockedUsers(): Promise<BlockedUser[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data, error } = await supabase
    .from("blocked_users")
    .select("blocked_user_id, created_at")
    .eq("blocker_user_id", uid)
    .order("created_at", { ascending: false });
  if (error || !data?.length) return [];
  const ids = data.map((r) => r.blocked_user_id as string);
  // `profiles` is self-read only under RLS; the public view is the readable
  // source for someone else's display name.
  const { data: profiles } = await supabase
    .from("public_profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", ids);
  const byId = new Map((profiles ?? []).map((p: any) => [p.id, p]));
  return data.map((r) => {
    const p = byId.get(r.blocked_user_id as string) as any;
    return {
      user_id: r.blocked_user_id as string,
      created_at: r.created_at as string,
      username: p?.username ?? null,
      display_name: p?.display_name ?? null,
      avatar_url: p?.avatar_url ?? null,
    };
  });
}

export type AdminAction =
  | "listing.approve" | "listing.reject" | "listing.remove"
  | "user.suspend" | "user.restore"
  | "report.review" | "report.resolve" | "report.dismiss"
  | "dispute.resolve" | "dispute.reject"
  | "review.remove";

export async function adminPerform(input: {
  action: AdminAction;
  targetType: string;
  targetId: string;
  note?: string;
}) {
  const { error } = await supabase.rpc("admin_perform", {
    _action: input.action,
    _target_type: input.targetType,
    _target_id: input.targetId,
    _note: input.note ?? "",
  });
  if (error) throw error;
}
