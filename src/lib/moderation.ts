import { supabase } from "@/integrations/supabase/client";

export type ReportTargetType = "user" | "listing" | "message" | "review" | "order" | "business";

export const REPORT_REASONS = [
  { key: "scam_fraud", label: "Scam or fraud" },
  { key: "harassment", label: "Harassment" },
  { key: "prohibited_item", label: "Prohibited item" },
  { key: "inappropriate", label: "Inappropriate content" },
  { key: "fake_account", label: "Fake account" },
  { key: "unsafe", label: "Unsafe behavior" },
  { key: "non_delivery", label: "Non-delivery" },
  { key: "wrong_item", label: "Incorrect item or service" },
  { key: "payment", label: "Payment issue" },
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

export async function submitReport(input: {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
}) {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user.id;
  if (!uid) throw new Error("Sign in to report");
  const label = REPORT_REASONS.find((r) => r.key === input.reason)?.label ?? input.reason;
  const reason = [label, (input.details ?? "").trim()].filter(Boolean).join(" — ").slice(0, 1000);
  const { error } = await supabase.from("reports").insert({
    reporter_user_id: uid,
    target_type: input.targetType,
    target_id: input.targetId,
    reason,
    status: "open",
  });
  if (error) throw error;
}

export async function blockUser(otherUserId: string) {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user.id;
  if (!uid) throw new Error("Sign in to block");
  if (uid === otherUserId) throw new Error("You can't block yourself");
  const { error } = await supabase
    .from("blocked_users")
    .upsert({ blocker_user_id: uid, blocked_user_id: otherUserId }, { onConflict: "blocker_user_id,blocked_user_id" });
  if (error) throw error;
}

export async function unblockUser(otherUserId: string) {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user.id;
  if (!uid) throw new Error("Sign in required");
  const { error } = await supabase
    .from("blocked_users")
    .delete()
    .eq("blocker_user_id", uid)
    .eq("blocked_user_id", otherUserId);
  if (error) throw error;
}

export type AdminAction =
  | "listing.approve" | "listing.reject" | "listing.remove"
  | "user.suspend" | "user.restore"
  | "report.resolve" | "report.dismiss"
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
    _note: input.note ?? null,
  });
  if (error) throw error;
}