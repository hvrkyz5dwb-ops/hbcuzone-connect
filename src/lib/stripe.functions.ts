// Stripe Connect server functions. Every function checks configuration
// and throws an honest error when STRIPE_SECRET_KEY is not set — we
// never fake a successful payment.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Public config probe — safe for unauthenticated callers.
export const getStripeStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { stripeConfigured, stripeMode } = await import("./stripe.server");
  const configured = stripeConfigured();
  return {
    configured,
    mode: stripeMode(),
    webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
  };
});

// Seller-facing payout account status.
export const getMyPayoutAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("payout_accounts")
      .select("id,provider,external_id,status,charges_enabled,payouts_enabled,details_submitted,onboarding_url,last_synced_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    return data;
  });

// Create-or-refresh Stripe Connect Express onboarding link for the current seller.
export const createSellerOnboardingLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((v) => z.object({ returnUrl: z.string().url(), refreshUrl: z.string().url() }).parse(v))
  .handler(async ({ data, context }) => {
    const { stripeConfigured, stripeFetch } = await import("./stripe.server");
    if (!stripeConfigured()) {
      throw new Error("Stripe is not configured yet. Add STRIPE_SECRET_KEY to enable seller onboarding.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Look up (or create) the connected account for this user.
    const { data: existing } = await supabaseAdmin
      .from("payout_accounts")
      .select("*")
      .eq("user_id", context.userId)
      .eq("provider", "stripe")
      .maybeSingle();

    let accountId = existing?.external_id ?? null;
    if (!accountId) {
      const acct = await stripeFetch<{ id: string }>("/accounts", {
        method: "POST",
        body: {
          type: "express",
          capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
          metadata: { plugu_user_id: context.userId },
        },
      });
      accountId = acct.id;
      await supabaseAdmin.from("payout_accounts").insert({
        user_id: context.userId,
        provider: "stripe",
        external_id: accountId,
        status: "pending",
      });
    }

    const link = await stripeFetch<{ url: string }>("/account_links", {
      method: "POST",
      body: {
        account: accountId,
        return_url: data.returnUrl,
        refresh_url: data.refreshUrl,
        type: "account_onboarding",
      },
    });

    await supabaseAdmin
      .from("payout_accounts")
      .update({ onboarding_url: link.url, last_synced_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .eq("provider", "stripe");

    return { url: link.url };
  });

// Sync live status from Stripe into payout_accounts.
export const syncPayoutAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { stripeConfigured, stripeFetch } = await import("./stripe.server");
    if (!stripeConfigured()) throw new Error("Stripe is not configured yet.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: acct } = await supabaseAdmin
      .from("payout_accounts")
      .select("external_id")
      .eq("user_id", context.userId)
      .eq("provider", "stripe")
      .maybeSingle();
    if (!acct?.external_id) return null;
    const s = await stripeFetch<{
      charges_enabled: boolean; payouts_enabled: boolean; details_submitted: boolean;
    }>(`/accounts/${acct.external_id}`);
    const status = s.charges_enabled && s.payouts_enabled ? "active" : "pending";
    await supabaseAdmin.from("payout_accounts").update({
      charges_enabled: s.charges_enabled,
      payouts_enabled: s.payouts_enabled,
      details_submitted: s.details_submitted,
      status,
      last_synced_at: new Date().toISOString(),
    }).eq("user_id", context.userId).eq("provider", "stripe");
    return { charges_enabled: s.charges_enabled, payouts_enabled: s.payouts_enabled, status };
  });

// Create a Stripe Checkout Session for an existing PlugU order.
// The order must already exist (created by the secure RPC) so the amounts
// are canonical and cannot be tampered with from the client.
export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((v) => z.object({
    orderId: z.string().uuid(),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
  }).parse(v))
  .handler(async ({ data, context }) => {
    const { stripeConfigured, stripeFetch } = await import("./stripe.server");
    if (!stripeConfigured()) {
      throw new Error("Stripe is not configured yet. Checkout is unavailable in this environment.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await context.supabase
      .from("orders")
      .select("id,buyer_user_id,seller_user_id,total_cents,platform_fee_cents,payment_status,stripe_checkout_session_id,listing_id")
      .eq("id", data.orderId)
      .maybeSingle();
    if (error) throw error;
    if (!order) throw new Error("Order not found");
    if (order.buyer_user_id !== context.userId) throw new Error("Not your order");
    if (order.payment_status === "captured" || order.payment_status === "held") {
      throw new Error("This order has already been paid.");
    }

    // Idempotency: reuse existing session id if one is already attached.
    if (order.stripe_checkout_session_id) {
      const existing = await stripeFetch<{ url: string; id: string; status: string }>(
        `/checkout/sessions/${order.stripe_checkout_session_id}`,
      );
      if (existing.status === "open" && existing.url) return { url: existing.url, sessionId: existing.id };
    }

    const { data: seller } = await supabaseAdmin
      .from("payout_accounts")
      .select("external_id,charges_enabled")
      .eq("user_id", order.seller_user_id)
      .eq("provider", "stripe")
      .maybeSingle();
    if (!seller?.external_id || !seller.charges_enabled) {
      throw new Error("Seller hasn't finished Stripe onboarding yet — checkout unavailable.");
    }

    const { data: listing } = await context.supabase
      .from("listings").select("title").eq("id", order.listing_id!).maybeSingle();

    const session = await stripeFetch<{ id: string; url: string }>("/checkout/sessions", {
      method: "POST",
      idempotencyKey: `order_${order.id}`,
      body: {
        mode: "payment",
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        client_reference_id: order.id,
        payment_intent_data: {
          application_fee_amount: order.platform_fee_cents,
          transfer_data: { destination: seller.external_id },
          metadata: { plugu_order_id: order.id },
        },
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: order.total_cents,
            product_data: { name: listing?.title ?? "PlugU order" },
          },
        }],
        metadata: { plugu_order_id: order.id },
      },
    });

    await supabaseAdmin
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    return { url: session.url, sessionId: session.id };
  });

// Seller- or admin-initiated refund. Uses stored payment_intent_id.
export const refundOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((v) => z.object({ orderId: z.string().uuid(), reason: z.string().max(400).optional() }).parse(v))
  .handler(async ({ data, context }) => {
    const { stripeConfigured, stripeFetch } = await import("./stripe.server");
    if (!stripeConfigured()) throw new Error("Stripe is not configured yet.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order } = await context.supabase
      .from("orders")
      .select("id,seller_user_id,buyer_user_id,stripe_payment_intent_id,payment_status")
      .eq("id", data.orderId).maybeSingle();
    if (!order) throw new Error("Order not found");
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (order.seller_user_id !== context.userId && !isAdmin) throw new Error("Not allowed");
    if (!order.stripe_payment_intent_id) throw new Error("No payment to refund");

    const refund = await stripeFetch<{ id: string; status: string }>("/refunds", {
      method: "POST",
      idempotencyKey: `refund_${order.id}`,
      body: {
        payment_intent: order.stripe_payment_intent_id,
        refund_application_fee: true,
        reverse_transfer: true,
        metadata: { plugu_order_id: order.id, reason: data.reason ?? "" },
      },
    });

    await supabaseAdmin.from("orders").update({
      stripe_refund_id: refund.id,
      payment_status: "refunded",
      refunded_at: new Date().toISOString(),
    }).eq("id", order.id);

    return { refundId: refund.id, status: refund.status };
  });

// Create a Stripe Checkout Session for a plan purchase (seller membership,
// promotion boost, or Plug Reach™ package). The price is resolved
// server-side from the canonical plan catalog — the client only sends a
// plan key, so amounts cannot be tampered with.
export const createPlanCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((v) =>
    z.object({
      planKey: z.string().min(3).max(120),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { stripeConfigured, stripeFetch } = await import("./stripe.server");
    if (!stripeConfigured()) {
      throw new Error("Card payments are temporarily unavailable. Please try again later.");
    }
    const { resolvePlanKey } = await import("./plan-catalog");
    const plan = resolvePlanKey(data.planKey);
    if (!plan) throw new Error("That plan is no longer available.");

    const session = await stripeFetch<{ id: string; url: string }>("/checkout/sessions", {
      method: "POST",
      idempotencyKey: `plan_${context.userId}_${plan.key}`,
      body: {
        mode: "payment",
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: plan.unitAmountCents,
            product_data: { name: plan.name },
          },
        }],
        metadata: { plugu_plan_key: plan.key, plugu_user_id: context.userId },
      },
    });

    return { url: session.url, sessionId: session.id };
  });

// Verify a completed plan checkout after Stripe redirects back. Only the
// buyer who started the session can verify it, and activation happens
// only when Stripe reports the session as paid.
export const verifyPlanCheckout = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((v) => z.object({ sessionId: z.string().min(8).max(200) }).parse(v))
  .handler(async ({ data, context }) => {
    const { stripeConfigured, stripeFetch } = await import("./stripe.server");
    if (!stripeConfigured()) throw new Error("Payments are temporarily unavailable.");
    const s = await stripeFetch<{
      id: string;
      payment_status: string;
      amount_total: number | null;
      metadata?: Record<string, string>;
    }>(`/checkout/sessions/${data.sessionId}`);
    const planKey = s.metadata?.plugu_plan_key ?? null;
    if (!planKey || s.metadata?.plugu_user_id !== context.userId) {
      throw new Error("This payment doesn't belong to your account.");
    }
    return {
      paid: s.payment_status === "paid",
      planKey,
      amountCents: s.amount_total ?? 0,
    };
  });