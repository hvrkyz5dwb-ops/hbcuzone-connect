import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, RefreshCw, MapPin } from "lucide-react";
import { generateCampusLayout, type CampusZone } from "@/lib/campus-layout.functions";

const CATEGORY_STYLES: Record<CampusZone["category"], { fill: string; stroke: string; label: string }> = {
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

type Props = {
  school: string;
  city?: string;
  mascot?: string;
};

export function CampusLayoutAI({ school, city, mascot }: Props) {
  const fn = useServerFn(generateCampusLayout);
  const q = useQuery({
    queryKey: ["campus-layout", school],
    queryFn: () => fn({ data: { school, city, mascot } }),
    staleTime: 1000 * 60 * 30,
  });

  const layout = q.data;
  const usedCats = new Set(layout?.zones.map((z) => z.category) ?? []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">AI Campus Layout</p>
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

      {layout?.tagline && (
        <p className="text-xs text-muted-foreground italic">{layout.tagline}</p>
      )}

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
            {/* subtle grid */}
            <defs>
              <pattern id="cgrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(201,162,74,0.06)" strokeWidth="0.2" />
              </pattern>
            </defs>
            <rect width="100" height="75" fill="url(#cgrid)" />

            {/* paths */}
            {layout.paths.map((p) => (
              <polyline
                key={p.id}
                points={p.points.map((pt) => `${pt.x},${(pt.y * 75) / 100}`).join(" ")}
                fill="none"
                stroke="rgba(201,162,74,0.55)"
                strokeWidth="0.6"
                strokeDasharray="1.2 1"
                strokeLinecap="round"
              />
            ))}

            {/* zones */}
            {layout.zones.map((z) => {
              const s = CATEGORY_STYLES[z.category];
              const h = (z.h * 75) / 100;
              const y = (z.y * 75) / 100;
              return (
                <g key={z.id}>
                  <rect
                    x={z.x}
                    y={y}
                    width={z.w}
                    height={h}
                    rx="1.2"
                    fill={s.fill}
                    stroke={s.stroke}
                    strokeWidth="0.35"
                    opacity="0.92"
                  />
                  <text
                    x={z.x + z.w / 2}
                    y={y + h / 2 - 0.4}
                    fontSize="2.2"
                    textAnchor="middle"
                    fill="#f5e7c3"
                    style={{ fontFamily: "system-ui" }}
                  >
                    {z.emoji}
                  </text>
                  <text
                    x={z.x + z.w / 2}
                    y={y + h / 2 + 2}
                    fontSize="1.4"
                    textAnchor="middle"
                    fill="#f5e7c3"
                    opacity="0.85"
                    style={{ fontFamily: "system-ui", fontWeight: 600 }}
                  >
                    {z.label.length > 18 ? z.label.slice(0, 17) + "…" : z.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Legend */}
      {layout && (
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_STYLES) as CampusZone["category"][])
            .filter((c) => usedCats.has(c))
            .map((c) => {
              const s = CATEGORY_STYLES[c];
              return (
                <span key={c} className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full border border-border bg-card">
                  <span className="h-2 w-2 rounded-sm" style={{ background: s.stroke }} />
                  {s.label}
                </span>
              );
            })}
        </div>
      )}

      {/* Building list */}
      {layout && (
        <ul className="grid grid-cols-2 gap-1.5">
          {layout.zones.map((z) => (
            <li key={z.id} className="rounded-xl border border-border bg-card px-2.5 py-1.5 flex items-center gap-2 text-[11px]">
              <span>{z.emoji}</span>
              <span className="truncate">{z.label}</span>
            </li>
          ))}
        </ul>
      )}

      {layout?.error && (
        <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {layout.error}
        </p>
      )}
    </div>
  );
}