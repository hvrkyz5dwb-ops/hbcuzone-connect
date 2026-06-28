import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Users, Ticket } from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import { events, hbcuEvents } from "@/lib/mock-data";

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
  const [filter, setFilter] = useState<Filter>("All");

  const all = [
    ...events.map((e) => ({ ...e, kind: "Campus", school: undefined as string | undefined, ticket: undefined as string | undefined })),
    ...hbcuEvents.map((e) => ({ title: e.title, when: e.when, where: e.where, kind: "Orgs", school: e.school, ticket: "$15" })),
  ];

  return (
    <AppShell title="EVENTS">
      <section className="px-5 pt-5">
        <p className="text-xs text-muted-foreground">Tonight, this week, this month</p>
        <h1 className="text-2xl font-bold tracking-tight">Campus events</h1>
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
      <ul className="px-5 pb-6 space-y-3">
        {all
          .filter((e) => filter === "All" || e.kind === filter)
          .map((e, i) => {
            const id = `${e.title}-${i}`;
            const isRsvp = !!rsvped[id];
            const going = 80 + e.title.length * 7;
            return (
              <li key={id} className="rounded-2xl border border-border bg-card p-4 slide-up">
                <div className="flex items-center gap-2 text-[11px] text-primary">
                  <Calendar className="h-3.5 w-3.5" /> {e.when}
                </div>
                <h3 className="mt-1 font-semibold text-base">{e.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {e.where}{e.school ? ` · ${e.school}` : ""}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {going} going
                    </span>
                    {e.ticket && (
                      <span className="inline-flex items-center gap-1">
                        <Ticket className="h-3 w-3" /> {e.ticket}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setRsvped((s) => ({ ...s, [id]: !s[id] }))}
                    className={`tap text-[11px] font-semibold rounded-full px-3 py-1.5 border transition-colors ${
                      isRsvp
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border"
                    }`}
                  >
                    {isRsvp ? "Going" : "RSVP"}
                  </button>
                </div>
              </li>
            );
          })}
      </ul>
    </AppShell>
  );
}