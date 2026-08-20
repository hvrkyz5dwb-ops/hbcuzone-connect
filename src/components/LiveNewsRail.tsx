import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, Radio } from "lucide-react";
import { getLiveNews } from "@/lib/live-feeds.functions";

type Props = {
  topic: string;
  school?: string;
  count?: number;
  /** ms between auto refetches; default 10 min */
  refreshMs?: number;
};

/** Real headlines pulled from live newsroom wires (Google News aggregation). */
export function LiveNewsRail({ topic, school, count = 4, refreshMs = 10 * 60_000 }: Props) {
  const fn = useServerFn(getLiveNews);
  const { data, isPending, isFetching, refetch } = useQuery({
    queryKey: ["live-news-rail", topic, school ?? "", count],
    queryFn: () => fn({ data: { topic, school, count } }),
    staleTime: refreshMs,
    refetchOnWindowFocus: false,
  });
  const items = data?.items ?? [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Radio className="h-3 w-3" style={{ color: "var(--plugu-gold)" }} />
          Live wire
          {isFetching && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400 plugu-pulse" />}
        </p>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="tap inline-flex items-center gap-1 text-[11px] text-accent"
        >
          <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {isPending && (
        <ul className="space-y-2">
          {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
            <li key={i} className="h-14 rounded-2xl border border-border bg-card animate-pulse" />
          ))}
        </ul>
      )}

      {!isPending && items.length === 0 && (
        <p className="rounded-2xl border border-border bg-card p-3 text-[11px] text-muted-foreground">
          No live stories on this wire right now.
        </p>
      )}

      <ul className="space-y-1.5">
        {items.map((n) => (
          <li key={n.id}>
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="tap block rounded-2xl border border-border bg-card px-3.5 py-2.5"
            >
              <p className="text-[13px] font-semibold leading-snug line-clamp-2">{n.headline}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                {n.source} · {n.time} ago
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
