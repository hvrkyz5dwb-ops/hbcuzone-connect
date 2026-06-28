import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getSelectedPlan } from "@/lib/plan-storage";

export const Route = createFileRoute("/payment-success")({
  head: () => ({ meta: [{ title: "Plan Saved — PlugU" }] }),
  component: Success,
});

function Success() {
  const plan = getSelectedPlan();
  return (
    <AppShell title="SUCCESS">
      <section className="px-5 pt-10 text-center">
        <div className="mx-auto h-20 w-20 rounded-full grid place-items-center bg-[image:var(--gradient-bronze)] shadow-[var(--shadow-glow)]">
          <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">You're plugged in.</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {plan ? `${plan.name} ($${plan.price}) saved to your account.` : "Plan saved to your account."}
        </p>
        <p className="mt-3 text-xs text-muted-foreground max-w-xs mx-auto">
          Payments coming soon. We'll charge you once Stripe is connected — no action needed now.
        </p>

        <div className="mt-6 grid gap-2 max-w-xs mx-auto">
          <Link to="/manage-plan" className="py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-sm font-medium">
            View my plan
          </Link>
          <Link to="/" className="py-3 rounded-2xl bg-card border border-border text-sm">
            Back to feed
          </Link>
        </div>
      </section>
    </AppShell>
  );
}