// LIVE MAP — three modes: Navigate, Explore, Live.
// Every campus fact rendered here comes from administrator-verified
// database records. Nothing is invented, and unverified places are
// clearly labelled.
import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import {
  Navigation, Compass, Radio, MapPin, Search, X, Save, Footprints,
  ShieldCheck, AlertCircle, Clock, Accessibility, ExternalLink, Flag, Ban, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ReportDialog } from "@/components/ReportDialog";
import { useSession } from "@/hooks/use-session";
import {
  useActiveCampus, useCampusPlaces, useCampusTours, useLivePins, useOptInLocation, useSavedPlaces,
} from "@/hooks/use-campus-os";
import {
  PLACE_CATEGORIES, categoryShape, isVerified, matchPlace, toggleSavedPlace,
  type CampusPlace, type LivePin,
} from "@/lib/campus-os";
import {
  bearing, compassLabel, formatDistance, haversineMeters, previewPath, walkMinutes,
  type MarkerInput,
} from "@/lib/map-service";
import { useContentVisibility } from "@/hooks/use-blocklist";
import { blockUser } from "@/lib/moderation";

const CampusMap = lazy(() => import("@/components/campus/CampusMap"));

export const Route = createFileRoute("/map")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Live Campus Map — PlugU" },
      { name: "description", content: "Navigate verified campus destinations, explore a guided virtual tour, and see what's live on campus right now." },
      { property: "og:title", content: "PlugU Live Campus Map" },
      { property: "og:description", content: "Navigate, explore and see what's live on your campus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MapPage,
});

type Mode = "navigate" | "explore" | "live";

const MODES: { key: Mode; label: string; icon: typeof Navigation }[] = [
  { key: "navigate", label: "Navigate", icon: Navigation },
  { key: "explore", label: "Explore", icon: Compass },
  { key: "live", label: "Live", icon: Radio },
];

