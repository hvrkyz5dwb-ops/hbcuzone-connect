import { useState } from "react";
import { X, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useCreateEvent } from "@/hooks/use-campus";
import { useProfile } from "@/hooks/use-profile";
import { EVENT_CATEGORIES, type EventCategory } from "@/lib/campus-db";

export function CreateEventSheet({ onClose }: { onClose: () => void }) {
  const { profile } = useProfile();
  const create = useCreateEvent();
  const verified = profile?.verification_status === "verified";

  const [title, setTitle] = useState("");
  const [cover, setCover] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [category, setCategory] = useState<EventCategory>("community");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");

  const errors: string[] = [];
  if (title.trim().length < 3) errors.push("Title needs at least 3 characters.");
  if (!date) errors.push("Pick a date.");
  if (!start) errors.push("Pick a start time.");
  if (location.trim().length < 2) errors.push("Add a location.");
  if (date && start && end && end <= start) errors.push("End time must be after the start time.");
  const valid = errors.length === 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || create.isPending) return;
    const startsAt = new Date(`${date}T${start}`).toISOString();
    const endsAt = end ? new Date(`${date}T${end}`).toISOString() : null;
    create.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        cover_url: cover.trim() || null,
        category,
        location: location.trim(),
        starts_at: startsAt,
        ends_at: endsAt,
        host_name: profile?.display_name ?? profile?.full_name ?? null,
        contact_info: contact.trim() || null,
        school_id: profile?.school_id ?? null,
      },
      {
        onSuccess: () => { toast.success("Event posted to your campus"); onClose(); },
        onError: (err) => toast.error("Couldn't post event", { description: (err as Error).message }),
      },
    );
  }

  const field = "mt-1 w-full bg-secondary border border-border rounded-2xl px-4 py-3 text-sm outline-none";
  const label = "block mt-3 text-[11px] uppercase tracking-widest text-muted-foreground";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Create campus event">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <form
        onSubmit={submit}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-card border-t border-border rounded-t-3xl p-5 pb-8"
        style={{ animation: "plugu-slide-up 0.34s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--plugu-gold)" }}>Free for verified students</p>
            <h3 className="text-lg font-bold">Create a campus event</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="tap h-9 w-9 grid place-items-center rounded-full bg-secondary border border-border">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!verified && (
          <p className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-[11px] text-amber-300">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            Verify your .edu email to publish events on your campus.
          </p>
        )}

        <label className={label} htmlFor="ev-title">Title</label>
        <input id="ev-title" className={field} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90} placeholder="Yard show, open mic, tailgate…" />

        <label className={label} htmlFor="ev-cover">Cover image URL (optional)</label>
        <input id="ev-cover" className={field} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://…" inputMode="url" />

        <label className={label} htmlFor="ev-desc">Description</label>
        <textarea id="ev-desc" className={field} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={800} placeholder="What's the vibe? Who should pull up?" />

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={label} htmlFor="ev-date">Date</label>
            <input id="ev-date" type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="ev-start">Start</label>
            <input id="ev-start" type="time" className={field} value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="ev-end">End</label>
            <input id="ev-end" type="time" className={field} value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>

        <span className={label}>Category</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map((c) => (
            <button
              key={c.key} type="button" onClick={() => setCategory(c.key)}
              aria-pressed={category === c.key}
              className={`tap px-3 py-1.5 rounded-full text-[11px] border transition-colors ${
                category === c.key ? "text-black font-semibold" : "text-muted-foreground"
              }`}
              style={category === c.key ? { background: c.color, borderColor: c.color } : { borderColor: "var(--border)" }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <label className={label} htmlFor="ev-loc">Location</label>
        <input id="ev-loc" className={field} value={location} onChange={(e) => setLocation(e.target.value)} maxLength={90} placeholder="The Yard · Student Center · Stadium Lot B" />

        <label className={label} htmlFor="ev-contact">Contact info (optional)</label>
        <input id="ev-contact" className={field} value={contact} onChange={(e) => setContact(e.target.value)} maxLength={90} placeholder="@yourorg · you@school.edu" />

        {!valid && (title || date || location) && (
          <ul className="mt-3 space-y-1 text-[11px] text-destructive">
            {errors.map((e) => <li key={e}>· {e}</li>)}
          </ul>
        )}

        <button
          type="submit" disabled={!valid || !verified || create.isPending}
          className="tap mt-5 w-full py-3 rounded-2xl text-sm font-semibold text-primary-foreground disabled:opacity-40 inline-flex items-center justify-center gap-2"
          style={{ background: "var(--gradient-bronze)", boxShadow: "var(--shadow-glow)" }}
        >
          {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Post event
        </button>
      </form>
    </div>
  );
}
