import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { LoginTransition } from "@/components/LoginTransition";
import pluguLogo from "@/assets/plugu-logo.png";
import statue from "@/assets/plugu-statue.jpg.asset.json";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log In — PlugU" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTransitioning(true);
  }

  return (
    <AppShell title="LOG IN">
      <section className="relative min-h-[85vh] px-5 pt-10 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={statue.url} alt="" className="h-full w-full object-cover blur-md scale-110 opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />
        </div>

        <div className="max-w-sm mx-auto text-center">
          <img src={pluguLogo} alt="" className="h-14 w-14 mx-auto drop-shadow-[0_0_24px_var(--plugu-gold)] pop-in" />
          <h1 className="mt-4 text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>Welcome back</h1>
          <p className="mt-1 text-sm text-white/70">Plug in. Pick up where you left off.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 max-w-sm mx-auto grid gap-3">
          <input
            type="email"
            required
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--plugu-gold)]"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--plugu-gold)]"
          />
          <button
            type="submit"
            className="tap mt-2 py-3 rounded-2xl text-sm font-semibold text-black"
            style={{ background: "var(--plugu-gold)", boxShadow: "var(--shadow-gold)" }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/onboarding" })}
            className="tap text-xs text-white/60"
          >
            New here? Get started
          </button>
        </form>
      </section>

      {transitioning && (
        <LoginTransition onComplete={() => navigate({ to: "/" })} />
      )}
    </AppShell>
  );
}