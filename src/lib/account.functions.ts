import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Permanently delete the signed-in account. The caller is identified from the
 * verified bearer token only — never from request data. Every table that
 * references auth.users cascades on delete, so removing the auth user removes
 * the profile, listings, messages, reviews, favorites and notifications.
 * Financial/safety records (orders, disputes, reports) are retained in
 * de-identified form where the law requires it.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // Best-effort scrub of free-text the user authored before the cascade.
    try {
      await supabaseAdmin
        .from("profiles")
        .update({ bio: null, avatar_url: null, display_name: "Deleted user", username: null })
        .eq("id", userId);
    } catch {}

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      // No user data in the log line.
      console.error("account deletion failed", error.message);
      throw new Error("We couldn't complete the deletion. Please try again.");
    }
    return { deleted: true } as const;
  });
