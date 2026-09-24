// HBCUS cross-campus network panels. All data is real member-created data;
// empty states invite action and never fake engagement.
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Hammer, Users, MessageCircle, Calendar, Briefcase, BookOpen, ChevronRight, ShieldCheck,
  Flag, Ban, Check, X, MapPin, Laptop, UserPlus, Search, Plus, Lock,
} from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { useCampusEvents, useMyRsvps, useRsvpToggle } from "@/hooks/use-campus";
import { fetchOpportunities } from "@/lib/hiring-db";
import { fetchBlockedUserIds, blockUser } from "@/lib/moderation";
import { getOrCreateConversation } from "@/lib/messages-db";
import { requestAuthentication } from "@/components/RequireAuthPrompt";
import { ReportDialog } from "@/components/ReportDialog";
import {
  CIRCLES, COMPENSATION, MODES, circleBySlug, createCollabRequest, fetchCircleMemberCounts,
  fetchCollabRequests, fetchDiscoverable, fetchMyCircles, fetchMyConnections, fetchMyNetworkProfile,
  fetchMyResponses, fetchPeople, fetchResponsesFor, personName, requestConnection, respondConnection,
  removeConnection, respondToCollab, saveNetworkProfile, setCircleMembership, setCollabStatus,
  verificationLabel, type CollabRequest, type PublicPerson,
} from "@/lib/network-db";

/* ------------------------------- shared ------------------------------- */

const card = "rounded-xl border border-border bg-card/80 p-4";
const btn = "tap inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold";
const btnPrimary = `${btn} bg-primary text-primary-foreground disabled:opacity-50`;
const btnGhost = `${btn} border border-border bg-secondary text-foreground disabled:opacity-50`;
const input = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60";

function H({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{children}</h2>
      {action}
    </div>
  );
}

function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-5 text-center">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{body}</p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}

function SignInCard({ what }: { what: string }) {
  return (
    <div className={`${card} text-center`}>
      <Lock className="mx-auto h-5 w-5 text-primary" />
      <p className="mt-2 text-sm font-semibold">Members only</p>
      <p className="mt-1 text-[11px] text-muted-foreground">Create an account or sign in to {what}.</p>
      <button onClick={requestAuthentication} className={`${btnPrimary} mt-3`}>Sign in or create account</button>
    </div>
  );
}

