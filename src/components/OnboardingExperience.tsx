// Premium first-launch onboarding — black & gold, minimal, swipeable with
// drag-follow parallax. Pure CSS/SVG scenes: zero image downloads, every
// animation runs on transform/opacity so it holds 60fps.
//
// Used for guests on "/" and signed-in members after the launch splash.
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight, ArrowLeft, GraduationCap, HeartHandshake, Sparkles, Play, Pause,
} from "lucide-react";
import pluguLogo from "@/assets/plugu-charger-mark.png";

type SceneKind = "campus" | "market" | "income" | "trust";

type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  scene: SceneKind;
};

const SLIDES: Slide[] = [
  {
    id: "welcome",
    eyebrow: "Built for students",
    title: "Buy, sell, book and build on your campus.",
    body: "PlugU connects students and local communities at schools across the United States — one app for commerce, services, events and opportunities.",
    scene: "campus",
  },
  {
    id: "market",
    eyebrow: "Your campus, not a catalog",
    title: "Student services, booked on campus.",
    body: "Barbers, stylists, nail techs, photographers, tutors, cooks, drivers and creatives — students at your school and trusted people nearby, with pickup and meetup spots you already know.",
    scene: "market",
  },
  {
    id: "income",
    eyebrow: "Earn",
    title: "Turn Your Talent Into Income.",
    body: "Whether you're an entrepreneur, artist, barber, stylist, photographer, tutor, or creator, PlugU helps you reach more students and grow your business.",
    scene: "income",
  },
  {
    id: "trust",
    eyebrow: "Our mission",
    title: "Don't Run Off on the Plug.",
    body: "Help students earn while building real businesses. Every verified purchase helps create opportunities for students. Members who actively build their businesses may become eligible for future PlugU programs, grants, rewards, and community initiatives as they become available.",
    scene: "trust",
  },
];

const MISSION = [
  { Icon: Sparkles, text: "Create opportunities." },
  { Icon: HeartHandshake, text: "Support student entrepreneurs." },
  { Icon: GraduationCap, text: "Build stronger campuses." },
];

const MARKET_CARDS = [
  { emoji: "💈", label: "Cuts", price: "$20" },
  { emoji: "🍔", label: "Food", price: "$8" },
  { emoji: "📚", label: "Tutoring", price: "$15" },
  { emoji: "🚗", label: "Rides", price: "$5" },
  { emoji: "🎉", label: "Events", price: "$10" },
  { emoji: "👕", label: "Fits", price: "$25" },
];

const INCOME_CHIPS = [
  { text: "+$18 · Haircut", d: 650 },
  { text: "+$45 · Photoshoot", d: 900 },
  { text: "New booking 🎉", d: 1150 },
];

function SceneCampus() {
  return (
    <svg viewBox="0 0 320 210" className="ob-float w-full max-w-[320px]" aria-hidden="true">
      {/* campus silhouette */}
      <g opacity="0.95">
        <rect x="24" y="120" width="52" height="70" rx="4" fill="#1c1c1c" stroke="rgba(244,201,106,0.4)" />
        <rect x="92" y="96" width="66" height="94" rx="4" fill="#181818" stroke="rgba(244,201,106,0.5)" />
        <rect x="176" y="112" width="48" height="78" rx="4" fill="#1c1c1c" stroke="rgba(244,201,106,0.4)" />
        <rect x="240" y="132" width="56" height="58" rx="4" fill="#151515" stroke="rgba(244,201,106,0.32)" />
        {[110, 126, 142].map((y) => (
          <g key={y}>
            <rect x="104" y={y} width="8" height="6" rx="1" fill="rgba(244,201,106,0.55)" />
            <rect x="122" y={y} width="8" height="6" rx="1" fill="rgba(244,201,106,0.3)" />
            <rect x="140" y={y} width="8" height="6" rx="1" fill="rgba(244,201,106,0.45)" />
          </g>
        ))}
      </g>
      {/* glowing gold connections */}
      <g fill="none" stroke="var(--plugu-gold)" strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
        <path className="ob-line" d="M60 64 C 100 30, 140 92, 168 52" />
        <path className="ob-line" d="M168 52 C 200 22, 236 66, 262 44" style={{ animationDelay: "0.35s" }} />
        <path className="ob-line" d="M60 64 C 92 96, 210 96, 262 44" opacity="0.45" style={{ animationDelay: "0.7s" }} />
      </g>
      {/* student nodes */}
      {[
        { cx: 60, cy: 64, d: "0s" },
        { cx: 168, cy: 52, d: "0.4s" },
        { cx: 262, cy: 44, d: "0.8s" },
        { cx: 118, cy: 90, d: "1.2s" },
      ].map((n) => (
        <g key={`${n.cx}-${n.cy}`} className="ob-node" style={{ ["--d" as string]: n.d }}>
          <circle cx={n.cx} cy={n.cy} r="9" fill="#0a0a0a" stroke="var(--plugu-gold)" strokeWidth="1.6" />
          <circle cx={n.cx} cy={n.cy - 2.4} r="2.4" fill="var(--plugu-gold)" />
          <path d={`M${n.cx - 3.6} ${n.cy + 4.4} a3.6 3.2 0 0 1 7.2 0`} fill="var(--plugu-gold)" />
        </g>
      ))}
    </svg>
  );
}

