import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, MapPin, Zap } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { useMyAvailability } from "@/hooks/use-pulse";
import { useMyListings } from "@/hooks/use-listings";
import { clearAvailability, setAvailability, untilLabel } from "@/lib/pulse-db";
import { AVAILABLE_CATEGORIES } from "@/lib/categories";
import { LiveDot } from "@/components/pulse/PulseCards";

export const ZONE_SUGGESTIONS = [
  "Student Center", "Library", "Dining Hall", "Gym", "Campus Green",
  "Residence Halls", "Stadium", "Just off campus",
];

const DURATIONS = [
  { label: "1 hr", mins: 60 },
  { label: "2 hrs", mins: 120 },
  { label: "4 hrs", mins: 240 },
  { label: "Rest of today", mins: 0 },
];

function endOfDayIso() {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

export function AvailableNowControl() {
  const qc = useQueryClient();
  const { user } = useSession();
  const { profile } = useProfile();
  const { data: current, isLoading } = useMyAvailability();
  const { data: listings } = useMyListings();

  const live = !!current?.is_active && (!current.available_until || new Date(current.available_until) > new Date());

  const [open, setOpen] = useState(false);
  const [service, setService] = useState("");
  const [category, setCategory] = useState<string>("");
  const [zone, setZone] = useState("");
  const [price, setPrice] = useState("");
  const [slots, setSlots] = useState("");
  const [mins, setMins] = useState(120);
  const [listingId, setListingId] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!current) return;
    setService(current.service_label ?? "");
    setCategory(current.category ?? "");
    setZone(current.zone_name ?? "");
    setPrice(current.price_from_cents != null ? String(current.price_from_cents / 100) : "");
    setSlots(current.slots_remaining != null ? String(current.slots_remaining) : "");
    setListingId(current.listing_id ?? "");
  }, [current]);

  async function goLive() {
    if (!user?.id) return;
    if (!service.trim()) { toast.error("Add what you're offering"); return; }
    setBusy(true);
    try {
      const priceCents = price.trim() ? Math.round(Number(price) * 100) : null;
      if (priceCents != null && (!Number.isFinite(priceCents) || priceCents < 0)) {
        toast.error("Enter a valid starting price"); setBusy(false); return;
      }
      await setAvailability(user.id, profile?.school_id ?? null, {
        service_label: service.trim(),
        category: category || null,
        zone_name: zone.trim() || null,
        price_from_cents: priceCents,
        slots_remaining: slots.trim() ? Math.max(0, Math.round(Number(slots))) : null,
        available_until: mins === 0 ? endOfDayIso() : new Date(Date.now() + mins * 60_000).toISOString(),
        listing_id: listingId || null,
      });
      toast.success("You're live on Pulse", { description: "Students on your campus can see you now." });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["my-availability"] });
      qc.invalidateQueries({ queryKey: ["availability"] });
    } catch (e) {
      toast.error("Couldn't update availability", { description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function goOffline() {
    if (!user?.id) return;
    setBusy(true);
    try {
      await clearAvailability(user.id);
      toast.success("You're off Pulse");
      qc.invalidateQueries({ queryKey: ["my-availability"] });
      qc.invalidateQueries({ queryKey: ["availability"] });
    } catch (e) {
      toast.error("Couldn't turn that off", { description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return <div className="mx-5 h-24 animate-pulse rounded-3xl border border-border bg-card" />;
  }

  return (
    <section className="px-5">
      <div className={`rounded-3xl border p-4 ${live ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-card"}`}>
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-bold">
              {live && <LiveDot />} Available Now
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {live
                ? `${current?.service_label ?? "Live"}${current?.available_until ? ` · until ${untilLabel(current.available_until)}` : ""}${current?.zone_name ? ` · ${current.zone_name}` : ""}`
                : "Flip this on and you show up in Pulse, search, and the campus map."}
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => (live ? goOffline() : setOpen(true))}
            aria-pressed={live}
            className={`tap shrink-0 rounded-full px-3.5 py-2 text-[11px] font-semibold disabled:opacity-50 ${
              live ? "border border-border text-muted-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {live ? "Go offline" : "Go live"}
          </button>
        </div>

        {live && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="tap mt-3 w-full rounded-xl border border-border py-2 text-[11px] font-semibold text-muted-foreground"
          >
            Edit availability
          </button>
        )}

        {open && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground" htmlFor="an-service">
                What are you offering?
              </label>
              <input
                id="an-service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="Cuts, silk press, plates, rides…"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              />
            </div>

            <div tabIndex={0} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {AVAILABLE_CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(category === c.key ? "" : c.key)}
                  aria-pressed={category === c.key}
                  className={`tap shrink-0 rounded-full border px-3 py-1.5 text-[11px] ${
                    category === c.key ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>

            <div>
              <p className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <Clock className="h-3 w-3" /> Available until
              </p>
              <div className="mt-1 flex gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => setMins(d.mins)}
                    aria-pressed={mins === d.mins}
                    className={`tap flex-1 rounded-xl border px-2 py-2 text-[11px] font-semibold ${
                      mins === d.mins ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground" htmlFor="an-zone">
                <MapPin className="h-3 w-3" /> General campus area (never your exact address)
              </label>
              <input
                id="an-zone"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="Student Center area"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              />
              <div tabIndex={0} className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {ZONE_SUGGESTIONS.map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZone(z)}
                    className="tap shrink-0 rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground"
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-muted-foreground" htmlFor="an-price">Starting price</label>
                <input
                  id="an-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="25"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-muted-foreground" htmlFor="an-slots">Slots left</label>
                <input
                  id="an-slots" inputMode="numeric" value={slots} onChange={(e) => setSlots(e.target.value)}
                  placeholder="3"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            {listings && listings.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground" htmlFor="an-listing">
                  Link a listing so students can book instantly
                </label>
                <select
                  id="an-listing"
                  value={listingId}
                  onChange={(e) => setListingId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                >
                  <option value="">No listing</option>
                  {listings.filter((l) => l.status === "active").map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="tap flex-1 rounded-xl border border-border py-2.5 text-[11px] font-semibold text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={goLive}
                className="tap flex-1 rounded-xl bg-primary py-2.5 text-[11px] font-semibold text-primary-foreground disabled:opacity-50"
              >
                {busy ? "Saving…" : live ? "Update" : "Go live"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
