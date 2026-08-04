import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Plug, Search, ArrowRight, Sparkles, CalendarDays, MapPin, ChevronRight, Megaphone,
} from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import { PullToRefresh } from "@/components/PullToRefresh";
import { CommunityBoard } from "@/components/CommunityBoard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { LookingForSheet } from "@/components/LookingForSheet";
import { useProfile } from "@/hooks/use-profile";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { IntroCarousel, hasSeenIntro } from "@/components/IntroCarousel";
import { AVAILABLE_CATEGORIES } from "@/lib/categories";
import { useMarketplace } from "@/hooks/use-listings";
import { useMyBusiness } from "@/hooks/use-business";
import type { ListingWithExtras } from "@/lib/listings-db";

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
  const [lookingOpen, setLookingOpen] = useState(false);

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

      {/* Hero — primary message + rotating highlights */}
      <section className="px-5 pt-4">
        <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: "var(--plugu-gold)" }}>
          Your campus, plugged in
        </p>
        <h1 className="mt-1.5 text-[20px] font-extrabold leading-[1.2] text-foreground">
          Buy from students. Book student services.{" "}
          <span style={{ color: "var(--plugu-gold)" }}>Make money on your campus.</span>
        </h1>
      </section>

      <HeroCarousel />

      {/* Search + Looking For */}
      <section className="mt-3 flex gap-2 px-5">
        <button
          type="button"
          onClick={() => navigate({ to: "/search" })}
          className="tap flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm text-muted-foreground"
        >
          <Search className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">Search haircuts, food, tutors, dorm gear…</span>
        </button>
        <button
          type="button"
          onClick={() => setLookingOpen(true)}
          className="tap flex shrink-0 items-center gap-1.5 rounded-2xl border border-primary/40 bg-primary/10 px-3.5 py-3 text-xs font-semibold text-primary"
        >
          <Megaphone className="h-4 w-4" /> Looking For
        </button>
      </section>
      <LookingForSheet open={lookingOpen} onClose={() => setLookingOpen(false)} />

      <VerificationBanner />

      {/* Marketplace categories */}
      <section className="mt-6">
        <SectionHeader title="Shop by category" action="See all" onAction={() => navigate({ to: "/market" })} />
        <div className="px-5 grid grid-cols-4 gap-3">
          {AVAILABLE_CATEGORIES.slice(0, 8).map((c) => (
            <Link
              key={c.key}
              to="/market"
              search={{ category: c.key } as never}
              className="tap flex flex-col items-center gap-2"
            >
              <div className="h-14 w-14 grid place-items-center rounded-2xl bg-card border border-border text-2xl">
                {c.emoji}
              </div>
              <span className="text-[11px] text-muted-foreground text-center leading-tight">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending real listings */}
      <TrendingListings />

      {/* Nearby campus services */}
      <NearbyServices />

      {/* Upcoming campus events */}
      <UpcomingEvents />

      {/* Sell on PlugU */}
      <SellCta />

      {/* Community — student-posted campus updates */}
      <CommunityBoard />

      {/* More — everything else lives behind its own tab */}
      <MoreLinks />

      </PullToRefresh>
    </AppShell>
  );
}

