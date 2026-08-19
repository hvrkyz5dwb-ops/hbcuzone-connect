// Live campus heat map — intensity comes from real rows (availability, drops,
// events) aggregated per campus zone by the campus_activity_summary function.
import { useMemo, useState } from "react";
import { Flame, Radio, Zap, CalendarDays } from "lucide-react";
import { useCampusActivity, useCampusZones } from "@/hooks/use-pulse";
import type { ZoneActivity, CampusZone } from "@/lib/pulse-db";

export type LiveZone = CampusZone & ZoneActivity & { intensity: number };

export function useLiveZones() {
  const zonesQ = useCampusZones();
  const actQ = useCampusActivity();

  const zones = useMemo<LiveZone[]>(() => {
    const acts = new Map<string, ZoneActivity>(
      (actQ.data ?? []).map((a) => [a.zone_name, a]),
    );
    const rows = (zonesQ.data ?? []).map((z) => {
      const a = acts.get(z.name) ?? { zone_name: z.name, available_count: 0, drop_count: 0, event_count: 0, total: 0 };
      return { ...z, ...a, intensity: 0 };
    });
    const max = Math.max(1, ...rows.map((r) => r.total ?? 0));
    return rows.map((r) => ({ ...r, intensity: (r.total ?? 0) / max }));
  }, [zonesQ.data, actQ.data]);

  return {
    zones,
    loading: zonesQ.isPending || actQ.isPending,
    error: (zonesQ.error ?? actQ.error) as Error | null,
    totalLive: zones.reduce((sum, z) => sum + (z.total ?? 0), 0),
  };
}

const heatColor = (i: number) =>
  i >= 0.75 ? "rgba(255,80,40,0.75)"
  : i >= 0.5 ? "rgba(255,150,40,0.65)"
  : i >= 0.25 ? "rgba(255,205,70,0.55)"
  : "rgba(120,200,255,0.35)";

/** Absolutely-positioned overlay meant to sit inside a relative map container. */
export function LiveHeatOverlay({ onSelect }: { onSelect?: (z: LiveZone) => void }) {
  const { zones } = useLiveZones();
  const hot = zones.filter((z) => (z.total ?? 0) > 0);
  if (hot.length === 0) return null;

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 pointer-events-none mix-blend-screen"
        style={{
          background: hot
            .map((z) => `radial-gradient(${10 + z.intensity * 12}% ${8 + z.intensity * 10}% at ${z.x}% ${z.y}%, ${heatColor(z.intensity)}, transparent 70%)`)
            .join(","),
        }}
      />
      {hot.map((z) => (
        <button
          key={z.id}
          onClick={() => onSelect?.(z)}
          className="absolute -translate-x-1/2 -translate-y-1/2 tap"
          style={{ left: `${z.x}%`, top: `${z.y}%` }}
          aria-label={`${z.name} — ${z.total} live now`}
        >
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-background/80 backdrop-blur border border-border whitespace-nowrap">
            🔥 {z.name} · {z.total}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Standalone card listing what's live per zone right now. */
export function LiveHeatPanel() {
  const { zones, loading, totalLive } = useLiveZones();
  const [open, setOpen] = useState<string | null>(null);
  const ranked = [...zones].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));

  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: "var(--plugu-gold)" }}>
          Live heat map
        </p>
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> {totalLive} live now
        </span>
      </div>

      {loading && (
        <div className="mt-3 space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-2xl shimmer" />)}
        </div>
      )}

      {!loading && ranked.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          No campus zones mapped yet for your school. Heat turns on as sellers go live.
        </p>
      )}

      {!loading && ranked.length > 0 && totalLive === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          The yard is quiet right now. Go <span className="text-primary font-semibold">Available Now</span> and be the first plug live.
        </p>
      )}

      {!loading && ranked.map((z) => (
        <div key={z.id} className="mt-2">
          <button
            onClick={() => setOpen(open === z.id ? null : z.id)}
            className="tap w-full flex items-center gap-3 rounded-2xl border border-border bg-background/40 px-3 py-2.5 text-left"
          >
            <span
              className="h-8 w-8 shrink-0 grid place-items-center rounded-xl"
              style={{ background: heatColor(z.intensity) }}
            >
              <Flame className="h-4 w-4 text-black/80" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold truncate">{z.name}</span>
              <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">{z.kind}</span>
            </span>
            <span className="text-sm font-bold" style={{ color: "var(--plugu-gold)" }}>{z.total ?? 0}</span>
          </button>
          {open === z.id && (
            <div className="mt-1.5 ml-11 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Radio className="h-3 w-3 text-primary" /> {z.available_count} available</span>
              <span className="inline-flex items-center gap-1"><Zap className="h-3 w-3 text-accent" /> {z.drop_count} drops</span>
              <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {z.event_count} events</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
