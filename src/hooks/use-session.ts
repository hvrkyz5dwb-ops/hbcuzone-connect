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
      setState((prev) => (prev.loading ? { ...prev, loading: false } : prev));
    }, 5000);

    // Set listener FIRST so we don't miss events.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({ session, user: session?.user ?? null, loading: false });
    });

    // Then hydrate current session.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setState({
          session: data.session,
          user: data.session?.user ?? null,
          loading: false,
        });
      })
      .catch(() => {
        if (!mounted) return;
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