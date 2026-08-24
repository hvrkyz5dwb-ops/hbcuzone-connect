import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShieldCheck, Users, Flag, ScrollText, Search, Check, X, Ban, Trash2, Loader2,
  School as SchoolIcon, AlertTriangle, ShieldAlert, ClipboardList, BadgePercent, Star, History,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ChargingLoader } from "@/components/ChargingLoader";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { adminPerform, type AdminAction } from "@/lib/moderation";
import { friendlyError } from "@/lib/friendly-errors";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — PlugU" }] }),
  component: Admin,
});

const TABS = [
  { key: "listings", label: "Listings", icon: ScrollText },
  { key: "reports", label: "Reports", icon: Flag },
  { key: "filtered", label: "Filtered", icon: ShieldAlert },
  { key: "disputes", label: "Disputes", icon: AlertTriangle },
  { key: "users", label: "Users", icon: Users },
  { key: "access", label: "School Access", icon: SchoolIcon },
  { key: "log", label: "Activity Log", icon: ClipboardList },
  { key: "promos", label: "Promos", icon: BadgePercent },
] as const;

function FilteredPanel() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<"open" | "reviewed">("open");
  const q = useQuery({
    queryKey: ["admin-moderation-queue", status],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("moderation_queue")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false })
        .limit(150);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const markReviewed = async (id: string) => {
    const { error } = await (supabase as any)
      .from("moderation_queue")
      .update({ status: "reviewed", reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(friendlyError(error)); return; }
    toast.success("Marked reviewed");
    qc.invalidateQueries({ queryKey: ["admin-moderation-queue"] });
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        Content the automated filter blocked before it was published. Review it to spot repeat
        offenders and tune enforcement.
      </p>
      <div className="flex gap-1.5">
        {(["open", "reviewed"] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded-full text-[11px] border capitalize ${status===s?"bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary":"bg-secondary text-muted-foreground border-border"}`}>{s}</button>
        ))}
      </div>
      {q.isPending ? <Loading/> : (q.data?.length ?? 0) === 0 ? <Empty text="Nothing blocked here."/> : (
        <ul className="space-y-2">
          {q.data!.map((m) => (
            <li key={m.id} className="rounded-2xl border border-border bg-card p-3">
              <p className="text-sm font-medium capitalize">
                {String(m.content_type).replace(/_/g, " ")}
                <span className="ml-2 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-destructive/50 text-destructive">
                  {m.category}
                </span>
              </p>
              <blockquote className="mt-1.5 rounded-xl border border-border bg-background/60 p-2 text-[11px] whitespace-pre-wrap break-words line-clamp-6">
                {m.content_text}
              </blockquote>
              <p className="mt-1 text-[10px] text-muted-foreground font-mono">
                Author: {String(m.author_user_id ?? "").slice(0, 8).toUpperCase()} · {new Date(m.created_at).toLocaleString()}
              </p>
              {m.status === "open" && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <AdminBtn variant="ok" onClick={() => markReviewed(m.id)}><Check className="h-3 w-3"/> Mark reviewed</AdminBtn>
                  {m.author_user_id && (
                    <AdminBtn variant="bad" onClick={() => {
                      const note = window.prompt("Reason for suspension?") ?? "";
                      adminPerform({ action: "user.suspend", targetType: "user", targetId: m.author_user_id, note })
                        .then(() => { toast.success("User suspended"); qc.invalidateQueries({ queryKey: ["admin-users"] }); })
                        .catch((e) => toast.error(friendlyError(e)));
                    }}><Ban className="h-3 w-3"/> Suspend author</AdminBtn>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Admin() {
  const { session } = useSession();
  const uid = session?.user?.id ?? null;
  const roleQ = useQuery({
    queryKey: ["is-admin", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: uid!, _role: "admin" });
      if (error) throw error;
      return !!data;
    },
  });
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("listings");

  if (roleQ.isPending) {
    return <AppShell title="ADMIN"><div className="p-10 grid place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin"/></div></AppShell>;
  }
  if (!roleQ.data) {
    return (
      <AppShell title="ADMIN">
        <section className="px-5 pt-16 max-w-sm mx-auto text-center">
          <div className="mx-auto h-16 w-16 rounded-full border border-primary/40 grid place-items-center bg-card">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mt-4 text-xl font-bold">Admin only</h1>
          <p className="text-xs text-muted-foreground mt-1">This dashboard is restricted to accounts with the admin role.</p>
          <Link to="/" className="mt-4 inline-block text-xs text-accent">← Back home</Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="ADMIN">
      <section className="px-5 pt-5">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Trust & Safety
        </h1>
        <p className="text-xs text-muted-foreground">Moderate listings, resolve reports, protect the community.</p>
      </section>

      <nav className="mt-4 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs border ${
                active ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                       : "bg-card text-muted-foreground border-border"}`}>
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </nav>

      <section className="px-5 mt-3 pb-8 space-y-3">
        {tab === "listings" && <ListingsPanel />}
        {tab === "reports" && <ReportsPanel />}
        {tab === "filtered" && <FilteredPanel />}
        {tab === "disputes" && <DisputesPanel />}
        {tab === "users" && <UsersPanel />}
        {tab === "access" && <SchoolAccessPanel />}
        {tab === "log" && <ActivityLog />}
        {tab === "promos" && <PromosPanel />}
      </section>
    </AppShell>
  );
}

function useAdminAction() {
  const qc = useQueryClient();
  return async (input: { action: AdminAction; targetType: string; targetId: string; note?: string; invalidate?: string[] }) => {
    try {
      await adminPerform(input);
      toast.success("Done", { description: input.action.replace(".", " · ") });
      (input.invalidate ?? []).forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: ["admin-log"] });
    } catch (err) { toast.error("Action failed", { description: (err as Error).message }); }
  };
}

