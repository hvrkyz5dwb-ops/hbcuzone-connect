import { useEffect, useState } from "react";

export function CampusUnlockAnimation({ campus, onDone }: { campus: string; onDone?: () => void }) {
  const [phase, setPhase] = useState<"charge" | "burst" | "done">("charge");

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("burst"), 900);
    const t2 = window.setTimeout(() => setPhase("done"), 2400);
    const t3 = window.setTimeout(() => onDone?.(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center"
      style={{
        background:
          "radial-gradient(circle at 50% 45%, rgba(244,201,106,0.35), rgba(0,0,0,0.95) 60%)",
        animation: "plugu-fade-up 0.4s ease-out both",
      }}
    >
      <div className="text-center px-6">
        <div
          className="mx-auto h-32 w-32 rounded-full relative"
          style={{
            background: "radial-gradient(circle at 30% 30%, #f4c96a 0%, #7a5522 45%, #1c1207 90%)",
            boxShadow:
              phase === "burst"
                ? "0 0 200px 40px rgba(244,201,106,0.75), 0 0 60px 10px #f4c96a"
                : "0 0 40px rgba(244,201,106,0.5)",
            transition: "box-shadow 1.2s ease-out",
            animation: phase === "charge" ? "plugu-pulse-slow 0.9s ease-out both" : undefined,
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 210deg, transparent 0deg, rgba(255,240,200,0.9) 90deg, transparent 240deg)",
              opacity: phase === "burst" ? 1 : 0.6,
              filter: "blur(8px)",
              transition: "opacity 0.6s",
            }}
          />
          <span className="absolute inset-0 grid place-items-center text-4xl font-black text-black">P</span>
        </div>

        <p className="mt-6 text-[10px] tracking-[0.35em] uppercase text-white/70">Campus Unlocked</p>
        <h2 className="mt-1 text-2xl font-black plugu-antique-wordmark">{campus}</h2>
        <p className="mt-2 text-xs text-white/60">You made it happen. Welcome to the yard.</p>
      </div>

      <style>{`
        @keyframes plugu-pulse-slow {
          0%   { transform: scale(0.85); opacity: 0.7; }
          70%  { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}