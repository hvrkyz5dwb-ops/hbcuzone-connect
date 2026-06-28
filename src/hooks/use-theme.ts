import { useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light";
const KEY = "plugu.theme";

function getInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

function apply(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    apply(theme);
    try { window.localStorage.setItem(KEY, theme); } catch {}
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, setTheme, toggle };
}