# PlugU

PlugU is a campus marketplace and student-business platform built for HBCU
communities. Verified students can discover campus services, buy and sell
physical goods, book real-world services, follow campus events, message one
another, and use campus-specific maps and opportunity feeds.

## What makes PlugU distinct

- School-email membership and server-side verification states.
- Campus-scoped feeds, events, listings, places, zones, and navigation.
- Goods and bookable student services with availability and order history.
- Verified reviews tied to completed transactions.
- Reporting, blocking, moderation, disputes, and in-app account deletion.
- One application serving multiple campuses through an in-app campus switcher.

The shipped release has no paid memberships, digital upgrades, or paid boosts.
Payments are only for physical goods and real-world services between users.

## Development

```sh
npm install
npm run dev
```

Production verification:

```sh
npm run build
npm run verify:ios
```

## iOS

The native Capacitor project is committed under `ios/`. Before archiving:

```sh
npm install
npm run ios:sync
npm run verify:ios
npm run ios:open
```

See `MOBILE_SETUP.md` and `docs/app-review/REVIEWER-WALKTHROUGH.md` for the
release process and App Review test path.

## Live application

https://hbcuzone-connect.lovable.app

This repository is connected to Lovable. Keep published history intact: do not
force-push or rewrite commits that have already synced.
