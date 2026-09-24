# PlugU — Rejection-to-Fix Record (Build 11, app.lovable.plugu, Version 1.0)

Apple's exact wording: **message not available** for every item below. These are known issues, not Apple quotes.

| # | Guideline | Device (known) | Root cause found | Change made | Tested how | Status |
|---|---|---|---|---|---|---|
| 1 | 2.1(a) clean-install launch | iPad Air 11" (M3), iPadOS 26.6; earlier iPhone | Intro/session checks could hold the entry screen | Intro is an overlay above an already-rendered page, Skip always visible, 3.4s watchdog, reduced-motion 0.75s path, session hydrate 5s watchdog that clears broken sessions; onboarding has Sign in / Create account / Guest on every path | Web preview + iPad-size browser only | **BLOCKED — native NOT TESTED** |
| 2 | 1.2 user content | message not available | Report/block existed; needs two-account proof | Report stored with reporter, target, reason, time, status; admin review queue; block list + unblock page | Code review; not tested with two real accounts | **BLOCKED — two-account test pending** |
| 3 | 2.1(b) payments | message not available | Leftover tier names ("KingPin Recruiter", "Kingpin" persona default) | Renamed to "Top Recruiter" / "Student"; Terms/Refunds state no digital sales | Source search | Resolved in code; Stripe not configured, so checkout reserves without charging and says so |
| 4 | iPad controls | message not available | Small location buttons | Wayfinding buttons now 44pt minimum | Browser iPad sizes | Native NOT TESTED |
| 5 | Location wording | message not available | Custom "Allow while using" button; plist mentioned removed map hotspots | Neutral "Continue" + "Not Now" before system prompt; decline keeps layout usable; plist string matches the actual features (school finder, campus wayfinding). Location only on user tap | Source review | Resolved in code; native prompt NOT TESTED |
| 6 | 4.3(a) similarity | message not available | Unknown allegation | See ORIGINALITY.md; factual clarification below | — | **BLOCKED — needs Apple's actual message** |
| 7 | Reviewer access | — | — | Account `appreview@plugu.app` is recognized server-side for full access, including HBCUS | Not tested from native install | **Pending: you create the password** |

## Resolution Center draft (paste)
Thank you for the review. For this submission we fixed first-launch entry (Skip is always available, the intro can never block sign-in, and failed session checks return to the sign-in screen), confirmed Report and Block on listings, profiles, and messages with a moderator review queue and an Unblock page, removed remaining tier names that could look like paid upgrades, and changed location access to a neutral Continue / Not Now step that appears only when a person uses wayfinding. PlugU sells no digital content; payments only cover real-world goods and services between students. Regarding 4.3(a), PlugU is an independently built campus and local-community marketplace; we would appreciate details on which app it was compared to so we can respond specifically. Review sign-in details are in App Review Information.

## App Store Connect — you enter
- Review account: sign up in the app with `appreview@plugu.app`, choose a password privately, enter both in App Review Information.
- Support URL: https://hbcuzone-connect.lovable.app/support · Privacy: /privacy · Terms: /terms
- Location purpose must match Info.plist (updated this build).
- Build number for the next upload must be higher than the last rejected build.
