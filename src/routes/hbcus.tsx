import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Search, Newspaper, Trophy, School as SchoolIcon, Calendar, Store,
  MapPin, ChevronRight, RefreshCw, ExternalLink, Radio,
} from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import { CampusThumb } from "@/components/CampusThumb";
import { getLiveNews, getHbcuSports, type LiveGame } from "@/lib/live-feeds.functions";
import { useCampusEvents } from "@/hooks/use-campus";
import { schoolProfiles, schoolSlug, type SchoolProfile } from "@/lib/hbcus-data";

export const Route = createFileRoute("/hbcus")({
  head: () => ({
    meta: [
      { title: "HBCUs — PlugU" },
      { name: "description", content: "HBCU schools, live headlines, live scores and campus events inside PlugU." },
      { property: "og:title", content: "HBCUs on PlugU" },
      { property: "og:description", content: "School directory, live HBCU headlines, live scores and real campus events." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HbcusPage,
});

const TABS = ["Schools", "News", "Sports", "Events"] as const;
type Tab = (typeof TABS)[number];

function HbcusPage() {
  const [tab, setTab] = useState<Tab>("Schools");

  return (
    <AppShell title="HBCUs">
      <section className="px-5 pt-5">
        <div className="rounded-3xl border border-border bg-[image:var(--gradient-surface)] p-5">
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--plugu-gold)" }}>
            Inside PlugU
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">HBCU schools & culture</h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            School facts, live headlines from real publishers, live scores from ESPN, and events students
            actually posted. PlugU is not affiliated with or endorsed by any school.
          </p>
        </div>
      </section>

      <nav className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tap shrink-0 rounded-full border px-4 min-h-[44px] text-xs font-semibold ${
              tab === t ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="px-5 pt-4 pb-10">
        {tab === "Schools" && <SchoolsPanel />}
        {tab === "News" && <NewsPanel />}
        {tab === "Sports" && <SportsPanel />}
        {tab === "Events" && <EventsPanel />}
      </div>
    </AppShell>
  );
}

/* --------------------------------- Schools --------------------------------- */

function SchoolsPanel() {
  const [q, setQ] = useState("");
  const items = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return schoolProfiles;
    return schoolProfiles.filter(
      (s) => s.name.toLowerCase().includes(t) || s.city.toLowerCase().includes(t) || s.state.toLowerCase().includes(t),
    );
  }, [q]);

  return (
    <div className="space-y-4">
      <SectionHeader title="School directory" />
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by school, city or state"
          className="min-h-[24px] flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
          No school matches "{q}".
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={s.name}>
              <SchoolRow school={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SchoolRow({ school }: { school: SchoolProfile }) {
  return (
    <Link
      to="/hbcus/school/$slug"
      params={{ slug: schoolSlug(school.name) }}
      className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
        <CampusThumb school={school.name} city={school.city} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{school.name}</p>
        <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" /> {school.city} · Founded {school.founded}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {school.mascot} · {school.conference} · {school.enrollment} students
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

/* ---------------------------------- News ----------------------------------- */

const NEWS_TOPICS = [
  "HBCUs",
  "Black Culture",
  "Music & Style",
  "Black Voices",
  "Black Entertainment",
  "Black Sports",
  "Black Business",
] as const;

function NewsPanel() {
  const fn = useServerFn(getLiveNews);
  const [topic, setTopic] = useState<(typeof NEWS_TOPICS)[number]>("HBCUs");
  const { data, isPending, isFetching, refetch, isError } = useQuery({
    queryKey: ["hbcus-live-news", topic],
    queryFn: () => fn({ data: { topic, count: 20 } }),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
  const items = data?.items ?? [];

  return (
    <div className="space-y-3">
      <SectionHeader title="Live headlines" />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {NEWS_TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            aria-pressed={topic === t}
            className={`tap min-h-[44px] shrink-0 rounded-full border px-3.5 text-[12px] font-semibold ${
              topic === t
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Radio className="h-3 w-3" style={{ color: "var(--plugu-gold)" }} /> Live wire
        </p>
        <button onClick={() => refetch()} disabled={isFetching} className="tap inline-flex min-h-[44px] items-center gap-1 text-[11px] text-accent">
          <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>


      {isPending && (
        <ul className="space-y-2" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-16 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </ul>
      )}

      {!isPending && items.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-sm font-semibold">{isError ? "Headlines didn't load" : "No stories on this wire right now"}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">We only show articles we can fetch from the publisher.</p>
          <button onClick={() => refetch()} className="tap mt-2 min-h-[44px] text-xs font-semibold text-primary">
            Try again
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {items.map((n) => (
          <li key={n.id}>
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="tap block rounded-2xl border border-border bg-card p-3"
            >
              <p className="text-sm font-semibold leading-snug">{n.headline}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                {n.source}
                {n.publishedAt && ` · ${new Date(n.publishedAt).toLocaleString()}`}
                <ExternalLink className="h-3 w-3" />
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------- Sports ---------------------------------- */

function GameRow({ g }: { g: LiveGame }) {
  return (
    <li className="rounded-2xl border border-border bg-card p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {g.sport} · {g.status}
      </p>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="truncate">{g.away.name}</span>
        <span className="font-bold">{g.state === "pre" ? "" : g.away.score}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="truncate">{g.home.name}</span>
        <span className="font-bold">{g.state === "pre" ? "" : g.home.score}</span>
      </div>
      {g.state === "pre" && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          {new Date(g.startsAt).toLocaleString()}
          {g.broadcast ? ` · ${g.broadcast}` : ""}
        </p>
      )}
    </li>
  );
}

function SportsPanel() {
  const fn = useServerFn(getHbcuSports);
  const { data, isPending, isFetching, refetch } = useQuery({
    queryKey: ["hbcus-live-sports"],
    queryFn: () => fn(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const games = [...(data?.live ?? []), ...(data?.upcoming ?? []), ...(data?.final ?? [])];

  return (
    <div className="space-y-3">
      <SectionHeader title="Scores" />
      {isPending && (
        <ul className="space-y-2" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </ul>
      )}
      {!isPending && games.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-sm font-semibold">
            {data?.error ? "Scores didn't load" : "No games scheduled right now"}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Scores come straight from the ESPN scoreboard.</p>
          <button onClick={() => refetch()} disabled={isFetching} className="tap mt-2 min-h-[44px] text-xs font-semibold text-primary">
            Try again
          </button>
        </div>
      )}
      <ul className="space-y-2">
        {games.map((g) => (
          <GameRow key={g.id} g={g} />
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------- Events ---------------------------------- */

function EventsPanel() {
  const { data, isPending } = useCampusEvents();
  const now = Date.now();
  const upcoming = (data ?? [])
    .filter((e) => e.status !== "cancelled" && +new Date(e.starts_at) >= now - 3 * 60 * 60 * 1000)
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));

  return (
    <div className="space-y-3">
      <SectionHeader title="Campus events" />
      {isPending && <div className="h-20 animate-pulse rounded-2xl border border-border bg-card" aria-hidden="true" />}
      {!isPending && upcoming.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center">
          <p className="text-sm font-semibold">Nothing posted here yet</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Be the first — post an event for your campus.</p>
          <Link to="/events" className="tap mt-2 inline-block min-h-[44px] text-xs font-semibold text-primary">
            Open events
          </Link>
        </div>
      )}
      <ul className="space-y-2">
        {upcoming.map((e) => (
          <li key={e.id}>
            <Link to="/events" className="tap block rounded-2xl border border-border bg-card p-3">
              <p className="text-[11px] text-muted-foreground">{new Date(e.starts_at).toLocaleString()}</p>
              <p className="mt-0.5 font-semibold leading-snug">{e.title}</p>
              <p className="truncate text-[11px] text-muted-foreground">{e.location}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to="/market"
        className="tap flex items-center justify-between rounded-2xl border border-border bg-card p-4"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Store className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} /> Campus marketplace
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
