import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { listThreads, subscribeThreads, type ChatThread } from "@/lib/messages-storage";
import { PullToRefresh } from "@/components/PullToRefresh";
import { LoadingList, EmptyState } from "@/components/EmptyState";
import { VerifiedStudentBadge } from "@/components/VerifiedStudentBadge";

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

function Messages() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [threads, setThreads] = useState<ChatThread[]>([]);
  useEffect(() => {
    setThreads(listThreads());
    const off = subscribeThreads(() => setThreads(listThreads()));
    const t = setTimeout(() => setLoading(false), 500);
    return () => { clearTimeout(t); off(); };
  }, []);
  const filtered = threads.filter(
    (m) => !query || `${m.name} ${m.preview}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AppShell title="INBOX">
      <PullToRefresh onRefresh={async () => { setLoading(true); await new Promise(r => setTimeout(r, 600)); setLoading(false); }}>
      <section className="px-5 pt-5">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
      </section>

      {loading ? (
        <div className="mt-4"><LoadingList rows={5} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations"
          description="Reach out to a vendor from any listing to start chatting."
        />
      ) : (
      <ul className="mt-4 px-2 slide-up">
        {filtered.map((m, i) => (
          <li key={m.id} style={{ animation: `plugu-fade-up 0.35s ease-out ${i * 40}ms both` }}>
            <Link
              to="/messages/$id"
              params={{ id: m.id }}
              className="tap w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-card transition-colors text-left"
            >
              <div className="relative h-12 w-12 shrink-0">
                <div className="h-12 w-12 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                  {m.name[0]}
                </div>
                {m.unread && (
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-accent border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm inline-flex items-center gap-1 ${m.unread ? "font-semibold" : "font-medium"}`}>
                    {m.name}
                    <VerifiedStudentBadge size="xs" iconOnly />
                  </p>
                  <span className="text-[11px] text-muted-foreground">{m.time}</span>
                </div>
                <p className={`text-xs truncate ${m.unread ? "text-foreground" : "text-muted-foreground"}`}>{m.preview}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      )}
      </PullToRefresh>
    </AppShell>
  );
}