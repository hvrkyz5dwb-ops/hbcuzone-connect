import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Radio, Zap, Store } from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useQueryClient } from "@tanstack/react-query";
import {
  PulseFeed, PulseFilterBar, FlashDropsRail, type PulseFilter,
} from "@/components/pulse/PulseFeed";
import { useCampusActivity } from "@/hooks/use-pulse";
import { useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/pulse")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "PlugU Pulse — what's happening on campus right now" },
      { name: "description", content: "Live campus activity: who's available now, flash drops, events tonight, and new student listings on your campus." },
      { property: "og:title", content: "PlugU Pulse — live campus activity" },
      { property: "og:description", content: "See who's available, what's dropping, and what's happening on your campus right now." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PulsePage,
});

function PulsePage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<PulseFilter>("all");
  const { profile } = useProfile();
  const activity = useCampusActivity();
  const hot = (activity.data ?? []).slice(0, 4);

  return (
    <AppShell title="PULSE">
      <PullToRefresh
        onRefresh={async () => {
          await Promise.all([
            qc.invalidateQueries({ queryKey: ["availability"] }),
            qc.invalidateQueries({ queryKey: ["drops"] }),
            qc.invalidateQueries({ queryKey: ["campus-activity"] }),
          ]);
        }}
      >
        <section className="px-5 pt-4">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em]" style={{ color: "var(--plugu-gold)" }}>
            <Radio className="h-3 w-3" /> Live on {profile?.school_name ?? "campus"}
          </p>
          <h1 className="mt-1.5 text-[20px] font-extrabold leading-[1.2]">
            What's happening <span style={{ color: "var(--plugu-gold)" }}>right now</span>
          </h1>
        </section>

        {hot.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {hot.map((z) => (
              <Link
                key={z.zone_name}
                to="/map"
                className="tap shrink-0 rounded-2xl border border-border bg-card px-3 py-2"
              >
                <p className="text-[11px] font-semibold">{z.zone_name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {z.total} active {z.total === 1 ? "signal" : "signals"}
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-3">
          <PulseFilterBar value={filter} onChange={setFilter} />
        </div>

        <section className="mt-4">
          <SectionHeader title="Flash drops" />
          <FlashDropsRail />
        </section>

        <section className="mt-2">
          <PulseFeed filter={filter} />
        </section>

        <section className="mb-6 mt-7 px-5">
          <Link
            to="/seller"
            className="tap flex items-center gap-3 rounded-3xl border border-primary/40 p-4"
            style={{ background: "var(--gradient-bronze)" }}
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-black/30">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-primary-foreground">Go live on Pulse</p>
              <p className="text-[11px] text-primary-foreground/80">
                Flip on Available Now or post a Drop — students see it instantly.
              </p>
            </div>
            <Store className="h-4 w-4 text-primary-foreground" />
          </Link>
        </section>
      </PullToRefresh>
    </AppShell>
  );
}
