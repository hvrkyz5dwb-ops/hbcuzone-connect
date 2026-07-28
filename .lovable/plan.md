# Phase 1 — Auth, School Verification & Database Foundation

Goal: replace prototype auth/data with a real, RLS-secured backend so the full journey (signup → verified profile → seller → listing → messages → order → review → admin) can be built on solid ground. This plan covers **Phase 1 only**. Later phases (listings, orders, messages, reviews, admin, payments) come after this is approved and shipped.

## What already exists (keeping as-is)

- Supabase Auth wired via `@/integrations/supabase/client`, session hook, `/auth` page, `/reset-password` page.
- `profiles` table (id, email, full_name, school_name, school_domain, year, major, is_hbcu_student, onboarding_completed_at, terms_accepted_at).
- `user_roles` + `has_role()` RBAC helper.
- `handle_new_user()` trigger populating profiles from `raw_user_meta_data`.
- Sign-out flow, `/reset-password` UI, redirect-when-authenticated on `/auth`, onboarding gate.

I will not redesign these — I'll harden the DB behind them.

## What Phase 1 adds

### 1. Schools registry (source of truth)

New tables:

- `schools` — id, name, domain (unique, lowercased), type (`hbcu` | `university` | `college` | `community`), city, state, is_active, created_at, updated_at. Public read (anon + authenticated).
- `school_access_requests` — id, requester_user_id, requested_school_name, requested_domain, note, status (`pending` | `approved` | `denied`), reviewed_by, reviewed_at, created_at. RLS: users insert/read their own; admins read/update all.

Seed `schools` from `src/lib/hbcus-data.ts` in the same migration (literal INSERTs).

### 2. Trusted verification on profiles

Add to `profiles`:

- `school_id uuid references public.schools(id)`
- `verification_status text` default `'pending'` (`pending` | `verified` | `alumni` | `denied`)
- `is_suspended boolean` default false
- `suspended_reason text`, `suspended_at timestamptz`

Rewrite `handle_new_user()` trigger:

- Lowercase domain from `NEW.email`.
- Look up matching active row in `schools`; if found set `school_id`, `school_name`, `school_domain`, `is_hbcu_student = (type = 'hbcu')`, `verification_status = 'verified'`. Otherwise leave `school_id` null and `verification_status = 'pending'`.
- Ignore any client-supplied `school_*` / `is_hbcu_student` in metadata (server derives from verified email domain only).

Add a **column-level** RLS: users may update their profile but **not** `school_id`, `school_name`, `school_domain`, `is_hbcu_student`, `verification_status`, `is_suspended` (enforced via a `BEFORE UPDATE` trigger that reverts those columns for non-admins).

### 3. Marketplace + trust schema (structure only in Phase 1)

Create empty, RLS-protected tables so future phases plug in:

- `businesses` (owner user_id, school_id, name, slug, bio, avatar_url, is_active)
- `listings` (business_id, seller_user_id, school_id, title, description, category, price_cents, kind `item|service|booking`, status `draft|active|sold|removed`)
- `listing_images` (listing_id, url, position)
- `service_availability` (listing_id, weekday, start_time, end_time)
- `conversations` (id, listing_id nullable, created_by)
- `conversation_members` (conversation_id, user_id)
- `messages` (conversation_id, sender_user_id, body, created_at)
- `orders` (buyer_user_id, seller_user_id, listing_id, status `pending|accepted|completed|cancelled|disputed`, total_cents)
- `order_items` (order_id, listing_id, qty, unit_price_cents)
- `bookings` (order_id, listing_id, scheduled_at, duration_min, status)
- `reviews` (order_id unique, reviewer_user_id, subject_user_id, rating 1-5, body)
- `reports` (reporter_user_id, target_type, target_id, reason, status)
- `blocked_users` (blocker_user_id, blocked_user_id)
- `notifications` (user_id, kind, payload jsonb, read_at)
- `disputes` (order_id, opened_by, reason, status)
- `favorites` (user_id, listing_id)
- `admin_actions` (admin_user_id, action, target_type, target_id, note)
- `subscription_plans` (code, name, price_cents, features jsonb)
- `seller_subscriptions` (user_id, plan_code, status, current_period_end)
- `boosts` (listing_id, kind, expires_at, amount_cents)
- `payout_accounts` (user_id, provider, external_id, status)