function ListingsPanel() {
  const perform = useAdminAction();
  const q = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id,title,price_cents,category,kind,moderation_status,status,seller_user_id,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
  const [filter, setFilter] = useState<"pending"|"all"|"rejected"|"removed">("pending");
  const [term, setTerm] = useState("");
  const rows = useMemo(() => {
    const list = q.data ?? [];
    const byStatus = filter === "all" ? list : list.filter((l) => l.moderation_status === filter);
    if (!term.trim()) return byStatus;
    const t = term.toLowerCase();
    return byStatus.filter((l) => l.title?.toLowerCase().includes(t) || l.id.startsWith(t));
  }, [q.data, filter, term]);

  return (
    <>
      <SearchBar value={term} onChange={setTerm} placeholder="Search title or listing ID"/>
      <div className="flex flex-wrap gap-1.5">
        {(["pending","all","rejected","removed"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-[11px] border capitalize ${filter===f?"bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary":"bg-secondary text-muted-foreground border-border"}`}>{f}</button>
        ))}
      </div>
      {q.isPending ? <Loading/> : rows.length === 0 ? <Empty text="No listings match."/> : (
        <ul className="space-y-2">
          {rows.map((l) => (
            <li key={l.id} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{l.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {l.category} · {l.kind} · ${(l.price_cents/100).toFixed(2)} · {l.moderation_status}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">{l.id.slice(0,8).toUpperCase()}</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <AdminBtn variant="ok" onClick={() => perform({ action:"listing.approve", targetType:"listing", targetId:l.id, invalidate:["admin-listings"] })}><Check className="h-3 w-3"/> Approve</AdminBtn>
                <AdminBtn variant="warn" onClick={() => perform({ action:"listing.reject", targetType:"listing", targetId:l.id, invalidate:["admin-listings"] })}><X className="h-3 w-3"/> Reject</AdminBtn>
                <AdminBtn variant="bad" onClick={() => perform({ action:"listing.remove", targetType:"listing", targetId:l.id, invalidate:["admin-listings"] })}><Trash2 className="h-3 w-3"/> Remove</AdminBtn>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ReportsPanel() {
  const perform = useAdminAction();
  const [status, setStatus] = useState<"open"|"all"|"resolved"|"dismissed">("open");
  const q = useQuery({
    queryKey: ["admin-reports", status],
    queryFn: async () => {
      let qb = supabase.from("reports").select("*").order("created_at",{ ascending:false }).limit(150);
      if (status !== "all") qb = qb.eq("status", status);
      const { data, error } = await qb;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {(["open","resolved","dismissed","all"] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded-full text-[11px] border capitalize ${status===s?"bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary":"bg-secondary text-muted-foreground border-border"}`}>{s}</button>
        ))}
      </div>
      {q.isPending ? <Loading/> : (q.data?.length ?? 0) === 0 ? <Empty text="No reports."/> : (
        <ul className="space-y-2">
          {q.data!.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium capitalize">
                    Report · {r.target_type}
                    {(r as any).reason_code && (
                      <span className="ml-2 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-accent/50 text-accent">
                        {String((r as any).reason_code).replace(/_/g, " ")}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{r.reason}</p>
                  {(r as any).details && (
                    <p className="mt-1 text-[11px] text-foreground/80 whitespace-pre-wrap break-words">{(r as any).details}</p>
                  )}
                  {(r as any).content_snapshot && (
                    <blockquote className="mt-1.5 rounded-xl border border-border bg-background/60 p-2 text-[11px] text-foreground/80 whitespace-pre-wrap break-words line-clamp-6">
                      {(r as any).content_snapshot}
                    </blockquote>
                  )}

                  {(r as any).reported_user_id && (
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Reported user: {String((r as any).reported_user_id).slice(0, 8).toUpperCase()}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground font-mono">Target: {r.target_id.slice(0,8).toUpperCase()} · {new Date(r.created_at).toLocaleString()}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-border text-muted-foreground">{r.status}</span>
              </div>
              {r.status === "open" && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <AdminBtn variant="ok" onClick={() => perform({ action:"report.resolve", targetType:"report", targetId:r.id, invalidate:["admin-reports"] })}><Check className="h-3 w-3"/> Resolve</AdminBtn>
                  <AdminBtn variant="warn" onClick={() => perform({ action:"report.dismiss", targetType:"report", targetId:r.id, invalidate:["admin-reports"] })}><X className="h-3 w-3"/> Dismiss</AdminBtn>
                  {r.target_type === "review" && (
                    <AdminBtn variant="bad" onClick={() => perform({ action:"review.remove", targetType:"review", targetId:r.target_id, invalidate:["admin-reports"] })}><Trash2 className="h-3 w-3"/> Remove review</AdminBtn>
                  )}
                  {r.target_type === "listing" && (
                    <AdminBtn variant="bad" onClick={() => perform({ action:"listing.remove", targetType:"listing", targetId:r.target_id, invalidate:["admin-reports","admin-listings"] })}><Trash2 className="h-3 w-3"/> Remove listing</AdminBtn>
                  )}
                  {(r as any).reported_user_id && r.target_type !== "user" && (
                    <AdminBtn variant="bad" onClick={() => {
                      const note = window.prompt("Suspension reason?") ?? "";
                      perform({ action:"user.suspend", targetType:"user", targetId:String((r as any).reported_user_id), note, invalidate:["admin-reports","admin-users"] });
                    }}><Ban className="h-3 w-3"/> Suspend author</AdminBtn>
                  )}
                  {r.target_type === "user" && (
                    <AdminBtn variant="bad" onClick={() => {
                      const note = window.prompt("Suspension reason?") ?? "";
                      perform({ action:"user.suspend", targetType:"user", targetId:r.target_id, note, invalidate:["admin-reports","admin-users"] });
                    }}><Ban className="h-3 w-3"/> Suspend user</AdminBtn>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function DisputesPanel() {
  const perform = useAdminAction();
  const q = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("disputes").select("*").order("created_at",{ascending:false}).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
  if (q.isPending) return <Loading/>;
  if ((q.data?.length ?? 0) === 0) return <Empty text="No disputes."/>;
  return (
    <ul className="space-y-2">
      {q.data!.map((d) => (
        <li key={d.id} className="rounded-2xl border border-border bg-card p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">Order {d.order_id.slice(0,8).toUpperCase()}</p>
              <p className="text-[11px] text-muted-foreground truncate">{d.reason}</p>
            </div>
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-border text-muted-foreground">{d.status}</span>
          </div>
          {d.status === "open" && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <AdminBtn variant="ok" onClick={() => {
                const note = window.prompt("Resolution note (visible to both sides)?") ?? "";
                perform({ action:"dispute.resolve", targetType:"dispute", targetId:d.id, note, invalidate:["admin-disputes"] });
              }}><Check className="h-3 w-3"/> Resolve</AdminBtn>
              <AdminBtn variant="warn" onClick={() => {
                const note = window.prompt("Reject reason?") ?? "";
                perform({ action:"dispute.reject", targetType:"dispute", targetId:d.id, note, invalidate:["admin-disputes"] });
              }}><X className="h-3 w-3"/> Reject</AdminBtn>
            </div>
          )}
          {d.resolution_note && <p className="mt-2 text-[11px] text-muted-foreground italic">"{d.resolution_note}"</p>}
        </li>
      ))}
    </ul>
  );
}

function UsersPanel() {
  const perform = useAdminAction();
  const [term, setTerm] = useState("");
  const q = useQuery({
    queryKey: ["admin-users", term],
    queryFn: async () => {
      // Email is column-restricted on profiles; the admin-gated RPC is the only read path.
      const { data, error } = await (supabase.rpc as any)("admin_user_directory")
        .order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      const rows = (data ?? []) as any[];
      const t = term.trim().toLowerCase();
      if (!t) return rows;
      return rows.filter((r) =>
        [r.email, r.username, r.display_name].some((v) => typeof v === "string" && v.toLowerCase().includes(t)));
    },
  });
  return (
    <>
      <SearchBar value={term} onChange={setTerm} placeholder="Search email, username, name"/>
      {q.isPending ? <Loading/> : (q.data?.length ?? 0) === 0 ? <Empty text="No matching users."/> : (
        <ul className="space-y-2">
          {q.data!.map((u) => (
            <li key={u.id} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.display_name ?? u.username ?? u.email}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{u.email} · {u.school_name ?? "—"}</p>
                  <p className="text-[10px] text-muted-foreground">Deals: {u.completed_transactions} · ★ {u.rating_count>0?Number(u.rating_avg).toFixed(1):"—"} ({u.rating_count})</p>
                </div>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${u.is_suspended?"border-destructive/40 text-destructive":"border-border text-muted-foreground"}`}>
                  {u.is_suspended ? "suspended" : u.verification_status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {u.is_suspended ? (
                  <AdminBtn variant="ok" onClick={() => perform({ action:"user.restore", targetType:"user", targetId:u.id, invalidate:["admin-users"] })}><Check className="h-3 w-3"/> Restore</AdminBtn>
                ) : (
                  <AdminBtn variant="bad" onClick={() => {
                    const note = window.prompt("Suspension reason?") ?? "";
                    perform({ action:"user.suspend", targetType:"user", targetId:u.id, note, invalidate:["admin-users"] });
                  }}><Ban className="h-3 w-3"/> Suspend</AdminBtn>
                )}
                {u.username && <Link to="/u/$username" params={{username:u.username}} className="tap px-2.5 py-1.5 rounded-lg text-[11px] border bg-secondary border-border text-muted-foreground">View profile →</Link>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function SchoolAccessPanel() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-school-access"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_access_requests")
        .select("id,requester_user_id,requested_school_name,requested_domain,status,note,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  async function review(id: string, status: "approved"|"rejected") {
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase.from("school_access_requests")
      .update({ status, reviewed_by: sess.session?.user.id ?? null, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(friendlyError(error));
    qc.invalidateQueries({ queryKey: ["admin-school-access"] });
  }
  if (q.isPending) return <Loading/>;
  if ((q.data?.length ?? 0) === 0) return <Empty text="No school access requests."/>;
  return (
    <ul className="space-y-2">
      {q.data!.map((r) => (
        <li key={r.id} className="rounded-2xl border border-border bg-card p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{r.requested_school_name}</p>
              <p className="text-[11px] text-muted-foreground truncate">@{r.requested_domain} · {new Date(r.created_at).toLocaleDateString()}</p>
              {r.note && <p className="text-[11px] text-muted-foreground italic">"{r.note}"</p>}
            </div>
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-border text-muted-foreground">{r.status}</span>
          </div>
          {r.status === "pending" && (
            <div className="mt-2 flex gap-1.5">
              <AdminBtn variant="ok" onClick={() => review(r.id, "approved")}><Check className="h-3 w-3"/> Approve</AdminBtn>
              <AdminBtn variant="bad" onClick={() => review(r.id, "rejected")}><X className="h-3 w-3"/> Reject</AdminBtn>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function ActivityLog() {
  const q = useQuery({
    queryKey: ["admin-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_actions").select("*").order("created_at",{ascending:false}).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
  if (q.isPending) return <Loading/>;
  if ((q.data?.length ?? 0) === 0) return <Empty text="No admin actions logged yet."/>;
  return (
    <ul className="space-y-2">
      {q.data!.map((a) => (
        <li key={a.id} className="rounded-2xl border border-border bg-card p-3">
          <p className="text-sm font-medium">{a.action}</p>
          <p className="text-[11px] text-muted-foreground">
            {a.target_type} · <span className="font-mono">{a.target_id?.slice(0,8).toUpperCase() ?? "—"}</span>
            {" · "}{new Date(a.created_at).toLocaleString()}
          </p>
          {a.note && <p className="mt-1 text-[11px] text-muted-foreground italic">"{a.note}"</p>}
        </li>
      ))}
    </ul>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (s: string) => void; placeholder: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3">
      <Search className="h-3.5 w-3.5 text-muted-foreground"/>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 py-2 bg-transparent outline-none text-sm"/>
    </div>
  );
}

function AdminBtn({ children, variant, onClick }: { children: React.ReactNode; variant: "ok"|"warn"|"bad"; onClick?: () => void }) {
  const c = variant==="ok" ? "bg-primary/10 border-primary/30 text-primary"
          : variant==="warn" ? "bg-accent/10 border-accent/30 text-accent"
          : "bg-destructive/10 border-destructive/30 text-destructive";
  return <button onClick={onClick} className={`tap inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] border ${c}`}>{children}</button>;
}

function Loading() { return <div className="py-10 grid place-items-center"><ChargingLoader size={32} /></div>; }
function Empty({ text }: { text: string }) { return <p className="text-xs text-muted-foreground px-1 py-4">{text}</p>; }

// ================= Promo codes =================

type PromoCodeRow = {
  id: string;
  code: string;
  description: string | null;
  discount_percent: number;
  is_active: boolean;
  expires_at: string | null;
  max_redemptions: number | null;
};

type RedemptionRow = {
  id: string;
  code_id: string;
  user_id: string;
  plan_key: string;
  original_cents: number;
  discount_cents: number;
  final_cents: number;
  stripe_session_id: string | null;
  created_at: string;
};

type DirectoryUser = { id: string; email: string | null; username: string | null; display_name: string | null };

/** Admin-gated user directory (email is column-restricted on profiles). */
function useAdminDirectory() {
  return useQuery({
    queryKey: ["admin-user-directory"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_user_directory");
      if (error) throw error;
      return (data ?? []) as unknown as DirectoryUser[];
    },
  });
}

function PromosPanel() {
  const qc = useQueryClient();
  const codes = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("id, code, description, discount_percent, is_active, expires_at, max_redemptions")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PromoCodeRow[];
    },
  });
  const redemptions = useQuery({
    queryKey: ["admin-promo-redemptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_code_redemptions")
        .select("id, code_id, user_id, plan_key, original_cents, discount_cents, final_cents, stripe_session_id, created_at")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as unknown as RedemptionRow[];
    },
  });

  const [code, setCode] = useState("");
  const [pct, setPct] = useState("50");
  const [max, setMax] = useState("");
  const [expires, setExpires] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!code.trim() || busy) return;
    setBusy(true);
    const { error } = await supabase.from("promo_codes").insert({
      code: code.trim(),
      discount_percent: Math.max(1, Math.min(100, Number(pct) || 50)),
      max_redemptions: max.trim() ? Number(max) : null,
      expires_at: expires ? new Date(expires).toISOString() : null,
    });
    setBusy(false);
    if (error) {
      toast.error("Couldn't create code", { description: friendlyError(error) });
      return;
    }
    toast.success(`Code ${code.trim()} created`);
    setCode(""); setMax(""); setExpires("");
    qc.invalidateQueries({ queryKey: ["admin-promo-codes"] });
  }

  async function toggle(c: PromoCodeRow) {
    const { error } = await supabase.from("promo_codes").update({ is_active: !c.is_active }).eq("id", c.id);
    if (error) {
      toast.error("Couldn't update code", { description: friendlyError(error) });
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    toast(c.is_active ? `Code ${c.code} disabled` : `Code ${c.code} enabled`);
  }

  const countByCode = new Map<string, number>();
  const savedByCode = new Map<string, number>();
  for (const r of redemptions.data ?? []) {
    countByCode.set(r.code_id, (countByCode.get(r.code_id) ?? 0) + 1);
    savedByCode.set(r.code_id, (savedByCode.get(r.code_id) ?? 0) + r.discount_cents);
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold flex items-center gap-1.5">
          <BadgePercent className="h-3.5 w-3.5 text-primary" /> Create promo code
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code (e.g. Havn$hvt)"
            maxLength={40}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={pct}
            onChange={(e) => setPct(e.target.value)}
            inputMode="numeric"
            placeholder="% off"
            aria-label="Discount percent"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={max}
            onChange={(e) => setMax(e.target.value)}
            inputMode="numeric"
            placeholder="Max redemptions (blank = unlimited)"
            aria-label="Max redemptions"
            className="col-span-2 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <label className="col-span-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            Expires (optional)
            <input
              type="datetime-local"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
        <button
          onClick={create}
          disabled={busy || !code.trim()}
          className="tap mt-3 w-full rounded-2xl bg-[image:var(--gradient-bronze)] py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create code"}
        </button>
        <p className="mt-2 text-[10px] text-muted-foreground">
          One redemption per account is enforced automatically. Codes apply to seller subscriptions at checkout.
        </p>
      </div>

      <div className="mt-3">
        {codes.isPending ? (
          <Loading />
        ) : (codes.data ?? []).length === 0 ? (
          <Empty text="No promo codes yet." />
        ) : (
          <ul className="space-y-2">
            {(codes.data ?? []).map((c) => {
              const used = countByCode.get(c.id) ?? 0;
              const saved = savedByCode.get(c.id) ?? 0;
              const expired = !!c.expires_at && new Date(c.expires_at).getTime() < Date.now();
              return (
                <li key={c.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{c.code}</p>
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                      {c.discount_percent}% off
                    </span>
                    <span
                      className={`ml-auto text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        c.is_active && !expired ? "text-primary bg-primary/10" : "text-muted-foreground bg-border/60"
                      }`}
                    >
                      {expired ? "Expired" : c.is_active ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {used} redemption{used === 1 ? "" : "s"}
                    {c.max_redemptions ? ` / ${c.max_redemptions} max` : ""}
                    {saved > 0 ? ` · $${(saved / 100).toFixed(2)} saved` : ""}
                    {c.expires_at ? ` · expires ${new Date(c.expires_at).toLocaleDateString()}` : " · no expiry"}
                  </p>
                  <div className="mt-2">
                    <AdminBtn variant={c.is_active ? "warn" : "ok"} onClick={() => toggle(c)}>
                      {c.is_active ? "Disable" : "Enable"}
                    </AdminBtn>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <PromoAuditLog
        redemptions={redemptions.data ?? []}
        codes={codes.data ?? []}
        loading={redemptions.isPending}
      />

      <KingPinTargeting />
    </>
  );
}

/** Append-only audit trail: who redeemed which promo code, on what plan,
 *  for how much, and when. Redemptions are written server-side at checkout
 *  verification and cannot be edited or deleted by anyone (RLS). */
function PromoAuditLog({ redemptions, codes, loading }: {
  redemptions: RedemptionRow[];
  codes: PromoCodeRow[];
  loading: boolean;
}) {
  const directory = useAdminDirectory();
  const [term, setTerm] = useState("");

  const codeById = useMemo(() => new Map(codes.map((c) => [c.id, c.code])), [codes]);
  const userById = useMemo(() => new Map((directory.data ?? []).map((u) => [u.id, u])), [directory.data]);

  const rows = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return redemptions;
    return redemptions.filter((r) => {
      const u = userById.get(r.user_id);
      const hay = [codeById.get(r.code_id), r.plan_key, u?.email, u?.username, u?.display_name, r.stripe_session_id]
        .filter((v): v is string => typeof v === "string" && v.length > 0)
        .join(" ")
        .toLowerCase();
      return hay.includes(t);
    });
  }, [term, redemptions, codeById, userById]);

  const totalSaved = redemptions.reduce((sum, r) => sum + r.discount_cents, 0);

  return (
    <section className="mt-5 rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-semibold flex items-center gap-1.5">
        <History className="h-3.5 w-3.5 text-primary" /> Redemption audit log
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Every promo code redemption — who applied it, what plan was purchased, and the exact
        amounts. Entries are written server-side at payment and cannot be edited or deleted.
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {redemptions.length} redemption{redemptions.length === 1 ? "" : "s"}
        {totalSaved > 0 ? ` · $${(totalSaved / 100).toFixed(2)} total discounts given` : ""}
      </p>
      <div className="mt-3">
        <SearchBar value={term} onChange={setTerm} placeholder="Search code, user, plan, or session" />
      </div>
      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty text={term ? "No redemptions match that search." : "No promo redemptions yet."} />
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((r) => {
            const u = userById.get(r.user_id);
            const who = u?.display_name ?? u?.username ?? u?.email ?? r.user_id.slice(0, 8).toUpperCase();
            return (
              <li key={r.id} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{who}</p>
                    {u?.email && (u.display_name || u.username) && (
                      <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {codeById.get(r.code_id) ?? "deleted code"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Redeemed <span className="font-medium text-foreground">{r.plan_key.replace(/_/g, " ")}</span>
                  {" · "}${(r.original_cents / 100).toFixed(2)} → ${(r.final_cents / 100).toFixed(2)}
                  <span className="text-primary"> (saved ${(r.discount_cents / 100).toFixed(2)})</span>
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                  {r.stripe_session_id && (
                    <span className="font-mono"> · {r.stripe_session_id.slice(0, 18)}…</span>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** KingPin sellers are eligible for expanded visibility — set who sees their promotion. */
function KingPinTargeting() {
  const qc = useQueryClient();
  const subs = useQuery({
    queryKey: ["admin-paid-subs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_subscriptions")
        .select("id, user_id, plan_code, status, promo_scope, current_period_end")
        .in("plan_code", ["pro", "kingpin"])
        .eq("status", "active");
      if (error) throw error;
      return (data ?? []) as unknown as {
        id: string; user_id: string; plan_code: string; promo_scope: string; current_period_end: string | null;
      }[];
    },
  });
  const users = useAdminDirectory();

  async function setScope(id: string, scope: string) {
    const { error } = await supabase.from("seller_subscriptions").update({ promo_scope: scope }).eq("id", id);
    if (error) {
      toast.error("Couldn't update targeting", { description: friendlyError(error) });
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-paid-subs"] });
    toast.success("Targeting updated");
  }

  const nameOf = new Map((users.data ?? []).map((u) => [u.id, u.display_name ?? u.username ?? u.id.slice(0, 8)]));

  return (
    <section className="mt-5 rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-semibold flex items-center gap-1.5">
        <Star className="h-3.5 w-3.5 text-primary" /> Featured promotion targeting
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        KingPin sellers are eligible for expanded visibility. Verified Pro sellers are always featured on their own campus.
      </p>
      {subs.isPending ? (
        <Loading />
      ) : (subs.data ?? []).length === 0 ? (
        <Empty text="No active Pro or KingPin subscriptions yet." />
      ) : (
        <ul className="mt-3 space-y-2">
          {(subs.data ?? []).map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{nameOf.get(s.user_id) ?? s.user_id.slice(0, 8)}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.plan_code}
                  {s.current_period_end ? ` · until ${new Date(s.current_period_end).toLocaleDateString()}` : ""}
                </p>
              </div>
              <select
                value={s.promo_scope}
                disabled={s.plan_code !== "kingpin"}
                onChange={(e) => setScope(s.id, e.target.value)}
                aria-label="Promotion scope"
                className="rounded-xl border border-border bg-card px-2 py-1.5 text-xs disabled:opacity-50"
              >
                <option value="campus">Campus</option>
                <option value="nearby">Nearby campuses</option>
                <option value="state">Statewide</option>
                <option value="regional">Regional</option>
                <option value="national">National</option>
              </select>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}