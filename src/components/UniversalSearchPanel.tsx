// UNIVERSAL CAMPUS SEARCH — one field, results grouped by category.
// Nothing private is ever surfaced: only published places, active listings,
// public events, public organizations and static help articles.
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Clock, Star, Loader2, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useActiveCampus, useCampusPlaces } from "@/hooks/use-campus-os";
import {
  categoryShape, matchPlace, recordSearch, fetchRecentSearches, clearRecentSearches,
  fetchSavedSearches, saveSearch, deleteSavedSearch, renameSavedSearch,
  removeRecentSearch, PLACE_CATEGORY_LABEL,
} from "@/lib/campus-os";
import { fetchMarketplace } from "@/lib/listings-db";
import { opportunities } from "@/lib/opportunities-data";

const EXAMPLES = [
  "Financial aid", "Where is my class?", "Food open now", "Haircut", "Library",
  "Tutoring", "Scholarships", "Events tonight", "Campus safety", "Photographer",
];

const HELP_ARTICLES: { title: string; to: string; keywords: string }[] = [
  { title: "Contact PlugU support", to: "/support", keywords: "help support contact problem ticket email" },
  { title: "Community Guidelines", to: "/community-guidelines", keywords: "rules safety conduct report harassment" },
  { title: "Report a problem", to: "/report-problem", keywords: "report bug scam problem" },
  { title: "Refunds and disputes", to: "/refunds", keywords: "refund dispute money back order" },
  { title: "Staying safe on campus", to: "/safety", keywords: "safety meetup scam campus police" },
  { title: "Blocked users", to: "/blocked", keywords: "block unblock privacy" },
  { title: "Delete my account", to: "/delete-account", keywords: "delete account remove data" },
  { title: "Privacy Policy", to: "/privacy", keywords: "privacy data location tracking" },
  { title: "Terms of Use", to: "/terms", keywords: "terms legal agreement" },
];

type Group = { key: string; title: string; items: ResultItem[] };
type ResultItem = { id: string; title: string; subtitle?: string; to: string; glyph: string };

