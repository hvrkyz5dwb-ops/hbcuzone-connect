import { createFileRoute } from "@tanstack/react-router";
import { Search, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { hbcus } from "@/lib/mock-data";

export const Route = createFileRoute("/hbcus")({
  head: () => ({
    meta: [
      { title: "HBCUs — PlugU" },
      { name: "description", content: "Plug into HBCU campuses across the country. Find your community, vendors, and events." },
      { property: "og:title", content: "PlugU HBCUs" },
      { property: "og:description", content: "Plug into HBCU campuses across the country." },
    ],
  }),
  component: Hbcus,
});

function Hbcus() {
  return (
    <AppShell title="HBCUS">
      <section className="px-5 pt-5">
        <h1 className="text-2xl font-bold tracking-tight">Plug into your campus</h1>
        <p className="text-sm text-muted-foreground mt-1">Switch campuses to see local vendors, events, and listings.</p>

        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search HBCUs" className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
        </div>
      </section>

      <section className="mt-5 px-5 grid grid-cols-2 gap-3 pb-4">
        {hbcus.map((h) => (
          <button
            key={h.name}
            className={`relative aspect-[3/4] rounded-2xl overflow-hidden text-left p-4 flex flex-col justify-end border border-border bg-gradient-to-br ${h.color}`}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative">
              <p className="text-white font-bold text-base leading-tight">{h.name}</p>
              <p className="text-white/70 text-xs mt-1">{h.city}</p>
              <p className="text-white/90 text-xs mt-3 flex items-center gap-1">
                <Users className="h-3 w-3" /> {h.students}
              </p>
            </div>
          </button>
        ))}
      </section>
    </AppShell>
  );
}