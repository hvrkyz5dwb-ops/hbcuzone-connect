import { useEffect, useState } from "react";
import monumentDark from "@/assets/plugu-monument-dark.png.asset.json";
import monumentLit from "@/assets/plugu-monument-lit.png.asset.json";
import { playSplashAudio } from "@/lib/splash-audio";

/**
 * PlugU launch splash — "Power On" (3.3s).
 *
 * Scene clock:
 *   0.00–0.40s  Pure black → ambient gold dust begins floating
 *   0.40–1.15s  The obsidian monument reveals out of darkness, rumble builds
 *   1.20s       Lightning crashes from the sky onto the U (bolt + soft flash)
 *   1.22–1.70s  The U burns hotter than everything else, pulsing with
 *               electricity while a gold energy wave climbs the P
 *   1.55–2.30s  The whole monument powers on; a polished-metal shimmer
 *               sweeps the logo; sparks fly; dark gold horizon glows
 *   2.20–2.90s  The logo springs to ~105% and settles back; brand hold
 *   3.00–3.30s  One final pulse — a gold ring expands across the screen
 *               and the splash crossfades into the app (already loaded
 *               underneath), like the app itself powered on.
 *
 * SFX are synthesized with WebAudio (thunder, crackle, bass impact,
 * power-up, startup chime) — zero audio files.
 *
 * Perf: only transform/opacity animate on compositor layers; blend-mode
 * layers are static and fade by opacity only. `contain: strict` isolates
 * paint from the app behind it. Both plates are preloaded from
 * __root.tsx. Reduced-motion users get a 1.2s static power-on.
 */
const TOTAL_MS = 3300;
const REDUCED_MS = 1200;

// Bolt runs from the storm sky down onto the U (66%, 64% of the art).
const BOLT_MAIN = "M46,-2 L52,7 L45,13 L55,21 L49,29 L58,35 L51,43 L60,49 L55,55 L64,59 L66,64";
const BOLT_BRANCHES = ["M55,21 L64,25 L70,33", "M51,43 L42,47 L38,55", "M58,35 L68,40 L73,47"];
const ARCS = ["M59,67 L63,65 L67,68 L71,66", "M61,59 L64,61 L69,60"];

// Gold sparks rising around the plug prongs (P bowl at ~52%, 30%).
const PRONG_SPARKS = [
  // Power build — anticipation before the strike
  { left: "50.5%", top: "31%", d: "0.82s", dx: "-7px" },
  { left: "53%", top: "29%", d: "0.90s", dx: "6px" },
  { left: "55%", top: "31.5%", d: "0.98s", dx: "-4px" },
  { left: "52%", top: "33%", d: "1.06s", dx: "8px" },
  { left: "56.5%", top: "29.5%", d: "1.14s", dx: "-9px" },
  // Ignition — sparks flying off while the logo is lit
  { left: "51%", top: "28.5%", d: "1.58s", dx: "5px" },
  { left: "54%", top: "32%", d: "1.68s", dx: "-6px" },
  { left: "49%", top: "30%", d: "1.80s", dx: "9px" },
  { left: "55.5%", top: "30.5%", d: "1.92s", dx: "-8px" },
  { left: "52.5%", top: "27.5%", d: "2.04s", dx: "4px" },
  { left: "50%", top: "32.5%", d: "2.16s", dx: "-5px" },
  { left: "56%", top: "28%", d: "2.30s", dx: "7px" },
];

// Ambient gold dust — drifting from the first frame, across the whole sky.
const GOLD_DUST = [
  { left: "10%", top: "74%", s: 2.5, d: "0.02s", dx: "14px", o: 0.5 },
  { left: "18%", top: "58%", s: 2, d: "0.24s", dx: "-10px", o: 0.45 },
  { left: "26%", top: "82%", s: 3, d: "0.10s", dx: "8px", o: 0.6 },
  { left: "33%", top: "64%", s: 1.8, d: "0.42s", dx: "-14px", o: 0.4 },
  { left: "41%", top: "76%", s: 2.4, d: "0.18s", dx: "12px", o: 0.55 },
  { left: "48%", top: "60%", s: 1.6, d: "0.55s", dx: "-8px", o: 0.4 },
  { left: "56%", top: "80%", s: 2.8, d: "0.08s", dx: "10px", o: 0.6 },
  { left: "63%", top: "66%", s: 2, d: "0.36s", dx: "-12px", o: 0.45 },
  { left: "70%", top: "78%", s: 2.4, d: "0.16s", dx: "16px", o: 0.55 },
  { left: "77%", top: "58%", s: 1.7, d: "0.62s", dx: "-10px", o: 0.4 },
  { left: "84%", top: "72%", s: 2.6, d: "0.28s", dx: "12px", o: 0.5 },
  { left: "90%", top: "84%", s: 2, d: "0.05s", dx: "-16px", o: 0.45 },
  { left: "14%", top: "88%", s: 1.8, d: "0.78s", dx: "10px", o: 0.4 },
  { left: "59%", top: "90%", s: 2.2, d: "0.90s", dx: "-12px", o: 0.45 },
  { left: "88%", top: "62%", s: 1.6, d: "1.05s", dx: "8px", o: 0.35 },
  { left: "37%", top: "90%", s: 2, d: "1.18s", dx: "-8px", o: 0.4 },
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
      {/* Ambient gold dust — floating from the first frame */}
      {GOLD_DUST.map((p, i) => (
        <span
          key={`d${i}`}
          className="spl-dust"
          style={{
            left: p.left,
            top: p.top,
            width: p.s,
            height: p.s,
            animationDelay: p.d,
            ["--dx" as string]: p.dx,
            ["--o" as string]: p.o,
          }}
        />
      ))}

      {/* The monument — reveal → strike shake → 105% spring → brand hold */}
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
      </div>

      {/* Dark-gold horizon illumination once power is on (screen blend) */}
      <div className="spl-goldbg" />

      {/* Polished-metal shimmer sweeping across the lit logo */}
      <div className="spl-shimmer" />

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

      {/* The U burning hotter than the rest — electric pulse after the strike */}
      <div className="spl-upulse" />

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

      {/* Final pulse — a gold ring expands across the screen as we crossfade */}
      <span className="spl-finalpulse" />
    </div>
  );
}
