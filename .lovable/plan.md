# PlugU Cinematic Launch Splash — "The Monument Powers On"

Rebuild the splash into a 6-scene cinematic sequence (2.5s) matching the uploaded storyboard: storm clouds, the obsidian-and-gold monument emerging, lightning striking the glowing U, the whole P powering on, then a zoom through the center of the P straight into Home. Add a first-launch welcome overlay after account creation, and synthesized cinematic audio.

## What gets built

### 1. New layered monument artwork
Generate production art matching the storyboard (obsidian monument P with plug prongs, champagne-gold edges, storm clouds, wet reflective base):
- Storm sky background layer (dark clouds, subtle depth)
- Monument layer (the P statue, unlit)
- "U glowing" overlay variant for the power-on moment
- Saved as Lovable asset pointers, preloaded from `__root.tsx` so first paint never waits

### 2. SplashScreen rebuild — 6 timed scenes (~2.5s total)
Rewrite `src/components/SplashScreen.tsx` as a layered stage driven by one timeline:
1. **0.0–0.4s Darkness** — fade from black, slow-drifting cloud layer
2. **0.4–0.9s Monument appears** — statue reveals from darkness via brightness/contrast ramp, faint lightning reflections, U at ~10% glow
3. **0.9–1.3s Power builds** — cloud lightning flickers, small spark particles travel up the plug prongs, U brightens, camera slowly pushes in (scale transform)
4. **1.3–1.6s Impact** — procedural branching SVG lightning bolt crashes into the U with bloom flash (near-white-hot for ~100ms), electric arcs around the U, subtle screen shake
5. **1.6–2.1s Logo powers on** — gold energy sweeps from the U through the cord into the full P, metallic reflections glow, sparks emit, clouds briefly illuminate
6. **2.1–2.5s Transition** — final gold pulse, camera zooms through the center of the P with a brief motion-blur, crossfading directly into the Home screen

Performance rules: only `transform`/`opacity` animate (GPU-composited), `contain: strict`, no animating blur filters except the single brief transition blur, reduced-motion users get a short 1.2s static fade instead.

### 3. Cinematic audio (synthesized, no audio files)
New `src/lib/splash-audio.ts` using WebAudio: deep thunder rumble (filtered noise), electrical crackle, low bass impact on the strike, metallic power-up sweep, soft digital startup chime at the transition. Timed to the scene clock, low volume, no music. Silently skipped when the browser blocks autoplay (cold launches with no prior tap) — it plays reliably after account creation since the user just interacted.

### 4. First-launch welcome overlay
After account creation only: splash plays, then a small centered glass card — "Welcome to PlugU ⚡ / Your campus just got connected." — auto-dismisses after ~2s into Home. Returning launches skip it.

### 5. Account-creation wiring
In `src/routes/auth.tsx` signup success: set a `plugu.welcome.pending` flag + mark `plugu.onboarded` before redirecting to Home, so the welcome overlay shows once and onboarding never appears again for that account.

### 6. Gating + cleanup
- Keep the existing launch gating in `AppShell.tsx` (plays once per app launch / fresh tab, 15s multi-tab duplicate suppression, signed-in users only)
- Remove the now-dead `LoginTransition.tsx` (defined but never used) and obsolete splash keyframes in `styles.css`, replaced by the new scene keyframes

## Verification
Playwright pass: fresh-launch splash timing and visuals (screenshots at each scene), reduced-motion skip, post-signup welcome overlay appears once, return launch has no overlay, zero console errors, animation uses compositor-only properties.

## Technical notes
- **Audio autoplay**: mobile browsers block audio before the first user gesture. Post-signup plays with sound (the signup tap unlocks audio); cold launches may play silently — a platform constraint, not a bug.
- **Web, not native**: "Lottie/Rive or equivalent" maps to a code-driven layered animation here — it hits 60fps, supports reduced-motion, and enables the seamless zoom-into-Home transition a video file can't.
- Existing keys reused: `plugu.splash.playedThisSession`, `plugu.splash.lastPlayedAt`, `plugu.onboarded`.