# PlugU — Asset Provenance

This file records the source and ownership status of every significant visual
asset shipped in the app. Where ownership is not fully documented in this
repository, the asset is flagged for replacement rather than asserted as
licensed.

## Owned / generated for PlugU

| Asset | Location | Status |
| --- | --- | --- |
| PlugU wordmark and charger mark | `src/assets/plugu-charger-mark.png`, app icons in `ios/App/App/Assets.xcassets` | Created for PlugU |
| Monument / statue launch art | `src/assets/plugu-monument-*.png`, `src/assets/plugu-statue.jpg` | Generated for PlugU inside this project |
| Category tiles (hair, nails, food, rides, tutoring, clothing, dorm, photo, music, design, events) | `src/assets/cat/*.jpg` | Generated for PlugU inside this project |
| Hero and spotlight imagery | `src/assets/plugu-hero.jpg`, `src/assets/spotlight-*.jpg`, `src/assets/listing-hoodie.jpg`, `src/assets/campus-map.jpg` | Generated for PlugU inside this project |
| Onboarding scenes, launch animation, charging loader | Inline SVG/CSS in `src/components/OnboardingExperience.tsx`, `SplashScreen.tsx`, `ChargingLoader.tsx` | Authored in this repository |

## Third-party, licensed for redistribution

| Asset | Source | License |
| --- | --- | --- |
| Interface icons | `lucide-react` | ISC |
| UI primitives | Radix UI via shadcn/ui pattern | MIT |
| Fonts | System font stack plus web fonts loaded in the root document | Open-licensed families only; no bundled commercial font files |

## Third-party content rendered at runtime (not bundled)

| Content | Source | Notes |
| --- | --- | --- |
| Campus photos and satellite tiles | Google Places / Maps, fetched server-side and cached | Displayed with Google attribution; not redistributed as app assets |
| Campus and student news headlines | Public news RSS feeds | Headline, source name and link only, attributed to the publisher |

## Flagged for review before the next submission

- Any campus photo shown without visible Google attribution in a given screen
  state should be replaced by the built-in illustrated fallback.
- User-uploaded listing photos are the responsibility of the uploading student
  and are covered by the Terms and Community Standards; they are removable
  through the moderation queue.
