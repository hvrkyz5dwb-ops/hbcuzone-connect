# PlugU — Originality and Purpose

PlugU is an original application built for HBCU students and student-owned
businesses. It is not a template, a repackaged storefront, or a white-label
marketplace. Nothing in this document describes plans, partnerships, or
ownership that does not exist today in the shipped app.

## Mission

Buy, sell, book and build on your campus. PlugU exists so that a student can
find another verified student at their own school who cuts hair, does nails,
shoots photos, tutors, cooks, drives, sells clothes or dorm goods, throws
events, or runs a creative business — and transact with them safely inside a
students-only community.

## Why it is not a generic marketplace

1. **Students-only membership.** Membership is gated on a school-issued `.edu`
   address matched against a school directory in the database. Accounts whose
   school does not issue `.edu` addresses go through a manual-review request
   queue (`school_access_requests`), not a self-serve toggle. Verification
   state lives server-side on `profiles.verification_status` and cannot be
   granted from the client.
2. **HBCU-first campus model.** PlugU ships an HBCU school directory with
   institution domains, mascots, colors, city/state, and campus geography
   (zones, places, floors, routes). Feeds, events, services, search and the
   live map are scoped to a campus, not to a geographic radius.
3. **One app, many campuses.** A single Bundle ID serves every supported
   campus. Students explore other PlugU campuses with an in-app campus
   switcher; no per-school app, no per-school build, no separate Bundle ID.
4. **Services and bookings, not just goods.** Listings can be goods or
   services with fulfillment types (pickup, meetup, delivery, on-campus),
   availability slots, and bookings with a status history.
5. **Campus OS.** Live campus map with campus-only geofencing, campus places
   and zones, guided campus tours, live seller pins, flash drops, campus
   events with RSVPs and recaps, student orgs and announcements.
6. **Student reputation.** Verified Student badges, ratings tied to completed
   orders, completed-transaction counts, and earned (not purchased) badges.
7. **Safety built into the product surface.** Report and block are available
   from listings, profiles, events, posts and messages; reported content
   disappears from the reporter's feed immediately; blocked students and their
   content are filtered in both directions at the database layer.

## Original work in this repository

- All UI components, layout, typography scale, motion and the black-and-gold
  visual language are written for PlugU in this repository.
- The onboarding sequence, launch sequence, campus bar, campus map, Campus OS
  data model, Pulse feed, rankings, and moderation tooling are original code.
- Scene illustrations in onboarding are inline SVG authored in the codebase —
  no stock illustration packs.

See `ASSET-LICENSES.md` for the provenance of every significant asset.
