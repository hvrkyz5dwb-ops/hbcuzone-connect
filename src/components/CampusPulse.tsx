import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Crown, Bell, ArrowRight, Calendar, Users, Sparkles, BadgeCheck, GraduationCap, Plug as PlugIcon, Gem,
  TrendingUp, Megaphone, Store, Map as MapIcon, MessageSquare, Plug, Radio, Plus,
} from "lucide-react";
import { SectionHeader } from "@/components/AppShell";
import { Reveal } from "@/components/Reveal";
import { usePersona } from "@/hooks/use-persona";
import { greetingFor } from "@/lib/weather-mock";
import { useSchool } from "@/hooks/use-school";
import { useProfile } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";
import { getCampusWeather } from "@/lib/campus-intel.functions";
import { liveActivity, businessSpotlight, aiRecommendations } from "@/lib/opportunities-data";
import { announcements, events as seedEvents, featuredKingpins, listings, hbcuEvents } from "@/lib/mock-data";
import { listUserEvents, subscribeUserEvents, type UserEvent } from "@/lib/events-storage";

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

export function CampusPulse() {
  const [persona] = usePersona();
  const school = useSchool();
  const { profile } = useProfile();
  // Badges are earned, not bought — every student sees their persona badge.
  const displayBadge = persona.badge;
  const isUpgraded = true;
  const displayCampus = school.name && school.name !== "Your Campus" ? school.name : persona.campus;
  // Match the Profile tab exactly: full name (first name only for greeting),
  // school, year, and major all come from the signed-in profile row.
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
  const [rsvped, setRsvped] = useState<Record<string, boolean>>({});
  const [tick, setTick] = useState(0);
  const [greeting, setGreeting] = useState("Welcome back");
  useEffect(() => { setGreeting(greetingFor()); }, []);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => (t + 1) % liveActivity.length), 3500);
    return () => clearInterval(i);
  }, []);
  const activity = liveActivity[tick];

  // School-scoped upcoming events: user-posted + seeded, filtered to this campus.
  const [userEvents, setUserEvents] = useState<UserEvent[]>(() => listUserEvents(displayCampus));
  useEffect(() => {
    setUserEvents(listUserEvents(displayCampus));
    return subscribeUserEvents(() => setUserEvents(listUserEvents(displayCampus)));
  }, [displayCampus]);
  const normKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const schoolKey = normKey(displayCampus);
  const seededForSchool = [
    ...seedEvents.map((e) => ({ title: e.title, when: e.when, where: e.where, school: undefined as string | undefined })),
    ...hbcuEvents.map((e) => ({ title: e.title, when: e.when, where: e.where, school: e.school as string | undefined })),
  ].filter((e) => {
    if (!e.school) return true;
    const k = normKey(e.school);
    return k.includes(schoolKey) || schoolKey.includes(k);
  });
  const upcoming = [
    ...userEvents.map((e) => ({ title: e.title, when: e.when, where: e.where, mine: true })),
    ...seededForSchool.map((e) => ({ title: e.title, when: e.when, where: e.where, mine: false })),
  ];

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
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent" />
            </Link>
          </div>
        </div>
      </section>

      {/* Campus Pulse summary card */}
      <Reveal as="section" index={1} className="mt-4 px-5">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-4">
          <div
            className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full blur-3xl opacity-40"
            style={{ background: "var(--plugu-purple)" }}
          />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--plugu-gold)" }}>
              <Sparkles className="h-3 w-3" /> Today on Campus
            </div>
            <h2 className="mt-1.5 text-base font-semibold leading-snug">
              3 events tonight · 2 scholarships closing this week · Fade God almost booked out.
            </h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { n: "3", l: "Events" },
                { n: "12", l: "New listings" },
                { n: "2", l: "Closing soon" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-border bg-background/50 px-3 py-2">
                  <p className="text-sm font-bold">{s.n}</p>
                  <p className="text-[10px] text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Quick actions */}
      <Reveal as="section" index={2} className="mt-4 px-5">
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

      {/* Live activity ticker */}
      <Reveal as="section" index={3} className="mt-4 px-5">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-3 py-2.5">
          <Radio className="h-3.5 w-3.5 text-primary plugu-pulse shrink-0" />
          <p key={tick} className="text-xs truncate slide-up">
            <span className="font-semibold">{activity.who}</span>{" "}
            <span className="text-muted-foreground">{activity.what}</span>{" "}
            <span>{activity.detail}</span>{" "}
            <span className="text-muted-foreground">· {activity.when}</span>
          </p>
        </div>
      </Reveal>

      {/* Trending businesses */}
      <Reveal as="section" index={4} className="mt-7">
        <SectionHeader title="Trending businesses" action="See all" />
        <div tabIndex={0} className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredKingpins.map((k) => (
            <Link
              key={k.handle}
              to="/business"
              className="tap lift-card min-w-[168px] rounded-2xl border border-border bg-card p-4 text-center"
            >
              <div
                className="mx-auto h-14 w-14 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-lg font-bold text-primary-foreground"
                style={{
                  boxShadow:
                    "0 0 0 2px color-mix(in oklab, var(--plugu-gold) 70%, transparent), 0 0 22px -4px rgba(244,201,106,0.55)",
                }}
              >
                {k.name[0]}
              </div>
              <p className="mt-2 font-semibold flex items-center justify-center gap-1">
                {k.name} <BadgeCheck className="h-3.5 w-3.5" style={{ color: "var(--plugu-gold)" }} />
              </p>
              <p className="text-[11px] text-muted-foreground">{k.campus}</p>
              <p className="text-[11px] text-primary mt-1 flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" /> {k.followers}
              </p>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Marketplace highlights */}
      <Reveal as="section" index={5} className="mt-7">
        <SectionHeader title="Marketplace highlights" action="Open" />
        <div className="px-5 grid grid-cols-2 gap-3">
          {listings.slice(0, 4).map((l) => (
            <Link
              key={l.id}
              to="/market"
              className="tap lift-card rounded-2xl bg-card border border-border overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] bg-secondary">
                <img src={l.image} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
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
                  {l.price}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Upcoming events */}
      <Reveal as="section" index={6} className="mt-7">
        <SectionHeader title="Tonight & this week" action="All events" />
        <div tabIndex={0} className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {upcoming.length === 0 && (
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
          {upcoming.map((e) => {
            const isRsvp = !!rsvped[e.title];
            return (
              <div key={e.title} className="min-w-[240px] rounded-2xl border border-border bg-[image:var(--gradient-surface)] p-4">
                <Countdown when={e.when} />
                {e.mine && (
                  <span className="ml-2 text-[9px] uppercase tracking-widest text-accent">Yours</span>
                )}
                <h3 className="mt-2 font-semibold text-base leading-snug">{e.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{e.where}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Users className="h-3 w-3" /> {120 + e.title.length * 3} going
                  </span>
                  <button
                    onClick={() => setRsvped((s) => ({ ...s, [e.title]: !s[e.title] }))}
                    className={`tap text-[11px] font-semibold rounded-full px-3 py-1.5 border transition-colors ${
                      isRsvp
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border"
                    }`}
                  >
                    {isRsvp ? "Going" : "RSVP"}
                  </button>
                </div>
              </div>
            );
          })}
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

      {/* Business Spotlight */}
      <Reveal as="section" index={7} className="mt-7 px-5">
        <SectionHeader title="Business Spotlight" />
        <Link
          to="/business"
          className="tap relative block overflow-hidden rounded-3xl border border-primary/40 p-5"
          style={{ background: "var(--gradient-surface)" }}
        >
          <div
            className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full blur-3xl opacity-40"
            style={{ background: "var(--plugu-gold)" }}
          />
          <div className="relative flex items-start gap-3">
            <div className="h-12 w-12 grid place-items-center rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-lg font-bold">
              C
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--plugu-gold)" }}>
                Plug of the week
              </p>
              <p className="text-base font-semibold">{businessSpotlight.name}</p>
              <p className="text-[11px] text-muted-foreground">{businessSpotlight.owner} · {businessSpotlight.school}</p>
              <p className="text-xs mt-2 text-muted-foreground">{businessSpotlight.blurb}</p>
              <p className="text-[11px] mt-2 font-semibold text-primary">{businessSpotlight.stat}</p>
            </div>
          </div>
        </Link>
      </Reveal>

      {/* Announcements */}
      <Reveal as="section" index={8} className="mt-7">
        <SectionHeader title="Campus announcements" />
        <ul className="px-5 space-y-2">
          {announcements.map((a) => (
            <li key={a.title} className="flex items-start gap-3 p-3 rounded-2xl bg-card border border-border">
              <div className="h-9 w-9 grid place-items-center rounded-xl bg-secondary border border-border">
                <Megaphone className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] tracking-widest uppercase text-primary">{a.tag} · {a.time}</p>
                <p className="text-sm font-medium mt-0.5 leading-snug">{a.title}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* AI Recommendations */}
      <Reveal as="section" index={9} className="mt-7 px-5">
        <SectionHeader title="Smart picks for you" />
        <ul className="space-y-2">
          {aiRecommendations.map((r) => (
            <li key={r.title}>
              <Link
                to={r.to as "/hub"}
                className="tap flex items-center gap-3 p-3 rounded-2xl border border-border bg-card"
              >
                <div
                  className="h-9 w-9 grid place-items-center rounded-xl"
                  style={{ background: "color-mix(in oklab, var(--plugu-purple) 20%, transparent)", color: "var(--plugu-gold)" }}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{r.reason}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </>
  );
}