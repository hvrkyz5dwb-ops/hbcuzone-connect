import { useEffect, useState } from "react";
import { getStudent } from "@/lib/auth";
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
  const [state, setState] = useState<HbcusVerification>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function sync() {
      try {
        const s = getStudent();
        // If student has a verified .edu that matches an HBCU profile, ensure verification reflects it.
        if (s?.verifiedStudent && s.school && schoolProfiles.some((p) => p.name === s.school)) {
          const merged: HbcusVerification = { verified: true, method: "edu", email: s.email, school: s.school };
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
    window.addEventListener("plugu:student", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("plugu:student", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

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