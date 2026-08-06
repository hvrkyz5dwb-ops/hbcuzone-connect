import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import {
  ArrowLeft, Plus, Pencil, Pause, Play, Trash2, X, Package, Wrench,
  Store, ImageIcon,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, LoadingList } from "@/components/EmptyState";
import { ErrorState } from "@/components/QueryStates";
import { useMyListings } from "@/hooks/use-listings";
import { useSchool } from "@/hooks/use-school";
import { useProfile } from "@/hooks/use-profile";
import {
  createListing, updateListing, setListingStatus, deleteListing,
  type ListingWithExtras, type ListingStatus,
} from "@/lib/listings-db";
import {
  AVAILABLE_CATEGORIES, PRICE_TYPES, FULFILLMENT_OPTIONS,
  formatPrice, type PriceType,
} from "@/lib/categories";

export const Route = createFileRoute("/seller/listings")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your listings — PlugU" },
      { name: "description", content: "Create, pause and manage your PlugU listings." },
    ],
  }),
  component: SellerListings,
});

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const listingSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(80),
  description: z.string().trim().max(1000).optional(),
  category: z.string().min(1, "Choose a category"),
  kind: z.enum(["product", "service"]),
  price_type: z.enum(["fixed", "starting_at", "hourly", "quote"]),
  price_dollars: z.number().min(0).max(100000),
  quantity: z.number().int().min(1).max(999).nullable(),
  availability: z.string().trim().max(120).optional(),
  fulfillment_time: z.string().trim().max(120).optional(),
  cancellation_policy: z.string().trim().max(500).optional(),
  fulfillment: z.array(z.string()).max(4),
  images: z.array(z.string()).max(6),
});

function SellerListings() {
  const { data, isPending, isError, refetch } = useMyListings();
  const [composer, setComposer] = useState<{ open: boolean; editing?: ListingWithExtras } | null>(null);

  return (
    <AppShell title="YOUR LISTINGS">
      <section className="px-5 pt-4">
        <Link to="/seller" className="tap inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Seller dashboard
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Your listings</h1>
            <p className="text-[11px] text-muted-foreground">Create, pause, reactivate or delete anytime.</p>
          </div>
          <button
            onClick={() => setComposer({ open: true })}
            className="tap inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-bronze)" }}
          >
            <Plus className="h-4 w-4" /> New
          </button>
        </div>
      </section>

      {isPending ? (
        <div className="mt-4"><LoadingList rows={4} /></div>
      ) : isError ? (
        <ErrorState
          title="Your listings didn't load"
          description="We couldn't reach your seller listings. Check your connection and try again."
          onRetry={() => void refetch()}
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No listings yet"
          description="Publish your first listing — a haircut slot, a hoodie, a photo session, tutoring hours."
          action={
            <button
              onClick={() => setComposer({ open: true })}
              className="tap inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-bronze)" }}
            >
              <Plus className="h-4 w-4" /> Create your first listing
            </button>
          }
        />
      ) : (
        <section className="mt-4 px-5 pb-24 space-y-2">
          {data.map((l) => (
            <ListingRow key={l.id} l={l} onEdit={() => setComposer({ open: true, editing: l })} onChanged={refetch} />
          ))}
        </section>
      )}

      {composer?.open && (
        <ListingComposer
          initial={composer.editing}
          onClose={() => setComposer(null)}
          onSaved={() => { setComposer(null); refetch(); }}
        />
      )}
    </AppShell>
  );
}

function StatusPill({ status }: { status: ListingStatus }) {
  const map: Record<ListingStatus, { label: string; cls: string }> = {
    active: { label: "Active", cls: "border-primary/40 text-primary" },
    draft: { label: "Draft", cls: "border-border text-muted-foreground" },
    paused: { label: "Paused", cls: "border-amber-500/40 text-amber-400" },
    sold_out: { label: "Sold out", cls: "border-border text-muted-foreground" },
    removed: { label: "Removed", cls: "border-destructive/40 text-destructive" },
  };
  const m = map[status] ?? map.draft;
  return <span className={`inline-flex items-center text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${m.cls}`}>{m.label}</span>;
}