export function UniversalSearchPanel({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  const { session } = useSession();
  const { campus } = useActiveCampus();
  const places = useCampusPlaces(campus?.id);
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 220);
    return () => clearTimeout(t);
  }, [query]);

  // record the search once it settles (signed-in only, private to the user)
  useEffect(() => {
    if (!session || debounced.trim().length < 3) return;
    const t = setTimeout(() => { void recordSearch(debounced); }, 900);
    return () => clearTimeout(t);
  }, [debounced, session]);

  const recent = useQuery({
    queryKey: ["recent-searches"],
    enabled: !!session,
    queryFn: fetchRecentSearches,
  });
  const savedSearches = useQuery({
    queryKey: ["saved-searches"],
    enabled: !!session,
    queryFn: fetchSavedSearches,
  });

  const listings = useQuery({
    queryKey: ["universal-listings", debounced],
    enabled: debounced.trim().length >= 2,
    staleTime: 60_000,
    queryFn: () => fetchMarketplace({ query: debounced } as any),
  });

  const events = useQuery({
    queryKey: ["universal-events", debounced],
    enabled: debounced.trim().length >= 2,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("campus_events")
        .select("id, title, location, starts_at, category, status")
        .eq("status", "published")
        .gte("starts_at", new Date(Date.now() - 6 * 3600_000).toISOString())
        .ilike("title", `%${debounced}%`)
        .order("starts_at")
        .limit(8);
      return (data ?? []) as any[];
    },
  });

  const orgs = useQuery({
    queryKey: ["universal-orgs", debounced],
    enabled: debounced.trim().length >= 2,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("student_orgs")
        .select("id, name, slug, category")
        .ilike("name", `%${debounced}%`)
        .limit(6);
      return (data ?? []) as any[];
    },
  });

  const groups: Group[] = useMemo(() => {
    const q = debounced.trim();
    if (q.length < 2) return [];
    const out: Group[] = [];

    const placeHits = (places.data ?? []).filter((p) => matchPlace(p, q)).slice(0, 8);
    if (placeHits.length) {
      out.push({
        key: "places",
        title: "Campus places, offices and departments",
        items: placeHits.map((p) => ({
          id: p.id,
          title: p.name,
          subtitle:
            (p.nicknames ?? []).join(" · ") ||
            PLACE_CATEGORY_LABEL[p.category] ||
            "Campus place",
          to: "/map",
          glyph: categoryShape(p.category),
        })),
      });
    }

    const products = (listings.data ?? []).filter((l: any) => l.kind !== "service").slice(0, 6);
    if (products.length) {
      out.push({
        key: "products",
        title: "Products from students",
        items: products.map((l: any) => ({
          id: l.id,
          title: l.title,
          subtitle: `$${((l.price_cents ?? 0) / 100).toFixed(2)}`,
          to: "/market",
          glyph: "▣",
        })),
      });
    }

    const services = (listings.data ?? []).filter((l: any) => l.kind === "service").slice(0, 6);
    if (services.length) {
      out.push({
        key: "services",
        title: "Real-world services",
        items: services.map((l: any) => ({
          id: l.id,
          title: l.title,
          subtitle: l.campus_name ?? "Student service",
          to: "/market",
          glyph: "✂",
        })),
      });
    }

    if ((events.data ?? []).length) {
      out.push({
        key: "events",
        title: "Events",
        items: events.data!.map((e: any) => ({
          id: e.id,
          title: e.title,
          subtitle: `${new Date(e.starts_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric" })} · ${e.location}`,
          to: "/events",
          glyph: "◈",
        })),
      });
    }

    if ((orgs.data ?? []).length) {
      out.push({
        key: "orgs",
        title: "Organizations",
        items: orgs.data!.map((o: any) => ({
          id: o.id,
          title: o.name,
          subtitle: o.category,
          to: "/campus",
          glyph: "❖",
        })),
      });
    }

    const opps = opportunities
      .filter((o) =>
        `${o.title} ${o.org ?? ""} ${o.kind}`.toLowerCase().includes(q.toLowerCase()),
      )
      .slice(0, 6);
    if (opps.length) {
      out.push({
        key: "opportunities",
        title: "Scholarships, internships and jobs",
        items: opps.map((o, i) => ({
          id: `${o.title}-${i}`,
          title: o.title,
          subtitle: o.kind,
          to: "/hub",
          glyph: "★",
        })),
      });
    }

    const help = HELP_ARTICLES.filter((h) =>
      `${h.title} ${h.keywords}`.toLowerCase().includes(q.toLowerCase()),
    ).slice(0, 5);
    if (help.length) {
      out.push({
        key: "help",
        title: "Help articles",
        items: help.map((h) => ({ id: h.to, title: h.title, to: h.to, glyph: "?" })),
      });
    }

    if (/news|hbcu|sport|score/i.test(q)) {
      out.push({
        key: "news",
        title: "HBCU news",
        items: [{ id: "news", title: `Search HBCU news for "${q}"`, to: "/news", glyph: "◎" }],
      });
    }

    return out;
  }, [debounced, places.data, listings.data, events.data, orgs.data]);

  const busy = listings.isFetching || events.isFetching || orgs.isFetching || places.isFetching;
  const showEmpty = debounced.trim().length >= 2 && !busy && groups.length === 0;

  return (
    <div className="px-5">
      <label htmlFor="universal-search" className="sr-only">What do you need on campus?</label>
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <input
          id="universal-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you need on campus?"
          className="min-h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />}
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear search" className="tap p-2">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {query.trim().length < 2 && (
        <>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Search examples">
            {EXAMPLES.map((e) => (
              <li key={e}>
                <button
                  onClick={() => setQuery(e)}
                  className="tap min-h-11 rounded-full border border-border bg-card px-3 text-xs text-muted-foreground"
                >
                  {e}
                </button>
              </li>
            ))}
          </ul>

          {!!(recent.data ?? []).length && (
            <section className="mt-5" aria-labelledby="recent-h">
              <div className="flex items-center justify-between">
                <h2 id="recent-h" className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                  Recent searches
                </h2>
                <button
                  onClick={async () => { await clearRecentSearches(); await recent.refetch(); }}
                  className="tap text-[11px] text-muted-foreground underline"
                >
                  Clear
                </button>
              </div>
              <ul className="mt-2 divide-y divide-border rounded-2xl border border-border bg-card">
                {recent.data!.map((r) => (
                  <li key={r} className="flex items-center">
                    <button
                      onClick={() => setQuery(r)}
                      aria-label={`Search again for ${r}`}
                      className="tap flex min-h-11 flex-1 items-center gap-2 px-4 py-3 text-left text-sm"
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" /> {r}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await saveSearch(r, r);
                          await savedSearches.refetch();
                          toast.success("Saved");
                        } catch (e) { toast.error((e as Error).message); }
                      }}
                      aria-label={`Save the search ${r}`}
                      className="tap min-h-11 px-2 text-muted-foreground"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => { await removeRecentSearch(r); await recent.refetch(); }}
                      aria-label={`Remove ${r} from recent searches`}
                      className="tap min-h-11 px-3 text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!!(savedSearches.data ?? []).length && (
            <section className="mt-5" aria-labelledby="saved-h">
              <h2 id="saved-h" className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                Saved searches
              </h2>
              <ul className="mt-2 divide-y divide-border rounded-2xl border border-border bg-card">
                {savedSearches.data!.map((s) => (
                  <li key={s.id} className="flex items-center">
                    <button
                      onClick={() => setQuery(s.query)}
                      aria-label={`Reopen saved search ${s.label}`}
                      className="tap min-h-11 flex-1 px-4 py-3 text-left"
                    >
                      <span className="block truncate text-sm font-semibold">{s.label}</span>
                      {s.label !== s.query && (
                        <span className="block truncate text-[11px] text-muted-foreground">{s.query}</span>
                      )}
                    </button>
                    <button
                      onClick={async () => {
                        const next = window.prompt("Rename this saved search", s.label);
                        if (!next?.trim()) return;
                        try {
                          await renameSavedSearch(s.id, next.trim());
                          await savedSearches.refetch();
                        } catch (e) { toast.error((e as Error).message); }
                      }}
                      aria-label={`Rename saved search ${s.label}`}
                      className="tap min-h-11 px-2 text-muted-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => { await deleteSavedSearch(s.id); await savedSearches.refetch(); }}
                      aria-label={`Delete saved search ${s.label}`}
                      className="tap min-h-11 px-4 text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {groups.map((g) => (
        <section key={g.key} className="mt-5" aria-labelledby={`grp-${g.key}`}>
          <h2 id={`grp-${g.key}`} className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            {g.title}
          </h2>
          <ul className="mt-2 divide-y divide-border rounded-2xl border border-border bg-card">
            {g.items.map((it) => (
              <li key={it.id}>
                <Link to={it.to as "/map"} className="tap flex min-h-11 items-center gap-3 px-4 py-3">
                  <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-sm">
                    {it.glyph}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{it.title}</span>
                    {it.subtitle && (
                      <span className="block truncate text-[11px] text-muted-foreground">{it.subtitle}</span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {groups.length > 0 && session && (
        <button
          onClick={async () => {
            try {
              await saveSearch(debounced, debounced);
              await savedSearches.refetch();
              toast.success("Search saved");
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
          className="tap mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold"
        >
          <Star className="h-3.5 w-3.5" aria-hidden="true" /> Save this search
        </button>
      )}

      {showEmpty && (
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 text-center">
          <p className="text-sm font-semibold">No matches yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a building name, a service like “haircut”, or a category like “scholarships”.
            Campus places appear once an administrator has verified them.
          </p>
        </div>
      )}
    </div>
  );
}
