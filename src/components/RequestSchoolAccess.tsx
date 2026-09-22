// Authenticated form that lets a signed-in student ask us to add their
// school to the PlugU registry. Writes to public.school_access_requests
// under RLS (requester_user_id = auth.uid()).
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { getDomain } from "@/lib/auth";
import { Loader2, CheckCircle2, GraduationCap, AlertCircle } from "lucide-react";
import { friendlyError } from "@/lib/friendly-errors";

type Row = {
  id: string;
  requested_school_name: string;
  requested_domain: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
};

export function RequestSchoolAccess({ compact }: { compact?: boolean }) {
  const { user } = useSession();
  const { profile } = useProfile();
  const qc = useQueryClient();

  const emailDomain = useMemo(
    () => profile?.school_domain || (profile?.email ? getDomain(profile.email) : "") || "",
    [profile?.school_domain, profile?.email],
  );

  const [school, setSchool] = useState(profile?.school_name ?? "");
  const [domain, setDomain] = useState(emailDomain);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const existing = useQuery({
    queryKey: ["school-access-requests", user?.id ?? null],
    enabled: !!user?.id,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("school_access_requests")
        .select("id,requested_school_name,requested_domain,status,created_at,reviewed_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Row[]) ?? [];
    },
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !user?.id) return;
    setErr(null);
    const name = school.trim();
    const dom = domain.trim().toLowerCase().replace(/^@/, "");
    if (name.length < 2) return setErr("Enter your school's name.");
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(dom))
      return setErr("Enter the school's email domain (e.g. school.edu).");
    setBusy(true);
    const { error } = await supabase.from("school_access_requests").insert({
      requester_user_id: user.id,
      requested_school_name: name,
      requested_domain: dom,
      note: note.trim() || null,
    });
    setBusy(false);
    if (error) {
      setErr(friendlyError(error));
      return;
    }
    setNote("");
    qc.invalidateQueries({ queryKey: ["school-access-requests", user.id] });
  }

  const pending = existing.data?.some((r) => r.status === "pending");

  return (
    <div className={compact ? "" : "rounded-3xl border border-border bg-card p-5"}>
      {!compact && (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Request school access</h2>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-1">
        Don't see your school? Submit it for review — the PlugU team will add verified domains, usually within 48 hours.
      </p>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <Labeled label="School name">
          <input
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="e.g. Grand Valley State University"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
          />
        </Labeled>
        <Labeled label="Official email domain">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="school.edu"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
          />
        </Labeled>
        <Labeled label="Note (optional)">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Anything the team should know?"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
        </Labeled>
        {err && (
          <p role="alert" className="flex items-start gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {err}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || !user?.id}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Submitting…" : "Submit request"}
        </button>
        {!user?.id && (
          <p className="text-center text-[11px] text-muted-foreground">
            Create an account or sign in to send this request.{" "}
            <Link to="/auth" search={{ next: "/request-school-access", mode: "" }} className="underline text-accent">
              Sign in
            </Link>
          </p>
        )}
      </form>

      {existing.data && existing.data.length > 0 && (
        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Your requests</p>
          <ul className="mt-2 space-y-2">
            {existing.data.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{r.requested_school_name}</p>
                  <p className="truncate text-muted-foreground">@{r.requested_domain}</p>
                </div>
                <StatusPill status={r.status} />
              </li>
            ))}
          </ul>
          {pending && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" /> We're on it — you'll get notified when reviewed.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "border-primary/40 text-primary bg-primary/10" },
    approved: { label: "Approved", cls: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" },
    rejected: { label: "Rejected", cls: "border-destructive/40 text-destructive bg-destructive/10" },
  };
  const s = map[status] ?? map.pending;
  return <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${s.cls}`}>{s.label}</span>;
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}