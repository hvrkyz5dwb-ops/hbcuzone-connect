import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  getExploreCampus,
  setExploreCampus,
  subscribeExploreCampus,
} from "@/lib/campus-scope";
import { useProfile } from "./use-profile";

export type CampusScope = {
  /** The campus currently being viewed (verified home campus, or an explore override). */
  campusName: string;
  /** The student's own verified campus, when they have one. */
  homeCampusName: string | null;
  /** True when the student is browsing a campus other than their own. */
  exploring: boolean;
  setCampus: (name: string | null) => void;
  resetToHome: () => void;
};

/**
 * Single source of truth for "which campus am I looking at?".
 * Home = the verified school on the profile. Explore = a browser-local
 * override, so students can see other PlugU campuses inside the same app.
 */
export function useCampusScope(): CampusScope {
  const { profile } = useProfile();
  const [override, setOverride] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setOverride(getExploreCampus());
    sync();
    return subscribeExploreCampus(sync);
  }, []);

  const home = profile?.school_name ?? null;
  const exploring = !!override && override !== home;

  return {
    campusName: override || home || "Your campus",
    homeCampusName: home,
    exploring,
    setCampus: (name) => setExploreCampus(name),
    resetToHome: () => setExploreCampus(null),
  };
}

/**
 * Resolves the campus currently being browsed to real school rows, so the
 * marketplace and events feeds show that campus's content — not just its name.
 * Some campuses exist as more than one row (legacy short names), so every
 * matching id is returned and the feeds match on all of them.
 * Falls back to the student's own verified school when not exploring.
 */
export function useCampusSchoolId(): {
  schoolId: string | null;
  schoolIds: string[];
  campusName: string;
  exploring: boolean;
} {
  const { campusName, exploring } = useCampusScope();
  const { profile } = useProfile();

  const lookup = useQuery({
    queryKey: ["school-ids-by-name", campusName],
    enabled: exploring && !!campusName,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("schools")
        .select("id")
        .ilike("name", campusName);
      return (data ?? []).map((row) => row.id as string);
    },
  });

  const schoolIds = exploring
    ? (lookup.data ?? [])
    : profile?.school_id
      ? [profile.school_id]
      : [];

  return {
    schoolId: schoolIds[0] ?? null,
    schoolIds,
    campusName,
    exploring,
  };
}

