import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calendar, MapPin, Plus, Users } from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import { CampusBar } from "@/components/campus/CampusBar";
import { ContentMenu } from "@/components/ContentMenu";
import { ErrorState, PageLoader } from "@/components/QueryStates";
import { requestAuthentication } from "@/components/RequireAuthPrompt";
import { useCampusEvents, useMyRsvps, useRsvpToggle } from "@/hooks/use-campus";
import { useContentVisibility } from "@/hooks/use-blocklist";
import { useSession } from "@/hooks/use-session";
import { categoryMeta, type CampusEvent } from "@/lib/campus-db";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [
    { title: "Events — PlugU" },
    { name: "description", content: "Verified campus events, organization meetings, career fairs, and student activities." },
    { property: "og:title", content: "PlugU Campus Events" },
    { property: "og:description", content: "Browse verified events happening across HBCU campuses." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: EventsPage,
});

const FILTERS = ["all", "career", "networking", "sports", "service", "community"] as const;

function EventsPage() {
  const { session } = useSession();
  const events = useCampusEvents();
  const myRsvps = useMyRsvps();
  const rsvp = useRsvpToggle();
  const isVisible = useContentVisibility();
  const [filter, setFilter] = useState<string>("all");

  const rows = useMemo(() => (events.data ?? []).filter((event) =>
    (filter === "all" || event.category === filter) &&
    isVisible({ type: "event", id: event.id, authorId: event.creator_user_id }) &&
    event.title.trim() && event.location.trim() && Number.isFinite(new Date(event.starts_at).getTime())
  ), [events.data, filter, isVisible]);
  const rsvps = new Set(myRsvps.data ?? []);

  const protect = (action: () => void) => {
    if (!session) { requestAuthentication(); return; }
    action();
  };

  return (
    <AppShell title="EVENTS">
      <CampusBar subtitle="Verified events from students and campus organizations" />
      <section className="px-5 pt-5">
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-xs text-muted-foreground">What’s happening on campus</p><h1 className="text-2xl font-bold">Campus events</h1></div>
          <button onClick={() => protect(() => window.location.assign("/campus"))} className="tap inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> Add event
          </button>
        </div>
        <div tabIndex={0} className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((value) => <button key={value} onClick={() => setFilter(value)} className={`tap shrink-0 rounded-full border px-4 py-2 text-xs capitalize ${filter === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}>{value}</button>)}
        </div>
      </section>
      <SectionHeader title="Upcoming" />
      {events.isPending ? <PageLoader message="Loading campus events…" /> : events.isError ? <ErrorState title="Events didn’t load" description="Check your connection and try again." onRetry={() => void events.refetch()} /> : (
        <ul className="space-y-3 px-5 pb-6">
          {rows.length === 0 && <li className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center"><p className="text-sm font-semibold">No verified events are available right now.</p><p className="mt-1 text-xs text-muted-foreground">Check again later or browse another campus section.</p></li>}
          {rows.map((event) => <EventCard key={event.id} event={event} going={rsvps.has(event.id)} onRsvp={() => protect(() => rsvp.mutate({ eventId: event.id, going: !rsvps.has(event.id) }))} />)}
        </ul>
      )}
    </AppShell>
  );
}

function EventCard({ event, going, onRsvp }: { event: CampusEvent; going: boolean; onRsvp: () => void }) {
  const meta = categoryMeta(event.category);
  return <li className="rounded-2xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 text-[11px] text-primary"><Calendar className="h-4 w-4" /><span>{new Date(event.starts_at).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span><span className="ml-auto">{meta.label}</span><ContentMenu targetType="event" targetId={event.id} targetLabel={event.title} snapshot={`${event.title} · ${event.location}`} authorUserId={event.creator_user_id} /></div>
    <h2 className="mt-2 text-base font-semibold">{event.title}</h2>
    {event.description && <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{event.description}</p>}
    <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{event.location}</p>
    <div className="mt-3 flex items-center justify-between"><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{event.rsvp_count} going</span><button onClick={onRsvp} className={`tap min-h-11 rounded-full border px-4 text-xs font-semibold ${going ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{going ? "Going" : "RSVP"}</button></div>
  </li>;
}