import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Bell, CheckCheck, Trash2, ChevronRight } from "lucide-react";
import {
  markAllRead, markRead, clearAll, NOTIF_LABEL,
  type PluguNotification,
} from "@/lib/notifications-storage";
import { useNotifications } from "@/hooks/use-notifications";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — PlugU" },
      { name: "description", content: "Likes, comments, orders, referrals, rank changes and PlugU Daily — all in one inbox." },
    ],
  }),
  component: NotificationsPage,
});

function relative(t: number): string {
  const s = Math.max(1, Math.round((Date.now() - t) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d}d`;
}

function groupByDay(list: PluguNotification[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400_000;
  const groups: Record<string, PluguNotification[]> = { Today: [], Yesterday: [], Earlier: [] };
  for (const n of list) {
    if (n.createdAt >= today) groups.Today.push(n);
    else if (n.createdAt >= yesterday) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  }
  return groups;
}

function NotificationsPage() {
  const navigate = useNavigate();
  const { list, unread } = useNotifications();
  const groups = groupByDay(list);

  function openItem(n: PluguNotification) {
    markRead(n.id);
    if (n.href) navigate({ to: n.href as any });
  }

  return (
    <AppShell title="NOTIFICATIONS">
      <section className="px-5 pt-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: "var(--plugu-gold)" }}>Inbox</p>
            <h1 className="text-xl font-bold truncate">
              {unread > 0 ? `${unread} new` : "You're all caught up"}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { markAllRead(); toast.success("Marked all as read"); }}
              disabled={unread === 0}
              className="tap inline-flex items-center gap-1.5 text-[11px] px-3 py-2 rounded-full border border-border bg-secondary disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Read all
            </button>
            <button
              onClick={() => { clearAll(); toast("Cleared", { description: "Your inbox is empty." }); }}
              disabled={list.length === 0}
              className="tap inline-flex items-center gap-1.5 text-[11px] px-3 py-2 rounded-full border border-border bg-secondary disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>
      </section>

      {list.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Quiet on the wire"
          description="You'll get pings for likes, comments, orders, referrals, and rank changes."
          action={
            <Link
              to="/"
              className="text-xs font-semibold text-primary px-4 py-2 rounded-full border border-primary/40"
            >
              Back to home
            </Link>
          }
        />
      ) : (
        <div className="mt-5 pb-6">
          {Object.entries(groups).map(([label, items]) =>
            items.length === 0 ? null : (
              <div key={label} className="px-2 mb-5">
                <p className="px-3 mb-2 text-[10px] tracking-[0.22em] uppercase text-muted-foreground">{label}</p>
                <ul className="space-y-1.5">
                  {items.map((n, i) => (
                    <li
                      key={n.id}
                      style={{ animation: `plugu-fade-up 0.32s ease-out ${i * 30}ms both` }}
                    >
                      <button
                        onClick={() => openItem(n)}
                        className={`tap w-full text-left grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 rounded-2xl border transition-colors ${
                          n.read
                            ? "border-border bg-card"
                            : "border-primary/30 bg-card"
                        }`}
                        style={ n.read ? undefined : { boxShadow: "0 0 22px -18px var(--plugu-gold)" }}
                      >
                        <div className="relative h-10 w-10 shrink-0 grid place-items-center rounded-xl border border-border bg-[image:var(--gradient-bronze)] text-primary-foreground text-lg">
                          {n.emoji ?? "🔔"}
                          {!n.read && (
                            <span
                              className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card"
                              style={{ background: "var(--plugu-gold)" }}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm truncate ${n.read ? "font-medium" : "font-semibold"}`}>
                              {n.title}
                            </p>
                            <span className="shrink-0 text-[9px] tracking-widest uppercase text-muted-foreground/80">
                              {NOTIF_LABEL[n.kind]}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{n.body}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[10px] text-muted-foreground">{relative(n.createdAt)}</span>
                          {n.href && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      )}
    </AppShell>
  );
}