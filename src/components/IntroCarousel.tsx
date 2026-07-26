// First-open intro shown to guests before they see the sign-up form.
// Explains what PlugU is across a few tap-through slides; the final
// "Continue" navigates to /auth. We mark it seen in localStorage so
// signed-out users who bounce don't sit through it again — they land
// straight on the auth screen next time.
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Store, Map as MapIcon, GraduationCap, ShieldCheck, ArrowRight } from "lucide-react";
import pluguLogo from "@/assets/plugu-charger-mark.png";

export const INTRO_SEEN_KEY = "plugu.intro.seen";

export function markIntroSeen() {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(INTRO_SEEN_KEY, "1"); } catch {}
}

export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return false;
  try { return !!window.localStorage.getItem(INTRO_SEEN_KEY); } catch { return false; }
}

type Slide = {
  eyebrow: string;
  title: string;
  body: string;
  Icon: typeof Store;
};

const slides: Slide[] = [
  {
    eyebrow: "Welcome to PlugU",
    title: "Your campus, plugged in.",
    body: "The verified marketplace and campus hub built for students — especially HBCU students.",
    Icon: GraduationCap,
  },
  {
    eyebrow: "Marketplace",
    title: "Buy, sell, and book on the yard.",
    body: "Haircuts, food, rides, tutoring, clothing, tickets — from real students, verified with a .edu email.",
    Icon: Store,
  },
  {
    eyebrow: "Live Campus Map",
    title: "Know what's poppin', right now.",
    body: "Food trucks, events, study spots, and where the yard is moving — in real time.",
    Icon: MapIcon,
  },
  {
    eyebrow: "Trust",
    title: "Students only. Verified.",
    body: "Every account is tied to a school email. No random accounts. No games.",
    Icon: ShieldCheck,
  },
];

export function IntroCarousel() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const last = i === slides.length - 1;
  const slide = slides[i];
  const Icon = slide.Icon;

  function next() {
    if (last) {
      markIntroSeen();
      navigate({ to: "/auth", search: { next: "/", mode: "" } });
      return;
    }
    setI((v) => v + 1);
  }

  function skip() {
    markIntroSeen();
    navigate({ to: "/auth", search: { next: "/", mode: "" } });
  }

  return (
    <div className="fixed inset-0 z-[70] bg-background text-foreground flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <img src={pluguLogo} alt="" className="h-7 w-7 object-contain drop-shadow-[0_0_10px_rgba(244,201,106,0.55)]" />
          <span className="font-bold tracking-[0.2em] text-xs plugu-wordmark">PLUGU</span>
        </div>
        <button
          onClick={skip}
          className="tap text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground"
        >
          Skip
        </button>
      </div>

      <div key={i} className="flex-1 px-6 flex flex-col justify-center animate-fade-in">
        <div
          className="mx-auto h-20 w-20 grid place-items-center rounded-3xl border border-primary/40 mb-8"
          style={{
            background: "radial-gradient(circle at 30% 25%, #1c1c1c 0%, #0a0a0a 70%)",
            boxShadow: "0 0 40px -12px rgba(244,201,106,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <Icon className="h-8 w-8" style={{ color: "var(--plugu-gold)" }} />
        </div>
        <p
          className="text-[11px] tracking-[0.3em] uppercase text-center mb-3"
          style={{ color: "var(--plugu-gold)" }}
        >
          {slide.eyebrow}
        </p>
        <h1 className="text-3xl font-black tracking-tight text-center leading-tight">
          {slide.title}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground text-center leading-relaxed max-w-sm mx-auto">
          {slide.body}
        </p>
      </div>

      <div className="px-6 pb-8 pt-4 mb-safe">
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className="h-1 rounded-full transition-all"
              style={{
                width: idx === i ? 22 : 6,
                background: idx === i ? "var(--plugu-gold)" : "hsl(var(--border))",
                boxShadow: idx === i ? "0 0 8px rgba(244,201,106,0.55)" : "none",
              }}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="tap w-full h-12 rounded-2xl font-bold text-black inline-flex items-center justify-center gap-2"
          style={{
            background: "var(--gradient-bronze)",
            boxShadow: "0 10px 30px -12px rgba(244,201,106,0.55)",
          }}
        >
          {last ? "Create your account" : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </button>
        {!last && (
          <p className="text-center text-[11px] text-muted-foreground mt-3">
            Tap continue · {i + 1} of {slides.length}
          </p>
        )}
      </div>
    </div>
  );
}