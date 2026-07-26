import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Plug, Map as MapIcon, ChevronRight, GraduationCap, Briefcase, Tag,
  Building2, MessageSquare, ArrowRight, Star, Trophy, TrendingUp,
  Newspaper, Flame, Crown,
} from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import campusMap from "@/assets/campus-map.jpg";
import { PluguDaily } from "@/components/PluguDaily";
import { PullToRefresh } from "@/components/PullToRefresh";
import { CampusPulse } from "@/components/CampusPulse";
import { DailyCard } from "@/components/DailyCard";
import { SmartSearch } from "@/components/SmartSearch";
import { OpportunityRail } from "@/components/OpportunityRail";
import { toast } from "sonner";
import {
  categories, nearbyServices, messagesList, scholarships, hbcuDiscounts,
} from "@/lib/mock-data";
import { campusEconomies, platformInsights, formatMoney } from "@/lib/economy-data";
import { currentSeason } from "@/lib/seasons";
import { yourRank } from "@/lib/nationals";
import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { IntroCarousel, hasSeenIntro } from "@/components/IntroCarousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PlugU — Connecting Campus" },
      { name: "description", content: "The campus marketplace + utility app for HBCU students. Find vendors, services, events, rides, and deals on or near campus." },
      { property: "og:title", content: "PlugU — Connecting Campus" },
      { property: "og:description", content: "Plug in. Stand out. Stay connected." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { session, loading } = useSession();

  // Guests never see the app. They either watch the intro (first open)
  // or get bounced to /auth (already saw it). Signed-in users fall through
  // to the full dashboard below — the statue splash plays via AppShell.
  useEffect(() => {
    if (loading || session) return;
    if (hasSeenIntro()) navigate({ to: "/auth", search: { next: "/", mode: "" } });
  }, [loading, session, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-background" aria-hidden="true" />;
  }
  if (!session) {
    if (hasSeenIntro()) return <div className="min-h-screen bg-background" aria-hidden="true" />;
    return <IntroCarousel />;
  }

  return (
    <AppShell title="PLUGU">
      <PullToRefresh onRefresh={async () => { await new Promise(r => setTimeout(r, 600)); toast.success("You're all caught up"); }}>
      {/* PlugU Daily — top-of-home card, rotates daily */}
      <DailyCard />

      {/* Campus Pulse — modular dashboard (greeting, summary, quick actions, ticker, trending, events) */}
      <CampusPulse />

      {/* Phase 6 — daily hits & competition */}
      <section className="mt-6 px-5">
        <PhaseSixRow />
      </section>

      {/* Smart universal search */}
      <section className="px-5">
        <SmartSearch />
      </section>

      {/* Opportunity rail — jobs / internships / scholarships / research / leadership / volunteer */}
      <OpportunityRail />

      {/* Campus Economy entry — Phase 2 */}
      <section className="mt-7 px-5">
        <Link to="/economy" className="tap relative block overflow-hidden rounded-3xl border border-primary/30 p-5"
          style={{ background: "var(--gradient-bronze)" }}>
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full blur-3xl opacity-50"
            style={{ background: "var(--plugu-purple)" }} />
          <div className="relative flex items-start gap-3">
            <div className="h-11 w-11 grid place-items-center rounded-2xl bg-black/30 border border-white/15">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0 text-primary-foreground">
              <p className="text-[10px] tracking-widest uppercase opacity-80">Campus Economy · Live</p>
              <p className="text-sm font-bold mt-0.5">{campusEconomies[0].campus} · +{campusEconomies[0].stats.growthPct}% this month</p>
              <p className="text-[11px] opacity-80 mt-1">
                {formatMoney(platformInsights().moneyToday)} generated today · National rankings · PlugU Campus Grant
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">
                Open Economy <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
            <TrendingUp className="h-4 w-4 text-primary-foreground/80" />
          </div>
        </Link>
      </section>

      {/* Category shortcuts */}
      <section className="mt-7">
        <SectionHeader title="Browse the Market" action="See all" onAction={() => navigate({ to: "/market" })} />
        <div className="px-5 grid grid-cols-4 gap-3">
          {categories.slice(0, 8).map((c) => (
            <Link key={c.key} to="/market" className="tap flex flex-col items-center gap-2">
              <div className="h-14 w-14 grid place-items-center rounded-2xl bg-card border border-border text-2xl">
                {c.emoji}
              </div>
              <span className="text-[11px] text-muted-foreground">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* PlugU Daily — briefing */}
      <PluguDaily />

      {/* Scholarships & Grants */}
      <section className="mt-7">
        <SectionHeader title="Scholarships & Grants" action="See all" onAction={() => navigate({ to: "/hub" })} />
        <ul className="px-5 space-y-2">
          {scholarships.slice(0, 3).map((s) => (
            <li key={s.name} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
              <div className="h-10 w-10 grid place-items-center rounded-xl border border-border" style={{ background: "color-mix(in oklab, var(--plugu-purple) 12%, transparent)" }}>
                <GraduationCap className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{s.name}</p>
                <p className="text-[11px] text-muted-foreground">{s.amount} · Due {s.deadline}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </li>
          ))}
        </ul>
      </section>

      {/* Become a Plug CTA */}
      <section className="mt-7 px-5">
        <Link
          to="/business"
          className="tap group relative flex items-center gap-3 overflow-hidden rounded-3xl border border-primary/40 p-4"
          style={{ background: "var(--gradient-bronze)" }}
        >
          <div className="h-11 w-11 grid place-items-center rounded-2xl bg-black/30 border border-white/15">
            <Plug className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-primary-foreground">Become a Plug</p>
            <p className="text-[11px] text-primary-foreground/80">
              Sell items, food, services, rides, tickets, tutoring & more.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-primary-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>

      {/* Career & Money Hub teaser */}
      <section className="mt-5 px-5">
        <Link to="/hub" className="relative block overflow-hidden rounded-3xl border border-border bg-card p-5">
          <div
            className="pointer-events-none absolute -top-12 -left-12 h-44 w-44 rounded-full blur-3xl opacity-40"
            style={{ background: "var(--plugu-purple)" }}
          />
          <div className="relative flex items-start gap-3">
            <div className="h-11 w-11 grid place-items-center rounded-2xl bg-[image:var(--gradient-bronze)]">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--plugu-gold)" }}>Career & Money Hub</p>
              <p className="text-sm font-semibold mt-0.5">Internships, scholarships, side hustles & more.</p>
              <p className="text-xs text-muted-foreground mt-1">Every opportunity, deal, and money skill — in one place.</p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Open Hub <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Student Deals */}
      <section className="mt-7">
        <SectionHeader title="Student Deals" action="See all" onAction={() => navigate({ to: "/hub" })} />
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {hbcuDiscounts.map((d) => (
            <div key={d.brand} className="min-w-[200px] rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase" style={{ color: "var(--plugu-gold)" }}>
                <Tag className="h-3 w-3" /> Deal
              </div>
              <p className="mt-1.5 text-sm font-semibold">{d.brand}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{d.offer}</p>
              <p className="mt-2 inline-block rounded-md border border-dashed border-primary/50 px-2 py-0.5 text-[10px] tracking-widest text-primary">{d.code}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plug Business Center */}
      <section className="mt-7 px-5">
        <Link to="/business" className="relative block overflow-hidden rounded-3xl border border-border bg-card p-5">
          <div
            className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full blur-3xl opacity-40"
            style={{ background: "var(--plugu-purple)" }}
          />
          <div className="relative flex items-start gap-3">
            <div className="h-11 w-11 grid place-items-center rounded-2xl bg-[image:var(--gradient-bronze)]">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--plugu-gold)" }}>Plug Business Center</p>
              <p className="text-sm font-semibold mt-0.5">Run your hustle like a brand.</p>
              <p className="text-xs text-muted-foreground mt-1">Listings, bookings, payouts, analytics & KingPin tools — all in one place.</p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Open Business Center <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Live Campus Map preview */}
      <section className="mt-7 px-5">
        <SectionHeader title="Live Campus Map" action="Open" onAction={() => navigate({ to: "/map" })} />
        <Link to="/map" className="relative block overflow-hidden rounded-3xl border border-border h-40">
          <img src={campusMap} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur px-2 py-1 text-[10px] font-medium text-white border border-white/15">
            <span className="h-1.5 w-1.5 rounded-full plugu-pulse" style={{ background: "var(--plugu-gold)" }} /> Live
          </span>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-1.5"><MapIcon className="h-4 w-4" /> What's near you</p>
              <p className="text-[11px] text-white/75">Vendors, events, rides & study spots in real time.</p>
            </div>
            <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1.5">Open</span>
          </div>
        </Link>
      </section>

      {/* Recent Messages */}
      <section className="mt-7">
        <SectionHeader title="Recent Messages" action="Inbox" onAction={() => navigate({ to: "/messages" })} />
        <ul className="px-5 space-y-2">
          {messagesList.slice(0, 3).map((m) => (
            <li key={m.id}>
            <Link
              to="/messages/$id"
              params={{ id: m.id }}
              className="tap flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
            >
              <div className="relative h-10 w-10 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                {m.name[0]}
                {m.unread && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card" style={{ background: "var(--plugu-gold)" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate">{m.name}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{m.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{m.preview}</p>
              </div>
              <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Recommended Services */}
      <section className="mt-7 mb-4">
        <SectionHeader title="Recommended for you" action="See all" onAction={() => navigate({ to: "/market" })} />
        <ul className="px-5 space-y-2">
          {nearbyServices.map((s) => (
            <li key={s.name} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
              <div className="h-12 w-12 rounded-xl bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                {s.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground truncate">{s.type} · {s.distance}</p>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                <span>{s.rating}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Home-only footer strip — "EXCLUSIVE · VERIFIED · REAL TIME · BUILT BY US" */}
      <section className="px-5 pt-2 pb-6">
        <div
          className="grid grid-cols-4 gap-2 rounded-2xl border border-white/10 px-3 py-3 text-center"
          style={{
            background: "linear-gradient(180deg, rgba(23,23,23,0.7), rgba(10,10,10,0.85))",
            backdropFilter: "blur(14px) saturate(140%)",
          }}
        >
          {["Exclusive", "Verified", "Real Time", "Built By Us"].map((label) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: "var(--plugu-gold)", boxShadow: "0 0 8px var(--plugu-gold)" }}
              />
              <span className="text-[9px] font-bold tracking-[0.22em] uppercase text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>
      </PullToRefresh>
    </AppShell>
  );
}

function PhaseSixRow() {
  const season = currentSeason();
  const rank = typeof window !== "undefined" ? yourRank() : null;
  const tiles = [
    {
      to: "/daily" as const,
      icon: Newspaper,
      title: "PlugU Daily",
      hint: "Today's drops",
      accent: "#f4c96a",
    },
    {
      to: "/nationals" as const,
      icon: Trophy,
      title: rank ? `Rank #${rank.rank}` : "Nationals",
      hint: rank ? rank.campus : "Live leaderboard",
      accent: "#c68a52",
    },
    {
      to: "/heatmap" as const,
      icon: Flame,
      title: "Heat Map",
      hint: "Where the yard is",
      accent: "#ef4444",
    },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <Link key={t.to} to={t.to}
            className="tap lift-card rounded-2xl border border-border bg-card p-3"
            style={{ boxShadow: `0 0 22px -16px ${t.accent}` }}
          >
            <div className="h-9 w-9 grid place-items-center rounded-xl"
              style={{
                background: `radial-gradient(circle at 30% 25%, color-mix(in oklab, ${t.accent} 40%, transparent), transparent)`,
                border: `1px solid color-mix(in oklab, ${t.accent} 45%, transparent)`,
              }}
            >
              <Icon className="h-4 w-4" style={{ color: t.accent }} />
            </div>
            <p className="mt-2 text-[12px] font-semibold leading-tight">{t.title}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{t.hint}</p>
          </Link>
        );
      })}
      {season && (
        <Link to="/season/$slug" params={{ slug: season.key }}
          className="tap col-span-3 mt-1 rounded-2xl border border-primary/40 p-3 flex items-center gap-3 lift-card"
          style={{ background: season.gradient }}
        >
          <div className="h-9 w-9 grid place-items-center rounded-xl bg-black/40 border border-white/20 shrink-0">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] tracking-[0.24em] uppercase text-white/70">Season · {season.window}</p>
            <p className="text-sm font-semibold text-white truncate">{season.emoji} {season.label}</p>
            <p className="text-[11px] text-white/80 truncate">{season.tagline}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-white/80" />
        </Link>
      )}
    </div>
  );
}
