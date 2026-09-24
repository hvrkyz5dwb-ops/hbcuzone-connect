import { useEffect, useState } from "react";

export type PersonaInterest =
  | "entrepreneur" | "athlete" | "artist" | "freshman" | "senior" | "tech" | "creative" | "greek";

export type PersonaBadge =
  | "Student" | "Plug" | "Verified Plug" | "Gold Plug" | "Top Plug";

export type Persona = {
  name: string;
  year: string;
  campus: string;
  major: string;
  interests: PersonaInterest[];
  badge: PersonaBadge;
};

const KEY = "plugu.persona";

const DEFAULT: Persona = {
  name: "Student",
  year: "Junior",
  campus: "Talladega College",
  major: "Business",
  interests: ["entrepreneur", "senior"],
  badge: "Student",
};

export function usePersona(): [Persona, (next: Partial<Persona>) => void] {
  const [p, setP] = useState<Persona>(DEFAULT);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setP({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
    function onChange(e: StorageEvent) {
      if (e.key && e.key !== KEY) return;
      try {
        const raw = window.localStorage.getItem(KEY);
        setP(raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT);
      } catch {}
    }
    window.addEventListener("storage", onChange);
    window.addEventListener("plugu:persona", onChange as EventListener);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("plugu:persona", onChange as EventListener);
    };
  }, []);
  function update(next: Partial<Persona>) {
    setP((prev) => {
      const merged = { ...prev, ...next };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event("plugu:persona"));
      } catch {}
      return merged;
    });
  }
  return [p, update];
}

export const badgeOrder: PersonaBadge[] = [
  "Student", "Plug", "Verified Plug", "Gold Plug", "Top Plug",
];

export const interestOptions: { key: PersonaInterest; label: string; emoji: string }[] = [
  { key: "entrepreneur", label: "Entrepreneur", emoji: "💼" },
  { key: "athlete",      label: "Athlete",      emoji: "🏈" },
  { key: "artist",       label: "Artist",       emoji: "🎨" },
  { key: "creative",     label: "Creative",     emoji: "🎬" },
  { key: "tech",         label: "Tech / CS",    emoji: "💻" },
  { key: "greek",        label: "Greek Life",   emoji: "🏛️" },
  { key: "freshman",     label: "Freshman",     emoji: "🆕" },
  { key: "senior",       label: "Senior / Grad", emoji: "🎓" },
];