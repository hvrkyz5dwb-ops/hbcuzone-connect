import { useEffect, useState } from "react";
import monumentDark from "@/assets/plugu-monument-dark.png.asset.json";
import monumentLit from "@/assets/plugu-monument-lit.png.asset.json";
import { playSplashAudio } from "@/lib/splash-audio";

/**
 * PlugU launch splash — "The Monument Powers On" (2.6s).
 *
 * Scene clock (matches the storyboard):
 *   0.00–0.45s  Darkness → the obsidian monument reveals out of black
 *   0.45–1.25s  Power builds — gold sparks rise around the plug prongs
 *   1.30s       Lightning strikes the U at the base (bolt + flash + shake)
 *   1.35–1.60s  A gold energy wave sweeps up the pedestal
 *   1.55–1.90s  The whole monument powers on (lit plate cross-fades in)
 *   1.90–2.20s  Power surges — radial shockwave, bigger burst, brightness
 *   2.25–2.60s  Camera zooms through the P straight into the app
 *
 * SFX are synthesized with WebAudio (thunder, crackle, bass impact,
 * power-up, startup chime) — zero audio files.
 *
 * Perf: only transform/opacity animate on compositor layers; one static
 * blurred layer fades in during the final zoom. `contain: strict`
 * isolates paint from the app behind it. Both plates are preloaded
 * from __root.tsx. Reduced-motion users get a 1.2s static power-on.
 */
const TOTAL_MS = 2600;
const REDUCED_MS = 1200;

// Bolt runs from the storm sky down onto the U (66%, 64% of the art).
const BOLT_MAIN = "M46,-2 L52,7 L45,13 L55,21 L49,29 L58,35 L51,43 L60,49 L55,55 L64,59 L66,64";
const BOLT_BRANCHES = ["M55,21 L64,25 L70,33", "M51,43 L42,47 L38,55", "M58,35 L68,40 L73,47"];
const ARCS = ["M59,67 L63,65 L67,68 L71,66", "M61,59 L64,61 L69,60"];

// Gold sparks rising around the plug prongs (P bowl at ~52%, 30%).
const PRONG_SPARKS = [
  { left: "50.5%", top: "31%", d: "0.90s", dx: "-7px" },
  { left: "53%", top: "29%", d: "0.98s", dx: "6px" },
  { left: "55%", top: "31.5%", d: "1.06s", dx: "-4px" },
  { left: "52%", top: "33%", d: "1.15s", dx: "8px" },
  { left: "56.5%", top: "29.5%", d: "1.24s", dx: "-9px" },
  { left: "51%", top: "28.5%", d: "1.33s", dx: "5px" },
  { left: "54%", top: "32%", d: "1.42s", dx: "-6px" },
  { left: "49%", top: "30%", d: "1.62s", dx: "9px" },
  { left: "55.5%", top: "30.5%", d: "1.70s", dx: "-8px" },
  { left: "52.5%", top: "27.5%", d: "1.78s", dx: "4px" },
  { left: "50%", top: "32.5%", d: "1.88s", dx: "-5px" },
  { left: "56%", top: "28%", d: "1.96s", dx: "7px" },
];

// Radial burst from the impact point (the U).
const IMPACT_BURST = [
  { dx: "-46px", dy: "-30px" },
  { dx: "-18px", dy: "-52px" },
  { dx: "16px", dy: "-48px" },
  { dx: "44px", dy: "-26px" },
  { dx: "-52px", dy: "8px" },
  { dx: "50px", dy: "12px" },
  { dx: "-24px", dy: "34px" },
  { dx: "26px", dy: "36px" },
];

