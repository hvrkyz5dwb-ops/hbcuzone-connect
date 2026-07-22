import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — PlugU" },
      { name: "description", content: "Sign in to your PlugU account to connect external apps." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : "",
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const dest = safeNext(search.next);
      throw redirect({ href: dest });
    }
  },
  component: AuthPage,
});

function safeNext(next: string | undefined): string {
  if (!next) return "/";
  // Only allow same-origin relative paths.
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);

    if (!/^[^\s@]+@[^\s@]+\.edu$/i.test(email.trim())) {
      setBusy(false);
      setErr("Use your .edu student email.");
      return;
    }

    if (mode === "sign-up") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin + "/auth" },
      });
      setBusy(false);
      if (error) { setErr(error.message); return; }
      if (!data.session) {
        setMsg("Check your email to confirm your PlugU account, then sign in.");
        setMode("sign-in");
        return;
      }
      window.location.href = safeNext(next);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    window.location.href = safeNext(next);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
        <p className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground">PlugU · Account</p>
        <h1 className="mt-2 text-2xl font-bold plugu-antique-wordmark">
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Use your .edu student email. This account lets external apps (ChatGPT, Claude, etc.)
          connect to PlugU as you.
        </p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            placeholder="Password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          {msg && <p className="text-sm text-accent">{msg}</p>}
          <button
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Working…" : mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => { setErr(null); setMsg(null); setMode(mode === "sign-in" ? "sign-up" : "sign-in"); }}
          className="mt-4 w-full text-xs text-muted-foreground underline"
        >
          {mode === "sign-in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>

        <button
          onClick={() => navigate({ to: "/" })}
          className="mt-2 w-full text-[11px] text-muted-foreground"
        >
          Back to PlugU
        </button>
      </div>
    </main>
  );
}