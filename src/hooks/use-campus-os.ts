// Shared Campus OS state: which campus the student is on, its verified
// places, the live pins on it, and an opt-in device location.
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSchool } from "@/hooks/use-school";
import { useHomeCampus } from "@/hooks/use-home-campus";
import {
  fetchLivePins,
  fetchPlaces,
  fetchSavedPlaceIds,
  fetchTours,
  fetchTourStops,
  resolveCampus,
} from "@/lib/campus-os";
import type { LngLat } from "@/lib/map-service";

export function useActiveCampus() {
  const school = useSchool();
  const { active: homeCampus } = useHomeCampus();
  const name = school.verified ? school.name : homeCampus;
  const q = useQuery({
    queryKey: ["campus", name],
    staleTime: 10 * 60_000,
    queryFn: () => resolveCampus(name),
  });
  return { campus: q.data ?? null, campusName: name, loading: q.isPending };
}

export function useCampusPlaces(campusId?: string | null, category?: string) {
  return useQuery({
    queryKey: ["campus-places", campusId, category ?? "all"],
    enabled: !!campusId,
    staleTime: 5 * 60_000,
    queryFn: () => fetchPlaces(campusId!, category),
  });
}

export function useLivePins(campusId?: string | null) {
  return useQuery({
    queryKey: ["live-pins", campusId],
    enabled: !!campusId,
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: () => fetchLivePins(campusId),
  });
}

export function useCampusTours(campusId?: string | null) {
  return useQuery({
    queryKey: ["campus-tours", campusId],
    enabled: !!campusId,
    staleTime: 10 * 60_000,
    queryFn: () => fetchTours(campusId!),
  });
}

export function useTourStops(tourId?: string | null) {
  return useQuery({
    queryKey: ["campus-tour-stops", tourId],
    enabled: !!tourId,
    staleTime: 10 * 60_000,
    queryFn: () => fetchTourStops(tourId!),
  });
}

export function useSavedPlaces(enabled: boolean) {
  return useQuery({
    queryKey: ["saved-places"],
    enabled,
    staleTime: 60_000,
    queryFn: fetchSavedPlaceIds,
  });
}

/**
 * Opt-in location. Nothing is requested until the student presses the
 * button, and the reason is always shown next to it.
 */
export function useOptInLocation() {
  const [coords, setCoords] = useState<LngLat | null>(null);
  const [state, setState] = useState<"idle" | "asking" | "granted" | "denied" | "unsupported">("idle");
  const [watchId, setWatchId] = useState<number | null>(null);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState("unsupported");
      return;
    }
    setState("asking");
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
        setState("granted");
      },
      () => setState("denied"),
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 12_000 },
    );
    setWatchId(id);
  }, []);

  const stop = useCallback(() => {
    if (watchId != null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchId);
    }
    setWatchId(null);
    setCoords(null);
    setState("idle");
  }, [watchId]);

  useEffect(() => () => {
    if (watchId != null && typeof navigator !== "undefined") navigator.geolocation.clearWatch(watchId);
  }, [watchId]);

  return { coords, state, request, stop };
}
