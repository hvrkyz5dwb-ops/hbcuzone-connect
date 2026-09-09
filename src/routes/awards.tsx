import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, GraduationCap, Crown, Award } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { nationalBoard, type CampusScore } from "@/lib/nationals";

export const Route = createFileRoute("/awards")({
  head: () => ({ meta: [{ title: "Year-End Awards — PlugU" }] }),
  component: AwardsPage,
});

function AwardsPage() {
  const [board, setBoard] = useState<CampusScore[]>([]);
  useEffect(() => setBoard(nationalBoard()), []);

  const top = board[0];
  const runners = board.slice(1, 3);
  const endOfYear = new Date(new Date().getFullYear(), 4, 15).toISOString();

  return (
    <AppShell title="AWARDS">
      <section className="px-5 pt-5 slide-up">
        <div
          className="rounded-3xl overflow-hidden border border-white/10 p-5 relative"
          style={{ background: "linear-gradient(160deg, rgba(244,201,106,0.4), rgba(20,10,5,0.9))" }}
        >
          <p className="text-[10px] tracking-[0.32em] uppercase text-white/70">Year-End</p>
          <h1 className="mt-1 text-2xl font-bold plugu-antique-wordmark">The PlugU Awards</h1>
          <p className="mt-1 text-xs text-white/80">
            Every May, the top campuses and students take home real money and real recognition.
          </p>
          <p className="mt-3 text-[10px] tracking-[0.24em] uppercase text-white/60">
            Awarded {new Date(endOfYear).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </section>

      <section className="px-5 pt-4">
        <div className="rounded-2xl border border-border bg-card p-4 text-[11px] leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Official rules</p>
          <p className="mt-1">
            PlugU awards, grants and scholarships are sponsored and administered solely by PlugU.
            Apple is not a sponsor of, and is not involved in, any PlugU award, grant, scholarship or
            contest in any manner. Open to verified students at participating U.S. colleges who are 18
            or older; no purchase or payment of any kind is necessary to enter or win, and paying for a
            membership or boost does not increase your chances of winning. Void where prohibited.
            Winners are selected from public campus activity scores and notified in-app.
          </p>
        </div>
      </section>

      <section className="px-5 pt-4 space-y-3">
        {top && (
          <AwardCard
            icon={Trophy}
            title="🏆 PlugU Grant"
            headline={`${top.campus} leads the nation`}
            body="A $25,000 grant awarded to the highest-performing school at year-end. Funds student business programs on the winning yard."
            accent="#f4c96a"
          >
            <p className="text-[11px] text-white/70 mt-2">
              Currently in position: <span className="font-semibold text-white">{top.campus}</span> · Score {top.score.toLocaleString()}
            </p>
            {runners.length > 0 && (
              <p className="text-[10px] mt-1 text-white/50">
                Chasing: {runners.map((r) => r.campus).join(" · ")}
              </p>
            )}
          </AwardCard>
        )}

        <AwardCard
          icon={GraduationCap}
          title="🏆 Plug of the Year Scholarship"
          headline="A student entrepreneur takes home $10K"
          body="Awarded to the standout student founder — judged on sales, reviews, community impact and creativity."
          accent="#c68a52"
        >
          <Link to="/milestones" className="tap mt-2 inline-flex text-[11px] font-semibold text-primary">
            See your milestones →
          </Link>
        </AwardCard>

        <AwardCard
          icon={Crown}
          title="🏆 Ambassador of the Year"
          headline="Best campus rep, hands down"
          body="Judged on referrals, campus growth, events run, and student sentiment. Winner joins the PlugU HQ retreat."
          accent="#a855f7"
        >
          <Link to="/ambassadors" className="tap mt-2 inline-flex text-[11px] font-semibold text-primary">
            Apply to be an Ambassador →
          </Link>
        </AwardCard>

        <AwardCard
          icon={Award}
          title="🏆 Top Business Awards"
          headline="Top 25 student businesses nationwide"
          body="Categories include Food, Beauty, Fashion, Media, Tech and Services. Every winner gets a national spotlight across PlugU."
          accent="#22d3ee"
        >
          <Link to="/nationals" className="tap mt-2 inline-flex text-[11px] font-semibold text-primary">
            View the live leaderboard →
          </Link>
        </AwardCard>
      </section>

      <p className="px-5 py-6 text-center text-[11px] text-muted-foreground">
        Every action you take on PlugU — a sale, a review, a referral — pushes your yard up the board.
      </p>
    </AppShell>
  );
}

function AwardCard({
  icon: Icon, title, headline, body, accent, children,
}: {
  icon: typeof Trophy;
  title: string;
  headline: string;
  body: string;
  accent: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border border-white/10 p-4 lift-card"
      style={{
        background: `linear-gradient(160deg, color-mix(in oklab, ${accent} 22%, #0b0b0b), #0b0b0b)`,
        boxShadow: `0 0 30px -18px ${accent}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-11 w-11 grid place-items-center rounded-xl shrink-0"
          style={{
            background: `radial-gradient(circle at 30% 25%, color-mix(in oklab, ${accent} 45%, transparent), transparent)`,
            border: `1px solid color-mix(in oklab, ${accent} 50%, transparent)`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-[0.24em] uppercase text-white/60">{title}</p>
          <h3 className="mt-0.5 text-sm font-bold text-white">{headline}</h3>
          <p className="mt-1 text-[12px] text-white/70 leading-relaxed">{body}</p>
          {children}
        </div>
      </div>
    </div>
  );
}