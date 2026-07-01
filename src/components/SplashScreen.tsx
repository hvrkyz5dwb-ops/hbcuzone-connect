import { useEffect, useState } from "react";
import pluguLogo from "@/assets/plugu-logo.png";
import statue from "@/assets/plugu-statue.jpg.asset.json";

/**
 * Cinematic Splash — Storm → Lightning → Statue Energized → Orbiting Features.
 * First visit: full 6s sequence. Subsequent visits: short 3.5s ambient pass.
 */
const FEATURES = [
  "Marketplace", "Student Businesses", "Campus Map", "HBCUS™",
  "Scholarships", "Internships", "Campus Economy", "Plug of the Year",
  "Verified Plugs", "Career & Money", "Events", "Food",
  "Rides", "Tutors", "Photographers", "Housing",
  "School Rankings", "Live Scores", "Networking",
];
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

  const orbitTracks = [
    { className: "plugu-orbit-slow", counter: "plugu-orbit-counter 42s linear infinite", radius: 46, items: FEATURES.filter((_, i) => i % 3 === 0) },
    { className: "plugu-orbit-med",  counter: "plugu-orbit-spin 32s linear infinite",    radius: 34, items: FEATURES.filter((_, i) => i % 3 === 1) },
    { className: "plugu-orbit-fast", counter: "plugu-orbit-counter 24s linear infinite", radius: 22, items: FEATURES.filter((_, i) => i % 3 === 2) },
  ];

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-500 ease-out ${fading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      aria-hidden="true"
    >
      {/* === STORM SKY LAYERS === */}
      <div className="absolute inset-0 plugu-storm-clear" style={{ animationDelay: full ? "5s" : "2.5s" }}>
        {/* deep night gradient */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(120% 90% at 50% 40%, #0a0d14 0%, #05070c 55%, #000 100%)",
        }} />
        {/* drifting cloud bands */}
        <div className="absolute inset-0 plugu-clouds" style={{
          background:
            "radial-gradient(60% 40% at 20% 25%, rgba(60,70,90,0.55), transparent 60%)," +
            "radial-gradient(70% 45% at 75% 20%, rgba(40,50,70,0.65), transparent 65%)," +
            "radial-gradient(80% 50% at 50% 10%, rgba(30,35,50,0.75), transparent 70%)",
          filter: "blur(6px)",
        }} />
        {/* fog */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 plugu-fog" style={{
          background: "linear-gradient(180deg, transparent, rgba(20,24,34,0.7) 60%, rgba(0,0,0,0.9))",
        }} />
        {/* lightning flashes (only in full cinematic) */}
        {full && (
          <>
            <div className="absolute inset-0 plugu-lightning-1" style={{
              background: "radial-gradient(70% 60% at 50% 30%, rgba(200,225,255,0.95), transparent 55%)",
              mixBlendMode: "screen",
            }} />
            <div className="absolute inset-0 plugu-lightning-2" style={{
              background: "radial-gradient(50% 55% at 60% 25%, rgba(220,235,255,0.85), transparent 60%)",
              mixBlendMode: "screen",
            }} />
          </>
        )}
      </div>

      {/* === DAYBREAK LAYER (fades in as storm clears) === */}
      <div
        className="absolute inset-0 plugu-daybreak pointer-events-none"
        style={{
          animationDelay: full ? "5s" : "2.5s",
          background:
            "radial-gradient(80% 60% at 50% 70%, rgba(255,205,140,0.35), transparent 60%)," +
            "linear-gradient(180deg, #1a1408 0%, #0d0a06 60%, #000 100%)",
        }}
      />

      {/* === CINEMATIC STAGE === */}
      <div className="absolute inset-0 plugu-splash-stage">
        {/* Oversized glowing "P" behind statue */}
        <div
          className="absolute left-1/2 top-[42%] plugu-p-power"
          style={{
            transform: "translate(-50%, -50%)",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "min(72vw, 520px)",
            fontWeight: 700,
            lineHeight: 1,
            color: "transparent",
            WebkitTextStroke: "2px rgba(246,210,122,0.85)",
            textShadow:
              "0 0 40px rgba(246,210,122,0.55), 0 0 90px rgba(246,210,122,0.35)",
            filter: "drop-shadow(0 0 30px rgba(246,210,122,0.6))",
          }}
        >
          P
        </div>

        {/* Statue */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[78vh] w-[78vh] max-h-[720px] max-w-[720px]">
          {/* dim base render */}
          <img
            src={statue.url}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
            style={{ filter: "brightness(0.35) contrast(1.15) saturate(0.6)" }}
          />
          {/* energized overlay — pops in after lightning */}
          <img
            src={statue.url}
            alt=""
            className="absolute inset-0 h-full w-full object-contain plugu-energize"
            style={{
              filter: "brightness(1.1) contrast(1.2) saturate(1.05) drop-shadow(0 0 32px rgba(246,210,122,0.75))",
              mixBlendMode: "screen",
              opacity: 0.9,
            }}
          />
          {/* Pedestal PLUGU wordmark */}
          <div
            className="absolute left-1/2 bottom-[6%] -translate-x-1/2 text-center plugu-energize"
            style={{ animationDelay: "2.2s" }}
          >
            <div
              className="text-[10px] tracking-[0.55em]"
              style={{ color: "rgba(246,210,122,0.9)", textShadow: "0 0 12px rgba(246,210,122,0.6)" }}
            >
              PLUGU
            </div>
          </div>
        </div>

        {/* Orbiting feature chips */}
        <div className="absolute inset-0 pointer-events-none">
          {orbitTracks.map((track, ti) => (
            <div
              key={ti}
              className={`absolute left-1/2 top-[46%] ${track.className}`}
              style={{
                width: `${track.radius * 2}vmin`,
                height: `${track.radius * 2}vmin`,
                transform: "translate(-50%, -50%)",
                animationDelay: full ? "2.4s" : "0s",
                opacity: 0,
                animationFillMode: "forwards, none",
              }}
            >
              <div
                className="absolute inset-0"
                style={{ animation: "plugu-daybreak 1.2s ease-out 2.6s both" }}
              >
                {track.items.map((label, i) => {
                  const angle = (i / track.items.length) * 360;
                  return (
                    <div
                      key={label}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `rotate(${angle}deg) translateY(-${track.radius}vmin) rotate(-${angle}deg)`,
                      }}
                    >
                      <div
                        className="plugu-glass-chip -translate-x-1/2 -translate-y-1/2 relative"
                        style={{ animation: track.counter }}
                      >
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* deep vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(120% 90% at 50% 55%, transparent 0%, transparent 45%, rgba(0,0,0,0.85) 95%)",
        }} />
      </div>

      {/* Wordmark & tagline */}
      <div className="relative h-full w-full flex flex-col items-center justify-end pb-[10vh] px-6 text-center">
        <img src={pluguLogo} alt="" className="h-10 w-10 object-contain splash-logo" />
        <h1 className="mt-2 text-xl font-semibold tracking-[0.5em] splash-wordmark" style={{ color: "rgba(255,255,255,0.96)" }}>
          PLUGU
        </h1>
        <p className="mt-1 text-[10px] tracking-[0.4em] uppercase splash-slogan text-white/60">
          The Official HBCU Hub
        </p>
      </div>
    </div>
  );
}