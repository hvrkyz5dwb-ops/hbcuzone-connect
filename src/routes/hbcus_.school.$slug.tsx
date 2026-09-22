import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, MapPin, Calendar, Store, ExternalLink, Map as MapIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CampusSatelliteMap } from "@/components/CampusSatelliteMap";
import { getLiveNews } from "@/lib/live-feeds.functions";
import { useCampusEvents } from "@/hooks/use-campus";
import { findSchoolBySlug, getSchoolDetail, type SchoolProfile } from "@/lib/hbcus-data";

export const Route = createFileRoute("/hbcus_/school/$slug")({
  head: ({ params }) => {
    const s = findSchoolBySlug(params.slug);
    const title = s ? `${s.name} — PlugU` : "School — PlugU";
    const description = s
      ? `${s.name} on PlugU: school facts, notable alumni, Greek life, campus map, live headlines and real student events.`
      : "School profile on PlugU.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell title="School">
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-muted-foreground">School not found.</p>
        <Link to="/hbcus" className="tap mt-2 inline-block text-sm text-accent">
          ← Back to the directory
        </Link>
      </div>
    </AppShell>
  ),
  loader: ({ params }) => {
    const school = findSchoolBySlug(params.slug);
    if (!school) throw notFound();
    return { school };
  },
  component: SchoolCommunity,
});

const TABS = ["About", "Alumni", "Greek Life", "Map", "News", "Events"] as const;
type TabKey = (typeof TABS)[number];

