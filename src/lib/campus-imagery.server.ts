// Resolves any college campus (not just HBCUs) to a real place on Google Maps
// and to real imagery. Everything here is server-only: the gateway credentials
// never reach the browser.
const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

export type CampusPlace = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  photoName?: string;
};

type CacheEntry = { value: CampusPlace | null; at: number };
const placeCache = new Map<string, CacheEntry>();
const TTL = 1000 * 60 * 60 * 12;

function creds() {
  const lovable = process.env["LOVABLE_API_KEY"];
  const conn = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovable || !conn) throw new Error("Google Maps connector is not configured.");
  return { lovable, conn };
}

function headers(extra: Record<string, string> = {}) {
  const { lovable, conn } = creds();
  return {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": conn,
    ...extra,
  };
}

async function fail(res: Response): Promise<never> {
  const body = await res.text();
  if (res.status === 403) {
    throw new Error(`Google Maps request was denied (403). ${body}`);
  }
  throw new Error(`Google Maps request failed [${res.status}]: ${body}`);
}

/** Find the campus on Google Maps. Cached per query so we don't re-bill lookups. */
export async function findCampus(school: string, city?: string): Promise<CampusPlace | null> {
  const query = [school, city, "campus"].filter(Boolean).join(" ").trim().slice(0, 120);
  const key = query.toLowerCase();
  const hit = placeCache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value;

  const res = await fetch(`${GATEWAY}/places/v1/places:searchText`, {
    method: "POST",
    headers: headers({
      "Content-Type": "application/json",
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.photos",
    }),
    body: JSON.stringify({ textQuery: query, includedType: "university", maxResultCount: 1 }),
  });
  if (!res.ok) await fail(res);
  const json: any = await res.json();
  const p = json?.places?.[0];
  const value: CampusPlace | null = p
    ? {
        placeId: p.id,
        name: p.displayName?.text ?? school,
        address: p.formattedAddress ?? "",
        lat: p.location?.latitude,
        lng: p.location?.longitude,
        photoName: p.photos?.[0]?.name,
      }
    : null;
  placeCache.set(key, { value, at: Date.now() });
  return value;
}

/** Real photograph of the campus, as raw bytes. */
export async function fetchCampusPhoto(photoName: string, maxWidthPx = 800): Promise<Response> {
  const res = await fetch(
    `${GATEWAY}/places/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&skipHttpRedirect=true`,
    { headers: headers() },
  );
  if (!res.ok) await fail(res);
  const { photoUri } = (await res.json()) as { photoUri: string };
  return fetch(photoUri);
}

/** Satellite still of the campus, as raw bytes. */
export async function fetchCampusSatellite(
  lat: number,
  lng: number,
  zoom = 16,
  size = "640x480",
): Promise<Response> {
  const res = await fetch(
    `${GATEWAY}/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&scale=2&maptype=satellite`,
    { headers: headers() },
  );
  if (!res.ok) await fail(res);
  return res;
}
