import { useEffect } from "react";

/**
 * One-time welcome card shown right after the launch splash when a
 * student has just created their account. Auto-dismisses after ~2s.
 * Rendered pointer-events-none so the Home screen stays interactive.
 */
export function WelcomeOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 2000);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center pointer-events-none px-6"
      role="status"
      aria-live="polite"
    >
      <div
        className="plugu-welcome-card text-center rounded-3xl px-8 py-6 max-w-xs"
        style={{
          background: "linear-gradient(180deg, rgba(28,22,12,0.82), rgba(10,8,4,0.88))",
          border: "1px solid color-mix(in oklab, var(--plugu-gold) 45%, transparent)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.08) inset, 0 30px 80px -30px rgba(0,0,0,0.9), 0 0 60px -18px var(--plugu-gold)",
          backdropFilter: "blur(20px) saturate(150%)",
          WebkitBackdropFilter: "blur(20px) saturate(150%)",
        }}
      >
        <h2 className="text-2xl font-black plugu-antique-wordmark">Welcome to PlugU ⚡</h2>
        <p className="mt-2 text-[11px] tracking-[0.28em] uppercase text-white/65">
          Your campus just got connected
        </p>
        <div
          className="mx-auto mt-4 h-[3px] w-16 rounded-full"
          style={{ background: "var(--plugu-gold)", boxShadow: "0 0 12px var(--plugu-gold)" }}
        />
      </div>
    </div>
  );
}