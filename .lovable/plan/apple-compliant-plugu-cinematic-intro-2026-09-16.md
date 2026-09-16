# Apple-compliant PlugU cinematic intro

## What will change
- Keep the native iOS launch screen static and logo-only, and shorten its automatic handoff so it cannot appear frozen.
- Replace the procedural statue animation and synthesized audio with one short, locally bundled, muted cinematic of Black HBCU students gathering around the PlugU monument as golden-white lightning powers it on.
- End on the illuminated monument with “YOU’VE BEEN PLUGGED IN.” as non-interactive text, then crossfade into whichever functioning screen is next.
- Show a safe-area-aware Skip control with at least a 44×44-point target throughout the intro.

## Reliability and accessibility
- Gate the full cinematic by a local release-version flag so it runs only after the app has loaded and only once after installation or an approved major intro update.
- Do not depend on sign-in, cookies, network calls, or database access.
- Treat load, decode, playback, and timeout failures as immediate completion; onboarding, authentication, and Home remain mounted or become available immediately.
- Respect Reduce Motion with a short static monument/logo fade and no lightning motion.
- Keep sound disabled and remove the old WebAudio startup effects.

## Device support and verification
- Use a responsive stage with contained focal framing, safe-area controls, and no important-content cropping across iPhone and iPad portrait/landscape.
- Verify clean first launch, replay suppression, Skip, simulated media failure, Reduce Motion, signed-out onboarding/auth handoff, signed-in Home handoff, overflow, and touch-target size.
- Confirm the iOS launch storyboard remains static and no build is published or submitted.

## Technical notes
- The cinematic file will be compressed and stored in the app’s local public assets, with a bundled still poster as fallback.
- A 2.5–3 second watchdog remains authoritative even if media events fail.
- The approved intro release key will be explicit in code so a future major update can intentionally replay it once by changing that value.
