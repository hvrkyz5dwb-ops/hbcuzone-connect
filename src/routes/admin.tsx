import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShieldCheck, Users, Flag, ScrollText, Search, Check, X, Ban, Trash2, Loader2,
  School as SchoolIcon, AlertTriangle, ClipboardList,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { adminPerform, type AdminAction } from "@/lib/moderation";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — PlugU" }] }),
  component: Admin,
});

const TABS = [
  { key: "listings", label: "Listings", icon: ScrollText },
  { key: "reports", label: "Reports", icon: Flag },
  { key: "disputes", label: "Disputes", icon: AlertTriangle },
  { key: "users", label: "Users", icon: Users },
  { key: "access", label: "School Access", icon: SchoolIcon },
  { key: "log", label: "Activity Log", icon: ClipboardList },
] as const;

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
        {tab === "disputes" && <DisputesPanel />}
        {tab === "users" && <UsersPanel />}
        {tab === "access" && <SchoolAccessPanel />}
        {tab === "log" && <ActivityLog />}
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
                  <p className="text-sm font-medium capitalize">Report · {r.target_type}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{r.reason}</p>
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
    if (error) return toast.error(error.message);
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

function Loading() { return <div className="py-10 grid place-items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/></div>; }
function Empty({ text }: { text: string }) { return <p className="text-xs text-muted-foreground px-1 py-4">{text}</p>; }