function ListingRow({
  l, onEdit, onChanged,
}: { l: ListingWithExtras; onEdit: () => void; onChanged: () => void }) {
  const qc = useQueryClient();
  const cover = l.images[0]?.url;

  const setStatus = useMutation({
    mutationFn: (status: ListingStatus) => setListingStatus(l.id, status),
    onSuccess: () => {
      toast.success("Listing updated");
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      qc.invalidateQueries({ queryKey: ["marketplace"] });
      onChanged();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update"),
  });

  const remove = useMutation({
    mutationFn: () => deleteListing(l.id),
    onSuccess: () => {
      toast.success("Listing deleted");
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      qc.invalidateQueries({ queryKey: ["marketplace"] });
      onChanged();
    },
  });

  const paused = l.status === "paused";
  const active = l.status === "active";

  return (
    <div className="rounded-2xl border border-border bg-card p-3 flex gap-3">
      <div className="h-16 w-16 rounded-xl overflow-hidden bg-secondary grid place-items-center shrink-0">
        {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{l.title}</p>
          <StatusPill status={l.status} />
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
          {formatPrice(l.price_cents, l.price_type as PriceType)} · {l.category} · {l.kind}
        </p>
        <div className="mt-2 flex gap-1.5 flex-wrap">
          <button onClick={onEdit} className="tap inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-secondary border border-border">
            <Pencil className="h-3 w-3" /> Edit
          </button>
          {active && (
            <button onClick={() => setStatus.mutate("paused")} className="tap inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-secondary border border-border">
              <Pause className="h-3 w-3" /> Pause
            </button>
          )}
          {(paused || l.status === "draft" || l.status === "sold_out") && (
            <button onClick={() => setStatus.mutate("active")} className="tap inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-primary/15 border border-primary/40 text-primary">
              <Play className="h-3 w-3" /> Activate
            </button>
          )}
          <button
            onClick={() => { if (confirm("Delete this listing? This can't be undone.")) remove.mutate(); }}
            className="tap inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-secondary border border-border text-destructive"
          >
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ListingComposer({
  initial, onClose, onSaved,
}: { initial?: ListingWithExtras; onClose: () => void; onSaved: () => void }) {
  const school = useSchool();
  const { profile } = useProfile();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? AVAILABLE_CATEGORIES[0].key);
  const [kind, setKind] = useState<"product" | "service">(initial?.kind ?? "service");
  const [priceType, setPriceType] = useState<PriceType>((initial?.price_type as PriceType) ?? "fixed");
  const [price, setPrice] = useState(initial ? String(initial.price_cents / 100) : "");
  const [quantity, setQuantity] = useState<string>(initial?.quantity ? String(initial.quantity) : "");
  const [availability, setAvailability] = useState(initial?.availability ?? "");
  const [fulfillmentTime, setFulfillmentTime] = useState(initial?.fulfillment_time ?? "");
  const [cancellationPolicy, setCancellationPolicy] = useState(initial?.cancellation_policy ?? "");
  const [fulfillment, setFulfillment] = useState<string[]>(initial?.fulfillment ?? []);
  const [images, setImages] = useState<string[]>(initial?.images.map((i) => i.url) ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) {
      if (!ALLOWED_MIME.includes(f.type)) { toast.error(`${f.name}: unsupported file type`); continue; }
      if (f.size > MAX_IMAGE_BYTES) { toast.error(`${f.name}: max 3 MB`); continue; }
      const compressed = await compressImage(f);
      setImages((prev) => (prev.length >= 6 ? prev : [...prev, compressed]));
    }
    e.target.value = "";
  }

  async function submit() {
    if (pending) return;
    const priceDollars = priceType === "quote" ? 0 : parseFloat(price);
    const parsed = listingSchema.safeParse({
      title, description: description || undefined, category, kind, price_type: priceType,
      price_dollars: isNaN(priceDollars) ? -1 : priceDollars,
      quantity: quantity ? parseInt(quantity, 10) : null,
      availability: availability || undefined,
      fulfillment_time: fulfillmentTime || undefined,
      cancellation_policy: cancellationPolicy || undefined,
      fulfillment, images,
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
    if (priceType !== "quote" && priceDollars <= 0) {
      setErrors({ price: "Price must be greater than $0" });
      toast.error("Price must be greater than $0");
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const payload = {
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        kind: parsed.data.kind,
        price_type: parsed.data.price_type,
        price_cents: Math.round(priceDollars * 100),
        campus_name: school.name,
        school_id: profile?.school_id ?? null,
        quantity: parsed.data.kind === "product" ? parsed.data.quantity : null,
        availability: parsed.data.availability ?? null,
        fulfillment_time: parsed.data.fulfillment_time ?? null,
        cancellation_policy: parsed.data.cancellation_policy ?? null,
        fulfillment: parsed.data.fulfillment,
        images: parsed.data.images,
      };
      if (initial) {
        await updateListing(initial.id, payload);
        toast.success("Listing updated");
      } else {
        await createListing({ ...payload, status: "active" });
        toast.success("Listing published");
      }
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save listing");
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-end sm:place-items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-3xl p-5 max-h-[92dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">{initial ? "Edit listing" : "New listing"}</h2>
          <button onClick={onClose} aria-label="Close" className="tap h-8 w-8 grid place-items-center rounded-full bg-secondary"><X className="h-4 w-4" /></button>
        </div>

        {/* Photos */}
        <div>
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Photos <span className="text-muted-foreground/70">({images.length}/6)</span></span>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {images.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-secondary">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button onClick={() => setImages((p) => p.filter((_, ii) => ii !== i))} className="absolute top-1 right-1 h-6 w-6 grid place-items-center rounded-full bg-background/80" aria-label="Remove">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 6 && (
              <label className="aspect-square rounded-xl border border-dashed border-border grid place-items-center bg-secondary text-muted-foreground cursor-pointer">
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={onFile} className="hidden" />
                <Plus className="h-4 w-4" />
              </label>
            )}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">JPG · PNG · WEBP · GIF · up to 3 MB each</p>
        </div>

        <Field label="Title" error={errors.title}>
          <input value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Silk press · walk-ins welcome" className={`w-full px-3 py-2.5 rounded-xl bg-secondary border outline-none text-sm ${errors.title ? "border-rose-500/60" : "border-border"}`} />
        </Field>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Type">
            <div className="grid grid-cols-2 gap-1.5">
              {(["service", "product"] as const).map((k) => (
                <button key={k} onClick={() => setKind(k)} className={`tap inline-flex items-center justify-center gap-1 py-2 rounded-xl border text-xs ${kind === k ? "bg-primary/15 border-primary/50 text-foreground" : "bg-secondary border-border text-muted-foreground"}`}>
                  {k === "service" ? <Wrench className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                  {k === "service" ? "Service" : "Product"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border outline-none text-sm">
              {AVAILABLE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Price type">
            <select value={priceType} onChange={(e) => setPriceType(e.target.value as PriceType)} className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border outline-none text-sm">
              {PRICE_TYPES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </Field>
          <Field label={priceType === "hourly" ? "Rate ($/hr)" : "Price ($)"} error={errors.price}>
            <input
              value={price}
              disabled={priceType === "quote"}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder={priceType === "quote" ? "Contact for pricing" : "25"}
              className={`w-full px-3 py-2.5 rounded-xl bg-secondary border outline-none text-sm disabled:opacity-50 ${errors.price ? "border-rose-500/60" : "border-border"}`}
            />
          </Field>
        </div>

        {kind === "product" && (
          <Field label="Quantity available" hint="Leave blank if unlimited">
            <input value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="10" className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border outline-none text-sm" />
          </Field>
        )}

        <Field label="Description">
          <textarea value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What are you offering?" className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border outline-none text-sm resize-none" />
          <div className="mt-1 text-right text-[10px] text-muted-foreground">{description.length}/1000</div>
        </Field>

        <Field label="Fulfillment">
          <div className="flex gap-1.5 flex-wrap">
            {FULFILLMENT_OPTIONS.map((f) => {
              const on = fulfillment.includes(f.key);
              return (
                <button key={f.key} onClick={() => setFulfillment((prev) => on ? prev.filter((k) => k !== f.key) : [...prev, f.key])}
                  className={`tap px-3 py-1.5 text-[11px] rounded-full border ${on ? "bg-primary/15 border-primary/50 text-foreground" : "bg-secondary border-border text-muted-foreground"}`}>
                  {f.label}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Availability" hint="e.g. Mon–Fri 5–9pm">
            <input value={availability} maxLength={120} onChange={(e) => setAvailability(e.target.value)} placeholder="Weekends" className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border outline-none text-sm" />
          </Field>
          <Field label="Fulfillment time" hint="e.g. Same day, 2 days">
            <input value={fulfillmentTime} maxLength={120} onChange={(e) => setFulfillmentTime(e.target.value)} placeholder="Same day" className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border outline-none text-sm" />
          </Field>
        </div>

        <Field label="Cancellation policy">
          <textarea value={cancellationPolicy} maxLength={500} onChange={(e) => setCancellationPolicy(e.target.value)} rows={2} placeholder="No refund within 24h of appointment." className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border outline-none text-sm resize-none" />
        </Field>

        <p className="mt-3 text-[10px] text-muted-foreground">Posting to <span className="text-foreground">{school.name}</span></p>

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

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="mt-3 block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && !error && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-[11px] text-rose-400">{error}</p>}
    </label>
  );
}

// Compress an uploaded image to a max dimension + JPEG quality so storage stays small.
async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });
  try {
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return dataUrl;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}