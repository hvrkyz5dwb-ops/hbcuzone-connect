import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldCheck, GraduationCap, Mail, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LoginTransition } from "@/components/LoginTransition";
import pluguLogo from "@/assets/plugu-logo.png";
import statue from "@/assets/plugu-statue.jpg.asset.json";
import { APPROVED_SCHOOLS, signUpStudent, validateStudentEmail } from "@/lib/auth";
import { usePersona } from "@/hooks/use-persona";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Students Only — PlugU" },
      { name: "description", content: "Create your PlugU account with your verified student email. Students-only campus marketplace." },
    ],
  }),
  component: SignUp,
});

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad"];

function SignUp() {
  const navigate = useNavigate();
  const [, updatePersona] = usePersona();

  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");
  const [year, setYear] = useState("Freshman");
  const [major, setMajor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketplace, setAgreeMarketplace] = useState(false);
  const [agreeSchool, setAgreeSchool] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedSchool = useMemo(
    () => APPROVED_SCHOOLS.find((s) => s.name === school) ?? null,
    [school]
  );

  const liveCheck = useMemo(() => {
    if (!email) return null;
    return validateStudentEmail(email, school || undefined);
  }, [email, school]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agreeTerms) { setError("Please accept the Terms of Service and Privacy Policy."); return; }
    if (!agreeMarketplace) { setError("Please accept the marketplace acknowledgement."); return; }
    if (!agreeSchool) { setError("Please confirm your school email authorization."); return; }
    if (submitting) return;
    setSubmitting(true);
    const res = signUpStudent({ name, email, school, year, major });
    if (!res.ok) {
      setError(res.reason);
      setSubmitting(false);
      return;
    }
    // Mirror into persona so existing UI surfaces show the new student.
    updatePersona({
      name: res.student.name,
      campus: res.student.school,
      year: res.student.year,
      major: res.student.major,
      badge: "Student",
    });
    setTransitioning(true);
  }

  return (
    <AppShell title="SIGN UP">
      <section className="relative min-h-[90vh] px-5 pt-8 pb-12 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={statue.url} alt="" className="h-full w-full object-cover blur-md scale-110 opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
        </div>

        <div className="max-w-sm mx-auto text-center">
          <img src={pluguLogo} alt="" className="h-12 w-12 mx-auto drop-shadow-[0_0_24px_var(--plugu-gold)] pop-in" />
          <h1 className="mt-4 text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>
            Students Only.
          </h1>
          <p className="mt-1 text-sm text-white/70">
            PlugU is a verified-student network. Sign up with your school email to get your{" "}
            <span className="text-primary font-medium">Verified Student ✔</span> badge.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-7 max-w-sm mx-auto grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-white/60">Full name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Carter"
              className="px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--plugu-gold)]"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-white/60">School</span>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                list="plugu-schools"
                placeholder="Type your school name"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--plugu-gold)]"
              />
              <datalist id="plugu-schools">
                {APPROVED_SCHOOLS.map((s) => (
                  <option key={s.name} value={s.name} />
                ))}
              </datalist>
            </div>
            {selectedSchool ? (
              <span className="text-[11px] text-white/50">
                Approved domains: {selectedSchool.domains.map((d) => `@${d}`).join(", ")}
              </span>
            ) : school ? (
              <span className="text-[11px] text-white/50">
                We'll verify with your .edu email below.
              </span>
            ) : null}
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-white/60">Student email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--plugu-gold)]"
              />
            </div>
            {liveCheck && !liveCheck.ok && email.includes("@") && (
              <span className="flex items-start gap-1.5 text-[11px] text-red-400">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {liveCheck.reason}
              </span>
            )}
            {liveCheck && liveCheck.ok && (
              <span className="flex items-center gap-1.5 text-[11px] text-primary">
                <ShieldCheck className="h-3.5 w-3.5" /> Recognized as {liveCheck.school.name}.
              </span>
            )}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-white/60">Year</span>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="px-3 py-3 rounded-2xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-[var(--plugu-gold)]"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y} className="bg-black">{y}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-white/60">Major</span>
              <input
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="Business"
                className="px-3 py-3 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--plugu-gold)]"
              />
            </label>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-2 grid gap-3 rounded-2xl border border-white/10 bg-black/40 p-3 text-[12px] leading-relaxed text-white/75">
            <Consent checked={agreeTerms} onChange={setAgreeTerms}>
              I have read and agree to the{" "}
              <Link to="/terms" className="underline text-[var(--plugu-gold)]">Terms of Service</Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline text-[var(--plugu-gold)]">Privacy Policy</Link>.
            </Consent>
            <Consent checked={agreeMarketplace} onChange={setAgreeMarketplace}>
              I understand PlugU is a marketplace connecting students, that transactions occur between buyers and sellers, and that PlugU is not responsible for disputes arising from individual transactions. See our{" "}
              <Link to="/community" className="underline text-[var(--plugu-gold)]">Community Guidelines</Link>.
            </Consent>
            <Consent checked={agreeSchool} onChange={setAgreeSchool}>
              By registering with my school email, I confirm I am authorized to use that account and that the information I provided is accurate. False verification or misuse of school credentials may result in permanent removal.
            </Consent>
          </div>

          <button
            type="submit"
            disabled={
              submitting ||
              !agreeTerms ||
              !agreeMarketplace ||
              !agreeSchool ||
              !name.trim() ||
              !school.trim() ||
              !email.trim() ||
              !(liveCheck && liveCheck.ok)
            }
            className="tap mt-2 py-3 rounded-2xl text-sm font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--plugu-gold)", boxShadow: "var(--shadow-gold)" }}
          >
            {submitting ? "Creating account…" : "Create my student account"}
          </button>

          <p className="text-[11px] text-white/50 text-center leading-relaxed">
            We'll email a one-time verification code in the next release. For now,
            only approved school domains can sign up — no public accounts.
          </p>

          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="tap text-xs text-white/60"
          >
            Already on PlugU? Log In
          </button>
        </form>
      </section>

      {transitioning && <LoginTransition onComplete={() => navigate({ to: "/" })} />}
    </AppShell>
  );
}

function Consent({
  checked, onChange, children,
}: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-white/30 bg-black/40 accent-[var(--plugu-gold)] shrink-0"
      />
      <span>{children}</span>
    </label>
  );
}