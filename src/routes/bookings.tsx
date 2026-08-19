import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarClock, Check, X, ChevronRight, Clock } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { LoadingList } from "@/components/EmptyState";
import { ErrorState } from "@/components/QueryStates";
import { useMyOrders, useTransitionBooking } from "@/hooks/use-orders";
import { useSession } from "@/hooks/use-session";
import {
  BOOKING_STATUS_LABEL, statusToneClass, centsToDollars,
  type OrderWithExtras,
} from "@/lib/orders-db";

export const Route = createFileRoute("/bookings")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Bookings — PlugU" },
      { name: "description", content: "Your PlugU appointment schedule: confirm, decline and complete real campus service bookings." },
      { property: "og:title", content: "Bookings — PlugU" },
      { property: "og:description", content: "Manage your campus service appointments in one schedule." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookingsPage,
});

const OPEN_STATUSES = new Set(["pending", "accepted"]);

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - t0) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function bookingTime(o: OrderWithExtras): string {
  return o.booking?.slot_start ?? o.booking?.scheduled_at ?? o.created_at;
}

function BookingsPage() {
  const { user } = useSession();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const { data: orders, isPending, isError, refetch } = useMyOrders("all");
  const transition = useTransitionBooking();

  const groups = useMemo(() => {
    const now = Date.now();
    const rows = (orders ?? []).filter((o) => o.kind === "service" && o.booking);
    const filtered = rows.filter((o) => {
      const t = new Date(bookingTime(o)).getTime();
      const open = OPEN_STATUSES.has(o.booking!.status);
      return tab === "upcoming" ? t >= now && open : t < now || !open;
    });
    filtered.sort((a, b) => {
      const ta = new Date(bookingTime(a)).getTime();
      const tb = new Date(bookingTime(b)).getTime();
      return tab === "upcoming" ? ta - tb : tb - ta;
    });
    const map = new Map<string, OrderWithExtras[]>();
    for (const o of filtered) {
      const k = dayKey(bookingTime(o));
      const list = map.get(k) ?? [];
      list.push(o);
      map.set(k, list);
    }
    return [...map.entries()];
  }, [orders, tab]);

  async function act(o: OrderWithExtras, next: "accepted" | "declined" | "completed" | "cancelled") {
    try {
      await transition.mutateAsync({ id: o.booking!.id, orderId: o.id, next });
      toast.success(
        next === "accepted" ? "Booking confirmed" :
        next === "declined" ? "Booking declined" :
        next === "completed" ? "Marked complete" : "Booking cancelled",
      );
    } catch (err) {
      toast.error("Couldn't update booking", { description: (err as Error).message });
    }
  }

  return (
    <AppShell title="BOOKINGS">
      <section className="px-5 pt-5 pb-10">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="h-11 w-11 grid place-items-center rounded-2xl"
            style={{
              background: "linear-gradient(160deg, #1c1c1c, #0f0f0f)",
              border: "1px solid color-mix(in oklab, var(--plugu-gold) 40%, transparent)",
            }}
          >
            <CalendarClock className="h-5 w-5" style={{ color: "var(--plugu-gold)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Your schedule</h1>
            <p className="text-[11px] text-muted-foreground">Every appointment you booked or accepted.</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tap flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${
                tab === t ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
              }`}
            >
              {t === "upcoming" ? "Upcoming" : "History"}
            </button>
          ))}
        </div>

        {isPending ? (
          <LoadingList rows={4} />
        ) : isError ? (
          <ErrorState
            title="Schedule didn't load"
            description="We couldn't reach your bookings. Check your connection and try again."
            onRetry={() => void refetch()}
          />
        ) : groups.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-border p-8 text-center">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">
              {tab === "upcoming" ? "Nothing on the books" : "No past appointments"}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {tab === "upcoming"
                ? "Book a barber, nail tech, photographer or tutor on your campus and it shows up here."
                : "Completed and cancelled appointments will land here."}
            </p>
            <Link
              to="/market"
              className="mt-4 inline-block tap px-4 py-2 rounded-full text-[11px] font-semibold bg-[image:var(--gradient-bronze)] text-primary-foreground"
            >
              Find a service
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map(([key, items]) => (
              <div key={key}>
                <p className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground px-1">
                  {dayLabel(items[0] ? bookingTime(items[0]) : key)}
                </p>
                <ul className="mt-2 space-y-2.5">
                  {items.map((o) => {
                    const b = o.booking!;
                    const isSeller = user?.id === o.seller_user_id;
                    const start = new Date(bookingTime(o));
                    return (
                      <li key={o.id} className="rounded-2xl border border-border bg-card p-3">
                        <Link to="/orders/$id" params={{ id: o.id }} className="tap flex items-center gap-3">
                          <div className="w-14 shrink-0 text-center">
                            <p className="text-sm font-bold">{start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
                            <p className="text-[10px] text-muted-foreground">{b.duration_min} min</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{o.listing?.title ?? "Service"}</p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {isSeller ? "Client: " : "With "}
                              {o.counterparty?.display_name ?? o.counterparty?.username ?? "PlugU user"}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusToneClass(b.status)}`}>
                                {BOOKING_STATUS_LABEL[b.status]}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{centsToDollars(o.total_cents)}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>

                        {isSeller && b.status === "pending" && (
                          <div className="mt-2.5 flex gap-2">
                            <button
                              onClick={() => void act(o, "accepted")}
                              disabled={transition.isPending}
                              className="tap flex-1 py-2 rounded-xl text-[11px] font-semibold text-primary-foreground inline-flex items-center justify-center gap-1 disabled:opacity-60"
                              style={{ background: "var(--gradient-bronze)" }}
                            >
                              <Check className="h-3.5 w-3.5" /> Confirm
                            </button>
                            <button
                              onClick={() => void act(o, "declined")}
                              disabled={transition.isPending}
                              className="tap flex-1 py-2 rounded-xl text-[11px] font-semibold border border-border text-muted-foreground inline-flex items-center justify-center gap-1 disabled:opacity-60"
                            >
                              <X className="h-3.5 w-3.5" /> Decline
                            </button>
                          </div>
                        )}
                        {isSeller && b.status === "accepted" && (
                          <button
                            onClick={() => void act(o, "completed")}
                            disabled={transition.isPending}
                            className="tap mt-2.5 w-full py-2 rounded-xl text-[11px] font-semibold text-primary-foreground disabled:opacity-60"
                            style={{ background: "var(--gradient-bronze)" }}
                          >
                            Mark complete
                          </button>
                        )}
                        {!isSeller && OPEN_STATUSES.has(b.status) && (
                          <button
                            onClick={() => void act(o, "cancelled")}
                            disabled={transition.isPending}
                            className="tap mt-2.5 w-full py-2 rounded-xl text-[11px] font-semibold border border-border text-muted-foreground disabled:opacity-60"
                          >
                            Cancel appointment
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
