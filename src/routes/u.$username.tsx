import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ErrorState, PageLoader } from "@/components/QueryStates";
import { VerifiedStudentBadge } from "@/components/VerifiedStudentBadge";
import { Crown, GraduationCap, MapPin, Star, ShoppingBag, Flag, Ban } from "lucide-react";
import { ReviewsList } from "@/components/ReviewsList";
import { PlugScoreBadge } from "@/components/PlugScoreBadge";
import { ReportDialog } from "@/components/ReportDialog";
import { blockUser, unblockUser } from "@/lib/moderation";
import { useSession } from "@/hooks/use-session";
import { useBlocklist, useRefreshBlocklist } from "@/hooks/use-blocklist";
import { requestAuthentication } from "@/components/RequireAuthPrompt";

export const Route = createFileRoute("/u/$username")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — PlugU` },
      { name: "description", content: `${params.username} on PlugU — verified student profile, listings, and reputation.` },
      { property: "og:title", content: `@${params.username} on PlugU` },
      { property: "og:description", content: "Verified student profile on PlugU." },
    ],
  }),
  component: PublicProfile,
});

type PublicProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  school_name: string | null;
  graduation_year: number | null;
  year: string | null;
  major: string | null;
  status: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_hbcu_student: boolean;
  verification_status: string;
  completed_transactions: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
};

function PublicProfile() {
  const { username } = Route.useParams();
  const { session } = useSession();
  const meId = session?.user?.id ?? null;
  const [reportOpen, setReportOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const { isBlocked } = useBlocklist();
  const refreshBlocklist = useRefreshBlocklist();
  const q = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async (): Promise<PublicProfile | null> => {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("username", username.toLowerCase())
        .maybeSingle();
      if (error) throw error;
      return (data as PublicProfile | null) ?? null;
    },
  });

  if (q.isPending) {
    return (
      <AppShell title="PROFILE">
        <PageLoader message="Loading profile…" />
      </AppShell>
    );
  }

  if (q.isError) {
    return (
      <AppShell title="PROFILE">
        <ErrorState
          title="Profile didn't load"
          description="We couldn't reach this profile. Check your connection and try again."
          onRetry={() => void q.refetch()}
        />
      </AppShell>
    );
  }

  const p = q.data;
  if (!p) {
    return (
      <AppShell title="PROFILE">
        <section className="p-6 text-center">
          <p className="text-sm text-muted-foreground">No PlugU profile at <span className="font-mono">@{username}</span>.</p>
          <Link to="/" className="mt-4 inline-block text-primary underline text-sm">Back to PlugU</Link>
        </section>
      </AppShell>
    );
  }

  const displayName = p.display_name || `@${p.username}`;
  const joined = new Date(p.created_at);
  const isAlumni = p.status === "alumni";
  const isSelf = meId === p.id;
  const blockedByMe = isBlocked(p.id);

  async function onBlock() {
    if (!meId) { requestAuthentication(); return; }
    setBlocking(true);
    try {
      await blockUser(p!.id);
      refreshBlocklist();
      setConfirmBlock(false);
      toast.success("Blocked", {
        description: "Their listings, posts, reviews and messages are hidden and you can't contact each other.",
      });
    } catch (err) {
      toast.error("Couldn't block", { description: (err as Error).message });
    } finally { setBlocking(false); }
  }

  async function onUnblock() {
    setBlocking(true);
    try {
      await unblockUser(p!.id);
      refreshBlocklist();
      toast.success("Unblocked");
    } catch (err) {
      toast.error("Couldn't unblock", { description: (err as Error).message });
    } finally { setBlocking(false); }
  }

  // An old link to a blocked account must not surface their content.
  if (blockedByMe) {
    return (
      <AppShell title="PROFILE">
        <section className="px-6 pt-16 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-border bg-card">
            <Ban className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-semibold">This content is unavailable</p>
          <p className="mt-1 text-xs text-muted-foreground">
            You blocked this account. Unblock it to see their profile again.
          </p>
          <button
            onClick={onUnblock}
            disabled={blocking}
            className="tap mt-5 rounded-2xl border border-border bg-secondary px-5 py-3 text-xs font-semibold disabled:opacity-60"
          >
            Unblock
          </button>
          <div className="mt-3">
            <Link to="/blocked" className="text-[11px] text-accent underline">Manage blocked users</Link>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="PROFILE">
      <section className="px-5 pt-6 pb-4 text-center">
        <div className="mx-auto h-24 w-24 rounded-full border-2 border-primary/60 bg-card overflow-hidden grid place-items-center">
          {p.avatar_url
            ? <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
            : <Crown className="h-8 w-8 text-primary" />}
        </div>
        <h1 className="mt-3 text-2xl font-bold flex items-center justify-center gap-2">
          {displayName}
          {p.verification_status === "verified" && <VerifiedStudentBadge size="xs" iconOnly />}
        </h1>
        <div className="mt-2 flex justify-center">
          <PlugScoreBadge profile={p} />
        </div>
        {p.username && <p className="text-xs text-muted-foreground">@{p.username}</p>}

        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
          {p.school_name && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border text-muted-foreground">
              <MapPin className="h-3 w-3" /> {p.school_name}
            </span>
          )}
          {(p.graduation_year || p.year) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border text-muted-foreground">
              <GraduationCap className="h-3 w-3" /> {p.graduation_year ?? p.year}
            </span>
          )}
          <span className={`px-3 py-1 rounded-full border ${isAlumni ? "border-accent/40 text-accent" : "border-primary/40 text-primary"}`}>
            {isAlumni ? "Alumni" : "Current student"}
          </span>
        </div>

        {p.bio && <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">{p.bio}</p>}

        {!isSelf && (
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={() => meId ? setReportOpen(true) : requestAuthentication()} className="tap inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] border border-accent/40 text-accent bg-accent/5">
              <Flag className="h-3 w-3"/> Report
            </button>
            <button onClick={() => meId ? setConfirmBlock(true) : requestAuthentication()} disabled={blocking} className="tap inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] border border-destructive/40 text-destructive bg-destructive/5 disabled:opacity-60">
              <Ban className="h-3 w-3"/> {blocking ? "Blocking…" : "Block"}
            </button>
          </div>
        )}
      </section>

      <section className="px-5">
        <div className="grid grid-cols-3 rounded-2xl border border-border bg-card divide-x divide-border">
          <Stat icon={Star} value={p.rating_count > 0 ? p.rating_avg.toFixed(1) : "—"} label={`Rating (${p.rating_count})`} />
          <Stat icon={ShoppingBag} value={p.completed_transactions} label="Deals done" />
          <Stat value={joined.toLocaleDateString(undefined, { month: "short", year: "numeric" })} label="Joined" />
        </div>
      </section>

      <section className="px-5 mt-6 pb-10">
        <p className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground mb-2">Verified reviews</p>
        <ReviewsList userId={p.id} />
      </section>

      {confirmBlock && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setConfirmBlock(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 text-left">
            <h3 className="text-base font-bold">Block {displayName}?</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              You won't see their listings, posts, comments, events, reviews or messages anywhere in
              PlugU, and neither of you can contact the other. Unblock any time in
              Settings → Privacy &amp; Safety → Blocked users.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmBlock(false)} className="tap rounded-2xl border border-border bg-secondary py-3 text-sm">Cancel</button>
              <button onClick={onBlock} disabled={blocking} className="tap rounded-2xl bg-destructive py-3 text-sm font-semibold text-destructive-foreground disabled:opacity-60">
                {blocking ? "Blocking…" : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} targetType="user" targetId={p.id} targetLabel={displayName} reportedUserId={p.id} />
    </AppShell>
  );
}

function Stat({ icon: Icon, value, label }: { icon?: typeof Star; value: string | number; label: string }) {
  return (
    <div className="py-4 text-center">
      <p className="font-bold flex items-center justify-center gap-1">
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}