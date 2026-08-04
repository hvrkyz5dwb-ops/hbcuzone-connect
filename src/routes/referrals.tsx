import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Share2, Trophy, Users, Flame, Building2, Award, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  getReferralState, referralAchievements, referralRank, referralLink,
  type ReferralState,
} from "@/lib/referrals";

export const Route = createFileRoute("/referrals")({
  head: () => ({ meta: [{ title: "Referrals — PlugU" }] }),
  component: ReferralsPage,
});

function ReferralsPage() {
  const [state, setState] = useState<ReferralState | null>(null);
  useEffect(() => { setState(getReferralState()); }, []);
  if (!state) return null;

  const link = referralLink(state.code);
  const achievements = referralAchievements(state);
  const rank = referralRank();
  const verified = state.referrals.filter((r) => r.verified).length;
  const businesses = state.referrals.filter((r) => r.business).length;

  function copy() {
    navigator.clipboard?.writeText(link);
    toast.success("Referral link copied");
  }
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join me on PlugU", text: `Use my code ${state?.code}`, url: link });
      } catch {}
    } else {
      copy();
    }
  }
  return (
    <AppShell title="REFERRALS">
      <section className="px-5 pt-5 slide-up">
        <div className="text-center">
          <p className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground">Growth Engine</p>
          <h1 className="mt-1 text-2xl font-bold plugu-antique-wordmark">Refer. Rep. Rise.</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Every verified student you bring in earns you a permanent PlugU achievement.
          </p>
        </div>

        {/* Code + link card */}
        <div
          className="mt-5 rounded-3xl p-5"
          style={{
            background: "linear-gradient(160deg, rgba(28,28,28,0.9), rgba(10,10,10,0.9))",
            border: "1px solid color-mix(in oklab, var(--plugu-gold) 45%, transparent)",
            boxShadow: "0 0 40px -14px rgba(244,201,106,0.55)",
          }}
        >
          <p className="text-[10px] tracking-[0.32em] uppercase" style={{ color: "var(--plugu-gold)" }}>
            Your code
          </p>
          <p className="mt-1 text-3xl font-black tracking-[0.24em] plugu-antique-wordmark">{state.code}</p>
          <p className="mt-3 text-[11px] text-muted-foreground truncate">{link}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={copy}
              className="tap py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold inline-flex items-center justify-center gap-2"
            >
              <Copy className="h-3.5 w-3.5" /> Copy link
            </button>
            <button
              onClick={share}
              className="tap py-2.5 rounded-2xl text-xs font-semibold text-primary-foreground inline-flex items-center justify-center gap-2"
              style={{ background: "var(--gradient-bronze)" }}
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Stat Icon={Users} label="Total referrals" value={state.referrals.length} />
          <Stat Icon={Sparkles} label="Verified" value={verified} />
          <Stat Icon={Building2} label="Businesses" value={businesses} />
          <Stat Icon={Flame} label="Streak" value={state.streak} />
        </div>

        {/* Rank */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
            <p className="text-xs font-semibold">Rank</p>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <p className="text-[10px] tracking-wide uppercase text-muted-foreground">Your campus</p>
              <p className="text-xl font-bold">#{rank.campus}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-wide uppercase text-muted-foreground">National</p>
              <p className="text-xl font-bold">#{rank.national.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <p className="mt-6 text-[11px] tracking-[0.24em] uppercase text-muted-foreground">Achievements</p>
        <div className="mt-2 space-y-2">
          {achievements.map((a) => (
            <div
              key={a.key}
              className={`rounded-2xl border p-3.5 flex items-center gap-3 ${
                a.earned ? "border-accent/50 bg-secondary" : "border-border bg-card"
              }`}
            >
              <div
                className="h-11 w-11 grid place-items-center rounded-xl"
                style={{
                  background: a.earned
                    ? "linear-gradient(160deg, rgba(244,201,106,0.35), rgba(198,138,82,0.2))"
                    : "linear-gradient(160deg, #1c1c1c, #0f0f0f)",
                  border: "1px solid color-mix(in oklab, var(--plugu-gold) 40%, transparent)",
                }}
              >
                <Award className="h-5 w-5" style={{ color: a.earned ? "var(--plugu-gold)" : "#666" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{a.label}</p>
                  {a.earned && <span className="text-[10px] text-accent">Earned</span>}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{a.hint}</p>
                <div className="mt-1.5 h-1 rounded-full bg-background/50 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${a.progress}%`,
                      background: a.earned ? "var(--gradient-bronze)" : "#333",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-border p-4 text-center">
          <p className="text-xs">Ready to level up?</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Apply to the Campus Ambassador Program for free premium, exclusive merch and scholarships.
          </p>
          <Link
            to="/ambassadors"
            className="mt-3 inline-block tap px-4 py-2 rounded-full text-[11px] font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-bronze)" }}
          >
            Become an Ambassador
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ Icon, label, value }: { Icon: typeof Users; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 lift-card">
      <Icon className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
      <p className="mt-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xl font-bold">{value}</p>
    </div>
  );
}