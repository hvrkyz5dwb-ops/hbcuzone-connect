import { useEffect, useState } from "react";
import pluguLogo from "@/assets/plugu-logo.png";
import statue from "@/assets/plugu-statue.jpg.asset.json";

export function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t1 = setTimeout(() => setFading(true), 2700);
    const t2 = setTimeout(() => setGone(true), 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!mounted || gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-[600ms] ease-out ${fading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      aria-hidden="true"
    >
      {/* Stage: slowly rotates around the statue */}
      <div className="absolute inset-0 splash-stage">
        {/* Statue silhouette → illuminated */}
        <img
          src={statue.url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover splash-statue"
        />
        {/* Ambient warm key-light wash */}
        <div className="absolute inset-0 splash-keylight" />
        {/* Deep vignette to keep edges cinematic */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 50%, transparent 0%, transparent 40%, rgba(0,0,0,0.85) 95%)",
          }}
        />
      </div>

      {/* Electric plug glow + traveling particles */}
      <div className="splash-plug">
        <span className="splash-plug-core" />
        <span className="splash-plug-halo" />
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="splash-particle"
            style={{ animationDelay: `${0.4 + i * 0.18}s`, left: `${-6 + i * 3}px` }}
          />
        ))}
      </div>

      {/* Logo + slogan */}
      <div className="relative h-full w-full flex flex-col items-center justify-end pb-[18vh] px-6 text-center">
        <img
          src={pluguLogo}
          alt="PlugU"
          className="h-14 w-14 object-contain splash-logo"
        />
        <h1
          className="mt-3 text-2xl font-semibold tracking-[0.45em] splash-wordmark"
          style={{ color: "rgba(255,255,255,0.96)" }}
        >
          PLUGU
        </h1>
        <p className="mt-2 text-[11px] tracking-[0.35em] uppercase splash-slogan text-white/70">
          Connect · Build · Elevate
        </p>
      </div>
    </div>
  );
}