function SceneMarket() {
  return (
    <div className="grid grid-cols-3 gap-2.5 w-full max-w-[320px]" aria-hidden="true">
      {MARKET_CARDS.map((c, i) => (
        <div
          key={c.label}
          className="ob-card rounded-2xl border border-white/10 px-2 py-3 text-center"
          style={{
            ["--d" as string]: `${i * 90}ms`,
            background: "linear-gradient(170deg, #161616, #0b0b0b)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div className="text-2xl">{c.emoji}</div>
          <p className="mt-1 text-[10px] font-semibold text-white/85">{c.label}</p>
          <p className="text-[10px] font-bold" style={{ color: "var(--plugu-gold)" }}>{c.price}</p>
        </div>
      ))}
    </div>
  );
}

function SceneIncome() {
  const bars = [
    { h: 46, d: 150 },
    { h: 72, d: 300 },
    { h: 104, d: 450 },
    { h: 140, d: 600 },
  ];
  return (
    <div className="relative w-full max-w-[320px]" aria-hidden="true">
      <div className="flex items-end justify-center gap-4 h-[150px]">
        {bars.map((b, i) => (
          <div
            key={i}
            className="ob-bar w-11 rounded-t-xl"
            style={{
              height: b.h,
              ["--d" as string]: `${b.d}ms`,
              background:
                i === bars.length - 1
                  ? "linear-gradient(180deg, #f6d27a, #b58a2e)"
                  : "linear-gradient(180deg, #242424, #101010)",
              border: "1px solid rgba(244,201,106,0.35)",
              boxShadow: i === bars.length - 1 ? "0 0 26px -6px rgba(244,201,106,0.75)" : "none",
            }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 -top-2 flex flex-col items-start gap-2">
        {INCOME_CHIPS.map((c) => (
          <span
            key={c.text}
            className="ob-chip rounded-full border px-3 py-1 text-[11px] font-semibold"
            style={{
              ["--d" as string]: `${c.d}ms`,
              color: "#ffe9b0",
              borderColor: "rgba(244,201,106,0.45)",
              background: "rgba(10,10,10,0.85)",
              boxShadow: "0 0 18px -8px rgba(244,201,106,0.8)",
            }}
          >
            {c.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function SceneTrust() {
  return (
    <div className="ob-float relative grid place-items-center" aria-hidden="true">
      <div
        className="h-28 w-28 rounded-full grid place-items-center"
        style={{
          background: "radial-gradient(circle at 32% 26%, #1d1d1d 0%, #0a0a0a 62%, #000 100%)",
          border: "1px solid rgba(244,201,106,0.6)",
          boxShadow: "0 0 44px -10px rgba(244,201,106,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <img
          src={pluguLogo}
          alt=""
          className="h-14 w-14 object-contain"
          style={{ filter: "drop-shadow(0 0 12px rgba(244,201,106,0.8))" }}
        />
      </div>
      <div
        className="absolute inset-[-14px] rounded-full pointer-events-none"
        style={{ border: "1px dashed rgba(244,201,106,0.28)" }}
      />
    </div>
  );
}

export function OnboardingExperience({ onComplete }: { onComplete: () => void }) {
  const [i, setI] = useState(0);
  const [dragX, setDragX] = useState(0);
  const drag = useRef<{ startX: number; active: boolean }>({ startX: 0, active: false });
  // Double-tap / navigation-loop guard. A ref (not state) so the very next
  // synthetic click in the same frame is ignored without re-rendering or
  // adding any perceptible delay to the first tap.
  const finishing = useRef(false);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;
  const isTrust = slide.scene === "trust";

  // Always safe to call: the first call runs immediately, later ones no-op.
  function finish() {
    if (finishing.current) return;
    finishing.current = true;
    onComplete();
    // Release the lock if the screen is somehow still mounted (e.g. a slow
    // route transition), so the button can never become permanently dead.
    window.setTimeout(() => { finishing.current = false; }, 1200);
  }

  function go(next: number) {
    setI(Math.max(0, Math.min(SLIDES.length - 1, next)));
    setDragX(0);
  }

  function onPointerDown(e: React.PointerEvent) {
    drag.current = { startX: e.clientX, active: true };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    // Resist at the edges so the card feels weighty, not loose.
    const atEdge = (i === 0 && dx > 0) || (last && dx < 0);
    setDragX(atEdge ? dx * 0.3 : dx);
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!drag.current.active) return;
    drag.current.active = false;
    const dx = e.clientX - drag.current.startX;
    if (dx < -70 && !last) go(i + 1);
    else if (dx > 70 && i > 0) go(i - 1);
    else setDragX(0);
  }

  const dragTransition = drag.current.active
    ? "none"
    : "transform 0.38s cubic-bezier(0.22,1,0.36,1)";

  return (
    <div
      className="ob-root fixed inset-0 z-[80] bg-black text-foreground flex flex-col select-none overscroll-none"
      role="dialog"
      aria-label="Welcome to PlugU"
    >
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col min-h-0">
        {/* Header — brand + Skip */}
        <div className="flex items-center justify-between px-5 pb-2" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 18px)" }}>
          <div className="flex items-center gap-2">
            <img src={pluguLogo} alt="" className="h-7 w-7 object-contain drop-shadow-[0_0_10px_rgba(244,201,106,0.55)]" />
            <span className="font-bold tracking-[0.2em] text-xs plugu-wordmark">PLUGU</span>
          </div>
          <button
            type="button"
            onClick={finish}
            className="tap text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground px-3 py-2"
          >
            Skip
          </button>
        </div>

        {/* Slide — drag anywhere. Scrolls on short screens so the copy can
            never grow under, or overlap, the fixed footer button. */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col justify-center px-7 py-2 touch-pan-y"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div style={{ transform: `translate3d(${dragX}px,0,0)`, transition: dragTransition }}>
            {/* Illustration layer lags slightly against the copy — parallax */}
            <div
              className="flex justify-center mb-9"
              style={{ transform: `translate3d(${dragX * -0.14}px,0,0)`, transition: dragTransition }}
            >
              {slide.scene === "campus" && <SceneCampus key={i} />}
              {slide.scene === "market" && <SceneMarket key={i} />}
              {slide.scene === "income" && <SceneIncome key={i} />}
              {slide.scene === "trust" && <SceneTrust key={i} />}
            </div>

            <div key={i} className="ob-copy text-center">
              <p className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--plugu-gold)" }}>
                {slide.eyebrow}
              </p>
              <h1 className="text-[28px] font-black tracking-tight leading-[1.15]">{slide.title}</h1>
              {isTrust && (
                <p className="mt-3 text-sm font-medium text-white/85 leading-relaxed">
                  PlugU was created to help students earn while learning how to build real businesses.
                </p>
              )}
              <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {slide.body}
              </p>
              {isTrust && (
                <ul className="mt-5 mx-auto max-w-[280px] space-y-2.5 text-left">
                  {MISSION.map((m, idx) => (
                    <li
                      key={m.text}
                      className="ob-chip flex items-center gap-3 rounded-2xl border border-white/10 px-3.5 py-2.5"
                      style={{
                        ["--d" as string]: `${350 + idx * 140}ms`,
                        background: "linear-gradient(170deg, #151515, #0a0a0a)",
                      }}
                    >
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-xl"
                        style={{
                          border: "1px solid rgba(244,201,106,0.45)",
                          background: "radial-gradient(circle at 30% 25%, #1c1c1c, #0a0a0a)",
                          boxShadow: "0 0 14px -6px rgba(244,201,106,0.7)",
                        }}
                      >
                        <m.Icon className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
                      </span>
                      <span className="text-[13px] font-semibold text-white/90">{m.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Footer — dots + Next. Never scrolls away, always on top of the
            slide layer, and sits above the home indicator / notch insets. */}
        <div
          className="relative z-10 shrink-0 px-7 pt-3 bg-black"
          style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 20px), 24px)" }}
        >
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="h-1 rounded-full transition-all"
                style={{
                  width: idx === i ? 22 : 6,
                  background: idx === i ? "var(--plugu-gold)" : "rgba(255,255,255,0.18)",
                  boxShadow: idx === i ? "0 0 8px rgba(244,201,106,0.55)" : "none",
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => (last ? finish() : go(i + 1))}
            className="tap w-full h-12 rounded-2xl font-bold text-black inline-flex items-center justify-center gap-2"
            style={{
              background: "var(--gradient-bronze)",
              boxShadow: "0 10px 30px -12px rgba(244,201,106,0.55)",
            }}
          >
            {last ? "Continue as Guest" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-center text-[11px] text-muted-foreground mt-3">
            {last ? "Browse PlugU without an account" : `Swipe or tap Next · ${i + 1} of ${SLIDES.length}`}
          </p>
        </div>
      </div>
    </div>
  );
}
