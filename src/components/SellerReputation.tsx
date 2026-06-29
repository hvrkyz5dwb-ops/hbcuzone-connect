import { useState } from "react";
import { Clock, Repeat, ShoppingBag, Star, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { REACTIONS, myReputation, sampleReviews, type ReactionKind, type SocialReview } from "@/lib/reactions-data";

function ReactionBar({
  counts,
  active,
  onReact,
  size = "md",
}: {
  counts: Partial<Record<ReactionKind, number>>;
  active?: ReactionKind | null;
  onReact?: (k: ReactionKind) => void;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-2.5 py-1.5";
  return (
    <div className="flex flex-wrap gap-1.5">
      {REACTIONS.map((r) => {
        const n = counts[r.kind] ?? 0;
        const isActive = active === r.kind;
        return (
          <button
            key={r.kind}
            onClick={() => onReact?.(r.kind)}
            className={`tap rounded-full border transition-all ${cls} flex items-center gap-1 ${
              isActive
                ? "border-primary/60 bg-primary/15 text-foreground"
                : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
            }`}
            aria-label={r.label}
          >
            <span>{r.emoji}</span>
            <span className="tabular-nums">{n}</span>
          </button>
        );
      })}
    </div>
  );
}

function ReviewCard({ review }: { review: SocialReview }) {
  const [active, setActive] = useState<ReactionKind | null>(review.reaction);
  const [counts, setCounts] = useState(review.reactions);
  const onReact = (k: ReactionKind) => {
    setCounts((c) => {
      const next = { ...c };
      if (active) next[active] = Math.max(0, (next[active] ?? 1) - 1);
      if (active !== k) next[k] = (next[k] ?? 0) + 1;
      return next;
    });
    setActive(active === k ? null : k);
  };
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 grid place-items-center text-xs font-bold">
          {review.author.slice(0, 1)}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{review.author}</p>
          <p className="text-[11px] text-muted-foreground">{review.school} · {review.time}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-foreground/90 leading-relaxed">{review.text}</p>
      <div className="mt-3">
        <ReactionBar counts={counts} active={active} onReact={onReact} size="sm" />
      </div>
    </div>
  );
}

export function SellerReputation() {
  const r = myReputation;
  const total = Object.values(r.totals).reduce((a, b) => a + b, 0);
  return (
    <section className="px-5 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-tight">Seller Reputation</h2>
        <Link to="/trust" className="text-[11px] tracking-wider uppercase text-accent inline-flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Trust Center
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-end gap-4">
          <div>
            <p className="text-3xl font-extrabold leading-none flex items-center gap-1">
              {r.overall.toFixed(1)} <Star className="h-5 w-5 text-accent fill-accent" />
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{total} reactions</p>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-2 text-center">
            <Stat icon={ShoppingBag} value={String(r.sales)} label="Sales" />
            <Stat icon={Clock} value={r.responseTime} label="Response" />
            <Stat icon={Repeat} value={`${r.repeatCustomers}%`} label="Repeat" />
          </div>
        </div>

        <div className="mt-4">
          <ReactionBar counts={r.totals} />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {sampleReviews.map((rev) => (
          <ReviewCard key={rev.id} review={rev} />
        ))}
      </div>
    </section>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Star; value: string; label: string }) {
  return (
    <div className="rounded-xl bg-secondary/40 border border-border/60 py-2">
      <Icon className="h-3.5 w-3.5 mx-auto text-primary" />
      <p className="text-sm font-semibold mt-1">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}