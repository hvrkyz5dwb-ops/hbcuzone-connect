import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Megaphone, MapPin, Check, Sparkles, ArrowLeft, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useSchool } from "@/hooks/use-school";
import { useProfile } from "@/hooks/use-profile";
import { generateCampusLayout } from "@/lib/campus-layout.functions";
import { addUserEvent } from "@/lib/events-storage";
import { toast } from "sonner";

export const Route = createFileRoute("/promote")({
  head: () => ({
    meta: [
      { title: "Promote Your Event — PlugU" },
      { name: "description", content: "Promote your on-campus event for free by pinning it to your campus map. Paid boosts get featured across PlugU." },
    ],
  }),
  component: PromotePage,
});

// Owner-tunable pricing. Adjust freely.
const BOOSTS = [
  { tier: 0, price: 0,  label: "Free · On-campus",      perk: "Pin one on-campus spot. Shows in Tonight & This Week." },
  { tier: 1, price: 3,  label: "$3 · Featured",         perk: "Bumped to the top of Events for 24h." },
  { tier: 2, price: 8,  label: "$8 · Home Slide",       perk: "Rotates on the Home slides for 48h." },
  { tier: 3, price: 20, label: "$20 · Campus Takeover", perk: "Home slide + top of Events for 5 days." },
];

