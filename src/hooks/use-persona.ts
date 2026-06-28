import { useEffect, useState } from "react";

export type PersonaInterest =
  | "entrepreneur" | "athlete" | "artist" | "freshman" | "senior" | "tech" | "creative" | "greek";

export type Persona = {
  name: string;
  year: string;
  campus: string;
  major: string;
  interests: PersonaInterest[];
};

const KEY = "plugu.persona";

const DEFAULT: Persona = {
  name: "Kingpin",
  year: "Junior",
  campus: "Talladega College",
  major: "Business",
  interests: ["entrepreneur", "senior"],
};

export function usePersona(): [Persona, (next: Partial<Persona>) => void] {
  const [p, setP] = useState<Persona>(DEFAULT);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setP({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
  }, []);
  function update(next: Partial<Persona>) {
    setP((prev) => {
      const merged = { ...prev, ...next };
      try { window.localStorage.setItem(KEY, JSON.stringify(merged)); } catch {}
      return merged;
    });
  }
  return [p, update];
}

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