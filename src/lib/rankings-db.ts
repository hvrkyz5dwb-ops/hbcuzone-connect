// Campus + category leaderboards. Backed by the campus_rankings database
// function, which aggregates real completed orders only.
import { supabase } from "@/integrations/supabase/client";

export type RankingPeriod = "7" | "30" | "90";

export type RankedSeller = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  school_id: string | null;
  school_name: string | null;
  top_category: string | null;
  completed_orders: number;
  rating_avg: number;
  rating_count: number;
  completed_transactions: number;
  verification_status: string | null;
  member_since: string | null;
};

export async function fetchRankings(input: {
  schoolId?: string | null;
  category?: string | null;
  days?: number;
  limit?: number;
}): Promise<RankedSeller[]> {
  const { data, error } = await supabase.rpc("campus_rankings", {
    _school_id: input.schoolId ?? undefined,
    _category: input.category ?? undefined,
    _days: input.days ?? 30,
    _limit: input.limit ?? 25,
  });
  if (error) throw error;
  return (data ?? []) as unknown as RankedSeller[];
}
