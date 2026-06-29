import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Heart, MessageSquare, Star, Flag, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { categories, listings } from "@/lib/mock-data";
import { PullToRefresh } from "@/components/PullToRefresh";
import { LoadingGrid, EmptyState } from "@/components/EmptyState";
import { VerifiedStudentBadge } from "@/components/VerifiedStudentBadge";

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
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  const filtered = listings.filter((l) => {
    if (active !== "all" && l.category.toLowerCase() !== active) return false;
    if (query && !`${l.title} ${l.seller}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  function toggleSave(id: string) {
    setSaved((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <AppShell title="MARKET">
      <PullToRefresh onRefresh={async () => { setLoading(true); await new Promise(r => setTimeout(r, 600)); setLoading(false); }}>
      <section className="px-5 pt-5 slide-up">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings"
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
            />
          </div>
          <button aria-label="Filters" className="tap h-11 w-11 grid place-items-center rounded-2xl bg-card border border-border">
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
                className={`tap shrink-0 px-4 py-2 rounded-full text-xs border transition-all ${
                  isActive
                    ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary shadow-[var(--shadow-glow)]"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      {loading ? (
        <div className="mt-5"><LoadingGrid rows={6} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No listings yet"
          description="Try clearing the search or switching categories."
        />
      ) : (
      <section className="mt-5 px-5 grid grid-cols-2 gap-3 slide-up">
        {filtered.map((l, i) => (
          <article
            key={l.id}
            className="tap rounded-2xl bg-card border border-border overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
            style={{ animation: `plugu-fade-up 0.4s ease-out ${i * 35}ms both` }}
          >
            <div className="relative aspect-square bg-secondary">
              <img src={l.image} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
              <button
                onClick={() => toggleSave(l.id)}
                aria-label={saved.has(l.id) ? "Unsave" : "Save"}
                className="tap absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-background/70 backdrop-blur"
              >
                <Heart className={`h-4 w-4 ${saved.has(l.id) ? "fill-accent text-accent" : ""}`} />
              </button>
              <span className="absolute bottom-2 left-2 text-[10px] tracking-wider uppercase px-2 py-1 rounded-full bg-background/70 backdrop-blur">{l.category}</span>
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <p className="text-sm font-medium line-clamp-2">{l.title}</p>
              <p className="text-primary font-bold mt-1">{l.price}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="truncate inline-flex items-center gap-1">
                  {l.seller}
                  <VerifiedStudentBadge size="xs" iconOnly />
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-accent fill-accent" />
                  {l.rating}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button className="tap flex-1 flex items-center justify-center gap-1 py-2 text-xs rounded-xl bg-[image:var(--gradient-bronze)] text-primary-foreground font-medium">
                  <MessageSquare className="h-3.5 w-3.5" /> Message
                </button>
                <button aria-label="Report" className="tap h-9 w-9 grid place-items-center rounded-xl bg-secondary border border-border">
                  <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
      )}
      </PullToRefresh>
    </AppShell>
  );
}