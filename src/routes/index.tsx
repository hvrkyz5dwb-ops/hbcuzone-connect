import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Plug, Search, ArrowRight, Sparkles, CalendarDays, MapPin, ChevronRight, Megaphone, BadgeCheck,
} from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import { PullToRefresh } from "@/components/PullToRefresh";
import { PersonalizedHome } from "@/components/home/HomeSections";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CampusBar } from "@/components/campus/CampusBar";
import { useCampusScope } from "@/hooks/use-campus-scope";
import { LookingForSheet } from "@/components/LookingForSheet";
import { useProfile } from "@/hooks/use-profile";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { OnboardingExperience } from "@/components/OnboardingExperience";
import {
  hasSeenIntro,
  markIntroSeen,
  FIRST_FEED_EVENT,
  consumeFeedStaggerPending,
} from "@/lib/first-launch";
import { AVAILABLE_CATEGORIES } from "@/lib/categories";
import { categoryImage } from "@/lib/category-icons";
import { useMarketplace } from "@/hooks/use-listings";
import { useMyBusiness } from "@/hooks/use-business";
import type { ListingWithExtras } from "@/lib/listings-db";
import { requestAuthentication } from "@/components/RequireAuthPrompt";

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

/**
 * Branded boot state. Replaces the old blank black screen so a slow network
 * never looks like a broken launch, and offers a manual escape hatch to
 * sign-in after 5s (App Review 2.1(a): the user can never be trapped).
 */
function EntryLoading() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setSlow(true), 2500);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div
      className="min-h-screen bg-background grid place-items-center px-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div>
        <p className="text-[26px] font-black tracking-[0.24em]" style={{ color: "var(--plugu-gold)" }}>
          PLUGU
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {slow ? "Still connecting…" : "Starting up…"}
        </p>
        {slow && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <Link
              to="/auth"
              search={{ next: "/", mode: "" } as never}
              aria-label="Continue to sign in or create an account"
              className="tap inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-bold text-black"
              style={{ background: "var(--gradient-bronze)" }}
            >
              Continue
            </Link>
            <button
              type="button"
              aria-label="Try loading PlugU again"
              onClick={() => window.location.reload()}
              className="tap inline-flex h-11 items-center justify-center rounded-full border border-border px-7 text-sm font-semibold text-muted-foreground"
            >
              Try again
            </button>
            <div className="mt-1 flex items-center gap-4 text-[11px] text-muted-foreground underline">
              <Link to="/terms" aria-label="Read the Terms of Use">Terms</Link>
              <Link to="/privacy" aria-label="Read the Privacy Policy">Privacy</Link>
              <Link to="/support" aria-label="Get support">Support</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function Home() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [lookingOpen, setLookingOpen] = useState(false);
  // SSR/prerender and the first client render must agree: both paint the
  // blank shell until hydration, since session/intro state only exists in
  // the browser. Without this gate React throws a hydration mismatch.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // The global cinematic is mounted by __root after React is ready. New guests
  // see onboarding once, then can browse Home without creating an account.
  const [guestIntro, setGuestIntro] = useState(false);
  useEffect(() => {
    if (loading) return;
    if (session) return;
    try {
      if (!hasSeenIntro()) {
        setGuestIntro(true);
      }
    } catch (err) {
      // Storage blocked / navigation raced: never strand the guest.
      console.error("[PlugU:entry] guest onboarding failed", err);
      setGuestIntro(false);
    }
  }, [loading, session, navigate]);

  function finishGuestIntro() {
    markIntroSeen();
    setGuestIntro(false);
  }

  // One-time animated feed entrance after the coach-mark tour finishes:
  // the welcome lands, then featured businesses & events stagger in.
  const [feedStagger, setFeedStagger] = useState(false);
  useEffect(() => {
    const trigger = () => {
      if (consumeFeedStaggerPending()) setFeedStagger(true);
    };
    trigger();
    window.addEventListener(FIRST_FEED_EVENT, trigger);
    return () => window.removeEventListener(FIRST_FEED_EVENT, trigger);
  }, []);
  useEffect(() => {
    if (!feedStagger) return;
    const t = window.setTimeout(() => setFeedStagger(false), 1500);
    return () => window.clearTimeout(t);
  }, [feedStagger]);

  if (!hydrated || loading) {
    return <EntryLoading />;
  }
  if (!session && guestIntro) return <OnboardingExperience onComplete={finishGuestIntro} />;

  return (
    <AppShell title="PLUGU">
      <PullToRefresh onRefresh={async () => { await new Promise(r => setTimeout(r, 600)); toast.success("You're all caught up"); }}>

      {/* Which campus this feed belongs to, plus the student's verification state */}
      <CampusBar subtitle="Built for HBCU students and student-owned businesses" />

      {/* Hero — PlugU's purpose, stated plainly */}
      <section className="px-5 pt-4">
        <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "var(--plugu-gold)" }}>
          <HomeGreeting />
        </p>
        <h1 className="mt-2 text-[27px] font-black leading-[1.08] tracking-[-0.02em] text-foreground">
          Buy, sell, book and<br />
          build on <span style={{ color: "var(--plugu-gold)" }}>your campus.</span>
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Student-owned businesses, campus services, events and opportunities — verified
          student to verified student.
        </p>
      </section>

      <div className={feedStagger ? "fse fse-d1" : undefined}>
        <HeroCarousel />
      </div>

      {/* Search + Post a Request */}
      <section className="mt-4 flex gap-2 px-5">
        <button
          type="button"
          onClick={() => navigate({ to: "/search" })}
          className="tap flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-3.5 text-left text-sm text-muted-foreground"
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">Search campus services, food, events…</span>
        </button>
        <button
          type="button"
          onClick={() => session ? setLookingOpen(true) : requestAuthentication()}
          className="tap flex shrink-0 items-center gap-1.5 rounded-full border border-primary/50 bg-primary/5 px-4 py-3.5 text-xs font-bold text-primary"
        >
          <Megaphone className="h-4 w-4" /> Post a Request
        </button>
      </section>
      <LookingForSheet open={lookingOpen} onClose={() => setLookingOpen(false)} />

      <VerificationBanner />

      <PersonalizedHome />

      {/* Marketplace categories */}
      <section className="mt-6">
        <SectionHeader title="Buy and Sell on Campus" action="See all" onAction={() => navigate({ to: "/market" })} />
        <div className="px-5 grid grid-cols-4 gap-2.5">
          {AVAILABLE_CATEGORIES.slice(0, 8).map((c) => (
            <Link
              key={c.key}
              to="/market"
              search={{ category: c.key } as never}
              className="tap group relative flex aspect-square flex-col items-end justify-end overflow-hidden rounded-2xl border"
              style={{
                borderColor: "color-mix(in oklab, var(--plugu-gold) 28%, transparent)",
                background: "#08080a",
              }}
            >
              <img
                src={categoryImage(c.key)}
                alt=""
                aria-hidden="true"
                loading="lazy"
                width={512}
                height={512}
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />
              <span
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 22%, rgba(0,0,0,0.15) 62%, transparent)" }}
              />
              <span
                className="relative w-full px-1.5 pb-1.5 text-center text-[10px] font-semibold leading-tight"
                style={{ color: "var(--plugu-gold)" }}
              >
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending real listings */}
      <div className={feedStagger ? "fse fse-d2" : undefined}>
        <TrendingListings />
      </div>

      {/* Sell on PlugU */}
      <div className={feedStagger ? "fse fse-d5" : undefined}>
        <SellCta />
      </div>

      {/* Campus safety & community standards — always one tap from Home */}
      <SafetyStandards />

      {/* More — everything else lives behind its own tab */}
      <MoreLinks />

      </PullToRefresh>
    </AppShell>
  );
}

