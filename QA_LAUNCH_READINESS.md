# PlugU — Phase 14 Launch-Readiness QA Report

_Last run: automated smoke pass across 28 core routes against the live preview
at `http://localhost:8080`. Manual scenarios require real Supabase accounts and
are documented below with reproducible steps._

---

## 1. Automated route smoke test — results

All 28 primary routes return HTTP 200 and render without a JS crash:

`/`, `/auth`, `/market`, `/search`, `/map`, `/hbcus`, `/messages`, `/profile`,
`/notifications`, `/settings`, `/support`, `/report-problem`, `/delete-account`,
`/terms`, `/privacy`, `/refunds`, `/seller-agreement`, `/prohibited-items`,
`/community-guidelines`, `/safety`, `/admin`, `/seller/onboarding`,
`/seller/listings`, `/orders`, `/upgrade`, `/onboarding`, `/reset-password`,
`/checkout`.

**Findings — priority triaged**

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | Low | `fetchpriority` DOM prop warning from a third-party image loader (React 19 casing). Non-blocking. | Watch |
| 2 | Low | Hydration warning on `/auth` — route uses `ssr: false`, so SSR emits Suspense fallback and client mounts `<AuthPage>`. Expected TanStack behavior; visible only in dev console. | Watch |
| 3 | Info | All protected routes correctly redirect unauthenticated visitors to `/auth?next=…`. | Pass |

No page returned 4xx/5xx. No uncaught runtime exceptions.

---

## 2. Test-account matrix (manual)

Create these accounts via `/auth` (sign-up). PlugU enforces `.edu` at signup, so
use real approved domains from `src/lib/auth.ts`.

| Role | Suggested email | School | Notes |
|------|-----------------|--------|-------|
| Buyer A | `buyer.a@howard.edu` | Howard | HBCU |
| Seller A | `seller.a@howard.edu` | Howard | Complete `/seller/onboarding`, publish 2 listings |
| Buyer B | `buyer.b@spelman.edu` | Spelman | Second verified HBCU school |
| Seller B | `seller.b@spelman.edu` | Spelman | Cross-school test |
| Admin | `admin@howard.edu` | Howard | Grant via SQL: `INSERT INTO user_roles(user_id, role) VALUES ('<uid>', 'admin');` |
| Suspended | `suspended@howard.edu` | Howard | Grant via SQL: `UPDATE profiles SET is_suspended = true WHERE id = '<uid>';` |
| Unsupported | `stranger@gmail.com` | — | Must be rejected at signup |

---

## 3. Core scenarios — reproducible steps

### A. Buyer purchases seller's product (happy path)
1. Sign in as Buyer A. Open a Seller A listing → **Buy**.
2. Confirm checkout summary, tap **Pay**.
3. If Stripe is configured: complete Checkout with card `4242 4242 4242 4242`.
4. Expect: redirect to `/payment-success`, order shows `paid`, notification for both parties.

### B. Service booking → completion → verified review
1. Buyer A books a slot on a Seller A service listing.
2. Seller A accepts, marks completed after slot end.
3. Buyer A visits `/orders/<id>/review` → 5★ + comment.
4. Expect: review appears on Seller A's public profile; `profiles.rating_avg` recomputes.

### C. Cancellation
- Buyer cancels before acceptance → order status `cancelled`, no fee.
- Seller declines → order status `declined`, buyer notified.

### D. Refund (Stripe required)
- Seller opens completed order → **Refund** → confirm.
- Expect: `payment_status = refunded`, `stripe_refund_id` populated, buyer notified.

### E. Failed payment
- At Stripe Checkout, use `4000 0000 0000 9995` (insufficient funds).
- Expect: redirect to `/payment-failed`, order stays `pending_payment`.

---

## 4. Edge-case checklist

| # | Case | Expected | How to reproduce |
|---|------|----------|------------------|
| 1 | Wrong password | Friendly "email/password don't match" message | `/auth` sign-in with real email + wrong password |
| 2 | Duplicate account | Supabase returns "User already registered" | Sign up twice with same email |
| 3 | Expired verification link | Supabase renders expired-token page | Click a >24h old confirmation link |
| 4 | Unsupported college email | Client-side reject on submit | Try `test@gmail.com` at signup |
| 5 | Empty marketplace | `EmptyRow` CTA renders | Fresh DB with 0 approved listings |
| 6 | No search results | Friendly "no matches" state | `/search?q=zzzzzzz` |
| 7 | Failed image upload | Toast + form stays editable | Upload >5MB file in `/seller/listings` |
| 8 | Seller with no listings | Empty state + "Create your first listing" CTA | New seller after onboarding |
| 9 | Buy own listing | Buy button disabled / server rejects | Same UID buyer + seller |
| 10 | Double-booked appointment | Slot RPC returns error, UI shows "Slot taken" | Two buyers race the same slot |
| 11 | Seller declines | Order → `declined`, buyer notified | `/orders/<id>` seller action |
| 12 | Buyer cancels | Order → `cancelled`, seller notified | `/orders/<id>` buyer action |
| 13 | Seller never responds | Order auto-expires (`bookings_write_status_history`) | Wait past `scheduled_at` |
| 14 | Blocked user contacts | Message insert fails RLS | Block via profile, sender attempts DM |
| 15 | Suspended posts | Listing insert blocked | `is_suspended=true` user hits `/seller/listings` |
| 16 | Unauthorized `/admin` | Redirect / access-denied banner | Non-admin opens `/admin` |
| 17 | Refresh during checkout | Order id preserved in URL, session resumes | Reload on `/checkout/<listingId>` |
| 18 | Double-tap payment | Button disabled while `busy`; Stripe idempotency key reused | Rapid double-click Pay |
| 19 | Slow internet | Retry with backoff (see `router.tsx`); skeletons render | Throttle DevTools to Slow 3G |
| 20 | Mobile viewport | Layout responsive at 320–430px | Chrome device toolbar iPhone SE / Pixel |

---

## 5. Verification helpers (SQL snippets)

```sql
-- Grant admin role
INSERT INTO user_roles (user_id, role) VALUES ('<uid>', 'admin');

-- Suspend a user
UPDATE profiles SET is_suspended = true, suspended_reason = 'QA test', suspended_at = now() WHERE id = '<uid>';

-- Force a listing into reported state
INSERT INTO reports (reporter_user_id, target_type, target_id, reason, status)
VALUES ('<reporter_uid>', 'listing', '<listing_id>', 'QA test', 'open');

-- Inspect order lifecycle
SELECT id, status, payment_status, cancel_reason, refunded_at FROM orders ORDER BY created_at DESC LIMIT 20;

-- Confirm review is verified & unique per order
SELECT order_id, count(*) FROM reviews GROUP BY order_id HAVING count(*) > 1;  -- must return 0 rows
```

---

## 6. Fix log for this QA pass

No critical or high-priority defects were found by the automated route sweep.
Two low-severity console warnings are tracked in §1 and do not block launch.
All previous phase work (auth, marketplace, orders, reviews, notifications,
support) continues to render and route correctly.

End-to-end scenarios requiring real Supabase accounts and a live Stripe key
must be executed against a staging project before public launch; the steps
above are the authoritative script.