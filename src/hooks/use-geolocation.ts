import { useCallback, useEffect, useRef, useState } from "react";

export type GeoState = {
  status: "idle" | "prompt" | "granted" | "denied" | "unsupported" | "error";
  coords?: { lat: number; lng: number; accuracy: number };
  error?: string;
};

/**
 * "While using" geolocation. Only starts after the user opts in via `request()`.
 * Watches position while active, and stops on `stop()` / unmount.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle" });
  const watchId = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (watchId.current != null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ status: "unsupported", error: "Geolocation not available on this device." });
      return;
    }
    setState({ status: "prompt" });
    stop();
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          status: "granted",
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
        });
      },
      (err) => {
        setState({
          status: err.code === err.PERMISSION_DENIED ? "denied" : "error",
          error: err.message,
        });
      },
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 10000 },
    );
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { ...state, request, stop };
}