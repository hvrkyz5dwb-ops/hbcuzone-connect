import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, Sparkles, ExternalLink } from "lucide-react";
import { generateNews, type AiNewsItem } from "@/lib/ai-news.functions";
import { useProfile } from "@/hooks/use-profile";
import { recordInterest, topInterests } from "@/lib/interests";

type Props = {
  category: string;
  school?: string;
  count?: number;
  /** ms between auto refetches; default 10 min */
  refreshMs?: number;
  /** compact list vs cards */
  compact?: boolean;
  /** fallback items shown if AI errors out */
  fallback?: AiNewsItem[];
};

export function useAiNews(category: string, school?: string, count = 8, refreshMs = 10 * 60_000) {
  const fn = useServerFn(generateNews);
  const { profile } = useProfile();
  const major = profile?.major ?? undefined;
  // Snapshot the student's tapped topics once per mount so the query key stays stable.
  const interests = useMemo(() => topInterests(5), []);

  return useQuery({
    queryKey: ["ai-news", category, school ?? "", count, major ?? "", interests.join(",")],
    queryFn: () => fn({ data: { category, school, count, major, interests } }),
    staleTime: refreshMs,
    refetchInterval: refreshMs,
    refetchOnWindowFocus: false,
  });
}

export function AiNewsFeed({ category, school, count = 8, refreshMs, compact, fallback }: Props) {
  const { data, isLoading, isFetching, refetch, error } = useAiNews(category, school, count, refreshMs);

  const items = data?.items?.length ? data.items : (fallback ?? []);
  const showSkeleton = isLoading && items.length === 0;


  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3 w-3" style={{ color: "var(--plugu-gold)" }} />
          AI · Live feed
          {isFetching && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400 plugu-pulse" />}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1 text-[11px] text-accent tap"
          disabled={isFetching}
        >
          <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {showSkeleton && (
        <ul className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="p-3.5 rounded-2xl bg-card border border-border animate-pulse">
              <div className="h-3 w-24 bg-secondary rounded mb-2" />
              <div className="h-4 w-3/4 bg-secondary rounded mb-1.5" />
              <div className="h-3 w-full bg-secondary rounded" />
            </li>
          ))}
        </ul>
      )}

      {!showSkeleton && (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              onClick={() => recordInterest(n.tag || category)}
              className={`rounded-2xl bg-card border border-border tap ${compact ? "p-3" : "p-3.5"}`}
            >

              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{n.emoji}</span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--plugu-gold)" }}>
                  {n.tag}
                </span>
                <span className="text-[10px] text-muted-foreground">· {n.source} · {n.time}</span>
              </div>
              <p className="font-semibold mt-1 leading-snug text-sm">{n.headline}</p>
              {!compact && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.summary}</p>}
              {n.url && (
                <a
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-accent tap"
                >
                  Read more <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2">
          <p className="text-[11px] text-rose-300">AI feed temporarily unavailable.</p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="tap inline-flex items-center gap-1 text-[11px] text-rose-100 disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} /> Retry
          </button>
        </div>
      )}
    </div>
  );
}