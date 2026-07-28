// Stripe webhook receiver. Verifies the Stripe-Signature header with the
// endpoint secret before touching any data. Every event is logged to
// webhook_events for audit and replay.

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook not configured", { status: 503 });

        const raw = await request.text();
        const sigHeader = request.headers.get("stripe-signature");

        const { verifyStripeSignature } = await import("@/lib/stripe.server");
        const ok = await verifyStripeSignature(raw, sigHeader, secret);
        if (!ok) return new Response("Invalid signature", { status: 400 });

        let event: { id: string; type: string; data: { object: Record<string, unknown> } };
        try { event = JSON.parse(raw); } catch { return new Response("Bad JSON", { status: 400 }); }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Idempotent insert; dedupe by (provider, event_id).
        const { error: insertErr } = await supabaseAdmin
          .from("webhook_events")
          .insert({ provider: "stripe", event_id: event.id, event_type: event.type, payload: event as never });
        if (insertErr && !`${insertErr.message}`.includes("duplicate")) {
          console.error("[stripe-webhook] log failed", insertErr);
        }

        try {
          const obj = event.data.object as Record<string, unknown>;
          const orderId =
            (obj.metadata as Record<string, string> | undefined)?.plugu_order_id ??
            (obj.client_reference_id as string | undefined);

          switch (event.type) {
            case "checkout.session.completed": {
              if (orderId) {
                await supabaseAdmin.from("orders").update({
                  stripe_payment_intent_id: (obj.payment_intent as string) ?? null,
                  payment_status: "held",
                  paid_at: new Date().toISOString(),
                }).eq("id", orderId);
              }
              break;
            }
            case "payment_intent.succeeded": {
              if (orderId) {
                await supabaseAdmin.from("orders").update({
                  stripe_payment_intent_id: obj.id as string,
                  stripe_charge_id: (obj.latest_charge as string) ?? null,
                  payment_status: "captured",
                  paid_at: new Date().toISOString(),
                }).eq("id", orderId);
              }
              break;
            }
            case "payment_intent.payment_failed": {
              if (orderId) {
                await supabaseAdmin.from("orders").update({ payment_status: "failed" }).eq("id", orderId);
              }
              break;
            }
            case "charge.refunded": {
              if (orderId) {
                await supabaseAdmin.from("orders").update({
                  payment_status: "refunded",
                  refunded_at: new Date().toISOString(),
                }).eq("id", orderId);
              }
              break;
            }
            case "charge.dispute.created": {
              if (orderId) {
                const { data: ord } = await supabaseAdmin
                  .from("orders").select("buyer_user_id").eq("id", orderId).maybeSingle();
                await supabaseAdmin.from("orders").update({ status: "disputed" }).eq("id", orderId);
                if (ord?.buyer_user_id) {
                  await supabaseAdmin.from("disputes").insert({
                    order_id: orderId,
                    opened_by: ord.buyer_user_id,
                    reason: `Stripe dispute ${obj.id ?? ""}`,
                    status: "open",
                  });
                }
              }
              break;
            }
            case "account.updated": {
              const acctId = obj.id as string;
              await supabaseAdmin.from("payout_accounts").update({
                charges_enabled: !!obj.charges_enabled,
                payouts_enabled: !!obj.payouts_enabled,
                details_submitted: !!obj.details_submitted,
                status: obj.charges_enabled && obj.payouts_enabled ? "active" : "pending",
                last_synced_at: new Date().toISOString(),
              }).eq("external_id", acctId).eq("provider", "stripe");
              break;
            }
            default:
              // logged but not acted on
              break;
          }

          await supabaseAdmin.from("webhook_events").update({
            processed: true, processed_at: new Date().toISOString(),
          }).eq("provider", "stripe").eq("event_id", event.id);
        } catch (err) {
          await supabaseAdmin.from("webhook_events").update({
            processing_error: (err as Error).message,
          }).eq("provider", "stripe").eq("event_id", event.id);
          console.error("[stripe-webhook] process failed", err);
          return new Response("Handler error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});