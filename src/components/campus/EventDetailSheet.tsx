import { useState } from "react";
import {
  X, Calendar, MapPin, Users, Share2, Flag, Trash2, CalendarPlus, Send, Loader2, Pencil, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { ReportDialog } from "@/components/ReportDialog";
import { useSession } from "@/hooks/use-session";
import { useEventComments, useEventMutations, useRsvpToggle } from "@/hooks/use-campus";
import { calendarUrl, categoryMeta, type CampusEvent } from "@/lib/campus-db";

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function EventDetailSheet({
  event, going, onClose,
}: { event: CampusEvent; going: boolean; onClose: () => void }) {
  const { user } = useSession();
  const cat = categoryMeta(event.category);
  const rsvp = useRsvpToggle();
  const { remove } = useEventMutations();
  const comments = useEventComments(event.id);
  const [body, setBody] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const mine = user?.id === event.creator_user_id;

  async function share() {
    const url = `${window.location.origin}/campus?event=${event.id}`;
    try {
      if (navigator.share) await navigator.share({ title: event.title, text: event.location, url });
      else { await navigator.clipboard.writeText(url); toast.success("Event link copied"); }
    } catch { /* user dismissed */ }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={event.title}>
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Close event" />
      <div
        className="relative w-full max-w-md max-h-[88vh] overflow-y-auto bg-card border-t border-border rounded-t-3xl pb-8"
        style={{ animation: "plugu-slide-up 0.34s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="relative h-40 w-full overflow-hidden rounded-t-3xl bg-secondary">
          {event.cover_url ? (
            <img src={event.cover_url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full" style={{ background: "linear-gradient(160deg,#1a1a1a,#0b0b0b)" }} />
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="tap absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-black/60 border border-white/15"
          >
            <X className="h-4 w-4" />
          </button>
          <span
            className="absolute bottom-3 left-4 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border"
            style={{ color: cat.color, borderColor: cat.color }}
          >
            {cat.label}
          </span>
        </div>

        <div className="px-5 pt-4">
          <h2 className="text-xl font-bold tracking-tight">{event.title}</h2>
          <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-primary" /> {fmt(event.starts_at)}{event.ends_at ? ` – ${new Date(event.ends_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : ""}</p>
            <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" /> {event.location || "TBA"}</p>
            <p className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-primary" /> {event.rsvp_count} going{event.host_name ? ` · hosted by ${event.host_name}` : ""}</p>
          </div>
          {event.description && <p className="mt-3 text-sm leading-relaxed">{event.description}</p>}
          {event.contact_info && (
            <p className="mt-2 text-[11px] text-muted-foreground">Contact: {event.contact_info}</p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => rsvp.mutate(
                { eventId: event.id, going: !going },
                { onError: (e) => toast.error((e as Error).message) },
              )}
              disabled={rsvp.isPending}
              className={`tap flex-1 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                going ? "bg-secondary text-foreground border border-border" : "text-primary-foreground"
              }`}
              style={going ? undefined : { background: "var(--gradient-bronze)", boxShadow: "var(--shadow-glow)" }}
            >
              {rsvp.isPending ? "…" : going ? "Remove RSVP" : "RSVP"}
            </button>
            <a
              href={calendarUrl(event)} target="_blank" rel="noreferrer"
              aria-label="Add to calendar"
              className="tap h-12 w-12 grid place-items-center rounded-2xl border border-border bg-secondary"
            >
              <CalendarPlus className="h-4 w-4" />
            </a>
            <button onClick={share} aria-label="Share event" className="tap h-12 w-12 grid place-items-center rounded-2xl border border-border bg-secondary">
              <Share2 className="h-4 w-4" />
            </button>
            {mine ? (
              <button
                onClick={() => {
                  if (!confirm("Delete this event?")) return;
                  remove.mutate(event.id, {
                    onSuccess: () => { toast.success("Event deleted"); onClose(); },
                    onError: (e) => toast.error((e as Error).message),
                  });
                }}
                aria-label="Delete event"
                className="tap h-12 w-12 grid place-items-center rounded-2xl border border-destructive/40 text-destructive bg-destructive/10"
              >
                {remove.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            ) : (
              <button onClick={() => setReportOpen(true)} aria-label="Report event" className="tap h-12 w-12 grid place-items-center rounded-2xl border border-border bg-secondary">
                <Flag className="h-4 w-4" />
              </button>
            )}
          </div>
          {mine && (
            <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
              <Pencil className="h-3 w-3" /> You host this event — only you can edit or delete it.
            </p>
          )}
          <p className="mt-3 flex items-start gap-2 rounded-2xl border border-border bg-secondary/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              <span className="font-semibold text-foreground">Attendee lists are private.</span>{" "}
              {mine
                ? "Only you as the host can see who RSVP'd. Everyone else sees just the total going count."
                : "Nobody can see who else RSVP'd — only the total going count is public. Your own RSVP stays visible to you and the host, and you can review or cancel it anytime."}
            </span>
          </p>


          <h3 className="mt-6 text-sm font-semibold">Comments</h3>
          <ul className="mt-2 space-y-2">
            {(comments.data ?? []).map((c) => (
              <li key={c.id} className="rounded-2xl border border-border bg-background/60 p-3">
                <p className="text-sm">{c.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(c.created_at).toLocaleString()}
                </p>
              </li>
            ))}
            {comments.data?.length === 0 && (
              <li className="text-xs text-muted-foreground">Be the first to say something.</li>
            )}
          </ul>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = body.trim();
              if (v.length < 2) return;
              comments.post.mutate(v, {
                onSuccess: () => setBody(""),
                onError: (err) => toast.error((err as Error).message),
              });
            }}
          >
            <label className="sr-only" htmlFor="event-comment">Add a comment</label>
            <input
              id="event-comment" value={body} onChange={(e) => setBody(e.target.value)} maxLength={400}
              placeholder="Add a comment…"
              className="flex-1 bg-secondary border border-border rounded-2xl px-4 py-3 text-sm outline-none"
            />
            <button
              type="submit" disabled={body.trim().length < 2 || comments.post.isPending}
              aria-label="Post comment"
              className="tap h-12 w-12 grid place-items-center rounded-2xl text-primary-foreground disabled:opacity-40"
              style={{ background: "var(--gradient-bronze)" }}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <ReportDialog
        open={reportOpen} onClose={() => setReportOpen(false)}
        targetType="event" targetId={event.id} targetLabel={event.title}
      />
    </div>
  );
}
