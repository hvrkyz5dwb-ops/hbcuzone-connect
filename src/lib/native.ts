// Native (Capacitor) runtime bootstrap. No-ops on the web.
// Handles: status bar styling, splash hide, Android hardware back button,
// keyboard insets, and a `native` class on <html> for safe-area padding.

let started = false;

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
}

export function nativePlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  const p = cap?.getPlatform?.();
  return p === "ios" || p === "android" ? p : "web";
}

export async function initNative(): Promise<void> {
  if (started || !isNativeApp()) return;
  started = true;

  const platform = nativePlatform();
  document.documentElement.classList.add("native", `native-${platform}`);

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    if (platform === "android") {
      await StatusBar.setBackgroundColor({ color: "#0a0a0a" });
      await StatusBar.setOverlaysWebView({ overlay: true });
    }
  } catch {}

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {}

  try {
    const { Keyboard } = await import("@capacitor/keyboard");
    Keyboard.addListener("keyboardWillShow", (info) => {
      document.documentElement.style.setProperty("--kb-offset", `${info.keyboardHeight}px`);
    });
    Keyboard.addListener("keyboardWillHide", () => {
      document.documentElement.style.setProperty("--kb-offset", "0px");
    });
  } catch {}

  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack && window.history.length > 1) window.history.back();
      else void App.exitApp();
    });
  } catch {}
}

/** Light haptic tap for primary actions. Silent no-op on web. */
export async function tapHaptic(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
}