function PromotePage() {
  const navigate = useNavigate();
  const school = useSchool();
  const profile = useProfile();
  const activeSchool = school.name && school.name !== "Your Campus" ? school.name : "your campus";
  const author = profile.data?.full_name?.split(" ")[0] || "Plug";

  const fn = useServerFn(generateCampusLayout);
  const q = useQuery({
    queryKey: ["campus-layout", activeSchool],
    queryFn: () => fn({ data: { school: activeSchool } }),
    staleTime: 1000 * 60 * 30,
    enabled: activeSchool !== "your campus",
  });
  const layout = q.data;

  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [spotId, setSpotId] = useState<string | null>(null);
  const [boost, setBoost] = useState<number>(0);

  const spot = useMemo(
    () => layout?.zones.find((z) => z.id === spotId) ?? null,
    [layout, spotId],
  );
  const canSubmit = title.trim().length >= 2 && when.trim().length >= 2 && !!spot;

  function submit() {
    if (!canSubmit || !spot) return;
    const chosen = BOOSTS.find((b) => b.tier === boost)!;
    addUserEvent({
      school: activeSchool,
      title: `${title.trim()}${author ? ` · by ${author}` : ""}`,
      when: when.trim(),
      where: spot.label,
      promoted: true,
      boost: chosen.tier,
      spot: { x: spot.x + spot.w / 2, y: spot.y + spot.h / 2, label: spot.label },
    });
    if (chosen.price > 0) {
      toast.success(`Promoted! ${chosen.label} boost queued.`);
    } else {
      toast.success("Live on your campus map & Tonight tab.");
    }
    navigate({ to: "/events" });
  }

  return (
    <AppShell title="PROMOTE">
      <section className="px-5 pt-5 space-y-4">
        <Link to="/" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3 w-3" /> Back
        </Link>

        <div className="rounded-3xl border border-border bg-card p-5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full blur-3xl opacity-40"
               style={{ background: "var(--plugu-gold)" }} />
          <div className="relative flex items-start gap-3">
            <div className="h-12 w-12 grid place-items-center rounded-2xl border border-white/10 text-2xl"
                 style={{ background: "color-mix(in oklab, var(--card) 60%, black)" }}>
              📣
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: "var(--plugu-gold)" }}>
                <Megaphone className="h-3 w-3 inline mr-1" /> Promote your event
              </p>
              <h1 className="mt-1 text-lg font-black leading-tight">
                On-campus events promote free at {activeSchool}
              </h1>
              <p className="text-[12px] text-muted-foreground mt-1">
                Pin a spot on your live campus map. Off-campus & business promos require a paid boost.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Event title</p>
          <input
            value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80}
            placeholder="Yard show, open mic, tailgate…"
            className="mt-1 w-full bg-secondary border border-border rounded-2xl px-4 py-3 text-sm outline-none"
          />
          <p className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">When</p>
          <input
            value={when} onChange={(e) => setWhen(e.target.value)} maxLength={40}
            placeholder="Tonight · 7pm  or  Fri · 8pm"
            className="mt-1 w-full bg-secondary border border-border rounded-2xl px-4 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              <MapPin className="h-3 w-3 inline mr-1" /> Pick your spot on campus
            </p>
            {spot && <span className="text-[11px] text-accent">{spot.emoji} {spot.label}</span>}
          </div>

          <div className="mt-2 rounded-2xl overflow-hidden border border-border"
               style={{ background: "radial-gradient(circle at 30% 20%, #1a1030 0%, #0a0616 70%)" }}>
            {q.isLoading && (
              <div className="aspect-[4/3] grid place-items-center">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-4 w-4 animate-pulse text-accent" />
                  Loading your campus map…
                </div>
              </div>
            )}
            {layout && (
              <svg viewBox="0 0 100 75" className="w-full h-auto block">
                {layout.paths.map((p) => (
                  <polyline key={p.id}
                    points={p.points.map((pt) => `${pt.x},${(pt.y * 75) / 100}`).join(" ")}
                    fill="none" stroke="rgba(201,162,74,0.5)" strokeWidth="0.5"
                    strokeDasharray="1.2 1" strokeLinecap="round" />
                ))}
                {layout.zones.map((z) => {
                  const y = (z.y * 75) / 100;
                  const h = (z.h * 75) / 100;
                  const active = z.id === spotId;
                  return (
                    <g key={z.id} onClick={() => setSpotId(z.id)} style={{ cursor: "pointer" }}>
                      <rect x={z.x} y={y} width={z.w} height={h} rx="1.2"
                        fill={active ? "#f5c94a" : "#2a2140"}
                        stroke={active ? "#f5c94a" : "rgba(201,162,74,0.5)"}
                        strokeWidth={active ? 0.8 : 0.35}
                        opacity={active ? 1 : 0.85} />
                      <text x={z.x + z.w / 2} y={y + h / 2 - 0.4} fontSize="2.2"
                        textAnchor="middle" fill={active ? "#0a0616" : "#f5e7c3"}>
                        {z.emoji}
                      </text>
                      <text x={z.x + z.w / 2} y={y + h / 2 + 2} fontSize="1.3"
                        textAnchor="middle" fill={active ? "#0a0616" : "#f5e7c3"} opacity="0.9"
                        style={{ fontWeight: 600 }}>
                        {z.label.length > 16 ? z.label.slice(0, 15) + "…" : z.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
            {!q.isLoading && !layout && (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Sign in with your school email to pin a spot on your campus map.
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Boost (optional)</p>
          <div className="mt-2 space-y-2">
            {BOOSTS.map((b) => {
              const active = boost === b.tier;
              return (
                <button
                  key={b.tier}
                  type="button"
                  onClick={() => setBoost(b.tier)}
                  className={`w-full text-left rounded-2xl border p-3 flex items-center gap-3 transition-colors ${
                    active ? "border-accent bg-accent/10" : "border-border bg-card"
                  }`}
                >
                  <div className="h-9 w-9 grid place-items-center rounded-xl border border-border">
                    {b.tier === 0 ? <Check className="h-4 w-4 text-accent" /> : <Zap className="h-4 w-4 text-accent" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold">{b.label}</p>
                    <p className="text-[11px] text-muted-foreground">{b.perk}</p>
                  </div>
                  {active && <span className="text-[10px] font-bold uppercase text-accent">Selected</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Paid boosts are a demo — checkout can be wired to Lovable Payments later.
          </p>
        </div>

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="tap w-full py-3.5 rounded-2xl text-sm font-bold text-primary-foreground disabled:opacity-40 mb-8"
          style={{ background: "var(--gradient-bronze)", boxShadow: "var(--shadow-glow)" }}
        >
          {boost === 0 ? "Promote for free" : `Promote · ${BOOSTS.find((b) => b.tier === boost)!.label}`}
        </button>
      </section>
    </AppShell>
  );
}