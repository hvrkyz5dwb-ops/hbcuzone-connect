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
      launchShowDuration: 2500,
      launchFadeOutDuration: 300,
      backgroundColor: "#0a0a0a",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0a0a",
      overlaysWebView: true,
    },
    Keyboard: {
      resize: "none",
      style: "DARK",
      resizeOnFullScreen: true,
    },
  },
};

export default config;