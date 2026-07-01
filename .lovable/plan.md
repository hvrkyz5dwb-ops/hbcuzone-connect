## Phase 6 — Community & Competition

### 1. PlugU Daily (`/daily`)
Rebuild the existing `news.tsx` into a true daily magazine home.
- New route `src/routes/daily.tsx` — 8 sections in one scroll: Trending Businesses, Student Success Stories, Campus Events, Scholarships, Internships, Entrepreneurship News, Business Tips, Financial Literacy, HBCU News, Live College News.
- New `src/lib/daily-feed.ts` — deterministic day-seeded mock feed + AI top-up (uses existing `ai-news.functions.ts` / Gemini Flash for "Live college news" and "HBCU News" refresh).
- "Today on PlugU" hero card with date, streak counter (localStorage), and a "Daily Read Streak" badge that rewards opening the app.
- Add a Home tab card ("Today's Plug — 8 new") linking to `/daily`.
- Add `/daily` to the Plug quick-actions sheet.

### 2. Campus Heat Map upgrade (`/map`)
Extend the existing map without a rebuild.
- Add layer toggles: Popular Businesses · Food · Events · Hot Spots · Pop-ups · Pickup Points · Student Activity.
- Anonymous activity heat: aggregate orders + listing views from `orders-storage.ts` into privacy-safe blobs (min 5 signals per cell, else hide). No user pins.
- Privacy banner + settings switch (`plugu.heatmap.optOut` in localStorage) — user can hide their own signals.
- Pop-up shop pins with time windows (auto-expire).
- Store data in new `src/lib/heatmap-data.ts`.

### 3. Seasonal Campus Campaigns
- New `src/lib/seasons.ts` — season detector by date returning one of: Move-In, Welcome Week, Homecoming, Black History Month, Entrepreneurship Month, Finals Week, Spring Break, Graduation. Fallback = "Everyday".
- New route `src/routes/season.$slug.tsx` — featured page per campaign with themed hero, promos, badges, and a challenge (e.g., "Refer 3 students during Move-In → Move-In Plug badge").
- `AppShell` header shows a subtle season chip (e.g., "🏈 Homecoming Week") that links to the season page.
- Home/Daily surfaces a "Season Spotlight" card.
- Season badges plug into existing `milestones.ts` (adds seasonal keys).

### 4. School Launch Countdown
- New `src/lib/launch-data.ts` — per-campus launch status: `{ waitlist, businessesSigned, unlockPct, goal, launchDate }`.
- New route `src/routes/launch.$slug.tsx` — countdown timer, 4 live stats, progress ring, "Join waitlist" and "Reserve business handle" CTAs (localStorage).
- When `unlockPct >= 100` or countdown hits zero → `CampusUnlockAnimation` component: gold shockwave over the campus name, confetti of Ps, "🔓 [Campus] is LIVE" moment; sets a persisted flag so it only fires once.
- HBCUS directory shows a "Coming Soon — 62% unlocked" chip on campuses not yet live and routes to the launch page instead of `/hbcus/school/$slug`.

---

## Phase 7 — PlugU National Ecosystem

### 5. National Campus Competition (`/nationals`)
- New route `src/routes/nationals.tsx` — live national leaderboard across all HBCUs.
- New `src/lib/nationals.ts` — computes per-campus score from:
  - verified students, businesses launched, marketplace sales count, total activity (revenue count, not $), review count, referrals, engagement (daily opens).
  - Real user contributions come from local storage (`orders-storage`, `referrals`, `daily-feed` streak); other campuses use deterministic mock scores that update daily so the board feels alive.
- Sections: Top 25 leaderboard, "Your Campus Rank" hero, per-metric mini-boards, weekly movers.
- "Contribute to your school" CTA links to actions that raise the score (refer, buy, review, open daily).

### 6. Year-End Awards
- New route `src/routes/awards.tsx` — four awards, each with rules, live standings, and past winners (mocked history):
  - 🏆 PlugU Grant — top campus
  - 🏆 Plug of the Year Scholarship — top student entrepreneur
  - 🏆 Ambassador of the Year
  - 🏆 Top Business Awards (category winners)
- New `src/lib/awards.ts` — deterministic leaderboards derived from `nationals.ts` + local user profile.
- Countdown to school-year end (May 15). "Nominate" button (queues locally, admin approves).
- Awards accessible from Nationals, Ambassadors dashboard, and Plug quick-actions.

### 7. Wiring & polish
- Add `/daily`, `/nationals`, `/awards`, `/launch/$slug`, `/season/$slug` to `AppShell` quick-actions sheet.
- Add cards on Home for: Today's Plug, Season Spotlight, National Rank.
- Update `hbcus.tsx` directory row to surface launch status.
- All new pages use existing dark/gold + light theme tokens, `slide-up` reveal, `lift-card`, `plugu-antique-wordmark`.

### Files created
```text
src/routes/daily.tsx
src/routes/nationals.tsx
src/routes/awards.tsx
src/routes/launch.$slug.tsx
src/routes/season.$slug.tsx
src/lib/daily-feed.ts
src/lib/heatmap-data.ts
src/lib/seasons.ts
src/lib/launch-data.ts
src/lib/nationals.ts
src/lib/awards.ts
src/components/CampusUnlockAnimation.tsx
src/components/SeasonChip.tsx
```

### Files edited (minimal)
```text
src/routes/map.tsx           # heat layers + privacy toggle
src/routes/hbcus.tsx         # launch chips on directory rows
src/routes/index.tsx         # Today's Plug, Season Spotlight, National Rank cards
src/components/AppShell.tsx  # new quick actions + season chip in header
src/lib/milestones.ts        # add seasonal + streak milestone keys
```

### Notes
- All persistence stays local-first (localStorage). No backend enabled.
- AI-refreshed sections in Daily reuse the existing Gemini Flash server functions; static mock is served instantly and AI hydrates on demand.
- Heat map aggregation enforces a 5-signal minimum per cell so no individual is identifiable; opt-out is one tap.
