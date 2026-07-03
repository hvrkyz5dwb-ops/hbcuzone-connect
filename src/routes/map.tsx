import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Navigation,
  MapPin,
  Search,
  Compass,
  Layers,
  Crosshair,
  X,
  Phone,
  Route as RouteIcon,
  Flame,
  Footprints,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { mapPins, pinFilters, type MapPin as PinType, type PinCategory } from "@/lib/mock-data";
import { useHomeCampus } from "@/hooks/use-home-campus";
import { useSchool } from "@/hooks/use-school";
import { schoolProfiles } from "@/lib/hbcus-data";
import { CampusLayoutAI } from "@/components/CampusLayoutAI";
import { CampusWayfinder } from "@/components/CampusWayfinder";
import { useHbcusVerification } from "@/hooks/use-hbcus-verification";
import { toast } from "sonner";
import mapImg from "@/assets/campus-map.jpg";
import statue from "@/assets/plugu-statue.jpg.asset.json";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Campus Map — PlugU" },
      { name: "description", content: "Your campus survival tool. Find food, events, rides, study spots, safety, and vendor pop-ups near you in real time." },
      { property: "og:title", content: "PlugU Live Campus Map" },
      { property: "og:description", content: "Find food, events, rides, study spots, and safety near you." },
    ],
  }),
  component: MapPage,
});

const pinColor: Record<PinCategory, string> = {
  food: "bg-orange-500",
  event: "bg-pink-500",
  ride: "bg-sky-500",
  study: "bg-violet-500",
  building: "bg-stone-400",
  dorm: "bg-amber-500",
  dining: "bg-rose-500",
  library: "bg-emerald-500",
  gym: "bg-lime-500",
  parking: "bg-zinc-400",
  safety: "bg-red-600",
  phone: "bg-blue-500",
  hotspot: "bg-yellow-400",
  vendor: "bg-fuchsia-500",
};

