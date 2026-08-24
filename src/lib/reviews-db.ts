import { supabase } from "@/integrations/supabase/client";
import { assertContentAllowed } from "@/lib/content-filter";

export type VerifiedReview = {
  id: string;
  order_id: string;
  reviewer_user_id: string;
  subject_user_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  order_kind: "product" | "service";
  listing_id: string | null;
  verification_kind: "verified_purchase" | "verified_booking";
};

export async function fetchReviewsForUser(userId: string): Promise<VerifiedReview[]> {
  const { data, error } = await supabase
    .from("reviews_verified")
    .select("*")
    .eq("subject_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as VerifiedReview[];
}

export async function fetchReviewForOrder(orderId: string, reviewerId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, body")
    .eq("order_id", orderId)
    .eq("reviewer_user_id", reviewerId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitReview(input: {
  orderId: string;
  subjectUserId: string;
  rating: number;
  body: string;
}) {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user.id;
  if (!uid) throw new Error("Sign in to leave a review");
  const rating = Math.max(1, Math.min(5, Math.round(input.rating)));
  const body = (input.body ?? "").trim().slice(0, 1000);
  assertContentAllowed(body);
  const { data, error } = await supabase
    .from("reviews")
    .upsert(
      {
        order_id: input.orderId,
        reviewer_user_id: uid,
        subject_user_id: input.subjectUserId,
        rating,
        body: body || null,
      },
      { onConflict: "order_id,reviewer_user_id" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function reportReview(reviewId: string, reason: string) {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user.id;
  if (!uid) throw new Error("Sign in to report");
  const { error } = await supabase.from("reports").insert({
    reporter_user_id: uid,
    target_type: "review",
    target_id: reviewId,
    reason: reason.trim().slice(0, 500) || "Review flagged",
    status: "open",
  });
  if (error) throw error;
}

export async function adminDeleteReview(reviewId: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) throw error;
}