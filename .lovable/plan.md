# PlugU Cinematic + Premium UI Redesign

Following your own recommendation, I'll split this into **3 sequential prompts**. This plan covers Phase 1 in full detail and outlines Phases 2 & 3 so you know exactly what's coming. After each phase ships and you approve, we move to the next.

Reference image #1 (the statue montage) drives the cinematic. Reference image #2 (the home mock) drives the UI polish.

---

## Phase 1 — Cinematic Loading + Login (this build)

**Files touched:** `src/components/SplashScreen.tsx`, `src/components/LoginTransition.tsx`, `src/routes/login.tsx`, `src/styles.css`. No route or data changes.

### Splash rebuild (`SplashScreen.tsx`)
Rebuild as a layered cinematic stage using pure CSS/SVG (no new deps — keeps 60fps on mobile):

```text
z-0  night sky gradient (#000 → #05070c)
z-1  parallax cloud bands (3 layers, slow drift, blur 8-16px)
z-2  distant lightning flashes (2 timed keyframes, screen blend)
z-3  volumetric fog (bottom gradient + slow horizontal drift)
z-4  gold HUD rings behind statue (2 counter-rotating SVG rings, 40s+60s)
z-5  giant "P" wordmark — starts dark stroke, ignites at 2.6s
z-6  statue image (dim base) + energized overlay (opacity 0 → 0.9 at 2.6s)
z-7  rain streaks (SVG lines, translateY loop) + floating gold dust (blurred dots)
z-8  lightning-strike bolt SVG (from top → statue plug, 200ms flash at 2.5s)
z-9  full-screen white flash (80ms at 2.55s)
z-10 wordmark + tagline (fade in after ignition)
```

**Timing (first visit — 6s total):**
- 0.0–2.4s: rumble ambience, clouds drift, distant lightning, camera slow-push (transform scale 1 → 1.06)
- 2.5s: bolt SVG draws top→plug, white flash
- 2.6s: statue energized overlay + "P" ignition + gold spread across pedestal/buildings
- 2.8s–5.5s: HUD rings visible, banners wave, breathing glow on statue
- 5.5–6.0s: fade to next screen

**Timing (return visit — 3.5s):** skip bolt sequence; just clouds + soft glow + brief camera push. Persistence already uses `localStorage plugu.splash.seen`.

### Login transition (`LoginTransition.tsx`)
Rewrite to be the "storm-clearing" bridge instead of a hard flash:
- Storm layer fades out over 1.5s
- Warm sunlight gradient fades in (`radial-gradient(70% 60% at 50% 20%, rgba(255,210,140,0.5), transparent)`)
- Gold dust particles remain
- Camera pushes into the "P" (scale 1 → 1.4, opacity → 0)
- Duration: 2.4s, then Home fades in from within the P

### Login screen (`login.tsx`)
Keep existing `.edu` + 4-digit code flow — only refine presentation:
- Backdrop: reuse splash's calmed environment (clouds still, soft gold rim light)
- Glass card fades in through gold particles at 800ms with depth-blur (backdrop-blur-2xl, subtle scale 0.96 → 1)
- Copy trimmed to: title "Welcome to PlugU", one field, one CTA, one verification notice line
- Remove the secondary "New here? Create account" link from the primary panel — moved to a subtle footer link
- Preserve all validation, toast-delivered demo code, error states

### Styles (`styles.css`)
Add keyframes: `plugu-cloud-drift-a/b/c`, `plugu-rain`, `plugu-dust-float`, `plugu-hud-spin-cw`, `plugu-hud-spin-ccw`, `plugu-bolt-draw`, `plugu-ignite`, `plugu-breathing-glow`, `plugu-camera-push`, `plugu-storm-clear-warm`, `plugu-p-push`. All GPU-friendly (transform/opacity only).

---

## Phase 2 — Home Screen Polish (next prompt, after Phase 1 approved)

Match reference image #2, then push further. Preserves all functionality.

- **AppShell top bar**: increase padding, thin gold hairline, PLUGU wordmark refined
- **Center nav "P" button**: soft breathing pulse (2.4s ease-in-out infinite, 0.95↔1.02)
- **Quick actions row (Sell/Book/Map/Inbox)**: taller tiles, 20px radius, spacing bumped to gap-3, remove excess gold, icon-only gold accent
- **PlugU Daily card**: single-line pill with subtle waveform pulse instead of glowing block
- **Trending businesses**: avatar with gold ring only for KingPin, sparkline gold gradient, activity count replaces $ metric
- **Marketplace highlights**: bigger product cards, black hoodie mock treatment, price chip with faint gold gradient, hover lift
- **Bottom nav**: darker glass, gold-underline for active tab, morph transition between tabs
- **Footer strip**: the "EXCLUSIVE / VERIFIED / REAL TIME / BUILT BY US" row from reference #2 added below nav on Home only

Spacing overhaul: base padding 20px, section gap 28px, card radius 20px, Apple-grade rhythm.

---

## Phase 3 — Micro-interactions & Performance (final prompt)

- Button tap scale (0.97) via existing `.tap` utility applied globally
- Card enter animation (slide up + fade, staggered 40ms) via IntersectionObserver
- Verified badge shimmer (one-shot on mount)
- Graph draw-in on economy/business cards
- Nav morph transitions
- Route transitions (fade + subtle scale)
- Perf audit: reduce splash to `will-change: transform, opacity` only; lazy-mount heavy orbits; drop unused Cormorant weights; verify 60fps on throttled mobile

---

## Out of scope (all phases)
- Real email delivery for the code (still toast-based until backend wired)
- Route/data model changes
- New features — polish only

---

## Deliverables (Phase 1 only, this build)
1. Rewritten `src/components/SplashScreen.tsx` with layered cinematic
2. Rewritten `src/components/LoginTransition.tsx` (storm-clear + P push)
3. Refined `src/routes/login.tsx` (glass card fade through particles)
4. New keyframes/utilities in `src/styles.css`

Approve to start Phase 1, or tell me to adjust scope/timing first.