function SchoolCommunity() {
  const { slug } = Route.useParams();
  const school = findSchoolBySlug(slug)!;
  const [tab, setTab] = useState<TabKey>("About");

  return (
    <AppShell title={school.name}>
      <section className="px-5 pt-5">
        <Link to="/hbcus" className="tap inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> School directory
        </Link>
        <div className={`relative mt-3 h-36 overflow-hidden rounded-3xl bg-gradient-to-br ${school.color}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/20" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-2xl font-black leading-tight text-white">{school.name}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-white/80">
              <MapPin className="h-3 w-3" /> {school.city} · Est. {school.founded}
            </p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          PlugU is independent and not affiliated with or endorsed by {school.name}.
        </p>
      </section>

      <div tabIndex={0} className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tap shrink-0 rounded-full border px-4 min-h-[44px] text-xs font-semibold ${
              t === tab ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <section className="mt-4 px-5 pb-10" key={tab}>
        {tab === "About" && <AboutTab school={school} />}
        {tab === "Alumni" && <AlumniTab school={school} />}
        {tab === "Greek Life" && <GreekTab school={school} />}
        {tab === "Map" && <MapTab school={school} />}
        {tab === "News" && <NewsTab school={school} />}
        {tab === "Events" && <EventsTab school={school} />}
      </section>
    </AppShell>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-4">{children}</div>;
}

function AboutTab({ school }: { school: SchoolProfile }) {
  const detail = getSchoolDetail(school.name);
  return (
    <div className="space-y-3">
      {detail?.about && (
        <Card>
          <p className="text-sm leading-relaxed">{detail.about}</p>
          {detail.motto && (
            <p className="mt-2 text-[11px] italic text-muted-foreground">Motto: {detail.motto}</p>
          )}
        </Card>
      )}
      <Card>
        <dl className="grid grid-cols-2 gap-3 text-xs">
          {[
            ["Type", school.type],
            ["Enrollment", school.enrollment],
            ["Founded", String(school.founded)],
            ["Acceptance rate", school.acceptance],
            ["In-state tuition", school.tuition],
            ["Mascot", school.mascot],
            ["Conference", school.conference],
            ["Colors", detail?.colors ?? "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Figures are published by the school and may change — always confirm on the official site.
        </p>
        <a
          href={`https://${school.website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="tap mt-2 inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-primary"
        >
          {school.website} <ExternalLink className="h-3 w-3" />
        </a>
      </Card>
      <Card>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Popular majors</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {school.topMajors.map((m) => (
            <span key={m} className="rounded-full border border-border px-3 py-1 text-[11px]">
              {m}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AlumniTab({ school }: { school: SchoolProfile }) {
  const detail = getSchoolDetail(school.name);
  const alumni = detail?.alumni ?? [];
  if (alumni.length === 0) {
    return (
      <Card>
        <p className="text-sm">No notable-alumni information yet for {school.name}.</p>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground">
        Publicly known graduates. These people are not PlugU members and cannot be contacted here.
      </p>
      {alumni.map((a) => (
        <Card key={a.name}>
          <p className="font-semibold">{a.name}</p>
          <p className="text-xs text-muted-foreground">
            {a.note}
            {a.era ? ` · ${a.era}` : ""}
          </p>
        </Card>
      ))}
    </div>
  );
}

function GreekTab({ school }: { school: SchoolProfile }) {
  const detail = getSchoolDetail(school.name);
  const greek = detail?.greek;
  if (!greek) {
    return (
      <Card>
        <p className="text-sm">No Greek life information yet for {school.name}.</p>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {greek.fraternities.length > 0 && (
        <Card>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Fraternities</p>
          <ul className="mt-2 space-y-1 text-sm">
            {greek.fraternities.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Card>
      )}
      {greek.sororities.length > 0 && (
        <Card>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sororities</p>
          <ul className="mt-2 space-y-1 text-sm">
            {greek.sororities.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Card>
      )}
      <Card>
        <p className="text-sm">{greek.houses}</p>
        <p className="mt-2 text-xs text-muted-foreground">{greek.tradition}</p>
      </Card>
    </div>
  );
}

function MapTab({ school }: { school: SchoolProfile }) {
  return (
    <div className="space-y-3">
      <CampusSatelliteMap school={school.name} city={school.city} />
      <a
        href={`https://www.google.com/maps/search/${encodeURIComponent(school.name + " " + school.city)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="tap flex min-h-[44px] items-center justify-between rounded-2xl border border-border bg-card px-4"
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold">
          <MapIcon className="h-4 w-4" /> Open in Maps
        </span>
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </a>
    </div>
  );
}

function NewsTab({ school }: { school: SchoolProfile }) {
  const fn = useServerFn(getLiveNews);
  const { data, isPending, isFetching, refetch, isError } = useQuery({
    queryKey: ["school-news", school.name],
    queryFn: () => fn({ data: { topic: "Campus", count: 12, query: school.name } }),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
  const items = data?.items ?? [];

  if (isPending) {
    return <div className="h-24 animate-pulse rounded-2xl border border-border bg-card" aria-hidden="true" />;
  }
  if (items.length === 0) {
    return (
      <Card>
        <p className="text-sm font-semibold">
          {isError ? "Headlines didn't load" : `No recent coverage found for ${school.name}`}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          We only show stories we can fetch from the original publisher.
        </p>
        <button onClick={() => refetch()} disabled={isFetching} className="tap mt-2 min-h-[44px] text-xs font-semibold text-primary">
          Try again
        </button>
      </Card>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((n) => (
        <li key={n.id}>
          <a href={n.url} target="_blank" rel="noopener noreferrer" className="tap block rounded-2xl border border-border bg-card p-3">
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
  );
}

function EventsTab({ school }: { school: SchoolProfile }) {
  const { data, isPending } = useCampusEvents();
  const now = Date.now();
  const upcoming = (data ?? [])
    .filter((e) => e.status !== "cancelled" && +new Date(e.starts_at) >= now - 3 * 60 * 60 * 1000)
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));

  return (
    <div className="space-y-3">
      {isPending && <div className="h-20 animate-pulse rounded-2xl border border-border bg-card" aria-hidden="true" />}
      {!isPending && upcoming.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center">
          <p className="text-sm font-semibold">Nothing posted here yet</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Events come from students. Be the first to post one for {school.name}.
          </p>
          <Link to="/events" className="tap mt-2 inline-block min-h-[44px] text-xs font-semibold text-primary">
            Open events
          </Link>
        </div>
      )}
      {upcoming.map((e) => (
        <Link key={e.id} to="/events" className="tap block rounded-2xl border border-border bg-card p-3">
          <p className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" /> {new Date(e.starts_at).toLocaleString()}
          </p>
          <p className="mt-0.5 font-semibold leading-snug">{e.title}</p>
          <p className="truncate text-[11px] text-muted-foreground">{e.location}</p>
        </Link>
      ))}
      <Link to="/market" className="tap flex min-h-[44px] items-center justify-between rounded-2xl border border-border bg-card px-4">
        <span className="inline-flex items-center gap-2 text-sm font-semibold">
          <Store className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} /> Campus marketplace
        </span>
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
