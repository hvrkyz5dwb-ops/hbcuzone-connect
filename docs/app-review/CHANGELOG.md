# PlugU — Change Log for App Review

Entries describe changes made in this repository. No dates are asserted beyond
the build numbering used for App Store submissions.

## Build 11 (current, not yet submitted) — Guideline 4.3 differentiation

- Added a campus bar to Home, Market, Events and Search showing the student's
  school, verification state (Unverified / Pending Review / Verified) and a
  campus switcher for exploring other PlugU campuses.
- Campus switching now scopes the whole Campus OS (map, events, live pins,
  services) to the explored campus, with one tap back to the home campus.
- Rebuilt the Home screen around campus-specific sections: Happening at
  [School], Student Services Near You, Buy and Sell on Campus, Campus Events,
  Trending Student Businesses, Scholarships and Opportunities, Campus Safety
  and Community Standards.
- Replaced generic marketplace wording on Home, onboarding and the auth screen
  with PlugU's HBCU-specific purpose statement.
- Added a **Verified students only** marketplace filter, backed by seller
  verification state joined from the public profile view.
- Added an in-auth link to the manual school-verification review path for
  students whose school does not issue `.edu` addresses.
- Added `docs/app-review` with originality, feature, walkthrough, asset and
  change documentation.

## Build 10 — Guidelines 2.2, 4, 5.1.1(iv), 2.1(b)

- Removed paid tiers, checkout entry points and all commerce/payment wording
  from the iOS experience; converted paid badges to earned badges.
- One-time location permission screen with Continue / Not Now / Open Settings
  and no repeat prompting.
- Required unchecked legal agreement before sign-in; recorded acceptance.
- 44pt minimum touch targets, safe-area handling, iPad portrait and landscape
  verification.
- Useful empty states with real actions across the app.

## Build 9 — Guidelines 1.2, 2.1(b)

- Report menus on events and Pulse cards; moderation queue actions.
- Block/unblock with settings management and two-way filtering.
- Accurate developer support contact in Settings → Help & Safety.
- Two persistent App Review demo accounts.

## Build 8 — reviewer access and metadata

- Marketplace Agreement consent, branded error screens, PlugU metadata,
  reviewer account allowlisting, explicit `/auth` routing.
