import type { CapacitorConfig } from "@capacitor/cli";

// PlugU native shell (iOS + Android).
// The app is a server-rendered TanStack Start app, so the native shell loads
// the hosted build. Point `server.url` at your published site (or the preview
// URL while developing) and run `npx cap sync`.
const config: CapacitorConfig = {
  appId: "app.lovable.plugu",
  appName: "PlugU",
  webDir: "native/www",
  server: {
    url: "https://hbcuzone-connect.lovable.app",
    cleartext: false,
    androidScheme: "https",
  },
  ios: {
    contentInset: "never",
    backgroundColor: "#0a0a0a",
  },
  android: {
    backgroundColor: "#0a0a0a",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
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