import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, DollarSign, ChevronRight, MapPin, CalendarClock, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { fetchOpportunities, type OpportunityWithBusiness } from "@/lib/hiring-db";

type Hub = "career" | "money";

/** Money-side categories as they are stored on posted opportunities. */
const MONEY_CATEGORIES = ["Scholarship", "Grant", "Fellowship", "Stipend"];

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "Career & Money Hub — PlugU" },
      { name: "description", content: "Jobs, internships, scholarships and grants posted to PlugU by verified businesses and organizations." },
      { property: "og:title", content: "PlugU Career & Money Hub" },
      { property: "og:description", content: "Real opportunities posted to PlugU — no sample listings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Hub,
});

function isMoney(o: OpportunityWithBusiness) {
  return MONEY_CATEGORIES.some((c) => (o.category ?? "").toLowerCase().includes(c.toLowerCase()));
}

function deadlinePassed(o: OpportunityWithBusiness) {
  if (!o.deadline) return false;
  const t = new Date(o.deadline).getTime();
  return Number.isFinite(t) && t < Date.now();
}

function Hub() {
  const [hub, setHub] = useState<Hub>("career");

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: ["hub-opportunities"],
    queryFn: () => fetchOpportunities({}),
    staleTime: 120_000,
  });

  // Only show live, unexpired postings. Nothing is seeded or generated.
  const all = (data ?? []).filter((o) => !deadlinePassed(o));
  const items = all.filter((o) => (hub === "money" ? isMoney(o) : !isMoney(o)));

  return (
    <AppShell title="HUB">
      <section className="px-5 pt-5">
        <div className="rounded-3xl border border-border bg-card p-5 relative overflow-hidden">
          <div
            className="absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-40"
            style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--plugu-purple) 60%, transparent), transparent 70%)" }}
          />
          <p className="text-[10px] tracking-[0.25em] uppercase text-accent">PlugU</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Career & Money Hub</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
            Every opportunity here was posted to PlugU by a business or organization. Nothing is auto-generated.
          </p>
        </div>
      </section>

      <section className="px-5 pt-4">
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-secondary border border-border">
          <button
            onClick={() => setHub("career")}
            className={`tap min-h-[44px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              hub === "career" ? "bg-[image:var(--gradient-bronze)] text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Briefcase className="h-4 w-4" /> Jobs & internships
          </button>
          <button
            onClick={() => setHub("money")}
            className={`tap min-h-[44px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              hub === "money" ? "bg-[image:var(--gradient-bronze)] text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <DollarSign className="h-4 w-4" /> Scholarships & grants
          </button>
        </div>
      </section>

      <section className="px-5 pt-4 pb-6 space-y-2">
        {isPending && (
          <ul className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="p-4 rounded-2xl bg-card border border-border animate-pulse">
                <div className="h-3 w-24 bg-secondary rounded mb-2" />
                <div className="h-4 w-3/4 bg-secondary rounded" />
              </li>
            ))}
          </ul>
        )}

        {!isPending && error && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">Opportunities didn’t load</p>
            <p className="text-xs text-muted-foreground mt-0.5">Check your connection and try again.</p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="tap mt-3 min-h-[44px] px-4 rounded-xl border border-border text-sm disabled:opacity-60"
            >
              Try again
            </button>
          </div>
        )}

        {!isPending && !error && items.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <p className="text-sm font-semibold">
              No {hub === "money" ? "scholarships or grants" : "jobs or internships"} posted yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PlugU only shows opportunities posted by real businesses and organizations, so this stays empty until one is
              added.
            </p>
            <Link
              to="/hiring/business"
              className="tap mt-3 inline-flex min-h-[44px] items-center rounded-xl border border-border px-4 text-sm"
            >
              Post an opportunity
            </Link>
          </div>
        )}

        {!isPending && !error && items.map((o) => (
          <Link
            key={o.id}
            to="/hiring/$id"
            params={{ id: o.id }}
            className="tap block rounded-2xl border border-border bg-card p-4"
          >
            <p className="text-[10px] uppercase tracking-widest text-accent">{o.category}</p>
            <p className="font-semibold text-sm mt-0.5 leading-snug">{o.title}</p>
            {o.business?.name && (
              <p className="text-xs text-muted-foreground mt-0.5">{o.business.name}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              {o.compensation && <span>{o.compensation}</span>}
              {(o.is_remote || o.location) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {o.is_remote ? "Remote" : o.location}
                </span>
              )}
              {o.deadline && (
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3 w-3" />
                  Closes {new Date(o.deadline).toLocaleDateString(undefined, {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </span>
              )}
            </div>
          </Link>
        ))}
      </section>

      <section className="px-5 pb-8">
        <Link
          to="/news"
          className="tap flex min-h-[44px] items-center justify-between px-4 py-3 rounded-2xl border border-border bg-card text-sm"
        >
          <span className="text-muted-foreground">
            Headlines from real publishers in <span className="text-foreground font-medium">News Center</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </section>
    </AppShell>
  );
}
