import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, CheckCircle2, Circle, Ticket } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { seasonBySlug, ALL_SEASONS } from "@/lib/seasons";

export const Route = createFileRoute("/season/$slug")({
  head: () => ({ meta: [{ title: "Seasonal Campaign — PlugU" }] }),
  component: SeasonPage,
});

const STORE_KEY = "plugu.season.progress.v1";

type Progress = Record<string, { steps: boolean[]; badge?: boolean }>;

function readProgress(): Progress {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || "{}"); } catch { return {}; }
}
function writeProgress(p: Progress) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORE_KEY, JSON.stringify(p));
}

function SeasonPage() {
  const { slug } = Route.useParams();
  const season = seasonBySlug(slug);
  const [state, setState] = useState<{ steps: boolean[]; badge?: boolean }>({ steps: [] });

  useEffect(() => {
    if (!season) return;
    const p = readProgress();
    setState(p[season.key] ?? { steps: season.challenge.steps.map(() => false) });
  }, [season]);

  if (!season) {
    return (
      <AppShell title="SEASON">
        <div className="px-5 pt-10 text-center">
          <p className="text-sm text-muted-foreground">No campaign found.</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {ALL_SEASONS.map((s) => (
              <Link key={s.key} to="/season/$slug" params={{ slug: s.key }} className="tap text-[11px] px-3 py-1.5 rounded-full border border-border">
                {s.emoji} {s.label}
              </Link>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  function toggleStep(i: number) {
    if (!season) return;
    const steps = [...state.steps];
    steps[i] = !steps[i];
    const allDone = steps.every(Boolean);
    const next = { steps, badge: allDone || state.badge };
    setState(next);
    const map = readProgress();
    map[season.key] = next;
    writeProgress(map);
    if (allDone && !state.badge) {
      toast.success(`Badge unlocked: ${season.badge.label}`, { description: "It's now on your profile." });
    }
  }

  function copyPromo(code?: string) {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    toast.success(`Code ${code} copied`);
  }

  return (
    <AppShell title={season.label.toUpperCase()}>
      <section className="px-5 pt-5 slide-up">
        <Link to="/daily" className="tap inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3 w-3" /> Daily
        </Link>

        <div className="mt-3 rounded-3xl overflow-hidden border border-white/10 p-5"
          style={{ background: season.gradient }}
        >
          <p className="text-[10px] tracking-[0.32em] uppercase text-white/70">
            {season.emoji} {season.label} · {season.window}
          </p>
          <h1 className="mt-1 text-2xl font-bold plugu-antique-wordmark">{season.tagline}</h1>
          <p className="mt-1 text-xs text-white/80">{season.hero}</p>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-black/40 border border-white/10">
            <Sparkles className="h-3 w-3" style={{ color: season.accent }} />
            <span className="text-[11px] font-semibold">Badge: {season.badge.label}</span>
          </div>
        </div>
      </section>

      <section className="px-5 pt-5">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground">Promotions</p>
        <div className="mt-2 space-y-2">
          {season.promo.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-3.5 flex items-start gap-3 lift-card">
              <div className="h-10 w-10 grid place-items-center rounded-xl"
                style={{
                  background: `radial-gradient(circle at 30% 30%, color-mix(in oklab, ${season.accent} 40%, transparent), transparent)`,
                  border: `1px solid color-mix(in oklab, ${season.accent} 50%, transparent)`,
                }}
              >
                <Ticket className="h-4 w-4" style={{ color: season.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-[11px] text-muted-foreground">{p.body}</p>
              </div>
              {p.discount && (
                <button
                  onClick={() => copyPromo(p.discount)}
                  className="tap text-[10px] tracking-[0.2em] uppercase px-2.5 py-1.5 rounded-full border border-primary text-primary"
                >
                  {p.discount}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-5 pb-8">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground">Challenge</p>
        <div className="mt-2 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">{season.challenge.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Reward: {season.challenge.reward}</p>
          <ul className="mt-3 space-y-2">
            {season.challenge.steps.map((step, i) => {
              const done = !!state.steps[i];
              const Icon = done ? CheckCircle2 : Circle;
              return (
                <li key={step}>
                  <button
                    onClick={() => toggleStep(i)}
                    className="tap w-full flex items-center gap-2.5 text-left"
                  >
                    <Icon className="h-4 w-4 shrink-0" style={{ color: done ? season.accent : "var(--muted-foreground)" }} />
                    <span className={`text-[13px] ${done ? "line-through text-muted-foreground" : ""}`}>{step}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {state.badge && (
            <div className="mt-3 rounded-xl border border-primary/40 bg-primary/10 p-2.5 text-[11px] text-primary">
              ✅ {season.badge.label} unlocked. Rep it on your profile.
            </div>
          )}
        </div>
      </section>

      <div className="px-5 pb-8 flex gap-2 flex-wrap">
        {ALL_SEASONS.filter((s) => s.key !== season.key).slice(0, 4).map((s) => (
          <Link key={s.key} to="/season/$slug" params={{ slug: s.key }}
            className="tap text-[11px] px-3 py-1.5 rounded-full border border-border text-muted-foreground">
            {s.emoji} {s.label}
          </Link>
        ))}
      </div>
    </AppShell>
  );
}