## Phase 1 — PlugU Foundation (MVP)

Big rebuild focused on Home + supporting surfaces. Scope below is what I'll ship in this phase. Existing routes (Market, Map, Messages, Profile, HBCUs, Business, Hub, News, Safety, Upgrade) stay wired in — I'll upgrade them where the brief explicitly asks, and leave the rest as-is.

### 1. New Home Feed — "Campus Pulse" dashboard
Replace the Instagram-style `CampusFeed` on `/` with a modular dashboard. Sections, in order:
1. Personalized greeting + weather + quick actions (Sell, Book, Map, Messages)
2. **Campus Pulse summary** — AI-style brief: "3 events tonight, 2 scholarships closing, top vendor today"
3. Live campus activity ticker (who just listed, who just booked, trending now)
4. Trending businesses (horizontal scroller)
5. Marketplace highlights (4-card grid)
6. Upcoming events (with RSVP, countdown, live attendance)
7. Opportunity cards rail — Jobs / Internships / Scholarships / Research / Leadership / Volunteer
8. Business Spotlight (one featured Plug)
9. Campus announcements
10. AI recommendations ("Because you're CS '27…")
11. Become a Plug CTA (kept)

Remove `CampusFeed` from Home. Keep `PluguDaily` lower as the news brief.

### 2. Smart Universal Search
- New `SmartSearch` component pinned to Home header + reusable.
- Single input, category chips (Students, Businesses, Products, Services, Orgs, Buildings, Events, Scholarships, Internships, Food, Classes).
- Searches all mock-data sources, grouped results in a sheet.
- Routes results to the right detail screen.

### 3. Personalization
- New `use-persona.ts` hook reading interests/year/role from localStorage.
- Onboarding gains 1 quick step to pick interests (Business owner, Athlete, Entrepreneur, Artist, Freshman, Senior, etc.).
- Home sections re-order/filter based on persona.

### 4. Marketplace upgrades
- Listing detail sheet with images **and video**, reviews, ratings, availability, booking CTA.
- "Book" flow placeholder → success toast (Stripe deferred to Phase 5, per brief).
- Expand categories in `mock-data.ts` to cover the full Phase 1 list (Hairstyles, Sneakers, Photography, Videography, Graphic Design, Music Production, Event Services, Cleaning, Laundry, Moving Help, Electronics, Books, Tickets, Furniture).

### 5. Profiles
- Student profile gains: cover photo, organizations, skills, interests, achievements, social links.
- Business profile (new route `/business/$id` … or sheet) with logo, cover, gallery, services, reviews, booking calendar placeholder, pricing, contact.

### 6. Messaging
- Add Booking Requests + Order Updates as message types, read receipts, image/file attach stubs in the composer.

### 7. Events
- Standalone events list (reuse data) with RSVP toggle, live attendance count, countdown timer, ticket link when present.

### 8. Map
- Add categories required by brief: Lost & Found, Food Trucks, Organizations (extend existing pin set).

### 9. Visual polish
- Tighten spacing, typography scale, matte surfaces with subtle glass, larger rounded cards, consistent shadow tokens. No layout copies of Instagram on Home.

### Out of scope for Phase 1 (explicit per brief)
- Real auth, real Stripe, real backend. All data stays mock + localStorage. "Verify school" is a UI step only.

### Technical notes
- New: `src/components/CampusPulse.tsx`, `src/components/SmartSearch.tsx`, `src/components/OpportunityRail.tsx`, `src/components/EventCard.tsx`, `src/hooks/use-persona.ts`, `src/lib/opportunities-data.ts`, `src/lib/weather-mock.ts`, `src/routes/events.tsx`.
- Edit: `src/routes/index.tsx` (replace CampusFeed block with CampusPulse + SmartSearch), `src/lib/mock-data.ts` (categories + business profiles + listing media), `src/routes/market.tsx` (detail sheet, video, booking), `src/routes/profile.tsx`, `src/routes/messages.tsx`, `src/routes/map.tsx`, `src/routes/onboarding.tsx` (persona step), `src/styles.css` (glass + spacing tokens).
- Keep all existing routes/links working; no removals beyond `CampusFeed` from Home.

Confirm and I'll build it.