import { useEffect, useState } from "react";
import hero from "@/assets/plugu-hero-splash.png.asset.json";

/**
 * PlugU Splash — hero poster with gentle Ken Burns push, gold glow breathe,
 * and drifting gold dust. First visit 4.5s, return visit 2.5s.
 */
const SEEN_KEY = "plugu.splash.seen";

export function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);
  const [full, setFull] = useState(true);

  useEffect(() => {
    let firstVisit = true;
    try {
      firstVisit = !window.localStorage.getItem(SEEN_KEY);
      window.localStorage.setItem(SEEN_KEY, String(Date.now()));
    } catch {}
    setFull(firstVisit);
    setMounted(true);
    const duration = firstVisit ? 4500 : 2500;
    const t1 = setTimeout(() => setFading(true), duration - 500);
    const t2 = setTimeout(() => setGone(true), duration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!mounted || gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-500 ease-out ${fading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      aria-hidden="true"
    >
      {/* Hero poster with slow Ken Burns push */}
      <div className="absolute inset-0 cine-hero-push">
        <img
          src={hero.url}
          alt=""
          className="h-full w-full object-cover object-center"
          draggable={false}
        />
      </div>

      {/* Warm gold glow pulsing behind the statue's P */}
      <div
        className="absolute left-1/2 top-[38%] cine-hero-glow pointer-events-none"
        style={{
          width: "min(70vmin, 620px)",
          height: "min(70vmin, 620px)",
          background:
            "radial-gradient(circle, rgba(246,210,122,0.45) 0%, rgba(246,210,122,0.18) 35%, transparent 65%)",
          mixBlendMode: "screen",
          filter: "blur(4px)",
        }}
      />

      {/* Vignette + bottom fade */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:
          "radial-gradient(120% 90% at 50% 45%, transparent 0%, transparent 55%, rgba(0,0,0,0.7) 100%)",
      }} />
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none" style={{
        background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85))",
      }} />

      {/* Drifting gold dust */}
      {full && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="cine-dust absolute rounded-full"
              style={{
                left: `${(i * 8 + 7) % 100}%`,
                bottom: `-${(i * 5) % 40}px`,
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                background: "radial-gradient(circle, rgba(246,210,122,0.95), rgba(246,210,122,0) 70%)",
                filter: "blur(0.6px)",
                animationDelay: `${(i * 0.6) % 4}s`,
                animationDuration: `${6 + (i % 4)}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
