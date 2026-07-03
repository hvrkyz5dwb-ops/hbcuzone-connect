import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Heart, MessageSquare, Star, Flag, SearchX, Sparkles, ShoppingBag, Plus, Trash2, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { categories } from "@/lib/mock-data";
import { PullToRefresh } from "@/components/PullToRefresh";
import { LoadingGrid, EmptyState } from "@/components/EmptyState";
import { VerifiedStudentBadge } from "@/components/VerifiedStudentBadge";
import { useListings } from "@/hooks/use-listings";
import { createListing, deleteListing, updateListing, type UserListing } from "@/lib/listings-storage";
import { useSchool } from "@/hooks/use-school";
import { toggleSave as toggleSaveStore, isSaved } from "@/lib/feed-storage";
import { useFeedState } from "@/hooks/use-feed-state";

const listingSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(80, "Title must be under 80 characters"),
  price: z.number().positive("Price must be greater than $0").max(100000, "Price is too large"),
  category: z.string().min(1, "Choose a category"),
  description: z.string().trim().max(500, "Description must be under 500 characters").optional(),
  image: z.string().min(1, "Add a photo"),
});

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
  const { all: listings } = useListings();
  const feed = useFeedState();
  const [active, setActive] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [composer, setComposer] = useState<{ open: boolean; editing?: UserListing } | null>(null);

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
    const on = toggleSaveStore(id);
    toast(on ? "Saved to your collection" : "Removed from saved");
  }

  return (
    <AppShell title="MARKET">
      <PullToRefresh onRefresh={async () => { setLoading(true); await new Promise(r => setTimeout(r, 600)); setLoading(false); }}>
      <section className="px-5 pt-5 slide-up">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: "/search", search: { q: query || undefined, tab: "browse" } })}
            className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border text-left tap"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1 truncate">
              {query || "Search hair, food, parties, internships…"}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--plugu-purple)] inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          </button>
          <button
            aria-label="Filters"
            onClick={() => navigate({ to: "/search", search: { tab: "browse" } })}
            className="tap h-11 w-11 grid place-items-center rounded-2xl bg-card border border-border"
          >
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
                aria-label={feed.saved.includes(l.id) ? "Unsave" : "Save"}
                className="tap absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-background/70 backdrop-blur"
              >
                <Heart className={`h-4 w-4 ${feed.saved.includes(l.id) ? "fill-accent text-accent" : ""}`} />
              </button>
              <span className="absolute bottom-2 left-2 text-[10px] tracking-wider uppercase px-2 py-1 rounded-full bg-background/70 backdrop-blur">{l.category}</span>
              {(l as any).mine && (
                <div className="absolute top-2 left-2 flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setComposer({ open: true, editing: l as UserListing }); }}
                    aria-label="Edit listing"
                    className="tap h-7 w-7 grid place-items-center rounded-full bg-background/70 backdrop-blur"
                  ><Pencil className="h-3 w-3" /></button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm("Delete this listing?")) { deleteListing(l.id); toast.success("Listing deleted"); } }}
                    aria-label="Delete listing"
                    className="tap h-7 w-7 grid place-items-center rounded-full bg-background/70 backdrop-blur text-destructive"
                  ><Trash2 className="h-3 w-3" /></button>
                </div>
              )}
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
                <button
                  onClick={() => navigate({ to: "/checkout/$listingId", params: { listingId: l.id } })}
                  className="tap flex-1 flex items-center justify-center gap-1 py-2 text-xs rounded-xl bg-[image:var(--gradient-bronze)] text-primary-foreground font-medium"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Buy
                </button>
                <button
                  onClick={() => { toast.success(`Message opened · ${l.seller}`); navigate({ to: "/messages" }); }}
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
        ))}
      </section>
      )}
      </PullToRefresh>

      {/* Floating create button */}
      <button
        onClick={() => setComposer({ open: true })}
        aria-label="Create listing"
        className="tap fixed bottom-24 right-5 h-14 w-14 rounded-full grid place-items-center shadow-[var(--shadow-glow)] z-40"
        style={{ background: "var(--gradient-bronze)", color: "var(--primary-foreground)" }}
      >
        <Plus className="h-6 w-6" />
      </button>

      {composer?.open && (
        <ListingComposer
          initial={composer.editing}
          defaultCampus={school.name}
          onClose={() => setComposer(null)}
        />
      )}
    </AppShell>
  );
}