export function VerifiedTag({ person }: { person?: PublicPerson | null }) {
  const v = verificationLabel(person);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
      v.verified ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
    }`}>
      {v.verified && <ShieldCheck className="h-3 w-3" />} {v.label}
    </span>
  );
}

function Avatar({ p }: { p?: PublicPerson | null }) {
  const n = personName(p);
  return p?.avatar_url ? (
    <img src={p.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
  ) : (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-primary">
      {n.replace("@", "").charAt(0).toUpperCase()}
    </div>
  );
}

function usePeople(ids: string[]) {
  const key = [...new Set(ids)].sort().join(",");
  return useQuery({ queryKey: ["people", key], queryFn: () => fetchPeople(ids), enabled: ids.length > 0, staleTime: 60_000 }).data ?? new Map<string, PublicPerson>();
}

function useBlocked() {
  const { session } = useSession();
  return useQuery({ queryKey: ["blocked-ids", session?.user.id], queryFn: fetchBlockedUserIds, enabled: !!session }).data ?? [];
}

export async function messagePerson(id: string, navigate: ReturnType<typeof useNavigate>) {
  try {
    const conv = await getOrCreateConversation(id);
    navigate({ to: "/messages/$id", params: { id: conv } });
  } catch (e: any) {
    toast.error("Couldn't open messages", { description: e?.message });
  }
}

/* ------------------------------- HOME ------------------------------- */

const FACTS = [
  { t: "Cheyney University of Pennsylvania, founded in 1837, is recognized as the oldest HBCU.", s: "Cheyney University" },
  { t: "The Second Morrill Act of 1890 required states with segregated land-grant colleges to fund institutions for Black students — the origin of the \"1890\" land-grant universities.", s: "U.S. Department of Agriculture" },
  { t: "Fisk University's Jubilee Singers began touring in 1871 to raise money for their school and introduced spirituals to audiences worldwide.", s: "Fisk University" },
  { t: "The Higher Education Act of 1965 formally defined an HBCU as a school established before 1964 whose principal mission was the education of Black Americans.", s: "U.S. Department of Education" },
];

export function HomePanel({ onGo, onBuild }: { onGo: (t: string) => void; onBuild: () => void }) {
  const { session } = useSession();
  const { profile } = useProfile();
  const fact = FACTS[new Date().getDate() % FACTS.length];
  const collabs = useQuery({ queryKey: ["collabs"], queryFn: () => fetchCollabRequests(), enabled: !!session });
  const opps = useQuery({ queryKey: ["hbcus-opps"], queryFn: () => fetchOpportunities(), staleTime: 60_000 });
  const first = (profile?.display_name || profile?.full_name || "").split(" ")[0];

  return (
    <div className="space-y-6">
      <section className={card}>
        <p className="font-editorial text-2xl leading-tight">
          {session ? `Welcome back${first ? `, ${first}` : ""}.` : "Find your people."}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Build across campuses. Bring what you learn back home.
        </p>
        <button onClick={session ? onBuild : requestAuthentication} className={`${btnPrimary} mt-3 w-full`}>
          <Hammer className="h-4 w-4" /> What are you building?
        </button>
      </section>

      <section>
        <H action={<button onClick={() => onGo("Circles")} className="tap min-h-[44px] text-[11px] text-primary">Collab board</button>}>Collab requests</H>
        {!session ? <SignInCard what="see and respond to collaboration requests" /> :
          collabs.isPending ? <div className="h-20 animate-pulse rounded-xl bg-card" /> :
          (collabs.data ?? []).length === 0 ? (
            <Empty title="No open requests yet" body="Be the first to post what you need help building." action={<button onClick={onBuild} className={btnPrimary}>Post a request</button>} />
          ) : (
            <ul className="space-y-2">{(collabs.data ?? []).slice(0, 3).map((r) => <CollabCard key={r.id} r={r} compact />)}</ul>
          )}
      </section>

      <section>
        <H>Upcoming events</H>
        <EventsList limit={3} />
      </section>

      <section>
        <H action={<button onClick={() => onGo("Opportunities")} className="tap min-h-[44px] text-[11px] text-primary">See all</button>}>Opportunities</H>
        <OppList items={(opps.data ?? []).slice(0, 3)} pending={opps.isPending} error={opps.isError} retry={() => opps.refetch()} />
      </section>

      <section className={`${card} border-primary/30`}>
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-primary"><BookOpen className="h-3 w-3" /> HBCU history</p>
        <p className="mt-2 text-sm leading-relaxed">{fact.t}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">Source: {fact.s}</p>
      </section>
    </div>
  );
}

/* ------------------------------- EVENTS ------------------------------- */

export function EventsList({ limit }: { limit?: number }) {
  const { session } = useSession();
  const { data, isPending } = useCampusEvents();
  const rsvps = useMyRsvps();
  const toggle = useRsvpToggle();
  const now = Date.now();
  const items = (data ?? [])
    .filter((e) => e.status !== "cancelled" && +new Date(e.starts_at) >= now)
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at))
    .slice(0, limit ?? 50);
  if (isPending) return <div className="h-20 animate-pulse rounded-xl bg-card" />;
  if (!items.length) return <Empty title="No upcoming events" body="Host a study session, showcase or meetup." action={<Link to="/events" className={btnGhost}>Create an event</Link>} />;
  return (
    <ul className="space-y-2">
      {items.map((e) => {
        const going = (rsvps.data ?? []).includes(e.id);
        const online = /online|zoom|virtual|meet\.google/i.test(e.location);
        return (
          <li key={e.id} className={`${card} flex items-start gap-3`}>
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-snug">{e.title}</p>
              <p className="text-[11px] text-muted-foreground">{new Date(e.starts_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>
              <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                {online ? <Laptop className="h-3 w-3" /> : <MapPin className="h-3 w-3" />} {online ? "Online" : e.location}
                {e.host_name ? ` · ${e.host_name}` : ""}
              </p>
              <p className="text-[10px] text-muted-foreground">{e.rsvp_count} RSVP{e.rsvp_count === 1 ? "" : "s"}</p>
            </div>
            <button
              onClick={() => session ? toggle.mutate({ eventId: e.id, going: !going }, { onError: (err: any) => toast.error("RSVP failed", { description: err?.message }) }) : requestAuthentication()}
              disabled={toggle.isPending}
              className={going ? btnGhost : btnPrimary}
            >{going ? <><Check className="h-3.5 w-3.5" /> Going</> : "RSVP"}</button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------------------- OPPORTUNITIES ---------------------------- */

function OppList({ items, pending, error, retry }: { items: any[]; pending: boolean; error: boolean; retry: () => void }) {
  if (pending) return <div className="h-20 animate-pulse rounded-xl bg-card" />;
  if (error) return <Empty title="Opportunities didn't load" body="Check your connection." action={<button onClick={retry} className={btnGhost}>Retry</button>} />;
  if (!items.length) return <Empty title="No verified opportunities right now" body="We only list openings posted by verified organizations. Check back soon." />;
  return (
    <ul className="space-y-2">
      {items.map((o) => {
        const expired = o.deadline && new Date(o.deadline) < new Date();
        if (expired) return null;
        return (
          <li key={o.id}>
            <Link to="/hiring/$id" params={{ id: o.id }} className={`tap ${card} flex items-center gap-3`}>
              <Briefcase className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{o.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {o.business?.name ?? "Organization"} · {o.is_remote ? "Remote" : o.location || "Location TBA"}
                  {o.compensation ? ` · ${o.compensation}` : ""}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {o.deadline ? `Deadline ${new Date(o.deadline).toLocaleDateString([], { dateStyle: "medium" })}` : "No deadline listed"} · Posted {new Date(o.created_at).toLocaleDateString()}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function OpportunitiesPanel() {
  const [cat, setCat] = useState("All");
  const opps = useQuery({ queryKey: ["hbcus-opps"], queryFn: () => fetchOpportunities(), staleTime: 60_000 });
  const cats = ["All", ...new Set((opps.data ?? []).map((o: any) => o.category).filter(Boolean))];
  const items = (opps.data ?? []).filter((o: any) => cat === "All" || o.category === cat);
  return (
    <div className="space-y-3">
      <H>Scholarships, internships & jobs</H>
      <p className="text-[11px] text-muted-foreground">Only open listings from organizations PlugU has verified. Expired listings are hidden.</p>
      {cats.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`tap min-h-[44px] shrink-0 rounded-full border px-3.5 text-[12px] font-semibold ${cat === c ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}>{c}</button>
          ))}
        </div>
      )}
      <OppList items={items} pending={opps.isPending} error={opps.isError} retry={() => opps.refetch()} />
    </div>
  );
}

