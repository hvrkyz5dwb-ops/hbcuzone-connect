import { createFileRoute } from "@tanstack/react-router";
import { Navigation, Star, MapPin } from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import { popularOnCampus } from "@/lib/mock-data";
import mapImg from "@/assets/campus-map.jpg";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Campus Map — PlugU" },
      { name: "description", content: "Live campus navigation. Find vendors, services and popular spots near you." },
      { property: "og:title", content: "PlugU Campus Map" },
      { property: "og:description", content: "Live campus navigation." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <AppShell title="CAMPUS MAP">
      <section className="px-5 pt-5">
        <div className="relative rounded-3xl overflow-hidden border border-border">
          <img src={mapImg} alt="Campus map" className="w-full h-72 object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <button className="absolute bottom-4 right-4 h-12 w-12 grid place-items-center rounded-full bg-[image:var(--gradient-bronze)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <Navigation className="h-5 w-5" />
          </button>
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/70 backdrop-blur text-xs">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Talladega College
          </div>
        </div>
      </section>

      <section className="mt-6">
        <SectionHeader title="Popular on Campus" action="See all" />
        <ul className="px-5 space-y-2">
          {popularOnCampus.map((p) => (
            <li key={p.name} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
              <div className="h-12 w-12 rounded-xl bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                {p.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.type} · {p.location}</p>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                {p.rating}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}