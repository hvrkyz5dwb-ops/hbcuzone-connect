import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { validateStudentEmail, isHbcuDomain } from "@/lib/auth";
import { SchoolPicker } from "@/components/SchoolPicker";
import { ShieldCheck, Mail, AlertCircle, Loader2 } from "lucide-react";
import pluguLogo from "@/assets/plugu-charger-mark.png";
import { POLICY_CONSENT_TEXT, POLICY_VERSION, recordPolicyAcceptance } from "@/lib/policy";

import { friendlyError } from "@/lib/friendly-errors";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create your PlugU account" },
      { name: "description", content: "PlugU is students-only. Create your account with a verified .edu email." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { next?: string; mode?: string } => ({
    next: typeof s.next === "string" ? s.next : "",
    mode: typeof s.mode === "string" ? s.mode : "",
  }),
  component: AuthPage,
});

function safeNext(next: string | undefined): string {
  if (!next) return "/";
  // Only allow same-origin relative paths.
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad"];

type Mode = "sign-in" | "sign-up" | "forgot";

function AuthPage() {
  const { next, mode: initialMode } = Route.useSearch();
  const navigate = useNavigate();

  // Signed-in students never see this page. Checked post-hydration on
  // purpose: the session lives in browser storage (invisible to SSR), so
  // redirecting in beforeLoad made the client render a different route
  // than the server HTML and React threw a hydration mismatch.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) window.location.replace(safeNext(next));
    });
    return () => {
      active = false;
    };
  }, [next]);

  // Default to create-account. Sign in is only reachable via the small link
  // for returning users on a new device.
  const [mode, setMode] = useState<Mode>(initialMode === "sign-in" ? "sign-in" : "sign-up");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [year, setYear] = useState("Freshman");
  const [major, setMajor] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const emailCheck = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) return null;
    return validateStudentEmail(trimmed, mode === "sign-up" ? school || undefined : undefined);
  }, [email, school, mode]);

  function reset(nextMode: Mode) {
    setErr(null);
    setMsg(null);
    setBusy(false);
    setMode(nextMode);
  }

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    setMsg(null);
    if (!email.trim() || !password) {
      setErr("Enter your email and password.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setBusy(false);
    if (error) {
      if (/email not confirmed/i.test(error.message)) {
        setErr("Please verify your email first. Check your inbox for the PlugU confirmation link.");
      } else if (/invalid login credentials/i.test(error.message)) {
        setErr("That email and password don't match. Try again or reset your password.");
      } else {
        setErr(friendlyError(error));
      }
      return;
    }
    window.location.href = safeNext(next);
  }

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    setMsg(null);

    if (!fullName.trim()) return setErr("Enter your full name.");
    if (!school.trim()) return setErr("Select your school.");
    const check = validateStudentEmail(email, school);
    if (!check.ok) return setErr(check.reason);
    if (password.length < 8) return setErr("Password must be at least 8 characters.");
    if (!agreeTerms) return setErr("Accept the Terms of Use, Privacy Policy, and Community Guidelines to continue.");


    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: window.location.origin + "/auth",
        data: {
          full_name: fullName.trim(),
          school_name: (school.trim() || check.school.name),
          school_domain: check.domain,
          year,
          major: major.trim() || "Undeclared",
          is_hbcu_student: isHbcuDomain(check.domain),
          terms_accepted: "true",
          policy_version: POLICY_VERSION,
          policy_accepted_at: new Date().toISOString(),
        },
      },
    });
    setBusy(false);
    if (error) {
      setErr(friendlyError(error));
      return;
    }
    if (data.user) {
      // Ledger the acceptance (user id, policy version, timestamp).
      try { await recordPolicyAcceptance(data.user.id); } catch {}
    }
    if (!data.session) {
      setMsg(
        `Almost there — we sent a verification link to ${email.trim().toLowerCase()}. Open it to activate your PlugU account, then sign in.`,
      );
      setMode("sign-in");
      setPassword("");
      return;
    }
    // First launch after account creation: play the cinematic splash and
    // land on Home with the one-time welcome overlay.
    try {
      window.localStorage.setItem("plugu.welcome.pending", "1");
    } catch {}

    window.location.href = safeNext(next);
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    setMsg(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setErr("Enter the email on your PlugU account.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setBusy(false);
    if (error) {
      setErr(friendlyError(error));
      return;
    }
    setMsg("If an account exists for that email, we sent a password reset link.");
  }

  async function resendVerification() {
    if (busy || !email.trim()) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: window.location.origin + "/auth" },
    });
    setBusy(false);
    if (error) setErr(friendlyError(error));
    else setMsg("Verification email resent. Check your inbox.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
        <div className="flex items-center gap-2">
          <img src={pluguLogo} alt="" className="h-8 w-8 object-contain drop-shadow-[0_0_10px_rgba(244,201,106,0.55)]" />
          <p className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground">PlugU · Students Only</p>
        </div>
        <h1 className="mt-3 text-2xl font-bold plugu-wordmark">
          {mode === "sign-in" && "Sign in"}
          {mode === "sign-up" && "Create your account"}
          {mode === "forgot" && "Reset your password"}
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          {mode === "forgot"
            ? "Enter your PlugU email — we'll send a secure reset link."
            : "Use your verified .edu school email. Nobody without one gets in."}
        </p>

        {mode === "sign-in" && (
          <form onSubmit={onSignIn} className="mt-5 space-y-3">
            <EmailField value={email} onChange={setEmail} />
            <PasswordField value={password} onChange={setPassword} autoComplete="current-password" />
            <Feedback err={err} msg={msg} />
            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Signing in…" : "Sign in"}
            </button>
            {err && /verify your email/i.test(err) && (
              <button
                type="button"
                onClick={resendVerification}
                className="w-full text-xs text-primary underline"
              >
                Resend verification email
              </button>
            )}
            <div className="flex items-center justify-between pt-1">
              <button type="button" onClick={() => reset("forgot")} className="text-xs text-muted-foreground underline">
                Forgot password?
              </button>
              <button type="button" onClick={() => reset("sign-up")} className="text-xs text-primary underline">
                Create account
              </button>
            </div>
          </form>
        )}

        {mode === "sign-up" && (
          <form onSubmit={onSignUp} className="mt-5 space-y-3">
            <Labeled label="Full name">
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jordan Carter"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              />
            </Labeled>
            <SchoolPicker value={school} onChange={setSchool} />
            <EmailField value={email} onChange={setEmail} />
            {emailCheck && !emailCheck.ok && email.includes("@") && (
              <p className="flex items-start gap-1.5 text-[11px] text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {emailCheck.reason}
              </p>
            )}
            {emailCheck && emailCheck.ok && (
              <p className="flex items-center gap-1.5 text-[11px] text-primary">
                <ShieldCheck className="h-3.5 w-3.5" /> Recognized as {emailCheck.school.name}.
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              School not listed?{" "}
              <Link to="/request-school-access" className="text-primary underline">
                Request access
              </Link>{" "}
              after creating your account.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Labeled label="Year">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </Labeled>
              <Labeled label="Major">
                <input
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="Business"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                />
              </Labeled>
            </div>
            <PasswordField value={password} onChange={setPassword} autoComplete="new-password" />
            <p className="text-[10px] text-muted-foreground">Min 8 characters. Leaked passwords are blocked.</p>

            <div className="mt-1 space-y-2 rounded-xl border border-border bg-background/60 p-3 text-[12px] leading-snug">
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                <Link to="/terms" className="underline text-primary">Terms of Use</Link>
                <Link to="/privacy" className="underline text-primary">Privacy Policy</Link>
                <Link to="/community-guidelines" className="underline text-primary">Community Guidelines</Link>
              </div>
              <Check checked={agreeTerms} onChange={setAgreeTerms}>
                {POLICY_CONSENT_TEXT}
              </Check>
            </div>

            <Feedback err={err} msg={msg} />
            <button
              type="submit"
              disabled={busy || !(emailCheck && emailCheck.ok) || !agreeTerms}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Creating account…" : "Create student account"}
            </button>
            <button type="button" onClick={() => reset("sign-in")} className="w-full text-xs text-muted-foreground underline">
              Already have an account? Sign in
            </button>

            <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
              PlugU does not permit or promote the sale, purchase, distribution, or advertisement of illegal drugs, controlled substances, weapons, or other{" "}
              <Link to="/community-guidelines" className="underline hover:text-foreground transition-colors">
                prohibited items
              </Link>
              . Accounts that violate this{" "}
              <Link to="/community-guidelines" className="underline hover:text-foreground transition-colors">
                policy
              </Link>{" "}
              may be suspended or permanently removed.
            </p>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={onForgot} className="mt-5 space-y-3">
            <EmailField value={email} onChange={setEmail} />
            <Feedback err={err} msg={msg} />
            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Sending…" : "Send reset link"}
            </button>
            <button type="button" onClick={() => reset("sign-in")} className="w-full text-xs text-muted-foreground underline">
              Back to sign in
            </button>
          </form>
        )}

        <button onClick={() => navigate({ to: "/" })} className="mt-4 w-full text-[11px] text-muted-foreground">
          Back to PlugU
        </button>
      </div>
    </main>
  );
}

function EmailField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Labeled label="Student email">
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@school.edu"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm"
        />
      </div>
    </Labeled>
  );
}

function PasswordField({
  value, onChange, autoComplete,
}: { value: string; onChange: (v: string) => void; autoComplete: string }) {
  return (
    <Labeled label="Password">
      <input
        type="password"
        required
        minLength={8}
        autoComplete={autoComplete}
        placeholder="At least 8 characters"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
      />
    </Labeled>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Check({
  checked, onChange, children,
}: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--plugu-gold)]"
      />
      <span>{children}</span>
    </label>
  );
}

function Feedback({ err, msg }: { err: string | null; msg: string | null }) {
  if (!err && !msg) return null;
  return err ? (
    <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      {err}
    </p>
  ) : (
    <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
      {msg}
    </p>
  );
}