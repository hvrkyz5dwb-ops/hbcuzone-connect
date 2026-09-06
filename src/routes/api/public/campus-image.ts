import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  fetchCampusPhoto,
  fetchCampusSatellite,
  findCampus,
} from "@/lib/campus-imagery.server";

// Serves real campus imagery (Google photo or satellite still) as an <img>
// source. Inputs are strictly validated and results are cached hard so a
// campus costs at most a couple of Maps lookups per day.
const Query = z.object({
  school: z.string().min(2).max(120),
  city: z.string().max(80).optional(),
  mode: z.enum(["photo", "satellite"]).default("photo"),
  zoom: z.coerce.number().min(12).max(19).default(16),
});

const bytesCache = new Map<string, { body: ArrayBuffer; type: string; at: number }>();
const TTL = 1000 * 60 * 60 * 12;
const MAX_ENTRIES = 300;

export const Route = createFileRoute("/api/public/campus-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
        if (!parsed.success) return new Response("Bad request", { status: 400 });
        const { school, city, mode, zoom } = parsed.data;

        const key = `${mode}:${zoom}:${school.toLowerCase()}:${(city ?? "").toLowerCase()}`;
        const hit = bytesCache.get(key);
        if (hit && Date.now() - hit.at < TTL) {
          return new Response(hit.body, {
            headers: { "Content-Type": hit.type, "Cache-Control": "public, max-age=43200" },
          });
        }

        try {
          const place = await findCampus(school, city);
          if (!place) return new Response("Campus not found", { status: 404 });

          let upstream: Response;
          if (mode === "photo" && place.photoName) {
            upstream = await fetchCampusPhoto(place.photoName, 1000);
          } else if (typeof place.lat === "number") {
            upstream = await fetchCampusSatellite(place.lat, place.lng, zoom);
          } else {
            return new Response("No imagery", { status: 404 });
          }
          if (!upstream.ok) {
            return new Response(`Imagery failed [${upstream.status}]`, { status: 502 });
          }

          const body = await upstream.arrayBuffer();
          const type = upstream.headers.get("content-type") ?? "image/jpeg";
          if (bytesCache.size > MAX_ENTRIES) bytesCache.clear();
          bytesCache.set(key, { body, type, at: Date.now() });
          return new Response(body, {
            headers: { "Content-Type": type, "Cache-Control": "public, max-age=43200" },
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Imagery error";
          console.error("campus-image:", msg);
          return new Response(msg, { status: 502 });
        }
      },
    },
  },
});
