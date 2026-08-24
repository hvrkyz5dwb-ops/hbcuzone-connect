import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Users, Ticket, Plus, X, Trash2 } from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import { events, hbcuEvents } from "@/lib/mock-data";
import { useSchool } from "@/hooks/use-school";
import {
  addUserEvent, listUserEvents, removeUserEvent, subscribeUserEvents, type UserEvent,
} from "@/lib/events-storage";
import { toast } from "sonner";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — PlugU" },
      { name: "description", content: "Campus events, club meetings, concerts, parties, career fairs and networking — all in one calendar." },
    ],
  }),
  component: EventsPage,
});

const FILTERS = ["All", "Campus", "Parties", "Career", "Networking", "Orgs"] as const;
type Filter = (typeof FILTERS)[number];

function EventsPage() {
  const [rsvped, setRsvped] = useState<Record<string, boolean>>({});
  const [bumped, setBumped] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const school = useSchool();
  const activeSchool = school.name && school.name !== "Your Campus" ? school.name : "your campus";

  const [mine, setMine] = useState<UserEvent[]>(() => listUserEvents(activeSchool));
  useEffect(() => {
    setMine(listUserEvents(activeSchool));
    return subscribeUserEvents(() => setMine(listUserEvents(activeSchool)));
  }, [activeSchool]);

  const [addOpen, setAddOpen] = useState(false);

  function norm(s: string) { return s.toLowerCase().replace(/[^a-z0-9]/g, ""); }
  const schoolKey = norm(activeSchool);
  const matchesSchool = (s?: string) => {
    if (!s || activeSchool === "your campus") return true;
    const k = norm(s);
    return k.includes(schoolKey) || schoolKey.includes(k);
  };

  const seeded = [
    ...events.map((e) => ({ ...e, kind: "Campus", school: undefined as string | undefined, ticket: undefined as string | undefined })),
    ...hbcuEvents.map((e) => ({ title: e.title, when: e.when, where: e.where, kind: "Orgs", school: e.school, ticket: "$15" })),
  ].filter((e) => matchesSchool(e.school));

  const userEntries = mine.map((e) => ({
    id: e.id, title: e.title, when: e.when, where: e.where, kind: "Campus" as const,
    school: e.school, ticket: undefined as string | undefined, userId: e.id,
    promoted: !!e.promoted, boost: e.boost ?? 0,
  }));
  const seededTagged = seeded.map((e) => ({ ...e, promoted: false, boost: 0 }));
  const all = [...userEntries, ...seededTagged].sort(
    (a, b) => (Number(b.promoted) - Number(a.promoted)) || ((b.boost ?? 0) - (a.boost ?? 0)),
  );
  const filteredAll = all.filter((e) => filter === "All" || e.kind === filter);

  return (
    <AppShell title="EVENTS">
      <section className="px-5 pt-5">
        <p className="text-xs text-muted-foreground">Tonight, this week, this month · {activeSchool}</p>
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Campus events</h1>
          <button
            onClick={() => setAddOpen(true)}
            className="tap inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-bronze)", boxShadow: "var(--shadow-glow)" }}
          >
            <Plus className="h-3.5 w-3.5" /> Add event
          </button>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`tap shrink-0 px-4 py-2 rounded-full text-xs border transition-colors ${
                filter === f
                  ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <SectionHeader title="Upcoming" />
      <section aria-labelledby="events-privacy-heading" className="px-5 -mt-1 pb-3">
        <h2 id="events-privacy-heading" className="text-xs font-semibold text-foreground">
          Attendee lists are private
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          You'll only ever see the total going count and your own RSVPs. Hosts and campus admins can view the
          full attendee list for events they manage.
        </p>
      </section>

      <ul className="px-5 pb-6 space-y-3">

        {filteredAll.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
            <p className="text-sm font-semibold">No events yet at {activeSchool}</p>
            <p className="text-xs text-muted-foreground mt-1">Be the plug — post the first one.</p>
            <button
              onClick={() => setAddOpen(true)}
              className="tap mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-bronze)" }}
            >
              <Plus className="h-3.5 w-3.5" /> Add an event
            </button>
          </li>
        )}
        {filteredAll.map((e, i) => {
            const id = `${e.title}-${i}`;
            const isRsvp = !!rsvped[id];
            const going = 80 + e.title.length * 7;
            const liveGoing = going + (isRsvp ? 1 : 0);
            const userId = (e as { userId?: string }).userId;
            return (
              <li key={id} className="rounded-2xl border border-border bg-card p-4 slide-up">
                <div className="flex items-center gap-2 text-[11px] text-primary">
                  <Calendar className="h-3.5 w-3.5" /> {e.when}
                  {(e as { promoted?: boolean }).promoted && (
                    <span className="ml-2 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-accent/60 text-accent">
                      Promoted
                    </span>
                  )}
                  {userId && (
                    <span className="ml-auto text-[9px] uppercase tracking-widest text-accent">You posted</span>
                  )}
                </div>
                <h3 className="mt-1 font-semibold text-base">{e.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {e.where}{e.school ? ` · ${e.school}` : ""}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className={`inline-flex items-center gap-1 ${bumped === id ? "text-accent plugu-pulse" : ""}`}>
                      <Users className="h-3 w-3" /> {liveGoing} going
                    </span>
                    {e.ticket && (
                      <span className="inline-flex items-center gap-1">
                        <Ticket className="h-3 w-3" /> {e.ticket}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {userId && (
                      <button
                        onClick={() => { removeUserEvent(userId); toast.success("Event removed"); }}
                        className="tap text-muted-foreground p-1.5 rounded-full border border-border"
                        aria-label="Remove event"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setRsvped((s) => ({ ...s, [id]: !s[id] }));
                        setBumped(id);
                        setTimeout(() => setBumped((v) => (v === id ? null : v)), 700);
                      }}
                      className={`tap text-[11px] font-semibold rounded-full px-3 py-1.5 border transition-colors ${
                        isRsvp
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border"
                      }`}
                    >
                      {isRsvp ? "Going" : "RSVP"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>

      {addOpen && (
        <AddEventSheet
          school={activeSchool}
          onClose={() => setAddOpen(false)}
          onAdded={() => { setAddOpen(false); toast.success("Event posted to your campus"); }}
        />
      )}
    </AppShell>
  );
}

function AddEventSheet({
  school, onClose, onAdded,
}: { school: string; onClose: () => void; onAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [where, setWhere] = useState("");
  const canSubmit = title.trim().length >= 2 && when.trim().length >= 2 && where.trim().length >= 2;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    addUserEvent({ school, title: title.trim(), when: when.trim(), where: where.trim() });
    onAdded();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <form
        onSubmit={submit}
        className="relative w-full max-w-md bg-card border-t border-border rounded-t-3xl p-5 pb-8 animate-in slide-in-from-bottom"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary">Post to {school}</p>
            <h3 className="text-lg font-bold">Add a campus event</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <label className="block mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">Title</label>
        <input
          value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80}
          placeholder="Yard Show, open mic, tailgate…"
          className="mt-1 w-full bg-secondary border border-border rounded-2xl px-4 py-3 text-sm outline-none"
        />
        <label className="block mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">When</label>
        <input
          value={when} onChange={(e) => setWhen(e.target.value)} maxLength={40}
          placeholder="Tonight · 7pm  or  Fri · 8pm"
          className="mt-1 w-full bg-secondary border border-border rounded-2xl px-4 py-3 text-sm outline-none"
        />
        <label className="block mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">Where</label>
        <input
          value={where} onChange={(e) => setWhere(e.target.value)} maxLength={60}
          placeholder="The Quad · Student Center · Stadium Lot B"
          className="mt-1 w-full bg-secondary border border-border rounded-2xl px-4 py-3 text-sm outline-none"
        />
        <button
          type="submit" disabled={!canSubmit}
          className="tap mt-5 w-full py-3 rounded-2xl text-sm font-semibold text-primary-foreground disabled:opacity-40"
          style={{ background: "var(--gradient-bronze)", boxShadow: "var(--shadow-glow)" }}
        >
          Post event
        </button>
      </form>
    </div>
  );
}