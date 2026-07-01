import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Package, ShieldCheck, ChevronRight, Receipt } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getOrders, paymentLabel, type Order, type OrderStatus } from "@/lib/orders-storage";
import { statusLabel } from "@/lib/trust-score";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Orders — PlugU" }] }),
  component: OrdersPage,
});

const TABS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "paid", label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "disputed", label: "Disputed" },
  { key: "refunded", label: "Refunded" },
];

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"all" | OrderStatus>("all");
  useEffect(() => { setOrders(getOrders()); }, []);
  const filtered = useMemo(() => {
    if (tab === "all") return orders;
    return orders.filter((o) => o.status === tab);
  }, [orders, tab]);

  return (
    <AppShell title="ORDERS">
      <section className="px-5 pt-5">
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
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`tap shrink-0 px-3.5 py-1.5 rounded-full text-[11px] border transition-colors ${
                tab === t.key
                  ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border p-8 text-center">
            <Package className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No orders yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Head to the market and grab something from your campus.
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
            {filtered.map((o) => (
              <li key={o.id}>
                <Link
                  to="/orders/$id"
                  params={{ id: o.id }}
                  className="tap lift-card block rounded-2xl border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    {o.image ? (
                      <img src={o.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-secondary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{o.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {o.seller} · {paymentLabel(o.method)}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <StatusChip status={o.status} />
                        <span className="text-[10px] text-muted-foreground">${o.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-[10px] tracking-[0.25em] uppercase text-center text-muted-foreground inline-flex items-center gap-1 w-full justify-center">
          <ShieldCheck className="h-3 w-3" /> Protected by PlugU
        </p>
      </section>
    </AppShell>
  );
}

function StatusChip({ status }: { status: OrderStatus }) {
  const color =
    status === "delivered" ? "#78d68d"
    : status === "disputed" ? "#e5a752"
    : status === "refunded" ? "#c9c9c9"
    : "var(--plugu-gold)";
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full border"
      style={{ borderColor: `color-mix(in oklab, ${color} 55%, transparent)`, color }}
    >
      {statusLabel({ status } as Order)}
    </span>
  );
}