function HomeGreeting() {
  const { profile } = useProfile();
  const name = (profile?.display_name || profile?.full_name || "Guest").trim().split(/\s+/)[0] || "Guest";
  return <>Hello {name}</>;
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
  const sellerName = l.seller?.display_name ?? l.seller?.username ?? "Student seller";
  const initial = sellerName[0]?.toUpperCase() ?? "?";
  return (
    <Link
      to="/checkout/$listingId"
      params={{ listingId: l.id }}
      className="tap min-w-[176px] w-44 shrink-0 overflow-hidden rounded-3xl border border-border bg-card"
    >
      <div className="relative h-32 bg-black/40">
        {cover ? (
          <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-2xl opacity-60">🛍️</div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 bg-gradient-to-b from-black/75 to-transparent px-2 py-1.5">
          <span className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/50 bg-black/60 text-[10px] font-bold text-primary">
            {l.seller?.avatar_url ? (
              <img src={l.seller.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : initial}
          </span>
          <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-primary-foreground">{sellerName}</span>
          {l.seller?.username && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />}
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold truncate">{l.title}</p>
        <p className="text-[10px] text-muted-foreground truncate">{l.campus_name ?? l.seller?.school_name ?? "On campus"}</p>
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
    <section className="mt-7" data-tour="events">
      <SectionHeader title="Trending Student Businesses" action="See all" onAction={() => navigate({ to: "/market" })} />
      {isLoading ? (
        <div tabIndex={0} className="px-5 flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[176px] w-44 h-52 rounded-3xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div tabIndex={0} className="px-5 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {data.map((l) => <ListingCard key={l.id} l={l} />)}
        </div>
      ) : (
        <EmptyRow icon={<Sparkles className="h-4 w-4" />} text="No complete listings are available right now. Check another category." cta="Browse market" to="/market" />
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
        onClick={(event) => {
          if (!business) { event.preventDefault(); requestAuthentication(); }
        }}
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

/**
 * Campus Safety and Community Standards — PlugU's safety tools are part of
 * the Home experience, not buried in settings. Every link here is a real,
 * working screen.
 */
function SafetyStandards() {
  const { campusName } = useCampusScope();
  const { profile } = useProfile();
  const items = [
    { to: "/safety" as const, label: "Safety Center", hint: "How reporting and moderation work" },
    { to: "/community-guidelines" as const, label: "Community Standards", hint: "What's allowed on campus" },
    { to: "/blocked" as const, label: "Blocked students", hint: "Review and unblock" },
    { to: "/support" as const, label: "Contact support", hint: "Reach the PlugU team" },
  ];
  return (
    <section className="mt-8 px-5">
      <div className="rounded-3xl border border-border bg-card p-4">
        <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: "var(--plugu-gold)" }}>
          Campus safety
        </p>
        <h2 className="mt-1 text-base font-bold">Safety and community standards at {campusName}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Students only, verified by school email. Report or block anyone, any time — reported
          content disappears from your feed immediately.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              onClick={(event) => {
                if (!profile && i.to === "/blocked") { event.preventDefault(); requestAuthentication(); }
              }}
              className="tap flex min-h-[56px] flex-col justify-center rounded-2xl border border-border bg-background px-3 py-2"
            >
              <span className="text-xs font-semibold">{i.label}</span>
              <span className="text-[10px] text-muted-foreground">{i.hint}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
