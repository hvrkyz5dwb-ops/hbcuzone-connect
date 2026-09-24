import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Sparkles, RefreshCw, MapPin, Navigation, ShieldCheck, LocateFixed, X,
} from "lucide-react";
import { generateCampusLayout, type CampusZone } from "@/lib/campus-layout.functions";
import { useGeolocation } from "@/hooks/use-geolocation";
import { evaluateOnCampus, findCampusCoord } from "@/lib/campus-coords";

const FILL: Record<CampusZone["category"], { fill: string; stroke: string; label: string }> = {
  academic:      { fill: "#3b2a5c", stroke: "#c9a24a", label: "Academic" },
  dorm:          { fill: "#2a2140", stroke: "#a97bff", label: "Dorms" },
  dining:        { fill: "#4a2b1f", stroke: "#e0a86b", label: "Dining" },
  athletic:      { fill: "#1f3a2a", stroke: "#6bd39b", label: "Athletics" },
  "student-life":{ fill: "#4a1f3a", stroke: "#ff7bc7", label: "Student Life" },
  landmark:      { fill: "#3a2e14", stroke: "#f5c94a", label: "Landmark" },
  green:         { fill: "#1e2f22", stroke: "#7bd39b", label: "Green Space" },
  admin:         { fill: "#2a2f3e", stroke: "#8fb0e8", label: "Admin" },
  safety:        { fill: "#3a1f22", stroke: "#f26b6b", label: "Safety" },
};

type Props = { school: string; city?: string; mascot?: string };

