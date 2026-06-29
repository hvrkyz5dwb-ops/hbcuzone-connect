import { useEffect } from "react";
import statue from "@/assets/plugu-statue.jpg.asset.json";
import pluguLogo from "@/assets/plugu-logo.png";

export function LoginTransition({ onComplete, duration = 2400 }: { onComplete: () => void; duration?: number }) {
  useEffect(() => {
    const t = setTimeout(onComplete, duration);
    return () => clearTimeout(t);
  }, [onComplete, duration]);

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden login-transition" aria-hidden>
      <div className="absolute inset-0 login-zoom">
        <img src={statue.url} alt="" className="h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(60% 50% at 50% 42%, transparent 0%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.95) 100%)" }}
        />
        {/* plug glow core */}
        <div
          className="absolute"
          style={{
            left: "50%", top: "42%", width: 140, height: 140,
            transform: "translate(-50%, -50%)",
            borderRadius: "9999px",
            background: "radial-gradient(circle, rgba(180,220,255,0.95), rgba(120,170,255,0.35) 40%, transparent 70%)",
            filter: "blur(2px)",
            animation: "splash-plug-pulse 1.2s ease-in-out infinite",
          }}
        />
      </div>
      {/* one bright flash */}
      <div className="absolute inset-0 bg-white login-flash" />
      {/* logo fades early */}
      <div className="absolute inset-x-0 bottom-24 flex flex-col items-center splash-fade-up" style={{ animation: "splash-fade-up 0.8s ease-out both, fade-out 0.6s ease-in 1.2s both" }}>
        <img src={pluguLogo} alt="" className="h-12 w-12 drop-shadow-[0_0_24px_var(--plugu-gold)]" />
        <p className="mt-2 text-[11px] tracking-[0.3em] uppercase text-white/70">Welcome back</p>
      </div>
    </div>
  );
}