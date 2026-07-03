import { useEffect } from "react";
import hero from "@/assets/plugu-hero-splash.png.asset.json";

/**
 * Login → Home bridge. Storm dissolves into warm sunrise, camera pushes into
 * the giant P until it fills the screen and the Home feed takes over.
 */
export function LoginTransition({ onComplete, duration = 2400 }: { onComplete: () => void; duration?: number }) {
  useEffect(() => {
    // Signal AppShell to skip its own splash on the next mount — the login
    // bridge already showed the statue, we don't want it twice in a row.
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("plugu.splash.skipNext", "1");
      }
    } catch {}
    const t = setTimeout(onComplete, duration);
    return () => clearTimeout(t);
  }, [onComplete, duration]);

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden" aria-hidden>
      {/* Storm fading out */}
      <div className="absolute inset-0" style={{ animation: "plugu-warm-clear 1.4s ease-in reverse both" }}>
        <img src={hero.url} alt="" className="h-full w-full object-cover" style={{ filter: "brightness(0.55) contrast(1.1)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,12,18,0.55), rgba(0,0,0,0.85))" }} />
      </div>

      {/* Warm sunrise clearing in */}
      <div className="absolute inset-0 cine-warm">
        <img src={hero.url} alt="" className="h-full w-full object-cover" style={{ filter: "brightness(1.05) contrast(1.05) saturate(1.05)" }} />
        <div className="absolute inset-0" style={{
          background:
            "radial-gradient(70% 55% at 50% 22%, rgba(255,215,150,0.55), transparent 60%)," +
            "radial-gradient(60% 50% at 50% 45%, rgba(246,210,122,0.35), transparent 65%)," +
            "linear-gradient(180deg, rgba(255,220,170,0.15), rgba(0,0,0,0.6) 75%)",
        }} />
      </div>

      {/* Giant P pushes forward */}
      <div
        className="absolute left-1/2 top-1/2 cine-push-p"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "min(72vw, 520px)",
          fontWeight: 700,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "2px rgba(246,210,122,0.95)",
          textShadow: "0 0 40px rgba(246,210,122,0.6), 0 0 120px rgba(246,210,122,0.45)",
          filter: "drop-shadow(0 0 50px rgba(246,210,122,0.7))",
        }}
      >
        P
      </div>

      {/* Gold dust remains */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="cine-dust absolute rounded-full"
            style={{
              left: `${(i * 11 + 9) % 100}%`,
              bottom: `-${(i * 4) % 40}px`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              background: "radial-gradient(circle, rgba(246,210,122,0.95), rgba(246,210,122,0) 70%)",
              animationDelay: `${(i * 0.5) % 4}s`,
              animationDuration: `${5 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      {/* Final white-out at the end */}
      <div className="absolute inset-0 bg-[#F4C96A]/0" style={{ animation: "plugu-warm-clear 0.5s ease-in 1.9s forwards" }} />
    </div>
  );
}