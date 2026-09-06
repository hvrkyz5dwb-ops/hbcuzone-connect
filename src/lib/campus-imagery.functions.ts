import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type CampusLocation = {
  found: boolean;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  error?: string;
};

const Input = z.object({
  school: z.string().min(2).max(120),
  city: z.string().max(80).optional(),
});

export const locateCampus = createServerFn({ method: "POST" })
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<CampusLocation> => {
    const { findCampus } = await import("./campus-imagery.server");
    try {
      const place = await findCampus(data.school, data.city);
      if (!place || typeof place.lat !== "number") {
        return { found: false, name: data.school, address: "", lat: null, lng: null };
      }
      return {
        found: true,
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
      };
    } catch (e) {
      return {
        found: false,
        name: data.school,
        address: "",
        lat: null,
        lng: null,
        error: e instanceof Error ? e.message : "Campus lookup failed.",
      };
    }
  });
