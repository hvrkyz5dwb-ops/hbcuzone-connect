# PlugU Build 3 — Campus Operating System

Build 3 turns PlugU into a live campus OS. Everything existing (auth, listings, orders, payments, messaging, reviews, subscriptions, admin) stays intact — Build 3 extends it.

This is a very large scope, so it ships in four phases. Each phase leaves the app fully working and testable.

## Phase 1 — Live layer foundation (backend + Available Now + Pulse)

Database (all additive, backward compatible, RLS + grants + indexes):
- `seller_availability` — toggle, service, zone, price-from, slots left, `available_until`; auto-expires on read and via a cleanup rule.
- `drops` — text/photo/price/CTA, 24h expiry, optional `flash` fields (discount, quantity, ends_at).
- `campus_zones` — per-school named zones (Student Center, New Res, Gym…) so no exact locations are ever stored or shown.
- `notification_preferences` — per-category opt-outs with frequency caps.
- Reuse existing `favorites`, `bookings`, `service_availability_slots`, `notifications`, `reports`.

App:
- **Available Now** toggle in seller dashboard + profile: service, until-time, campus zone, starting price, slots. Expired rows stop showing automatically.
- **PlugU Pulse**: new live feed built from real rows only — active availability, new drops/flash drops, upcoming events, new listings, recent bookings-driven activity. Filters: Near me, Available now, Food, Hair, Beauty, Rides, Events, Clothing, Services, Trending. Realtime subscriptions with proper cleanup, paginated, skeleton/empty/error/retry states.

## Phase 2 — Drops, Flash Drops, bookings

- **Drops + Flash Drops**: composer for sellers (text, photo, attach listing/service/event, price, zone, CTA). Flash Drop adds countdown, quantity limit, discount, direct book/buy. Server-side enforcement of quantity and expiry — no client-trusted discounts.
- **Real bookings**: seller schedule config (working days, hours, duration, breaks, buffer, deposit, cancellation policy, same-day, daily limit). Buyer flow: service → date → time → price → pay/deposit → confirm. Atomic slot locking to prevent double booking. Statuses requested/confirmed/completed/cancelled/no-show/refunded, reschedule when allowed, reminders, verified review on completion.
- Notifications for booking confirm/remind, flash drops nearby, favorite seller available — all respecting preferences and caps.

## Phase 3 — Map, PlugAI, trust, analytics, rankings

- **Live campus map + heat map**: aggregated zone activity only (counts, never individual location). Pins for available sellers, food, services, events, flash drops. Filters mirror Pulse. Tap pin → compact preview + action.
- **PlugAI / Ask PlugU**: upgrade the existing Ask AI so the model is given real PlugU rows (campus, category, price, rating, availability, verification, PlugScore) retrieved server-side, and may only reference those rows. Empty result says so plainly and offers nearby alternatives. Entrepreneurship questions get educational guidance only.
- **PlugScore + badges**: server-computed score from real orders, bookings, ratings, cancellations, disputes, refunds, response reliability, account age, verification. Badges (Verified Student, PlugU Certified, Top Rated, Fast Responder, 100+ Orders, Reliable Plug). Formula stays server-side; admin can review/revoke.
- **Business analytics dashboard**: revenue today/week/month, orders, bookings, profile/listing views, search appearances, conversion, repeat customers, rating, trend, best seller, active hours, campus/category rank. Only real data; deeper cuts for Pro/KingPin, useful basics for free.
- **Rankings**: campus leaderboards by category plus HBCU Power Rankings, computed from verified transactions and engagement, with anti-gaming guards.

## Phase 4 — Home redesign, polish, QA

- Home reorder: Search / Ask PlugU → Pulse → Available Now → Trending Near You → Flash Drops → Events Tonight → Popular Businesses → Campus Rankings → Categories → Opportunities. Compact horizontal rails, strong hierarchy, no card overload.
- Notification preference screen, favorites/rebook/reorder actions, safety + reporting coverage on all new surfaces.
- Full pass: skeletons, empty/error/retry everywhere, safe areas, keyboard handling, contrast, iPhone sizes, slow-network and offline behavior, session expiry, permission denial.
- End-to-end test sweep across the checklist you listed (buyer, seller, admin; free/Pro/KingPin; empty and populated campuses).

## Technical notes

- All new tables get GRANTs, RLS scoped to owners/admins, and indexes on `school_id`, `seller_user_id`, `expires_at`, `available_until`.
- Booking and flash-drop claims run through security-definer functions with row locking to kill race conditions and duplicate payments.
- Realtime listeners are scoped per campus and torn down on unmount; lists are paginated and queries limited.
- No fabricated data anywhere: analytics, AI results, rankings, and Pulse all read real rows or show an empty state.
