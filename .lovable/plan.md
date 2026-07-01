## Scope
Polish sweep — no rebuilds. Fix HBCUS empty states, make RSVP counters live, and wire the remaining dead buttons across HBCUS / school / market / events / feed with either working handlers or a toast + navigation.

## 1. Friendly HBCUS empty/no-results states
Replace the two flat "No … match" blocks in `src/routes/hbcus.tsx` (`SchoolsPanel` ~L1109, `GreekLifePanel` ~L1366) with a shared `<EmptyFilters />` block:
- Icon + headline ("No schools yet" / "No chapters yet")
- One-line hint ("Try another state, clear filters, or search a mascot")
- Quick suggestion chips that actually act:
  - **Schools**: "Clear filters", plus 3 top-state chips (GA, AL, NC) and 2 keyword chips ("Aggies", "Bison") that call `setStateFilter` / `setQuery`.
  - **Greek**: "Clear filters", plus chips for "Alpha Phi Alpha", "Delta Sigma Theta", "AKA" that set `org` / `query`.
- Also handle the empty-initial case identically (no query, no results after filters).

## 2. Live RSVP ticker
`src/routes/events.tsx`:
- Track a per-event `count` in state seeded from the current `going` formula.
- On toggle: increment when going, decrement when un-going, and update the `Users` line from state so the number visibly ticks.
- Add a tiny `plugu-pulse` on the number for ~600ms after change.

`src/routes/hbcus.tsx` Events panel (~L1600) uses `e.rsvp` from mock data — mirror the same pattern with local override map so the count updates on tap.

## 3. Wire dead buttons
Small, targeted handlers — no new routes:
- `src/routes/hbcus.tsx` L771 KingPin "Connect" → `navigate({ to: "/messages" })` + `toast.success("Request sent")`.
- L884 comment button on feed card → focus/scroll to comments toast ("Comments coming to this post").
- L945 "Follow"-style pill → toggle local `followed` state, label swaps Follow ⇄ Following.
- L1450 Internship "Apply" → `window.open(it.url ?? "https://…","_blank")` fallback + toast.
- L1565 Org "Join" → toggle joined state + toast.
- L1768 sheet CTA → `onPick` (already in scope) or close + toast.
- `src/routes/hbcus.school.$slug.tsx` L94 hero CTA and L419 "See all" → route to related tab via `setTab`.
- `src/routes/market.tsx` L135 "Message seller" → `navigate({ to: "/messages" })`; L138 Report → toast.
- `src/components/CampusFeed.tsx` L194 "See all" → `navigate({ to: "/news" })`.
- `src/components/AppShell.tsx` L251 header `action` button → accept optional `onAction` prop; existing callers keep working (button becomes non-interactive only when no handler passed, otherwise fires it).

Each handler uses the existing `sonner` toast so nothing feels dead.

## 4. Micro polish
- Add a shared `useBumpCount` helper in `src/lib/utils.ts` (5 lines) to animate number changes.
- Ensure every chip in the new empty states inherits the gold border treatment already used elsewhere (`border-accent/40`).

## Out of scope
No new routes, no data-model changes, no auth/backend edits, no visual redesign of existing cards.
