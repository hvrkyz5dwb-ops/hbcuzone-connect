import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Crown, Bell, ArrowRight, Calendar, Users, Sparkles, BadgeCheck, GraduationCap, Plug as PlugIcon, Gem,
  TrendingUp, Megaphone, Store, Map as MapIcon, MessageSquare, Plug, Radio,
} from "lucide-react";
import { SectionHeader } from "@/components/AppShell";
import { usePersona } from "@/hooks/use-persona";
import { mockWeather, greetingFor } from "@/lib/weather-mock";
import { liveActivity, businessSpotlight, aiRecommendations } from "@/lib/opportunities-data";
import { announcements, events, featuredKingpins, listings } from "@/lib/mock-data";

function Countdown({ when }: { when: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border border-primary/40 text-primary">
      <Calendar className="h-3 w-3" /> {when}
    </span>
  );
}

function BadgeIcon({ badge }: { badge: string }) {
  // Bronze → Silver → Gold → Diamond progression as plugs upgrade.
  switch (badge) {
    case "Student":       return <GraduationCap className="h-7 w-7 shrink-0 tier-silver" />;
    case "Plug":          return <PlugIcon className="h-7 w-7 shrink-0 tier-bronze" />;
    case "Verified Plug": return <BadgeCheck className="h-7 w-7 shrink-0 tier-silver" />;
    case "Gold Plug":     return <PlugIcon className="h-7 w-7 shrink-0 tier-gold" />;
    case "Kingpin":
    default:              return <Gem className="h-7 w-7 shrink-0 tier-diamond" />;
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
  const [rsvped, setRsvped] = useState<Record<string, boolean>>({});
  const [tick, setTick] = useState(0);
  const [greeting, setGreeting] = useState("Welcome back");
  useEffect(() => { setGreeting(greetingFor()); }, []);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => (t + 1) % liveActivity.length), 3500);
    return () => clearInterval(i);
  }, []);
  const activity = liveActivity[tick];

  return (
    <>
      {/* Greeting + weather */}
      <section className="px-5 pt-5 slide-up">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{greeting},</p>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2 truncate">
              <span>Hello </span>
              <span className={badgeWordmarkClass(persona.badge)}>{persona.badge}</span>
              <BadgeIcon badge={persona.badge} />
            </h1>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              {persona.campus} · {persona.year} · {persona.major}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-bold flex items-center gap-1 justify-end">
                <span>{mockWeather.emoji}</span> {mockWeather.tempF}°
              </p>
              <p className="text-[10px] text-muted-foreground">{mockWeather.blurb}</p>
            </div>
            <button aria-label="Notifications" className="relative h-10 w-10 grid place-items-center rounded-full bg-secondary border border-border">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent" />
            </button>
          </div>
        </div>
      </section>

      {/* Campus Pulse summary card */}
      <section className="mt-4 px-5">
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
      </section>

      {/* Quick actions */}
      <section className="mt-4 px-5">
        <div className="grid grid-cols-4 gap-2">
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
                className="tap flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card py-3"
              >
                <div className="h-9 w-9 grid place-items-center rounded-xl bg-[image:var(--gradient-bronze)] text-primary-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[11px]">{a.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Live activity ticker */}
      <section className="mt-4 px-5">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-3 py-2.5">
          <Radio className="h-3.5 w-3.5 text-primary plugu-pulse shrink-0" />
          <p key={tick} className="text-xs truncate slide-up">
            <span className="font-semibold">{activity.who}</span>{" "}
            <span className="text-muted-foreground">{activity.what}</span>{" "}
            <span>{activity.detail}</span>{" "}
            <span className="text-muted-foreground">· {activity.when}</span>
          </p>
        </div>
      </section>

      {/* Trending businesses */}
      <section className="mt-7">
        <SectionHeader title="Trending businesses" action="See all" />
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredKingpins.map((k) => (
            <Link
              key={k.handle}
              to="/business"
              className="tap min-w-[160px] rounded-2xl border border-border bg-card p-4 text-center"
            >
              <div className="mx-auto h-14 w-14 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-lg font-bold text-primary-foreground">
                {k.name[0]}
              </div>
              <p className="mt-2 font-semibold flex items-center justify-center gap-1">
                {k.name} <Crown className="h-3.5 w-3.5 text-accent" />
              </p>
              <p className="text-[11px] text-muted-foreground">{k.campus}</p>
              <p className="text-[11px] text-primary mt-1 flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" /> {k.followers}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Marketplace highlights */}
      <section className="mt-7">
        <SectionHeader title="Marketplace highlights" action="Open" />
        <div className="px-5 grid grid-cols-2 gap-3">
          {listings.slice(0, 4).map((l) => (
            <Link
              key={l.id}
              to="/market"
              className="tap rounded-2xl bg-card border border-border overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] bg-secondary">
                <img src={l.image} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-xs font-medium line-clamp-1">{l.title}</p>
                <p className="text-primary font-bold text-sm mt-0.5">{l.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming events */}
      <section className="mt-7">
        <SectionHeader title="Tonight & this week" action="All events" />
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {events.map((e) => {
            const isRsvp = !!rsvped[e.title];
            return (
              <div key={e.title} className="min-w-[240px] rounded-2xl border border-border bg-[image:var(--gradient-surface)] p-4">
                <Countdown when={e.when} />
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
        </div>
      </section>

      {/* Business Spotlight */}
      <section className="mt-7 px-5">
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
      </section>

      {/* Announcements */}
      <section className="mt-7">
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
      </section>

      {/* AI Recommendations */}
      <section className="mt-7 px-5">
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
      </section>
    </>
  );
}