function MapPage() {
  const { session } = useSession();
  const { campus, campusName, loading: campusLoading } = useActiveCampus();
  const [mode, setMode] = useState<Mode>("navigate");
  const [selected, setSelected] = useState<CampusPlace | null>(null);
  const [destination, setDestination] = useState<CampusPlace | null>(null);
  const [routeStarted, setRouteStarted] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [liveFilter, setLiveFilter] = useState<string | null>(null);

  const places = useCampusPlaces(campus?.id);
  const tours = useCampusTours(campus?.id);
  const pins = useLivePins(campus?.id);
  const saved = useSavedPlaces(!!session);
  const { coords, state: locState, request: requestLocation } = useOptInLocation();
  const canSee = useContentVisibility();

  const center = useMemo(
    () => ({
      lat: campus?.center_lat ?? coords?.lat ?? 33.4362,
      lng: campus?.center_lng ?? coords?.lng ?? -86.1058,
    }),
    [campus?.center_lat, campus?.center_lng, coords?.lat, coords?.lng],
  );

  const allPlaces = places.data ?? [];
  const mapped = allPlaces.filter((p) => p.lat != null && p.lng != null);

  const visiblePlaces = useMemo(() => {
    return mapped.filter((p) => {
      if (category && p.category !== category) return false;
      if (accessibleOnly && !p.accessibility) return false;
      return matchPlace(p, query);
    });
  }, [mapped, category, accessibleOnly, query]);

  const visiblePins = useMemo(
    () =>
      (pins.data ?? [])
        .filter((p) => canSee({ type: "live_pin", id: p.id, authorId: p.owner_user_id }))
        .filter((p) => (liveFilter ? p.category === liveFilter : true)),
    [pins.data, liveFilter, canSee],
  );

  const markers: MarkerInput[] = useMemo(() => {
    if (mode === "live") {
      return visiblePins
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => ({
          id: p.id,
          lat: p.lat!,
          lng: p.lng!,
          label: `${p.title} — live until ${new Date(p.expires_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
          glyph: "◉",
          tone: "live" as const,
        }));
    }
    const list = mode === "navigate" && destination ? [destination] : visiblePlaces;
    return list
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => ({
        id: p.id,
        lat: p.lat!,
        lng: p.lng!,
        label: `${p.name}${isVerified(p) ? " (officially verified)" : " (being verified)"}`,
        glyph: categoryShape(p.category),
        tone: isVerified(p) ? ("gold" as const) : ("chrome" as const),
        onSelect: () => setSelected(p),
      }));
  }, [mode, visiblePlaces, visiblePins, destination]);

  const routeMeters =
    destination?.lat != null && destination?.lng != null && coords
      ? haversineMeters(coords, { lat: destination.lat, lng: destination.lng })
      : null;

  const routePath =
    destination?.lat != null && destination?.lng != null && coords
      ? previewPath(coords, { lat: destination.lat, lng: destination.lng })
      : null;

  return (
    <AppShell title="LIVE MAP">
      <section className="px-5 pt-4">
        <h1 className="sr-only">{campusName || "Campus"} live map</h1>

        {/* Mode segmented control */}
        <div
          role="tablist"
          aria-label="Map mode"
          className="flex rounded-full border border-border bg-card p-1"
        >
          {MODES.map((m) => {
            const Icon = m.icon;
            const on = mode === m.key;
            return (
              <button
                key={m.key}
                role="tab"
                aria-selected={on}
                onClick={() => setMode(m.key)}
                className={`tap flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition ${
                  on ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {m.label}
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          {campusLoading
            ? "Loading your campus…"
            : campus
              ? `${campus.name}${campus.verification_status === "verified" ? " · Officially verified" : " · Campus information is being verified"}`
              : "No campus is linked to your account yet."}
        </p>

        {/* Map */}
        <Suspense
          fallback={<div className="mt-3 h-[320px] animate-pulse rounded-3xl bg-secondary/60" aria-hidden="true" />}
        >
          <CampusMap
            className="mt-3 h-[320px]"
            ariaLabel={`${campusName || "Campus"} map, ${mode} mode`}
            center={center}
            markers={markers}
            routePath={routePath}
            userLocation={coords}
          />
        </Suspense>

        {locState !== "granted" && (
          <div className="mt-3 rounded-2xl border border-border bg-card p-3">
            <p className="text-xs font-semibold">Use your location?</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              PlugU uses your location only while you have the map open, to measure walking time to a
              destination and show what's nearby. It is never shared with other students.
            </p>
            <button
              onClick={requestLocation}
              className="tap mt-2 inline-flex min-h-11 items-center rounded-full bg-secondary px-4 text-xs font-semibold"
            >
              {locState === "asking" ? "Waiting for permission…" : "Turn on location"}
            </button>
            {locState === "denied" && (
              <p className="mt-2 text-[11px] text-muted-foreground" role="status">
                Location is off. You can still search and open destinations — walking times just
                won't be shown.
              </p>
            )}
          </div>
        )}

        {mode === "navigate" && (
          <NavigateMode
            places={mapped}
            query={query}
            setQuery={setQuery}
            accessibleOnly={accessibleOnly}
            setAccessibleOnly={setAccessibleOnly}
            destination={destination}
            setDestination={(p) => {
              setDestination(p);
              setRouteStarted(false);
              setArrived(false);
            }}
            coords={coords}
            meters={routeMeters}
            started={routeStarted}
            arrived={arrived}
            onStart={() => setRouteStarted(true)}
            onArrive={() => {
              setArrived(true);
              setRouteStarted(false);
            }}
            loading={places.isPending}
          />
        )}

        {mode === "explore" && (
          <ExploreMode
            places={visiblePlaces}
            loading={places.isPending}
            category={category}
            setCategory={setCategory}
            query={query}
            setQuery={setQuery}
            tours={tours.data ?? []}
            onOpen={setSelected}
            savedIds={saved.data ?? []}
          />
        )}

        {mode === "live" && (
          <LiveMode
            pins={visiblePins}
            loading={pins.isPending}
            filter={liveFilter}
            setFilter={setLiveFilter}
          />
        )}
      </section>

      {selected && (
        <PlaceSheet
          place={selected}
          onClose={() => setSelected(null)}
          saved={(saved.data ?? []).includes(selected.id)}
          onSaveToggle={async (isSaved) => {
            try {
              await toggleSavedPlace(selected.id, isSaved);
              await saved.refetch();
              toast.success(isSaved ? "Removed from saved places" : "Saved");
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
          onNavigate={() => {
            setDestination(selected);
            setMode("navigate");
            setSelected(null);
          }}
          coords={coords}
        />
      )}
    </AppShell>
  );
}

/* ------------------------------- NAVIGATE -------------------------------- */

function NavigateMode({
  places, query, setQuery, accessibleOnly, setAccessibleOnly, destination, setDestination,
  coords, meters, started, arrived, onStart, onArrive, loading,
}: {
  places: CampusPlace[];
  query: string;
  setQuery: (v: string) => void;
  accessibleOnly: boolean;
  setAccessibleOnly: (v: boolean) => void;
  destination: CampusPlace | null;
  setDestination: (p: CampusPlace | null) => void;
  coords: { lat: number; lng: number } | null;
  meters: number | null;
  started: boolean;
  arrived: boolean;
  onStart: () => void;
  onArrive: () => void;
  loading: boolean;
}) {
  const results = useMemo(
    () =>
      places
        .filter((p) => (accessibleOnly ? !!p.accessibility : true))
        .filter((p) => matchPlace(p, query))
        .slice(0, 12),
    [places, query, accessibleOnly],
  );

  const entrance = destination?.entrances?.find((e) => (accessibleOnly ? e.accessible : true)) ?? destination?.entrances?.[0];
  const dir =
    coords && destination?.lat != null && destination?.lng != null
      ? compassLabel(bearing(coords, { lat: destination.lat, lng: destination.lng }))
      : null;

  return (
    <div className="mt-4">
      <label htmlFor="dest-search" className="sr-only">Search a campus destination</label>
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <input
          id="dest-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Building, department, office or nickname"
          className="min-h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear destination search" className="tap p-2">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <label className="mt-3 flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={accessibleOnly}
          onChange={(e) => setAccessibleOnly(e.target.checked)}
          className="h-4 w-4 accent-[var(--plugu-gold)]"
        />
        <Accessibility className="h-3.5 w-3.5" aria-hidden="true" />
        Prefer accessible routes and entrances
      </label>

      {destination ? (
        <div className="mt-4 rounded-3xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">{destination.name}</h2>
              <VerificationChip place={destination} />
            </div>
            <button onClick={() => setDestination(null)} aria-label="Clear destination" className="tap p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl bg-background/60 p-3">
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Walking time</dt>
              <dd className="mt-0.5 font-semibold">
                {meters != null ? `${walkMinutes(meters)} min` : "Turn on location"}
              </dd>
            </div>
            <div className="rounded-2xl bg-background/60 p-3">
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Distance</dt>
              <dd className="mt-0.5 font-semibold">{meters != null ? formatDistance(meters) : "—"}</dd>
            </div>
          </dl>

          <div className="mt-3 rounded-2xl bg-background/60 p-3 text-xs">
            <p className="font-semibold">Entrance</p>
            <p className="mt-1 text-muted-foreground">
              {entrance
                ? `${entrance.label}${entrance.accessible ? " · step-free" : ""}`
                : "No verified entrance recorded yet for this building."}
            </p>
            <p className="mt-2 text-muted-foreground">
              Indoor directions are not yet available for this building.
            </p>
          </div>

          {started && !arrived && (
            <ol className="mt-3 space-y-1 rounded-2xl bg-background/60 p-3 text-xs text-muted-foreground">
              <li>1. Head {dir ?? "toward the campus centre"} on the outdoor path.</li>
              <li>2. Continue for about {meters != null ? formatDistance(meters) : "the posted distance"}.</li>
              <li>3. Arrive at {entrance?.label ?? destination.name} and use the marked entrance.</li>
            </ol>
          )}

          {arrived ? (
            <p role="status" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Arrived at {destination.name}
            </p>
          ) : started ? (
            <button onClick={onArrive} className="tap mt-3 min-h-11 w-full rounded-2xl bg-secondary text-sm font-semibold">
              I've arrived
            </button>
          ) : (
            <button
              onClick={onStart}
              className="tap mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
            >
              <Footprints className="h-4 w-4" aria-hidden="true" /> Start route
            </button>
          )}
        </div>
      ) : loading ? (
        <ListSkeleton />
      ) : results.length === 0 ? (
        <EmptyCampusData
          title={query ? "No verified match" : "Campus information is being verified"}
          body={
            query
              ? "We only show destinations an administrator has verified, so nothing matched that search yet."
              : "Verified buildings, offices and entrances for this campus haven't been published yet."
          }
        />
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
          {results.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setDestination(p)}
                className="tap flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span aria-hidden="true" className="text-base">{categoryShape(p.category)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {(p.nicknames ?? []).join(" · ") || p.subcategory || PLACE_CATEGORIES.find((c) => c.key === p.category)?.label}
                  </span>
                </span>
                <Navigation className="h-4 w-4 text-primary" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------- EXPLORE -------------------------------- */

function ExploreMode({
  places, loading, category, setCategory, query, setQuery, tours, onOpen, savedIds,
}: {
  places: CampusPlace[];
  loading: boolean;
  category: string | null;
  setCategory: (c: string | null) => void;
  query: string;
  setQuery: (v: string) => void;
  tours: { id: string; title: string; description: string | null; duration_min: number | null }[];
  onOpen: (p: CampusPlace) => void;
  savedIds: string[];
}) {
  return (
    <div className="mt-4">
      <label htmlFor="explore-search" className="sr-only">Search campus places</label>
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <input
          id="explore-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Explore buildings, dining, athletics…"
          className="min-h-11 flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1" role="group" aria-label="Place category filters">
        <FilterChip on={!category} onClick={() => setCategory(null)} label="All" glyph="✦" />
        {PLACE_CATEGORIES.map((c) => (
          <FilterChip
            key={c.key}
            on={category === c.key}
            onClick={() => setCategory(category === c.key ? null : c.key)}
            label={c.label}
            glyph={c.shape}
          />
        ))}
      </div>

      {tours.length > 0 && (
        <section className="mt-4" aria-labelledby="tours-h">
          <h2 id="tours-h" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Guided tours
          </h2>
          <ul className="-mx-5 mt-2 flex gap-3 overflow-x-auto px-5 pb-1">
            {tours.map((t) => (
              <li key={t.id} className="w-56 shrink-0 rounded-2xl border border-border bg-card p-3">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{t.description}</p>}
                {t.duration_min && (
                  <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden="true" /> about {t.duration_min} min
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {loading ? (
        <ListSkeleton />
      ) : places.length === 0 ? (
        <EmptyCampusData
          title="Campus information is being verified"
          body="Places appear here once an administrator publishes verified details for this campus."
        />
      ) : (
        <ul className="mt-4 grid gap-2">
          {places.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => onOpen(p)}
                className="tap flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left"
              >
                <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-base">
                  {categoryShape(p.category)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {PLACE_CATEGORIES.find((c) => c.key === p.category)?.label}
                    {savedIds.includes(p.id) ? " · Saved" : ""}
                  </span>
                </span>
                <VerificationChip place={p} compact />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* --------------------------------- LIVE ---------------------------------- */

const LIVE_FILTERS = [
  { key: "food", label: "Food now" },
  { key: "service", label: "Services" },
  { key: "event", label: "Events" },
  { key: "org", label: "Org tables" },
  { key: "popup", label: "Pop-ups" },
];

function LiveMode({
  pins, loading, filter, setFilter,
}: {
  pins: LivePin[];
  loading: boolean;
  filter: string | null;
  setFilter: (f: string | null) => void;
}) {
  const [reporting, setReporting] = useState<LivePin | null>(null);

  return (
    <div className="mt-4">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1" role="group" aria-label="Live activity filters">
        <FilterChip on={!filter} onClick={() => setFilter(null)} label="Everything live" glyph="◉" />
        {LIVE_FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            on={filter === f.key}
            onClick={() => setFilter(filter === f.key ? null : f.key)}
            label={f.label}
            glyph="◉"
          />
        ))}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Live pins are posted intentionally by their owner, use a safe public meetup point, and
        disappear automatically when they expire. Exact student locations are never shown.
      </p>

      {loading ? (
        <ListSkeleton />
      ) : pins.length === 0 ? (
        <EmptyCampusData
          title="Nothing is live right now"
          body="When students go active with food, services, events or pop-ups, they'll show up here."
        />
      ) : (
        <ul className="mt-3 grid gap-2">
          {pins.map((p) => (
            <li key={p.id} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {p.safe_location_label} · live until{" "}
                    {new Date(p.expires_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span>{p.accepting_orders ? "◉ Accepting orders" : "○ Not accepting right now"}</span>
                    {p.response_time_min != null && <span>Replies in ~{p.response_time_min} min</span>}
                    {p.price_range && <span>{p.price_range}</span>}
                    {p.appointment_required && <span>Appointment required</span>}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  to="/market"
                  className="tap inline-flex min-h-11 items-center rounded-full bg-secondary px-3 text-xs font-semibold"
                >
                  View profile
                </Link>
                <Link
                  to="/messages"
                  className="tap inline-flex min-h-11 items-center rounded-full bg-secondary px-3 text-xs font-semibold"
                >
                  Message
                </Link>
                <button
                  onClick={() => setReporting(p)}
                  className="tap inline-flex min-h-11 items-center gap-1 rounded-full bg-secondary px-3 text-xs font-semibold"
                >
                  <Flag className="h-3.5 w-3.5" aria-hidden="true" /> Report
                </button>
                <button
                  onClick={async () => {
                    try {
                      await blockUser(p.owner_user_id);
                      toast.success("Blocked. Their content is hidden from you.");
                    } catch (e) {
                      toast.error((e as Error).message);
                    }
                  }}
                  className="tap inline-flex min-h-11 items-center gap-1 rounded-full bg-secondary px-3 text-xs font-semibold"
                >
                  <Ban className="h-3.5 w-3.5" aria-hidden="true" /> Block
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {reporting && (
        <ReportDialog
          open
          onOpenChange={(o) => !o && setReporting(null)}
          targetType="listing"
          targetId={reporting.id}
          reportedUserId={reporting.owner_user_id}
          contentSnapshot={`${reporting.title} — ${reporting.safe_location_label}`}
        />
      )}
    </div>
  );
}

/* -------------------------------- shared --------------------------------- */

function FilterChip({ on, onClick, label, glyph }: { on: boolean; onClick: () => void; label: string; glyph: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`tap inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold ${
        on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
      }`}
    >
      <span aria-hidden="true">{glyph}</span> {label}
    </button>
  );
}

function VerificationChip({ place, compact }: { place: CampusPlace; compact?: boolean }) {
  const verified = isVerified(place);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
        verified ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
      }`}
    >
      {verified ? <ShieldCheck className="h-3 w-3" aria-hidden="true" /> : <AlertCircle className="h-3 w-3" aria-hidden="true" />}
      {verified ? "Officially verified" : compact ? "Being verified" : "Campus information is being verified"}
    </span>
  );
}

function EmptyCampusData({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-6 rounded-3xl border border-border bg-card p-6 text-center">
      <MapPin className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="mt-4 grid gap-2" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-secondary/60" />
      ))}
    </div>
  );
}

function PlaceSheet({
  place, onClose, saved, onSaveToggle, onNavigate, coords,
}: {
  place: CampusPlace;
  onClose: () => void;
  saved: boolean;
  onSaveToggle: (saved: boolean) => Promise<void>;
  onNavigate: () => void;
  coords: { lat: number; lng: number } | null;
}) {
  const [busy, setBusy] = useState(false);
  const meters =
    coords && place.lat != null && place.lng != null
      ? haversineMeters(coords, { lat: place.lat, lng: place.lng })
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={place.name}>
      <button className="absolute inset-0" aria-label="Close place details" onClick={onClose} />
      <div className="relative max-h-[80dvh] w-full overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{place.name}</h2>
            {(place.nicknames ?? []).length > 0 && (
              <p className="text-[11px] text-muted-foreground">Also called {place.nicknames.join(", ")}</p>
            )}
            <div className="mt-1"><VerificationChip place={place} /></div>
          </div>
          <button onClick={onClose} aria-label="Close" className="tap p-1"><X className="h-5 w-5" /></button>
        </div>

        {place.description && <p className="mt-3 text-sm text-muted-foreground">{place.description}</p>}

        <dl className="mt-3 grid gap-2 text-xs">
          {place.address && <Row label="Address" value={place.address} />}
          {meters != null && <Row label="Walking time" value={`${walkMinutes(meters)} min · ${formatDistance(meters)}`} />}
          {place.hours && <Row label="Hours" value={Object.entries(place.hours).map(([d, h]) => `${d}: ${h}`).join(" · ")} />}
          {(place.services ?? []).length > 0 && <Row label="Services" value={place.services.join(", ")} />}
          <Row label="Accessibility" value={place.accessibility || "Not recorded yet"} />
          <Row
            label="Verification"
            value={
              place.last_verified_at
                ? `${place.verification_source ?? "Campus administrator"} · last checked ${new Date(place.last_verified_at).toLocaleDateString()}`
                : "Campus information is being verified"
            }
          />
        </dl>

        {(place.media ?? []).length > 0 && (
          <ul className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1">
            {place.media.map((m, i) => (
              <li key={i}>
                <img src={m.url} alt={m.caption ?? `${place.name} photo ${i + 1}`} loading="lazy" className="h-24 w-36 rounded-xl object-cover" />
              </li>
            ))}
          </ul>
        )}

        {place.video_url && (
          <video controls className="mt-3 w-full rounded-2xl" preload="none" aria-label={`${place.name} video tour`}>
            <source src={place.video_url} />
            <track kind="captions" />
          </video>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onNavigate} className="tap inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            <Navigation className="h-4 w-4" aria-hidden="true" /> Navigate here
          </button>
          <button
            onClick={async () => { setBusy(true); await onSaveToggle(saved); setBusy(false); }}
            className="tap inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-secondary px-4 text-sm font-semibold"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {saved ? "Saved" : "Save place"}
          </button>
          {place.website && (
            <a href={place.website} target="_blank" rel="noreferrer" className="tap inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-secondary px-4 text-sm font-semibold">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/60 p-3">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
