// Local Business dashboard — verification, posting opportunities, applicants.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Store, ShieldCheck, Clock, XCircle, Plus, Loader2, Users, MessageSquare,
  Search, BadgeCheck, Star, ArrowLeft,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageLoader, ErrorState } from "@/components/QueryStates";
import { SafetyNotice } from "@/routes/hiring.index";
import {
  fetchMyLocalBusiness, saveLocalBusiness, fetchMyOpportunities, createOpportunity,
  setOpportunityStatus, fetchApplicants, setApplicationStatus, searchStudentPlugs,
  OPPORTUNITY_CATEGORIES, type LocalBusiness,
} from "@/lib/hiring-db";
import { getOrCreateConversation } from "@/lib/messages-db";
import { friendlyError } from "@/lib/friendly-errors";

export const Route = createFileRoute("/hiring/business")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Local Business dashboard — PlugU" },
      { name: "description", content: "Verify your local business, post paid opportunities, and review student Plug applicants on PlugU." },
      { property: "og:title", content: "PlugU for local businesses" },
      { property: "og:description", content: "Hire verified college students for paid work near your business." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BusinessDashboard,
});

type Tab = "profile" | "posts" | "applicants" | "plugs";

function BusinessDashboard() {
  const [tab, setTab] = useState<Tab>("profile");
  const bizQ = useQuery({ queryKey: ["my-local-business"], queryFn: fetchMyLocalBusiness });
  const biz = bizQ.data ?? null;
  const verified = biz?.verification_status === "verified";

  return (
    <AppShell title="BUSINESS">
      <div className="px-5 pt-4 pb-10 space-y-5">
        <Link to="/hiring" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Businesses Hiring
        </Link>

        <header>
          <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-accent">
            <Store className="h-3 w-3" /> Local Business
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>
            {biz?.name || "Your business"}
          </h1>
          {biz && <StatusBanner biz={biz} />}
        </header>

        <div role="tablist" tabIndex={0} className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {([["profile", "Verification"], ["posts", "My posts"], ["applicants", "Applicants"], ["plugs", "Find Plugs"]] as const).map(([k, label]) => (
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

        {bizQ.isPending ? (
          <PageLoader />
        ) : bizQ.error ? (
          <ErrorState onRetry={() => bizQ.refetch()} />
        ) : (
          <>
            {tab === "profile" && <BusinessForm biz={biz} onSaved={() => bizQ.refetch()} />}
            {tab === "posts" && (verified ? <PostsPanel biz={biz!} /> : <NeedsVerification />)}
            {tab === "applicants" && (verified ? <ApplicantsPanel /> : <NeedsVerification />)}
            {tab === "plugs" && (verified ? <PlugsPanel /> : <NeedsVerification />)}
          </>
        )}

        <SafetyNotice />
      </div>
    </AppShell>
  );
}

function StatusBanner({ biz }: { biz: LocalBusiness }) {
  const map = {
    pending: { Icon: Clock, tone: "text-accent border-accent/40", text: "Verification pending — our team reviews new businesses within 1–2 business days. You can post once approved." },
    verified: { Icon: ShieldCheck, tone: "text-primary border-primary/40", text: "Verified local business. You can post opportunities and message student Plugs." },
    rejected: { Icon: XCircle, tone: "text-destructive border-destructive/40", text: "Verification was declined. Update your details below and resubmit, or contact support." },
  } as const;
  const s = map[biz.verification_status];
  return (
    <div className={`mt-3 flex items-start gap-2 rounded-2xl border bg-card p-3 ${s.tone}`}>
      <s.Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold capitalize">{biz.verification_status}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{s.text}</p>
        {biz.verification_note && (
          <p className="mt-1 text-[11px] text-muted-foreground">Note: {biz.verification_note}</p>
        )}
      </div>
    </div>
  );
}

function NeedsVerification() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/40 px-6 py-10 text-center">
      <ShieldCheck className="mx-auto h-6 w-6 text-muted-foreground" />
      <p className="mt-3 text-xs text-muted-foreground">
        Complete business verification first. Verified businesses can post opportunities and contact students.
      </p>
    </div>
  );
}

/* ───────── Verification form ───────── */

function BusinessForm({ biz, onSaved }: { biz: LocalBusiness | null; onSaved: () => void }) {
  const [name, setName] = useState(biz?.name ?? "");
  const [rep, setRep] = useState(biz?.rep_name ?? "");
  const [email, setEmail] = useState(biz?.contact_email ?? "");
  const [phone, setPhone] = useState(biz?.contact_phone ?? "");
  const [address, setAddress] = useState(biz?.address ?? "");
  const [website, setWebsite] = useState(biz?.website ?? "");
  const [campus, setCampus] = useState(biz?.campus_name ?? "");
  const [description, setDescription] = useState(biz?.description ?? "");
  const [services, setServices] = useState<string[]>(biz?.services_needed ?? []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function toggleService(s: string) {
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    if (!name.trim() || !rep.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setErr("Business name, representative, email, phone and address are all required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr("Enter a valid business email address.");
      return;
    }
    if (services.length === 0) {
      setErr("Pick at least one service you need help with.");
      return;
    }
    setBusy(true);
    try {
      await saveLocalBusiness({
        name: name.trim(),
        rep_name: rep.trim(),
        contact_email: email.trim().toLowerCase(),
        contact_phone: phone.trim(),
        address: address.trim(),
        website: website.trim() || null,
        services_needed: services,
        description: description.trim() || null,
        campus_name: campus.trim() || null,
      });
      toast.success(biz ? "Business details updated" : "Submitted for verification");
      onSaved();
    } catch (e2) {
      setErr(friendlyError(e2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Local Business accounts don't need a .edu email, but they must be verified before posting
        publicly or contacting students. Business accounts are labeled “Local Business” and never
        receive a student-verification badge.
      </p>
      <Field label="Business name" value={name} onChange={setName} required />
      <Field label="Owner or representative name" value={rep} onChange={setRep} required />
      <Field label="Business email" value={email} onChange={setEmail} type="email" required />
      <Field label="Business phone number" value={phone} onChange={setPhone} type="tel" required />
      <Field label="Business address" value={address} onChange={setAddress} required />
      <Field label="Website or social media page" value={website} onChange={setWebsite} placeholder="https://" />
      <Field label="Nearest campus (optional)" value={campus} onChange={setCampus} />
      <label className="block">
        <span className="text-[11px] font-semibold text-muted-foreground">About the business (optional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
          rows={3}
          className="mt-1 w-full rounded-xl border border-border bg-card p-3 text-sm"
        />
      </label>

      <div>
        <span className="text-[11px] font-semibold text-muted-foreground">Services needed</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {OPPORTUNITY_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleService(c)}
              aria-pressed={services.includes(c)}
              className={`rounded-full px-3 py-1.5 text-[11px] border ${
                services.includes(c)
                  ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary font-semibold"
                  : "bg-card text-muted-foreground border-border"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {err && <p className="text-xs text-destructive">{err}</p>}
      <button
        type="submit"
        disabled={busy}
        className="tap inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-bronze)] px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {biz ? "Save details" : "Submit for verification"}
      </button>
    </form>
  );
}

function Field({
  label, value, onChange, type = "text", required, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
      />
    </label>
  );
}

/* ───────── Posts ───────── */

function PostsPanel({ biz }: { biz: LocalBusiness }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["my-opportunities"], queryFn: fetchMyOpportunities });
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="tap inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/50 px-4 py-2.5 text-xs font-semibold text-primary"
      >
        <Plus className="h-4 w-4" /> {open ? "Close form" : "Post an opportunity"}
      </button>

      {open && (
        <OpportunityForm
          biz={biz}
          onCreated={() => {
            setOpen(false);
            qc.invalidateQueries({ queryKey: ["my-opportunities"] });
            qc.invalidateQueries({ queryKey: ["opportunities"] });
          }}
        />
      )}

      {q.isPending ? (
        <PageLoader />
      ) : (q.data ?? []).length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          No opportunities posted yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {(q.data ?? []).map((o) => (
            <li key={o.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{o.title}</p>
                  <p className="text-[11px] text-muted-foreground">{o.compensation} · {o.applicant_count} applicant{o.applicant_count === 1 ? "" : "s"}</p>
                </div>
                <select
                  value={o.status}
                  aria-label="Opportunity status"
                  onChange={async (e) => {
                    try {
                      await setOpportunityStatus(o.id, e.target.value as any);
                      qc.invalidateQueries({ queryKey: ["my-opportunities"] });
                      qc.invalidateQueries({ queryKey: ["opportunities"] });
                    } catch (err) { toast.error(friendlyError(err)); }
                  }}
                  className="shrink-0 rounded-lg border border-border bg-background px-2 py-1 text-[11px]"
                >
                  <option value="open">Open</option>
                  <option value="paused">Paused</option>
                  <option value="filled">Filled</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OpportunityForm({ biz, onCreated }: { biz: LocalBusiness; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(OPPORTUNITY_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [compensation, setCompensation] = useState("");
  const [location, setLocation] = useState(biz.address);
  const [isRemote, setIsRemote] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [skills, setSkills] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    if (!title.trim() || !description.trim() || !compensation.trim() || !location.trim()) {
      setErr("Title, description, compensation and location are required.");
      return;
    }
    if (/\b(unpaid|free labor|no pay|exposure only)\b/i.test(compensation)) {
      setErr("Opportunities on PlugU must be paid. Describe the real compensation.");
      return;
    }
    setBusy(true);
    try {
      await createOpportunity(biz, {
        title: title.trim(),
        category,
        description: description.trim(),
        compensation: compensation.trim(),
        location: location.trim(),
        is_remote: isRemote,
        deadline: deadline || null,
        required_skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      toast.success("Opportunity posted");
      onCreated();
    } catch (e2) {
      setErr(friendlyError(e2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <Field label="Service needed / role title" value={title} onChange={setTitle} required />
      <label className="block">
        <span className="text-[11px] font-semibold text-muted-foreground">Category</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
        >
          {OPPORTUNITY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="text-[11px] font-semibold text-muted-foreground">Description<span className="text-destructive"> *</span></span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 3000))}
          rows={4}
          className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
        />
      </label>
      <Field label="Compensation or budget" value={compensation} onChange={setCompensation} placeholder="$20/hr, $150 flat, etc." required />
      <Field label="Location" value={location} onChange={setLocation} required />
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)} className="h-4 w-4" />
        Remote (no in-person work required)
      </label>
      <label className="block">
        <span className="text-[11px] font-semibold text-muted-foreground">Deadline</span>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
        />
      </label>
      <Field label="Required skills (comma separated)" value={skills} onChange={setSkills} placeholder="Canva, punctual, own car" />
      <p className="text-[10px] text-muted-foreground">
        Postings must be legal, paid, safe and non-discriminatory. Adult, dangerous, or misleading
        listings are removed and the account may be suspended.
      </p>
      {err && <p className="text-xs text-destructive">{err}</p>}
      <button
        type="submit"
        disabled={busy}
        className="tap inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-bronze)] px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Post opportunity
      </button>
    </form>
  );
}

/* ───────── Applicants ───────── */

function ApplicantsPanel() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const q = useQuery({ queryKey: ["opportunity-applicants"], queryFn: () => fetchApplicants() });

  async function update(id: string, status: any) {
    try {
      await setApplicationStatus(id, status);
      qc.invalidateQueries({ queryKey: ["opportunity-applicants"] });
    } catch (e) { toast.error(friendlyError(e)); }
  }

  if (q.isPending) return <PageLoader />;
  if (q.error) return <ErrorState onRetry={() => q.refetch()} />;
  const rows = q.data ?? [];
  if (rows.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">No applicants yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {rows.map((a) => (
        <li key={a.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-background">
              {a.profile?.avatar_url && <img src={a.profile.avatar_url} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-semibold truncate">
                {a.profile?.display_name || a.profile?.full_name || "Student"}
                {a.profile?.verification_status === "verified" && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {a.profile?.school_name ?? "Student"} · <Star className="inline h-3 w-3" /> {(a.profile?.rating_avg ?? 0).toFixed(1)} ({a.profile?.rating_count ?? 0})
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-border px-2 py-1 text-[10px] uppercase">{a.status}</span>
          </div>
          {a.message && <p className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{a.message}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionBtn onClick={() => update(a.id, "shortlisted")}>Shortlist</ActionBtn>
            <ActionBtn onClick={() => update(a.id, "hired")}>Hired</ActionBtn>
            <ActionBtn onClick={() => update(a.id, "declined")}>Decline</ActionBtn>
            <ActionBtn
              onClick={async () => {
                try {
                  const cid = await getOrCreateConversation(a.student_user_id, null);
                  navigate({ to: "/messages/$id", params: { id: cid } });
                } catch (e) { toast.error(friendlyError(e)); }
              }}
            >
              <MessageSquare className="h-3 w-3" /> Message
            </ActionBtn>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ActionBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-muted-foreground"
    >
      {children}
    </button>
  );
}

/* ───────── Student Plug directory ───────── */

function PlugsPanel() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [school, setSchool] = useState("");
  const [minRating, setMinRating] = useState(0);
  const res = useQuery({
    queryKey: ["student-plugs", q, school, minRating],
    queryFn: () => searchStudentPlugs({ q, school, minRating }),
  });

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        Only students who turned on “Open to Work” appear here. Contact details stay private —
        reach out through PlugU messages and they choose whether to respond.
      </p>
      <label className="relative block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <span className="sr-only">Search students</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Service, skill or major…"
          className="w-full rounded-2xl border border-border bg-card pl-9 pr-3 py-2.5 text-sm"
        />
      </label>
      <div className="flex gap-2">
        <input
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          placeholder="School"
          aria-label="Filter by school"
          className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-xs"
        />
        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          aria-label="Minimum rating"
          className="rounded-xl border border-border bg-card px-3 py-2 text-xs"
        >
          <option value={0}>Any rating</option>
          <option value={3}>3★+</option>
          <option value={4}>4★+</option>
          <option value={4.5}>4.5★+</option>
        </select>
      </div>

      {res.isPending ? (
        <PageLoader />
      ) : res.error ? (
        <ErrorState onRetry={() => res.refetch()} />
      ) : (res.data ?? []).length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          No students match yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {(res.data ?? []).map((s) => (
            <li key={s.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-background">
                  {s.avatar_url && <img src={s.avatar_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-sm font-semibold truncate">
                    {s.display_name || s.full_name || s.username || "Student"}
                    {s.verification_status === "verified" && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {s.school_name ?? "—"}{s.major ? ` · ${s.major}` : ""} · <Star className="inline h-3 w-3" /> {s.rating_avg.toFixed(1)}
                  </p>
                </div>
              </div>
              {s.open_to_work_note && <p className="mt-2 text-xs text-muted-foreground">{s.open_to_work_note}</p>}
              <div className="mt-3 flex gap-2">
                <ActionBtn
                  onClick={async () => {
                    try {
                      const cid = await getOrCreateConversation(s.id, null);
                      navigate({ to: "/messages/$id", params: { id: cid } });
                    } catch (e) { toast.error(friendlyError(e)); }
                  }}
                >
                  <MessageSquare className="h-3 w-3" /> Message
                </ActionBtn>
                {s.username && (
                  <Link
                    to="/u/$username"
                    params={{ username: s.username }}
                    className="tap inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-muted-foreground"
                  >
                    <Users className="h-3 w-3" /> Profile
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
