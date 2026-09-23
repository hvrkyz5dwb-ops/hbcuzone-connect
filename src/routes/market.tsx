import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Search, SlidersHorizontal, Heart, MessageSquare, Star, Flag, SearchX,
  Sparkles, ShoppingBag, Plus, Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ContentMenu } from "@/components/ContentMenu";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { CommunityBoard } from "@/components/CommunityBoard";
import { PullToRefresh } from "@/components/PullToRefresh";
import { LoadingGrid, EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/QueryStates";
import { VerifiedStudentBadge } from "@/components/VerifiedStudentBadge";
import { useMarketplace } from "@/hooks/use-listings";
import { toggleFavorite, type ListingWithExtras } from "@/lib/listings-db";
import { getOrCreateConversation } from "@/lib/messages-db";
import { MVP_CATEGORIES, formatPrice, categoryLabel, type PriceType } from "@/lib/categories";
import { useContentVisibility } from "@/hooks/use-blocklist";
import { useSchool } from "@/hooks/use-school";
import { CampusBar } from "@/components/campus/CampusBar";
import { useProfile } from "@/hooks/use-profile";
import { useCampusSchoolId } from "@/hooks/use-campus-scope";
import { FULFILLMENT_OPTIONS } from "@/lib/categories";
import { useSession } from "@/hooks/use-session";
import { requestAuthentication } from "@/components/RequireAuthPrompt";

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
  const { schoolId: activeSchoolId, schoolIds: activeSchoolIds, campusName, exploring } = useCampusSchoolId();
  const { session } = useSession();
  const qc = useQueryClient();
  const isVisible = useContentVisibility();

  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "popular" | "rating">("newest");
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [fulfillment, setFulfillment] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  // Byte offset into the marketplace result set (not a page index): filtered
  // pages can consume more source rows than they render.
  const [offset, setOffset] = useState(0);
  const [tab, setTab] = useState<"shop" | "posts">("shop");
  const PAGE_SIZE = 24;

  const filters = useMemo(() => ({
    q: query || undefined,
    category: category === "all" ? undefined : category,
    campus_scope: scope,
    school_id: activeSchoolId ?? undefined,
    school_ids: activeSchoolIds.length ? activeSchoolIds : undefined,
    price_max_cents: priceMax !== null ? priceMax * 100 : undefined,
    fulfillment: fulfillment.length ? fulfillment : undefined,
    verified_only: verifiedOnly || undefined,
    sort,
    limit: PAGE_SIZE,
    offset,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [query, category, scope, activeSchoolId, activeSchoolIds.join(","), priceMax, fulfillment, verifiedOnly, sort, offset]);

  const { data: listings, isPending, isError, isFetching, refetch } = useMarketplace(filters);

  async function onToggleFavorite(id: string, currently: boolean) {
    if (!session) { requestAuthentication(); return; }
    try {
      await toggleFavorite(id);
      toast(currently ? "Removed from saved" : "Saved to your collection");
      qc.invalidateQueries({ queryKey: ["marketplace"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign in to save listings");
    }
  }

  // Reported/hidden listings and blocked sellers disappear instantly, with no
  // refetch and no app restart.
  const rows = useMemo(
    () =>
      (listings ?? []).filter((l) =>
        isVisible({ type: "listing", id: l.id, authorId: (l as { seller_user_id?: string | null }).seller_user_id ?? null }),
      ),
    [listings, isVisible],
  );

  return (
    <AppShell title="MARKET">
      <PullToRefresh onRefresh={async () => { await refetch(); }}>
      <CampusBar subtitle="Student-owned businesses and campus services" />
      <section className="px-5 pt-5">
        <div className="flex gap-2 p-1 rounded-2xl bg-secondary border border-border">
          {(["shop", "posts"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tap flex-1 py-2 text-xs rounded-xl transition-colors ${
                tab === t
                  ? "bg-[image:var(--gradient-bronze)] text-primary-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {t === "shop" ? "Shop" : "Campus posts"}
            </button>
          ))}
        </div>
      </section>

      {tab === "posts" ? (
        <div className="pb-6">
          <CommunityBoard />
        </div>
      ) : (
      <>
      <section className="px-5 pt-5 slide-up">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOffset(0); }}
              placeholder="Search hair, food, dorm, tutoring…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => navigate({ to: "/search", search: { q: query || undefined, tab: "browse" } })}
              className="tap text-[10px] uppercase tracking-wider text-primary inline-flex items-center gap-1"
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

        <div tabIndex={0} className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[{ key: "all", label: "All" }, ...MVP_CATEGORIES].map((c) => {
            const isActive = category === c.key;
            return (
              <button
                key={c.key}
                onClick={() => {
                  setCategory(c.key); setOffset(0);
                }}
                className={`tap shrink-0 px-4 py-2 rounded-full text-xs border transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold border-primary shadow-[var(--shadow-glow)]"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {showFilters && (
          <div className="mt-3 rounded-2xl border border-border bg-card p-3 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">School</p>
              <div className="mt-1.5 flex gap-2">
                <ChipToggle active={scope === "mine"} onClick={() => { setScope("mine"); setOffset(0); }}>
                  My campus · {school.name}
                </ChipToggle>
                <ChipToggle active={scope === "all"} onClick={() => { setScope("all"); setOffset(0); }}>All PlugU</ChipToggle>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sellers</p>
              <div className="mt-1.5 flex gap-2 flex-wrap">
                <ChipToggle active={!verifiedOnly} onClick={() => { setVerifiedOnly(false); setOffset(0); }}>
                  All students
                </ChipToggle>
                <ChipToggle active={verifiedOnly} onClick={() => { setVerifiedOnly(true); setOffset(0); }}>
                  Verified students only
                </ChipToggle>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sort</p>
              <div className="mt-1.5 flex gap-2 flex-wrap">
                {(["newest","popular","rating"] as const).map((s) => (
                  <ChipToggle key={s} active={sort === s} onClick={() => { setSort(s); setOffset(0); }}>
                    {s === "popular" ? "Most saved" : s === "rating" ? "Top rated" : "Newest"}
                  </ChipToggle>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Max price</p>
              <div className="mt-1.5 flex gap-2 flex-wrap">
                {[null, 25, 50, 100, 250].map((p, i) => (
                  <ChipToggle key={i} active={priceMax === p} onClick={() => { setPriceMax(p); setOffset(0); }}>
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
                      setOffset(0);
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
      ) : isError ? (
        <ErrorState
          title="Marketplace didn't load"
          description="We couldn't reach the listings. Check your connection and try again."
          onRetry={() => void refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={
            query
              ? `No results for "${query}"`
              : scope === "mine" && (exploring || school.verified)
                ? `Nothing posted at ${exploring ? campusName : school.name} yet`
                : "Nothing posted here yet"
          }
          description={
            query
              ? "Try a different keyword, or clear your filters."
              : scope === "mine"
                ? "Be the first. Post a service or something you're selling, then share it with your campus."
                : "Try another category, or post the first listing here yourself."
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                to="/seller/listings"
                onClick={(event) => { if (!session) { event.preventDefault(); requestAuthentication(); } }}
                className="hit inline-flex items-center gap-1.5 rounded-full bg-[image:var(--gradient-bronze)] px-5 py-2 text-xs font-semibold text-primary-foreground"
              >
                <Plus className="h-3.5 w-3.5" /> Post the first listing
              </Link>
              {scope === "mine" && (
                <button
                  onClick={() => { setScope("all"); setOffset(0); }}
                  className="hit rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-muted-foreground"
                >
                  Browse all schools
                </button>
              )}
              {(query || priceMax !== null || fulfillment.length > 0 || verifiedOnly || category !== "all") && (
                <button
                  onClick={() => { setQuery(""); setPriceMax(null); setFulfillment([]); setVerifiedOnly(false); setCategory("all"); setOffset(0); }}
                  className="hit rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-muted-foreground"
                >
                  Clear filters
                </button>
              )}
            </div>
          }
        />
      ) : (
      <section className="mt-5 px-5 grid grid-cols-2 gap-3 slide-up">
        {rows.map((l, i) => <ListingCard key={l.id} l={l} index={i} onToggleFavorite={onToggleFavorite} signedIn={!!session} />)}
      </section>
      )}

      {(listings as { hasMore?: boolean } | undefined)?.hasMore && (
        <div className="px-5 mt-5 flex justify-center">
          <button
            onClick={() => setOffset((listings as { nextOffset?: number } | undefined)?.nextOffset ?? offset + PAGE_SIZE)}
            disabled={isFetching}
            className="tap px-6 py-2.5 text-xs rounded-full border border-border bg-card text-muted-foreground disabled:opacity-50"
          >
            {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin inline" /> : "Load more"}
          </button>
        </div>
      )}

      {offset > 0 && (
        <div className="px-5 mt-2 flex justify-center">
          <button onClick={() => setOffset(0)} className="text-[11px] text-muted-foreground underline underline-offset-4">Back to page 1</button>
        </div>
      )}
      </>
      )}
      </PullToRefresh>

      {/* Floating create button → real seller CRUD */}
      <Link
        to="/seller/listings"
        onClick={(event) => {
          if (!session) { event.preventDefault(); requestAuthentication(); }
        }}
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
  l, index, onToggleFavorite, signedIn,
}: {
  l: ListingWithExtras;
  index: number;
  onToggleFavorite: (id: string, currently: boolean) => void;
  signedIn: boolean;
}) {
  const navigate = useNavigate();
  const [imageAvailable, setImageAvailable] = useState(true);
  const cover = l.images[0]?.url;
  if (!cover || !imageAvailable) return null;
  const saved = !!l.is_favorited;
  return (
    <article
      className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
      style={{ animation: `plugu-fade-up 0.4s ease-out ${Math.min(index, 12) * 35}ms both` }}
    >
      <div className="relative aspect-square bg-secondary">
        <img
          src={cover}
          alt={l.title}
          loading="lazy"
          onError={() => setImageAvailable(false)}
          className="w-full h-full object-cover"
        />
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
            onClick={async () => {
              if (!signedIn) { requestAuthentication(); return; }
              try {
                const convId = await getOrCreateConversation(l.seller_user_id, l.id);
                navigate({ to: "/messages/$id", params: { id: convId } });
              } catch (err) {
                toast.error("Couldn't open chat", { description: (err as Error).message });
              }
            }}
            className="tap h-9 w-9 grid place-items-center rounded-xl bg-secondary border border-border"
            aria-label="Message"
          >
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <ContentMenu
            targetType="listing"
            targetId={l.id}
            targetLabel={l.title}
            authorUserId={l.seller_user_id}
            className="h-9 w-9 grid place-items-center rounded-xl bg-secondary border border-border"
          />
        </div>
      </div>
    </article>
  );
}