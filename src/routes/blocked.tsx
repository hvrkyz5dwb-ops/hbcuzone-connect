import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Ban, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { fetchBlockedUsers, unblockUser } from "@/lib/moderation";
import { useRefreshBlocklist } from "@/hooks/use-blocklist";

export const Route = createFileRoute("/blocked")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Blocked Users — PlugU" },
      { name: "description", content: "Review the accounts you've blocked on PlugU and unblock them at any time." },
      { property: "og:title", content: "Blocked Users — PlugU" },
      { property: "og:description", content: "Manage the accounts you've blocked on PlugU." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BlockedPage,
});

function BlockedPage() {
  const refresh = useRefreshBlocklist();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{ id: string; label: string } | null>(null);
  const q = useQuery({ queryKey: ["blocked-users"], queryFn: fetchBlockedUsers });

  const unblock = async (id: string, label: string) => {
    setBusyId(id);
    setConfirming(null);
    try {
      await unblockUser(id);
      await q.refetch();
      refresh();
      toast.success(`Unblocked ${label}`);
    } catch (e) {
      toast.error("Couldn't unblock", { description: (e as Error).message });
    } finally {
      setBusyId(null);
    }
  };


  return (
    <AppShell title="BLOCKED">
      <section className="px-5 pt-5">
        <h1 className="text-2xl font-bold tracking-tight">Blocked users</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Blocked accounts can't message you or see your activity, and their posts, listings,
          comments and events are hidden from you everywhere in PlugU.
        </p>

        {q.isPending ? (
          <div className="mt-10 grid place-items-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (q.data ?? []).length === 0 ? (
          <div className="mt-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-border bg-card">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-3 text-sm font-semibold">You haven't blocked anyone</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use the ⋮ menu on any post, listing, comment, review, message or profile to block or report.
            </p>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
            {(q.data ?? []).map((u) => {
              const label = u.display_name || (u.username ? `@${u.username}` : "PlugU member");
              return (
                <li key={u.user_id} className="flex items-center gap-3 px-4 py-4">
                  <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-border bg-secondary">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Ban className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Blocked {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => unblock(u.user_id, label)}
                    disabled={busyId === u.user_id}
                    className="tap inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-2 text-xs font-semibold disabled:opacity-60"
                  >
                    {busyId === u.user_id && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Unblock
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-6 text-[11px] text-muted-foreground">
          Need help with a specific account?{" "}
          <Link to="/support" className="text-accent underline">Contact support</Link>.
        </p>
      </section>
    </AppShell>
  );
}
