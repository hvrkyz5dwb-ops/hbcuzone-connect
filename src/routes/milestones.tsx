import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Share2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { computeMilestones, type Milestone } from "@/lib/milestones";

export const Route = createFileRoute("/milestones")({
  head: () => ({ meta: [{ title: "Milestones — PlugU" }] }),
  component: MilestonesPage,
});

function MilestonesPage() {
  const [items, setItems] = useState<Milestone[]>([]);
  useEffect(() => { setItems(computeMilestones()); }, []);

  async function share(m: Milestone) {
    const text = `Just earned "${m.label}" on PlugU 🔌`;
    if (navigator.share) {
      try { await navigator.share({ title: "PlugU Milestone", text }); return; } catch {}
    }
    navigator.clipboard?.writeText(text);
    toast.success("Achievement copied — share anywhere");
  }

  const earned = items.filter((m) => m.earned);
  const pending = items.filter((m) => !m.earned);

  return (
    <AppShell title="MILESTONES">
      <section className="px-5 pt-5 slide-up">
        <div className="text-center">
          <p className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground">Business Milestones</p>
          <h1 className="mt-1 text-2xl font-bold plugu-antique-wordmark">Celebrate every W</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Automatic, shareable badges — every big number, every anniversary.
          </p>
        </div>

        {earned.length > 0 && (
          <>
            <p className="mt-6 text-[11px] tracking-[0.24em] uppercase text-muted-foreground">Earned</p>
            <div className="mt-2 grid grid-cols-2 gap-2.5">
              {earned.map((m) => (
                <Card key={m.key} m={m} onShare={() => share(m)} />
              ))}
            </div>
          </>
        )}

        <p className="mt-6 text-[11px] tracking-[0.24em] uppercase text-muted-foreground">Upcoming</p>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {pending.map((m) => <Card key={m.key} m={m} />)}
        </div>
      </section>
    </AppShell>
  );
}

function Card({ m, onShare }: { m: Milestone; onShare?: () => void }) {
  return (
    <div
      className="relative rounded-2xl p-4 lift-card overflow-hidden"
      style={{
        background: m.earned
          ? "linear-gradient(160deg, rgba(28,28,28,0.9), rgba(10,10,10,0.9))"
          : "var(--card)",
        border: m.earned ? `1px solid ${m.accent}` : "1px solid var(--border)",
        boxShadow: m.earned ? `0 0 30px -14px ${m.accent}` : "none",
      }}
    >
      <div
        className="h-11 w-11 grid place-items-center rounded-xl"
        style={{
          background: m.earned
            ? `radial-gradient(circle at 30% 25%, color-mix(in oklab, ${m.accent} 40%, transparent), transparent)`
            : "linear-gradient(160deg, #1c1c1c, #0f0f0f)",
          border: `1px solid color-mix(in oklab, ${m.accent} 40%, transparent)`,
        }}
      >
        <Award className="h-5 w-5" style={{ color: m.earned ? m.accent : "#666" }} />
      </div>
      <p className="mt-3 text-sm font-semibold">{m.label}</p>
      <p className="text-[11px] text-muted-foreground">{m.hint}</p>
      {m.earned && onShare && (
        <button
          onClick={onShare}
          className="tap mt-3 w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-full bg-secondary border border-border text-[10px] tracking-wide uppercase"
        >
          <Share2 className="h-3 w-3" /> Share
        </button>
      )}
    </div>
  );
}