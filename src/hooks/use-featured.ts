// Featured "Businesses & Events You Should Know" promotions for the
// Home carousel. Served by the featured_promotions RPC (security
// definer): Pro sellers appear to students on their own campus,
// KingPin sellers appear per their admin-set targeting scope, and
// featured/boosted campus events appear to their campus audience.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./use-profile";

export type FeaturedPromotion = {
  kind: "business" | "event";
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  campus: string | null;
  username: string | null;
  verified: boolean;
  tier: "pro" | "kingpin" | string;
  starts_at: string | null;
};

export function useFeaturedPromotions() {
  const { profile } = useProfile();
  const schoolId = profile?.school_id ?? null;
  return useQuery({
    queryKey: ["featured-promotions", schoolId],
    staleTime: 60_000,
    queryFn: async (): Promise<FeaturedPromotion[]> => {
      const { data, error } = await supabase.rpc("featured_promotions", {
        _viewer_school_id: schoolId,
      });
      if (error) throw error;
      return (data ?? []) as unknown as FeaturedPromotion[];
    },
  });
}