## Scope

Four workstreams to level up PlugU visually and functionally.

### 1. AI Campus Layouts everywhere schools appear
- Reuse existing `CampusLayoutAI` component (already wired on `/hbcus/school/$slug`).
- Add a new **directory grid on `/hbcus`** where every HBCU tile shows a mini AI-generated layout preview (compact, non-interactive SVG variant of `CampusLayoutAI`), styled with the premium purple/gold theme. Cached via react-query so it only generates once per school.
- Add the same AI layout to **`/map`** (live campus map): when a verified student picks their campus, render `CampusLayoutAI` for that school as the visual campus directory, on top of the existing heat-map/pin UI.
- Create a shared `MiniCampusLayout` variant (no legend, no building list, no regenerate button) for grid tiles.

### 2. Bronze "charger/plug" logo → statue-style bronze
- The existing `plugu-logo.png` is a flat bronze plug icon. Replace with a new asset generated to match the statue silhouette (bronze figure raising a plug), transparent PNG.
- Swap the import everywhere `pluguLogo` is used (splash, login transition, headers, watermarks). Keep the same import path so no cascading edits are needed — just regenerate the file behind the asset pointer.

### 3. Luxury polish pass on bland surfaces
Targeted upgrades — no full rebuilds:
- **AppShell top bar / bottom nav**: add subtle gold hairline, glass blur, active-tab gold underline.
- **Market cards**: gold-edge on hover, price chip with gradient.
- **Messages inbox rows**: avatar ring, subtle divider gradient.
- **Profile header**: bronze-to-gold gradient banner, KingPin badge shimmer.
- **Empty states**: replace flat text with statue-silhouette watermark + gold CTA.
- **Buttons everywhere**: ensure `.tap` + gold-gradient variant is applied to primary CTAs.

### 4. Every button works
Audit pass — wire up any dead buttons found in:
- Home (`CampusPulse`, `DailyCard`, `CampusFeed` action bar)
- Market cards (message / save / book)
- Profile (edit, share, settings)
- HBCUS tabs (all secondary chips)
- Business Center tabs
- Economy dashboard cards
- Safety center action buttons
- Upgrade / checkout CTAs

For each dead button: either `<Link to="...">` an existing route, open a `Sheet`/`Dialog` with placeholder content, or fire a `toast()` acknowledgment. No no-op onClicks left.

## Technical notes

- `MiniCampusLayout` = pure SVG render of `CampusLayout`, ~120px tall, no controls. Shares `generateCampusLayout` server fn; react-query key `["campus-layout", school]` dedupes with the full view.
- Generating layouts for 15+ schools on directory load = 15 parallel Gemini calls. Mitigate: lazy-generate on tile-in-viewport (IntersectionObserver) + 30-min staleTime already set. First visit warms cache; subsequent visits instant.
- New logo: use `imagegen--generate_image` premium with transparent background, matching the statue's bronze/verdigris palette + upraised plug pose. Save to `src/assets/plugu-logo.png` overwriting existing.
- Button audit: grep `onClick={() =>` and `<button` across routes to find no-ops; also grep for `TODO`, `disabled` placeholders.

## Out of scope (won't touch)
- Google Maps integration (blocked — no connector).
- HBCUS urban animation pass (separate future work).
- Any backend/schema changes.

## Deliverables
1. `src/components/MiniCampusLayout.tsx` (new)
2. `src/routes/hbcus.tsx` — directory grid renders MiniCampusLayout per school
3. `src/routes/map.tsx` — CampusLayoutAI embedded under campus header
4. `src/assets/plugu-logo.png` — regenerated to statue-style bronze
5. Polish patches across AppShell, Market, Messages, Profile, EmptyState
6. Button-audit patches across all routes listed above
