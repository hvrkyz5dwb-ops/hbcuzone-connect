## Goals

1. Respect `prefers-reduced-motion` on the splash: skip Ken Burns, glow pulse, and gold dust; show the courtyard poster as a static hero with just a quick fade.
2. Replace the center bottom-nav "P" icon with a new **"P + Charger Plug"** mark.
3. Replace the top-left statue/logo with a matching **"P wrapped by a charger cable"** that visually connects into the "plugU" wordmark.

## Changes

### 1. Reduced-motion splash fallback (`src/components/SplashScreen.tsx` + `src/styles.css`)
- Detect `window.matchMedia('(prefers-reduced-motion: reduce)')` once on mount.
- When reduced:
  - Render only the hero poster + a soft vignette (no Ken Burns transform, no breathing glow layer, no dust particles).
  - Shorten duration to ~1.2s with a simple opacity fade-out.
  - Skip `LoginTransition` parallax; use a plain cross-fade.
- When not reduced: current cinematic behavior unchanged.
- Add a `.splash-static` utility in `styles.css` (no `will-change`, no transforms).

### 2. New "P + Charger" logo asset
- Generate one premium PNG via `imagegen` (standard tier, transparent background): matte-black serif "P" with a champagne-gold coiled charger cable wrapping the stem, plug-tip peeking out at the bottom-right. Consistent with existing luxury palette (matte black, satin titanium, champagne gold).
- Save to `src/assets/plugu-charger-mark.png` via the assets CLI → `.asset.json` pointer.
- Reuse the same asset in two places at different sizes:
  - **Center bottom-nav** in `src/components/AppShell.tsx`: swap the current `Zap`/`P` glyph inside the gold-rimmed circle for `<img>` of the charger mark (kept inside the existing black sleek circle + gold rim-light — no layout change).
  - **Top-left header** in `src/components/AppShell.tsx`: replace the current statue-silhouette `plugu-logo.png` with the charger mark, sized ~28px, sitting immediately left of the "plugU" wordmark. The plug tip of the cable visually points into the "p" of "plugU" so it reads as one connected lockup.

### 3. Wordmark connection
- Wrap the header logo + wordmark in a single flex row with `-space-x-1` so the charger tip overlaps the leading "p" of `plugU`, selling the "plugged in" effect. Preserve the existing shiny chrome gradient on the wordmark text.

## Out of scope
- No changes to routes, auth, data, or animations elsewhere.
- Existing `plugu-logo.png` and `plugu-hero-splash.png` assets stay in the repo; only references in `AppShell.tsx` change. (I'll delete `plugu-logo.png` via `lovable-assets delete` only if nothing else references it after the swap.)

## Technical notes
- Image gen prompt tuned for transparent PNG, centered composition, no text, generous padding so the mark scales cleanly from 28px to 56px.
- Reduced-motion check runs client-side inside `useEffect` to avoid SSR hydration drift; SSR renders the non-animated safe markup by default and upgrades to cinematic after mount when motion is allowed.
