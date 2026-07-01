import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, Trophy, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  AMBASSADOR_PERKS, CAMPUS_LEADERBOARD, NATIONAL_LEADERBOARD,
  applyAmbassador, autoApproveIfDue, getAmbassador, type AmbassadorApp,
} from "@/lib/ambassadors";
import { getStudent } from "@/lib/auth";

export const Route = createFileRoute("/ambassadors")({
  head: () => ({ meta: [{ title: "Campus Ambassadors — PlugU" }] }),
  component: AmbassadorsPage,
});

function AmbassadorsPage() {
  const navigate = useNavigate();
  const [app, setApp] = useState<AmbassadorApp>({ status: "none" });
  const [name, setName] = useState("");
  const [campus, setCampus] = useState("");
  const [why, setWhy] = useState("");
  const [socials, setSocials] = useState("");

  useEffect(() => {
    const current = autoApproveIfDue();
    setApp(current);
    if (current.status === "none") {
      const s = getStudent();
      setName(s?.name ?? "");
      setCampus(s?.school ?? "");
    }
    const t = setInterval(() => setApp(autoApproveIfDue()), 2000);
    return () => clearInterval(t);
  }, []);

  function submit() {
    if (!name || !campus) {
      toast.error("Add your name and campus.");
      return;
    }
    const next = applyAmbassador({ name, campus, why, socials });
    setApp(next);
    toast.success("Application received", { description: "We'll review within 48h." });
  }

  const approved = app.status === "approved";

  return (
    <AppShell title="AMBASSADORS">
      <section className="px-5 pt-5 slide-up">
        <div className="text-center">
          <div
            className="mx-auto h-14 w-14 grid place-items-center rounded-full"
            style={{
              background: "radial-gradient(circle at 30% 25%, #1c1c1c, #0a0a0a)",
              border: "1px solid color-mix(in oklab, var(--plugu-gold) 55%, transparent)",
              boxShadow: "0 0 40px -10px rgba(244,201,106,0.55)",
            }}
          >
            <Crown className="h-6 w-6" style={{ color: "var(--plugu-gold)" }} />
          </div>
          <p className="mt-3 text-[10px] tracking-[0.32em] uppercase text-muted-foreground">Campus Ambassador Program</p>
          <h1 className="mt-1 text-2xl font-bold plugu-antique-wordmark">Rep PlugU on your yard</h1>
          <p className="mt-2 text-xs text-muted-foreground max-w-sm mx-auto">
            Official ambassadors get free premium, exclusive merch, scholarship access and priority networking.
          </p>
        </div>

        {app.status !== "none" && (
          <div
            className="mt-5 rounded-2xl p-4"
            style={{
              background: "linear-gradient(160deg, rgba(28,28,28,0.9), rgba(10,10,10,0.9))",
              border: `1px solid ${approved ? "#f4c96a" : "color-mix(in oklab, var(--plugu-gold) 40%, transparent)"}`,
            }}
          >
            <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: approved ? "#f4c96a" : "var(--plugu-gold)" }}>
              {approved ? "You're in" : "Application in review"}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {approved ? `Welcome to the team, ${app.name}.` : `${app.name} · ${app.campus}`}
            </p>
            <button
              onClick={() => navigate({ to: approved ? "/ambassadors/dashboard" : "/ambassadors/dashboard" })}
              className="mt-3 tap w-full py-2.5 rounded-2xl text-xs font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-bronze)" }}
            >
              {approved ? "Open Ambassador Dashboard" : "Preview Dashboard"}
            </button>
          </div>
        )}

        {/* Perks grid */}
        <p className="mt-6 text-[11px] tracking-[0.24em] uppercase text-muted-foreground">Perks</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {AMBASSADOR_PERKS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-3 lift-card">
              <Sparkles className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
              <p className="mt-2 text-xs font-semibold">{p.title}</p>
              <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Application */}
        {app.status === "none" && (
          <>
            <p className="mt-6 text-[11px] tracking-[0.24em] uppercase text-muted-foreground">Apply</p>
            <div className="mt-2 rounded-2xl border border-border bg-card p-4 space-y-3">
              <Field label="Name" value={name} onChange={setName} />
              <Field label="Campus" value={campus} onChange={setCampus} />
              <Field label="Socials (IG / TikTok)" value={socials} onChange={setSocials} />
              <div>
                <p className="text-[10px] tracking-wide uppercase text-muted-foreground">Why you</p>
                <textarea
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  rows={3}
                  placeholder="Tell us how you'd rep PlugU on your campus."
                  className="mt-1 w-full bg-transparent text-sm outline-none border-b border-border/60 pb-2 resize-none"
                />
              </div>
              <button
                onClick={submit}
                className="tap w-full py-3 rounded-2xl text-sm font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-bronze)" }}
              >
                Submit application
              </button>
            </div>
          </>
        )}

        {/* Leaderboards */}
        <div className="mt-6 grid gap-3">
          <LeaderCard title="Campus leaderboard" Icon={Users} rows={CAMPUS_LEADERBOARD} />
          <LeaderCard title="National leaderboard" Icon={Trophy} rows={NATIONAL_LEADERBOARD} />
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-border p-4 text-center">
          <p className="text-[11px] text-muted-foreground">
            Not ready to apply? Start earning achievements first inside your{" "}
            <Link to="/referrals" className="text-accent">Referral dashboard</Link>.
          </p>
        </div>
      </section>
    </AppShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-[10px] tracking-wide uppercase text-muted-foreground">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent text-sm outline-none border-b border-border/60 pb-2"
      />
    </div>
  );
}

function LeaderCard({
  title, Icon, rows,
}: {
  title: string;
  Icon: typeof Users;
  rows: { name: string; campus: string; recruits: number }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
        <p className="text-xs font-semibold">{title}</p>
      </div>
      <ul className="mt-2 divide-y divide-border/60">
        {rows.map((r, i) => (
          <li key={r.name + i} className="py-2 flex items-center gap-3">
            <span className="w-5 text-[11px] font-bold text-muted-foreground">#{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{r.name}</p>
              <p className="text-[10px] text-muted-foreground">{r.campus}</p>
            </div>
            <span className="text-xs font-bold" style={{ color: "var(--plugu-gold)" }}>{r.recruits}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}