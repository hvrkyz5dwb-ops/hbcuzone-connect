// Subscribes to Supabase auth state and exposes the current session.
// Single source of truth for "is the user signed in?".
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type SessionState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

/**
 * A stored session the auth server rejects (revoked, rotated, expired past
 * the refresh window, or written by an older build) would otherwise wedge the
 * app on a permanent "signing in…" state — the App Review 2.1(a) trap. Purge
 * it locally so the very next render lands on the public entry flow.
 */
async function clearBrokenSession(reason: string): Promise<void> {
  console.warn(`[PlugU:auth] clearing invalid stored session — ${reason}`);
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {}
  try {
    const ls = window.localStorage;
    for (let i = ls.length - 1; i >= 0; i--) {
      const key = ls.key(i);
      if (key && (key.startsWith("sb-") || key.startsWith("supabase.auth"))) ls.removeItem(key);
    }
  } catch {}
}

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    session: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    // Startup watchdog: if the auth server is unreachable (offline, slow
    // network, wedged stored session) never leave the app in a loading
    // state — fall through as signed-out so the UI can render.
    const watchdog = setTimeout(() => {
      if (!mounted) return;
      console.warn("[PlugU:auth] session hydrate timed out — continuing as signed-out");
      setState((prev) => (prev.loading ? { ...prev, loading: false } : prev));
    }, 5000);

    // Set listener FIRST so we don't miss events.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "TOKEN_REFRESHED" && !session) {
        // Refresh failed against a stored token the server no longer knows
        // about (revoked, rotated, expired past the refresh window).
        void clearBrokenSession("token refresh returned no session");
      }
      setState({ session, user: session?.user ?? null, loading: false });
    });

    // Then hydrate current session.
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error("[PlugU:auth] getSession failed", error);
          void clearBrokenSession(error.message);
          setState({ session: null, user: null, loading: false });
          return;
        }
        setState({
          session: data.session,
          user: data.session?.user ?? null,
          loading: false,
        });
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("[PlugU:auth] getSession threw", err);
        setState({ session: null, user: null, loading: false });
      });

    return () => {
      mounted = false;
      clearTimeout(watchdog);
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}