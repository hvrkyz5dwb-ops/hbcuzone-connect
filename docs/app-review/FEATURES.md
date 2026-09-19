# PlugU — Working Feature List

Every item below is implemented and backed by the live database. Nothing here
is a mock screen or a placeholder.

## Identity and access
- Email + password accounts with a permanent, pre-verified review account.
- `.edu` school-email validation against an HBCU/college domain directory.
- Verification states: **Unverified**, **Pending Review**, **Verified**, shown
  as a pill on Home, Market, Events and Search.
- Manual-review path (`/request-school-access`) for schools without `.edu`.
- Verified Student badge on profiles and listings.
- Terms, Privacy, Community Standards and Marketplace Agreement acceptance
  recorded before an account can be used.
- Account deletion in Settings.

## Campus
- Campus bar showing the current school, verification state and a campus
  switcher (search by name, state filter, HBCU-only toggle, near-me).
- Home sections: Happening at [School], Student Services Near You, Buy and
  Sell on Campus, Campus Events, Trending Student Businesses, Scholarships and
  Opportunities, Campus Safety and Community Standards.
- Customizable Home (reorder/hide sections), persisted per user.
- Live campus map with campus-only geofencing and a one-time location prompt
  offering Continue / Not Now / Open Settings.
- Campus places, zones, floors, routes and guided tours.
- Campus events with RSVPs, comments and recaps; student orgs and
  announcements.

## Marketplace and services
- Listing creation, edit, delete, photo upload, categories, price types,
  fulfillment options, quantity and availability.
- Marketplace filters: school (my campus / all PlugU), category, max price,
  fulfillment, sort, and **Verified students only**.
- Search across listings, services, people, events and campus places.
- Favorites/saved items, saved searches, search history.
- Seller availability slots and bookings with status history.
- Orders with status history and order-scoped conversations.
- Verified reviews tied to completed orders; seller reputation and rankings.

## Communication
- One-to-one conversations, realtime messages, unread counts, notifications
  and per-user notification preferences.

## Safety and moderation
- Three-dot content menu on listings, profiles, events, posts and messages
  with Report listing / Report user / Hide / Block.
- Report reasons plus free-text details; reports persist to the database and
  enter an admin moderation queue with Review / Resolve / Dismiss.
- Reported content is hidden from the reporter immediately.
- Blocked users: two-way filtering of listings, posts, messages and profiles.
- Blocked Users management screen with confirmation before unblocking.
- Safety Center, Community Guidelines, Prohibited Items, Refunds and Support
  screens.
- Row-level security on every user table; private fields (email, moderation
  and suspension data) are never exposed to other members.

## Opportunities
- Scholarships, internships and campus job listings with saves and
  applications.
- Interest- and major-aware ranking of opportunities and campus news.
