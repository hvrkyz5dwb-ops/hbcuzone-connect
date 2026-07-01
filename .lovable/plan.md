## Goal
Turn the static statue moment in the cinematic splash into a living scene: silhouetted people walking up to the pedestal, stopping, and raising phones to capture the ignited "P" — organized chaos, all in silhouette so it stays premium and on-brand.

## Where it lives
`src/components/SplashScreen.tsx` — add a new "crowd" layer between the statue (`z-6`) and the rain/dust (`z-7`), plus keyframes in `src/styles.css`.

## Design
Pure CSS/SVG silhouettes (no new assets, keeps splash <6s and 60fps):

- 8–10 SVG silhouette figures rendered at the base of the statue platform (bottom ~28% of screen), sized by "depth" (bigger = closer, foreground figures in front of statue base, background figures behind haze).
- Each figure = a small inline SVG with two states baked in:
  1. Walking body (arms swinging, legs alternating) — 2-frame CSS step animation.
  2. Phone-raised pose (arm bent up holding a rectangle) — swaps in mid-sequence.
- Movement: each figure translates horizontally across a lane with `plugu-crowd-walk-{L,R}` keyframes (varied durations 6–11s, staggered delays). About 60% of the way across, they pause for ~1.2s, switch to phone-raised pose, and a tiny gold flash rectangle blinks (camera flash) aimed at the statue. Then they resume walking off-frame.
- Random negative delays so on first paint the crowd is already mid-scene — no empty stage.
- Foreground figures are near-black with a faint champagne rim-light on the phone screen (matches gold palette). Background figures are lower opacity + slight blur for depth.
- A subtle ground haze gradient sits under the crowd so feet don't feel cut off.

## Timing
- First-visit splash (6s): crowd fades in at ~0.6s (after storm establishes), stays through the lightning strike, camera flashes intensify right after ignition at 1.5s (feels like the crowd is reacting to the strike), continues through breathe.
- Return-visit splash (3.5s): crowd already mid-motion, fewer figures (perf), same flash pattern.
- Respect `prefers-reduced-motion`: render figures static in phone-raised pose with no walking or flashes.

## Accessibility & perf
- `aria-hidden` on the whole layer (decorative).
- GPU-friendly `transform` + `opacity` only, no layout thrash.
- Single SVG sprite reused via `<use>` to keep DOM light (~10 nodes).

## Out of scope
No changes to `LoginTransition`, statue asset, wordmark, or auth flow. HBCUS urban animation stays as-is unless you want the same treatment there next.
