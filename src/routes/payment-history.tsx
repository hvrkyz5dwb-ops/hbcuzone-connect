import { createFileRoute, Link } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getPaymentHistory } from "@/lib/plan-storage";

export const Route = createFileRoute("/payment-history")({
  head: () => ({ meta: [{ title: "Payment History — PlugU" }] }),
  component: History,
});

function History() {
  const items = getPaymentHistory();
  return (
    <AppShell title="HISTORY">
      <section className="px-5 pt-5">
        <h1 className="text-lg font-semibold">Payment history</h1>
        <p className="text-xs text-muted-foreground mt-1">All your plan selections in one place.</p>

        {items.length === 0 ? (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <Receipt className="h-8 w-8 mx-auto mb-2 opacity-60" />
            No payments yet.
            <div className="mt-3">
              <Link to="/upgrade" className="text-primary">Browse plans →</Link>
            </div>
          </div>
        ) : (
          <ul className="mt-4 rounded-2xl bg-card border border-border divide-y divide-border">
            {items.map((p, i) => (
              <li key={i} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(p.selectedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${p.price}</p>
                  <span className="text-[10px] uppercase tracking-wider text-accent">{p.status}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}