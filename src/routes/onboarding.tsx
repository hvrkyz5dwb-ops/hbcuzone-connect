import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import pluguLogo from "@/assets/plugu-logo.png";
import statue from "@/assets/plugu-statue.jpg.asset.json";
import { usePersona, interestOptions, type PersonaInterest } from "@/hooks/use-persona";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — PlugU" }] }),
  component: Onboarding,
});

const STEPS = [
  { title: "Welcome to PlugU", body: "The campus hub built for HBCU students. Buy, sell, book, and link up." },
  { title: "Find your plug", body: "Tap Market for haircuts, food, rides, tutoring and more — all on your campus." },
  { title: "Live Campus Map", body: "See what's open, what's poppin, and how to get there in real time." },
  { title: "What are you into?", body: "Pick a few — we'll personalize your Campus Pulse.", picker: true },
  { title: "Get verified", body: "Add your .edu email for the trusted badge, campus chats, and student deals." },
  { title: "Become a KingPin", body: "Upgrade to boost listings, feature your vendor page, and rep your campus." },
];

function Onboarding() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const touchStartX = useRef<number | null>(null);
  const [persona, updatePersona] = usePersona();

  function toggleInterest(k: PersonaInterest) {
    const set = new Set(persona.interests);
    set.has(k) ? set.delete(k) : set.add(k);
    updatePersona({ interests: Array.from(set) });
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0 && i < STEPS.length - 1) setI(i + 1);
    if (dx > 0 && i > 0) setI(i - 1);
  }

  return (
    <AppShell title="WELCOME">
      <section
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative px-5 pt-10 text-center min-h-[80vh] overflow-hidden select-none"
      >
        <div className="absolute inset-0 -z-10">
          <img src={statue.url} alt="" className="h-full w-full object-cover blur-sm scale-110 opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(60% 40% at 50% 35%, color-mix(in oklab, var(--plugu-purple) 25%, transparent), transparent 70%)" }}
          />
        </div>
        <img src={pluguLogo} alt="" className="h-16 w-16 mx-auto drop-shadow-[0_0_30px_var(--plugu-gold)] pop-in" />
        <div key={i} className="slide-up">
          <h1 className="mt-4 text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>{step.title}</h1>
          <p className="mt-2 text-sm text-white/80 max-w-xs mx-auto">{step.body}</p>
          {step.picker && (
            <div className="mt-5 mx-auto max-w-xs grid grid-cols-2 gap-2">
              {interestOptions.map((opt) => {
                const active = persona.interests.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    onClick={() => toggleInterest(opt.key)}
                    className={`tap flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-xs text-left transition-colors ${
                      active
                        ? "border-primary bg-[image:var(--gradient-bronze)] text-primary-foreground"
                        : "border-white/15 bg-black/40 text-white/90"
                    }`}
                  >
                    <span>{opt.emoji}</span> <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <p className="mt-3 text-[10px] tracking-widest uppercase text-white/40">Swipe to continue →</p>

        <div className="mt-6 flex justify-center gap-1.5">
          {STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Go to step ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6" : "w-1.5 bg-border"}`}
              style={idx === i ? { background: "var(--plugu-gold)" } : undefined} />
          ))}
        </div>

        {last ? (
          <div className="mt-8 grid gap-3 max-w-xs mx-auto">
            <button
              onClick={() => navigate({ to: "/" })}
              className="tap py-3 rounded-2xl text-sm font-semibold text-black"
              style={{ background: "var(--plugu-gold)", boxShadow: "var(--shadow-gold)" }}
            >
              Get Started
            </button>
            <button
              onClick={() => navigate({ to: "/" })}
              className="tap py-3 rounded-2xl text-sm font-medium text-white border"
              style={{ borderColor: "var(--plugu-purple)", background: "color-mix(in oklab, var(--plugu-purple) 18%, transparent)" }}
            >
              Log In
            </button>
            <button
              onClick={() => navigate({ to: "/safety" })}
              className="tap py-3 rounded-2xl text-sm font-medium text-white/90 border border-white/15 bg-black/40 backdrop-blur"
            >
              Verify .edu Email
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-2 max-w-xs mx-auto">
            <button
              onClick={() => setI(i + 1)}
              className="tap py-3 rounded-2xl text-sm font-semibold text-black"
              style={{ background: "var(--plugu-gold)", boxShadow: "var(--shadow-gold)" }}
            >
              Next
            </button>
            <button onClick={() => navigate({ to: "/" })} className="tap text-xs text-white/60">
              Skip
            </button>
          </div>
        )}
      </section>
    </AppShell>
  );
}