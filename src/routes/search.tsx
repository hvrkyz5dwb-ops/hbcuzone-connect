import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Search, SlidersHorizontal, Sparkles, X, Star, MapPin, BadgeCheck, Clock, Flame,
  Instagram, Youtube, Music2, Globe, ArrowUpRight, Heart,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { UniversalSearchPanel } from "@/components/UniversalSearchPanel";
import { ChargingLoader } from "@/components/ChargingLoader";
import { listings } from "@/lib/mock-data";
import { askAI, type AskAIResult } from "@/lib/search.functions";
import { askPlugU } from "@/lib/plugai.functions";
import type { AskPlugUResult } from "@/lib/plugai-types";
import { useSession } from "@/hooks/use-session";
import { VerifiedStudentBadge } from "@/components/VerifiedStudentBadge";
import { z } from "zod";
import { toast } from "sonner";

const SEARCH_TYPES: { key: string; label: string; emoji: string; match: string[] }[] = [
  { key: "hair", label: "Hair", emoji: "💈", match: ["hair", "hairstyles"] },
  { key: "food", label: "Food", emoji: "🍔", match: ["food"] },
  { key: "rides", label: "Rides", emoji: "🚗", match: ["rides"] },
  { key: "clothes", label: "Clothes", emoji: "👕", match: ["clothing", "sneakers"] },
  { key: "tutors", label: "Tutors", emoji: "📚", match: ["tutoring"] },
  { key: "photo", label: "Photographers", emoji: "📸", match: ["photo", "video"] },
  { key: "apartments", label: "Apartments", emoji: "🏠", match: ["apartments"] },
  { key: "dorm", label: "Dorm Items", emoji: "🛏️", match: ["dorm", "furniture"] },
  { key: "events", label: "Events", emoji: "🎉", match: ["events", "tickets"] },
  { key: "parties", label: "Parties", emoji: "🪩", match: ["events", "tickets"] },
  { key: "electronics", label: "Electronics", emoji: "🎧", match: ["electronics"] },
  { key: "books", label: "Books", emoji: "📖", match: ["books"] },
  { key: "furniture", label: "Furniture", emoji: "🛋️", match: ["furniture"] },
  { key: "internships", label: "Internships", emoji: "💼", match: ["internships"] },
  { key: "jobs", label: "Jobs", emoji: "🧑‍💻", match: ["jobs"] },
  { key: "orgs", label: "Organizations", emoji: "🏛️", match: ["organizations"] },
  { key: "businesses", label: "Businesses", emoji: "🏪", match: ["businesses"] },
];

const SUGGESTED_PROMPTS = [
  "Best barber near me",
  "Who's throwing parties Friday?",
  "Best internships for finance majors",
  "Scholarships for HBCU students",
  "Cheap food near campus",
  "Best photographers",
];

const SCHOOLS = ["Any school", "Howard", "Spelman", "Morehouse", "FAMU", "Hampton", "Talladega"];
const SORTS = ["Best Match", "Newest", "Trending", "Price: Low → High", "Price: High → Low", "Top Rated"];

const SearchParams = z.object({ q: z.string().optional(), tab: z.enum(["campus", "browse", "ai"]).optional() });

