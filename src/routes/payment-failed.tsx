import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/payment-failed")({
  head: () => ({ meta: [{ title: "Payment Failed — PlugU" }] }),
  component: Failed,
});

function Failed() {
  return (
    <AppShell title="FAILED">
      <section className="px-5 pt-10 text-center">
        <div className="mx-auto h-20 w-20 rounded-full grid place-items-center bg-destructive/20 border border-destructive/40">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Payment couldn't process</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          Your card was declined or the connection dropped. No charge was made.
        </p>
        <div className="mt-6 grid gap-2 max-w-xs mx-auto">
          <Link to="/orders" className="py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-sm font-medium">
            Back to my orders
          </Link>
          <Link to="/support" className="py-3 rounded-2xl bg-card border border-border text-sm">
            Contact support
          </Link>
        </div>
      </section>
    </AppShell>
  );
}