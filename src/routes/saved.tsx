import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { listings } from "@/lib/mock-data";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved — PlugU" }] }),
  component: Saved,
});

function Saved() {
  const items = listings.slice(0, 4);
  return (
    <AppShell title="SAVED">
      <section className="px-5 pt-5">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" /> Saved listings
        </h1>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {items.map((l) => (
            <div key={l.id} className="rounded-2xl bg-card border border-border overflow-hidden">
              <img src={l.image} alt={l.title} className="aspect-square w-full object-cover" />
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2">{l.title}</p>
                <p className="text-primary font-bold mt-1 text-sm">{l.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}