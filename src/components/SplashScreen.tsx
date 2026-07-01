import { useEffect, useState } from "react";
import pluguLogo from "@/assets/plugu-logo.png";
import statue from "@/assets/plugu-statue.jpg.asset.json";

/**
 * PlugU Cinematic Splash v2
 * Layered storm sky → distant lightning → camera push → bolt strike →
 * statue + giant P ignite → breathing glow. First visit 6s, return 3.5s.
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
    const duration = firstVisit ? 6000 : 3500;
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
      {/* Camera push wraps everything */}
      <div className="absolute inset-0 cine-push">
        {/* z-0 night sky */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(120% 90% at 50% 42%, #0a0d14 0%, #05070c 55%, #000 100%)",
        }} />

        {/* z-1 cloud bands, 3 parallax layers */}
        <div className="absolute inset-0 cine-cloud-a" style={{
          background: "radial-gradient(70% 45% at 20% 20%, rgba(70,80,100,0.55), transparent 65%),radial-gradient(60% 40% at 80% 15%, rgba(45,55,75,0.6), transparent 65%)",
          filter: "blur(14px)",
        }} />
        <div className="absolute inset-0 cine-cloud-b" style={{
          background: "radial-gradient(80% 50% at 50% 8%, rgba(35,40,55,0.75), transparent 70%),radial-gradient(50% 35% at 15% 30%, rgba(50,60,80,0.5), transparent 65%)",
          filter: "blur(10px)",
        }} />
        <div className="absolute inset-0 cine-cloud-c" style={{
          background: "radial-gradient(65% 40% at 70% 25%, rgba(25,30,45,0.7), transparent 65%)",
          filter: "blur(8px)",
        }} />

        {/* z-2 distant lightning ambience */}
        {full && <div className="absolute inset-0 cine-distant" style={{
          background: "radial-gradient(60% 45% at 30% 20%, rgba(200,225,255,0.75), transparent 55%)",
          mixBlendMode: "screen",
        }} />}

        {/* z-3 volumetric fog */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 cine-fog" style={{
          background: "linear-gradient(180deg, transparent, rgba(18,22,32,0.75) 60%, rgba(0,0,0,0.95))",
        }} />

        {/* z-4 gold HUD rings */}
        <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ width: "min(92vmin, 720px)", height: "min(92vmin, 720px)" }}>
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full cine-hud-cw" style={{ opacity: 0.35 }}>
            <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(246,210,122,0.5)" strokeWidth="0.3" strokeDasharray="1 3" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(246,210,122,0.35)" strokeWidth="0.2" strokeDasharray="0.8 6" />
          </svg>
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full cine-hud-ccw" style={{ opacity: 0.3 }}>
            <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(246,210,122,0.45)" strokeWidth="0.25" strokeDasharray="2 4" />
            <circle cx="100" cy="100" r="58" fill="none" stroke="rgba(246,210,122,0.35)" strokeWidth="0.2" strokeDasharray="0.6 3" />
          </svg>
        </div>

        {/* z-5 giant P */}
        <div
          className={full ? "absolute left-1/2 top-[44%] cine-ignite-p" : "absolute left-1/2 top-[44%]"}
          style={{
            transform: "translate(-50%,-50%)",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "min(72vw, 520px)",
            fontWeight: 700,
            lineHeight: 1,
            color: "transparent",
            WebkitTextStroke: "2px rgba(246,210,122,0.9)",
            textShadow: "0 0 40px rgba(246,210,122,0.55), 0 0 100px rgba(246,210,122,0.4)",
            filter: "drop-shadow(0 0 30px rgba(246,210,122,0.6))",
          }}
        >
          P
        </div>

        {/* z-6 statue */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[78vh] w-[78vh] max-h-[720px] max-w-[720px] cine-breathe">
          <img src={statue.url} alt="" className="absolute inset-0 h-full w-full object-contain" style={{ filter: "brightness(0.45) contrast(1.15) saturate(0.7)" }} />
          <img src={statue.url} alt="" className="absolute inset-0 h-full w-full object-contain cine-ignite-p" style={{ filter: "brightness(1.1) contrast(1.2) saturate(1.05) drop-shadow(0 0 32px rgba(246,210,122,0.75))", mixBlendMode: "screen", opacity: 0.92 }} />
          <div className="absolute left-1/2 bottom-[5%] -translate-x-1/2 text-center cine-ignite-p">
            <div className="text-[10px] tracking-[0.55em]" style={{ color: "rgba(246,210,122,0.9)", textShadow: "0 0 12px rgba(246,210,122,0.6)" }}>PLUGU</div>
          </div>
        </div>

        {/* z-7 rain streaks (subtle) */}
        {full && (
          <div className="absolute inset-0 cine-rain pointer-events-none" style={{
            backgroundImage:
              "linear-gradient(180deg, transparent 0, rgba(200,220,255,0.18) 50%, transparent 100%)," +
              "linear-gradient(180deg, transparent 0, rgba(200,220,255,0.12) 50%, transparent 100%)," +
              "linear-gradient(180deg, transparent 0, rgba(200,220,255,0.15) 50%, transparent 100%)",
            backgroundSize: "2px 40px, 1px 60px, 2px 30px",
            backgroundRepeat: "repeat",
            mixBlendMode: "screen",
            opacity: 0.5,
          }} />
        )}

        {/* z-7 floating gold dust */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="cine-dust absolute rounded-full"
              style={{
                left: `${(i * 7 + 11) % 100}%`,
                bottom: `-${(i * 6) % 40}px`,
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                background: "radial-gradient(circle, rgba(246,210,122,0.95), rgba(246,210,122,0) 70%)",
                filter: "blur(0.6px)",
                animationDelay: `${(i * 0.7) % 6}s`,
                animationDuration: `${6 + (i % 5)}s`,
              }}
            />
          ))}
        </div>

        {/* z-8 lightning bolt to plug */}
        {full && (
          <svg className="absolute inset-0 w-full h-full cine-bolt pointer-events-none" viewBox="0 0 400 800" preserveAspectRatio="none" aria-hidden>
            <path
              d="M210 0 L200 180 L230 200 L190 340 L215 360 L200 430"
              fill="none"
              stroke="rgba(230,240,255,0.95)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 8px rgba(200,225,255,0.95)) drop-shadow(0 0 22px rgba(180,215,255,0.7))" }}
            />
          </svg>
        )}

        {/* z-9 flash */}
        {full && <div className="absolute inset-0 bg-white cine-flash pointer-events-none" />}

        {/* vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(120% 90% at 50% 55%, transparent 0%, transparent 45%, rgba(0,0,0,0.9) 95%)",
        }} />
      </div>

      {/* Wordmark */}
      <div className="relative h-full w-full flex flex-col items-center justify-end pb-[9vh] px-6 text-center pointer-events-none">
        <img src={pluguLogo} alt="" className="h-9 w-9 object-contain splash-logo" />
        <h1 className="mt-2 text-lg font-semibold tracking-[0.5em] splash-wordmark" style={{ color: "rgba(255,255,255,0.95)" }}>PLUGU</h1>
        <p className="mt-1 text-[10px] tracking-[0.4em] uppercase splash-slogan text-white/55">The Official HBCU Hub</p>
      </div>
    </div>
  );
}