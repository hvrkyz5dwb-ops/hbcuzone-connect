import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Shield, MapPin, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { HEAT_LAYERS, getPrivacy, setPrivacy, type HeatLayerKey, type HeatLayer } from "@/lib/heatmap-data";

export const Route = createFileRoute("/heatmap")({
  head: () => ({ meta: [{ title: "Campus Heat Map — PlugU" }] }),
  component: HeatMapPage,
});

function HeatMapPage() {
  const [active, setActive] = useState<Set<HeatLayerKey>>(
    () => new Set<HeatLayerKey>(["businesses", "food", "events"])
  );
  const [privacy, setPrivacyState] = useState(() => getPrivacy());

  useEffect(() => setPrivacy(privacy), [privacy]);

  const visible = useMemo(
    () => HEAT_LAYERS.filter((l) => active.has(l.key) && (l.privacy !== "opt-in" || privacy.shareActivity)),
    [active, privacy],
  );

  function toggle(k: HeatLayerKey) {
    const next = new Set(active);
    if (next.has(k)) next.delete(k); else next.add(k);
    setActive(next);
  }

  return (
    <AppShell title="CAMPUS HEAT">
      <section className="px-5 pt-5 slide-up">
        <Link to="/map" className="tap inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3 w-3" /> Live Map
        </Link>
        <h1 className="mt-2 text-2xl font-bold plugu-antique-wordmark">Campus Heat Map</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Where the yard is going off — right now. Everything is aggregated for privacy.
        </p>
      </section>

      <section className="px-5 pt-4">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-square"
          style={{ background: "radial-gradient(circle at 50% 45%, #1c1207, #050505 75%)" }}
        >
          <GridBackdrop />
          {visible.map((layer) => (
            <LayerBlobs key={layer.key} layer={layer} />
          ))}
          <div className="absolute bottom-2 left-2 text-[9px] tracking-[0.24em] uppercase text-white/50 inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Sample Yard · anonymized
          </div>
        </div>
      </section>

      <section className="px-5 pt-5">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground">Layers</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {HEAT_LAYERS.map((l) => {
            const on = active.has(l.key);
            return (
              <button
                key={l.key}
                onClick={() => toggle(l.key)}
                className="tap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px]"
                style={{
                  borderColor: on ? l.color : "var(--border)",
                  color: on ? l.color : "var(--muted-foreground)",
                  background: on ? "color-mix(in oklab, #000 90%, transparent)" : "transparent",
                }}
              >
                <span>{l.emoji}</span>{l.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-5 pt-5 pb-8">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Privacy first</p>
              <p className="text-[11px] text-muted-foreground">
                PlugU never shows individuals. Activity is aggregated across the whole yard.
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <Toggle
              label="Share my anonymous activity"
              hint="Helps others see when your area is popping."
              value={privacy.shareActivity}
              onChange={(v) => {
                setPrivacyState({ ...privacy, shareActivity: v });
                toast.success(v ? "Sharing anonymized activity" : "Activity sharing off");
              }}
            />
            <Toggle
              label="Aggregates only (recommended)"
              hint="Never show individual points, just heat blobs."
              value={privacy.showAggregatesOnly}
              onChange={(v) => setPrivacyState({ ...privacy, showAggregatesOnly: v })}
            />
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function GridBackdrop() {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
      <defs>
        <pattern id="hg" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#hg)" />
      <path d="M 5 50 Q 50 20 95 50" stroke="rgba(244,201,106,0.18)" strokeWidth="0.7" fill="none" />
      <path d="M 50 5 Q 30 50 50 95" stroke="rgba(244,201,106,0.12)" strokeWidth="0.5" fill="none" />
      <circle cx="50" cy="48" r="6" fill="rgba(244,201,106,0.12)" />
    </svg>
  );
}

function LayerBlobs({ layer }: { layer: HeatLayer }) {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
      {layer.points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x} cy={p.y}
            r={8 + p.weight * 8}
            fill={layer.color}
            opacity={0.18 + p.weight * 0.18}
            style={{ filter: "blur(6px)" }}
          />
          <circle
            cx={p.x} cy={p.y}
            r={1.4 + p.weight * 1.2}
            fill={layer.color}
            opacity={0.95}
          >
            <animate attributeName="r"
              values={`${1.2 + p.weight};${2.2 + p.weight * 1.4};${1.2 + p.weight}`}
              dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  );
}

function Toggle({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="tap w-full flex items-center gap-3 text-left">
      <div
        className="h-6 w-10 rounded-full relative shrink-0 transition-colors"
        style={{ background: value ? "var(--plugu-gold)" : "var(--border)" }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
          style={{ left: value ? "calc(100% - 22px)" : "2px" }}
        />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
    </button>
  );
}