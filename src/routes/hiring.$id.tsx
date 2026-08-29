// Opportunity detail — apply, save, decline, message, or report.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Building2, MapPin, Clock, Wifi, BadgeCheck, Flag, Loader2, MessageSquare,
  Bookmark, BookmarkCheck, ArrowLeft, CircleSlash,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageLoader, ErrorState } from "@/components/QueryStates";
import { ReportDialog } from "@/components/ReportDialog";
import { SafetyNotice } from "@/routes/hiring.index";
import {
  fetchOpportunity, applyToOpportunity, fetchMyApplications,
  fetchSavedOpportunityIds, toggleSaveOpportunity,
} from "@/lib/hiring-db";
import { getOrCreateConversation } from "@/lib/messages-db";
import { friendlyError } from "@/lib/friendly-errors";

export const Route = createFileRoute("/hiring/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Opportunity — PlugU Businesses Hiring" },
      { name: "description", content: "Paid opportunity from a verified local business near campus." },
      { property: "og:title", content: "PlugU opportunity" },
      { property: "og:description", content: "A paid opportunity for student Plugs on PlugU." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OpportunityDetail,
});

function OpportunityDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [declined, setDeclined] = useState(false);

  const oppQ = useQuery({ queryKey: ["opportunity", id], queryFn: () => fetchOpportunity(id) });
  const appsQ = useQuery({ queryKey: ["my-applications"], queryFn: fetchMyApplications });
  const savedQ = useQuery({ queryKey: ["opportunity-saves"], queryFn: fetchSavedOpportunityIds });

  const opp = oppQ.data;
  const alreadyApplied = (appsQ.data ?? []).some((a) => a.opportunity_id === id);
  const saved = (savedQ.data ?? []).includes(id);

  async function onApply() {
    if (!opp || busy) return;
    setBusy(true);
    try {
      await applyToOpportunity(opp, message);
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      toast.success("Application sent", {
        description: "The business can now message you inside PlugU. Your email and phone stay private.",
      });
      setMessage("");
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  async function onMessage() {
    if (!opp || busy) return;
    setBusy(true);
    try {
      const cid = await getOrCreateConversation(opp.owner_user_id, null);
      navigate({ to: "/messages/$id", params: { id: cid } });
    } catch (e) {
      toast.error(friendlyError(e));
      setBusy(false);
    }
  }

  async function onSave() {
    try {
      await toggleSaveOpportunity(id, saved);
      qc.invalidateQueries({ queryKey: ["opportunity-saves"] });
    } catch (e) {
      toast.error(friendlyError(e));
    }
  }

  if (oppQ.isPending) return <AppShell title="OPPORTUNITY"><PageLoader /></AppShell>;
  if (oppQ.error) return <AppShell title="OPPORTUNITY"><ErrorState onRetry={() => oppQ.refetch()} /></AppShell>;
  if (!opp) {
    return (
      <AppShell title="OPPORTUNITY">
        <div className="px-5 py-16 text-center">
          <p className="text-sm font-semibold">This opportunity is no longer available.</p>
          <Link to="/hiring" className="mt-3 inline-block text-xs text-accent">← Back to Businesses Hiring</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="OPPORTUNITY">
      <div className="px-5 pt-4 pb-10 space-y-5">
        <Link to="/hiring" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Businesses Hiring
        </Link>

        <header>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            {opp.business?.name ?? "Local business"}
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-primary">
              <BadgeCheck className="h-2.5 w-2.5" /> Local Business
            </span>
          </p>
          <h1 className="mt-1 text-xl font-bold">{opp.title}</h1>
          <p className="mt-1 text-[11px] text-muted-foreground">{opp.category}</p>
        </header>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <Fact label="Compensation" value={opp.compensation} />
          <Fact label="Location" value={opp.location} icon={<MapPin className="h-3 w-3" />} />
          <Fact label="Format" value={opp.is_remote ? "Remote" : "In person"} icon={<Wifi className="h-3 w-3" />} />
          <Fact label="Deadline" value={opp.deadline ?? "Open until filled"} icon={<Clock className="h-3 w-3" />} />
        </div>

        <section>
          <h2 className="text-sm font-semibold">Description</h2>
          <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{opp.description}</p>
        </section>

        {opp.required_skills.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold">Required skills</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {opp.required_skills.map((s) => (
                <span key={s} className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground">{s}</span>
              ))}
            </div>
          </section>
        )}

        {declined ? (
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground">You declined this opportunity. It won't be suggested to you again.</p>
          </div>
        ) : alreadyApplied ? (
          <div className="rounded-2xl border border-primary/40 bg-card p-4">
            <p className="text-sm font-semibold text-primary">Application sent</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              The business reviews applicants inside PlugU. You'll get a message here if they're interested.
            </p>
          </div>
        ) : (
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Apply</h2>
            <label className="mt-2 block">
              <span className="sr-only">Message to the business</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                rows={4}
                placeholder="Why you're a good fit, relevant experience, availability…"
                className="w-full rounded-xl border border-border bg-background p-3 text-xs"
              />
            </label>
            <p className="text-[10px] text-muted-foreground">
              Your email and phone number are never shared. The business can only reach you through PlugU messages.
            </p>
            <button
              type="button"
              onClick={onApply}
              disabled={busy}
              className="tap mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-bronze)] px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Apply
            </button>
          </section>
        )}

        <div className="grid grid-cols-3 gap-2">
          <SmallBtn onClick={onSave} icon={saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />} label={saved ? "Saved" : "Save"} />
          <SmallBtn onClick={onMessage} icon={<MessageSquare className="h-4 w-4" />} label="Message" />
          <SmallBtn onClick={() => setDeclined(true)} icon={<CircleSlash className="h-4 w-4" />} label="Decline" />
        </div>

        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="tap flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 px-4 py-2.5 text-xs font-semibold text-destructive"
        >
          <Flag className="h-3.5 w-3.5" /> Report this opportunity
        </button>

        <SafetyNotice />
      </div>

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="opportunity"
        targetId={opp.id}
        targetLabel={opp.title}
        reportedUserId={opp.owner_user_id}
        snapshot={`${opp.title} — ${opp.compensation} — ${opp.description.slice(0, 400)}`}
      />
    </AppShell>
  );
}

function Fact({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2">
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold">{icon}{value}</p>
    </div>
  );
}

function SmallBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-2.5 text-[11px] text-muted-foreground"
    >
      {icon}
      {label}
    </button>
  );
}
