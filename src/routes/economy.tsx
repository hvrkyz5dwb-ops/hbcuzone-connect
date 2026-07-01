import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp, Trophy, Crown, Sparkles, Gift, Flame, BarChart3, ShieldCheck,
  Target, Globe2, GraduationCap, ArrowRight, Activity,
} from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import { PullToRefresh } from "@/components/PullToRefresh";
import {
  campusEconomies, rankingCategories, rankingFilters, rankBy, awardCategories,
  scholarshipCategories, monthlyChallenges, trendingBoards, verificationLevels,
  platformInsights, grantCountdown, formatMoney,
  type RankingCategory, type RankingFilter, type CampusEconomy,
} from "@/lib/economy-data";

export const Route = createFileRoute("/economy")({
  head: () => ({
    meta: [
      { title: "Campus Economy — PlugU" },
      { name: "description", content: "Live campus economy dashboard, national rankings, the PlugU Campus Grant, Plug of the Year Awards, scholarships and business growth tools." },
      { property: "og:title", content: "PlugU Campus Economy" },
      { property: "og:description", content: "The official economic engine of college campuses." },
    ],
  }),
  component: Economy,
});

type Tab =
  | "Dashboard" | "Rankings" | "Wealth" | "Trending"
  | "Grant" | "Awards" | "Scholarships" | "Challenges" | "Insights" | "Verify";

const TABS: Tab[] = ["Dashboard","Rankings","Wealth","Trending","Grant","Awards","Scholarships","Challenges","Insights","Verify"];

function Economy() {
  const [tab, setTab] = useState<Tab>("Dashboard");
  return (
    <AppShell title="ECONOMY">
      <PullToRefresh onRefresh={async () => { await new Promise(r => setTimeout(r, 500)); }}>
        <Header />
        <div className="sticky top-[60px] z-20 bg-background/80 backdrop-blur-xl border-b border-border/40">
          <div className="flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`tap shrink-0 px-3.5 py-1.5 rounded-full text-[11px] tracking-wide border transition-all ${
                    active
                      ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary shadow-[var(--shadow-glow)]"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pb-6">
          {tab === "Dashboard" && <Dashboard />}
          {tab === "Rankings" && <Rankings />}
          {tab === "Wealth" && <Wealth />}
          {tab === "Trending" && <Trending />}
          {tab === "Grant" && <Grant />}
          {tab === "Awards" && <Awards />}
          {tab === "Scholarships" && <Scholarships />}
          {tab === "Challenges" && <Challenges />}
          {tab === "Insights" && <Insights />}
          {tab === "Verify" && <Verify />}
        </div>
      </PullToRefresh>
    </AppShell>
  );
}

