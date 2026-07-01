## Goal
Replace the stormy splash sequence with the uploaded PlugU poster as the hero image — statue in courtyard, glowing P, banners, feature chips, "Welcome to PlugU" wordmark — and layer subtle cinematic motion over it so it feels alive, not static.

## Assets
- Upload the poster via `lovable-assets` → `src/assets/plugu-hero-splash.jpg.asset.json`.
- Remove the storm/rain/lightning/HUD-rings/crowd layers from splash. Keep the giant statue asset unused here (it's still referenced by `LoginTransition.tsx` and `profile.tsx` cover — leave those alone).

## SplashScreen.tsx rewrite
Full-bleed poster with a slow Ken Burns push and gentle gold-glow breathing on the P:
- **Layer 1**: `<img>` of the new poster, `object-cover object-center`, applied a 6s→3.5s subtle scale (1.00 → 1.05) + drift for cinematic "camera push."
- **Layer 2**: Soft warm vignette + a pulsing gold radial glow centered on the statue's P (breathe animation, reuses existing `plugu-breathe` timing).
- **Layer 3**: A few floating gold dust particles (reuse existing `.cine-dust`) drifting up — keeps the "alive" feel without competing with the poster.
- **Layer 4**: Bottom fade to black so the eventual wordmark/handoff to Home reads cleanly.
- **Timing**: First visit 4.5s, return visit 2.5s (shorter — poster tells the story instantly, no need for a 6s build). Cross-fade out at the end.
- **Reduced motion**: Static poster + fade only.

## LoginTransition.tsx
Swap its background from `plugu-statue.jpg` to the new poster so the login → home bridge stays visually continuous. Keep the warm-clear + giant-P push behavior.

## Styles
Add one new keyframe `plugu-hero-push` (slow scale + tiny translate). Everything else reuses existing utilities. No token changes.

## Out of scope
Login form, Home feed, HBCUS animation, and other statue usages (profile cover) stay as-is.
