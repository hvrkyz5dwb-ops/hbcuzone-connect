import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell, Calendar, Users, BadgeCheck, GraduationCap, Plug as PlugIcon, Gem,
  Store, Map as MapIcon, MessageSquare, Plug, Plus,
} from "lucide-react";
import { SectionHeader } from "@/components/AppShell";
import { Reveal } from "@/components/Reveal";
import { usePersona } from "@/hooks/use-persona";
import { greetingFor } from "@/lib/weather-mock";
import { useSchool } from "@/hooks/use-school";
import { useProfile } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";
import { getCampusWeather } from "@/lib/campus-intel.functions";
import { useCampusEvents } from "@/hooks/use-campus";
import { useMarketplace } from "@/hooks/use-listings";

function Countdown({ when }: { when: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border border-primary/40 text-primary">
      <Calendar className="h-3 w-3" /> {when}
    </span>
  );
}

function BadgeIcon({ badge }: { badge: string }) {
  // Bronze → Silver → Gold → Diamond progression as plugs upgrade.
  const common = "h-7 w-7 shrink-0";
  switch (badge) {
    case "Student":
      return <GraduationCap className={common} style={{ color: "#cfd6dd", filter: "drop-shadow(0 0 6px rgba(210,220,235,0.6))" }} />;
    case "Plug":
      return <PlugIcon className={common} style={{ color: "#d19a5a", filter: "drop-shadow(0 0 6px rgba(200,140,80,0.55))" }} />;
    case "Verified Plug":
      return <BadgeCheck className={common} style={{ color: "#e5eaf1", filter: "drop-shadow(0 0 6px rgba(220,230,245,0.6))" }} />;
    case "Gold Plug":
      return <PlugIcon className={common} style={{ color: "var(--plugu-gold)", filter: "drop-shadow(0 0 8px rgba(240,200,120,0.7))" }} />;
    case "Kingpin":
    default:
      return <Gem className={common} style={{ color: "#a5f3fc", filter: "drop-shadow(0 0 10px rgba(160,230,255,0.9))" }} />;
  }
}

function badgeWordmarkClass(badge: string): string {
  switch (badge) {
    case "Student":       return "silver-wordmark";
    case "Plug":          return "tier-bronze";
    case "Verified Plug": return "silver-wordmark";
    case "Gold Plug":     return "plugu-wordmark";
    case "Kingpin":
    default:              return "diamond-wordmark";
  }
}

function eventWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "";
  return d.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

/**
 * Signed-in campus home. Every number and card on this screen comes from a real
 * record — campus events and marketplace listings read straight from the
 * database, weather from a live feed. Nothing here is seeded or simulated.
 */