export function CampusWayfinder({ school, city, mascot }: Props) {
  const fn = useServerFn(generateCampusLayout);
  const q = useQuery({
    queryKey: ["campus-layout", school],
    queryFn: () => fn({ data: { school, city, mascot } }),
    staleTime: 1000 * 60 * 30,
  });
  const layout = q.data;

  const geo = useGeolocation();
  const [targetId, setTargetId] = useState<string | null>(null);

  const campus = useMemo(() => findCampusCoord(school), [school]);
  const check = useMemo(() => {
    if (!geo.coords) return null;
    return evaluateOnCampus(school, geo.coords);
  }, [geo.coords, school]);

  // Map real-world position → stylized 100x75 grid via bearing from campus center.
  const meDot = useMemo(() => {
    if (!check || !campus || !geo.coords) return null;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const φ1 = toRad(campus.lat);
    const φ2 = toRad(geo.coords.lat);
    const λ1 = toRad(campus.lng);
    const λ2 = toRad(geo.coords.lng);
    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const bearing = Math.atan2(y, x); // radians, 0 = north
    // Scale distance to grid: on-campus = smaller radius; clamp to 4..40 grid units
    const gridRadius = Math.max(4, Math.min(40, check.distanceKm * 18));
    const gx = 50 + gridRadius * Math.sin(bearing);
    // y inverted (grid y grows down)
    const gy = 50 - gridRadius * Math.cos(bearing) * (75 / 100);
    return { x: gx, y: Math.max(3, Math.min(72, gy)) };
  }, [check, campus, geo.coords]);

  const target = layout?.zones.find((z) => z.id === targetId) ?? null;
  const targetCenter = target
    ? { x: target.x + target.w / 2, y: ((target.y + target.h / 2) * 75) / 100 }
    : null;

  const onCampus = check?.onCampus === true;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">AI Campus Wayfinder</p>
        </div>
        <button
          onClick={() => q.refetch()}
          disabled={q.isFetching}
          className="text-[11px] inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border tap disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${q.isFetching ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </div>

      {/* Location gate */}
      <LocationGate geo={geo} check={check} school={school} />

      {/* Destination picker */}
      {onCampus && layout && (
        <div className="flex items-center gap-2">
          <Navigation className="h-3.5 w-3.5 text-accent" />
          <select
            value={targetId ?? ""}
            onChange={(e) => setTargetId(e.target.value || null)}
            className="flex-1 bg-card border border-border rounded-full px-3 py-1.5 text-[12px] outline-none"
          >
            <option value="">Guide me to…</option>
            {layout.zones.map((z) => (
              <option key={z.id} value={z.id}>{z.emoji} {z.label}</option>
            ))}
          </select>
          {targetId && (
            <button
              onClick={() => setTargetId(null)}
              className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-full border border-border tap"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-border" style={{ background: "radial-gradient(circle at 30% 20%, #1a1030 0%, #0a0616 70%)" }}>
        {q.isLoading && (
          <div className="aspect-[4/3] grid place-items-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse text-accent" />
              PlugU CampusAI is drawing {school}…
            </div>
          </div>
        )}

        {layout && (
          <svg viewBox="0 0 100 75" className="w-full h-auto block" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="wgrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(201,162,74,0.06)" strokeWidth="0.2" />
              </pattern>
              <radialGradient id="mePulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f5c94a" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f5c94a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100" height="75" fill="url(#wgrid)" />

            {layout.paths.map((p) => (
              <polyline
                key={p.id}
                points={p.points.map((pt) => `${pt.x},${(pt.y * 75) / 100}`).join(" ")}
                fill="none"
                stroke="rgba(201,162,74,0.5)"
                strokeWidth="0.55"
                strokeDasharray="1.2 1"
                strokeLinecap="round"
              />
            ))}

            {layout.zones.map((z) => {
              const s = FILL[z.category];
              const h = (z.h * 75) / 100;
              const y = (z.y * 75) / 100;
              const isTarget = z.id === targetId;
              return (
                <g key={z.id} onClick={() => setTargetId(z.id)} style={{ cursor: onCampus ? "pointer" : "default" }}>
                  <rect
                    x={z.x}
                    y={y}
                    width={z.w}
                    height={h}
                    rx="1.2"
                    fill={s.fill}
                    stroke={isTarget ? "#f5c94a" : s.stroke}
                    strokeWidth={isTarget ? 0.7 : 0.35}
                    opacity={isTarget ? 1 : 0.92}
                  />
                  <text x={z.x + z.w / 2} y={y + h / 2 - 0.4} fontSize="2.2" textAnchor="middle" fill="#f5e7c3" style={{ fontFamily: "system-ui" }}>
                    {z.emoji}
                  </text>
                  <text x={z.x + z.w / 2} y={y + h / 2 + 2} fontSize="1.4" textAnchor="middle" fill="#f5e7c3" opacity="0.85" style={{ fontFamily: "system-ui", fontWeight: 600 }}>
                    {z.label.length > 18 ? z.label.slice(0, 17) + "…" : z.label}
                  </text>
                </g>
              );
            })}

            {/* Route line */}
            {meDot && targetCenter && (
              <line
                x1={meDot.x} y1={meDot.y}
                x2={targetCenter.x} y2={targetCenter.y}
                stroke="#f5c94a"
                strokeWidth="0.7"
                strokeDasharray="1.2 1"
                strokeLinecap="round"
              />
            )}

            {/* "You are here" */}
            {meDot && (
              <g>
                <circle cx={meDot.x} cy={meDot.y} r="4" fill="url(#mePulse)">
                  <animate attributeName="r" values="2.5;5;2.5" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx={meDot.x} cy={meDot.y} r="1.1" fill="#f5c94a" stroke="#0a0616" strokeWidth="0.35" />
              </g>
            )}
          </svg>
        )}
      </div>

      {/* Legend + directions hint */}
      {layout && target && meDot && (
        <div className="rounded-xl border border-border bg-card p-2.5 text-[11px] flex items-center gap-2">
          <Navigation className="h-3.5 w-3.5 text-accent" />
          <span>
            Heading to <span className="font-semibold text-foreground">{target.emoji} {target.label}</span>
            {check && Number.isFinite(check.distanceKm) && (
              <> · {check.distanceKm < 0.15 ? "you're right there" : `${(check.distanceKm * 1000).toFixed(0)}m from campus center`}</>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

function LocationGate({
  geo, check, school,
}: {
  geo: ReturnType<typeof useGeolocation>;
  check: ReturnType<typeof evaluateOnCampus> | null;
  school: string;
}) {
  const [declined, setDeclined] = useState(false);
  if (geo.status === "idle" && declined) {
    return (
      <div className="rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">Wayfinding is off. The campus layout still works without location.</p>
        <button onClick={() => setDeclined(false)} className="min-h-11 px-3 text-[11px] font-semibold text-primary tap">Turn on</button>
      </div>
    );
  }
  if (geo.status === "idle") {
    return (
      <div className="rounded-xl border border-border bg-card p-3 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 mt-0.5 text-accent shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold">Wayfinding</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            To place you on the {school} layout and route you to buildings, PlugU needs your location while you use this feature. Everything else works without it.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={geo.request}
              className="min-h-11 inline-flex items-center gap-1.5 px-4 rounded-full text-[12px] font-semibold border border-border bg-primary/15 tap"
            >
              <LocateFixed className="h-3.5 w-3.5" /> Continue
            </button>
            <button
              onClick={() => setDeclined(true)}
              className="min-h-11 px-4 rounded-full text-[12px] font-semibold text-muted-foreground tap"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (geo.status === "prompt") {
    return <StatusPill icon={<LocateFixed className="h-3.5 w-3.5 animate-pulse" />} text="Waiting for location…" />;
  }
  if (geo.status === "denied") {
    return <StatusPill icon={<MapPin className="h-3.5 w-3.5" />} text="Location denied. Enable it in your browser settings to unlock wayfinding." />;
  }
  if (geo.status === "unsupported" || geo.status === "error") {
    return <StatusPill icon={<MapPin className="h-3.5 w-3.5" />} text={geo.error ?? "Location unavailable on this device."} />;
  }
  if (check && !check.onCampus) {
    return (
      <StatusPill
        icon={<MapPin className="h-3.5 w-3.5" />}
        text={`You're ~${check.distanceKm.toFixed(1)}km from ${school}. Wayfinding unlocks when you're on campus.`}
      />
    );
  }
  if (check?.onCampus) {
    return (
      <StatusPill
        icon={<ShieldCheck className="h-3.5 w-3.5 text-accent" />}
        text={`On campus · ${geo.coords ? `±${Math.round(geo.coords.accuracy)}m accuracy` : "live"} · sharing while using only`}
      />
    );
  }
  return null;
}

function StatusPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 flex items-center gap-2 text-[11px] text-muted-foreground">
      {icon}<span className="text-foreground/90">{text}</span>
    </div>
  );
}