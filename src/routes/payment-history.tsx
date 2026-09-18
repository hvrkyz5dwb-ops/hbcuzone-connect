import { createFileRoute, Link } from "@tanstack/react-router";
import { Receipt, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";

// PlugU sells no memberships, subscriptions, digital upgrades or paid
// promotion, so there is no billing history. Real money only moves between a
// buyer and a seller for physical goods and real-world services, and those
// receipts live with the order itself.
export const Route = createFileRoute("/payment-history")({
  head: () => ({
    meta: [
      { title: "Payment History — PlugU" },
      { name: "description", content: "Receipts for goods and services you bought from other students on PlugU." },
      { property: "og:title", content: "Payment History — PlugU" },
      { property: "og:description", content: "PlugU features are free. Receipts cover only student-to-student purchases." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: History,
});

function History() {
  return (
    <AppShell title="HISTORY">
      <section className="px-5 pt-5 max-w-lg mx-auto">
        <h1 className="text-lg font-semibold">Payment history</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Every PlugU feature is free. The only payments are what you pay another student for
          real-world goods and services, and each receipt lives with its order.
        </p>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Receipt className="h-8 w-8 mx-auto mb-2 opacity-60" />
          <p>Your receipts are on your orders.</p>
          <Link
            to="/orders"
            className="tap mt-4 inline-flex items-center justify-center gap-1 rounded-2xl bg-[image:var(--gradient-bronze)] px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            View your orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
