import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { VerifiedStudentBadge } from "@/components/VerifiedStudentBadge";
import { Crown, GraduationCap, MapPin, Star, ShoppingBag, Loader2, Flag, Ban } from "lucide-react";
import { ReviewsList } from "@/components/ReviewsList";
import { ReportDialog } from "@/components/ReportDialog";
import { blockUser } from "@/lib/moderation";
import { useSession } from "@/hooks/use-session";

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
        <div className="p-8 grid place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
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

  async function onBlock() {
    if (!meId) return toast.error("Sign in to block");
    if (!confirm(`Block ${displayName}? You won't see their messages or listings.`)) return;
    setBlocking(true);
    try { await blockUser(p!.id); toast.success("User blocked"); }
    catch (err) { toast.error((err as Error).message); }
    finally { setBlocking(false); }
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

        {!isSelf && meId && (
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={() => setReportOpen(true)} className="tap inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] border border-accent/40 text-accent bg-accent/5">
              <Flag className="h-3 w-3"/> Report
            </button>
            <button onClick={onBlock} disabled={blocking} className="tap inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] border border-destructive/40 text-destructive bg-destructive/5 disabled:opacity-60">
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

      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} targetType="user" targetId={p.id} targetLabel={displayName} />
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