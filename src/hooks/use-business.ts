// Load the signed-in user's business row (draft or active). One-per-owner in practice.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./use-session";

export type Business = {
  id: string;
  owner_user_id: string;
  school_id: string | null;
  name: string;
  slug: string;
  bio: string | null;
  description: string | null;
  category: string | null;
  campus_name: string | null;
  fulfillment: string[];
  availability: string | null;
  cancellation_policy: string | null;
  contact_method: string;
  rules_accepted_at: string | null;
  onboarding_step: number;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export function useMyBusiness() {
  const { user, loading } = useSession();
  const q = useQuery({
    queryKey: ["my-business", user?.id ?? null],
    enabled: !!user?.id,
    staleTime: 15_000,
    queryFn: async (): Promise<Business | null> => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as Business | null) ?? null;
    },
  });
  return {
    business: q.data ?? null,
    loading: loading || (q.isPending && !!user?.id),
    error: q.error as Error | null,
    refetch: q.refetch,
  };
}