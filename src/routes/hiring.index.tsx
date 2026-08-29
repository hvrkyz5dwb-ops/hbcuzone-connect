// Businesses Hiring — paid opportunities posted by verified local businesses.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Briefcase, Search, MapPin, Clock, ShieldAlert, Bookmark, BookmarkCheck,
  Building2, Store, BadgeCheck, Wifi, Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageLoader, ErrorState } from "@/components/QueryStates";
import { useProfile } from "@/hooks/use-profile";
import {
  fetchOpportunities, fetchMyApplications, fetchSavedOpportunityIds,
  toggleSaveOpportunity, OPPORTUNITY_CATEGORIES, BUSINESS_DISCLAIMER,
  type OpportunityWithBusiness,
} from "@/lib/hiring-db";
import { friendlyError } from "@/lib/friendly-errors";

export const Route = createFileRoute("/hiring/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Businesses Hiring — Hire a Student Plug | PlugU" },
      { name: "description", content: "Paid opportunities posted by verified local businesses near your campus. Apply, save, or message through PlugU." },
      { property: "og:title", content: "Businesses Hiring on PlugU" },
      { property: "og:description", content: "Verified local businesses hiring student Plugs for paid work near campus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HiringPage,
});

type Tab = "open" | "applications" | "saved";

function HiringPage() {
  const { profile } = useProfile();
  const isBusiness = profile?.account_type === "business";
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("open");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [remote, setRemote] = useState<"any" | "remote" | "in-person">("any");

  const listQ = useQuery({
    queryKey: ["opportunities", q, category, remote],
    queryFn: () => fetchOpportunities({ q, category, remote }),
    staleTime: 20_000,
  });
  const savedQ = useQuery({
    queryKey: ["opportunity-saves"],
    queryFn: fetchSavedOpportunityIds,
    staleTime: 20_000,
  });
  const appsQ = useQuery({
    queryKey: ["my-applications"],
    queryFn: fetchMyApplications,
    enabled: tab === "applications",
  });

  const savedIds = useMemo(() => new Set(savedQ.data ?? []), [savedQ.data]);

  async function onToggleSave(id: string) {
    const wasSaved = savedIds.has(id);
    try {
      await toggleSaveOpportunity(id, wasSaved);
      qc.invalidateQueries({ queryKey: ["opportunity-saves"] });
      toast.success(wasSaved ? "Removed from saved" : "Saved for later");
    } catch (e) {
      toast.error(friendlyError(e));
    }
  }

  const list = listQ.data ?? [];
  const savedList = list.filter((o) => savedIds.has(o.id));

  return (
    <AppShell title="HIRING">
      <div className="px-5 pt-5 pb-8 space-y-5">
        <header>
          <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-accent">
            <Briefcase className="h-3 w-3" /> Hire a Student Plug
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>
            Businesses Hiring
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Paid opportunities from verified local businesses near participating colleges.
            Your contact details stay private until you choose to respond.
          </p>
        </header>

        {isBusiness ? (
          <Link
            to="/hiring/business"
            className="tap flex items-center gap-3 rounded-2xl border border-primary/40 bg-card p-4"
          >
            <Store className="h-5 w-5 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Business dashboard</p>
              <p className="text-[11px] text-muted-foreground">Post opportunities, review applicants, find student Plugs.</p>
            </div>
          </Link>
        ) : (
          <Link
            to="/profile/edit"
            className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <Users className="h-5 w-5 text-accent" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Turn on “Open to Work”</p>
              <p className="text-[11px] text-muted-foreground">Let verified businesses find you in the student Plug directory.</p>
            </div>
          </Link>
        )}

        <div role="tablist" tabIndex={0} className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {([["open", "Open roles"], ["applications", "My applications"], ["saved", "Saved"]] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs border ${
                tab === k
                  ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary font-semibold"
                  : "bg-card text-muted-foreground border-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "open" && (
          <>
            <div className="space-y-3">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Search opportunities</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search roles, skills, pay…"
                  className="w-full rounded-2xl border border-border bg-card pl-9 pr-3 py-2.5 text-sm"
                />
              </label>
              <div tabIndex={0} className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {["All", ...OPPORTUNITY_CATEGORIES].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] border ${
                      category === c
                        ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary font-semibold"
                        : "bg-card text-muted-foreground border-border"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {(["any", "in-person", "remote"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRemote(r)}
                    className={`rounded-full px-3 py-1.5 text-[11px] border ${
                      remote === r
                        ? "border-primary text-primary font-semibold"
                        : "bg-card text-muted-foreground border-border"
                    }`}
                  >
                    {r === "any" ? "Anywhere" : r === "remote" ? "Remote" : "In person"}
                  </button>
                ))}
              </div>
            </div>

            {listQ.isPending ? (
              <PageLoader message="Loading opportunities…" />
            ) : listQ.error ? (
              <ErrorState onRetry={() => listQ.refetch()} />
            ) : list.length === 0 ? (
              <Empty text="No opportunities match yet. Try clearing filters — new roles post as businesses get verified." />
            ) : (
              <ul className="space-y-3">
                {list.map((o) => (
                  <OpportunityCard
                    key={o.id}
                    opp={o}
                    saved={savedIds.has(o.id)}
                    onToggleSave={() => onToggleSave(o.id)}
                  />
                ))}
              </ul>
            )}
          </>
        )}

        {tab === "saved" && (
          savedQ.isPending || listQ.isPending ? (
            <PageLoader message="Loading saved roles…" />
          ) : savedList.length === 0 ? (
            <Empty text="Nothing saved yet. Tap the bookmark on any opportunity to keep it here." />
          ) : (
            <ul className="space-y-3">
              {savedList.map((o) => (
                <OpportunityCard key={o.id} opp={o} saved onToggleSave={() => onToggleSave(o.id)} />
              ))}
            </ul>
          )
        )}

        {tab === "applications" && (
          appsQ.isPending ? (
            <PageLoader message="Loading your applications…" />
          ) : appsQ.error ? (
            <ErrorState onRetry={() => appsQ.refetch()} />
          ) : (appsQ.data ?? []).length === 0 ? (
            <Empty text="You haven't applied to anything yet." />
          ) : (
            <ul className="space-y-3">
              {(appsQ.data ?? []).map((a) => (
                <li key={a.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{a.opportunity?.title ?? "Opportunity"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {a.opportunity?.business?.name ?? "Local business"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {a.status}
                    </span>
                  </div>
                  {a.opportunity && (
                    <Link
                      to="/hiring/$id"
                      params={{ id: a.opportunity.id }}
                      className="mt-2 inline-block text-[11px] text-accent"
                    >
                      View opportunity →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )
        )}

        <SafetyNotice />
      </div>
    </AppShell>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/40 px-6 py-10 text-center">
      <Briefcase className="mx-auto h-6 w-6 text-muted-foreground" />
      <p className="mt-3 text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

export function SafetyNotice() {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold text-destructive">
        <ShieldAlert className="h-4 w-4" /> Scam warning
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{BUSINESS_DISCLAIMER}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Illegal, adult, discriminatory, dangerous, or misleading unpaid postings are banned. Report
        anything that looks wrong — our safety team reviews every report.
      </p>
    </div>
  );
}

export function OpportunityCard({
  opp, saved, onToggleSave,
}: {
  opp: OpportunityWithBusiness;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span className="truncate">{opp.business?.name ?? "Local business"}</span>
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-primary/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-primary">
              <BadgeCheck className="h-2.5 w-2.5" /> Local Business
            </span>
          </p>
          <h3 className="mt-1 text-sm font-semibold leading-snug">{opp.title}</h3>
        </div>
        <button
          type="button"
          onClick={onToggleSave}
          aria-label={saved ? "Remove from saved" : "Save opportunity"}
          className="tap shrink-0 rounded-full border border-border p-2"
        >
          {saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
        </button>
      </div>

      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{opp.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
        <Pill>{opp.compensation}</Pill>
        <Pill><MapPin className="h-2.5 w-2.5" /> {opp.location}</Pill>
        <Pill>{opp.is_remote ? <><Wifi className="h-2.5 w-2.5" /> Remote</> : "In person"}</Pill>
        {opp.deadline && <Pill><Clock className="h-2.5 w-2.5" /> Apply by {opp.deadline}</Pill>}
      </div>

      <Link
        to="/hiring/$id"
        params={{ id: opp.id }}
        className="tap mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[image:var(--gradient-bronze)] px-4 py-2.5 text-xs font-bold text-primary-foreground"
      >
        View & apply
      </Link>
    </li>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-muted-foreground">
      {children}
    </span>
  );
}