function Header() {
  const insights = platformInsights();
  return (
    <section className="px-5 pt-5 slide-up">
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 p-5"
        style={{ background: "var(--gradient-bronze)" }}>
        <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full blur-3xl opacity-50"
          style={{ background: "var(--plugu-purple)" }} />
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary-foreground/80">PlugU · Campus Economy</p>
        <h1 className="mt-1 text-2xl font-extrabold text-primary-foreground leading-tight">
          The economic engine<br/>of college campuses.
        </h1>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat dark label="Orders Today" value={insights.ordersToday.toLocaleString()} />
          <Stat dark label="Businesses Open" value={insights.businessesOpen.toLocaleString()} />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, dark = false }: { label: string; value: string | number; dark?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 border ${dark ? "bg-black/30 border-white/15 text-primary-foreground" : "bg-card border-border"}`}>
      <p className={`text-[10px] uppercase tracking-wider ${dark ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}

/* ============ DASHBOARD ============ */
function Dashboard() {
  const [campusId, setCampusId] = useState(campusEconomies[0].id);
  const c = campusEconomies.find((x) => x.id === campusId)!;
  return (
    <section className="mt-5 slide-up">
      <div className="px-5">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">My Campus</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {campusEconomies.map((x) => {
            const active = x.id === campusId;
            return (
              <button key={x.id} onClick={() => setCampusId(x.id)}
                className={`tap shrink-0 px-3 py-1.5 rounded-full text-xs border ${
                  active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
                }`}>
                {x.short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 px-5">
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">{c.campus}</h2>
              <p className="text-[11px] text-muted-foreground">{c.conference} · {c.state} · {c.type}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] tracking-wider border border-primary/40 text-primary">
              <TrendingUp className="h-3 w-3" /> +{c.stats.growthPct}%
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="Active Users" value={c.stats.activeUsers.toLocaleString()} />
            <Stat label="Businesses" value={c.stats.businesses.toLocaleString()} />
            <Stat label="Orders Completed" value={c.stats.ordersCompleted.toLocaleString()} />
            <Stat label="Avg Rating" value={c.stats.avgRating.toFixed(2) + " ★"} />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              { l: "Txns", v: c.stats.transactions.toLocaleString() },
              { l: "Market", v: c.stats.marketSales.toLocaleString() },
              { l: "Services", v: c.stats.servicesBooked.toLocaleString() },
              { l: "Businesses", v: c.stats.businesses.toLocaleString() },
              { l: "Active", v: c.stats.activeBusinesses.toLocaleString() },
              { l: "Users", v: c.stats.activeUsers.toLocaleString() },
              { l: "Products Sold", v: c.stats.productsSold.toLocaleString() },
              { l: "Orders", v: c.stats.ordersCompleted.toLocaleString() },
              { l: "Avg Rating", v: c.stats.avgRating.toFixed(2) },
            ].map((s) => (
              <div key={s.l} className="py-2 rounded-xl bg-background/50 border border-border/60">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
                <p className="text-sm font-semibold">{s.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Highlight icon={Flame} label="Fastest Growing" value={c.fastestGrowing} />
            <Highlight icon={Crown} label="Top Entrepreneur" value={c.topEntrepreneur} />
          </div>
        </div>

        <Link to="/business"
          className="tap mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="h-10 w-10 grid place-items-center rounded-xl bg-[image:var(--gradient-bronze)] text-primary-foreground">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Business Growth Center</p>
            <p className="text-[11px] text-muted-foreground">Revenue, bookings, profile views, repeat customers & trends.</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </section>
  );
}

function Highlight({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/50 p-3 flex items-center gap-3">
      <div className="h-9 w-9 grid place-items-center rounded-xl"
        style={{ background: "color-mix(in oklab, var(--plugu-gold) 18%, transparent)", color: "var(--plugu-gold)" }}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

/* ============ RANKINGS ============ */
function Rankings() {
  const [filter, setFilter] = useState<RankingFilter>("National");
  const [cat, setCat] = useState<RankingCategory>("Highest Revenue");

  const filtered = useMemo<CampusEconomy[]>(() => {
    switch (filter) {
      case "HBCUs":   return campusEconomies.filter((c) => c.type === "HBCU");
      case "Public":  return campusEconomies.filter((c) => c.type === "Public");
      case "Private": return campusEconomies.filter((c) => c.type === "Private");
      case "State":   { const s = campusEconomies[0].state; return campusEconomies.filter((c) => c.state === s); }
      case "Conference": { const conf = campusEconomies[0].conference; return campusEconomies.filter((c) => c.conference === conf); }
      default: return campusEconomies;
    }
  }, [filter]);

  const ranked = rankBy(cat, filtered);
  const valueFor = (c: CampusEconomy) => {
    switch (cat) {
      case "Highest Revenue": return "Top Seller";
      case "Most Active Marketplace": return c.stats.marketSales.toLocaleString();
      case "Most Student Businesses": return c.stats.businesses.toString();
      case "Most Transactions": return c.stats.transactions.toLocaleString();
      case "Fastest Growing Campus": return `+${c.stats.growthPct}%`;
      case "Highest User Activity": return c.stats.activeUsers.toLocaleString();
      case "Best Rated Businesses": return c.stats.avgRating.toFixed(2);
      case "Most Services Completed": return c.stats.servicesBooked.toLocaleString();
      case "Most Verified Businesses": return c.stats.activeBusinesses.toString();
      case "Top Selling School": return "Top Seller";
      case "Most Active School": return c.stats.activeUsers.toLocaleString();
      case "Most Businesses": return c.stats.businesses.toString();
      case "Most Student Creators": return Math.round(c.stats.activeUsers * 0.18).toLocaleString();
      case "Most Marketplace Sales": return c.stats.marketSales.toLocaleString();
      case "Top Ambassador School": return `+${c.stats.growthPct}%`;
      default: return "—";
    }
  };

  return (
    <section className="mt-5 slide-up">
      <div className="px-5">
        <SectionHeader title="National Campus Rankings" />
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rankingFilters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`tap shrink-0 px-3 py-1.5 rounded-full text-[11px] border ${
                filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rankingCategories.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`tap shrink-0 px-3 py-1.5 rounded-full text-[11px] border ${
                cat === c ? "border-primary text-primary" : "bg-card text-muted-foreground border-border"
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <ol className="mt-3 px-5 space-y-2">
        {ranked.map((c, i) => (
          <li key={c.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
            <div className={`h-9 w-9 grid place-items-center rounded-xl font-bold text-sm ${
              i === 0 ? "bg-[image:var(--gradient-bronze)] text-primary-foreground" : "bg-background border border-border"
            }`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{c.campus}</p>
              <p className="text-[11px] text-muted-foreground">{c.conference} · {c.type}</p>
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--plugu-gold)" }}>{valueFor(c)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ============ WEALTH INDEX ============ */
function Wealth() {
  const c = campusEconomies[0];
  const items = [
    { l: "Marketplace Activity",  v: c.stats.marketSales.toLocaleString() },
    { l: "Services Completed",    v: c.stats.servicesBooked.toLocaleString() },
    { l: "Businesses Created",    v: c.stats.businesses.toString() },
    { l: "Jobs Posted",           v: "142" },
    { l: "Scholarships Awarded",  v: "12" },
    { l: "Internships Posted",    v: "38" },
    { l: "Active Users",          v: c.stats.activeUsers.toLocaleString() },
    { l: "Growth This Month",     v: `+${c.stats.growthPct}%` },
  ];
  return (
    <section className="mt-5 px-5 slide-up">
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 p-5"
        style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--plugu-purple) 25%, transparent), color-mix(in oklab, var(--plugu-gold) 15%, transparent))" }}>
        <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "var(--plugu-gold)" }}>Campus Wealth Index</p>
        <h2 className="mt-1 text-2xl font-extrabold">{c.campus}</h2>
        <p className="text-[11px] text-muted-foreground mt-1">Live · updates every minute</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {items.map((s) => <Stat key={s.l} label={s.l} value={s.v} />)}
      </div>
    </section>
  );
}

/* ============ TRENDING ============ */
function Trending() {
  const boards: { title: string; items: { n: string; v: string }[] }[] = [
    { title: "Top Plugs Today",    items: trendingBoards.topEarners.map(x => ({ n: x.n, v: "🔥 Top" })) },
    { title: "Most Booked",        items: trendingBoards.mostBooked },
    { title: "Most Viewed",        items: trendingBoards.mostViewed },
    { title: "Fastest Growing",    items: trendingBoards.fastestGrow },
    { title: "Highest Rated",      items: trendingBoards.highestRated },
    { title: "New & Trending",     items: trendingBoards.newTrending },
    { title: "Rising Businesses",  items: trendingBoards.rising },
  ];
  return (
    <section className="mt-5 px-5 slide-up space-y-4">
      {boards.map((b) => (
        <div key={b.title} className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--plugu-gold)" }}>{b.title}</p>
          <ul className="mt-2 space-y-1.5">
            {b.items.map((x, i) => (
              <li key={x.n} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-4">{i + 1}</span>
                  {x.n}
                </span>
                <span className="text-xs text-muted-foreground">{x.v}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/* ============ GRANT ============ */
function Grant() {
  const [count, setCount] = useState(grantCountdown());
  useEffect(() => {
    const id = setInterval(() => setCount(grantCountdown()), 60_000);
    return () => clearInterval(id);
  }, []);
  const uses = [
    "Student Organizations", "Entrepreneurship Programs", "Innovation Labs",
    "Campus Improvements", "Student Scholarships", "Business Competitions",
  ];
  return (
    <section className="mt-5 px-5 slide-up">
      <div className="relative overflow-hidden rounded-3xl border border-primary/40 p-5"
        style={{ background: "var(--gradient-bronze)" }}>
        <Gift className="h-8 w-8 text-primary-foreground" />
        <p className="mt-2 text-[10px] tracking-[0.3em] uppercase text-primary-foreground/80">PlugU Campus Grant</p>
        <h2 className="text-2xl font-extrabold text-primary-foreground leading-tight">
          The top-performing campus wins the annual grant.
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { l: "Days", v: count.days },
            { l: "Hours", v: count.hours },
            { l: "Mins", v: count.minutes },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-black/30 border border-white/15 p-3 text-center text-primary-foreground">
              <p className="text-2xl font-extrabold">{s.v}</p>
              <p className="text-[10px] uppercase tracking-wider opacity-80">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">Where the grant goes</p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {uses.map((u) => (
            <li key={u} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--plugu-gold)" }} />
              {u}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============ AWARDS ============ */
function Awards() {
  const rewards = [
    "PlugU Trophy", "Verified Gold Badge", "Homepage Feature", "National Recognition",
    "Premium Business Placement", "Plug of the Year Scholarship", "Exclusive PlugU Merch", "Future cash prizes",
  ];
  return (
    <section className="mt-5 px-5 slide-up">
      <div className="rounded-3xl border border-border bg-card p-5">
        <Trophy className="h-7 w-7" style={{ color: "var(--plugu-gold)" }} />
        <p className="mt-2 text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--plugu-gold)" }}>Plug of the Year</p>
        <h2 className="text-xl font-bold">The annual PlugU Awards.</h2>
        <p className="text-xs text-muted-foreground mt-1">Recognizing the top student entrepreneurs and creators across the country.</p>
      </div>
      <SectionHeader title="Categories" />
      <ul className="space-y-2">
        {awardCategories.map((a) => (
          <li key={a.name} className="flex items-start gap-3 p-3 rounded-2xl bg-card border border-border">
            <div
              className="h-10 w-10 shrink-0 rounded-xl grid place-items-center border border-border text-lg"
              style={{ background: "color-mix(in oklab, var(--plugu-gold) 12%, transparent)" }}
              aria-hidden
            >
              {a.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5" style={{ color: "var(--plugu-gold)" }} />
                <span className="text-sm font-semibold">{a.name}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{a.blurb}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 rounded-2xl border border-border bg-card p-3.5">
        <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--plugu-gold)" }}>
          Grant & Scholarship Eligibility
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Winning students and their schools become eligible for PlugU grants and scholarships announced at the end of each academic year.
        </p>
      </div>
      <SectionHeader title="What winners receive" />
      <div className="grid grid-cols-2 gap-2">
        {rewards.map((r) => (
          <div key={r} className="rounded-xl border border-border bg-card px-3 py-2 text-xs flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--plugu-gold)" }} />
            {r}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ SCHOLARSHIPS ============ */
function Scholarships() {
  return (
    <section className="mt-5 slide-up">
      <div className="px-5">
        <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--plugu-gold)" }}>Plug of the Year Scholarships</p>
        <p className="text-sm text-muted-foreground">Awarded annually to students who positively impact their campus.</p>
      </div>
      <ul className="mt-3 px-5 space-y-2">
        {scholarshipCategories.map((s) => (
          <li key={s.name} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
            <div className="h-10 w-10 grid place-items-center rounded-xl"
              style={{ background: "color-mix(in oklab, var(--plugu-purple) 18%, transparent)", color: "var(--plugu-gold)" }}>
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{s.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{s.focus}</p>
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--plugu-gold)" }}>{s.amount}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ============ CHALLENGES ============ */
function Challenges() {
  return (
    <section className="mt-5 px-5 slide-up">
      <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--plugu-gold)" }}>Monthly Community Challenges</p>
      <p className="text-sm text-muted-foreground">Compete with campuses and businesses across the country.</p>
      <ul className="mt-3 space-y-2">
        {monthlyChallenges.map((m) => (
          <li key={m.name} className="p-3 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
                {m.name}
              </p>
              <span className="text-[10px] text-muted-foreground">Ends {m.ends}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 ml-6">Reward · {m.reward}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ============ INSIGHTS ============ */
function Insights() {
  const i = platformInsights();
  const items = [
    { l: "Activity Today",        v: i.ordersToday.toLocaleString(), icon: Activity },
    { l: "Businesses Open",       v: i.businessesOpen.toLocaleString(), icon: Globe2 },
    { l: "Orders Completed",      v: i.ordersToday.toLocaleString(), icon: TrendingUp },
    { l: "Students Hired",        v: i.studentsHired.toLocaleString(), icon: Sparkles },
    { l: "Scholarships Posted",   v: i.scholarshipsPosted.toString(), icon: GraduationCap },
    { l: "Internships Available", v: i.internshipsAvailable.toString(), icon: Crown },
    { l: "Marketplace Growth",    v: `+${i.marketplaceGrowthPct}%`, icon: BarChart3 },
    { l: "Top Campus",            v: "Spelman", icon: Trophy },
  ];
  return (
    <section className="mt-5 px-5 slide-up">
      <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--plugu-gold)" }}>PlugU Economic Insights</p>
      <p className="text-sm text-muted-foreground">Live platform statistics across every campus.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {items.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.l} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" style={{ color: "var(--plugu-gold)" }} />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
              </div>
              <p className="text-lg font-bold mt-1">{s.v}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============ VERIFY ============ */
function Verify() {
  return (
    <section className="mt-5 px-5 slide-up">
      <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--plugu-gold)" }}>Business Verification Tiers</p>
      <p className="text-sm text-muted-foreground">Badges that build trust and reward quality.</p>
      <ul className="mt-3 space-y-2">
        {verificationLevels.map((v) => {
          const tint = v.tone === "gold" ? "var(--plugu-gold)" : "var(--plugu-purple)";
          return (
            <li key={v.name} className="p-3 rounded-2xl bg-card border border-border flex items-center gap-3">
              <div className="h-10 w-10 grid place-items-center rounded-xl"
                style={{ background: `color-mix(in oklab, ${tint} 18%, transparent)`, color: tint }}>
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{v.name}</p>
                <p className="text-[11px] text-muted-foreground">{v.blurb}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}