All: UUID PK, `created_at`, `updated_at` where mutable, FKs, indexes on the hot columns (`school_id`, `user_id`, `seller_user_id`, `buyer_user_id`, `listings.category`, `listings.status`, `orders.status`, `created_at`), and `GRANT SELECT, INSERT, UPDATE, DELETE ... TO authenticated` + `GRANT ALL ... TO service_role`. `anon` gets SELECT only on `schools`, `listings` (active only via RLS), `businesses` (active), and `reviews`.

### 4. RLS policies (Phase 1 shape)

- `profiles`: keep existing self-only; admin can read all via `has_role(auth.uid(),'admin')`.
- `schools`: read anon+authenticated; write admin only.
- `school_access_requests`: user manages own row; admin reads/updates all.
- `businesses` / `listings` / `listing_images` / `service_availability`: owner writes; anyone reads `active`/`published` rows; owner reads own drafts. Suspended users cannot write (check via subquery on `profiles.is_suspended`).
- `conversations` / `conversation_members` / `messages`: only participants read/write; only members can insert messages; suspended users blocked from inserts.
- `orders` / `order_items` / `bookings`: buyer and seller can read; buyer inserts; seller updates status.
- `reviews`: insert allowed only when a matching completed order exists (`EXISTS` clause) and reviewer was buyer or seller.
- `reports`, `disputes`, `admin_actions`: user inserts own; admin reads all.
- `blocked_users`, `favorites`, `notifications`: self-only.
- `subscription_plans`: public read; admin write. `seller_subscriptions`, `boosts`, `payout_accounts`: self read/write.

All policies use `has_role()` for admin checks (avoids the infinite-recursion trap).

### 5. Frontend wiring (minimal, targeted — no redesign)

- `useProfile`: expose new `verification_status`, `is_suspended`, `school_id`.
- `/auth` create-account: keep the existing form, but drop any client-side `school_name` writing to profile (trigger owns it now). Show a "we couldn't match your school" banner + link to a new `/schools/request` form when `verification_status = 'pending'` after signup.
- New `/schools/request` route: simple form that inserts into `school_access_requests`.
- Suspended-account guard: a small effect in `AppShell` that, if `is_suspended`, replaces the shell with a "Your account is under review" screen (blocks nav to compose/create/message).
- Redirect-when-authenticated on `/auth`: already exists — verify and leave alone.

### 6. Admin surface (Phase 1 scope only)

Add a minimal `/admin/schools` panel (gated by `has_role('admin')`) to:

- List pending `school_access_requests` and approve/deny (approve inserts into `schools`, updates the requester's `school_id` + `verification_status`).
- Toggle a user's `verification_status` (verified/alumni/denied) and `is_suspended`.

Everything else in admin stays as-is until later phases.

## Out of scope for Phase 1

Listings CRUD UI, messaging UI, orders/checkout, reviews UI, disputes UI, payments, notifications delivery, boosts. Their **tables and RLS** land now; the **UIs** ship in later phases.

## Technical notes

- Migration order per table: CREATE TABLE → GRANT → ENABLE RLS → CREATE POLICY. All in one migration call.
- `handle_new_user()` rewrite must be `SECURITY DEFINER` with `SET search_path = public` (already the pattern).
- Column-lock trigger on `profiles` uses `has_role(auth.uid(),'admin')` to allow admin overrides.
- Seed `schools` from `hbcus-data.ts` via literal INSERTs in the migration (no seeding via server fn on load).
- No new server functions strictly needed for Phase 1 — Supabase client + RLS handles it. Admin approve/deny goes through `requireSupabaseAuth` server fn to keep the admin check server-side.

## Deliverables & report

After Phase 1 lands I'll report:

- Migration applied (tables, policies, seed count).
- Files touched (small: `useProfile`, `AppShell` suspend gate, `/schools/request`, `/admin/schools`, `/auth` banner).
- Manual steps you still need to do: none for Phase 1 (Supabase Auth email + password reset already work on Lovable Cloud). Custom email templates and auto-confirm are still off unless you ask.
- What's explicitly deferred to Phase 2+.

Reply "go" to apply, or tell me what to change.
