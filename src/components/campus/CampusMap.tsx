// Thin React wrapper around the map provider (see src/lib/map-service.ts).
// Loaded client-side only: the GL engine touches window/canvas.
import { useEffect, useRef, useState } from "react";
import { Crosshair, Compass } from "lucide-react";
import {
  MAP_STYLE_URL,
  clusterMarkers,
  type MarkerInput,
  type LngLat,
} from "@/lib/map-service";

type Props = {
  center: LngLat;
  zoom?: number;
  markers: MarkerInput[];
  routePath?: [number, number][] | null;
  userLocation?: LngLat | null;
  className?: string;
  ariaLabel: string;
};

const TONE: Record<MarkerInput["tone"], { bg: string; fg: string }> = {
  gold: { bg: "var(--plugu-gold, #d4af37)", fg: "#0b0b0c" },
  chrome: { bg: "#cfd3d8", fg: "#0b0b0c" },
  live: { bg: "#22c55e", fg: "#04120a" },
  muted: { bg: "#3f3f46", fg: "#e5e7eb" },
};

export function CampusMap({
  center,
  zoom = 15.5,
  markers,
  routePath,
  userLocation,
  className,
  ariaLabel,
}: Props) {
  const holder = useRef<HTMLDivElement | null>(null);
  const map = useRef<any>(null);
  const markerRefs = useRef<any[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(zoom);

  // boot
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const maplibre = await import("maplibre-gl");
        await import("maplibre-gl/dist/maplibre-gl.css");
        if (cancelled || !holder.current) return;
        const m = new maplibre.Map({
          container: holder.current,
          style: MAP_STYLE_URL,
          center: [center.lng, center.lat],
          zoom,
          attributionControl: { compact: true },
        });
        m.on("load", () => !cancelled && setReady(true));
        m.on("error", () => !cancelled && setFailed(true));
        m.on("zoomend", () => !cancelled && setZoomLevel(m.getZoom()));
        map.current = m;
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      map.current?.remove?.();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // recenter when the campus changes
  useEffect(() => {
    if (ready && map.current) map.current.easeTo({ center: [center.lng, center.lat] });
  }, [ready, center.lat, center.lng]);

  // markers (clustered)
  useEffect(() => {
    if (!ready || !map.current) return;
    let cancelled = false;
    (async () => {
      const maplibre = await import("maplibre-gl");
      if (cancelled || !map.current) return;
      markerRefs.current.forEach((m) => m.remove());
      markerRefs.current = [];
      for (const c of clusterMarkers(markers, zoomLevel)) {
        const el = document.createElement("button");
        el.type = "button";
        el.setAttribute("aria-label", c.label);
        el.title = c.label;
        const tone = TONE[c.tone];
        el.style.cssText = `display:grid;place-items:center;width:30px;height:30px;border-radius:999px;border:1.5px solid rgba(0,0,0,.5);background:${tone.bg};color:${tone.fg};font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.45)`;
        el.textContent = c.count > 1 ? String(c.count) : c.glyph;
        el.onclick = () => {
          if (c.count > 1) {
            map.current?.easeTo({ center: [c.lng, c.lat], zoom: Math.min(18, zoomLevel + 2) });
          } else {
            c.onSelect?.();
          }
        };
        markerRefs.current.push(
          new maplibre.Marker({ element: el }).setLngLat([c.lng, c.lat]).addTo(map.current),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, markers, zoomLevel]);

  // route line
  useEffect(() => {
    if (!ready || !map.current) return;
    const m = map.current;
    const data = {
      type: "FeatureCollection",
      features: routePath
        ? [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: routePath } }]
        : [],
    };
    if (m.getSource("plugu-route")) {
      m.getSource("plugu-route").setData(data);
    } else {
      m.addSource("plugu-route", { type: "geojson", data });
      m.addLayer({
        id: "plugu-route-line",
        type: "line",
        source: "plugu-route",
        paint: {
          "line-color": "#d4af37",
          "line-width": 4,
          "line-dasharray": [2, 1.4],
        },
      });
    }
    if (routePath?.length) {
      const lats = routePath.map((p) => p[1]);
      const lngs = routePath.map((p) => p[0]);
      m.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 70, maxZoom: 17 },
      );
    }
  }, [ready, routePath]);

  // user dot
  useEffect(() => {
    if (!ready || !map.current || !userLocation) return;
    let cancelled = false;
    let marker: any;
    (async () => {
      const maplibre = await import("maplibre-gl");
      if (cancelled || !map.current) return;
      const el = document.createElement("div");
      el.setAttribute("aria-label", "Your location");
      el.style.cssText =
        "width:14px;height:14px;border-radius:999px;background:#38bdf8;border:2px solid #0b0b0c;box-shadow:0 0 0 5px rgba(56,189,248,.25)";
      marker = new maplibre.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    })();
    return () => {
      cancelled = true;
      marker?.remove?.();
    };
  }, [ready, userLocation?.lat, userLocation?.lng]);

  if (failed) {
    return (
      <div
        role="alert"
        className={`grid place-items-center rounded-3xl border border-border bg-card p-6 text-center text-xs text-muted-foreground ${className ?? ""}`}
      >
        The campus map couldn't load. Check your connection and try again.
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-border ${className ?? ""}`}>
      <div ref={holder} className="h-full w-full" role="application" aria-label={ariaLabel} />
      {!ready && (
        <div className="absolute inset-0 animate-pulse bg-secondary/60" aria-hidden="true" />
      )}
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button
          type="button"
          aria-label="Recenter map on campus"
          onClick={() => map.current?.easeTo({ center: [center.lng, center.lat], zoom })}
          className="tap grid h-11 w-11 place-items-center rounded-full border border-border bg-background/85 backdrop-blur"
        >
          <Crosshair className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Reset map orientation to north"
          onClick={() => map.current?.easeTo({ bearing: 0, pitch: 0 })}
          className="tap grid h-11 w-11 place-items-center rounded-full border border-border bg-background/85 backdrop-blur"
        >
          <Compass className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default CampusMap;