function VerificationBanner() {
  const { profile } = useProfile();
  if (!profile) return null;
  if (profile.verification_status === "verified" && profile.school_id) return null;
  return (
    <section className="mt-4 px-5">
      <Link
        to="/request-school-access"
        className="flex items-start gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-left"
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {profile.verification_status === "rejected"
              ? "School verification denied"
              : "Verify your school to unlock everything"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your <span className="text-foreground">@{profile.school_domain ?? "school"}</span> domain isn't in our verified registry yet — request access here.
          </p>
        </div>
        <span className="shrink-0 text-primary text-sm">→</span>
      </Link>
    </section>
  );
}

function centsToPrice(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function EmptyRow({ icon, text, cta, to }: { icon: React.ReactNode; text: string; cta: string; to: string }) {
  return (
    <div className="px-5">
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-4 flex items-center gap-3">
        <div className="h-9 w-9 grid place-items-center rounded-xl border border-border text-primary">{icon}</div>
        <p className="flex-1 text-xs text-muted-foreground">{text}</p>
        <Link to={to as never} className="tap rounded-xl bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1.5">{cta}</Link>
      </div>
    </div>
  );
}

function ListingCard({ l }: { l: ListingWithExtras }) {
  const cover = l.images[0]?.url;
  return (
    <Link
      to="/checkout/$listingId"
      params={{ listingId: l.id }}
      className="tap min-w-[160px] w-40 shrink-0 rounded-2xl border border-border bg-card overflow-hidden"
    >
      <div className="h-24 bg-black/40 relative">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-2xl opacity-60">🛍️</div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold truncate">{l.title}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {l.seller?.display_name ?? l.seller?.username ?? "Student seller"}
        </p>
        <p className="mt-1 text-xs font-bold" style={{ color: "var(--plugu-gold)" }}>
          {centsToPrice(l.price_cents)}
        </p>
      </div>
    </Link>
  );
}

function TrendingListings() {
  const navigate = useNavigate();
  const { data, isLoading } = useMarketplace({ sort: "popular", limit: 8 });
  return (
    <section className="mt-7">
      <SectionHeader title="Trending on PlugU" action="See all" onAction={() => navigate({ to: "/market" })} />
      {isLoading ? (
        <div className="px-5 flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[160px] w-40 h-44 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="px-5 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {data.map((l) => <ListingCard key={l.id} l={l} />)}
        </div>
      ) : (
        <EmptyRow icon={<Sparkles className="h-4 w-4" />} text="No listings yet — be the first to post." cta="Start selling" to="/seller/onboarding" />
      )}
    </section>
  );
}

function NearbyServices() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { data, isLoading } = useMarketplace({
    school_id: profile?.school_id ?? undefined,
    campus_scope: profile?.school_id ? "mine" : "all",
    sort: "newest",
    limit: 8,
  });
  const services = (data ?? []).filter((l) => l.kind === "service").slice(0, 6);
  return (
    <section className="mt-7">
      <SectionHeader title="Nearby campus services" action="See all" onAction={() => navigate({ to: "/market" })} />
      {isLoading ? (
        <div className="px-5 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : services.length > 0 ? (
        <ul className="px-5 space-y-2">
          {services.map((s) => (
            <li key={s.id}>
              <Link to="/checkout/$listingId" params={{ listingId: s.id }} className="tap flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
                <div className="h-11 w-11 rounded-xl bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                  {s.title[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {s.campus_name ?? s.seller?.school_name ?? "Nearby"} · {centsToPrice(s.price_cents)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyRow icon={<MapPin className="h-4 w-4" />} text="No services listed on your campus yet." cta="Offer a service" to="/seller/onboarding" />
      )}
    </section>
  );
}

function UpcomingEvents() {
  const navigate = useNavigate();
  const { data, isLoading } = useMarketplace({ category: "events", sort: "newest", limit: 6 });
  return (
    <section className="mt-7">
      <SectionHeader title="Upcoming campus events" action="See all" onAction={() => navigate({ to: "/events" })} />
      {isLoading ? (
        <div className="px-5 flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="min-w-[220px] h-24 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="px-5 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {data.map((e) => (
            <Link key={e.id} to="/checkout/$listingId" params={{ listingId: e.id }} className="tap min-w-[220px] w-56 rounded-2xl border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase" style={{ color: "var(--plugu-gold)" }}>
                <CalendarDays className="h-3 w-3" /> Event
              </div>
              <p className="mt-1.5 text-sm font-semibold truncate">{e.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{e.campus_name ?? e.seller?.school_name ?? "Campus"}</p>
              <p className="mt-1 text-xs font-bold" style={{ color: "var(--plugu-gold)" }}>{centsToPrice(e.price_cents)}</p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyRow icon={<CalendarDays className="h-4 w-4" />} text="No campus events posted yet." cta="Promote an event" to="/seller/onboarding" />
      )}
    </section>
  );
}

function SellCta() {
  const { business } = useMyBusiness();
  const target = business ? "/seller" : "/seller/onboarding";
  return (
    <section className="mt-7 px-5">
      <Link
        to={target}
        className="tap group relative flex items-center gap-3 overflow-hidden rounded-3xl border border-primary/40 p-4"
        style={{ background: "var(--gradient-bronze)" }}
      >
        <div className="h-11 w-11 grid place-items-center rounded-2xl bg-black/30 border border-white/15">
          <Plug className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-primary-foreground">
            {business ? "Open your seller dashboard" : "Sell on PlugU"}
          </p>
          <p className="text-[11px] text-primary-foreground/80">
            {business
              ? "Manage listings, bookings, and payouts."
              : "Turn your skill or hustle into campus income."}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-primary-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}

function MoreLinks() {
  const items = [
    { to: "/map" as const, label: "Campus map", emoji: "🗺️" },
    { to: "/hbcus" as const, label: "HBCUS", emoji: "👑" },
    { to: "/hub" as const, label: "Money & career", emoji: "💼" },
    { to: "/news" as const, label: "News center", emoji: "📰" },
  ];
  return (
    <section className="mt-8 mb-6 px-5">
      <p className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground mb-2">More on PlugU</p>
      <div className="grid grid-cols-4 gap-2">
        {items.map((i) => (
          <Link key={i.to} to={i.to} className="tap rounded-2xl border border-border bg-card p-3 flex flex-col items-center gap-1">
            <span className="text-xl">{i.emoji}</span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">{i.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
