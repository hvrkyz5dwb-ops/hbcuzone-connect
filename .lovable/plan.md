# Phase 2 — Profiles & Seller Onboarding

Wire student profiles and seller onboarding to the live database, replacing the mock-only surfaces.

## 1. Database migration

Extend the existing tables (no new tables — reuses `profiles` and `businesses`):

**profiles** — add:
- `username` text unique (citext-style lowercase, 3–20 chars)
- `display_name` text (public-safe name, defaults to `full_name`)
- `graduation_year` int
- `status` text CHECK in (`student`, `alumni`) default `student`
- `avatar_url` already exists
- `completed_transactions` int default 0
- `rating_avg` numeric(3,2) default 0
- `rating_count` int default 0

**businesses** — add:
- `category` text
- `description` text (rename intent; keep `bio` too for back-compat)
- `campus_name` text
- `fulfillment` text[] (subset of `pickup|delivery|appointment|digital`)
- `availability` text
- `cancellation_policy` text
- `contact_method` text default `plugu_dm`
- `rules_accepted_at` timestamptz
- `onboarding_step` int default 0 (0 = draft, 5 = complete)
- `is_active` already exists (flipped true only after step 5)

**public_profiles view** — safe columns only (no email, no suspension reason). Grant SELECT to `anon` + `authenticated`.

Grants + RLS updates:
- Keep existing self-only policies on `profiles`; new view exposes the safe fields publicly.
- `businesses` policies unchanged (public read for `is_active=true`, owner read for drafts).

## 2. Profile UI

- Extend `useProfile` and add a `usePublicProfile(username)` hook.
- `/profile` (self): show avatar, display name, @username, school, grad year, student/alumni pill, bio, verified badge, rating summary, completed-transactions count, join date. Never render email publicly. Add "Edit profile" button.
- `/profile/edit`: form for display name, username (uniqueness check), grad year, status, bio, avatar URL. Saves via `supabase.from('profiles').update`.
- `/u/$username`: public read via `public_profiles` view. Same public fields; no edit affordance.

## 3. Seller onboarding

New route `/seller/onboarding` — 5-step wizard, auto-saves after each step so progress isn't lost:

1. Business name + category (creates `businesses` row, `is_active=false`, `onboarding_step=1`)
2. Description + logo/avatar URL
3. Campus (defaults to the verified school), fulfillment options (multi-select checkboxes), general availability
4. Cancellation policy, preferred contact method (defaults to PlugU DM)
5. Read + accept seller rules and prohibited-items policy → sets `rules_accepted_at`, `is_active=true`, `onboarding_step=5`

Draft is looked up by `owner_user_id`; resuming the wizard rehydrates fields and jumps to the last saved step. "Save & exit" button on every step.

Guard: signup requires `verification_status='verified'` before entering onboarding (otherwise shows verify-first CTA).

## 4. Seller dashboard `/seller`

New minimal functional dashboard fed by the real business row:
- Header: logo, name, category, campus, active/draft chip
- Stats: listings count, orders count, rating avg — real Supabase counts
- Actions: Add listing (→ existing market flow), Edit business, View public storefront, Boost
- If no business exists → "Become a seller" CTA that routes to `/seller/onboarding`

`/business` (existing rich mock hub) stays but its "Get started" CTA is rewired to `/seller/onboarding`. Profile menu gains "Seller dashboard".

## Technical

- All writes through the browser Supabase client with RLS (`owner_user_id = auth.uid()` insert/update). No server functions needed for this phase.
- Username uniqueness enforced at DB (unique index) + surfaced as a friendly error in the edit form.
- `public_profiles` view is `SECURITY INVOKER` (default) with explicit column list — email is not selectable.
- Ratings/transactions columns default to 0; live aggregation from `orders`/`reviews` will be layered in a later phase.

## Out of scope this phase
- Payout provider connect (stubbed under existing `payout_accounts` table).
- Live rating recomputation triggers.
- Public storefront route at `/biz/$slug` (dashboard "View storefront" link added, route follows in Phase 3 marketplace work).