export function CampusPulse() {
  const [persona] = usePersona();
  const school = useSchool();
  const { profile } = useProfile();
  // Badges are earned, not bought — every student sees their persona badge.
  const displayBadge = persona.badge;
  const isUpgraded = true;
  const displayCampus = school.name && school.name !== "Your Campus" ? school.name : persona.campus;
  const firstName = (profile?.full_name?.trim().split(/\s+/)[0]) || "Plug";
  const displayYear = profile?.year || persona.year;
  const displayMajor = profile?.major || persona.major;
  const weatherQ = useQuery({
    queryKey: ["campus-weather", displayCampus, school.city, school.state],
    queryFn: () => getCampusWeather({ data: { school: displayCampus, city: school.city, state: school.state } }),
    staleTime: 15 * 60_000,
    refetchOnWindowFocus: false,
  });
  const weather = weatherQ.data;
  const [greeting, setGreeting] = useState("Welcome back");
  useEffect(() => { setGreeting(greetingFor()); }, []);

  const eventsQ = useCampusEvents();
  const now = Date.now();
  const upcoming = (eventsQ.data ?? [])
    .filter((e) => e.status !== "cancelled" && +new Date(e.starts_at) >= now - 3 * 60 * 60 * 1000)
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at))
    .slice(0, 6);

  const listingsQ = useMarketplace({
    school_id: profile?.school_id ?? undefined,
    campus_scope: profile?.school_id ? "mine" : "all",
    sort: "newest",
    limit: 4,
  });
  const listings = (listingsQ.data ?? []).slice(0, 4);

  return (
    <>
      {/* Greeting + weather */}
      <section className="px-5 pt-5 slide-up">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{greeting},</p>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2 truncate">
              <span>Hello </span>
              <span className={isUpgraded ? badgeWordmarkClass(displayBadge) : "text-white"}>
                {firstName}
              </span>
              {isUpgraded && <BadgeIcon badge={displayBadge} />}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              {[displayCampus, displayYear, displayMajor].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-bold flex items-center gap-1 justify-end">
                <span>{weather?.emoji ?? "☀️"}</span> {weather ? `${weather.tempF}°` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                {weather?.blurb ?? (weatherQ.isPending ? "Checking sky…" : "Campus weather")}
              </p>
            </div>
            <Link to="/notifications" aria-label="Notifications" className="relative h-10 w-10 grid place-items-center rounded-full bg-secondary border border-border">
              <Bell className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <Reveal as="section" index={1} className="mt-4 px-5">
        <div className="grid grid-cols-4 gap-3">
          {[
            { to: "/business", label: "Sell", icon: Store },
            { to: "/market",   label: "Book", icon: Plug },
            { to: "/map",      label: "Map",  icon: MapIcon },
            { to: "/messages", label: "Inbox", icon: MessageSquare },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.to}
                to={a.to as "/market"}
                className="tap lift-card flex flex-col items-center gap-2 rounded-2xl border border-white/10 py-4"
                style={{
                  background: "linear-gradient(180deg, rgba(23,23,23,0.85), rgba(10,10,10,0.85))",
                  backdropFilter: "blur(14px) saturate(140%)",
                }}
              >
                <div
                  className="h-10 w-10 grid place-items-center rounded-xl"
                  style={{
                    background: "linear-gradient(160deg, #1c1c1c, #0f0f0f)",
                    border: "1px solid color-mix(in oklab, var(--plugu-gold) 45%, transparent)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 20px -8px rgba(244,201,106,0.55)",
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} style={{ color: "var(--plugu-gold)" }} />
                </div>
                <span className="text-[11px] font-medium tracking-wide">{a.label}</span>
              </Link>
            );
          })}
        </div>
      </Reveal>

      {/* Marketplace — real listings only */}
      <Reveal as="section" index={2} className="mt-7">
        <SectionHeader title="New on the marketplace" action="Open" />
        {listingsQ.isPending ? (
          <div className="px-5 grid grid-cols-2 gap-3" aria-hidden="true">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="mx-5 rounded-2xl border border-dashed border-border bg-card/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">Nothing posted at {displayCampus} yet.</p>
            <Link to="/business" className="tap mt-2 inline-block text-xs font-semibold text-primary">
              Post the first listing
            </Link>
          </div>
        ) : (
          <div className="px-5 grid grid-cols-2 gap-3">
            {listings.map((l) => (
              <Link
                key={l.id}
                to="/checkout/$listingId"
                params={{ listingId: l.id }}
                className="tap lift-card rounded-2xl bg-card border border-border overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-secondary">
                  {l.images[0]?.url && (
                    <img src={l.images[0]!.url} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-medium line-clamp-1 flex-1">{l.title}</p>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, rgba(244,201,106,0.18), rgba(244,201,106,0.06))",
                      border: "1px solid color-mix(in oklab, var(--plugu-gold) 45%, transparent)",
                      color: "var(--plugu-gold)",
                    }}
                  >
                    ${(l.price_cents / 100).toFixed(0)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Reveal>

      {/* Upcoming events — real campus_events rows */}
      <Reveal as="section" index={3} className="mt-7">
        <SectionHeader title="Upcoming on campus" action="All events" />
        <div tabIndex={0} className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {eventsQ.isPending && (
            <div className="h-[132px] w-[240px] shrink-0 rounded-2xl border border-border bg-card animate-pulse" aria-hidden="true" />
          )}
          {!eventsQ.isPending && upcoming.length === 0 && (
            <Link
              to="/events"
              className="min-w-[240px] rounded-2xl border border-dashed border-primary/50 bg-card p-4 flex flex-col items-center justify-center text-center gap-2"
              style={{ boxShadow: "inset 0 0 0 1px rgba(201,162,74,0.12)" }}
            >
              <div
                className="h-10 w-10 grid place-items-center rounded-full text-primary-foreground"
                style={{ background: "var(--gradient-bronze)" }}
              >
                <Plus className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold">No events at {displayCampus} yet</p>
              <p className="text-[11px] text-muted-foreground">Tap to post the first one</p>
            </Link>
          )}
          {upcoming.map((e) => (
            <Link
              key={e.id}
              to="/events"
              className="min-w-[240px] rounded-2xl border border-border bg-[image:var(--gradient-surface)] p-4"
            >
              <Countdown when={eventWhen(e.starts_at)} />
              <h3 className="mt-2 font-semibold text-base leading-snug line-clamp-2">{e.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{e.location}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Users className="h-3 w-3" /> {e.rsvp_count} going
              </span>
            </Link>
          ))}
          {upcoming.length > 0 && (
            <Link
              to="/events"
              className="min-w-[160px] rounded-2xl border border-dashed border-primary/50 bg-card p-4 flex flex-col items-center justify-center gap-2 text-center"
            >
              <div
                className="h-9 w-9 grid place-items-center rounded-full text-primary-foreground"
                style={{ background: "var(--gradient-bronze)" }}
              >
                <Plus className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold">Add event</p>
              <p className="text-[10px] text-muted-foreground">Post to {displayCampus}</p>
            </Link>
          )}
        </div>
      </Reveal>
    </>
  );
}
