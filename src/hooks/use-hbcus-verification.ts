import { useEffect, useState } from "react";
import { useProfile } from "./use-profile";
import { schoolProfiles } from "@/lib/hbcus-data";

const KEY = "plugu.hbcus.verified";

export type HbcusVerification = {
  verified: boolean;
  method: "edu" | "id" | "school" | null;
  email?: string;
  school?: string;
};

const DEFAULT: HbcusVerification = { verified: false, method: null };

export function useHbcusVerification() {
  const { profile } = useProfile();
  const [state, setState] = useState<HbcusVerification>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function sync() {
      try {
        // If the signed-in profile has a verified .edu matching an HBCU, reflect it.
        if (
          profile?.is_hbcu_student &&
          profile.school_name &&
          schoolProfiles.some((p) => p.name === profile.school_name)
        ) {
          const merged: HbcusVerification = {
            verified: true,
            method: "edu",
            email: profile.email,
            school: profile.school_name,
          };
          setState(merged);
          try { window.localStorage.setItem(KEY, JSON.stringify(merged)); } catch {}
          return;
        }
        const raw = window.localStorage.getItem(KEY);
        if (raw) setState({ ...DEFAULT, ...JSON.parse(raw) });
        else setState(DEFAULT);
      } catch {}
    }
    sync();
    setHydrated(true);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
    };
  }, [profile?.id, profile?.is_hbcu_student, profile?.school_name, profile?.email]);

  function verify(next: Omit<HbcusVerification, "verified"> & { verified?: boolean }) {
    const merged: HbcusVerification = { ...DEFAULT, ...next, verified: true };
    setState(merged);
    try { window.localStorage.setItem(KEY, JSON.stringify(merged)); } catch {}
  }

  function reset() {
    setState(DEFAULT);
    try { window.localStorage.removeItem(KEY); } catch {}
  }

  return { ...state, hydrated, verify, reset };
}