function ListingComposer({
  initial, defaultCampus, onClose,
}: { initial?: UserListing; defaultCampus: string; onClose: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [price, setPrice] = useState(initial?.price?.replace(/[^0-9.]/g, "") ?? "");
  const [category, setCategory] = useState(initial?.category ?? categories[0].label);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  // Stable idempotency key for this composer session — prevents duplicate creates
  // from double-submits, retries, or double-click races.
  const [idempotencyKey] = useState(
    () => `ilk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
  );

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) { toast.error("Image too large — max 3 MB"); return; }
    const r = new FileReader();
    r.onload = () => setImage(String(r.result));
    r.readAsDataURL(f);
  }

  function submit() {
    if (pending) return;
    const parsed = listingSchema.safeParse({
      title,
      price: parseFloat(price),
      category,
      description,
      image: image || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!map[key]) map[key] = issue.message;
      }
      setErrors(map);
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setErrors({});
    setPending(true);
    const v = parsed.data;
    const payload = {
      title: v.title,
      price: `$${v.price.toFixed(2).replace(/\.00$/, "")}`,
      category: v.category,
      description: v.description ?? "",
      image: v.image,
      seller: "You",
      school: defaultCampus,
    };
    try {
      if (initial) {
        updateListing(initial.id, payload);
        toast.success("Listing updated");
      } else {
        createListing(payload, { idempotencyKey });
        toast.success("Listing published");
      }
      onClose();
    } catch {
      toast.error("Couldn't save listing — please try again");
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-end sm:place-items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl p-5 max-h-[92dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">{initial ? "Edit listing" : "New listing"}</h2>
          <button onClick={onClose} aria-label="Close" className="tap h-8 w-8 grid place-items-center rounded-full bg-secondary"><X className="h-4 w-4" /></button>
        </div>

        <label className="block">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Photo</span>
          <div className="mt-1 aspect-video rounded-2xl border border-dashed border-border grid place-items-center overflow-hidden bg-secondary relative">
            {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-muted-foreground">Tap to add photo</span>}
            <input type="file" accept="image/*" onChange={onFile} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          {errors.image && <p className="mt-1 text-[11px] text-rose-400">{errors.image}</p>}
        </label>

        <label className="mt-3 block">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Title</span>
          <input value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Silk press · $45" className={`mt-1 w-full px-3 py-2.5 rounded-xl bg-secondary border outline-none text-sm ${errors.title ? "border-rose-500/60" : "border-border"}`} />
          {errors.title && <p className="mt-1 text-[11px] text-rose-400">{errors.title}</p>}
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Price</span>
            <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="25" className={`mt-1 w-full px-3 py-2.5 rounded-xl bg-secondary border outline-none text-sm ${errors.price ? "border-rose-500/60" : "border-border"}`} />
            {errors.price && <p className="mt-1 text-[11px] text-rose-400">{errors.price}</p>}
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-secondary border border-border outline-none text-sm">
              {categories.map((c) => <option key={c.key} value={c.label}>{c.label}</option>)}
            </select>
          </label>
        </div>

        <label className="mt-3 block">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Description</span>
          <textarea value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What are you offering?" className={`mt-1 w-full px-3 py-2.5 rounded-xl bg-secondary border outline-none text-sm resize-none ${errors.description ? "border-rose-500/60" : "border-border"}`} />
          <div className="mt-1 flex items-center justify-between">
            {errors.description ? <p className="text-[11px] text-rose-400">{errors.description}</p> : <span />}
            <span className="text-[10px] text-muted-foreground">{description.length}/500</span>
          </div>
        </label>

        <p className="mt-2 text-[10px] text-muted-foreground">Posting to <span className="text-foreground">{defaultCampus}</span></p>

        <button
          onClick={submit}
          disabled={pending}
          className="mt-4 w-full tap py-3 rounded-2xl text-sm font-semibold text-primary-foreground disabled:opacity-60"
          style={{ background: "var(--gradient-bronze)" }}
        >
          {pending ? "Publishing…" : initial ? "Save changes" : "Publish listing"}
        </button>
      </div>
    </div>
  );
}