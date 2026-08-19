import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useMyBusiness } from "@/hooks/use-business";
import { AppShell, SectionHeader } from "@/components/AppShell";
import { PageLoader } from "@/components/QueryStates";
import { Store, Rocket, Plus, Pencil, ExternalLink, ShoppingBag, Star, Sparkles, BadgeCheck, CircleDollarSign, AlertTriangle, BarChart3, Users, Repeat } from "lucide-react";
import { getStripeStatus, getMyPayoutAccount, createSellerOnboardingLink, syncPayoutAccount } from "@/lib/stripe.functions";
import { AvailableNowControl } from "@/components/seller/AvailableNowControl";
import { DropComposer } from "@/components/seller/DropComposer";

export const Route = createFileRoute("/seller/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Seller dashboard — PlugU" },
      { name: "description", content: "Manage your PlugU business: listings, orders, and reputation." },
    ],
  }),
  component: SellerDashboard,
});

function SellerDashboard() {
  const { user } = useSession();
  const { business, loading } = useMyBusiness();
  const fetchStripeStatus = useServerFn(getStripeStatus);
  const fetchPayoutAccount = useServerFn(getMyPayoutAccount);
  const stripeStatusQ = useQuery({
    queryKey: ["stripe-status"],
    queryFn: () => fetchStripeStatus(),
  });
  const payoutQ = useQuery({
    queryKey: ["payout-account", user?.id ?? null],
    enabled: !!user?.id,
    retry: false,
    queryFn: () => fetchPayoutAccount(),
  });
  const startOnboarding = useServerFn(createSellerOnboardingLink);
  const syncPayout = useServerFn(syncPayoutAccount);
  const [busy, setBusy] = useState(false);

  const stats = useQuery({
    queryKey: ["seller-stats", business?.id ?? null, user?.id ?? null],
    enabled: !!business?.id,
    queryFn: async () => {
      const bizId = business!.id;
      const [listings, orders, rows] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("business_id", bizId),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_user_id", user!.id),
        supabase.from("orders").select("buyer_user_id,total_cents,payment_status").eq("seller_user_id", user!.id).limit(500),
      ]);
      const paid = (rows.data ?? []).filter((r) => r.payment_status === "paid");
      const revenue = paid.reduce((s, r) => s + (r.total_cents ?? 0), 0);
      const byBuyer = new Map<string, number>();
      for (const r of rows.data ?? []) byBuyer.set(r.buyer_user_id, (byBuyer.get(r.buyer_user_id) ?? 0) + 1);
      const repeat = [...byBuyer.values()].filter((c) => c > 1).length;
      return {
        listings: listings.count ?? 0,
        orders: orders.count ?? 0,
        revenue,
        buyers: byBuyer.size,
        repeat,
      };
    },
  });

  if (loading) {
    return (
      <AppShell title="SELLER">
        <PageLoader message="Loading your dashboard…" />
      </AppShell>
    );
  }

  async function openStripeOnboarding() {
    if (busy) return;
    setBusy(true);
    try {
      const origin = window.location.origin;
      const { url } = await startOnboarding({
        data: { returnUrl: `${origin}/seller?stripe=return`, refreshUrl: `${origin}/seller?stripe=refresh` },
      });
      window.location.href = url;
    } catch (err) {
      toast.error("Couldn't start Stripe onboarding", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  if (!business) {
    return (
      <AppShell title="SELLER">
        <section className="p-5">
          <div className="rounded-3xl border border-border bg-card p-6 text-center">
            <Store className="h-8 w-8 text-primary mx-auto" />
            <h1 className="mt-3 text-lg font-bold">Turn your hustle into a Plug business</h1>
            <p className="mt-1 text-sm text-muted-foreground">Set up in under 3 minutes. Your progress saves as you go.</p>
            <Link to="/seller/onboarding" className="mt-5 inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <Sparkles className="h-4 w-4" /> Become a seller
            </Link>
          </div>
        </section>
      </AppShell>
    );
  }

  const isDraft = !business.is_active || business.onboarding_step < 5;

  return (
    <AppShell title="SELLER">
      <section className="p-5">
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="h-14 w-14 rounded-2xl bg-secondary border border-border grid place-items-center overflow-hidden">
              {business.avatar_url
                ? <img src={business.avatar_url} alt="" className="h-full w-full object-cover" />
                : <Store className="h-6 w-6 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">{business.name}</h1>
              <p className="text-[11px] text-muted-foreground truncate">
                {business.category ?? "Uncategorized"} · {business.campus_name ?? "—"}
              </p>
              <span className={`mt-1.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${isDraft ? "border-border text-muted-foreground" : "border-primary/40 text-primary"}`}>
                {isDraft ? "Draft" : "Active"}
              </span>
            </div>
          </div>

          {isDraft && (
            <Link to="/seller/onboarding" className="mt-4 flex items-center justify-between rounded-2xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm">
              <span>Finish setup ({business.onboarding_step}/5)</span>
              <span className="text-primary font-semibold">Continue →</span>
            </Link>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatCard icon={ShoppingBag} label="Listings" value={stats.data?.listings ?? 0} />
          <StatCard icon={Store} label="Orders" value={stats.data?.orders ?? 0} />
          <StatCard
            icon={CircleDollarSign}
            label="Revenue"
            value={stats.data ? `$${(stats.data.revenue / 100).toFixed(0)}` : "—"}
          />
          <StatCard icon={Star} label="Rating" value={(business as unknown as { rating_avg?: number }).rating_avg ?? "—"} />
          <StatCard icon={Users} label="Buyers" value={stats.data?.buyers ?? 0} />
          <StatCard icon={Repeat} label="Repeat" value={stats.data?.repeat ?? 0} />
        </div>

        <div className="-mx-5 mt-4 space-y-3">
          <AvailableNowControl />
          <DropComposer />
        </div>

        <SectionHeader title="Payouts" />
        <StripePayoutCard
          configured={!!stripeStatusQ.data?.configured}
          mode={stripeStatusQ.data?.mode ?? null}
          payout={payoutQ.data ?? null}
          busy={busy}
          onConnect={openStripeOnboarding}
          onSync={async () => {
            try { await syncPayout({}); await payoutQ.refetch(); toast.success("Payout status refreshed"); }
            catch (err) { toast.error("Couldn't refresh", { description: (err as Error).message }); }
          }}
        />

        <SectionHeader title="Actions" />
        <div className="grid gap-2 px-1">
          <ActionRow to="/seller/listings" icon={Plus} label="Manage listings" hint="Create, pause, delete or edit" />
          <ActionRow to="/seller/analytics" icon={BarChart3} label="Seller analytics" hint="Views, sales, conversion, tier ROI" />
          <ActionRow to="/seller/onboarding" icon={Pencil} label="Edit business" hint="Category, campus, policies, contact" />
          <ActionRow to="/promote" icon={Rocket} label="Promote & boost" hint="Get seen across campus" />
          <ActionRow to="/business" icon={ExternalLink} label="Full business center" hint="Analytics, revenue, discounts, plan" />
        </div>
      </section>
    </AppShell>
  );
}

function StripePayoutCard({
  configured, mode, payout, busy, onConnect, onSync,
}: {
  configured: boolean;
  mode: "test" | "live" | null;
  payout: { external_id: string | null; status: string; charges_enabled: boolean; payouts_enabled: boolean; details_submitted: boolean; onboarding_url: string | null } | null;
  busy: boolean;
  onConnect: () => void;
  onSync: () => void;
}) {
  if (!configured) {
    return (
      <div className="mx-1 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-300" />
          <p className="text-sm font-semibold text-amber-100">Payouts unavailable</p>
        </div>
        <p className="mt-1 text-[11px] text-amber-200/80">
          PlugU hasn't finished connecting Stripe yet. You can list items and reserve orders, but no card will be charged and no payouts will be sent until Stripe is live.
        </p>
      </div>
    );
  }
  const connected = !!payout?.external_id;
  const ready = !!payout?.charges_enabled && !!payout?.payouts_enabled;
  return (
    <div className="mx-1 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <CircleDollarSign className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">Stripe Connect · {mode === "live" ? "Live" : "Test"} mode</p>
        {ready && <BadgeCheck className="h-4 w-4 text-emerald-400 ml-auto" />}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {!connected && "Connect Stripe to receive payouts. Takes about 3 minutes."}
        {connected && !ready && "Onboarding started — a few more details are needed before you can receive payouts."}
        {ready && "You're ready to receive payouts. Buyers can check out on your listings."}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          disabled={busy}
          onClick={onConnect}
          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-60"
        >
          {!connected ? "Connect Stripe" : ready ? "Update payout details" : "Continue onboarding"}
        </button>
        {connected && (
          <button onClick={onSync} className="px-3 py-2.5 rounded-xl border border-border bg-secondary text-xs">
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Store; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center">
      <Icon className="h-4 w-4 text-primary mx-auto" />
      <p className="mt-1 text-lg font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function ActionRow({ to, icon: Icon, label, hint }: { to: string; icon: typeof Store; label: string; hint: string }) {
  return (
    <Link to={to as "/market"} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-[11px] text-muted-foreground">{hint}</span>
      </span>
      <span className="text-muted-foreground">›</span>
    </Link>
  );
}