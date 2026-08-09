# PlugU — iOS & Android App Setup

PlugU is now wrapped as a native app with Capacitor. The native shell loads the
live PlugU build, so every future change you publish ships to the apps instantly
(no app-store resubmission for UI changes).

## One-time setup (on your Mac / PC)

1. Push this project to GitHub (**GitHub → Connect** in the top right), then
   `git clone` it and run `npm install`.
2. Add the platforms:
   ```bash
   npx cap add ios       # macOS + Xcode required
   npx cap add android   # Android Studio required
   ```
3. Sync the config and native plugins:
   ```bash
   npm run build
   npx cap sync
   ```
4. Run on a device or simulator:
   ```bash
   npx cap run ios
   npx cap run android
   ```

## What's configured

- **App ID:** `app.lovable.plugu` · **Name:** PlugU
- **Loads:** `https://hbcuzone-connect.lovable.app` (edit `server.url` in
  `capacitor.config.ts` to test against the preview URL instead)
- **Status bar:** dark, overlaying the webview, PlugU black `#0a0a0a`
- **Splash:** black background, hidden by the app once the cinematic splash boots
- **Keyboard:** native insets feed the bottom-nav lift
- **Android back button:** goes back in history, exits at the root
- **Haptics:** `tapHaptic()` available from `src/lib/native.ts`

## Before store submission

- iOS: set the bundle ID, signing team, and app icons in Xcode
  (`ios/App/App/Assets.xcassets`). Add camera/photo usage strings to
  `Info.plist` only if you add those features.
- Android: set `applicationId`, version code, and icons in Android Studio.
- Both stores require a privacy policy URL — use `/privacy`.
- Payments: Apple requires in-app purchase for digital goods. PlugU subscriptions
  billed through Stripe may need an IAP path or must be positioned as
  physical/real-world services (Apple guideline 3.1.3(e) marketplace exemption).

## Testing on a real device

Point `server.url` at the preview URL while developing so you get live reload
against your latest changes, then flip it back to the published URL before you
build a release.