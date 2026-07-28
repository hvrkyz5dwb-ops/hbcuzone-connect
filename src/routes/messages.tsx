import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MessageSquare, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useConversations } from "@/hooks/use-messages";
import { PullToRefresh } from "@/components/PullToRefresh";
import { LoadingList, EmptyState } from "@/components/EmptyState";
import { VerifiedStudentBadge } from "@/components/VerifiedStudentBadge";
import { formatPrice } from "@/lib/categories";
import type { PriceType } from "@/lib/categories";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Inbox — PlugU" },
      { name: "description", content: "Direct message students, vendors, and sellers in real time." },
      { property: "og:title", content: "PlugU Inbox" },
      { property: "og:description", content: "Direct message students and vendors." },
    ],
  }),
  component: Messages,
});

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

function Messages() {
  const { data: threads, isPending, refetch } = useConversations();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const list = threads ?? [];
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter((t) => {
      const name = (t.other?.display_name ?? t.other?.username ?? "").toLowerCase();
      const listing = (t.listing?.title ?? "").toLowerCase();
      const preview = (t.last_message?.body ?? "").toLowerCase();
      return name.includes(q) || listing.includes(q) || preview.includes(q);
    });
  }, [threads, query]);

  return (
    <AppShell title="INBOX">
      <PullToRefresh onRefresh={async () => { await refetch(); }}>
      <section className="px-5 pt-5">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people or listings"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
        <p className="mt-2 px-1 text-[10px] text-muted-foreground inline-flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" style={{ color: "var(--plugu-gold)" }} /> Protected by PlugU · never pay off-platform
        </p>
      </section>

      {isPending ? (
        <div className="mt-4"><LoadingList rows={5} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations"
          description="Tap “Message” on any listing to start chatting with the seller."
        />
      ) : (
      <ul className="mt-4 px-2 slide-up">
        {filtered.map((t, i) => {
          const name = t.other?.display_name ?? t.other?.username ?? "PlugU user";
          const unread = t.unread_count > 0;
          const preview = t.last_message?.body ?? (t.listing ? `About: ${t.listing.title}` : "Say hello 👋");
          const time = timeAgo(t.last_message?.created_at ?? t.updated_at);
          const verified = t.other?.verification_status === "verified";
          return (
            <li key={t.id} style={{ animation: `plugu-fade-up 0.35s ease-out ${i * 40}ms both` }}>
              <Link
                to="/messages/$id"
                params={{ id: t.id }}
                className="tap w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-card transition-colors text-left"
              >
                <div className="relative h-12 w-12 shrink-0">
                  {t.other?.avatar_url ? (
                    <img src={t.other.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                      {name[0]?.toUpperCase()}
                    </div>
                  )}
                  {unread && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-[10px] font-bold text-black grid place-items-center border-2 border-background">
                      {t.unread_count > 9 ? "9+" : t.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm inline-flex items-center gap-1 truncate ${unread ? "font-semibold" : "font-medium"}`}>
                      <span className="truncate">{name}</span>
                      {verified && <VerifiedStudentBadge size="xs" iconOnly />}
                    </p>
                    <span className="text-[11px] text-muted-foreground shrink-0">{time}</span>
                  </div>
                  {t.listing && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      RE: {t.listing.title} · {formatPrice(t.listing.price_cents, t.listing.price_type as PriceType)}
                    </p>
                  )}
                  <p className={`text-xs truncate ${unread ? "text-foreground" : "text-muted-foreground"}`}>{preview}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      )}
      </PullToRefresh>
    </AppShell>
  );
}