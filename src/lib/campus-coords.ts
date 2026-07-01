// Approximate center coordinates for HBCU campuses used by PlugU.
// Not survey-grade — good enough for a "you are on campus" gate (~2km radius).

export type CampusCoord = { name: string; lat: number; lng: number; radiusKm?: number };

export const campusCoords: CampusCoord[] = [
  { name: "Howard University",    lat: 38.9223, lng: -77.0197, radiusKm: 1.5 },
  { name: "Spelman College",      lat: 33.7462, lng: -84.4126, radiusKm: 1.2 },
  { name: "Morehouse College",    lat: 33.7460, lng: -84.4159, radiusKm: 1.2 },
  { name: "Hampton University",   lat: 37.0210, lng: -76.3350, radiusKm: 2.0 },
  { name: "FAMU",                 lat: 30.4238, lng: -84.2870, radiusKm: 2.5 },
  { name: "Talladega College",    lat: 33.4362, lng: -86.1058, radiusKm: 1.5 },
  { name: "Tuskegee University",  lat: 32.4297, lng: -85.7075, radiusKm: 2.0 },
  { name: "NCCU",                 lat: 35.9738, lng: -78.8986, radiusKm: 1.8 },
];

export function findCampusCoord(school: string): CampusCoord | undefined {
  const s = school.toLowerCase();
  return campusCoords.find((c) => s.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(s));
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const aa =
    s1 * s1 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(aa)));
}

/** Returns { onCampus, distanceKm } — onCampus true when within campus radius (default 2km). */
export function evaluateOnCampus(
  school: string,
  user: { lat: number; lng: number },
): { onCampus: boolean; distanceKm: number; campus?: CampusCoord } {
  const campus = findCampusCoord(school);
  if (!campus) return { onCampus: false, distanceKm: Infinity };
  const d = haversineKm(user, campus);
  return { onCampus: d <= (campus.radiusKm ?? 2), distanceKm: d, campus };
}