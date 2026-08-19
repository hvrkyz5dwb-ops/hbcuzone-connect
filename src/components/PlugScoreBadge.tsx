import { useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import { computePlugScore, tierBlurb, type PlugScoreInput } from "@/lib/plugscore";

/** Compact PlugScore chip. Tap opens the real breakdown. */
export function PlugScoreBadge({
  profile,
  size = "sm",
  showLabel = true,
}: {
  profile: PlugScoreInput;
  size?: "xs" | "sm";
  showLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const s = computePlugScore(profile);
  const pad = size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(true); }}
        className={`tap inline-flex items-center gap-1 rounded-full border font-semibold ${pad}`}
        style={{ borderColor: `color-mix(in oklab, ${s.color} 45%, transparent)`, color: s.color, background: `color-mix(in oklab, ${s.color} 10%, transparent)` }}
        aria-label={`PlugScore ${s.isNew ? "not yet rated" : s.score} — ${s.tier}`}
      >
        <ShieldCheck className="h-3 w-3" />
        {s.isNew ? "New plug" : <>{s.score}{showLabel && <span className="opacity-80"> · {s.tier}</span>}</>}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-6"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-label="PlugScore breakdown"
        >
          <div
            className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl border border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">PlugScore</p>
                <p className="text-3xl font-bold" style={{ color: s.color }}>
                  {s.isNew ? "—" : s.score}
                  <span className="text-sm font-semibold ml-2">{s.tier}</span>
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="tap p-1">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">{tierBlurb(s.tier)}</p>

            <div className="mt-4 space-y-3">
              {s.breakdown.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">{b.label}</span>
                    <span className="font-semibold">{b.value}/{b.max}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${(b.value / b.max) * 100}%`, background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
              PlugScore is calculated only from verified reviews, completed PlugU transactions,
              student verification, and account age. It can't be bought or boosted.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
