# PlugU — App Store Review Access

PlugU is a students-only marketplace. Sign-up normally requires a verified
`.edu` school email, so a dedicated demo account is provisioned for Apple's
review team. It is a regular member account with no admin privileges.

## Demo credentials

- Email: `appreview@plugudemo.com`
- Password: Set and verify the production Supabase Auth password before
  submission; keep the working password in App Store Connect, not this repo.
- School shown in app: Talladega College

Apple reported that the previously submitted credentials could not sign in.
The account's existence, confirmation state, password and profile must be
verified in production Supabase. Do not assume this document proves access
works. The account must be a normal member with no admin privileges, verified
for Talladega College, and must not be deleted or suspended.

## How to sign in

1. Launch the app and let the intro play (it is skippable — tap **Skip**).
2. On the account screen tap **Sign in** (small link under "Create account").
3. Enter the demo credentials above and tap **Sign in**.

No email confirmation, verification code, or phone number is required for
this account.

## What reviewers can exercise

- Home, Marketplace (listings + campus posts), Search, Campus Hub, Live Map
- Messaging, Orders, Notifications, Profile and Settings
- Sign out and sign back in with the same credentials, repeatedly
- Report / hide / block controls on all user-generated content
- Account deletion in **Settings → Delete account** (do not use on this
  account — it permanently removes it)
- Digital-goods purchases are not sold inside the iOS app

## Notes

- Location is optional. Every part of PlugU works without it. The Live Map is a
  campus-only tool, so it asks once with **Continue** / **Not Now**; choosing
  **Not Now** is never re-prompted and leaves the rest of the app fully usable.
- All content is user-generated and moderated: every post, listing, message
  and review can be reported, and blocked users disappear from the feed.

## Build 17 release gates

- Reset or set the production Supabase Auth password, then test sign-in with a
  clean install of the exact build. Enter only that verified password in App
  Store Connect; updating this document does not change the remote account.
- Before resubmission, populate Talladega College's Market with active
  listings posted by real, verified Talladega students. Do not use generated
  or sample listings. Verify listing details and seller profiles in the
  production review path; an empty Talladega Market blocks resubmission.
- Complete the clean-install iPad checklist in
  `docs/app-review/IOS-DEVICE-TEST-CHECKLIST.md` against Build 17.
