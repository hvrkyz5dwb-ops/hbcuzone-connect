// Reads the current signed-in user's profile row via RLS (self-only).
// Cached with React Query so consumers don't refetch on every render.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./use-session";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  username: string | null;
  school_name: string | null;
  school_domain: string | null;
  year: string | null;
  graduation_year: number | null;
  status: "student" | "alumni";
  major: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_hbcu_student: boolean;
  completed_transactions: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  onboarding_completed_at: string | null;
  terms_accepted_at: string | null;
  school_id: string | null;
  verification_status: "verified" | "pending" | "rejected" | string;
};

export function useProfile() {
  const { user, loading: sessionLoading } = useSession();

  const query = useQuery({
    queryKey: ["profile", user?.id ?? null],
    enabled: !!user?.id,
    staleTime: 30_000,
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id,email,full_name,display_name,username,school_name,school_domain,year,graduation_year,status,major,bio,avatar_url,is_hbcu_student,completed_transactions,rating_avg,rating_count,created_at,onboarding_completed_at,terms_accepted_at,school_id,verification_status",
        )
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return (data as Profile | null) ?? null;
    },
  });

  return {
    profile: query.data ?? null,
    loading: sessionLoading || (query.isPending && !!user?.id),
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}