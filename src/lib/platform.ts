// Runtime platform helpers. `isIosNative()` gates App Store compliance
// behaviour (digital purchases, prize promotions) that may not appear in
// the native iOS build.
import { useEffect, useState } from "react";
import { isNativeApp, nativePlatform } from "@/lib/native";

export function isIosNative(): boolean {
  return isNativeApp() && nativePlatform() === "ios";
}

/** SSR-safe: false during server render and the first client paint. */
export function useIsIosNative(): boolean {
  const [v, setV] = useState(false);
  useEffect(() => setV(isIosNative()), []);
  return v;
}
