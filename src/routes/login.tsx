import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { LoginTransition } from "@/components/LoginTransition";
import pluguLogo from "@/assets/plugu-logo.png";
import statue from "@/assets/plugu-statue.jpg.asset.json";
import { signInStudent, validateStudentEmail } from "@/lib/auth";
import { usePersona } from "@/hooks/use-persona";
import { AlertCircle, ShieldCheck, Mail, KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Welcome to PlugU — Verified Students Only" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [expected, setExpected] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, updatePersona] = usePersona();

  const detectedSchool = useMemo(() => {
    if (!email.includes("@")) return null;
    const v = validateStudentEmail(email);
    return v.ok ? v.school.name : null;
  }, [email]);

  function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validateStudentEmail(email);
    if (!v.ok) {
      setError(v.reason);
      return;
    }
    const generated = String(Math.floor(1000 + Math.random() * 9000));
    setExpected(generated);
    setStep("code");
    // Placeholder for real email delivery — surfaced in-app until backend is wired.
    toast.success(`Verification code sent to ${email}`, {
      description: `Demo code: ${generated}`,
      duration: 8000,
    });
  }

  function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.trim() !== expected) {
      setError("That code doesn't match. Check your inbox.");
      return;
    }
    const res = signInStudent(email);
    if (!res.ok) { setError(res.reason); return; }
    updatePersona({ name: res.student.name, campus: res.student.school });
    setTransitioning(true);
  }

  return (
    <AppShell title="LOG IN">
      <section className="relative min-h-[85vh] px-5 pt-10 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={statue.url} alt="" className="h-full w-full object-cover blur-lg scale-110 opacity-40" />
          <div className="absolute inset-0" style={{
            background:
              "radial-gradient(80% 60% at 50% 30%, rgba(246,210,122,0.18), transparent 65%)," +
              "linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.92) 65%, #000)",
          }} />
        </div>

        <div className="max-w-sm mx-auto text-center pop-in">
          <img src={pluguLogo} alt="" className="h-14 w-14 mx-auto drop-shadow-[0_0_24px_var(--plugu-gold)] pop-in" />
          <h1 className="mt-4 text-3xl font-bold plugu-wordmark tracking-tight">
            Welcome to PlugU
          </h1>
          <p className="mt-2 text-sm text-white/70 inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: "var(--plugu-gold)" }} />
            Built exclusively for verified college students.
          </p>
        </div>

        {/* Glass auth panel */}
        <div
          className="mt-8 max-w-sm mx-auto rounded-3xl p-5 pop-in"
          style={{
            background: "linear-gradient(180deg, rgba(20,20,26,0.75), rgba(10,10,14,0.85))",
            border: "1px solid rgba(246,210,122,0.28)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset, 0 30px 80px -30px rgba(0,0,0,0.8), 0 0 40px -12px rgba(246,210,122,0.25)",
            backdropFilter: "blur(14px) saturate(140%)",
          }}
        >
          {step === "email" ? (
            <form onSubmit={sendCode} className="grid gap-3">
              <label className="grid gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.22em] text-white/60">School email</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input
                    type="email"
                    required
                    autoFocus
                    inputMode="email"
                    placeholder="you@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--plugu-gold)]"
                  />
                </div>
                {detectedSchool && (
                  <span className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--plugu-gold)" }}>
                    <ShieldCheck className="h-3.5 w-3.5" /> Recognized as {detectedSchool}
                  </span>
                )}
              </label>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="tap mt-1 py-3 rounded-2xl text-sm font-semibold text-black hover-scale"
                style={{ background: "var(--plugu-gold)", boxShadow: "var(--shadow-gold)" }}
              >
                Send verification code
              </button>
              <p className="text-[10px] text-white/40 text-center leading-relaxed">
                No Google · No Apple · No phone · No guest.
                <br />Only verified .edu students may enter.
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: "/signup" })}
                className="tap text-xs text-white/60 hover:text-white transition-colors"
              >
                New here? Create your verified student account
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="grid gap-3">
              <button
                type="button"
                onClick={() => { setStep("email"); setCode(""); setError(null); }}
                className="tap self-start inline-flex items-center gap-1 text-[11px] text-white/60 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Check your inbox</p>
                <p className="mt-1 text-sm text-white/85 truncate">{email}</p>
              </div>
              <label className="grid gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.22em] text-white/60">4-digit code</span>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    required
                    autoFocus
                    placeholder="••••"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-9 pr-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-center text-2xl tracking-[0.6em] font-mono text-white placeholder:text-white/25 focus:outline-none focus:border-[var(--plugu-gold)]"
                  />
                </div>
              </label>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="tap mt-1 py-3 rounded-2xl text-sm font-semibold text-black hover-scale"
                style={{ background: "var(--plugu-gold)", boxShadow: "var(--shadow-gold)" }}
              >
                Verify & enter PlugU
              </button>
              <button
                type="button"
                onClick={sendCode as any}
                className="tap text-xs text-white/60 hover:text-white transition-colors"
              >
                Resend code
              </button>
            </form>
          )}
        </div>
      </section>

      {transitioning && (
        <LoginTransition onComplete={() => navigate({ to: "/" })} />
      )}
    </AppShell>
  );
}