import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

/**
 * PlugU First-Time Cinematic Intro (plays once per device).
 * Storage key: `plugu.intro.v1.seen`. Replay via replayPluguIntro().
 * Respects prefers-reduced-motion.
 */

const INTRO_KEY = "plugu.intro.v1.seen";

export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return true;
  try { return !!window.localStorage.getItem(INTRO_KEY); } catch { return true; }
}

export function replayPluguIntro() {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(INTRO_KEY); } catch {}
  window.location.assign("/signup?replayIntro=1");
}

function markSeen() {
  try { window.localStorage.setItem(INTRO_KEY, String(Date.now())); } catch {}
}

function buzz(ms = 30) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      (navigator as Navigator & { vibrate: (p: number | number[]) => boolean }).vibrate(ms);
    }
  } catch {}
}

export function FirstTimeIntro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"scene" | "closing" | "done">("scene");
  const [panelIn, setPanelIn] = useState(false);
  const [struck, setStruck] = useState(false);
  const navigate = useNavigate();
  const buzzedRef = useRef(false);
  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) { setPanelIn(true); return; }
    const t1 = setTimeout(() => {
      if (!buzzedRef.current) { buzzedRef.current = true; buzz(35); }
      setStruck(true);
    }, 5500);
    const t2 = setTimeout(() => setPanelIn(true), 7200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reduced]);

  function finish(target?: "/signup" | "/login" | "/onboarding") {
    markSeen();
    setPhase("closing");
    setTimeout(() => {
      setPhase("done");
      onDone();
      if (target && target !== "/signup") navigate({ to: target });
    }, 420);
  }

  if (phase === "done") return null;

  return (
    <div
      className={`plugu-intro fixed inset-0 z-[120] overflow-hidden bg-black text-white transition-opacity duration-500 ${
        phase === "closing" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ contain: "strict" }}
      aria-label="PlugU cinematic intro"
    >
      <div className="absolute inset-0 intro-sky" />
      <div className="absolute inset-x-0 bottom-0 h-[46%] intro-ground" />

      {/* Distant campus skyline */}
      <svg viewBox="0 0 1000 220" preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-[38%] h-[18%] w-full opacity-90" aria-hidden>
        <path
          d="M0 220 V150 L60 150 L60 110 L120 110 L120 90 L160 90 L160 60 L210 60 L210 90 L260 90 L260 130 L320 130 L340 90 L380 90 L380 60 L440 60 L440 100 L500 100 L500 70 L560 70 L560 40 L620 40 L620 90 L680 90 L680 130 L740 130 L760 90 L820 90 L820 120 L900 120 L900 150 L1000 150 L1000 220 Z"
          fill="#0d0f14" />
        <g fill="#f4c96a" opacity="0.55">
          {Array.from({ length: 40 }).map((_, i) => (
            <rect key={i} x={20 + i * 24} y={95 + ((i * 13) % 40)} width="3" height="3" />
          ))}
        </g>
      </svg>

      {/* Clouds */}
      <div className="absolute left-1/2 top-[8%] -translate-x-1/2 w-[85%] h-[26%] intro-clouds" aria-hidden>
        <div className="absolute left-[10%] top-[20%] h-16 w-40 rounded-full bg-[#151823]/90 blur-2xl" />
        <div className="absolute left-[38%] top-[8%] h-20 w-56 rounded-full bg-[#1a1d2a]/95 blur-2xl" />
        <div className="absolute left-[65%] top-[26%] h-14 w-36 rounded-full bg-[#181b26]/90 blur-2xl" />
      </div>

      {/* Statue */}
      <div className="absolute left-1/2 top-[24%] -translate-x-1/2 flex flex-col items-center intro-statue-wrap" aria-hidden>
        <div className={`absolute -inset-24 rounded-full intro-glow ${struck ? "is-struck" : ""}`} />
        <svg width="180" height="260" viewBox="0 0 180 260" className="relative">
          <defs>
            <linearGradient id="statueBody" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2a2d38" />
              <stop offset="100%" stopColor="#0a0b10" />
            </linearGradient>
            <linearGradient id="statueCharge" x1="0" x2="0" y1="1" y2="0">
              <stop offset="0%" stopColor="#f4c96a" />
              <stop offset="60%" stopColor="#ffe6a8" />
              <stop offset="100%" stopColor="#fff6d6" />
            </linearGradient>
            <clipPath id="statueClip">
              <path d="M75 20 Q90 6 105 20 Q120 40 110 60 L118 70 Q130 84 128 108 L120 130 L124 180 L110 220 L108 240 L72 240 L70 220 L56 180 L60 130 L52 108 Q50 84 62 70 L70 60 Q60 40 75 20 Z" />
            </clipPath>
          </defs>
          <rect x="30" y="240" width="120" height="16" rx="3" fill="#111319" />
          <rect x="42" y="228" width="96" height="14" rx="2" fill="#181b22" />
          <g clipPath="url(#statueClip)">
            <rect x="30" y="10" width="120" height="240" fill="url(#statueBody)" />
            <rect x="30" width="120" height="240" fill="url(#statueCharge)"
              className={`intro-charge ${struck ? "is-struck" : ""}`} />
          </g>
          <path
            d="M75 20 Q90 6 105 20 Q120 40 110 60 L118 70 Q130 84 128 108 L120 130 L124 180 L110 220 L108 240 L72 240 L70 220 L56 180 L60 130 L52 108 Q50 84 62 70 L70 60 Q60 40 75 20 Z"
            fill="none" stroke="#f4c96a" strokeOpacity={struck ? 0.95 : 0.35} strokeWidth="1.5" className="intro-edge" />
          <g transform="translate(90 6)">
            <rect x="-14" y="-14" width="6" height="14" rx="1.5" fill="#f4c96a" />
            <rect x="8" y="-14" width="6" height="14" rx="1.5" fill="#f4c96a" />
            <circle r="10" cx="0" cy="6" fill="#0a0b10" stroke="#f4c96a" strokeWidth="1.5" />
            <text x="0" y="10" textAnchor="middle" fontSize="11" fontWeight="700"
              fill={struck ? "#fff6d6" : "#f4c96a"} style={{ fontFamily: "'Cormorant Garamond', serif" }}>P</text>
          </g>
        </svg>

        <svg className={`absolute left-1/2 -translate-x-1/2 -top-[70%] intro-bolt ${struck ? "is-struck" : ""}`}
          width="60" height="240" viewBox="0 0 60 240" aria-hidden>
          <path d="M34 0 L10 130 L28 130 L18 240 L52 96 L34 96 L44 0 Z"
            fill="#fff6d6" stroke="#f4c96a" strokeWidth="1.5"
            style={{ filter: "drop-shadow(0 0 14px #ffe6a8) drop-shadow(0 0 28px #f4c96a)" }} />
        </svg>

        <div className={`fixed inset-0 pointer-events-none intro-flash ${struck ? "is-struck" : ""}`} />

        {struck && (
          <div className="absolute left-1/2 top-[6%] -translate-x-1/2 pointer-events-none" aria-hidden>
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="absolute block rounded-full intro-spark"
                style={{
                  width: 4, height: 4,
                  background: "radial-gradient(circle, #fff6d6, #f4c96a 60%, transparent 70%)",
                  ["--sx" as string]: `${Math.cos((i / 12) * Math.PI * 2) * 90}px`,
                  ["--sy" as string]: `${Math.sin((i / 12) * Math.PI * 2) * 90}px`,
                  animationDelay: `${i * 20}ms`,
                }} />
            ))}
          </div>
        )}
      </div>

      {/* Crowd */}
      <div className="absolute inset-x-0 bottom-0 h-[38%] pointer-events-none" aria-hidden>
        {CROWD.map((c, i) => (
          <div key={i}
            className={`absolute bottom-[6%] intro-walker ${c.dir === "l" ? "from-l" : "from-r"} ${c.run ? "runs" : ""}`}
            style={{
              ["--target" as string]: `${c.target}%`,
              ["--dur" as string]: `${c.dur}s`,
              ["--delay" as string]: `${c.delay}s`,
              ["--scale" as string]: c.scale,
            }}>
            <Silhouette variant={c.variant} />
          </div>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="absolute intro-camera-flash"
            style={{
              left: `${28 + i * 14}%`, bottom: `${18 + (i % 2) * 6}%`,
              width: 10, height: 10, borderRadius: 999,
              background: "radial-gradient(circle, #fff, #ffe6a8 40%, transparent 60%)",
              animationDelay: `${3.4 + i * 0.6}s`,
            }} />
        ))}
      </div>

      {/* Gold dust */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="intro-dust absolute rounded-full"
            style={{
              left: `${(i * 13 + 5) % 100}%`, bottom: `-${(i * 5) % 30}px`,
              width: 2 + (i % 3), height: 2 + (i % 3),
              background: "radial-gradient(circle, rgba(246,210,122,0.9), transparent 70%)",
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${6 + (i % 4)}s`,
            }} />
        ))}
      </div>

      <div className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.65), transparent)" }} />
      <button onClick={() => finish()}
        className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full text-[11px] tracking-widest uppercase border border-white/20 bg-black/50 backdrop-blur text-white/80 hover:text-white transition-colors">
        Skip Intro
      </button>

      <div className={`absolute inset-x-0 bottom-0 pb-safe transition-all duration-700 ease-out ${
        panelIn ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}>
        <div className="mx-auto max-w-md px-5 pb-6">
          <div className="rounded-3xl border border-white/15 p-5 text-center intro-panel"
            style={{
              background: "linear-gradient(180deg, rgba(20,22,30,0.55), rgba(10,11,16,0.75))",
              backdropFilter: "blur(18px) saturate(140%)",
              boxShadow: "0 20px 60px -20px rgba(0,0,0,0.7), 0 0 40px -10px rgba(244,201,106,0.25)",
            }}>
            <p className="text-[10px] tracking-[0.32em] uppercase" style={{ color: "var(--plugu-gold, #f4c96a)" }}>
              Welcome to
            </p>
            <h1 className="mt-1 text-3xl font-bold plugu-wordmark">PlugU</h1>
            <p className="mt-2 text-sm text-white/75">
              Your campus. Your connections. Your opportunities.
            </p>
            <div className="mt-5 grid gap-2">
              <button onClick={() => finish("/signup")}
                className="tap py-3 rounded-2xl text-sm font-semibold text-black"
                style={{ background: "var(--plugu-gold, #f4c96a)", boxShadow: "0 10px 30px -10px rgba(244,201,106,0.55)" }}>
                Continue with School Email
              </button>
              <button onClick={() => finish("/login")}
                className="tap py-3 rounded-2xl text-sm font-medium text-white border border-white/20 bg-white/5">
                Log In
              </button>
              <button onClick={() => finish("/onboarding")}
                className="tap py-2 text-xs text-white/60 hover:text-white/90 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type CrowdEntry = {
  variant: 0 | 1 | 2 | 3;
  dir: "l" | "r";
  target: number;
  dur: number;
  delay: number;
  scale: number;
  run: boolean;
};

const CROWD: CrowdEntry[] = [
  { variant: 0, dir: "l", target: 34, dur: 4.5, delay: 0.2, scale: 1.0, run: true },
  { variant: 1, dir: "r", target: 62, dur: 4.2, delay: 0.4, scale: 0.95, run: true },
  { variant: 2, dir: "l", target: 42, dur: 5.0, delay: 1.0, scale: 0.9, run: false },
  { variant: 3, dir: "r", target: 56, dur: 5.2, delay: 1.4, scale: 0.88, run: false },
  { variant: 0, dir: "l", target: 26, dur: 6.0, delay: 1.8, scale: 0.8, run: false },
  { variant: 1, dir: "r", target: 70, dur: 6.4, delay: 2.1, scale: 0.78, run: false },
  { variant: 2, dir: "l", target: 20, dur: 7.0, delay: 2.6, scale: 0.7, run: false },
  { variant: 3, dir: "r", target: 78, dur: 7.2, delay: 3.0, scale: 0.72, run: false },
];

function Silhouette({ variant }: { variant: 0 | 1 | 2 | 3 }) {
  const accents = ["#f4c96a", "#7c5cff", "#5ecbff", "#ff8a5c"];
  const acc = accents[variant];
  return (
    <svg width="42" height="80" viewBox="0 0 42 80" className="intro-fig" aria-hidden>
      <rect x="6" y="28" width="10" height="18" rx="2" fill={acc} opacity="0.35" />
      <circle cx="21" cy="12" r="7" fill="#0a0b10" />
      <path d="M10 24 Q21 20 32 24 L30 52 L26 78 L16 78 L12 52 Z" fill="#0a0b10" />
      {variant % 2 === 0 && (
        <rect x="27" y="18" width="4" height="7" rx="0.6" fill={acc} opacity="0.9"
          style={{ filter: `drop-shadow(0 0 4px ${acc})` }} />
      )}
    </svg>
  );
}
