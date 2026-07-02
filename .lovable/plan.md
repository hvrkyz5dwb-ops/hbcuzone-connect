# Plan — PlugU Full QA + Production-Ready Pass

Scope is huge, so this plan is organized as a **single sweep across the whole app** with tight priorities. Everything stays on the current client-side architecture (localStorage + deterministic mocks + Lovable AI Gateway) unless you approve enabling Lovable Cloud (recommended — see "Decision needed" at the bottom).

---

## 0. Ground rules for the sweep
- No new frameworks. Reuse existing libs (`auth.ts`, `orders-storage`, `referrals`, `nationals`, `trust-score`, `seller-plan`, `hbcus-data`, `heatmap-data`, `campus-layout.functions`, etc.).
- Anything already "mock" gets a small `MockBadge` label so it never looks broken.
- Mobile-first, safe-area aware, `min-w-0` / `truncate` / `grid-cols-[minmax(0,1fr)_auto]` pattern everywhere.
- Respect `prefers-reduced-motion` on every new animation.
- Every button either does the real thing or fires a toast + intent (never silent).

## 1. School-aware `.edu` core (foundation for everything else)
- `src/lib/auth.ts`: extend `StudentAccount` with `schoolMeta { slug, mascot, city, state, colors }` derived from `hbcus-data.ts` + domain.
- New `src/lib/school-context.ts` + `useSchool()` hook — single source of truth read by market, feed, map, hbcus, nationals, heatmap.
- `signup.tsx` / `login.tsx`: after verify, hydrate `schoolMeta` and route to `/`.
- Every route that currently reads a hardcoded campus switches to `useSchool()` fallback → generic view for unverified.

## 2. Global shell + navigation polish
- `AppShell`: safe-area padding, notification bell wired to new `/notifications` route with unread badge (reads new `notifications-storage.ts`).
- Plug quick-actions sheet: audit every link, remove dead ones, add "Sell something", "Scan pickup", "Invite friends".
- Bottom nav: active-tab underline, 44×44 tap targets, `min-w-0` labels.

## 3. Home + Feed
- `index.tsx`: header uses school name + mascot. Notification bell → `/notifications`.
- `CampusFeed.tsx`: wire like/comment/save/share/follow/report to `feed-storage.ts` (new). Filters: school, category, popular, newest, verified, KingPin. Boosted-post ribbon + KingPin gold ring.
- Post composer modal (photo upload via `<input type=file>` → object URL preview, stored in localStorage as base64 with size cap).

## 4. Marketplace
- `market.tsx`: create/edit/delete listings persisted to `listings-storage.ts` (new). Photo upload same pattern as feed.
- Category tabs match the spec list (Food, Hair, Nails, Lashes, Clothes, Rides, Tutoring, Photography, Events, Dorm, Custom, Other).
- Search + filters (price, campus-only, verified, KingPin) working with URL search params.
- Listing detail: message seller, save, share, report, "Buy / Book" → checkout.

## 5. Payments & Protected Checkout
- Keep client-side simulation (no real charges without Cloud). Add fake method selector: Apple Pay, Cash App Pay, Card, Google Pay (labeled "Coming soon"). "Protected by PlugU" badge everywhere.
- `orders-storage`: full order lifecycle (pending → paid → shipped/ready → completed → disputed → refunded). Order detail page with dispute + message-seller.
- **Real payments requires Lovable Cloud + Stripe** — flagged in Decision below.

## 6. Seller plans + analytics
- `seller.plans.tsx`: existing Monthly/Semester/Yearly toggle stays. "Upgrade" writes to `seller-plan.ts`. Auto-KingPin override for Campus King (already there — verify wiring in badge component and search-ranking sort).
- `seller.analytics.tsx`: real numbers from `orders-storage` (views, sales, conversion, top listings) for the current user only. Revenue visible only to owner.

## 7. Profile
- `profile.tsx`: edit modal (name, year, major, bio, avatar upload). Tabs: Listings, Reviews, Followers, Following, Saved, Orders, Achievements, Rankings. Public vs. private view mode (hides $).

## 8. Messaging
- `messages.tsx`: thread list + thread view backed by `messages-storage.ts` (new). Attach order context chip, image attach, block/report, unread counts feeding the nav badge.

