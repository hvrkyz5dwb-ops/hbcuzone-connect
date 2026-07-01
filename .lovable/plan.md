
# PlugU Phase 4 & 5 — Launch-Ready Marketplace, Trust, and Growth

Ship two connected phases: a polished protected marketplace with real checkout UX and seller tiers (Phase 4), then a growth engine that turns every verified student into a recruiter (Phase 5). All flows stay frontend-first with local persistence so the app feels real end‑to‑end; payment rails are wired as UI + stubbed handlers so we can swap in Stripe/Paddle later without redesign.

## Phase 4 — Marketplace, Payments & Trust

### 1. Protected Checkout Flow
New route `/checkout/$listingId` replacing the current placeholder:
- Order summary card (item, seller, campus, price, PlugU fee, total)
- Payment method selector: **Apple Pay**, **Cash App Pay**, **Debit/Credit Card** (styled tiles, Apple‑grade)
- "Protected by PlugU" trust panel (verified seller, buyer protection, refund window, secure transfer)
- Delivery / meetup details (campus pin, time window, notes)
- Confirmation screen with order ID, receipt, "Message seller" CTA
- Persist via `src/lib/orders-storage.ts` (localStorage: orders, statuses, disputes, payouts)

### 2. Order & Dispute Center
New route `/orders` (buyer + seller tabs):
- Order history with status chips (Paid, In Progress, Delivered, Disputed, Refunded)
- Order detail drawer: timeline, receipt, "Open dispute", "Confirm delivery", "Leave review" (gated to delivered)
- `/orders/$id/dispute` — reason picker, evidence upload (image stub), resolution tracker
- Refund center integrated into existing `/trust` route

### 3. Seller Plans
New route `/seller/plans` (Apple/Stripe pricing card style):
- **Free Seller** — 5% fee
- **Pro Seller** — 2% fee, Verified Pro badge, priority feed, promo discounts, analytics
- **KingPin Seller** — 0% PlugU fee, Gold KingPin badge, featured on campus + Daily, exclusive opportunities
- Persist current tier in `src/lib/seller-plan.ts`; badge appears next to seller name across Market, Feed, Profile, Messages
- Wire "Upgrade" CTAs from Profile, Listing, and Analytics screens

### 4. Trust System
- Verified Purchase Reviews: only orders with `status === "delivered"` unlock the review form (enforced in `orders-storage`)
- Seller trust panel on profile: response time, completion rate, repeat customer %, total sales, favorites, refund history, Community Trust Score (0–100 composite)
- Business Verification Levels: Bronze → Silver → Gold → Diamond, derived from activity thresholds (sales, reviews, refund rate, tenure). Reuse the existing tier badge system.
- New `src/lib/trust-score.ts` computes score + level from local order/review data

### 5. Seller Analytics
New route `/seller/analytics`:
- KPI tiles: profile views, listing clicks, conversion rate, repeat customers, monthly earnings, yearly earnings, sales growth (%)
- Reuses existing `graph-draw` SVG treatment for the growth chart
- Data sourced from `orders-storage` + a lightweight `views-storage` counter incremented on listing open

## Phase 5 — Growth Engine & Referral Network

### 6. Referral Program
- Auto‑generate a referral code + link on signup (`plugu.app/join/<code>`), stored in `src/lib/referrals.ts`
- New route `/referrals` with:
  - Personal code + shareable link (copy, Web Share API)
  - Dashboard: total referrals, verified students, businesses referred, referral streak, campus rank, national rank
  - Achievement wall (not cash‑centric): Campus Builder, Plug Pioneer, Top Recruiter, School Ambassador, KingPin Recruiter
- Signup flow accepts `?ref=<code>` and credits the referrer locally

### 7. Campus Ambassador Program
New route `/ambassadors`:
- Marketing landing with benefits list (badge, free premium, early access, merch, scholarships, monthly rewards, networking)
- "Apply to be an Ambassador" form (name, campus, why, socials) → stored locally + toast
- Ambassador leaderboard (campus + national)
- `/ambassadors/dashboard` (visible once "approved" locally): recruited students, businesses created, campus growth chart, school rank, national rank, monthly leaderboard

### 8. Business Milestones
New `src/lib/milestones.ts` + `<MilestoneToast />`:
- Auto‑detect and celebrate: First Sale, First $100, First $1,000, 100 Sales, Top Rated, Campus Favorite, KingPin Status, Business Anniversary
- Shareable achievement card (rendered to PNG via canvas for Web Share / download)
- Achievements surface on Profile "Trophy Case" section

## Cross‑cutting polish
- Add Orders, Seller, Referrals, Ambassador entries to the Plug quick‑actions sheet in `AppShell`
- All new routes get luxury dark/gold treatment consistent with recent Phase 3 polish
- Every button leads somewhere — Message, Dispute, Upgrade, Share, Apply all wired with real handlers + toasts
- Add lightweight empty states matching the shared `EmptyFilters` pattern

## Technical Notes
- No backend yet — all persistence via typed localStorage modules under `src/lib/*-storage.ts`; APIs shaped so a future `createServerFn` swap is drop‑in
- Payment tiles are UI‑only handlers that call `orders-storage.createOrder({ method })`; real Stripe/Paddle wiring is a follow‑up phase (would use Lovable's built‑in Stripe payments)
- Trust score, tier, and milestones are pure functions of local order/review/referral state so they update live
- New routes:
  - `/checkout/$listingId`, `/orders`, `/orders/$id`, `/orders/$id/dispute`
  - `/seller/plans`, `/seller/analytics`
  - `/referrals`, `/ambassadors`, `/ambassadors/dashboard`
- New libs: `orders-storage.ts`, `seller-plan.ts`, `trust-score.ts`, `views-storage.ts`, `referrals.ts`, `ambassadors.ts`, `milestones.ts`
- New components: `ProtectedCheckoutPanel`, `PaymentMethodTiles`, `OrderTimeline`, `DisputeForm`, `TrustScorePanel`, `TierBadge` (extend existing), `AnalyticsKpiGrid`, `ReferralDashboard`, `AmbassadorLeaderboard`, `MilestoneToast`, `AchievementCard`

## Out of Scope (call out for later)
- Real Stripe/Apple Pay/Cash App integration (needs Lovable Cloud + Stripe enable)
- Real payouts / KYC
- Server‑side referral fraud checks
