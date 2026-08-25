import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { opportunities, opportunityMeta, type OpportunityKind } from "@/lib/opportunities-data";
import { SectionHeader } from "@/components/AppShell";

const ORDER: OpportunityKind[] = ["internship", "job", "scholarship", "research", "leadership", "volunteer"];

export function OpportunityRail() {
  return (
    <section className="mt-7">
      <SectionHeader title="Opportunities for you" action="See all" />
      <div tabIndex={0} className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ORDER.flatMap((k) =>
          opportunities.filter((o) => o.kind === k).slice(0, 1).map((o) => {
            const meta = opportunityMeta[o.kind];
            const Icon = meta.icon;
            const tint = meta.tone === "gold" ? "var(--plugu-gold)" : "var(--plugu-purple)";
            return (
              <Link
                key={o.id}
                to="/hub"
                className="tap min-w-[230px] rounded-3xl border border-border bg-card p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-9 w-9 grid place-items-center rounded-xl"
                    style={{ background: `color-mix(in oklab, ${tint} 18%, transparent)`, color: tint }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: tint }}>
                    {meta.label}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-snug line-clamp-2">{o.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{o.org}</p>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <span className="text-[11px] font-semibold text-primary">{o.meta}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </Link>
            );
          }),
        )}
      </div>
    </section>
  );
}