## 9. Notifications center (new)
- `src/lib/notifications-storage.ts` — typed events (like/comment/order/refund/referral/rank/daily/promo/dispute/verify).
- `src/routes/notifications.tsx` — grouped by day, mark-read, mark-all-read, deep links.
- Trigger points seeded across feed/market/orders/referrals/nationals so the list actually fills up.

## 10. Referrals + Ambassadors
- Ensure every account gets a code+link on signup (`referrals.ts`). Dashboard shows: total, verified, active sellers, businesses launched, streak, campus rank, national rank. Share sheet (`navigator.share` w/ fallback copy-to-clipboard).
- Ambassador dashboard: badge, leaderboard, monthly rewards card, campus growth.

## 11. Campus competition + rewards
- `nationals.ts`: verify weighted scoring covers all listed dimensions. Revenue stays private; leaderboards show anonymized handles.
- Auto-KingPin for #1 per campus already wired — add "Plug of the Year" and "School of the Year" award cards on `/awards` with countdown + prize copy (1yr KingPin or grant option).

## 12. PlugU Daily
- `daily.tsx` + `daily-feed.ts`: rotate all 11 content types listed. Streak counter + badges (already scaffolded — verify).

## 13. HBCU premium hub
- `hbcus.tsx`: gated behind `.edu` HBCU domain. Non-HBCU verified students see teaser + "Not eligible" state.
- School detail (`hbcus.school.$slug.tsx`): About, Alumni (Kri$Havn on Talladega stays), Greek, News, Scores, Rankings, Scholarships, Internships, Marketplace highlights, Leaderboard.

## 14. Live Campus Map
- `map.tsx`: uses `useSchool()` + `campus-layout.functions.ts` AI generator with the school's landmark seed.
- Layers/filters from spec (food, hair, clothes, rides, events, tutoring, photography, dorm, services + hot zones, pop-ups, pickup, safe meet).
- Tap pin → sheet with nearby sellers / events / pickup info.
- `CampusWayfinder`: "You are here" only when on-campus (geolocation + `campus-coords.ts`). Off-campus → CTA.

## 15. Admin
- `admin.tsx`: passcode gate stays. Each tab wired to storage layer (verify users, remove listings, suspend, review disputes, manage schools, manage featured, manage KingPin/ambassadors, manage Daily content). All local until Cloud is enabled.

## 16. Error, empty, and loading states
- Standardize on `EmptyState` component. Add helpful copy + primary CTA on every empty list (feed, market, orders, messages, notifications, saved, referrals, map, hbcus filters).
- Global offline banner (listens to `navigator.onLine`).
- Toast on every failed action (`sonner`).

## 17. Animation + performance polish
- Cap particle counts on mobile, `will-change` only where needed, prefetch splash images, `prefers-reduced-motion` fallbacks on splash / crowd / unlock / KingPin glow / Reveal.
- Ensure route transitions don't jank on low-end (skip framer where CSS is enough).

## 18. QA verification pass
- Playwright script at 375×812 that walks every top-level route + login/signup/checkout/notifications/order-detail, captures screenshots, and logs console errors. Fix anything red.

---

## Technical notes
- New storage libs: `notifications-storage.ts`, `listings-storage.ts`, `feed-storage.ts`, `messages-storage.ts`, `school-context.ts`. All localStorage with versioning.
- No new deps.
- Assets: no new image gen unless a route is missing one.
- Estimated file touch: ~40 files edited, ~8 created. Big but mechanical.

## Out of scope for this pass (call outs)
- **Real payments / real auth / real DB / real push notifications** need Lovable Cloud + Stripe. Without them, checkout stays a polished simulation and notifications are local-only.
- Native iOS/Android push. Web notifications only if you want them.
- Real school map data (Google Places integration) — structure is ready; wiring needs Google Maps connector.

---

## Decision needed before I build
Pick one so I don't loop back:

1. **Ship this whole sweep client-side only** (fastest, everything simulated end-to-end, no accounts persist across devices). Recommended if you just want the demo perfect today.
2. **Enable Lovable Cloud now** + this sweep uses real Supabase auth, real DB for listings/orders/messages/notifications, real Stripe checkout via `enable_stripe_payments`. Bigger scope, adds ~1 extra round of setup, but this is the only path to "production-ready" in the literal sense.
3. **Hybrid**: client-side sweep now, Cloud + Stripe as an immediate follow-up phase.

Tell me 1, 2, or 3 and I'll execute the full sweep.