import { useEffect, useState } from "react";
import pluguLogo from "@/assets/plugu-logo.png";

export type AchievementDetail = { title: string; subtitle?: string };

export function fireAchievement(detail: AchievementDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("plugu:achievement", { detail }));
}

/**
 * Cinematic statue "charge" moment. Listens for plugu:achievement events
 * and briefly overlays a gold lightning burst around the PlugU mark.
 */
export function AchievementBurst() {
  const [current, setCurrent] = useState<AchievementDetail | null>(null);

  useEffect(() => {
    function onFire(e: Event) {
      const detail = (e as CustomEvent<AchievementDetail>).detail;
      if (!detail) return;
      setCurrent(detail);
      const t = setTimeout(() => setCurrent(null), 1800);
      return () => clearTimeout(t);
    }
    window.addEventListener("plugu:achievement", onFire);
    return () => window.removeEventListener("plugu:achievement", onFire);
  }, []);

  if (!current) return null;

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(244,201,106,0.28), rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85))",
          animation: reduced ? undefined : "plugu-fade-in 220ms ease-out both",
        }}
      />
      <div
        className="relative flex flex-col items-center gap-3 px-6"
        style={{ animation: reduced ? undefined : "plugu-pop 480ms cubic-bezier(.2,.9,.25,1.2) both" }}
      >
        <div className="relative h-24 w-24 grid place-items-center">
          <span
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow:
                "0 0 60px 12px rgba(244,201,106,0.55), inset 0 0 24px rgba(255,246,214,0.35)",
              animation: reduced ? undefined : "plugu-halo 1.6s ease-out both",
            }}
          />
          <img
            src={pluguLogo}
            alt=""
            className="relative h-16 w-16 object-contain drop-shadow-[0_0_18px_rgba(244,201,106,0.9)]"
          />
        </div>
        <p
          className="text-[10px] tracking-[0.32em] uppercase"
          style={{ color: "var(--plugu-gold)" }}
        >
          Achievement
        </p>
        <p className="text-xl font-bold text-center text-foreground">{current.title}</p>
        {current.subtitle && (
          <p className="text-xs text-center text-muted-foreground max-w-[260px]">
            {current.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}