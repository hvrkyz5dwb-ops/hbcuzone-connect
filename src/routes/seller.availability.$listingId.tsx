import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { LoadingList } from "@/components/EmptyState";
import { ErrorState, PageLoader } from "@/components/QueryStates";
import { fetchListing } from "@/lib/listings-db";
import {
  useSellerSlots, useAddSellerSlot, useDeleteSellerSlot,
} from "@/hooks/use-orders";

export const Route = createFileRoute("/seller/availability/$listingId")({
  ssr: false,
  head: () => ({ meta: [{ title: "Availability — PlugU" }] }),
  component: AvailabilityPage,
});

function toIsoLocal(date: string, time: string): string {
  // date=YYYY-MM-DD, time=HH:MM. Interpret as local time.
  return new Date(`${date}T${time}:00`).toISOString();
}

function AvailabilityPage() {
  const { listingId } = Route.useParams();
  const listingQ = useQuery({ queryKey: ["listing", listingId], queryFn: () => fetchListing(listingId) });
  const slotsQ = useSellerSlots(listingId);
  const addSlot = useAddSellerSlot();
  const deleteSlot = useDeleteSellerSlot(listingId);

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(today);
  const [start, setStart] = useState<string>("10:00");
  const [durationMin, setDurationMin] = useState<number>(60);

  const [upcoming, past] = useMemo(() => {
    const now = Date.now();
    const rows = slotsQ.data ?? [];
    return [
      rows.filter((s) => new Date(s.slot_end).getTime() >= now),
      rows.filter((s) => new Date(s.slot_end).getTime() < now),
    ];
  }, [slotsQ.data]);

  async function onAdd() {
    try {
      const slotStart = toIsoLocal(date, start);
      const slotEnd = new Date(new Date(slotStart).getTime() + durationMin * 60_000).toISOString();
      if (new Date(slotStart).getTime() < Date.now()) {
        toast.error("Pick a time in the future");
        return;
      }
      await addSlot.mutateAsync({ listingId, slotStart, slotEnd });
      toast.success("Slot added");
    } catch (err) {
      const msg = (err as Error).message;
      toast.error("Couldn't add slot", { description: msg.includes("no_overlap") ? "That time overlaps another slot." : msg });
    }
  }
  async function onDelete(slotId: string) {
    try {
      await deleteSlot.mutateAsync(slotId);
      toast.success("Slot removed");
    } catch (err) {
      toast.error("Couldn't remove slot", { description: (err as Error).message });
    }
  }

  if (listingQ.isPending) {
    return <AppShell title="AVAILABILITY"><PageLoader message="Loading availability…" /></AppShell>;
  }
  if (listingQ.isError) {
    return (
      <AppShell title="AVAILABILITY">
        <ErrorState
          title="Availability didn't load"
          description="We couldn't reach this listing's schedule. Check your connection and try again."
          onRetry={() => void listingQ.refetch()}
        />
      </AppShell>
    );
  }
  if (!listingQ.data) {
    return (
      <AppShell title="AVAILABILITY">
        <section className="px-5 pt-10 text-center">
          <p className="text-sm text-muted-foreground">Listing not found.</p>
          <Link to="/seller/listings" className="mt-4 inline-block text-xs text-accent">← Back to listings</Link>
        </section>
      </AppShell>
    );
  }
  if (listingQ.data.kind !== "service") {
    return (
      <AppShell title="AVAILABILITY">
        <section className="px-5 pt-10 text-center">
          <p className="text-sm text-muted-foreground">Availability is only for service listings.</p>
          <Link to="/seller/listings" className="mt-4 inline-block text-xs text-accent">← Back to listings</Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="AVAILABILITY">
      <section className="px-5 pt-4 pb-8 slide-up">
        <Link to="/seller/listings" className="tap inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All listings
        </Link>

        <div className="mt-3 flex items-center gap-2">
          <div
            className="h-11 w-11 grid place-items-center rounded-2xl"
            style={{
              background: "linear-gradient(160deg, #1c1c1c, #0f0f0f)",
              border: "1px solid color-mix(in oklab, var(--plugu-gold) 40%, transparent)",
            }}
          >
            <CalendarClock className="h-5 w-5" style={{ color: "var(--plugu-gold)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{listingQ.data.title}</h1>
            <p className="text-[11px] text-muted-foreground">Open slots · buyers can only book what you post.</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-4 space-y-3">
          <p className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground">Add a slot</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-[11px] text-muted-foreground">
              Date
              <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)}
                     className="mt-1 w-full bg-secondary rounded-xl border border-border px-3 py-2 text-sm outline-none"/>
            </label>
            <label className="block text-[11px] text-muted-foreground">
              Start time
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)}
                     className="mt-1 w-full bg-secondary rounded-xl border border-border px-3 py-2 text-sm outline-none"/>
            </label>
          </div>
          <label className="block text-[11px] text-muted-foreground">
            Duration
            <select value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="mt-1 w-full bg-secondary rounded-xl border border-border px-3 py-2 text-sm outline-none">
              {[15, 30, 45, 60, 90, 120, 180].map((m) => (<option key={m} value={m}>{m} minutes</option>))}
            </select>
          </label>
          <button
            onClick={onAdd}
            disabled={addSlot.isPending}
            className="tap w-full py-2.5 rounded-2xl text-xs font-semibold text-primary-foreground inline-flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "var(--gradient-bronze)" }}
          >
            <Plus className="h-3.5 w-3.5" /> {addSlot.isPending ? "Adding…" : "Add slot"}
          </button>
        </div>

        <p className="mt-6 text-[10px] tracking-[0.24em] uppercase text-muted-foreground px-1">Upcoming</p>
        {slotsQ.isLoading ? (
          <div className="-mx-5"><LoadingList rows={2} /></div>
        ) : slotsQ.isError ? (
          <div className="-mx-5">
            <ErrorState
              title="Slots didn't load"
              description="Check your connection and try again."
              onRetry={() => void slotsQ.refetch()}
            />
          </div>
        ) : upcoming.length === 0 ? (
          <p className="mt-2 text-[11px] text-muted-foreground">No upcoming slots yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {upcoming.map((s) => (
              <li key={s.id} className={`rounded-2xl border p-3 flex items-center gap-3 ${s.is_booked ? "border-accent bg-secondary" : "border-border bg-card"}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    {new Date(s.slot_start).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Ends {new Date(s.slot_end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    {s.is_booked ? " · Booked" : " · Open"}
                  </p>
                </div>
                {!s.is_booked && (
                  <button
                    onClick={() => onDelete(s.id)}
                    aria-label="Remove slot"
                    className="tap h-9 w-9 grid place-items-center rounded-xl border border-border text-muted-foreground hover:text-accent"
                  >
                    <Trash2 className="h-4 w-4"/>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {past.length > 0 && (
          <>
            <p className="mt-6 text-[10px] tracking-[0.24em] uppercase text-muted-foreground px-1">Past</p>
            <ul className="mt-2 space-y-2 opacity-70">
              {past.slice(0, 10).map((s) => (
                <li key={s.id} className="rounded-2xl border border-border bg-card p-3 text-[11px] text-muted-foreground">
                  {new Date(s.slot_start).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  {s.is_booked ? " · Booked" : " · Unused"}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </AppShell>
  );
}