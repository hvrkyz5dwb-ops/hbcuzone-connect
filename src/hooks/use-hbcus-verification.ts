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
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...DEFAULT, ...JSON.parse(raw) });
      else {
        // Auto-verify when the signed-in student has an HBCU .edu
        const s = getStudent();
        if (s?.verifiedStudent && s.school && schoolProfiles.some((p) => p.name === s.school)) {
          const merged: HbcusVerification = { verified: true, method: "edu", email: s.email, school: s.school };
          setState(merged);
          window.localStorage.setItem(KEY, JSON.stringify(merged));
        }
      }
    } catch {}
    setHydrated(true);
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