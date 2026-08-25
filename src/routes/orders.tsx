import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Package, ShieldCheck, ChevronRight, Receipt, Calendar } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LoadingList } from "@/components/EmptyState";
import { ErrorState } from "@/components/QueryStates";
import { useMyOrders } from "@/hooks/use-orders";
import {
  STATUS_LABEL, BOOKING_STATUS_LABEL, statusToneClass, centsToDollars,
  type OrderRole,
} from "@/lib/orders-db";

export const Route = createFileRoute("/orders")({
  ssr: false,
  head: () => ({ meta: [{ title: "Orders — PlugU" }] }),
  component: OrdersPage,
});

const ROLE_TABS: { key: OrderRole; label: string }[] = [
  { key: "buyer", label: "Buying" },
  { key: "seller", label: "Selling" },
  { key: "all", label: "All" },
];

const STATUS_FILTERS: { key: "all" | "active" | "completed" | "cancelled" | "disputed" | "bookings"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "bookings", label: "Bookings" },
  { key: "completed", label: "Completed" },
  { key: "disputed", label: "Disputed" },
  { key: "cancelled", label: "Cancelled" },
];

const ACTIVE_STATUSES = new Set(["pending","accepted","preparing","ready_for_pickup","out_for_delivery"]);

function OrdersPage() {
  const [role, setRole] = useState<OrderRole>("buyer");
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]["key"]>("all");
  const { data: orders, isPending, isError, refetch } = useMyOrders(role);

  const filtered = useMemo(() => {
    if (!orders) return [];
    switch (filter) {
      case "active": return orders.filter((o) => ACTIVE_STATUSES.has(o.status));
      case "completed": return orders.filter((o) => o.status === "completed");
      case "disputed": return orders.filter((o) => o.status === "disputed");
      case "cancelled": return orders.filter((o) => o.status === "cancelled" || o.status === "refunded");
      case "bookings": return orders.filter((o) => o.kind === "service");
      default: return orders;
    }
  }, [orders, filter]);

  return (
    <AppShell title="ORDERS">
      <section className="px-5 pt-5 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="h-11 w-11 grid place-items-center rounded-2xl"
            style={{
              background: "linear-gradient(160deg, #1c1c1c, #0f0f0f)",
              border: "1px solid color-mix(in oklab, var(--plugu-gold) 40%, transparent)",
            }}
          >
            <Receipt className="h-5 w-5" style={{ color: "var(--plugu-gold)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Your orders</h1>
            <p className="text-[11px] text-muted-foreground">Every purchase is Protected by PlugU.</p>
          </div>
          <Link
            to="/bookings"
            className="tap ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border border-border bg-card text-muted-foreground"
          >
            <Calendar className="h-3.5 w-3.5" /> Schedule
          </Link>
        </div>

        {/* Role toggle */}
        <div className="flex gap-2 mb-2">
          {ROLE_TABS.map((r) => (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
              className={`tap flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${
                role === r.key ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div tabIndex={0} className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STATUS_FILTERS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`tap shrink-0 px-3.5 py-1.5 rounded-full text-[11px] border transition-colors ${
                filter === t.key ? "border-accent bg-secondary text-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Reserved height keeps the page from jumping when orders resolve. */}
        <div className="min-h-[420px]">
        {isPending ? (
          <div className="mt-6"><LoadingList rows={5} /></div>

        ) : isError ? (
          <ErrorState
            title="Orders didn't load"
            description="We couldn't reach your order history. Check your connection and try again."
            onRetry={() => void refetch()}
          />
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border p-8 text-center">
            <Package className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No orders here yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {role === "seller" ? "New orders from buyers will show up here in real time." : "Head to the market and grab something from your campus."}
            </p>
            <Link
              to="/market"
              className="mt-4 inline-block tap px-4 py-2 rounded-full text-[11px] font-semibold bg-[image:var(--gradient-bronze)] text-primary-foreground"
            >
              Browse market
            </Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {filtered.map((o) => {
              const label = o.kind === "service" && o.booking
                ? BOOKING_STATUS_LABEL[o.booking.status]
                : STATUS_LABEL[o.status];
              const scheduled = o.booking?.slot_start;
              return (
                <li key={o.id}>
                  <Link
                    to="/orders/$id"
                    params={{ id: o.id }}
                    className="tap lift-card block rounded-2xl border border-border bg-card p-3"
                  >
                    <div className="flex items-center gap-3">
                      {o.listing?.image_url ? (
                        <img src={o.listing.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-secondary grid place-items-center">
                          {o.kind === "service" ? <Calendar className="h-5 w-5 text-muted-foreground"/> : <Package className="h-5 w-5 text-muted-foreground"/>}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{o.listing?.title ?? "Listing removed"}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {o.counterparty?.display_name ?? o.counterparty?.username ?? "PlugU user"}
                          {scheduled ? ` · ${new Date(scheduled).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : ""}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusToneClass(o.kind === "service" && o.booking ? o.booking.status : o.status)}`}>
                            {label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{centsToDollars(o.total_cents)}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        </div>



        <p className="mt-6 text-[10px] tracking-[0.25em] uppercase text-center text-muted-foreground inline-flex items-center gap-1 w-full justify-center">
          <ShieldCheck className="h-3 w-3" /> Protected by PlugU
        </p>
      </section>
    </AppShell>
  );
}