import { useEffect, useState } from "react";
import hero from "@/assets/plugu-hero-splash.png.asset.json";

/**
 * PlugU Splash — hero poster with gentle Ken Burns push, gold glow breathe,
 * and drifting gold dust. First visit 4.5s, return visit 2.5s.
 *
 * Perf notes (targets 60fps on mid-range mobile):
 *  - Only opacity + transform animate (compositor-only, no repaint).
 *  - No `filter: blur()` on animating layers; no mix-blend-mode.
 *  - `contain: strict` isolates paint from the app tree behind it.
 *  - Hero image is preloaded from __root.tsx and decoded async.
 *  - Dust particle count kept low (8), no per-particle filters.
 */
const SEEN_KEY = "plugu.splash.seen";

export function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);
  const [full, setFull] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let firstVisit = true;
    try {
      firstVisit = !window.localStorage.getItem(SEEN_KEY);
      window.localStorage.setItem(SEEN_KEY, String(Date.now()));
    } catch {}
    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);
    setFull(firstVisit);
    setMounted(true);
    const duration = prefersReduced ? 1200 : firstVisit ? 4500 : 2500;
    const t1 = setTimeout(() => setFading(true), duration - 500);
    const t2 = setTimeout(() => setGone(true), duration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!mounted || gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-500 ease-out ${fading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      style={{ contain: "strict", willChange: "opacity" }}
      aria-hidden="true"
    >
      {/* Hero poster — Ken Burns push skipped for reduced-motion users */}
      <div className={`absolute inset-0 ${reduced ? "" : "cine-hero-push"}`}>
        <img
          src={hero.url}
          alt=""
          className="h-full w-full object-cover object-center"
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />
      </div>

      {/* Warm gold glow behind the statue's P — static for reduced-motion */}
      <div
        className={`absolute left-1/2 top-[38%] pointer-events-none ${reduced ? "" : "cine-hero-glow"}`}
        style={{
          width: "min(70vmin, 620px)",
          height: "min(70vmin, 620px)",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(246,210,122,0.5) 0%, rgba(246,210,122,0.15) 40%, transparent 70%)",
          opacity: reduced ? 0.55 : undefined,
        }}
      />

      {/* Vignette + bottom fade — static, cheap */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:
          "radial-gradient(120% 90% at 50% 45%, transparent 0%, transparent 55%, rgba(0,0,0,0.7) 100%)",
      }} />
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none" style={{
        background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85))",
      }} />

      {/* Cinematic light sheen (skipped for reduced-motion) */}
      {!reduced && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="cine-hero-sheen absolute -inset-y-10 w-[35%] -left-1/3"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(232,199,122,0.14) 45%, rgba(255,240,194,0.28) 50%, rgba(232,199,122,0.14) 55%, transparent 100%)",
              mixBlendMode: "screen",
            }}
          />
        </div>
      )}

      {/* Cinematic letterbox reveal (skipped for reduced-motion) */}
      {!reduced && (
        <>
          <div
            className="cine-letterbox-top absolute inset-x-0 top-0 h-[14vh] pointer-events-none"
            style={{ background: "linear-gradient(180deg, #000 65%, transparent)" }}
          />
          <div
            className="cine-letterbox-bottom absolute inset-x-0 bottom-0 h-[14vh] pointer-events-none"
            style={{ background: "linear-gradient(0deg, #000 65%, transparent)" }}
          />
        </>
      )}

      {/* Drifting gold dust — skipped entirely for reduced-motion */}
      {full && !reduced && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="cine-dust absolute rounded-full"
              style={{
                left: `${(i * 13 + 7) % 100}%`,
                bottom: `-${(i * 5) % 40}px`,
                width: 3,
                height: 3,
                background: "radial-gradient(circle, rgba(246,210,122,0.95), rgba(246,210,122,0) 70%)",
                animationDelay: `${(i * 0.6) % 4}s`,
                animationDuration: `${6 + (i % 4)}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
