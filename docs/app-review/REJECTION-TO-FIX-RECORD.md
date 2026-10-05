# PlugU — Rejection-to-Fix Record (Build 16, app.lovable.plugu, Version 1.0)

The October 3, 2026 review was performed on iPad Air 11-inch (M3), submission
`f7c7d338-4af0-4f19-a90c-80a84ca4ba3a`, version 1.0 (16). Findings 8–10 below
quote/summarize Apple's actual feedback; earlier entries retain their prior
context.

| # | Guideline | Device (known) | Root cause found | Change made | Tested how | Status |
|---|---|---|---|---|---|---|
| 1 | 2.1(a) clean-install launch | iPad Air 11" (M3), iPadOS 26.6; earlier iPhone | Intro/session checks could hold the entry screen | Intro is an overlay above an already-rendered page, Skip always visible, 3.4s watchdog, reduced-motion 0.75s path, session hydrate 5s watchdog that clears broken sessions; onboarding has Sign in / Create account / Guest on every path | Web preview + iPad-size browser only | **BLOCKED — native NOT TESTED** |
| 2 | 1.2 user content | message not available | Report/block existed; needs two-account proof | Report stored with reporter, target, reason, time, status; admin review queue; block list + unblock page | Code review; not tested with two real accounts | **BLOCKED — two-account test pending** |
| 3 | 2.1(b) payments | message not available | Leftover tier names ("KingPin Recruiter", "Kingpin" persona default) | Renamed to "Top Recruiter" / "Student"; Terms/Refunds state no digital sales | Source search | Resolved in code; Stripe not configured, so checkout reserves without charging and says so |
| 4 | iPad controls | message not available | Small location buttons | Wayfinding buttons now 44pt minimum | Browser iPad sizes | Native NOT TESTED |
| 5 | Location wording | message not available | Custom "Allow while using" button; plist mentioned removed map hotspots | Neutral "Continue" + "Not Now" before system prompt; decline keeps layout usable; plist string matches the actual features (school finder, campus wayfinding). Location only on user tap | Source review | Resolved in code; native prompt NOT TESTED |
| 6 | 4.3(a) similarity | message not available | Unknown allegation | See ORIGINALITY.md; factual clarification below | — | **BLOCKED — needs Apple's actual message** |
| 7 | Reviewer access | — | — | Build 17 documented reviewer identity is `appreview@plugudemo.com`, scoped to Talladega College; `appreview@plugu.app` remains a legacy compatibility alias | Not tested from native install | **BLOCKED — confirm Supabase Auth password and clean-iPad sign-in** |
| 8 | 2.1 Information Needed | iPad Air 11-inch (M3) | Apple could not sign in with `appreview@plugudemo.com` and the submitted password | No remote Auth change has been made. A local Supabase sign-in attempt returned `invalid_credentials`; this does not distinguish a missing account from a wrong password and was not an iPad test. | Local Supabase password-auth attempt only | **BLOCKED — reset/create account in production, then verify on clean iPad** |
| 9 | 2.2 Beta Testing | iPad Air 11-inch (M3) | Apple said the app appeared to be a pre-release/test/trial version with limited features and requested partially implemented features be completed, removed, or configured | Source scan found no explicit Beta/Test/Demo primary-navigation labels. Map now hides published tours with no stops. No screen-specific cause was provided; audit all exposed surfaces with a signed-in production account before resubmission. | Static source scan and production build; no iPad test | **BLOCKED — complete manual feature audit; use TestFlight if not public-ready** |
| 10 | 2.1(a) App Completeness | iPad Air 11-inch (M3) | Apple reported the marketplace had no content and was incomplete/placeholder-like | Read-only production query found one Talladega school record and 0 active, approved listings. No real inventory has been added. | Public Supabase listing query; no write | **BLOCKED — real, complete Talladega student listings required** |

## October 3, 2026 — Resubmission gates

- Do not resubmit while the reviewer login fails. Set/reset the account in the
	production Supabase Auth project and validate the final password on the
	exact clean iPad build before entering it in App Store Connect.
- Do not resubmit with an empty Talladega marketplace. Real, complete listings
	must be published by actual verified Talladega students; do not seed
	fictional listings to satisfy review.
- Audit every destination exposed to reviewers for unfinished flows and
	content. If a feature is not complete/configured for public use, finish it or
	remove its user-facing entry point before submission. If the app is not
	public-ready, distribute it through TestFlight instead.

## Resolution Center draft (paste)
Thank you for the review. For this submission we fixed first-launch entry (Skip is always available, the intro can never block sign-in, and failed session checks return to the sign-in screen), confirmed Report and Block on listings, profiles, and messages with a moderator review queue and an Unblock page, removed remaining tier names that could look like paid upgrades, and changed location access to a neutral Continue / Not Now step that appears only when a person uses wayfinding. PlugU sells no digital content; payments only cover real-world goods and services between students. Regarding 4.3(a), PlugU is an independently built campus and local-community marketplace; we would appreciate details on which app it was compared to so we can respond specifically. Review sign-in details are in App Review Information.

## App Store Connect — you enter
- Review account: `appreview@plugudemo.com` / the newly verified production
	password. Do not reuse the password rejected on October 3, 2026.
- Support URL: https://hbcuzone-connect.lovable.app/support · Privacy: /privacy · Terms: /terms
- Location purpose must match Info.plist (updated this build).
- Build number for the next upload must be higher than the last rejected build.
