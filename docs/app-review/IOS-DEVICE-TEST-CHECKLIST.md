# PlugU — iPad Air on-device test checklist

Everything in this file is **NOT TESTED**. It can only be marked tested after it
is run on real hardware and the result is reported back.

## Build identifier — confirm before you start

| Field | Value |
| --- | --- |
| Bundle ID | `app.lovable.plugu` |
| Display name | PlugU |
| Marketing version (`MARKETING_VERSION`) | **1.0** |
| Build number (`CURRENT_PROJECT_VERSION`) | **11** |
| Server the shell loads | `https://hbcuzone-connect.lovable.app` |

In Xcode: select the **App** target → **General** → confirm Version `1.0` and
Build `11`. If either differs, you are not testing the build intended for Apple.
Bump the build number only if you re-archive, and tell me the new number.

## Build and install

```bash
git pull
git rm --cached .env        # still pending; .env must not be in the repo
npm ci
npm run build
npx cap sync ios
   open ios/App/App.xcodeproj
```

In Xcode:
1. Target **App** → **Signing & Capabilities** → your team, automatic signing.
2. Connect the iPad Air (11-inch, M3) by cable, trust the Mac.
3. Choose the iPad as the run destination → **Product ▸ Run**.
4. Delete any previously installed PlugU first, so this is a clean install.
5. For the Apple upload: **Product ▸ Archive** → Distribute App → App Store Connect.
   Archive the *same* commit you tested.

## Test matrix — record PASS / FAIL / note for each

### Cold launch and first run
- [ ] NOT TESTED — Static native launch screen appears, no black screen.
- [ ] NOT TESTED — PlugU intro plays once, silently, ends on its own within ~3s.
- [ ] NOT TESTED — **Skip** is visible, tappable, and ends the intro immediately.
- [ ] NOT TESTED — Force quit and relaunch: intro does **not** replay.
- [ ] NOT TESTED — Settings ▸ Accessibility ▸ Motion ▸ Reduce Motion ON: intro is a plain fade, still ends.
- [ ] NOT TESTED — Airplane mode cold launch: app opens, shows an honest retry state, no endless spinner.

### Onboarding and entry
- [ ] NOT TESTED — Onboarding slides advance and go back; Skip works.
- [ ] NOT TESTED — Terms acknowledgement appears and must be accepted.
- [ ] NOT TESTED — **Continue as Guest** enters the app without any account.
- [ ] NOT TESTED — Guest can browse Home, Market, Events, Search, school pages and Map without being bounced to sign-in. HBCUS remains limited to verified HBCU students.

### Sign-in return path (most important native item)
- [ ] NOT TESTED — Email sign-in with `appreview@plugudemo.com` returns into the app, signed in.
- [ ] NOT TESTED — Google sign-in (if shown) returns into the app, not into Safari, and the session sticks.
- [ ] NOT TESTED — Password reset email link opens the app or a working web page.
- [ ] NOT TESTED — Sign out, then relaunch: app opens signed out, no crash.
- [ ] NOT TESTED — Corrupt/expired session: app returns to sign-in without a loop.

### Orientation and layout
- [ ] NOT TESTED — Portrait: no clipped controls, nothing under the status bar or home indicator.
- [ ] NOT TESTED — Landscape: same, and the bottom bar stays fully visible and tappable.
- [ ] NOT TESTED — Rotate while a sheet/dialog is open: it stays usable and dismissible.
- [ ] NOT TESTED — Keyboard open on a form: the submit button is not covered.
- [ ] NOT TESTED — Larger text (Settings ▸ Display ▸ Text Size): nothing overlaps or truncates badly.

### Market and listings
- [ ] NOT TESTED — Market opens; with no listings the empty state reads "Nothing posted here yet" with **Post the first listing** and **Browse all schools**.
- [ ] NOT TESTED — Signed in, create a real listing: title, description, price, category, **photo upload from the iPad**.
- [ ] NOT TESTED — The new listing appears in Market and in Search.
- [ ] NOT TESTED — Open the listing: all fields and the photo render.
- [ ] NOT TESTED — Tap the seller: their profile opens with their listings.
- [ ] NOT TESTED — Edit the listing, then delete it; both persist after relaunch.
- [ ] NOT TESTED — Switch campus to a different school: your listing does **not** appear there; switch back, it does.

### Safety
- [ ] NOT TESTED — Report a listing: reason list, submit, confirmation.
- [ ] NOT TESTED — Report a profile and a message.
- [ ] NOT TESTED — Block a user: their content disappears, persists after relaunch.
- [ ] NOT TESTED — Unblock from Settings ▸ Blocked users.
- [ ] NOT TESTED — Support contact opens in Settings ▸ Help & Safety.

### Permissions
- [ ] NOT TESTED — Location prompt shows the explanation with **Continue** / **Not Now**.
- [ ] NOT TESTED — Choosing **Not Now** does not block Market, Events or Search.
- [ ] NOT TESTED — Denying location then opening Live Map: manual school selection still works.
- [ ] NOT TESTED — Denying photo access on listing creation: clear message, no crash.
- [ ] NOT TESTED — No permission prompt repeats on every launch.

### Account deletion
- [ ] NOT TESTED — Settings ▸ Delete account is reachable in-app.
- [ ] NOT TESTED — Deletion completes, signs out, and the account cannot sign in again.
- [ ] NOT TESTED — Use a throwaway account, **not** the App Review account.

### Lifecycle
- [ ] NOT TESTED — Background for 5 minutes, return: state intact, no white screen.
- [ ] NOT TESTED — Force quit and relaunch: signed-in state restored.
- [ ] NOT TESTED — Follow an external link out and come back.
- [ ] NOT TESTED — Poor network (Settings ▸ Developer ▸ Network Link Conditioner, 3G): pages still resolve or show a retry.

## What to send me back

For each failure: the checklist line, what you saw, the screen, and whether it
reproduces. Screen recordings of the cold launch and the sign-in return path are
the two most useful.
