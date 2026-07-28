// Resolves whether the signed-in user has the `admin` role.
// Uses the SECURITY DEFINER `has_role` RPC so it's safe from RLS recursion.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./use-session";

export function useIsAdmin() {
  const { user } = useSession();
  const q = useQuery({
    queryKey: ["is-admin", user?.id ?? null],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async (): Promise<boolean> => {
      if (!user?.id) return false;
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (error) return false;
      return !!data;
    },
  });
  return { isAdmin: q.data ?? false, loading: q.isPending };
}