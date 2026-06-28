import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Heart, MessageSquare, Star, Flag } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { categories, listings } from "@/lib/mock-data";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Market — PlugU" },
      { name: "description", content: "Buy, sell, and book on the campus marketplace — haircuts, nails, food, rides, tutoring, dorm items, tickets and more." },
      { property: "og:title", content: "PlugU Market" },
      { property: "og:description", content: "Campus marketplace for students." },
    ],
  }),
  component: Market,
});

function Market() {
  const [active, setActive] = useState<string>("all");
  const filtered = active === "all" ? listings : listings.filter(l => l.category.toLowerCase() === active);

  return (
    <AppShell title="MARKET">
      <section className="px-5 pt-5">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Search listings" className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
          </div>
          <button className="h-11 w-11 grid place-items-center rounded-2xl bg-card border border-border">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[{ key: "all", label: "All" }, ...categories].map((c) => {
            const isActive = active === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs border transition-colors ${
                  isActive
                    ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-5 px-5 grid grid-cols-2 gap-3">
        {filtered.map((l) => (
          <article key={l.id} className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
            <div className="relative aspect-square bg-secondary">
              <img src={l.image} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
              <button className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-background/70 backdrop-blur">
                <Heart className="h-4 w-4" />
              </button>
              <span className="absolute bottom-2 left-2 text-[10px] tracking-wider uppercase px-2 py-1 rounded-full bg-background/70 backdrop-blur">{l.category}</span>
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <p className="text-sm font-medium line-clamp-2">{l.title}</p>
              <p className="text-primary font-bold mt-1">{l.price}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="truncate">{l.seller}</span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-accent fill-accent" />
                  {l.rating}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-1 py-2 text-xs rounded-xl bg-[image:var(--gradient-bronze)] text-primary-foreground font-medium">
                  <MessageSquare className="h-3.5 w-3.5" /> Message
                </button>
                <button aria-label="Report" className="h-9 w-9 grid place-items-center rounded-xl bg-secondary border border-border">
                  <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}