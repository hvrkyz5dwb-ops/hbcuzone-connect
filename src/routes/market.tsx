import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Search, SlidersHorizontal, Heart, MessageSquare, Star, Flag, SearchX,
  Sparkles, ShoppingBag, Plus, Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { PullToRefresh } from "@/components/PullToRefresh";
import { LoadingGrid, EmptyState } from "@/components/EmptyState";
import { VerifiedStudentBadge } from "@/components/VerifiedStudentBadge";
import { useMarketplace } from "@/hooks/use-listings";
import { toggleFavorite, type ListingWithExtras } from "@/lib/listings-db";
import { MVP_CATEGORIES, formatPrice, categoryLabel, type PriceType } from "@/lib/categories";
import { useSchool } from "@/hooks/use-school";
import { useProfile } from "@/hooks/use-profile";
import { FULFILLMENT_OPTIONS } from "@/lib/categories";

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
  const navigate = useNavigate();
  const school = useSchool();
  const { profile } = useProfile();
  const qc = useQueryClient();

  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "popular" | "rating">("newest");
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [fulfillment, setFulfillment] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 24;

  const filters = useMemo(() => ({
    q: query || undefined,
    category: category === "all" ? undefined : category,
    campus_scope: scope,
    school_id: profile?.school_id ?? undefined,
    price_max_cents: priceMax !== null ? priceMax * 100 : undefined,
    fulfillment: fulfillment.length ? fulfillment : undefined,
    sort,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  }), [query, category, scope, profile?.school_id, priceMax, fulfillment, sort, page]);

  const { data: listings, isPending, isFetching, refetch } = useMarketplace(filters);

  async function onToggleFavorite(id: string, currently: boolean) {
    try {
      await toggleFavorite(id);
      toast(currently ? "Removed from saved" : "Saved to your collection");
      qc.invalidateQueries({ queryKey: ["marketplace"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign in to save listings");
    }
  }

  const rows = listings ?? [];

  return (
    <AppShell title="MARKET">
      <PullToRefresh onRefresh={async () => { await refetch(); }}>
      <section className="px-5 pt-5 slide-up">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder="Search hair, food, dorm, tutoring…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => navigate({ to: "/search", search: { q: query || undefined, tab: "browse" } })}
              className="text-[10px] uppercase tracking-wider text-[var(--plugu-purple)] inline-flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" /> AI
            </button>
          </div>
          <button
            aria-label="Filters"
            onClick={() => setShowFilters((s) => !s)}
            className={`tap h-11 w-11 grid place-items-center rounded-2xl border ${showFilters ? "bg-primary/15 border-primary/50" : "bg-card border-border"}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[{ key: "all", label: "All", betaDisabled: false }, ...MVP_CATEGORIES].map((c) => {
            const isActive = category === c.key;
            const disabled = "betaDisabled" in c && c.betaDisabled;
            return (
              <button
                key={c.key}
                onClick={() => {
                  if (disabled) { toast("Rides return after beta", { description: "Coming soon to PlugU." }); return; }
                  setCategory(c.key); setPage(0);
                }}
                className={`tap shrink-0 px-4 py-2 rounded-full text-xs border transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary shadow-[var(--shadow-glow)]"
                    : disabled
                      ? "bg-card text-muted-foreground/50 border-border/60 line-through"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {c.label}
                {disabled && <span className="ml-1 text-[9px] uppercase tracking-widest">Beta soon</span>}
              </button>
            );
          })}
        </div>

        {showFilters && (
          <div className="mt-3 rounded-2xl border border-border bg-card p-3 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">School</p>
              <div className="mt-1.5 flex gap-2">
                <ChipToggle active={scope === "mine"} onClick={() => { setScope("mine"); setPage(0); }}>
                  My campus · {school.name}
                </ChipToggle>
                <ChipToggle active={scope === "all"} onClick={() => { setScope("all"); setPage(0); }}>All PlugU</ChipToggle>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sort</p>
              <div className="mt-1.5 flex gap-2 flex-wrap">
                {(["newest","popular","rating"] as const).map((s) => (
                  <ChipToggle key={s} active={sort === s} onClick={() => { setSort(s); setPage(0); }}>
                    {s === "popular" ? "Most saved" : s === "rating" ? "Top rated" : "Newest"}
                  </ChipToggle>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Max price</p>
              <div className="mt-1.5 flex gap-2 flex-wrap">
                {[null, 25, 50, 100, 250].map((p, i) => (
                  <ChipToggle key={i} active={priceMax === p} onClick={() => { setPriceMax(p); setPage(0); }}>
                    {p === null ? "Any" : `Up to $${p}`}
                  </ChipToggle>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Fulfillment</p>
              <div className="mt-1.5 flex gap-2 flex-wrap">
                {FULFILLMENT_OPTIONS.map((f) => {
                  const on = fulfillment.includes(f.key);
                  return (
                    <ChipToggle key={f.key} active={on} onClick={() => {
                      setFulfillment((prev) => on ? prev.filter((k) => k !== f.key) : [...prev, f.key]);
                      setPage(0);
                    }}>{f.label}</ChipToggle>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {isPending ? (
        <div className="mt-5"><LoadingGrid rows={6} /></div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={query ? `No results for "${query}"` : "No listings yet"}
          description={scope === "mine" ? "Try switching to All PlugU or a different category." : "Try clearing filters or a different keyword."}
        />
      ) : (
      <section className="mt-5 px-5 grid grid-cols-2 gap-3 slide-up">
        {rows.map((l, i) => <ListingCard key={l.id} l={l} index={i} onToggleFavorite={onToggleFavorite} />)}
      </section>
      )}

      {rows.length >= PAGE_SIZE && (
        <div className="px-5 mt-5 flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetching}
            className="tap px-6 py-2.5 text-xs rounded-full border border-border bg-card text-muted-foreground disabled:opacity-50"
          >
            {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin inline" /> : "Load more"}
          </button>
        </div>
      )}

      {page > 0 && (
        <div className="px-5 mt-2 flex justify-center">
          <button onClick={() => setPage(0)} className="text-[11px] text-muted-foreground underline underline-offset-4">Back to page 1</button>
        </div>
      )}
      </PullToRefresh>

      {/* Floating create button → real seller CRUD */}
      <Link
        to="/seller/listings"
        aria-label="Create listing"
        className="tap fixed bottom-24 right-5 h-14 w-14 rounded-full grid place-items-center shadow-[var(--shadow-glow)] z-40"
        style={{ background: "var(--gradient-bronze)", color: "var(--primary-foreground)" }}
      >
        <Plus className="h-6 w-6" />
      </Link>
    </AppShell>
  );
}

function ChipToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`tap px-3 py-1.5 text-[11px] rounded-full border transition-colors ${
        active ? "bg-primary/15 border-primary/50 text-foreground" : "bg-secondary border-border text-muted-foreground"
      }`}
    >{children}</button>
  );
}

function ListingCard({
  l, index, onToggleFavorite,
}: {
  l: ListingWithExtras;
  index: number;
  onToggleFavorite: (id: string, currently: boolean) => void;
}) {
  const navigate = useNavigate();
  const cover = l.images[0]?.url ?? "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600";
  const saved = !!l.is_favorited;
  return (
    <article
      className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
      style={{ animation: `plugu-fade-up 0.4s ease-out ${Math.min(index, 12) * 35}ms both` }}
    >
      <div className="relative aspect-square bg-secondary">
        <img src={cover} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
        <button
          onClick={() => onToggleFavorite(l.id, saved)}
          aria-label={saved ? "Unsave" : "Save"}
          className="tap absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-background/70 backdrop-blur"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-accent text-accent" : ""}`} />
        </button>
        <span className="absolute bottom-2 left-2 text-[10px] tracking-wider uppercase px-2 py-1 rounded-full bg-background/70 backdrop-blur">
          {categoryLabel(l.category)}
        </span>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-sm font-medium line-clamp-2">{l.title}</p>
        <p className="text-primary font-bold mt-1">{formatPrice(l.price_cents, l.price_type as PriceType)}</p>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="truncate inline-flex items-center gap-1">
            {l.campus_name ?? "PlugU"}
            <VerifiedStudentBadge size="xs" iconOnly />
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-accent fill-accent" />
            {l.favorite_count ?? 0}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => navigate({ to: "/checkout/$listingId", params: { listingId: l.id } })}
            className="tap flex-1 flex items-center justify-center gap-1 py-2 text-xs rounded-xl bg-[image:var(--gradient-bronze)] text-primary-foreground font-medium"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> {l.price_type === "quote" ? "Request" : "Buy"}
          </button>
          <button
            onClick={() => { toast.success("Message opened"); navigate({ to: "/messages" }); }}
            className="tap h-9 w-9 grid place-items-center rounded-xl bg-secondary border border-border"
            aria-label="Message"
          >
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            aria-label="Report"
            onClick={() => toast.success("Report received", { description: "Trust & Safety will review this listing." })}
            className="tap h-9 w-9 grid place-items-center rounded-xl bg-secondary border border-border"
          >
            <Flag className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </article>
  );
}