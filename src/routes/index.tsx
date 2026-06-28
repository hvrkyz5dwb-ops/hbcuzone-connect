import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plug, Map as MapIcon, ChevronRight, GraduationCap, Briefcase, Tag,
  Building2, MessageSquare, ArrowRight, Star,
} from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import campusMap from "@/assets/campus-map.jpg";
import { PluguDaily } from "@/components/PluguDaily";
import { PullToRefresh } from "@/components/PullToRefresh";
import { CampusPulse } from "@/components/CampusPulse";
import { SmartSearch } from "@/components/SmartSearch";
import { OpportunityRail } from "@/components/OpportunityRail";
import { toast } from "sonner";
import {
  categories, nearbyServices, messagesList, scholarships, hbcuDiscounts,
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
      <PullToRefresh onRefresh={async () => { await new Promise(r => setTimeout(r, 600)); toast.success("You're all caught up"); }}>
      {/* Campus Pulse — modular dashboard (greeting, summary, quick actions, ticker, trending, events) */}
      <CampusPulse />

      {/* Smart universal search */}
      <section className="px-5">
        <SmartSearch />
      </section>

      {/* Opportunity rail — jobs / internships / scholarships / research / leadership / volunteer */}
      <OpportunityRail />

      {/* Category shortcuts */}
      <section className="mt-7">
        <SectionHeader title="Browse the Market" action="See all" />
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
      </PullToRefresh>
    </AppShell>
  );
}
