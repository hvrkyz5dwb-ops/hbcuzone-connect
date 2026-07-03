## Goal
Make Map + HBC"US" tabs respond to the verified school, persist every feed interaction, wire the Upgrade → Manage-Plan flow so it actually activates a membership, and give Market real listing CRUD backed by localStorage.

## 1. School-aware Map (`src/routes/map.tsx` + helpers)

- Replace `useHomeCampus()` with `useSchool()` as the single source of truth. `useHomeCampus` stays as a manual override; if the user has a verified `.edu`, `useSchool()` wins.
- Header hero shows `{school.name}` + `{school.mascot}` + `{city, state}` from `hbcus-data.schoolDetails` (fallback: generic copy for non-HBCUs).
- Filter `mapPins` by the active school. Extend `MapPin` type in `mock-data.ts` with an optional `school?: string` and tag existing pins. Any pin without a school falls through as "campus-agnostic" so smaller schools still see food/study/safety generics.
- `CampusLayoutAI` + `CampusWayfinder` both receive `school.name / city / mascot` from `useSchool()` so the AI-generated layout regenerates per school (already keyed by `school`, so it caches per campus automatically).
- "Set as home" button in the hero writes to `useHomeCampus` so unverified users can still pick a campus; verified users see a lock badge instead.
- Empty state when zero pins match the active school + filters.

## 2. School-aware HBC"US" (`src/routes/hbcus.tsx` + `src/lib/hbcus-data.ts`)

- `HbcusPage` gate already uses `useHbcusVerification`. Extend that hook to derive `school` from `useSchool()` when the user is verified against an HBCU domain; non-HBCU verified users see a "Not eligible — HBC\"US\" is HBCU-only" teaser card (already partly there — finish the copy + CTA back to `/`).
- `HbcusApp` seeds `active` from `useSchool().name` on first mount (only if the school exists in `schoolProfiles`); falls back to current default. `home` still user-controlled.
- Filter every rail that has a `school` field by `active` when the user toggles a new "My School Only" chip (defaults on for verified users):
  - `hbcuLiveNews`, `liveScores`, `upcomingGames`, `completedGames`, `topPerformers`, `internships`, `scholarshipsList`, `blackBusinesses`, `networkingProfiles`, `liveEvents`, `studentSpotlights`, `careerOpportunities`, `communityFeedSample`, `alumniNetwork`.
  - Add a small `filterBySchool(list, active, includeAll)` helper in `hbcus-data.ts`; rails render "Nothing from {active} yet — showing everything" when the filtered list is empty.
- `SchoolProfile` deep link (`/hbcus/school/$slug`) still works — just pass `schoolSlug(active)` from the "View my school" CTA in the hero.

## 3. Persist feed interactions (`src/components/CampusFeed.tsx` + new `src/lib/feed-storage.ts`)

Likes / saves / follows already persist via ad-hoc localStorage. Consolidate + extend so counts and comments survive reloads:

- New `feed-storage.ts` with `getState()`, `setLike(id, on)`, `setSave(id, on)`, `setFollow(name, on)`, `addComment(postId, text)`, `subscribe(cb)`, all keyed under `plugu.feed.v1`.
- `CampusFeed` reads reactive state via a `useFeedState()` hook (mirrors `use-notifications`), removes the three ad-hoc keys, and migrates old keys once on mount.
- Post card shows `likeCount + (liked ? 1 : 0)` and `commentCount + userComments.length` so optimistic counts persist across reloads.
- Comment sheet (existing UI) writes to storage and lists user comments above seed comments.
- Fires `notifyEvent("feed:reaction")` so the notifications bell picks up "You liked X" activity (uses existing `notifications-storage`).

## 4. Fix Upgrade → Manage-Plan flow

Current bug: boost CTA sends to `/checkout?plan=key` but boosts never save; membership CTA on `/upgrade` only links to `/seller/plans`; `manage-plan` reads `plan-storage` which nothing writes to for memberships.

- `src/routes/upgrade.tsx`:
  - Boost card CTA calls `saveSelectedPlan({ key, name: pkg.name+d.label, price: chosen.price })` before navigating, so `/payment-success` + `/manage-plan` show it.
  - Membership block: render `SELLER_TIERS` with a monthly / semester / yearly toggle (reuse existing `pricing` object). CTA `Activate {tier}` calls `setSellerPlan(tier, cycle)` **and** `saveSelectedPlan(...)` then routes to `/payment-success`.
- `src/routes/seller.plans.tsx`: same activation call so both entry points agree.
- `src/routes/manage-plan.tsx`:
  - Shows both the current `SellerPlan` (from `getSellerPlan()`) AND the last-saved boost from `getSelectedPlan()`.
  - "Cancel plan" resets seller tier to `free` via `setSellerPlan("free")` in addition to clearing selected plan.
  - "Change plan" links to `/upgrade#memberships`.
- `payment-success.tsx`: read `getSelectedPlan()` for the confirmation copy; add "Manage plan →" and "Back to home" CTAs (verify already present, fix if missing).

## 5. Listing CRUD (`src/routes/market.tsx` + new `src/lib/listings-storage.ts`)

- `listings-storage.ts`: localStorage-backed under `plugu.listings.v1`. API: `listMine()`, `listAll()` (merges seeds + user), `createListing(input)`, `updateListing(id, patch)`, `deleteListing(id)`, `subscribe(cb)`. Images stored as base64 data URLs from `<input type=file>`.
- `market.tsx`:
  - Grid renders `listAll()` (user listings first) via a `useListings()` hook.
  - Floating "+" FAB opens a `Sheet` composer: title, price, category, description, image (file → base64), campus (defaults to `useSchool().name`). On submit → `createListing`, toast, close.
  - Each of *my* listings shows a small overflow menu → Edit / Delete (uses same sheet in edit mode).
  - Persist `saved` set through `feed-storage.setSave` so the ❤ on Market matches saved posts elsewhere.
- Checkout continues to receive the listing via `checkout.$listingId.tsx`; make it read from `listings-storage.listAll()` first, then fall back to seed `listings`.

## 6. QA sweep

- Playwright at 375×812 hits `/map`, `/hbcus`, `/upgrade`, `/manage-plan`, `/market`, `/`, records console errors, screenshots after each interaction (create listing, activate KingPin monthly, like a post, reload, verify state).
- Fix any leftover console errors surfaced during the sweep.

## Files

**New**
- `src/lib/feed-storage.ts`
- `src/lib/listings-storage.ts`
- `src/hooks/use-feed-state.ts`
- `src/hooks/use-listings.ts`

**Edited**
- `src/routes/map.tsx`, `src/routes/hbcus.tsx`, `src/routes/upgrade.tsx`, `src/routes/manage-plan.tsx`, `src/routes/seller.plans.tsx`, `src/routes/market.tsx`, `src/routes/checkout.$listingId.tsx`, `src/routes/payment-success.tsx`
- `src/components/CampusFeed.tsx`
- `src/lib/hbcus-data.ts` (add `filterBySchool` helper)
- `src/lib/mock-data.ts` (optional `school` on `MapPin`)
- `src/hooks/use-hbcus-verification.ts` (integrate `useSchool`)

No new npm deps. No design changes — keeps the gold/black luxury theme, statue splash, and current layouts intact; all additions reuse existing tokens and components.

## Out of scope
Real Stripe checkout, server-side persistence, real-time presence — flagged as follow-ups once Lovable Cloud is enabled.
