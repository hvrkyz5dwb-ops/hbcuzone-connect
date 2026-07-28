import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { SupportForm } from "@/components/SupportForm";
import { fetchMySupportRequests, SUPPORT_CATEGORIES, type SupportCategory } from "@/lib/support-db";
import { useSession } from "@/hooks/use-session";
import { Link } from "@tanstack/react-router";

type Search = { category?: SupportCategory; subject?: string; orderId?: string; listingId?: string };

export const Route = createFileRoute("/support")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: (s.category as SupportCategory) || undefined,
    subject: typeof s.subject === "string" ? s.subject : undefined,
    orderId: typeof s.orderId === "string" ? s.orderId : undefined,
    listingId: typeof s.listingId === "string" ? s.listingId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contact Support — PlugU" },
      { name: "description", content: "Get help from the PlugU team. Report a problem, ask a question, or request account changes." },
      { property: "og:title", content: "PlugU Support" },
      { property: "og:description", content: "Contact PlugU support and track your open requests." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const search = useSearch({ from: "/support" });
  const { session } = useSession();
  const { data: history = [], refetch, isLoading } = useQuery({
    queryKey: ["support-requests", session?.user?.id ?? "anon"],
    queryFn: fetchMySupportRequests,
    enabled: !!session?.user?.id,
  });

  return (
    <AppShell title="SUPPORT">
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>Contact support</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            The PlugU team reviews every request. Include any order or listing ID so we can help faster.
          </p>
        </header>

        {!session ? (
          <div className="rounded-2xl border border-border bg-card p-5 text-sm">
            <p>Please <Link to="/auth" className="underline text-accent">sign in</Link> to send a support request. It links the request to your verified student account.</p>
          </div>
        ) : (
          <SupportForm
            defaultCategory={search.category ?? "general"}
            defaultSubject={search.subject ?? ""}
            defaultOrderId={search.orderId ?? ""}
            defaultListingId={search.listingId ?? ""}
            onSubmitted={() => refetch()}
          />
        )}

        <section>
          <h2 className="text-base font-semibold">Your requests</h2>
          {isLoading ? (
            <p className="mt-3 text-xs text-muted-foreground">Loading…</p>
          ) : history.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">You haven't opened any support requests yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {history.map((r) => (
                <li key={r.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold truncate">{r.subject}</p>
                    <StatusPill status={r.status} />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {(SUPPORT_CATEGORIES.find((c) => c.key === r.category)?.label ?? r.category)} · #{r.id.slice(0, 8)} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-xs text-white/70 whitespace-pre-wrap line-clamp-4">{r.description}</p>
                  {r.admin_note && (
                    <p className="mt-2 text-xs text-emerald-300/90">Team reply: {r.admin_note}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-accent/15 text-accent border-accent/30",
    in_progress: "bg-[var(--plugu-purple)]/15 text-[var(--plugu-purple)] border-[var(--plugu-purple)]/30",
    resolved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    closed: "bg-secondary text-muted-foreground border-border",
  };
  return (
    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border ${map[status] ?? map.closed}`}>
      {status.replace("_", " ")}
    </span>
  );
}