# Phase 5 — Orders & Bookings

Ship real database-backed orders (products) and bookings (services) with the exact status machines you specified, plus tamper-proof pricing.

## Database (single migration)

Extend the existing `orders`, `order_items`, `bookings`, and `service_availability` tables — no rebuild.

**orders** — add:
- `kind` text: `product` | `service`
- `payment_status` text: `pending` | `held` | `captured` | `refunded` | `failed`
- `fulfillment_method` text (pickup / delivery / meetup / virtual / shipping)
- `platform_fee_cents` int, `processing_fee_cents` int, `subtotal_cents` int
- `cancel_reason` text, `cancelled_by` uuid, `cancelled_at` timestamptz
- `meetup_location` text, `note` text
- Status now allows: `pending, accepted, preparing, ready_for_pickup, out_for_delivery, completed, cancelled, refunded, disputed` (CHECK constraint)

**bookings** — add:
- `buyer_user_id`, `seller_user_id`, `slot_start`, `slot_end` (timestamptz)
- Status: `pending, accepted, declined, completed, cancelled, no_show`
- `cancel_reason` text, `decline_reason` text
- **Exclusion constraint** on `(listing_id WITH =, tstzrange(slot_start, slot_end) WITH &&)` filtered to active statuses — prevents double booking at the DB level.

**order_status_history** (new): `order_id, from_status, to_status, changed_by, note, created_at`. Trigger on `orders` UPDATE inserts a row automatically.

**booking_status_history** (new): same shape for bookings.

**service_availability_slots** (new, replaces the recurring weekday table for booking): concrete `slot_start` / `slot_end` rows sellers publish. Buyers pick from these.

**Financial lock-down**:
- `orders_guard_financials()` trigger: on UPDATE, only `service_role` or the row's status-transition path may change `total_cents`, `subtotal_cents`, `platform_fee_cents`, `processing_fee_cents`, `unit_price_cents`. Non-privileged updates that touch those columns get their old values restored.
- `create_order_secure(listing_id, qty, fulfillment_method, note, meetup_location)` — SECURITY DEFINER RPC that reads `listings.price_cents` server-side, computes fees from a fixed schedule, and inserts the order + items atomically. Frontend never sends money numbers.
- `create_booking_secure(listing_id, slot_id, note)` — same pattern, plus atomic slot claim.
- `transition_order_status(order_id, next_status, note)` — enforces the state machine (who can move to what) and writes history.
- `transition_booking_status(booking_id, next_status, reason)` — same, includes no-show/complete/cancel rules.

Standard `GRANT` blocks + owner/participant RLS for all new tables.

## Server layer

`src/lib/orders-db.ts` (new, replaces the localStorage `orders-storage`):
- `createProductOrder`, `createServiceBooking` → call the SECURITY DEFINER RPCs.
- `listMyOrders({ role: "buyer" | "seller" })`, `getOrder(id)`, `getOrderHistory(id)`.
- `transitionOrder(id, next, note)`, `cancelOrder(id, reason)`, `openDispute(id, reason)`.
- Booking equivalents + `listOpenSlots(listingId)`.

`src/hooks/use-orders.ts`, `src/hooks/use-bookings.ts` — React Query wrappers with realtime subscriptions on `orders`, `bookings`, and their history tables.

## Frontend

**Checkout (`/checkout/$listingId`)**: swap the localStorage `createOrder` call for `createProductOrder` (products) or navigate into a **BookingPicker** (services). Server returns the row with all locked-in totals; UI just displays them.

**BookingPicker** (new component): calendar view of `service_availability_slots`, disables taken slots, submits via `createServiceBooking`.

**Seller availability** (`/seller/availability`, new): sellers add / remove concrete slots per service listing.

**Orders list (`/orders`)**: real data via `useMyOrders`; filter tabs `All / Buying / Selling / Bookings`. Show status chip, payment status, fulfillment method.

**Order detail (`/orders/$id`)**: 
- Buyer view: cancel (with reason), open dispute, mark received (→ completed).
- Seller view: accept / decline, preparing → ready_for_pickup / out_for_delivery, mark completed, no_show (bookings), cancel with reason.
- Status timeline rendered from `order_status_history`.
- All money fields read-only; `readOnly` on any input near totals removed.

**Notifications**: on every status transition, RPC also inserts into `notifications` for the other party (already-existing table).

## Guardrails (matches your spec)

- Frontend never posts `total_cents`, `platform_fee_cents`, `processing_fee_cents`, `unit_price_cents`. RPCs derive everything from `listings`.
- DB trigger reverts any client attempt to mutate financial columns.
- Booking double-booking prevented by exclusion constraint, not app code.
- Status transitions enforced by RPC — invalid moves throw.

## Out of scope for this phase

- Real payment capture (Stripe/Paddle) — statuses simulate `held`/`captured` for now; hooking a live processor is a follow-up.
- Push notifications (in-app row only).
- Rides category stays disabled per Phase 3.

Proceeding on approval.
