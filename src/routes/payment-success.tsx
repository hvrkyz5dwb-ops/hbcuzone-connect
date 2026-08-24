import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ChargingLoader } from "@/components/ChargingLoader";
import { getSelectedPlan, saveSelectedPlan } from "@/lib/plan-storage";
import { resolvePlanKey } from "@/lib/plan-catalog";
import { setSellerPlan, type BillingCycle, type SellerTier } from "@/lib/seller-plan";
import { verifyPlanCheckout } from "@/lib/stripe.functions";
import { fireAchievement } from "@/components/AchievementBurst";

const search = z.object({ session_id: z.string().optional() });

export const Route = createFileRoute("/payment-success")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Payment Status — PlugU" }] }),
  component: Success,
});

type VerifyState = "idle" | "verifying" | "paid" | "unpaid" | "error";

function Success() {
  const { session_id } = Route.useSearch();
  const [state, setState] = useState<VerifyState>(session_id ? "verifying" : "idle");
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    if (!session_id) return;
    let cancelled = false;
    verifyPlanCheckout({ data: { sessionId: session_id } })
      .then((r) => {
        if (cancelled) return;
        if (!r.paid) {
          setState("unpaid");
          return;
        }
        const plan = resolvePlanKey(r.planKey);
        const name = plan?.name ?? r.planKey;
        saveSelectedPlan({ key: r.planKey, name, price: r.amountCents / 100 });
        if (plan?.kind === "membership" && plan.tier && plan.cycle) {
          setSellerPlan(plan.tier as SellerTier, plan.cycle as BillingCycle);
        }
        setPlanName(name);
        setState("paid");
        fireAchievement({
          title: `${name} activated`,
          subtitle: "Payment confirmed. Your plug just leveled up.",
        });
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [session_id]);

  const plan = getSelectedPlan();

  return (
    <AppShell title="PAYMENT">
      <section className="px-5 pt-10 text-center">
        {state === "verifying" && (
          <>
            <div className="grid place-items-center">
              <ChargingLoader size={56} />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Confirming your payment…</h1>
            <p className="mt-1 text-sm text-muted-foreground">Checking with Stripe. One moment.</p>
          </>
        )}

        {state === "paid" && (
          <>
            <div className="mx-auto h-20 w-20 rounded-full grid place-items-center bg-[image:var(--gradient-bronze)] shadow-[var(--shadow-glow)]">
              <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Payment confirmed.</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {planName ? `${planName} is now active on your account.` : "Your purchase is active."}
            </p>
          </>
        )}

        {state === "unpaid" && (
          <>
            <div className="mx-auto h-20 w-20 rounded-full grid place-items-center bg-card border border-border">
              <XCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Payment didn't complete</h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              No charge was made. You can retry checkout whenever you're ready.
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mx-auto h-20 w-20 rounded-full grid place-items-center bg-card border border-border">
              <XCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Couldn't verify payment</h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
              If your card was charged, contact support and we'll activate your plan right away.
            </p>
          </>
        )}

        {state === "idle" && (
          <>
            <div className="mx-auto h-20 w-20 rounded-full grid place-items-center bg-[image:var(--gradient-bronze)] shadow-[var(--shadow-glow)]">
              <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">You're plugged in.</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {plan ? `${plan.name} is saved to your account.` : "Your plan is saved to your account."}
            </p>
          </>
        )}

        <div className="mt-6 grid gap-2 max-w-xs mx-auto">
          {(state === "unpaid" || state === "error") && (
            <Link to="/orders" className="py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-sm font-medium">
              Back to my orders
            </Link>
          )}
          {state === "error" && (
            <Link to="/support" className="py-3 rounded-2xl bg-card border border-border text-sm">
              Contact support
            </Link>
          )}
          {(state === "paid" || state === "idle") && (
            <Link to="/orders" className="py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-sm font-medium">
              View my orders
            </Link>
          )}
          <Link to="/" className="py-3 rounded-2xl bg-card border border-border text-sm">
            Back to feed
          </Link>
        </div>
      </section>
    </AppShell>
  );
}