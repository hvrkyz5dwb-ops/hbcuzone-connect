import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Star, Crown } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LoadingList } from "@/components/EmptyState";
import { ErrorState } from "@/components/QueryStates";
import { PlugScoreBadge } from "@/components/PlugScoreBadge";
import { useProfile } from "@/hooks/use-profile";
import { fetchRankings, type RankingPeriod } from "@/lib/rankings-db";
import { AVAILABLE_CATEGORIES } from "@/lib/categories";

export const Route = createFileRoute("/rankings")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Campus Rankings — PlugU" },
      { name: "description", content: "See the top-rated student sellers on your campus and in every category, ranked by real completed orders." },
      { property: "og:title", content: "Campus Rankings — PlugU" },
      { property: "og:description", content: "Top student sellers ranked by real completed orders and verified reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RankingsPage,
});

const PERIODS: { key: RankingPeriod; label: string }[] = [
  { key: "7", label: "This week" },
  { key: "30", label: "This month" },
  { key: "90", label: "This semester" },
];

function medal(i: number): string {
  return i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
}

function RankingsPage() {
  const { profile } = useProfile();
  const { user, loading: sessionLoading } = useSession();
  const signedIn = !!user?.id;
  const [scope, setScope] = useState<"campus" | "national">("campus");
  const [period, setPeriod] = useState<RankingPeriod>("30");
  const [category, setCategory] = useState<string | null>(null);

  const schoolId = scope === "campus" ? profile?.school_id ?? null : null;
  // Leaderboards are student-only data; guests get a sign-in prompt instead of
  // a permission error from the database.
  const q = useQuery({
    enabled: !sessionLoading && signedIn,
    queryKey: ["rankings", schoolId, category, period],
    queryFn: () => fetchRankings({ schoolId, category, days: Number(period), limit: 25 }),
    staleTime: 60_000,
  });

  const rows = q.data ?? [];

  return (
    <AppShell title="RANKINGS">
      <section className="px-5 pt-5 pb-10">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="h-11 w-11 grid place-items-center rounded-2xl"
            style={{
              background: "linear-gradient(160deg, #1c1c1c, #0f0f0f)",
              border: "1px solid color-mix(in oklab, var(--plugu-gold) 40%, transparent)",
            }}
          >
            <Trophy className="h-5 w-5" style={{ color: "var(--plugu-gold)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Campus rankings</h1>
            <p className="text-[11px] text-muted-foreground">Ranked by real completed orders. No pay-to-win.</p>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          {(["campus", "national"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              disabled={s === "campus" && !profile?.school_id}
              className={`tap flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors disabled:opacity-40 ${
                scope === s ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
              }`}
            >
              {s === "campus" ? (profile?.school_name ?? "My campus") : "Nationwide"}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-2">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`tap flex-1 py-1.5 rounded-full text-[11px] border transition-colors ${
                period === p.key ? "border-accent bg-secondary text-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setCategory(null)}
            className={`tap shrink-0 px-3.5 py-1.5 rounded-full text-[11px] border ${
              category === null ? "border-accent bg-secondary text-foreground" : "border-border bg-card text-muted-foreground"
            }`}
          >
            All categories
          </button>
          {AVAILABLE_CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`tap shrink-0 px-3.5 py-1.5 rounded-full text-[11px] border ${
                category === c.key ? "border-accent bg-secondary text-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {q.isPending ? (
          <div className="mt-5"><LoadingList rows={5} /></div>
        ) : q.isError ? (
          <ErrorState
            title="Rankings didn't load"
            description="We couldn't reach the leaderboard. Check your connection and try again."
            onRetry={() => void q.refetch()}
          />
        ) : rows.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border p-8 text-center">
            <Crown className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No ranked plugs yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Rankings fill in as students complete real orders{category ? " in this category" : ""} during this period. Be the first.
            </p>
            <Link
              to="/seller/listings"
              className="mt-4 inline-block tap px-4 py-2 rounded-full text-[11px] font-semibold bg-[image:var(--gradient-bronze)] text-primary-foreground"
            >
              Post a listing
            </Link>
          </div>
        ) : (
          <ol className="mt-4 space-y-2.5">
            {rows.map((r, i) => {
              const name = r.display_name ?? r.username ?? "PlugU seller";
              const inner = (
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                  <span
                    className="w-7 shrink-0 text-center text-sm font-bold"
                    style={{ color: i < 3 ? "var(--plugu-gold)" : undefined }}
                  >
                    {medal(i)}
                  </span>
                  {r.avatar_url ? (
                    <img src={r.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-secondary grid place-items-center text-sm font-bold">
                      {name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {r.completed_orders} completed
                      {r.top_category ? ` · ${r.top_category}` : ""}
                      {scope === "national" && r.school_name ? ` · ${r.school_name}` : ""}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <PlugScoreBadge
                        size="xs"
                        showLabel={false}
                        profile={{
                          rating_avg: r.rating_avg,
                          rating_count: r.rating_count,
                          completed_transactions: r.completed_transactions,
                          verification_status: r.verification_status,
                          created_at: r.member_since,
                        }}
                      />
                      {r.rating_count > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Star className="h-3 w-3" style={{ color: "var(--plugu-gold)" }} />
                          {Number(r.rating_avg).toFixed(1)} ({r.rating_count})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
              return (
                <li key={r.user_id}>
                  {r.username ? (
                    <Link to="/u/$username" params={{ username: r.username }} className="tap lift-card block">
                      {inner}
                    </Link>
                  ) : inner}
                </li>
              );
            })}
          </ol>
        )}

        <p className="mt-6 text-[10px] text-center text-muted-foreground">
          Rankings update automatically from verified completed orders and reviews.
        </p>
      </section>
    </AppShell>
  );
}
