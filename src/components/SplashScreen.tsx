import { useEffect, useState } from "react";
import pluguLogo from "@/assets/plugu-logo.png";
import statue from "@/assets/plugu-statue.jpg.asset.json";

export function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t1 = setTimeout(() => setFading(true), 2400);
    const t2 = setTimeout(() => setGone(true), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!mounted || gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden transition-all duration-[600ms] ease-out ${fading ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"}`}
      aria-hidden="true"
    >
      <img
        src={statue.url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover scale-110"
        style={{ animation: "plugu-pop-in 1.6s ease-out both" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 55%, color-mix(in oklab, var(--plugu-purple) 35%, transparent), transparent 70%)",
        }}
      />

      <div className="relative h-full w-full flex flex-col items-center justify-center px-6 text-center">
        <div className="relative">
          <div
            className="absolute inset-0 -m-6 rounded-full blur-2xl opacity-70"
            style={{ background: "radial-gradient(circle, var(--plugu-gold), transparent 70%)" }}
          />
          <div className="relative grid place-items-center">
            <span
              className="absolute h-28 w-28 rounded-full border-2 border-transparent spin-slow"
              style={{
                borderTopColor: "var(--plugu-gold)",
                borderRightColor: "color-mix(in oklab, var(--plugu-purple) 70%, transparent)",
              }}
            />
            <img src={pluguLogo} alt="PlugU" className="relative h-20 w-20 object-contain" />
          </div>
        </div>
        <h1
          className="mt-6 text-4xl font-black tracking-[0.3em] slide-up"
          style={{ color: "var(--plugu-gold)", textShadow: "0 2px 30px var(--plugu-purple)" }}
        >
          PLUGU
        </h1>
        <p className="mt-2 text-xs tracking-widest text-white/70 uppercase slide-up" style={{ animationDelay: "0.1s" }}>
          Plugging you into campus...
        </p>

        <div className="mt-10 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full plugu-pulse" style={{ background: "var(--plugu-gold)" }} />
          <span className="h-2 w-2 rounded-full plugu-pulse" style={{ background: "var(--plugu-purple)", animationDelay: "0.2s" }} />
          <span className="h-2 w-2 rounded-full plugu-pulse" style={{ background: "var(--plugu-gold)", animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
}