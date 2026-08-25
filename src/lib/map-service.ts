// Map provider isolation. Everything the app knows about rendering a map
// lives behind this module, so the provider (currently MapLibre GL with an
// open vector style) can be swapped without rewriting the Campus OS.
export type LngLat = { lng: number; lat: number };

export const MAP_PROVIDER = "maplibre" as const;

/** Open, key-free vector style. Swap here to change the base map globally. */
export const MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json";

export const AVG_WALK_M_PER_MIN = 78; // ~2.9 mph, conservative campus pace

export function haversineMeters(a: LngLat, b: LngLat) {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function walkMinutes(meters: number) {
  return Math.max(1, Math.round(meters / AVG_WALK_M_PER_MIN));
}

export function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1609.34).toFixed(1)} mi`;
}

export function bearing(a: LngLat, b: LngLat) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng));
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function compassLabel(deg: number) {
  const dirs = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
  return dirs[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
}

export type MarkerInput = {
  id: string;
  lng: number;
  lat: number;
  label: string;
  glyph: string;
  tone: "gold" | "chrome" | "live" | "muted";
  onSelect?: () => void;
};

/** Grid clustering so a dense campus stays smooth at low zoom. */
export function clusterMarkers(markers: MarkerInput[], zoom: number) {
  if (zoom >= 16 || markers.length < 12) {
    return markers.map((m) => ({ ...m, count: 1, members: [m] as MarkerInput[] }));
  }
  const cell = zoom >= 14 ? 0.0012 : 0.004;
  const buckets = new Map<string, MarkerInput[]>();
  for (const m of markers) {
    const key = `${Math.round(m.lat / cell)}:${Math.round(m.lng / cell)}`;
    const list = buckets.get(key);
    if (list) list.push(m);
    else buckets.set(key, [m]);
  }
  return Array.from(buckets.values()).map((members) => {
    const head = members[0];
    const lat = members.reduce((s, m) => s + m.lat, 0) / members.length;
    const lng = members.reduce((s, m) => s + m.lng, 0) / members.length;
    return {
      ...head,
      lat,
      lng,
      id: members.length > 1 ? `cluster-${head.id}` : head.id,
      label: members.length > 1 ? `${members.length} places` : head.label,
      count: members.length,
      members,
    };
  });
}

/** Simple straight-line preview path used only when no verified path exists. */
export function previewPath(from: LngLat, to: LngLat): [number, number][] {
  return [
    [from.lng, from.lat],
    [to.lng, to.lat],
  ];
}
