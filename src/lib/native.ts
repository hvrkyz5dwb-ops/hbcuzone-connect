// Native (Capacitor) runtime bootstrap. No-ops on the web.
// Handles: status bar styling, splash hide, Android hardware back button,
// keyboard insets, and a `native` class on <html> for safe-area padding.

let started = false;

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
}

/**
 * Open this app's entry in the device Settings app so the student can turn a
 * permission back on. On the web there is no OS settings screen, so this is a
 * no-op and callers keep showing their written instructions.
 */
export function openAppSettings(): void {
  if (typeof window === "undefined") return;
  if (!isNativeApp()) return;
  try {
    window.location.href = "app-settings:";
  } catch {}
}

export function nativePlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  const p = cap?.getPlatform?.();
  return p === "ios" || p === "android" ? p : "web";
}

/**
 * Dismiss the native launch screen. Never throws, never hangs: the plugin
 * call is raced against a short timeout so a wedged bridge can't keep the
 * app stuck on the splash (App Review: iOS 26 freeze on launch).
 */
export async function hideNativeSplash(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await Promise.race([
      SplashScreen.hide(),
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]);
  } catch {}
}

export async function initNative(): Promise<void> {
  if (started || !isNativeApp()) return;
  started = true;

  const platform = nativePlatform();
  document.documentElement.classList.add("native", `native-${platform}`);

  // Hide FIRST — before any other bridge call — so nothing downstream can
  // block the handoff from the launch screen to the web app.
  void hideNativeSplash();
  // Belt and braces: retry once shortly after in case the bridge wasn't
  // ready yet on the first attempt.
  setTimeout(() => { void hideNativeSplash(); }, 1500);

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    if (platform === "android") {
      await StatusBar.setBackgroundColor({ color: "#0a0a0a" });
      await StatusBar.setOverlaysWebView({ overlay: true });
    }
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