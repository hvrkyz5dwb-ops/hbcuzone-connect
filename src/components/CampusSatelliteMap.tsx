import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, Satellite, Map as MapIcon, Loader2 } from "lucide-react";
import { locateCampus } from "@/lib/campus-imagery.functions";

type Props = { school: string; city?: string };

let mapsLoader: Promise<void> | null = null;

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as any;
  if (w.google?.maps?.Map) return Promise.resolve();
  if (mapsLoader) return mapsLoader;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
  mapsLoader = new Promise<void>((resolve, reject) => {
    w.__pluguInitMap = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__pluguInitMap${channel ? `&channel=${channel}` : ""}`;
    s.async = true;
    s.onerror = () => reject(new Error("Maps failed to load"));
    document.head.appendChild(s);
  });
  return mapsLoader;
}

/** Live, explorable satellite view of any college campus. */
export function CampusSatelliteMap({ school, city }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [view, setView] = useState<"satellite" | "roadmap">("satellite");
  const [mapError, setMapError] = useState(false);

  const fn = useServerFn(locateCampus);
  const q = useQuery({
    queryKey: ["campus-location", school, city],
    staleTime: 1000 * 60 * 60,
    queryFn: () => fn({ data: { school, city } }),
  });
  const loc = q.data;

  useEffect(() => {
    if (!loc?.found || !el.current || loc.lat == null) return;
    let cancelled = false;
    // Google signals a domain/key rejection through this global only.
    (window as any).gm_authFailure = () => !cancelled && setMapError(true);
    loadMaps()
      .then(() => {
        if (cancelled || !el.current) return;
        const g = (window as any).google;
        const center = { lat: loc.lat as number, lng: loc.lng as number };
        mapRef.current = new g.maps.Map(el.current, {
          center,
          zoom: 16,
          mapTypeId: view,
          tilt: 45,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
        });
        new g.maps.Marker({ position: center, map: mapRef.current, title: loc.name });
      })
      .catch(() => !cancelled && setMapError(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc?.found, loc?.lat, loc?.lng]);


  useEffect(() => {
    if (mapRef.current) mapRef.current.setMapTypeId(view);
  }, [view]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Satellite className="h-4 w-4 text-accent" />
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Real campus view</p>
        </div>
        <div className="flex gap-1.5">
          {(["satellite", "roadmap"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setView(m)}
              className={`text-[11px] inline-flex items-center gap-1 px-2.5 py-1 rounded-full border tap ${
                view === m ? "border-accent text-accent" : "border-border text-muted-foreground"
              }`}
            >
              {m === "satellite" ? <Satellite className="h-3 w-3" /> : <MapIcon className="h-3 w-3" />}
              {m === "satellite" ? "Satellite" : "Street map"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
        <div className="aspect-[4/3] w-full">
          {(q.isLoading || (!loc?.found && !q.isError)) && !mapError && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                Finding {school} on the map…
              </span>
            </div>
          )}
          {mapError ? (
            <CampusThumb
              school={school}
              city={city}
              mode="satellite"
              className="w-full h-full"
            />
          ) : (
            <div ref={el} className="w-full h-full" />
          )}
        </div>
      </div>


      {loc?.found && loc.address && (
        <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {loc.address}
        </p>
      )}
      {(mapError || loc?.error || (loc && !loc.found && !q.isLoading)) && (
        <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" /> Campus view unavailable for {school} right now.
        </p>
      )}
    </div>
  );
}