export function SplashScreen({ onDone }: { onDone?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [gone, setGone] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);
    setMounted(true);

    const stopAudio = prefersReduced ? () => {} : playSplashAudio();
    const t = window.setTimeout(
      () => {
        setGone(true);
        onDone?.();
      },
      prefersReduced ? REDUCED_MS : TOTAL_MS,
    );
    return () => {
      window.clearTimeout(t);
      stopAudio();
    };
  }, [onDone]);

  if (!mounted || gone) return null;

  // Reduced motion: a single calm power-on frame, no animation at all.
  if (reduced) {
    return (
      <div className="fixed inset-0 z-[100] overflow-hidden bg-black" style={{ contain: "strict" }} aria-hidden="true">
        <img
          src={monumentLit.url}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: "50% 40%", opacity: 0.9 }}
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(120% 95% at 50% 42%, transparent 52%, rgba(0,0,0,0.55) 100%)" }}
        />
      </div>
    );
  }

  return (
    <div className="spl-root fixed inset-0 z-[100] overflow-hidden bg-black" aria-hidden="true">
      {/* The monument — reveal → power-build sway → strike shake → zoom through the P */}
      <div className="spl-stage absolute inset-0">
        <img
          src={monumentDark.url}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: "50% 40%" }}
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />
        {/* Powered-on plate — cross-fades in as energy floods the P */}
        <img
          src={monumentLit.url}
          alt=""
          className="spl-lit absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "50% 40%" }}
          decoding="async"
          draggable={false}
        />
        {/* Lens bloom during the zoom-through (static blurred layer, opacity only) */}
        <img
          src={monumentLit.url}
          alt=""
          className="spl-zoombloom absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "50% 40%", filter: "blur(18px) saturate(1.3)", transform: "scale(1.15)" }}
          decoding="async"
          draggable={false}
        />
      </div>

      {/* Lightning bolt + branches striking the U */}
      <svg className="spl-bolt" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength={100} d={BOLT_MAIN} stroke="rgba(246,190,90,0.55)" strokeWidth="2.6" />
        <path pathLength={100} d={BOLT_MAIN} stroke="#ffe9b0" strokeWidth="1.15" />
        <path pathLength={100} d={BOLT_MAIN} stroke="#ffffff" strokeWidth="0.5" />
        {BOLT_BRANCHES.map((d) => (
          <path key={d} className="spl-branch" pathLength={100} d={d} stroke="#ffe9b0" strokeWidth="0.8" />
        ))}
      </svg>

      {/* Residual electrical arcs dancing around the U after the strike */}
      <svg className="spl-arcs" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {ARCS.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>

      {/* Full-screen strike flash (double-flicker) */}
      <div className="spl-flash absolute inset-0 pointer-events-none" />

      {/* Warm backlight bloom — breathing behind the P once lit */}
      <div className="spl-bloom pointer-events-none" />

      {/* Gold energy wave sweeping up the pedestal after the strike */}
      <div className="spl-sweep pointer-events-none" />

      {/* Power-surge shockwave rings from the impact point */}
      <span className="spl-shock pointer-events-none" />
      <span className="spl-shock spl-shock-2 pointer-events-none" />

      {/* Sparks rising around the prongs while power builds / surges */}
      {PRONG_SPARKS.map((s, i) => (
        <span
          key={`p${i}`}
          className="spl-spark absolute rounded-full pointer-events-none"
          style={{ left: s.left, top: s.top, animationDelay: s.d, ["--dx" as string]: s.dx }}
        />
      ))}

      {/* Impact burst at the U when the bolt lands */}
      {IMPACT_BURST.map((s, i) => (
        <span
          key={`b${i}`}
          className="spl-burst absolute rounded-full pointer-events-none"
          style={{ left: "66%", top: "63.5%", ["--bx" as string]: s.dx, ["--by" as string]: s.dy }}
        />
      ))}

      {/* Vignette — keeps edges cinematic and hides cover-crop seams */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(120% 95% at 50% 42%, transparent 52%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Whiteout as the camera passes through the P */}
      <div className="spl-whiteout absolute inset-0 pointer-events-none" />
    </div>
  );
}
