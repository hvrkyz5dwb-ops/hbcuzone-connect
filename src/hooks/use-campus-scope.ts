import { useEffect, useState } from "react";
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
