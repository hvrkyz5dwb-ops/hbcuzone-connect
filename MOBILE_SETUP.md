# PlugU — iOS App Store Submission Guide

PlugU ships as a native iOS app through Capacitor. The native shell (`ios/`) is
committed to this repository, so you can clone it, open it in Xcode, sign it
with your Apple Developer account, archive, and upload to App Store Connect.

## What is already configured

| Item | Value |
| --- | --- |
| Bundle ID | `app.lovable.plugu` |
| App name | PlugU |
| Version / build | Read from Xcode (`MARKETING_VERSION` / `CURRENT_PROJECT_VERSION`) |
| Deployment target | iOS 15.0 |
| Orientation | Portrait only (iPhone) |
| Appearance | Forced dark, light status bar, PlugU black `#0a0a0a` |
| App icon | 1024×1024 gold "P" on black, opaque (no alpha — App Store safe) |
| Launch screen | Black with centered PlugU mark |
| Plugins | App, Haptics, Keyboard, Splash Screen, Status Bar (Swift Package Manager) |
| Encryption | `ITSAppUsesNonExemptEncryption = false` (skips export-compliance prompts) |
| Privacy strings | Camera, Photos, Photo add, Location (when in use) |
| Content | Loads the live PlugU build at `https://hbcuzone-connect.lovable.app` |
| Offline | Bundled branded fallback page (`native/www`) with auto-retry |

Because the shell loads the hosted build, every web change you publish from
Lovable reaches installed apps instantly — no resubmission for UI updates.

## Build and upload

On a Mac with Xcode 15+ installed:

```bash
git clone <your-repo-url> plugu && cd plugu
npm install           # REQUIRED — CapApp-SPM resolves plugins from node_modules/@capacitor/*
npm run ios:sync      # npx cap sync ios
npx cap open ios      # opens ios/App/App.xcodeproj in Xcode
```

> If Xcode reports *"Missing package product 'CapacitorApp'"* or a path under
> `node_modules/@capacitor/app` that does not exist, `npm install` has not been
> run in the repo root. Run `npm run ios:bootstrap` (install + sync), then in
> Xcode: **File → Packages → Reset Package Caches**.

In Xcode:

1. Select the **App** target → **Signing & Capabilities**.
2. Check **Automatically manage signing** and pick your Apple Developer Team.
   Change the bundle identifier if `app.lovable.plugu` is already taken in your
   account (also update `appId` in `capacitor.config.ts` if you do).
3. Set the destination to **Any iOS Device (arm64)**.
4. **Product → Archive**.
5. In the Organizer: **Distribute App → App Store Connect → Upload**.

Capacitor 8 resolves plugins with Swift Package Manager, so there is no
CocoaPods step and no `.xcworkspace` — open `App.xcodeproj` directly.

## Pointing at preview vs production

`capacitor.config.ts` → `server.url` controls what the app loads.

- Production (default): `https://hbcuzone-connect.lovable.app`
- Live-reload against preview: swap in your preview URL, then `npx cap sync ios`

Ship a release build only with the production URL.

## App Store Connect checklist

- **Privacy Policy URL:** `https://hbcuzone-connect.lovable.app/privacy`
- **Support URL:** `https://hbcuzone-connect.lovable.app/support`
- **Account deletion:** required by Apple — `/delete-account` is live in the app.
- **Demo account:** App Review must be able to sign in. Use the permanent,
  pre-verified account in `docs/app-review/REVIEWER-WALKTHROUGH.md` and put the
  same credentials in App Review Notes. Do not ask Apple to create an account
  or provide a school inbox.
- **Age rating:** user-generated content + messaging → declare UGC and confirm
  you have reporting and blocking (PlugU has both: report dialogs and blocks).
- **Data safety / privacy nutrition labels:** email, name, campus, photos,
  approximate location, purchase history, user content, identifiers.
- **Payments (guideline 3.1.1 / 3.1.3):** PlugU only processes payments for
  physical goods and real-world services between students. PlugU has no paid
  memberships, digital upgrades, or paid visibility products in this release.
- **Guideline 4.2 (minimum functionality):** the shell is not a plain website
  wrapper — it uses native status bar, splash, haptics, keyboard insets, and
  hardware back handling. Mention this in App Review Notes.

## Screenshots required

6.7" (iPhone 15/16 Pro Max) and 6.5" sets, portrait. Good candidates: cinematic
splash, Home, Market, Campus Hub map, Messages, Profile.

## After the first release

```bash
# bump build number in Xcode (CURRENT_PROJECT_VERSION), then
npm run ios:sync
```

Only re-archive when you change native config, plugins, icons, or the offline
shell. Pure web/UI changes go live through Lovable publish.
