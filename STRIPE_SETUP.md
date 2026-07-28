# PlugU — Stripe Connect setup checklist

PlugU is wired for Stripe Connect (Express) marketplace payments. Until the
credentials below are configured, the checkout button reserves an order but
never charges a card — no user is misled into thinking a real payment
happened.

Do every step in **test mode** first. Only switch to live mode after the
full flow has been verified end-to-end.

## 1. Stripe dashboard

- [ ] Create (or log in to) a Stripe account.
- [ ] Toggle the dashboard to **Test mode**.
- [ ] Enable **Connect** → choose the **Platform** account type.
- [ ] In Connect settings, enable **Express** onboarding.
- [ ] Set your platform branding (name, icon, colors) so sellers see PlugU
      during onboarding.
- [ ] Under Connect → Settings → Payouts, enable "Full" access so sellers
      can withdraw to their bank.

## 2. Secrets to add in PlugU (Project Settings → Secrets)

All three are server-only; none of them ship to the browser.

- [ ] `STRIPE_SECRET_KEY` — the platform account's test secret key
      (`sk_test_...`). Later replace with `sk_live_...` for launch.
- [ ] `STRIPE_PUBLISHABLE_KEY` — optional; only needed if we add Stripe.js
      elements in the client. Safe to store as a public value.
- [ ] `STRIPE_WEBHOOK_SECRET` — the signing secret from the endpoint you
      register in step 3 (`whsec_...`).

> Do **not** paste any of these into `.env` or commit them. Add them via
> the in-app Secrets form so they land in the server runtime only.

## 3. Webhook endpoint

In Stripe dashboard → Developers → Webhooks → **Add endpoint**:

- [ ] URL: `https://<your-published-domain>/api/public/stripe-webhook`
      (for testing you can use the preview URL
      `https://project--<project-id>-dev.lovable.app/api/public/stripe-webhook`).
- [ ] Listen for the events:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
  - `charge.dispute.created`
  - `account.updated`
- [ ] Copy the endpoint's **Signing secret** into `STRIPE_WEBHOOK_SECRET`.

## 4. Seller onboarding (Connect Express)

- [ ] Sign in as a seller in PlugU.
- [ ] Go to `/seller` → **Connect Stripe** button.
- [ ] Complete Express onboarding using Stripe's test data
      (`000-000-0000` phone, `000000000` SSN, `Success` test address).
- [ ] Return to `/seller` — the payout card should read "You're ready to
      receive payouts". If not, tap **Refresh** to re-sync.

## 5. Buyer checkout dry-run

- [ ] As a different account, open any listing from a Stripe-connected
      seller and press **Pay**.
- [ ] Complete Stripe Checkout with test card `4242 4242 4242 4242`,
      any future expiry, any CVC, any ZIP.
- [ ] Confirm the order updates to `payment_status = held` then
      `captured` (visible in `/orders/<id>` timeline).
- [ ] Trigger a decline with card `4000 0000 0000 0002`; confirm the
      order flips to `payment_status = failed` and `/payment-failed`
      renders.

## 6. Refund + dispute

- [ ] From the Stripe dashboard, refund the successful test charge.
      Confirm PlugU marks the order `refunded` via webhook.
- [ ] From the Stripe dashboard, simulate a dispute (test cards
      `4000 0000 0000 0259`). Confirm a matching row appears in the
      Disputes tab under `/admin`.

## 7. Go live

Only after every checkbox above passes:

- [ ] Activate the Stripe account for live payments.
- [ ] Replace `STRIPE_SECRET_KEY` with the live key.
- [ ] Register a **second** webhook pointing at the production domain
      and store its signing secret in `STRIPE_WEBHOOK_SECRET`.
- [ ] Re-run steps 4–6 against live mode with a real card and a
      $1 test listing before opening checkout to everyone.

## What PlugU already implements

- Server-side `createCheckoutSession` with `application_fee_amount` +
  `transfer_data.destination` for marketplace payouts.
- HMAC-verified webhook at `/api/public/stripe-webhook` with full event
  logging in the `webhook_events` table.
- Duplicate-submit protection: server function reuses an existing open
  Checkout Session for the same order, and the database enforces a
  unique `(buyer_user_id, client_idempotency_key)` index on `orders`.
- Only Stripe **IDs** are stored (`stripe_payment_intent_id`,
  `stripe_charge_id`, `stripe_refund_id`) — never card data.
- Refund and dispute plumbing is in place (`refundOrder` server fn +
  webhook handlers); no manual action needed for automated refunds.
- Checkout UI honestly disables the pay button and shows a warning
  banner until `STRIPE_SECRET_KEY` is present.