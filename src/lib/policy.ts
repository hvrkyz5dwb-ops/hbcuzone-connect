// Policy acceptance ledger. Apple 1.2 / 3.1 requires an explicit, recorded
// agreement to the Terms of Use, Privacy Policy and Community Guidelines
// before an account can be used.
import { supabase } from "@/integrations/supabase/client";

export const POLICY_VERSION = "2026-01-plugu-v1";

export const POLICY_CONSENT_TEXT =
  "I agree to PlugU's Terms of Use, Privacy Policy, and Community Guidelines. I understand that prohibited or abusive content may be removed and accounts may be suspended.";

export async function recordPolicyAcceptance(userId?: string) {
  let uid = userId;
  if (!uid) {
    const { data } = await supabase.auth.getSession();
    uid = data.session?.user.id;
  }
  if (!uid) throw new Error("Sign in required");
  const { error } = await (supabase as any)
    .from("policy_acceptances")
    .upsert(
      {
        user_id: uid,
        policy_version: POLICY_VERSION,
        terms_url: typeof window !== "undefined" ? `${window.location.origin}/terms` : null,
      },
      { onConflict: "user_id,policy_version" },
    );
  if (error) throw error;
  await supabase
    .from("profiles")
    .update({ terms_accepted_at: new Date().toISOString() })
    .eq("id", uid);
}

export async function hasAcceptedCurrentPolicy(userId: string): Promise<boolean> {
  const { data, error } = await (supabase as any)
    .from("policy_acceptances")
    .select("user_id")
    .eq("user_id", userId)
    .eq("policy_version", POLICY_VERSION)
    .maybeSingle();
  if (error) return true; // never lock a student out on a transient read error
  return !!data;
}