/* ------------------------------ CIRCLES ------------------------------ */

export function CirclesPanel({ onBuild }: { onBuild: () => void }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const mine = useQuery({ queryKey: ["my-circles"], queryFn: fetchMyCircles, enabled: !!session });
  const counts = useQuery({ queryKey: ["circle-counts"], queryFn: fetchCircleMemberCounts, enabled: !!session });
  const join = useMutation({
    mutationFn: ({ slug, on }: { slug: string; on: boolean }) => setCircleMembership(slug, on),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["my-circles"] }); qc.invalidateQueries({ queryKey: ["circle-counts"] }); toast.success(v.on ? "Joined Circle" : "Left Circle"); },
    onError: (e: any) => toast.error("Couldn't update", { description: e?.message }),
  });

  return (
    <div className="space-y-6">
      <section>
        <H>Circles</H>
        <ul className="grid gap-2 sm:grid-cols-2">
          {CIRCLES.map((c) => {
            const joined = (mine.data ?? []).includes(c.slug);
            const n = counts.data?.[c.slug] ?? 0;
            return (
              <li key={c.slug} className={`${card} flex flex-col`}>
                <Link to="/hbcus/circle/$slug" params={{ slug: c.slug }} className="tap block flex-1">
                  <p className="font-semibold">{c.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{c.blurb}</p>
                  {session && <p className="mt-1 text-[10px] text-muted-foreground">{n} member{n === 1 ? "" : "s"}</p>}
                </Link>
                <div className="mt-3 flex gap-2">
                  <Link to="/hbcus/circle/$slug" params={{ slug: c.slug }} className={`${btnGhost} flex-1`}>Open</Link>
                  <button
                    onClick={() => session ? join.mutate({ slug: c.slug, on: !joined }) : requestAuthentication()}
                    disabled={join.isPending}
                    className={`${joined ? btnGhost : btnPrimary} flex-1`}
                  >{joined ? "Joined" : "Join"}</button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <section>
        <H action={session ? <button onClick={onBuild} className="tap inline-flex min-h-[44px] items-center gap-1 text-[11px] text-primary"><Plus className="h-3 w-3" /> Post</button> : null}>Collab board</H>
        <CollabBoard onBuild={onBuild} />
      </section>
    </div>
  );
}

/* ---------------------------- COLLAB BOARD ---------------------------- */

export function CollabBoard({ onBuild, circle }: { onBuild: () => void; circle?: string }) {
  const { session } = useSession();
  const [mode, setMode] = useState<string>("all");
  const [q, setQ] = useState("");
  const blocked = useBlocked();
  const collabs = useQuery({ queryKey: ["collabs"], queryFn: () => fetchCollabRequests(), enabled: !!session });
  if (!session) return <SignInCard what="see and post collaboration requests" />;
  const items = (collabs.data ?? []).filter((r) =>
    !blocked.includes(r.author_id) &&
    (!circle || r.circle === circle) &&
    (mode === "all" || r.mode === mode) &&
    (!q.trim() || `${r.title} ${r.description} ${r.skills.join(" ")} ${r.location ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-secondary px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Skill, keyword or location" aria-label="Search requests" className="min-h-[44px] flex-1 bg-transparent text-sm outline-none" />
        </div>
        <select value={mode} onChange={(e) => setMode(e.target.value)} aria-label="Work mode" className="min-h-[44px] rounded-xl border border-border bg-secondary px-2 text-xs">
          <option value="all">Any</option>
          {Object.entries(MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {collabs.isPending ? <div className="h-20 animate-pulse rounded-xl bg-card" /> :
        collabs.isError ? <Empty title="Requests didn't load" body="Check your connection." action={<button onClick={() => collabs.refetch()} className={btnGhost}>Retry</button>} /> :
        items.length === 0 ? <Empty title="No matching requests" body="Post what you need — a logo, a photographer, a team." action={<button onClick={onBuild} className={btnPrimary}>Post a request</button>} /> :
        <ul className="space-y-2">{items.map((r) => <CollabCard key={r.id} r={r} />)}</ul>}
    </div>
  );
}

function CollabCard({ r, compact }: { r: CollabRequest; compact?: boolean }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const people = usePeople([r.author_id]);
  const author = people.get(r.author_id);
  const mine = session?.user.id === r.author_id;
  const responded = useQuery({ queryKey: ["my-responses"], queryFn: fetchMyResponses, enabled: !!session }).data ?? [];
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [report, setReport] = useState(false);
  const [showResp, setShowResp] = useState(false);
  const responses = useQuery({ queryKey: ["collab-responses", r.id], queryFn: () => fetchResponsesFor(r.id), enabled: mine && showResp });
  const respPeople = usePeople((responses.data ?? []).map((x) => x.responder_id));

  const respond = useMutation({
    mutationFn: () => respondToCollab(r.id, msg.trim()),
    onSuccess: () => { toast.success("Response sent", { description: "The poster can now see your message." }); setOpen(false); setMsg(""); qc.invalidateQueries({ queryKey: ["my-responses"] }); },
    onError: (e: any) => toast.error("Couldn't send", { description: e?.message }),
  });
  const close = useMutation({
    mutationFn: () => setCollabStatus(r.id, r.status === "open" ? "closed" : "open"),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["collabs"] }); toast.success(r.status === "open" ? "Request closed" : "Request reopened"); },
    onError: (e: any) => toast.error("Couldn't update", { description: e?.message }),
  });

  return (
    <li className={card}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold leading-snug">{r.title}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${r.compensation === "unpaid" ? "bg-secondary text-muted-foreground" : "bg-primary/15 text-primary"}`}>
          {COMPENSATION[r.compensation]}
        </span>
      </div>
      {!compact && <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">{r.description}</p>}
      {r.compensation_note && <p className="mt-1 text-[11px]">{r.compensation_note}</p>}
      {r.skills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">{r.skills.map((s) => <span key={s} className="rounded-full border border-border px-2 py-0.5 text-[10px]">{s}</span>)}</div>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">
        {MODES[r.mode]}{r.location ? ` · ${r.location}` : ""}{r.timeline ? ` · ${r.timeline}` : ""}{r.circle ? ` · ${circleBySlug(r.circle)?.name ?? ""}` : ""}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="font-medium">{personName(author)}</span>
        {author?.school_name && <span className="text-muted-foreground">· {author.school_name}</span>}
        <VerifiedTag person={author} />
      </div>
      {!compact && (
        <div className="mt-3 flex flex-wrap gap-2">
          {mine ? (
            <>
              <button onClick={() => setShowResp((v) => !v)} className={btnGhost}>{showResp ? "Hide responses" : "View responses"}</button>
              <button onClick={() => close.mutate()} disabled={close.isPending} className={btnGhost}>{r.status === "open" ? "Mark filled" : "Reopen"}</button>
            </>
          ) : responded.includes(r.id) ? (
            <span className={`${btnGhost} opacity-70`}><Check className="h-3.5 w-3.5" /> Responded</span>
          ) : (
            <button onClick={() => setOpen((v) => !v)} className={btnPrimary}>Respond</button>
          )}
          {!mine && <button onClick={() => messagePerson(r.author_id, navigate)} className={btnGhost}><MessageCircle className="h-3.5 w-3.5" /> Message</button>}
          {!mine && <button onClick={() => setReport(true)} aria-label="Report request" className={btnGhost}><Flag className="h-3.5 w-3.5" /></button>}
        </div>
      )}
      {open && (
        <div className="mt-3 space-y-2">
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} maxLength={2000} placeholder="Share your skills, links to your work and availability." className={input} />
          <button onClick={() => respond.mutate()} disabled={!msg.trim() || respond.isPending} className={`${btnPrimary} w-full`}>Send response</button>
        </div>
      )}
      {showResp && (
        <div className="mt-3 space-y-2">
          {responses.isPending ? <p className="text-[11px] text-muted-foreground">Loading…</p> :
            (responses.data ?? []).length === 0 ? <p className="text-[11px] text-muted-foreground">No responses yet.</p> :
            (responses.data ?? []).map((x) => (
              <div key={x.id} className="rounded-lg border border-border p-3">
                <p className="text-[11px] font-semibold">{personName(respPeople.get(x.responder_id))}</p>
                <p className="mt-1 text-xs">{x.message}</p>
                <button onClick={() => messagePerson(x.responder_id, navigate)} className={`${btnGhost} mt-2`}>Reply in messages</button>
              </div>
            ))}
        </div>
      )}
      <ReportDialog open={report} onClose={() => setReport(false)} targetType="collab_request" targetId={r.id} reportedUserId={r.author_id} targetLabel="request" snapshot={`${r.title}\n${r.description}`} />
    </li>
  );
}

export function CollabForm({ open, onClose, defaultCircle }: { open: boolean; onClose: () => void; defaultCircle?: string }) {
  const qc = useQueryClient();
  const { profile } = useProfile();
  const [f, setF] = useState({ title: "", description: "", skills: "", location: "", mode: "remote", timeline: "", compensation: "unpaid", compensation_note: "", circle: defaultCircle ?? "" });
  const save = useMutation({
    mutationFn: () => createCollabRequest({
      title: f.title.trim(), description: f.description.trim(),
      skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10),
      location: f.location.trim() || profile?.school_name || null,
      mode: f.mode as any, timeline: f.timeline.trim() || null,
      compensation: f.compensation as any, compensation_note: f.compensation_note.trim() || null,
      circle: f.circle || null,
    }),
    onSuccess: () => { toast.success("Request posted"); qc.invalidateQueries({ queryKey: ["collabs"] }); onClose(); setF((p) => ({ ...p, title: "", description: "", skills: "", timeline: "", compensation_note: "" })); },
    onError: (e: any) => toast.error("Couldn't post", { description: e?.message }),
  });
  if (!open) return null;
  const set = (k: keyof typeof f) => (e: any) => setF({ ...f, [k]: e.target.value });
  const valid = f.title.trim().length >= 3 && f.description.trim().length > 0;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Post a collab request">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[90dvh] max-w-xl overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-xl">What are you building?</h2>
          <button onClick={onClose} aria-label="Close" className="tap grid h-11 w-11 place-items-center rounded-full border border-border"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-3 space-y-2.5">
          <input value={f.title} onChange={set("title")} maxLength={140} placeholder="Title — e.g. Need a logo for my clothing brand" aria-label="Title" className={input} />
          <textarea value={f.description} onChange={set("description")} rows={4} maxLength={3000} placeholder="Describe the project and what you need" aria-label="Description" className={input} />
          <input value={f.skills} onChange={set("skills")} placeholder="Skills needed, comma separated" aria-label="Skills" className={input} />
          <div className="grid grid-cols-2 gap-2">
            <select value={f.mode} onChange={set("mode")} aria-label="Work mode" className={input}>{Object.entries(MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <input value={f.location} onChange={set("location")} placeholder={profile?.school_name ?? "School or city"} aria-label="Location" className={input} />
          </div>
          <input value={f.timeline} onChange={set("timeline")} placeholder="Timeline — e.g. By Oct 15" aria-label="Timeline" className={input} />
          <div className="grid grid-cols-2 gap-2">
            <select value={f.compensation} onChange={set("compensation")} aria-label="Compensation" className={input}>{Object.entries(COMPENSATION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <select value={f.circle} onChange={set("circle")} aria-label="Circle" className={input}><option value="">No Circle</option>{CIRCLES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
          </div>
          {f.compensation !== "unpaid" && <input value={f.compensation_note} onChange={set("compensation_note")} placeholder="Amount or terms, e.g. $150 flat" aria-label="Compensation details" className={input} />}
          <p className="text-[10px] text-muted-foreground">Be accurate about pay. Unpaid work must be marked unpaid.</p>
          <button onClick={() => save.mutate()} disabled={!valid || save.isPending} className={`${btnPrimary} w-full`}>{save.isPending ? "Posting…" : "Post request"}</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ DISCOVER ------------------------------ */

export function PersonCard({ p, interests, skills, conn, onChanged }: {
  p: PublicPerson; interests?: string[]; skills?: string[]; conn?: { id: string; status: string; incoming: boolean }; onChanged: () => void;
}) {
  const navigate = useNavigate();
  const [report, setReport] = useState(false);
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try { await fn(); toast.success(ok); onChanged(); } catch (e: any) { toast.error("Couldn't complete that", { description: e?.message }); }
  };
  return (
    <li className={card}>
      <div className="flex items-start gap-3">
        <Avatar p={p} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {p.username ? <Link to="/u/$username" params={{ username: p.username }} className="font-semibold hover:underline">{personName(p)}</Link> : <span className="font-semibold">{personName(p)}</span>}
            <VerifiedTag person={p} />
          </div>
          <p className="truncate text-[11px] text-muted-foreground">{[p.school_name, p.major, p.status === "alumni" ? "Alumni" : null].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      {(interests?.length || skills?.length) ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {(skills ?? []).map((s) => <span key={`s-${s}`} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{s}</span>)}
          {(interests ?? []).map((s) => <span key={`i-${s}`} className="rounded-full border border-border px-2 py-0.5 text-[10px]">{circleBySlug(s)?.name ?? s}</span>)}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {!conn && <button onClick={() => act(() => requestConnection(p.id), "Connection request sent")} className={btnPrimary}><UserPlus className="h-3.5 w-3.5" /> Connect</button>}
        {conn?.status === "pending" && conn.incoming && (
          <>
            <button onClick={() => act(() => respondConnection(conn.id, "accepted"), "Connected")} className={btnPrimary}>Accept</button>
            <button onClick={() => act(() => respondConnection(conn.id, "declined"), "Declined")} className={btnGhost}>Decline</button>
          </>
        )}
        {conn?.status === "pending" && !conn.incoming && <button onClick={() => act(() => removeConnection(conn.id), "Request withdrawn")} className={btnGhost}>Pending · Withdraw</button>}
        {conn?.status === "accepted" && <span className={`${btnGhost} opacity-70`}><Check className="h-3.5 w-3.5" /> Connected</span>}
        <button onClick={() => messagePerson(p.id, navigate)} className={btnGhost}><MessageCircle className="h-3.5 w-3.5" /> Message</button>
        <button onClick={() => setReport(true)} aria-label={`Report ${personName(p)}`} className={btnGhost}><Flag className="h-3.5 w-3.5" /></button>
        <button onClick={() => act(() => blockUser(p.id), "User blocked")} aria-label={`Block ${personName(p)}`} className={btnGhost}><Ban className="h-3.5 w-3.5" /></button>
      </div>
      <ReportDialog open={report} onClose={() => setReport(false)} targetType="user" targetId={p.id} reportedUserId={p.id} targetLabel="person" />
    </li>
  );
}

export function useConnectionMap() {
  const { session } = useSession();
  const q = useQuery({ queryKey: ["connections"], queryFn: fetchMyConnections, enabled: !!session });
  const me = session?.user.id;
  const map = useMemo(() => {
    const m = new Map<string, { id: string; status: string; incoming: boolean }>();
    for (const c of q.data ?? []) {
      if (c.status === "declined" && c.requester_id === me) { m.set(c.addressee_id, { id: c.id, status: "pending", incoming: false }); continue; }
      const other = c.requester_id === me ? c.addressee_id : c.requester_id;
      if (c.status !== "declined") m.set(other, { id: c.id, status: c.status, incoming: c.addressee_id === me });
    }
    return m;
  }, [q.data, me]);
  return { map, raw: q.data ?? [], refetch: q.refetch };
}

export function DiscoverPanel() {
  const { session } = useSession();
  const [q, setQ] = useState("");
  const [school, setSchool] = useState("all");
  const [interest, setInterest] = useState("all");
  const blocked = useBlocked();
  const found = useQuery({ queryKey: ["discoverable"], queryFn: fetchDiscoverable, enabled: !!session });
  const rows = (found.data ?? []).filter((r) => r.user_id !== session?.user.id && !blocked.includes(r.user_id));
  const people = usePeople(rows.map((r) => r.user_id));
  const { map, refetch } = useConnectionMap();
  if (!session) return <SignInCard what="discover students and alumni" />;
  const schools = [...new Set([...people.values()].map((p) => p.school_name).filter(Boolean))] as string[];
  const list = rows.filter((r) => {
    const p = people.get(r.user_id);
    if (!p) return false;
    if (school !== "all" && p.school_name !== school) return false;
    if (interest !== "all" && !r.interests.includes(interest)) return false;
    const hay = `${personName(p)} ${p.school_name ?? ""} ${r.show_major ? p.major ?? "" : ""} ${r.skills.join(" ")}`.toLowerCase();
    return !q.trim() || hay.includes(q.toLowerCase());
  });
  return (
    <div className="space-y-3">
      <H>Discover people</H>
      <p className="text-[11px] text-muted-foreground">Only members who turned on "Show me in Discover" appear here.</p>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, major or skill" aria-label="Search people" className="min-h-[44px] flex-1 bg-transparent text-sm outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select value={school} onChange={(e) => setSchool(e.target.value)} aria-label="School" className={input}><option value="all">All schools</option>{schools.map((s) => <option key={s}>{s}</option>)}</select>
        <select value={interest} onChange={(e) => setInterest(e.target.value)} aria-label="Interest" className={input}><option value="all">All interests</option>{CIRCLES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
      </div>
      {found.isPending ? <div className="h-24 animate-pulse rounded-xl bg-card" /> :
        found.isError ? <Empty title="People didn't load" body="Check your connection." action={<button onClick={() => found.refetch()} className={btnGhost}>Retry</button>} /> :
        list.length === 0 ? <Empty title="No one to show yet" body="Turn on Discover in your network profile so others can find you — then invite classmates." /> :
        <ul className="space-y-2">{list.map((r) => {
          const p = people.get(r.user_id)!;
          return <PersonCard key={r.user_id} p={{ ...p, major: r.show_major ? p.major : null }} interests={r.interests} skills={r.skills} conn={map.get(r.user_id)} onChanged={() => refetch()} />;
        })}</ul>}
    </div>
  );
}

/* ------------------------------ PROFILE ------------------------------ */

export function NetworkProfilePanel() {
  const { session } = useSession();
  const { profile } = useProfile();
  const qc = useQueryClient();
  const np = useQuery({ queryKey: ["network-profile"], queryFn: fetchMyNetworkProfile, enabled: !!session });
  const [draft, setDraft] = useState<null | { interests: string[]; skills: string; portfolio_url: string; goals: string; is_discoverable: boolean; show_major: boolean }>(null);
  const { raw, map, refetch } = useConnectionMap();
  const incoming = raw.filter((c) => c.status === "pending" && c.addressee_id === session?.user.id);
  const accepted = raw.filter((c) => c.status === "accepted");
  const connIds = [...incoming, ...accepted].map((c) => (c.requester_id === session?.user.id ? c.addressee_id : c.requester_id));
  const people = usePeople(connIds);
  const myPosts = useQuery({ queryKey: ["collabs", "mine"], queryFn: () => fetchCollabRequests({ includeClosed: true, authorId: session!.user.id }), enabled: !!session });

  const save = useMutation({
    mutationFn: () => saveNetworkProfile({
      interests: d.interests, skills: d.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 15),
      portfolio_url: d.portfolio_url.trim() || null, goals: d.goals.trim() || null,
      is_discoverable: d.is_discoverable, show_major: d.show_major,
    }),
    onSuccess: () => { toast.success("Network profile saved"); qc.invalidateQueries({ queryKey: ["network-profile"] }); qc.invalidateQueries({ queryKey: ["discoverable"] }); },
    onError: (e: any) => toast.error("Couldn't save", { description: e?.message?.includes("portfolio") ? "Portfolio link must start with http:// or https://" : e?.message }),
  });

  if (!session) return <SignInCard what="set up your network profile" />;
  if (np.isPending) return <div className="h-40 animate-pulse rounded-xl bg-card" />;
  const base = np.data;
  const d = draft ?? {
    interests: base?.interests ?? [], skills: (base?.skills ?? []).join(", "), portfolio_url: base?.portfolio_url ?? "",
    goals: base?.goals ?? "", is_discoverable: base?.is_discoverable ?? false, show_major: base?.show_major ?? true,
  };
  const upd = (patch: Partial<typeof d>) => setDraft({ ...d, ...patch });
  const me: PublicPerson | null = profile ? { ...profile, id: profile.id } as any : null;

  return (
    <div className="space-y-6">
      <section className={card}>
        <div className="flex items-center gap-3">
          <Avatar p={me} />
          <div className="min-w-0">
            <p className="font-semibold">{personName(me)}</p>
            <p className="truncate text-[11px] text-muted-foreground">{profile?.school_name ?? "No school set"}</p>
          </div>
          <div className="ml-auto"><VerifiedTag person={me} /></div>
        </div>
        <Link to="/profile/edit" className={`${btnGhost} mt-3 w-full`}>Edit name, school & major</Link>
      </section>

      <section className={card}>
        <H>Network profile</H>
        <p className="text-[11px] font-semibold">Interests</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {CIRCLES.map((c) => {
            const on = d.interests.includes(c.slug);
            return <button key={c.slug} aria-pressed={on} onClick={() => upd({ interests: on ? d.interests.filter((x) => x !== c.slug) : [...d.interests, c.slug] })} className={`tap min-h-[36px] rounded-full border px-3 text-[11px] ${on ? "border-transparent bg-primary text-primary-foreground" : "border-border"}`}>{c.name}</button>;
          })}
        </div>
        <div className="mt-3 space-y-2">
          <input value={d.skills} onChange={(e) => upd({ skills: e.target.value })} placeholder="Skills, comma separated" aria-label="Skills" className={input} />
          <input value={d.portfolio_url} onChange={(e) => upd({ portfolio_url: e.target.value })} placeholder="Portfolio link (https://…)" aria-label="Portfolio link" className={input} />
          <textarea value={d.goals} onChange={(e) => upd({ goals: e.target.value })} rows={2} maxLength={500} placeholder="Collaboration goals" aria-label="Goals" className={input} />
        </div>
        <label className="mt-3 flex min-h-[44px] items-center justify-between gap-3 text-sm">
          <span>Show me in Discover<span className="block text-[10px] text-muted-foreground">Name, school, skills and interests become visible to signed-in members.</span></span>
          <input type="checkbox" checked={d.is_discoverable} onChange={(e) => upd({ is_discoverable: e.target.checked })} className="h-5 w-5 accent-[var(--primary)]" />
        </label>
        <label className="flex min-h-[44px] items-center justify-between gap-3 text-sm">
          <span>Show my major</span>
          <input type="checkbox" checked={d.show_major} onChange={(e) => upd({ show_major: e.target.checked })} className="h-5 w-5 accent-[var(--primary)]" />
        </label>
        <button onClick={() => save.mutate()} disabled={save.isPending} className={`${btnPrimary} mt-3 w-full`}>{save.isPending ? "Saving…" : "Save network profile"}</button>
      </section>

      <section>
        <H>Connection requests</H>
        {incoming.length === 0 ? <p className="text-[11px] text-muted-foreground">No pending requests.</p> :
          <ul className="space-y-2">{incoming.map((c) => { const p = people.get(c.requester_id); return p ? <PersonCard key={c.id} p={p} conn={map.get(c.requester_id)} onChanged={() => refetch()} /> : null; })}</ul>}
      </section>
      <section>
        <H>Connections</H>
        {accepted.length === 0 ? <p className="text-[11px] text-muted-foreground">No connections yet — find people in Discover.</p> :
          <ul className="space-y-2">{accepted.map((c) => { const id = c.requester_id === session.user.id ? c.addressee_id : c.requester_id; const p = people.get(id); return p ? <PersonCard key={c.id} p={p} conn={map.get(id)} onChanged={() => refetch()} /> : null; })}</ul>}
      </section>
      <section>
        <H>Your collab requests</H>
        {(myPosts.data ?? []).length === 0 ? <p className="text-[11px] text-muted-foreground">You haven't posted a request.</p> :
          <ul className="space-y-2">{(myPosts.data ?? []).map((r) => <CollabCard key={r.id} r={r} />)}</ul>}
      </section>
      <section className={`${card} space-y-1 text-sm`}>
        <H>Safety & account</H>
        <Link to="/settings" className="tap flex min-h-[44px] items-center justify-between">Blocked users & privacy <ChevronRight className="h-4 w-4" /></Link>
        <Link to="/community-guidelines" className="tap flex min-h-[44px] items-center justify-between">Community guidelines <ChevronRight className="h-4 w-4" /></Link>
        <Link to="/delete-account" className="tap flex min-h-[44px] items-center justify-between text-destructive">Delete account <ChevronRight className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}

export { Users };
