// First-launch coach-mark tour — highlights Home, Marketplace, Events,
// Messages, and Profile with a gold ring cutout and one-line tips.
// Next / Back / Finish, skippable, and stored as done so it never
// replays. Targets are [data-tour="<key>"] elements; a missing target
// is skipped so the tour survives layout changes.
import { useEffect, useRef, useState } from "react";

type Step = { key: string; title: string; body: string };

const STEPS: Step[] = [
  { key: "home", title: "Home", body: "Your daily campus feed lives here." },
  { key: "market", title: "Marketplace", body: "Buy and sell with verified students." },
  { key: "events", title: "Events", body: "Discover what's happening on campus." },
  { key: "inbox", title: "Messages", body: "Connect safely with buyers and sellers." },
  { key: "profile", title: "Profile", body: "Manage your business and activity." },
];

const PAD = 8;
const CARD_W = 280;

export function CoachMarks({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [leaving, setLeaving] = useState(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; });

  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  // Measure (and scroll to) the current target; auto-skip missing ones.
  useEffect(() => {
    const el = document.querySelector(`[data-tour="${step.key}"]`);
    if (!el) {
      const t = window.setTimeout(() => {
        if (i < STEPS.length - 1) setI(i + 1);
        else onDoneRef.current();
      }, 140);
      return () => window.clearTimeout(t);
    }
    setRect(null);
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    let alive = true;
    const place = () => { if (alive) setRect(el.getBoundingClientRect()); };
    const t = window.setTimeout(place, 420);
    window.addEventListener("resize", place);
    return () => {
      alive = false;
      window.clearTimeout(t);
      window.removeEventListener("resize", place);
    };
  }, [i, step.key]);

  function finish() {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => onDoneRef.current(), 240);
  }
  function advance() {
    if (last) finish();
    else setI(i + 1);
  }

  // Keyboard: arrows move, Escape finishes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight") advance();
      if (e.key === "ArrowLeft" && i > 0) setI(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, last, leaving]);

  const vw = typeof window === "undefined" ? 390 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const cardLeft = rect
    ? Math.max(12, Math.min(vw - CARD_W - 12, rect.left + rect.width / 2 - CARD_W / 2))
    : (vw - CARD_W) / 2;
  const below = rect ? rect.top < vh * 0.5 : true;
  const cardTop = rect
    ? below
      ? Math.min(vh - 220, rect.bottom + PAD + 14)
      : Math.max(14, rect.top - PAD - 196)
    : vh * 0.4;

  return (
    <div
      className="cm-root"
      style={{ opacity: leaving ? 0 : 1 }}
      role="dialog"
      aria-label="Quick tutorial"
      aria-modal="true"
    >
      {/* Dimmed backdrop with the spotlight hole punched by the ring shadow */}
      {rect && (
        <span
          className="cm-ring"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
          aria-hidden="true"
        />
      )}
      {!rect && <span className="absolute inset-0 bg-black/70" aria-hidden="true" />}

      {/* Tip card */}
      <div className="cm-card" style={{ left: cardLeft, top: cardTop, width: CARD_W }}>
        <div
          className="rounded-3xl border px-5 py-4"
          style={{
            background: "linear-gradient(180deg, rgba(24,20,12,0.92), rgba(10,9,5,0.95))",
            borderColor: "rgba(244,201,106,0.4)",
            boxShadow: "0 24px 60px -24px rgba(0,0,0,0.9), 0 0 40px -18px rgba(244,201,106,0.5)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] tracking-[0.28em] uppercase" style={{ color: "var(--plugu-gold)" }}>
                {i + 1} of {STEPS.length}
              </p>
              <h3 className="mt-1 text-base font-bold">{step.title}</h3>
            </div>
            <button
              type="button"
              onClick={finish}
              className="tap text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground px-2 py-1"
            >
              Skip
            </button>
          </div>
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{step.body}</p>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setI(i - 1)}
              disabled={i === 0}
              className="tap min-h-[40px] rounded-xl border border-white/15 px-4 text-xs font-semibold text-white/85 disabled:opacity-35"
            >
              Back
            </button>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {STEPS.map((s, idx) => (
                <span
                  key={s.key}
                  className="h-1 rounded-full"
                  style={{
                    width: idx === i ? 16 : 5,
                    background: idx === i ? "var(--plugu-gold)" : "rgba(255,255,255,0.18)",
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={advance}
              className="tap min-h-[40px] rounded-xl px-4 text-xs font-bold text-black"
              style={{
                background: "var(--gradient-bronze)",
                boxShadow: "0 8px 22px -10px rgba(244,201,106,0.6)",
              }}
            >
              {last ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}