function MapPage() {
  const school = useSchool();
  const { active: homeCampus, setHomeCampus } = useHomeCampus();
  const active = school.verified ? school.name : homeCampus;
  const { verified } = useHbcusVerification();
  const [filter, setFilter] = useState<PinCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PinType | null>(null);
  const [nearMe, setNearMe] = useState(false);
  const [heatmap, setHeatmap] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const filtered = useMemo(() => {
    return mapPins.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (nearMe && parseFloat(p.distance) > 0.3) return false;
      return true;
    });
  }, [filter, query, nearMe]);

  const filterEmoji = (cat: PinCategory) =>
    pinFilters.find((f) => f.key === cat)?.emoji ?? "📍";

  return (
    <AppShell title="CAMPUS MAP">
      {/* Brand hero */}
      <section className="px-5 pt-5">
        <div className="relative overflow-hidden rounded-3xl border border-border h-40">
          <img src={statue.url} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_25%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(60% 80% at 100% 0%, color-mix(in oklab, var(--plugu-purple) 35%, transparent), transparent 70%)" }}
          />
          <div className="relative h-full flex flex-col justify-end p-4">
            <h2 className="text-lg font-bold" style={{ color: "var(--plugu-gold)" }}>{active}</h2>
            <p className="text-[10px] uppercase tracking-widest text-white/70">
              {school.mascot ? `${school.mascot} · ` : ""}{school.city ?? "Live Campus Map"}{school.state ? `, ${school.state}` : ""}
            </p>
            <p className="text-[11px] text-white/80 mt-1 max-w-[240px]">
              Find vendors, events, buildings, rides, and student hotspots — tuned to your school.
            </p>
            <button
              onClick={() => {
                setNearMe(true);
                document.getElementById("ai-campus-layout")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="mt-3 self-start text-xs font-semibold px-3 py-2 rounded-xl text-black"
              style={{ background: "var(--plugu-gold)", boxShadow: "var(--shadow-gold)" }}
            >
              Open Full Map
            </button>
          </div>
        </div>
      </section>

      {/* Search + campus */}
      <section className="px-5 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search buildings, vendors, spots"
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => setHeatmap((v) => !v)}
            className={`h-11 w-11 grid place-items-center rounded-2xl border tap ${heatmap ? "bg-[image:var(--gradient-bronze)] border-primary text-primary-foreground" : "bg-card border-border"}`}
            aria-label="Toggle heat map layer"
          >
            <Layers className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => { if (!school.verified) setSwitcherOpen(true); }}
            className="tap inline-flex items-center gap-2 text-xs text-muted-foreground disabled:opacity-100"
            disabled={school.verified}
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground">{active}</span>
            {school.verified
              ? <span className="text-[9px] uppercase tracking-widest text-accent">Verified</span>
              : <span className="text-[9px] uppercase tracking-widest">Change</span>}
          </button>
          <button
            onClick={() => setNearMe((v) => !v)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] tracking-wide border transition-colors ${
              nearMe
                ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border"
            }`}
          >
            <Crosshair className="h-3 w-3" /> What's near me
          </button>
        </div>
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => setHeatmap((v) => !v)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] tracking-wide border transition-colors ${
              heatmap
                ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border"
            }`}
          >
            <Flame className="h-3 w-3" /> Heat map
          </button>
        </div>
      </section>

      {/* Map canvas */}
      <section className="px-5 mt-4">
        <div className="relative rounded-3xl overflow-hidden border border-border aspect-[4/5] bg-black">
          <img
            src={mapImg}
            alt="Live campus map"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />

          {/* Heat map overlay */}
          {heatmap && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-screen"
              style={{
                background:
                  "radial-gradient(18% 14% at 50% 45%, rgba(255,80,40,0.75), transparent 70%)," +
                  "radial-gradient(14% 11% at 32% 38%, rgba(255,160,40,0.65), transparent 70%)," +
                  "radial-gradient(12% 10% at 68% 44%, rgba(255,60,160,0.55), transparent 70%)," +
                  "radial-gradient(16% 12% at 48% 50%, rgba(255,220,40,0.55), transparent 70%)," +
                  "radial-gradient(10% 8% at 82% 80%, rgba(255,120,40,0.5), transparent 70%)",
              }}
            />
          )}

          {/* "You are here" */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "50%", top: "55%" }}
            aria-label="Your location"
          >
            <span className="absolute inset-0 -m-3 rounded-full bg-primary/30 animate-ping" />
            <span className="relative block h-4 w-4 rounded-full bg-primary border-2 border-background shadow-[var(--shadow-glow)]" />
          </div>

          {/* Pins */}
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="absolute -translate-x-1/2 -translate-y-full group"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              aria-label={p.name}
            >
              <div className={`h-7 w-7 grid place-items-center rounded-full text-xs shadow-lg border-2 border-background ${pinColor[p.category]} group-active:scale-110 transition-transform`}>
                <span>{filterEmoji(p.category)}</span>
              </div>
              <div className="mx-auto h-2 w-2 -mt-0.5 rotate-45 bg-background border-r border-b border-border" />
            </button>
          ))}

          {/* FAB recenter */}
          <button
            onClick={() => toast.success("Centered on your location")}
            className="absolute bottom-4 right-4 h-12 w-12 grid place-items-center rounded-full bg-[image:var(--gradient-bronze)] text-primary-foreground shadow-[var(--shadow-glow)] tap"
            aria-label="Recenter"
          >
            <Compass className="h-5 w-5" />
          </button>

          {/* Legend pill */}
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-background/70 backdrop-blur text-[11px] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Live · {filtered.length} pins
          </div>
        </div>
      </section>

      {/* AI Campus Layout — verified students see it live for their campus */}
      <section id="ai-campus-layout" className="px-5 mt-6">
        <div className="rounded-3xl border border-border bg-card p-4"
             style={{ boxShadow: "inset 0 0 0 1px rgba(201,162,74,0.18)" }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--plugu-gold)" }}>
                AI Campus Directory
              </p>
              <h3 className="text-base font-semibold">{active}</h3>
            </div>
            {!verified && (
              <span className="text-[10px] px-2 py-1 rounded-full border border-border text-muted-foreground">
                .edu unlocks live
              </span>
            )}
          </div>
          {verified
            ? <CampusWayfinder school={active} />
            : <CampusLayoutAI school={active} city={school.city} mascot={school.mascot} />}
        </div>
      </section>

      {/* Filter chips */}
      <section className="mt-4">
        <div className="px-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {pinFilters.map((f) => {
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs border transition-colors ${
                  isActive
                    ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border"
                }`}
              >
                <span>{f.emoji}</span>
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Nearby list */}
      <section className="mt-4 px-5 pb-4">
        <div className="flex items-end justify-between mb-2">
          <h2 className="text-base font-semibold tracking-tight">
            {nearMe ? "Right next to you" : "On the map"}
          </h2>
          <span className="text-[11px] text-muted-foreground">{filtered.length} results</span>
        </div>
        <ul className="space-y-2">
          {filtered.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setSelected(p)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border text-left"
              >
                <div className={`h-10 w-10 grid place-items-center rounded-xl text-base ${pinColor[p.category]}`}>
                  {filterEmoji(p.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate flex items-center gap-2">
                    {p.name}
                    {p.open && (
                      <span className="text-[10px] tracking-wide uppercase text-emerald-400">Open</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                </div>
                <span className="text-xs text-primary shrink-0">{p.distance}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-center text-sm text-muted-foreground py-8">
              No pins match. Try another filter.
            </li>
          )}
        </ul>
      </section>

      {/* Pin detail sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-md bg-card border-t border-border rounded-t-3xl p-5 pb-8 animate-in slide-in-from-bottom">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="flex items-start gap-3">
              <div className={`h-12 w-12 grid place-items-center rounded-xl text-lg ${pinColor[selected.category]}`}>
                {filterEmoji(selected.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight">{selected.name}</h3>
                <p className="text-xs text-muted-foreground capitalize">
                  {selected.category} · {selected.distance} away
                </p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{selected.description}</p>

            <div className="mt-4 flex items-center gap-2 p-3 rounded-2xl bg-secondary border border-border">
              <Footprints className="h-4 w-4 text-primary shrink-0" />
              <div className="text-xs">
                <p className="font-medium">Walking directions</p>
                <p className="text-muted-foreground">
                  {selected.distance} · about {Math.max(1, Math.round(parseFloat(selected.distance) * 20))} min walk
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => toast.success(`Directions to ${selected.name}`, { description: `${selected.distance} · walk it` })}
                className="flex items-center justify-center gap-1 py-3 text-sm rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground font-medium tap"
              >
                <RouteIcon className="h-4 w-4" /> Directions
              </button>
              <button
                onClick={() => toast.success(`Saved ${selected.name} to your spots`)}
                className="flex items-center justify-center gap-1 py-3 text-sm rounded-2xl bg-secondary border border-border tap"
              >
                <Navigation className="h-4 w-4" /> Save spot
              </button>
            </div>

            {selected.category === "safety" && (
              <button
                onClick={() => toast("Connecting to campus safety…", { description: "This is a demo — no call placed." })}
                className="mt-2 w-full flex items-center justify-center gap-2 py-3 text-sm rounded-2xl bg-red-600 text-white font-medium tap"
              >
                <Phone className="h-4 w-4" /> Call Campus Safety
              </button>
            )}

            {selected.category === "phone" && (
              <button
                onClick={() => toast("Emergency line ready", { description: "Demo mode — no call placed." })}
                className="mt-2 w-full flex items-center justify-center gap-2 py-3 text-sm rounded-2xl bg-blue-600 text-white font-medium tap"
              >
                <Phone className="h-4 w-4" /> One-press Emergency
              </button>
            )}
          </div>
        </div>
      )}

      {switcherOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-end sm:place-items-center" onClick={() => setSwitcherOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-sm bg-card border border-border rounded-t-3xl sm:rounded-3xl p-5 max-h-[80dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Change campus</h2>
              <button onClick={() => setSwitcherOpen(false)} aria-label="Close" className="tap h-8 w-8 grid place-items-center rounded-full bg-secondary"><X className="h-4 w-4" /></button>
            </div>
            <ul className="space-y-1">
              {schoolProfiles.map((s) => (
                <li key={s.name}>
                  <button
                    onClick={() => { setHomeCampus(s.name); setSwitcherOpen(false); toast.success(`Map switched to ${s.name}`); }}
                    className="tap w-full text-left px-3 py-2.5 rounded-xl hover:bg-secondary flex items-center justify-between"
                  >
                    <span className="text-sm">{s.name}</span>
                    {s.name === active && <span className="text-[10px] uppercase tracking-widest text-accent">Current</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </AppShell>
  );
}