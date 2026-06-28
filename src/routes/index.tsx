import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Bell, Crown, Star, ChevronRight } from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import statue from "@/assets/plugu-statue.jpg.asset.json";
import { PluguDaily } from "@/components/PluguDaily";
import {
  announcements,
  categories,
  events,
  featuredKingpins,
  nearbyServices,
} from "@/lib/mock-data";

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
  return (
    <AppShell title="PLUGU">
      {/* Greeting */}
      <section className="px-5 pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              Kingpin <Crown className="h-6 w-6 text-accent" />
            </h1>
          </div>
          <button className="relative h-10 w-10 grid place-items-center rounded-full bg-secondary border border-border">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent" />
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search PlugU"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>

        {/* Brand banner */}
        <div className="mt-5 relative overflow-hidden rounded-3xl border border-border h-28">
          <img src={statue.url} alt="PlugU statue" className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(70% 100% at 0% 50%, color-mix(in oklab, var(--plugu-purple) 30%, transparent), transparent 70%)" }}
          />
          <div className="relative h-full flex flex-col justify-center px-4">
            <p className="text-sm font-bold text-white">Welcome to PlugU</p>
            <p className="text-[11px] text-white/75 mt-0.5 max-w-[200px]">
              The campus plug for everything students need.
            </p>
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-5 grid grid-cols-4 gap-3">
          {categories.slice(0, 4).map((c) => (
            <Link
              key={c.key}
              to="/market"
              className="flex flex-col items-center gap-2"
            >
              <div className="h-14 w-14 grid place-items-center rounded-2xl bg-card border border-border text-2xl">
                {c.emoji}
              </div>
              <span className="text-[11px] text-muted-foreground">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* PlugU Daily — personalized briefing */}
      <PluguDaily />

      {/* Whats happening today */}
      <section className="mt-7">
        <SectionHeader title="What's happening today" action="See all" />
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {events.map((e) => (
            <div
              key={e.title}
              className="min-w-[220px] rounded-2xl border border-border bg-[image:var(--gradient-surface)] p-4"
            >
              <p className="text-xs text-primary">{e.when}</p>
              <h3 className="mt-1 font-semibold text-base">{e.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{e.where}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby services */}
      <section className="mt-7">
        <SectionHeader title="Nearby Services" action="See all" />
        <ul className="px-5 space-y-2">
          {nearbyServices.map((s) => (
            <li
              key={s.name}
              className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
            >
              <div className="h-12 w-12 rounded-xl bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                {s.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {s.type} · {s.distance}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                <span>{s.rating}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Featured KingPins */}
      <section className="mt-7">
        <SectionHeader title="Featured KingPins" action="See all" />
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredKingpins.map((k) => (
            <div
              key={k.handle}
              className="min-w-[160px] rounded-2xl border border-border bg-card p-4 text-center"
            >
              <div className="mx-auto h-14 w-14 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-lg font-bold text-primary-foreground">
                {k.name[0]}
              </div>
              <p className="mt-2 font-semibold flex items-center justify-center gap-1">
                {k.name} <Crown className="h-3.5 w-3.5 text-accent" />
              </p>
              <p className="text-[11px] text-muted-foreground">{k.campus}</p>
              <p className="text-[11px] text-primary mt-1">{k.followers} followers</p>
            </div>
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section className="mt-7 mb-4">
        <SectionHeader title="Campus Announcements" />
        <ul className="px-5 space-y-2">
          {announcements.map((a) => (
            <li
              key={a.title}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border"
            >
              <div className="min-w-0">
                <p className="text-[10px] tracking-widest text-primary uppercase">{a.tag} · {a.time}</p>
                <p className="text-sm font-medium truncate">{a.title}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
