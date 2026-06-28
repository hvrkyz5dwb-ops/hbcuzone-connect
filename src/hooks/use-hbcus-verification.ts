import { useEffect, useState } from "react";

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