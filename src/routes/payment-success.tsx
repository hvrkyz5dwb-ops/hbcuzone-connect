import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const search = z.object({ session_id: z.string().optional() });

export const Route = createFileRoute("/payment-success")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Payment Confirmed — PlugU" },
      { name: "description", content: "Your PlugU payment went through. Track the order and message the seller from your orders." },
      { property: "og:title", content: "Payment Confirmed — PlugU" },
      { property: "og:description", content: "Your marketplace payment is complete." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Success,
});

function Success() {
  return (
    <AppShell title="PAYMENT">
      <section className="px-5 pt-10 text-center">
        <div className="mx-auto h-20 w-20 rounded-full grid place-items-center bg-[image:var(--gradient-bronze)] shadow-[var(--shadow-glow)]">
          <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">You're all set.</h1>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          Your payment for this purchase is complete. Track delivery or pickup and message the
          seller from your orders.
        </p>

        <div className="mx-auto mt-6 grid max-w-xs gap-2">
          <Link
            to="/orders"
            className="rounded-2xl bg-[image:var(--gradient-bronze)] py-3 text-sm font-medium text-primary-foreground"
          >
            Go to my orders
          </Link>
          <Link to="/support" className="rounded-2xl border border-border bg-card py-3 text-sm">
            Something wrong? Contact support
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
