import { useEffect, useState } from "react";

const KEY = "plugu:home-campus";
const DEFAULT = "Talladega College";

export function useHomeCampus() {
  const [home, setHome] = useState<string>(DEFAULT);
  const [active, setActive] = useState<string>(DEFAULT);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        setHome(stored);
        setActive(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setHomeCampus = (name: string) => {
    setHome(name);
    setActive(name);
    try {
      localStorage.setItem(KEY, name);
    } catch {
      /* ignore */
    }
  };

  return { home, active, setActive, setHomeCampus };
}