# PlugU Production Migration Plan

Full move from localStorage-based prototype data to a real Supabase backend with proper auth, RLS, and protected routing. This will span **many turns**. Each turn ships a working slice — the app stays usable throughout.

## Guiding rules

- Do **not** touch the visual identity: dark theme, antique gold, statue splash, wordmarks, AppShell layout stay as-is.
- Do **not** delete features. If a screen has no backend yet, it keeps its current localStorage source until that turn migrates it.
- One clear source of truth: `supabase.auth` for identity, `profiles` table for user data. The old `plugu.student` localStorage account object gets removed at the end of Turn 1.
- Every new table ships with GRANTs + RLS + policies in the same migration.
- Every mutation is idempotent (guard against double-taps) and validated with zod.

## Turn-by-turn roadmap

### Turn 1 — Auth foundation (this turn, after plan approval)
- Migration: `profiles`, `user_roles` (+`app_role` enum, `has_role` fn), `terms_acceptance`, auto-create-profile trigger on `auth.users` insert, updated_at triggers, RLS + GRANTs.
- Enable `password_hibp_enabled`. Keep email confirmation ON (user must verify).
- Rewrite `src/routes/auth.tsx`: sign in, sign up, forgot password, `.edu`-only validation using `APPROVED_SCHOOLS`, terms/privacy checkbox required, resend verification.
- New `src/routes/reset-password.tsx` (public).
- New `src/routes/verify-email.tsx` explaining "check your inbox" + resend.
- New `src/routes/_authenticated/route.tsx` (integration-managed shape) gating the whole app.
- Move ALL current top-level routes under `_authenticated/` **except** `/auth`, `/reset-password`, `/verify-email`, `/terms`, `/privacy`, `/safety` (public info), and the MCP/OAuth/well-known routes.
- `src/routes/index.tsx` becomes public landing → CTA to `/auth`; signed-in users get redirected to `/home` (renamed from current index body).
- Root `onAuthStateChange` subscriber in `__root.tsx` filtered to identity events; router.invalidate + queryClient.invalidate on sign-in/out.
- Sign-out helper with cache teardown (cancelQueries → clear → signOut → navigate).
- **Delete** `src/lib/auth.ts` fake-account storage; keep only `APPROVED_SCHOOLS`, `validateStudentEmail`, `detectHbcuSchool` as pure helpers. Rewire every consumer (`useSchool`, `AppShell`, `signup`, etc.) to read from Supabase profile.
- `/signup` becomes a thin redirect to `/auth`.
- Report at end: what works, what to test manually.

### Turn 2 — Profiles + onboarding + roles
- `/onboarding` becomes required post-signup step (interests, year, major, campus confirm) writing to `profiles`. Gate: `profiles.onboarding_completed_at IS NULL` → force `/onboarding`.
- Profile edit page writes to DB with optimistic + rollback.
- Admin role via `user_roles` — `/admin` now checks `has_role(uid,'admin')` server-side; passcode gate removed.
- Storage bucket `avatars` (public read, owner write) + upload UI.

### Turn 3 — Listings (marketplace core)
- Tables: `listings`, `listing_images`, `saved_listings`, `listing_reports`.
- Storage bucket `listing-images` (public read, owner write, size/type limits).
- CRUD server fns; RLS: public read of `status='active'`, owner-only write, plus owner read of own drafts.
- Migrate `src/hooks/use-listings.ts` + `src/lib/listings-storage.ts` consumers. Idempotency key column.
- `/market`, `/saved`, seller listing management wired to DB.
- Search + filters via `createServerFn` with pagination.

### Turn 4 — Messaging
- Tables: `conversations`, `conversation_participants`, `messages`, `blocks`.
- RLS: only participants can read/write. Realtime subscription on `messages`.
- Rewrite `messages.tsx`, `messages.$id.tsx`. Retry-on-fail, unread counts, block/report.

