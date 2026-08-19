import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Zap } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { useMyDrops } from "@/hooks/use-pulse";
import { useMyListings } from "@/hooks/use-listings";
import { createDrop, deleteDrop, countdown } from "@/lib/pulse-db";
import { ZONE_SUGGESTIONS } from "./AvailableNowControl";
import { containsProhibited } from "@/lib/ugc-safety";

const FLASH_WINDOWS = [
  { label: "30 min", mins: 30 },
  { label: "1 hr", mins: 60 },
  { label: "3 hrs", mins: 180 },
];

export function DropComposer() {
  const qc = useQueryClient();
  const { user } = useSession();
  const { profile } = useProfile();
  const { data: mine, isLoading } = useMyDrops();
  const { data: listings } = useMyListings();

  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [zone, setZone] = useState("");
  const [listingId, setListingId] = useState("");
  const [flash, setFlash] = useState(false);
  const [discount, setDiscount] = useState("");
  const [qty, setQty] = useState("");
  const [mins, setMins] = useState(60);
  const [busy, setBusy] = useState(false);

  const live = (mine ?? []).filter((d) => new Date(d.expires_at) > new Date());

  async function post() {
    if (!user?.id) return;
    const text = body.trim();
    if (text.length < 3) { toast.error("Say what's dropping"); return; }
    if (containsProhibited(text)) {
      toast.error("That drop breaks PlugU's marketplace rules");
      return;
    }
    setBusy(true);
    try {
      const linked = listings?.find((l) => l.id === listingId) ?? null;
      await createDrop(user.id, profile?.school_id ?? null, {
        body: text,
        zone_name: zone.trim() || null,
        listing_id: listingId || null,
        category: linked?.category ?? null,
        price_cents: linked?.price_cents ?? null,
        cta: linked ? (linked.kind === "service" ? "book" : "buy") : "none",
        is_flash: flash,
        discount_percent: flash && discount.trim() ? Math.min(90, Math.max(1, Math.round(Number(discount)))) : null,
        quantity_limit: flash && qty.trim() ? Math.max(1, Math.round(Number(qty))) : null,
        expires_at: new Date(Date.now() + (flash ? mins : 24 * 60) * 60_000).toISOString(),
      });
      toast.success(flash ? "Flash drop is live ⚡" : "Drop posted");
      setBody(""); setZone(""); setListingId(""); setDiscount(""); setQty(""); setFlash(false);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["my-drops"] });
      qc.invalidateQueries({ queryKey: ["drops"] });
    } catch (e) {
      toast.error("Couldn't post that drop", { description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    try {
      await deleteDrop(id);
      qc.invalidateQueries({ queryKey: ["my-drops"] });
      qc.invalidateQueries({ queryKey: ["drops"] });
      toast.success("Drop removed");
    } catch {
      toast.error("Couldn't remove that drop");
    }
  }

  return (
    <section className="px-5">
      <div className="rounded-3xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border" style={{ color: "var(--plugu-gold)" }}>
            <Zap className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Drops</p>
            <p className="text-[11px] text-muted-foreground">
              Quick updates that expire in 24 hours. Flash Drops add a countdown and a limit.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="tap shrink-0 rounded-full bg-primary px-3.5 py-2 text-[11px] font-semibold text-primary-foreground"
          >
            {open ? "Close" : "New drop"}
          </button>
        </div>

        {open && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 180))}
              rows={2}
              placeholder="3 plates left · pull up to the Student Center"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            />
            <div>
              <input
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="General campus area"
                aria-label="General campus area"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              />
              <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {ZONE_SUGGESTIONS.map((z) => (
                  <button key={z} type="button" onClick={() => setZone(z)}
                    className="tap shrink-0 rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground">
                    {z}
                  </button>
                ))}
              </div>
            </div>

            {listings && listings.length > 0 && (
              <select
                value={listingId}
                onChange={(e) => setListingId(e.target.value)}
                aria-label="Attach a listing"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              >
                <option value="">No listing attached</option>
                {listings.filter((l) => l.status === "active").map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            )}

            <label className="flex items-center gap-2 text-[12px] font-semibold">
              <input type="checkbox" checked={flash} onChange={(e) => setFlash(e.target.checked)} className="h-4 w-4" />
              Make this a Flash Drop ⚡
            </label>

            {flash && (
              <div className="space-y-2 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-3">
                <div className="flex gap-2">
                  <input
                    inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value)}
                    placeholder="% off" aria-label="Discount percent"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                  <input
                    inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)}
                    placeholder="How many" aria-label="Quantity limit"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  {FLASH_WINDOWS.map((w) => (
                    <button key={w.label} type="button" onClick={() => setMins(w.mins)} aria-pressed={mins === w.mins}
                      className={`tap flex-1 rounded-xl border px-2 py-2 text-[11px] font-semibold ${
                        mins === w.mins ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"
                      }`}>
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button" disabled={busy} onClick={post}
              className="tap w-full rounded-xl bg-primary py-2.5 text-[12px] font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? "Posting…" : flash ? "Launch flash drop" : "Post drop"}
            </button>
          </div>
        )}

        {!isLoading && live.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-border pt-3">
            {live.map((d) => (
              <li key={d.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{d.is_flash ? "⚡ " : ""}{d.body}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {countdown(d.expires_at)} left
                    {d.quantity_limit != null && ` · ${d.quantity_claimed}/${d.quantity_limit} claimed`}
                  </p>
                </div>
                <button
                  type="button" onClick={() => remove(d.id)} aria-label="Delete drop"
                  className="tap rounded-lg border border-border p-2 text-muted-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
