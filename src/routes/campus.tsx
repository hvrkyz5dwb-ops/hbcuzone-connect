import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Plus, Calendar, MapPin, Users, Flame, Sparkles, Trophy, Building2,
  Radio, CheckCircle2, SlidersHorizontal, Scissors, Utensils, Car, Shirt,
  GraduationCap, ArrowRight, ShieldCheck, BriefcaseBusiness,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageLoader } from "@/components/QueryStates";
import { EventDetailSheet } from "@/components/campus/EventDetailSheet";
import { CreateEventSheet } from "@/components/campus/CreateEventSheet";
import { useCampusEvents, useMyRsvps, useOrgFollows, useOrgs, useRsvpToggle } from "@/hooks/use-campus";
import { useProfile } from "@/hooks/use-profile";
import { bucketOf, categoryMeta, EVENT_CATEGORIES, type CampusEvent } from "@/lib/campus-db";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { requestAuthentication } from "@/components/RequireAuthPrompt";
import { CampusBar } from "@/components/campus/CampusBar";
import { useMarketplace } from "@/hooks/use-listings";
import { useCampusSchoolId } from "@/hooks/use-campus-scope";
import { formatPrice, type PriceType } from "@/lib/categories";

export const Route = createFileRoute("/campus")({
  validateSearch: (s: Record<string, unknown>): { event?: string } => ({
    ...(typeof s.event === "string" ? { event: s.event } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Campus Hub — PlugU" },
      { name: "description", content: "The heartbeat of campus: live events, campus pulse, an event map, student organizations and campus leaderboards." },
      { property: "og:title", content: "Campus Hub — PlugU" },
      { property: "og:description", content: "See what's happening on your campus right now — events, orgs and the live campus pulse." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampusHub,
});

const SECTIONS = [
  { key: "events", label: "Events", icon: Calendar },
  { key: "pulse", label: "Pulse", icon: Radio },
  { key: "map", label: "Map", icon: MapPin },
  { key: "orgs", label: "Orgs", icon: Building2 },
  { key: "ranks", label: "Ranks", icon: Trophy },
] as const;
type SectionKey = (typeof SECTIONS)[number]["key"];

const LAST_SECTION_KEY = "plugu.campus.lastSection";

function readLastSection(): SectionKey {
  if (typeof window === "undefined") return "events";
  const v = window.localStorage.getItem(LAST_SECTION_KEY);
  return (SECTIONS.some((s) => s.key === v) ? v : "events") as SectionKey;
}

function CampusHub() {
  const { event: deepLinkId } = Route.useSearch();
  const navigate = useNavigate();
  const [section, setSection] = useState<SectionKey>("events");
  const [q, setQ] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(deepLinkId ?? null);
  const { session } = useSession();
  const { schoolId, schoolIds, campusName } = useCampusSchoolId();
  const marketplace = useMarketplace({
    school_id: schoolId ?? undefined,
    school_ids: schoolIds.length ? schoolIds : undefined,
    campus_scope: "mine",
    sort: "newest",
    limit: 8,
  });

  // Remember the last section the student visited.
  useEffect(() => { setSection(readLastSection()); }, []);
  useEffect(() => {
    try { window.localStorage.setItem(LAST_SECTION_KEY, section); } catch { /* private mode */ }
  }, [section]);

  const { data: events = [], isLoading } = useCampusEvents();
  const { data: myRsvps = [] } = useMyRsvps();
  const goingSet = useMemo(() => new Set(myRsvps), [myRsvps]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return events;
    return events.filter((e) =>
      [e.title, e.location, e.description ?? "", e.host_name ?? "", categoryMeta(e.category).label]
        .join(" ").toLowerCase().includes(needle));
  }, [events, q]);

  const open = events.find((e) => e.id === openId) ?? null;
  useEffect(() => {
    if (deepLinkId) setOpenId(deepLinkId);
  }, [deepLinkId]);

  function closeDetail() {
    setOpenId(null);
    if (deepLinkId) navigate({ to: "/campus", search: { event: undefined }, replace: true });
  }

  // Swipe between sections.
  const touch = useRef<{ x: number; y: number } | null>(null);
  const idx = SECTIONS.findIndex((s) => s.key === section);
  function onTouchStart(e: React.TouchEvent) {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    const st = touch.current;
    touch.current = null;
    if (!st) return;
    const dx = e.changedTouches[0].clientX - st.x;
    const dy = e.changedTouches[0].clientY - st.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const next = dx < 0 ? idx + 1 : idx - 1;
    if (next >= 0 && next < SECTIONS.length) setSection(SECTIONS[next].key);
  }

  return (
    <AppShell title="PLUGU">
      <section className="px-5 pt-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">PlugU campus discovery</p>
        <h1 className="mt-1 text-[26px] font-black leading-tight">Your people. Your next plug.</h1>
      </section>
      <CampusBar subtitle="Your campus + nearby" />
      <section className="px-5 pt-3">
        <div className="flex items-center gap-2">
          <Link to="/search" search={{ tab: "browse" }} className="tap flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl bg-foreground px-4 text-left text-sm text-background">
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate opacity-70">Find a service, item, or event</span>
          </Link>
          <Link to="/market" aria-label="Open marketplace filters" className="tap grid h-12 w-12 place-items-center rounded-xl border border-border bg-card">
            <SlidersHorizontal className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-6 gap-2">
          {[
            { label: "Haircuts", icon: Scissors, category: "hair" },
            { label: "Nails", icon: Sparkles, category: "nails" },
            { label: "Food", icon: Utensils, category: "food" },
            { label: "Rides", icon: Car, category: "rides" },
            { label: "Clothes", icon: Shirt, category: "clothing" },
            { label: "Tutoring", icon: GraduationCap, category: "tutoring" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.category} to="/market" search={{ category: item.category } as never} className="tap min-w-0 text-center">
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-primary/40 bg-card text-primary"><Icon className="h-4 w-4" /></span>
                <span className="mt-1 block truncate text-[9px] text-muted-foreground">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between px-5">
          <h2 className="text-base font-bold">Around you tonight</h2>
          <Link to="/events" className="tap inline-flex min-h-11 items-center gap-1 text-[11px] font-semibold text-primary">See all <ArrowRight className="h-3 w-3" /></Link>
        </div>
        {events.filter((e) => bucketOf(e) === "today" || bucketOf(e) === "now").length ? (
          <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {events.filter((e) => bucketOf(e) === "today" || bucketOf(e) === "now").slice(0, 4).map((ev) => (
              <button key={ev.id} onClick={() => setOpenId(ev.id)} className="tap relative h-36 w-[82%] shrink-0 overflow-hidden rounded-xl border border-border bg-card text-left">
                {ev.cover_url && <img src={ev.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                <span className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-3">
                  <span className="block text-sm font-bold">{ev.title}</span>
                  <span className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><Calendar className="h-3 w-3" />{new Date(ev.starts_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {ev.location || "Location TBA"}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mx-5 rounded-xl border border-dashed border-border bg-card/50 p-4 text-center text-xs text-muted-foreground">Nothing confirmed around {campusName} tonight.</div>
        )}
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between px-5">
          <h2 className="text-base font-bold">Trusted student plugs</h2>
          <Link to="/market" className="tap inline-flex min-h-11 items-center gap-1 text-[11px] font-semibold text-primary">See all <ArrowRight className="h-3 w-3" /></Link>
        </div>
        {marketplace.isLoading ? (
          <div className="flex gap-3 overflow-hidden px-5"><div className="h-48 w-36 shrink-0 animate-pulse rounded-xl bg-card" /><div className="h-48 w-36 shrink-0 animate-pulse rounded-xl bg-card" /></div>
        ) : marketplace.data?.length ? (
          <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {marketplace.data.slice(0, 8).map((listing) => (
              <Link key={listing.id} to="/checkout/$listingId" params={{ listingId: listing.id }} className="tap w-36 shrink-0 overflow-hidden rounded-xl border border-border bg-card">
                {listing.images[0]?.url && <img src={listing.images[0].url} alt={listing.title} className="aspect-square w-full object-cover" />}
                <span className="block p-2.5">
                  <span className="block truncate text-xs font-bold">{listing.title}</span>
                  <span className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-muted-foreground">{listing.seller?.display_name ?? listing.seller?.username ?? "Student seller"}{listing.seller?.verification_status === "verified" && <CheckCircle2 className="h-3 w-3 shrink-0 text-primary" />}</span>
                  <span className="mt-1 block text-xs font-bold text-primary">{formatPrice(listing.price_cents, listing.price_type as PriceType)}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mx-5 rounded-xl border border-dashed border-border bg-card/50 p-4 text-center text-xs text-muted-foreground">No complete listings at {campusName} yet. <Link to="/market" className="font-semibold text-primary">Open Market</Link></div>
        )}
      </section>

      <section className="mx-5 mt-5 grid grid-cols-3 gap-2">
        <Link to="/hub" className="tap rounded-xl border border-primary/25 bg-primary/10 p-3"><GraduationCap className="h-4 w-4 text-primary" /><span className="mt-2 block text-xs font-bold">Scholarships</span><span className="text-[9px] text-muted-foreground">Verified posts</span></Link>
        <Link to="/hub" className="tap rounded-xl border border-border bg-card p-3"><BriefcaseBusiness className="h-4 w-4 text-primary" /><span className="mt-2 block text-xs font-bold">Opportunities</span><span className="text-[9px] text-muted-foreground">Jobs and internships</span></Link>
        <Link to="/trust" className="tap rounded-xl border border-border bg-card p-3"><ShieldCheck className="h-4 w-4 text-primary" /><span className="mt-2 block text-xs font-bold">Protected</span><span className="text-[9px] text-muted-foreground">Safer transactions</span></Link>
      </section>

      <section className="px-5 pt-7">
        <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: "var(--plugu-gold)" }}>
          The heartbeat of campus
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight">Events and organizations</h2>
          <button
            onClick={() => session ? setCreateOpen(true) : requestAuthentication()}
            className="tap inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-bronze)", boxShadow: "var(--shadow-glow)" }}
          >
            <Plus className="h-3.5 w-3.5" /> Create
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-secondary px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <label className="sr-only" htmlFor="campus-search">Search campus events and organizations</label>
          <input
            id="campus-search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search events, orgs, locations…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        <nav tabIndex={0} className="mt-3 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Campus Hub sections">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = s.key === section;
            return (
              <button
                key={s.key} onClick={() => setSection(s.key)} aria-current={active ? "true" : undefined}
                className={`tap shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs border transition-all duration-300 ${
                  active
                    ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {s.label}
              </button>
            );
          })}
        </nav>
      </section>

      <div key={section} className="view-enter" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {isLoading ? (
          <PageLoader message="Loading campus hub…" />
        ) : section === "events" ? (
          <EventsSection events={filtered} goingSet={goingSet} onOpen={setOpenId} onCreate={() => session ? setCreateOpen(true) : requestAuthentication()} />
        ) : section === "pulse" ? (
          <PulseSection events={filtered} onOpen={setOpenId} />
        ) : section === "map" ? (
          <MapSection events={filtered} onOpen={setOpenId} />
        ) : section === "orgs" ? (
          <OrgsSection query={q} />
        ) : (
          <RanksSection events={events} />
        )}
      </div>

      {open && <EventDetailSheet event={open} going={goingSet.has(open.id)} onClose={closeDetail} />}
      {createOpen && <CreateEventSheet onClose={() => setCreateOpen(false)} />}
    </AppShell>
  );
}

/* ---------------- Events ---------------- */

function EventCard({
  ev, going, onOpen,
}: { ev: CampusEvent; going: boolean; onOpen: (id: string) => void }) {
  const cat = categoryMeta(ev.category);
  const rsvp = useRsvpToggle();
  const { session } = useSession();
  const live = bucketOf(ev) === "now";
  return (
    <li className="rounded-2xl border border-border bg-card overflow-hidden slide-up">
      <button onClick={() => onOpen(ev.id)} className="w-full text-left">
        {ev.cover_url && (
          <img src={ev.cover_url} alt="" loading="lazy" decoding="async" className="h-32 w-full object-cover" />
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded-full border" style={{ color: cat.color, borderColor: cat.color }}>
              {cat.label}
            </span>
            {live && <span className="text-destructive font-semibold tracking-widest uppercase plugu-pulse">Live now</span>}
            {ev.is_featured && <span className="text-accent uppercase tracking-widest">Featured</span>}
          </div>
          <h3 className="mt-1.5 font-semibold text-base leading-snug">{ev.title}</h3>
          <p className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {new Date(ev.starts_at).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3 w-3" /> {ev.location || "TBA"}{ev.host_name ? ` · ${ev.host_name}` : ""}
          </p>
          {ev.description && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{ev.description}</p>
          )}
        </div>
      </button>
      <div className="flex items-center justify-between px-4 pb-4">
        <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
          <Users className="h-3 w-3" /> {ev.rsvp_count} going
        </span>
        <button
          onClick={() => session ? rsvp.mutate({ eventId: ev.id, going: !going }, { onError: (e) => toast.error((e as Error).message) }) : requestAuthentication()}
          disabled={rsvp.isPending}
          aria-pressed={going}
          className={`tap text-[11px] font-semibold rounded-full px-4 py-2 border transition-colors ${
            going ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border"
          }`}
        >
          {going ? "Going" : "RSVP"}
        </button>
      </div>
    </li>
  );
}

function Row({
  title, icon: Icon, events, goingSet, onOpen,
}: { title: string; icon: typeof Calendar; events: CampusEvent[]; goingSet: Set<string>; onOpen: (id: string) => void }) {
  if (events.length === 0) return null;
  return (
    <>
      <h2 className="px-5 mt-5 mb-2 text-sm font-semibold flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h2>
      <ul className="px-5 space-y-3">
        {events.map((e) => <EventCard key={e.id} ev={e} going={goingSet.has(e.id)} onOpen={onOpen} />)}
      </ul>
    </>
  );
}

function EventsSection({
  events, goingSet, onOpen, onCreate,
}: { events: CampusEvent[]; goingSet: Set<string>; onOpen: (id: string) => void; onCreate: () => void }) {
  const [cat, setCat] = useState<string>("all");
  const list = cat === "all" ? events : events.filter((e) => e.category === cat);

  const now = list.filter((e) => bucketOf(e) === "now");
  const today = list.filter((e) => bucketOf(e) === "today");
  const tomorrow = list.filter((e) => bucketOf(e) === "tomorrow");
  const week = list.filter((e) => bucketOf(e) === "week");
  const later = list.filter((e) => bucketOf(e) === "later");
  const trending = [...list].sort((a, b) => b.rsvp_count - a.rsvp_count).slice(0, 3).filter((e) => e.rsvp_count > 0);
  const fresh = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 3);

  // Smart recommendations: categories you've RSVP'd to before, then campus buzz.
  const likedCats = new Set(events.filter((e) => goingSet.has(e.id)).map((e) => e.category));
  const recommended = list
    .filter((e) => !goingSet.has(e.id) && likedCats.has(e.category))
    .slice(0, 3);
  const peers = [...list].filter((e) => !goingSet.has(e.id)).sort((a, b) => b.rsvp_count - a.rsvp_count).slice(0, 3);

  return (
    <section className="pb-8">
      <div tabIndex={0} className="mt-1 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setCat("all")}
          className={`tap shrink-0 px-3 py-1.5 rounded-full text-[11px] border ${cat === "all" ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"}`}
        >
          All
        </button>
        {EVENT_CATEGORIES.map((c) => (
          <button
            key={c.key} onClick={() => setCat(c.key)}
            className={`tap shrink-0 px-3 py-1.5 rounded-full text-[11px] border ${cat === c.key ? "text-black font-semibold" : "bg-card text-muted-foreground"}`}
            style={cat === c.key ? { background: c.color, borderColor: c.color } : { borderColor: "var(--border)" }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <div className="mx-5 mt-4 rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
          <p className="text-sm font-semibold">Nothing on the calendar yet</p>
          <p className="text-xs text-muted-foreground mt-1">Be the plug — post the first event for your campus.</p>
          <button
            onClick={onCreate}
            className="tap mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-bronze)" }}
          >
            <Plus className="h-3.5 w-3.5" /> Create an event
          </button>
        </div>
      )}

      <Row title="Happening now" icon={Radio} events={now} goingSet={goingSet} onOpen={onOpen} />
      <Row title="Recommended for you" icon={Sparkles} events={recommended} goingSet={goingSet} onOpen={onOpen} />
      <Row title="Trending — most RSVP'd" icon={Flame} events={trending} goingSet={goingSet} onOpen={onOpen} />
      <Row title="Students like you are going" icon={Users} events={peers} goingSet={goingSet} onOpen={onOpen} />
      <Row title="Today" icon={Calendar} events={today} goingSet={goingSet} onOpen={onOpen} />
      <Row title="Tomorrow" icon={Calendar} events={tomorrow} goingSet={goingSet} onOpen={onOpen} />
      <Row title="This week" icon={Calendar} events={week} goingSet={goingSet} onOpen={onOpen} />
      <Row title="Newly added" icon={Sparkles} events={fresh} goingSet={goingSet} onOpen={onOpen} />
      <Row title="Later" icon={Calendar} events={later} goingSet={goingSet} onOpen={onOpen} />
    </section>
  );
}

/* ---------------- Pulse ---------------- */

const PULSE_GROUPS: { label: string; cats: string[] }[] = [
  { label: "Free food", cats: ["free_food"] },
  { label: "Parties", cats: ["party"] },
  { label: "Greek life", cats: ["greek"] },
  { label: "Career fairs", cats: ["career"] },
  { label: "Sports", cats: ["sports"] },
  { label: "Study groups", cats: ["study"] },
  { label: "Volunteering", cats: ["volunteer", "service"] },
  { label: "Live performances", cats: ["performance"] },
  { label: "Networking", cats: ["networking", "business"] },
];

function PulseSection({ events, onOpen }: { events: CampusEvent[]; onOpen: (id: string) => void }) {
  const [tick, setTick] = useState(0);
  // Auto-refresh the live windows throughout the day.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  const liveNow = useMemo(() => events.filter((e) => bucketOf(e) === "now"), [events, tick]);

  return (
    <section className="px-5 pb-8">
      <div className="mt-3 rounded-2xl border border-border bg-card p-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Live right now</p>
        <p className="mt-1 text-3xl font-bold" style={{ color: "var(--plugu-gold)" }}>{liveNow.length}</p>
        <p className="text-xs text-muted-foreground">
          {liveNow.length ? "Things popping off across campus." : "Quiet on the yard — check back soon."}
        </p>
        {liveNow.length > 0 && (
          <ul className="mt-3 space-y-2">
            {liveNow.map((e) => (
              <li key={e.id}>
                <button onClick={() => onOpen(e.id)} className="tap w-full text-left rounded-xl border border-border bg-background/60 px-3 py-2">
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-[11px] text-muted-foreground">{e.location} · {e.rsvp_count} going</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {PULSE_GROUPS.map((g) => {
          const items = events.filter((e) => g.cats.includes(e.category));
          const color = categoryMeta(g.cats[0]).color;
          return (
            <div key={g.label} className="rounded-2xl border border-border bg-card p-3">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
              <p className="mt-1.5 text-xs font-semibold">{g.label}</p>
              <p className="text-[11px] text-muted-foreground">{items.length} upcoming</p>
              {items[0] && (
                <button onClick={() => onOpen(items[0].id)} className="tap mt-1 text-[11px] text-primary text-left line-clamp-1">
                  {items[0].title}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Map ---------------- */

function MapSection({ events, onOpen }: { events: CampusEvent[]; onOpen: (id: string) => void }) {
  // Deterministic layout: real coordinates when a host supplies them,
  // otherwise a stable pseudo-position so pins never jump between renders.
  const pins = events.slice(0, 40).map((e, i) => {
    const hash = [...e.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const x = e.lng != null ? ((e.lng + 180) % 1) * 100 : 8 + ((hash * 37 + i * 13) % 84);
    const y = e.lat != null ? ((e.lat + 90) % 1) * 100 : 10 + ((hash * 17 + i * 29) % 78);
    return { ev: e, x, y };
  });

  return (
    <section className="px-5 pb-8">
      <div
        className="mt-3 relative rounded-3xl border border-border overflow-hidden"
        style={{
          height: 340,
          background:
            "radial-gradient(120% 90% at 50% 0%, rgba(244,201,106,0.10), transparent 60%), linear-gradient(160deg,#141414,#0a0a0a)",
        }}
        role="img"
        aria-label={`Campus event map with ${pins.length} events`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        {pins.map(({ ev, x, y }) => {
          const color = categoryMeta(ev.category).color;
          return (
            <button
              key={ev.id}
              onClick={() => onOpen(ev.id)}
              aria-label={`${ev.title} — ${categoryMeta(ev.category).label}`}
              className="tap absolute -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full"
              style={{
                left: `${x}%`, top: `${y}%`, background: color,
                boxShadow: `0 0 0 3px ${color}33, 0 0 14px ${color}`,
              }}
            />
          );
        })}
        {pins.length === 0 && (
          <p className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
            No pinned events yet.
          </p>
        )}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {EVENT_CATEGORIES.slice(0, 6).map((c) => (
          <li key={c.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: c.color }} /> {c.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Orgs ---------------- */

function OrgsSection({ query }: { query: string }) {
  const { session } = useSession();
  const { data: orgs = [], isLoading } = useOrgs();
  const follows = useOrgFollows();
  const followSet = new Set(follows.data ?? []);
  const needle = query.trim().toLowerCase();
  const list = needle
    ? orgs.filter((o) => `${o.name} ${o.bio ?? ""} ${o.category}`.toLowerCase().includes(needle))
    : orgs;

  if (isLoading) {
    return <PageLoader message="Loading organizations…" />;
  }

  if (list.length === 0) {
    return (
      <div className="mx-5 mt-4 rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
        <p className="text-sm font-semibold">No organizations yet</p>
        <p className="text-xs text-muted-foreground mt-1">Verified orgs show up here with their calendar and announcements.</p>
      </div>
    );
  }

  return (
    <ul className="px-5 pb-8 mt-3 space-y-3">
      {list.map((o) => {
        const following = followSet.has(o.id);
        return (
          <li key={o.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3 slide-up">
            <div className="h-12 w-12 rounded-2xl overflow-hidden bg-secondary grid place-items-center shrink-0">
              {o.avatar_url
                ? <img src={o.avatar_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                : <Building2 className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate flex items-center gap-1">
                {o.name}
                {o.is_verified && <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-label="Verified organization" />}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{o.bio ?? o.category} · {o.follower_count} followers</p>
              {o.contact_email && <p className="text-[10px] text-muted-foreground truncate">{o.contact_email}</p>}
            </div>
            <button
              onClick={() => session ? follows.toggle.mutate({ orgId: o.id, following: !following }, { onError: (e) => toast.error((e as Error).message) }) : requestAuthentication()}
              aria-pressed={following}
              className={`tap text-[11px] font-semibold rounded-full px-3 py-2 border ${
                following ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border"
              }`}
            >
              {following ? "Following" : "Follow"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- Ranks ---------------- */

function RanksSection({ events }: { events: CampusEvent[] }) {
  const { data: orgs = [] } = useOrgs();
  const { profile } = useProfile();

  const hosts = useMemo(() => {
    const map = new Map<string, { name: string; events: number; rsvps: number }>();
    for (const e of events) {
      const key = e.host_name?.trim() || "Campus host";
      const cur = map.get(key) ?? { name: key, events: 0, rsvps: 0 };
      cur.events += 1;
      cur.rsvps += e.rsvp_count;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => b.rsvps - a.rsvps || b.events - a.events).slice(0, 5);
  }, [events]);

  const topOrgs = [...orgs].sort((a, b) => b.follower_count - a.follower_count).slice(0, 5);
  const totalRsvps = events.reduce((n, e) => n + e.rsvp_count, 0);

  const badges = [
    { name: "Event Starter", desc: "Post your first campus event", earned: hosts.length > 0 },
    { name: "Campus Connector", desc: "Draw 25+ RSVPs across your events", earned: totalRsvps >= 25 },
    { name: "Community Builder", desc: "Host 5+ events this semester", earned: hosts[0]?.events >= 5 },
  ];

  return (
    <section className="px-5 pb-8 mt-3 space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Most active campus</p>
        <p className="mt-1 text-lg font-bold">{profile?.school_name ?? "Your campus"}</p>
        <p className="text-xs text-muted-foreground">{events.length} events · {totalRsvps} RSVPs</p>
        <Link
          to="/rankings"
          className="tap mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-bronze)" }}
        >
          <Trophy className="h-3.5 w-3.5" /> Seller leaderboard
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold flex items-center gap-1.5"><Trophy className="h-4 w-4 text-primary" /> Top event hosts</h2>
        <ol className="mt-2 space-y-2">
          {hosts.length === 0 && <li className="text-xs text-muted-foreground">No hosts yet this semester.</li>}
          {hosts.map((h, i) => (
            <li key={h.name} className="flex items-center gap-3 text-sm">
              <span className="w-5 text-xs text-muted-foreground">{i + 1}</span>
              <span className="flex-1 truncate">{h.name}</span>
              <span className="text-[11px] text-muted-foreground">{h.rsvps} RSVPs</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold flex items-center gap-1.5"><Building2 className="h-4 w-4 text-primary" /> Most active organizations</h2>
        <ol className="mt-2 space-y-2">
          {topOrgs.length === 0 && <li className="text-xs text-muted-foreground">No organizations registered yet.</li>}
          {topOrgs.map((o, i) => (
            <li key={o.id} className="flex items-center gap-3 text-sm">
              <span className="w-5 text-xs text-muted-foreground">{i + 1}</span>
              <span className="flex-1 truncate">{o.name}</span>
              <span className="text-[11px] text-muted-foreground">{o.follower_count} followers</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Badges</h2>
        <ul className="mt-2 space-y-2">
          {badges.map((b) => (
            <li key={b.name} className={`flex items-center gap-3 rounded-xl border p-3 ${b.earned ? "border-primary/50 bg-primary/5" : "border-border opacity-60"}`}>
              <Sparkles className="h-4 w-4" style={{ color: b.earned ? "var(--plugu-gold)" : undefined }} />
              <div>
                <p className="text-sm font-medium">{b.name}</p>
                <p className="text-[11px] text-muted-foreground">{b.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