export const Route = createFileRoute("/search")({
  validateSearch: SearchParams,
  head: () => ({
    meta: [
      { title: "Search — PlugU" },
      { name: "description", content: "Search the PlugU marketplace by hair, food, rides, parties, internships and more. Ask AI for the best plugs on your campus." },
      { property: "og:title", content: "PlugU Search" },
      { property: "og:description", content: "Find your plug — on campus and beyond." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const sp = useSearch({ from: "/search" });
  const navigate = useNavigate({ from: "/search" });
  const [tab, setTab] = useState<"campus" | "browse" | "ai">(sp.tab ?? "campus");
  const [query, setQuery] = useState(sp.q ?? "");
  const [type, setType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [school, setSchool] = useState(SCHOOLS[0]);
  const [maxDistance, setMaxDistance] = useState(10);
  const [maxPrice, setMaxPrice] = useState(500);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [availability, setAvailability] = useState<"any" | "today" | "week">("any");
  const [sort, setSort] = useState(SORTS[0]);

  useEffect(() => {
    const nextQ = query || undefined;
    if (sp.q === nextQ && sp.tab === tab) return;
    const t = setTimeout(() => {
      navigate({
        search: (prev: Record<string, unknown>) => ({ ...prev, q: nextQ, tab }),
        replace: true,
      });
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, query]);

  const results = useMemo(() => {
    const t = SEARCH_TYPES.find((s) => s.key === type);
    const typeMatch = t ? new Set(t.match.map((m) => m.toLowerCase())) : null;
    const q = query.trim().toLowerCase();
    const priceNum = (p: string) => parseFloat(p.replace(/[^0-9.]/g, "")) || 0;

    let arr = listings.filter((l) => {
      if (typeMatch && !typeMatch.has(l.category.toLowerCase())) return false;
      if (q && !`${l.title} ${l.seller} ${l.category}`.toLowerCase().includes(q)) return false;
      if (school !== "Any school" && !l.campus.toLowerCase().includes(school.toLowerCase())) return false;
      if (priceNum(l.price) > maxPrice) return false;
      if (l.rating < minRating) return false;
      return true;
    });

    switch (sort) {
      case "Newest": arr = [...arr].reverse(); break;
      case "Trending": arr = [...arr].sort((a, b) => b.rating - a.rating); break;
      case "Price: Low → High": arr = [...arr].sort((a, b) => priceNum(a.price) - priceNum(b.price)); break;
      case "Price: High → Low": arr = [...arr].sort((a, b) => priceNum(b.price) - priceNum(a.price)); break;
      case "Top Rated": arr = [...arr].sort((a, b) => b.rating - a.rating); break;
    }
    return arr;
  }, [type, query, school, maxPrice, minRating, sort]);

  return (
    <AppShell title="SEARCH">
      <section className="px-5 pt-4 sticky top-[64px] z-20 bg-background/85 backdrop-blur-xl pb-3 border-b border-border/50">
        <div className={`items-center gap-2 ${tab === "campus" ? "hidden" : "flex"}`}>
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              type="search"
              aria-label={tab === "ai" ? "Ask PlugU AI" : "Search PlugU"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "ai" ? "Ask anything about your campus…" : "Search PlugU…"}
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button onClick={() => setQuery("")} className="tap text-muted-foreground" aria-label="Clear">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {tab === "browse" && (
            <button
              onClick={() => setShowFilters((v) => !v)}
              aria-label="Filters"
              className={`tap h-11 w-11 grid place-items-center rounded-2xl border ${showFilters ? "bg-primary/15 border-primary/60 text-primary" : "bg-card border-border"}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1 p-1 rounded-2xl bg-card border border-border">
          <TabBtn active={tab === "campus"} onClick={() => setTab("campus")} icon={Search} label="Everything" />
          <TabBtn active={tab === "browse"} onClick={() => setTab("browse")} icon={SlidersHorizontal} label="Market" />
          <TabBtn active={tab === "ai"} onClick={() => setTab("ai")} icon={Sparkles} label="Ask AI" />
        </div>
      </section>

      {tab === "campus" ? (
        <div className="pt-4">
          <UniversalSearchPanel query={query} setQuery={setQuery} />
        </div>
      ) : tab === "browse" ? (
        <BrowseTab
          type={type} setType={setType}
          showFilters={showFilters}
          filters={{ school, setSchool, maxDistance, setMaxDistance, maxPrice, setMaxPrice, minRating, setMinRating, verifiedOnly, setVerifiedOnly, openNow, setOpenNow, availability, setAvailability, sort, setSort }}
          results={results}
        />
      ) : (
        <AskAITab initialQuery={query} setQuery={setQuery} />
      )}
    </AppShell>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Search; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`tap py-2 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all ${
        active ? "bg-[image:var(--gradient-bronze)] text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

// ----------- Browse -----------

type Filters = {
  school: string; setSchool: (v: string) => void;
  maxDistance: number; setMaxDistance: (n: number) => void;
  maxPrice: number; setMaxPrice: (n: number) => void;
  minRating: number; setMinRating: (n: number) => void;
  verifiedOnly: boolean; setVerifiedOnly: (b: boolean) => void;
  openNow: boolean; setOpenNow: (b: boolean) => void;
  availability: "any" | "today" | "week"; setAvailability: (v: "any" | "today" | "week") => void;
  sort: string; setSort: (s: string) => void;
};

function BrowseTab({ type, setType, showFilters, filters, results }: { type: string; setType: (s: string) => void; showFilters: boolean; filters: Filters; results: typeof listings }) {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  function toggleSave(id: string, title: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast("Removed from saved");
      } else {
        next.add(id);
        toast.success(`Saved “${title.length > 32 ? title.slice(0, 32) + "…" : title}”`);
      }
      return next;
    });
  }

  return (
    <>
      <section className="px-5 mt-4">
        <div tabIndex={0} className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip active={type === "all"} onClick={() => setType("all")} label="All" />
          {SEARCH_TYPES.map((s) => (
            <Chip key={s.key} active={type === s.key} onClick={() => setType(s.key)} label={`${s.emoji} ${s.label}`} />
          ))}
        </div>
      </section>

      {showFilters && <FiltersPanel f={filters} />}

      <section className="px-5 mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{results.length} result{results.length === 1 ? "" : "s"}</span>
        <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3 text-accent" /> {filters.sort}</span>
      </section>

      <section className="px-5 mt-3 grid grid-cols-2 gap-3 pb-6">
        {results.map((l, i) => (
          <article
            key={l.id}
            className="rounded-2xl bg-card border border-border overflow-hidden tap"
            style={{ animation: `plugu-fade-up 0.35s ease-out ${i * 30}ms both` }}
          >
            <div className="relative aspect-square bg-secondary">
              <img src={l.image} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
              <span className="absolute bottom-2 left-2 text-[10px] tracking-wider uppercase px-2 py-1 rounded-full bg-background/70 backdrop-blur">{l.category}</span>
              <button
                aria-label={saved.has(l.id) ? "Remove from saved" : "Save"}
                aria-pressed={saved.has(l.id)}
                onClick={(e) => { e.stopPropagation(); toggleSave(l.id, l.title); }}
                className="tap absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-background/70 backdrop-blur"
              >
                <Heart className={`h-4 w-4 transition-colors ${saved.has(l.id) ? "fill-primary text-primary" : ""}`} />
              </button>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium line-clamp-2">{l.title}</p>
              <p className="text-primary font-bold mt-1">{l.price}</p>
              <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="truncate inline-flex items-center gap-1">
                  {l.seller} <VerifiedStudentBadge size="xs" iconOnly />
                </span>
                <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-accent fill-accent" />{l.rating}</span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {l.campus}
              </p>
            </div>
          </article>
        ))}
        {results.length === 0 && (
          <div className="col-span-2 text-center py-12 text-sm text-muted-foreground">
            No matches. Try clearing filters or switching categories.
          </div>
        )}
      </section>
    </>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`tap shrink-0 px-3.5 py-2 rounded-full text-xs border transition-all ${
        active ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary shadow-[var(--shadow-glow)]" : "bg-card text-muted-foreground border-border"
      }`}
    >{label}</button>
  );
}

function FiltersPanel({ f }: { f: Filters }) {
  return (
    <section className="px-5 mt-3">
      <div className="rounded-2xl bg-card border border-border p-4 space-y-4 slide-up">
        <Row label="School">
          <select value={f.school} onChange={(e) => f.setSchool(e.target.value)} className="bg-secondary border border-border rounded-lg px-3 py-2 text-xs outline-none">
            {SCHOOLS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Row>
        <Slider label={`Distance: ${f.maxDistance} mi`} min={1} max={25} value={f.maxDistance} onChange={f.setMaxDistance} />
        <Slider label={`Max Price: $${f.maxPrice}`} min={5} max={500} step={5} value={f.maxPrice} onChange={f.setMaxPrice} />
        <Slider label={`Min Rating: ${f.minRating.toFixed(1)}★`} min={0} max={5} step={0.5} value={f.minRating} onChange={f.setMinRating} />
        <Row label="Availability">
          <div className="flex gap-1.5">
            {(["any", "today", "week"] as const).map((a) => (
              <button key={a} onClick={() => f.setAvailability(a)} className={`tap text-[11px] px-3 py-1.5 rounded-full border ${f.availability === a ? "bg-primary/15 border-primary/60 text-primary" : "border-border text-muted-foreground"}`}>
                {a === "any" ? "Any" : a === "today" ? "Today" : "This week"}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Verified Seller">
          <Toggle on={f.verifiedOnly} onChange={f.setVerifiedOnly} />
        </Row>
        <Row label="Open Now">
          <Toggle on={f.openNow} onChange={f.setOpenNow} />
        </Row>
        <Row label="Sort">
          <select value={f.sort} onChange={(e) => f.setSort(e.target.value)} className="bg-secondary border border-border rounded-lg px-3 py-2 text-xs outline-none">
            {SORTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Row>
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Slider({ label, min, max, step = 1, value, onChange }: { label: string; min: number; max: number; step?: number; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-[var(--plugu-gold)]" />
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (b: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={`tap h-6 w-11 rounded-full relative transition-colors ${on ? "bg-primary" : "bg-secondary border border-border"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

// ----------- Ask AI -----------

function AskAITab({ initialQuery, setQuery }: { initialQuery: string; setQuery: (s: string) => void }) {
  const navigate = useNavigate();
  const ask = useServerFn(askAI);
  const askLive = useServerFn(askPlugU);
  const { user } = useSession();
  const [live, setLive] = useState<AskPlugUResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskAIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastRan = useRef<string>("");

  async function run(q: string) {
    const question = q.trim();
    if (question.length < 2 || lastRan.current === question) return;
    lastRan.current = question;
    setLoading(true); setError(null); setResult(null); setLive(null);
    if (user) {
      try {
        // Signed-in students get answers grounded in real campus rows.
        const r = await askLive({ data: { question } });
        setLive(r);
        if (r.error) setError(r.error);
        setLoading(false);
        return;
      } catch {
        // Live layer unavailable — fall back to the general assistant.
      }
    }
    try {
      const r = await ask({ data: { question } });
      setResult(r);
      if (r.error) setError(r.error);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Auto-run if query was preloaded
  useEffect(() => {
    if (initialQuery && initialQuery.length >= 3) run(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="px-5 mt-5 pb-8">
      <div className="rounded-2xl border border-[var(--plugu-purple)]/40 bg-[var(--plugu-purple)]/10 p-4">
        <div className="flex items-center gap-2 text-[var(--plugu-purple)]">
          <Sparkles className="h-4 w-4" />
          <p className="text-xs font-bold tracking-wider uppercase">PlugU AI</p>
        </div>
        <p className="text-sm mt-1 text-foreground/90">
          Ask anything about your campus — vendors, parties, internships, scholarships.
        </p>
        <button
          onClick={() => run(initialQuery)}
          disabled={loading || initialQuery.trim().length < 2}
          className="mt-3 w-full rounded-xl bg-[var(--plugu-purple)] text-white py-2.5 text-sm font-semibold tap disabled:opacity-40 inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <><ChargingLoader size={18} /> Thinking…</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Ask PlugU AI</>
          )}
        </button>
      </div>

      {!result && !live && !loading && (
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => { setQuery(p); run(p); }}
                className="tap text-xs px-3 py-2 rounded-full bg-card border border-border hover:border-[var(--plugu-purple)]/50"
              >{p}</button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</div>
      )}

      {live && (
        <div className="mt-5 space-y-4 slide-up">
          {live.answer && (
            <div className="rounded-2xl bg-card border border-border p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Answer</p>
              <p className="text-sm text-foreground/90 leading-relaxed">{live.answer}</p>
            </div>
          )}

          {live.hits.length > 0 ? (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1">
                <BadgeCheck className="h-3 w-3 text-primary" /> Live on your campus
              </p>
              <div className="space-y-2">
                {live.hits.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      if (h.listingId) navigate({ to: "/checkout/$listingId", params: { listingId: h.listingId } });
                      else navigate({ to: "/pulse" });
                    }}
                    className="tap w-full text-left rounded-2xl bg-card border border-border p-4 flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground text-sm font-bold">
                      {h.kind === "drop" ? <Flame className="h-4 w-4" /> : h.title.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{h.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {h.subtitle}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-secondary border border-border">{h.category}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-card border border-border p-4 text-sm text-muted-foreground">
              Nothing live matches that on your campus yet. Try the Browse tab or check Pulse for what's happening now.
            </div>
          )}

          {live.links.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Around the Web</p>
              <div className="space-y-2">
                {live.links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noreferrer noopener" className="tap flex items-center gap-3 rounded-2xl bg-card border border-border p-3">
                    <SourceIcon source={l.source} />
                    <span className="text-sm flex-1 truncate">{l.label}</span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="mt-5 space-y-4 slide-up">
          {result.answer && (
            <div className="rounded-2xl bg-card border border-border p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Answer</p>
              <p className="text-sm text-foreground/90 leading-relaxed">{result.answer}</p>
            </div>
          )}

          {result.plugu.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1">
                <BadgeCheck className="h-3 w-3 text-primary" /> On PlugU
              </p>
              <div className="space-y-2">
                {result.plugu.map((p, i) => (
                  <div key={i} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground text-sm font-bold">
                      {p.title.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{p.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {p.subtitle}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-secondary border border-border">{p.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.links.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Around the Web</p>
              <div className="space-y-2">
                {result.links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noreferrer noopener" className="tap flex items-center gap-3 rounded-2xl bg-card border border-border p-3">
                    <SourceIcon source={l.source} />
                    <span className="text-sm flex-1 truncate">{l.label}</span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                External links are suggestions, not scraped content.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SourceIcon({ source }: { source: "instagram" | "tiktok" | "youtube" | "web" }) {
  const cls = "h-4 w-4";
  switch (source) {
    case "instagram": return <span className="h-8 w-8 grid place-items-center rounded-xl bg-rose-500/15 text-rose-300"><Instagram className={cls} /></span>;
    case "tiktok": return <span className="h-8 w-8 grid place-items-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300"><Music2 className={cls} /></span>;
    case "youtube": return <span className="h-8 w-8 grid place-items-center rounded-xl bg-red-500/15 text-red-300"><Youtube className={cls} /></span>;
    default: return <span className="h-8 w-8 grid place-items-center rounded-xl bg-secondary text-muted-foreground"><Globe className={cls} /></span>;
  }
}