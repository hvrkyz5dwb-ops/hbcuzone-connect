// Canonical sign-out flow: cancel in-flight queries, drop cache,
// clear the Supabase session, then navigate to /auth.
import type { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export async function signOutAndReset(queryClient: QueryClient): Promise<void> {
  try {
    await queryClient.cancelQueries();
  } catch {}
  queryClient.clear();
  try {
    await supabase.auth.signOut();
  } catch {}
  if (typeof window !== "undefined") {
    // Full navigation resets router + splash gating; safer than in-app nav.
    window.location.replace("/auth");
  }
}