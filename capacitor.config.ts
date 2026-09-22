import type { CapacitorConfig } from "@capacitor/cli";

// PlugU native shell (iOS + Android).
// The app is a server-rendered TanStack Start app, so the native shell loads
// the hosted build. Point `server.url` at your published site (or the preview
// URL while developing) and run `npx cap sync`.
const config: CapacitorConfig = {
  appId: "app.lovable.plugu",
  appName: "PlugU",
  webDir: "native/www",
  // Sent on every request so the web app can detect the native shell.
  appendUserAgent: "PlugUApp",
  server: {
    url: "https://hbcuzone-connect.lovable.app",
    cleartext: false,
    androidScheme: "https",
    // If the hosted app can't be reached, load the bundled branded page in
    // native/www instead of leaving the user on a blank/frozen webview.
    errorPath: "index.html",
    // Domains the webview may navigate to in-app (auth, payments, fonts, CDN).
    allowNavigation: [
      "hbcuzone-connect.lovable.app",
      "*.lovable.app",
      "*.supabase.co",
      "*.stripe.com",
      "checkout.stripe.com",
      "connect.stripe.com",
      "accounts.google.com",
      "fonts.googleapis.com",
      "fonts.gstatic.com",
    ],
  },
  ios: {
    contentInset: "never",
    backgroundColor: "#0a0a0a",
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false,
    preferredContentMode: "mobile",
  },
  android: {
    backgroundColor: "#0a0a0a",
  },
  plugins: {
    SplashScreen: {
      // Auto-hide is a safety net: if the web layer never boots (offline,
      // slow network, JS error) iOS still dismisses the launch screen
      // instead of freezing on it forever.
      launchAutoHide: true,
      launchShowDuration: 350,
      launchFadeOutDuration: 120,
      backgroundColor: "#0a0a0a",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      // Capacitor's "DARK" style means light foreground content, which is what
      // stays legible on PlugU's black chrome.
      style: "DARK",
      backgroundColor: "#0a0a0a",
      overlaysWebView: true,
    },
    Keyboard: {
      // Let WKWebView resize above the software keyboard. `none` can leave
      // the auth submit button hidden on iPhone/iPad during App Review.
      resize: "native",
      style: "DARK",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
