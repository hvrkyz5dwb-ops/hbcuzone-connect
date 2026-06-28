import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search, Bell, Crown, Star, ChevronRight, Plug, Map as MapIcon,
  Calendar, GraduationCap, Briefcase, Tag, Building2, MessageSquare,
  Sparkles, Flame, ArrowRight,
} from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import statue from "@/assets/plugu-statue.jpg.asset.json";
import campusMap from "@/assets/campus-map.jpg";
import { PluguDaily } from "@/components/PluguDaily";
import {
  announcements, categories, events, featuredKingpins,
  nearbyServices, messagesList, scholarships, hbcuDiscounts,
} from "@/lib/mock-data";

const internships = [
  { role: "SWE Intern — Summer '26", company: "Google BOLD", tag: "Internship", pay: "$10.5K/mo" },
  { role: "Brand Ambassador", company: "Nike", tag: "Job · On-campus", pay: "$22/hr" },
  { role: "Product Design Co-op", company: "Capital One", tag: "Co-op", pay: "Paid" },
];

const campusPulse = [
  { tag: "Trending", text: "Homecoming tickets dropped — 60% claimed in 1 hr" },
  { tag: "Hot", text: "Fade God fully booked through Saturday" },
  { tag: "New", text: "PlugU x HBCU Founders Grant now accepting apps" },
];

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

        {/* Become a Plug CTA */}
        <Link
          to="/upgrade"
          className="mt-4 group relative flex items-center gap-3 overflow-hidden rounded-3xl border border-primary/40 p-4"
          style={{ background: "image-set(var(--gradient-bronze))" as any }}
        >
          <div
            className="absolute inset-0 -z-10"
            style={{ background: "var(--gradient-bronze)" }}
          />
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

      {/* Campus Pulse */}
      <section className="mt-7">
        <SectionHeader title="Campus Pulse" action="See all" />
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {campusPulse.map((p) => (
            <div key={p.text} className="min-w-[240px] rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase" style={{ color: "var(--plugu-gold)" }}>
                <Flame className="h-3 w-3" /> {p.tag}
              </div>
              <p className="mt-1.5 text-sm font-medium leading-snug">{p.text}</p>
            </div>
          ))}
          {announcements.map((a) => (
            <div key={a.title} className="min-w-[240px] rounded-2xl border border-border bg-card p-4">
              <p className="text-[10px] tracking-widest uppercase text-primary">{a.tag} · {a.time}</p>
              <p className="mt-1.5 text-sm font-medium leading-snug">{a.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Vendors */}
      <section className="mt-7">
        <SectionHeader title="Trending Vendors" action="See all" />
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredKingpins.map((k) => (
            <div key={k.handle} className="min-w-[160px] rounded-2xl border border-border bg-card p-4 text-center">
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

      {/* Upcoming Events */}
      <section className="mt-7">
        <SectionHeader title="Upcoming Events" action="See all" />
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {events.map((e) => (
            <div key={e.title} className="min-w-[220px] rounded-2xl border border-border bg-[image:var(--gradient-surface)] p-4">
              <div className="flex items-center gap-1.5 text-xs text-primary">
                <Calendar className="h-3 w-3" /> {e.when}
              </div>
              <h3 className="mt-1 font-semibold text-base">{e.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{e.where}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scholarships & Grants */}
      <section className="mt-7">
        <SectionHeader title="Scholarships & Grants" action="See all" />
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

      {/* Internships & Jobs */}
      <section className="mt-7">
        <SectionHeader title="Internships & Jobs" action="See all" />
        <ul className="px-5 space-y-2">
          {internships.map((j) => (
            <li key={j.role} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
              <div className="h-10 w-10 grid place-items-center rounded-xl border border-border bg-secondary">
                <Briefcase className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{j.role}</p>
                <p className="text-[11px] text-muted-foreground truncate">{j.company} · {j.tag}</p>
              </div>
              <span className="text-[11px] font-semibold text-primary shrink-0">{j.pay}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Student Deals */}
      <section className="mt-7">
        <SectionHeader title="Student Deals" action="See all" />
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
        <Link to="/upgrade" className="relative block overflow-hidden rounded-3xl border border-border bg-card p-5">
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
        <SectionHeader title="Live Campus Map" action="Open" />
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
        <SectionHeader title="Recent Messages" action="Inbox" />
        <ul className="px-5 space-y-2">
          {messagesList.slice(0, 3).map((m) => (
            <li key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
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
            </li>
          ))}
        </ul>
      </section>

      {/* Recommended Services */}
      <section className="mt-7 mb-4">
        <SectionHeader title="Recommended for you" action="See all" />
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
    </AppShell>
  );
}