### Turn 5 — Orders, checkout, reviews, disputes
- Tables: `orders`, `order_events`, `reviews`, `disputes`.
- Checkout server fn (no real payments — clearly marked "Demo checkout" until Stripe/Paddle is enabled).
- Reviews gated on `orders.status='completed'` + `buyer_id=auth.uid()`.
- Dispute center wired to DB.

### Turn 6 — Community layer
- Tables: `notifications`, `follows`, `event_rsvps`, `campus_feed_posts`, `post_reactions`, `referrals`, `ambassador_stats`.
- Notification bell reads real rows; each notification has a destination.
- RSVP counters via row-count, not localStorage.

### Turn 7 — Plans, boosts, KingPin, seller subscriptions
- Tables: `seller_plans`, `boosts`, `plan_history`.
- Enforce plan benefits server-side (listing limits, boost slots).
- Payment provider decision: recommend Stripe built-in via `payments--enable_stripe_payments` (ask user before enabling).

### Turn 8 — HBCUS live data + campus map persistence
- Keep AI-powered feeds (already server fns).
- Persist school communities: `school_posts`, `school_events` scoped by school slug with RLS "must belong to that school".
- Home-campus stored on profile, not localStorage.

### Turn 9 — Audit & cleanup
- Dead-button sweep: every `onClick` traced to a real action or explicitly disabled with tooltip.
- Empty/loading/error states for every route (skeletons already partially exist).
- Duplicate-submit guards on every mutation (disabled + inflight ref).
- Mobile responsiveness pass on the routes touched.
- Run `supabase--linter` + `security--run_security_scan`, fix findings.
- Delete every remaining `*-storage.ts` localStorage module.
- Final report with manual QA steps.

## Technical section (details for the technical reader)

### Auth architecture
- Client: `@/integrations/supabase/client` (browser only).
- Server fns needing user: `.middleware([requireSupabaseAuth])` — bearer attached by existing `attachSupabaseAuth` in `src/start.ts`.
- Public reads: server publishable client inside handler, `TO anon` SELECT policies with column projection.
- Admin ops: `await import('@/integrations/supabase/client.server')` inside handler only.

### Protected routing shape
```text
src/routes/
  index.tsx                    public landing
  auth.tsx                     public, redirects to /home if signed in
  reset-password.tsx           public
  verify-email.tsx             public
  terms.tsx, privacy.tsx       public
  safety.tsx                   public
  _authenticated/
    route.tsx                  ssr:false gate → /auth if no session
    home.tsx                   the real signed-in home
    market.tsx, map.tsx, hbcus.tsx, messages.tsx, profile.tsx, ...all others
  [.]lovable.oauth.consent.tsx public (MCP)
  [.mcp]/*, [.well-known]/*    public
```

### Turn 1 SQL (preview)
- `profiles(id uuid PK → auth.users, email, full_name, school_name, school_domain, year, major, avatar_url, onboarding_completed_at, terms_accepted_at, is_hbcu_student bool, created_at, updated_at)`.
- `app_role enum('admin','moderator','user')`.
- `user_roles(id, user_id, role, unique(user_id,role))`.
- `has_role(_user_id uuid, _role app_role) → bool` SECURITY DEFINER.
- Trigger `handle_new_user()` on `auth.users` insert → insert profile row from `raw_user_meta_data`.
- RLS: profile self-read + self-update; user_roles self-read only.
- GRANTs per rules (authenticated + service_role; no anon on profiles until we know what's public).

### Data-layer strategy
- TanStack Query for all server-fn reads (already the template default).
- Every mutation returns updated row; invalidate on success.
- Idempotency: client generates `nanoid()` per submission, server upserts on `(user_id, idempotency_key)` unique index for creation endpoints.

### What I will NOT do
- No new Supabase Edge Functions (use `createServerFn` and TanStack routes).
- No changing `src/integrations/supabase/*` generated files.
- No exposing service role key in browser code.
- No touching `auth.*`, `storage.buckets` via SQL (use storage tools).

## Deliverable at end of every turn
A short structured report: features touched, migrations run, RLS/GRANT changes, remaining limitations, exact manual QA steps.

**Approve this plan and I'll ship Turn 1 (auth foundation) immediately.**