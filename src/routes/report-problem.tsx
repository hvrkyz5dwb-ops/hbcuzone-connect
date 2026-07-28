import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SupportForm } from "@/components/SupportForm";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/report-problem")({
  head: () => ({
    meta: [
      { title: "Report a Problem — PlugU" },
      { name: "description", content: "Tell the PlugU team about a bug, broken screen, or something that isn't working." },
      { property: "og:title", content: "Report a problem on PlugU" },
      { property: "og:description", content: "Send bug reports and broken-experience notes to the PlugU team." },
    ],
  }),
  component: ReportProblem,
});

function ReportProblem() {
  const { session } = useSession();
  return (
    <AppShell title="REPORT A PROBLEM">
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>Report a problem</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Broken button, missing data, wrong price, unexpected error — tell us what happened. To report a user or listing, use the Report action on that profile or listing so we can act faster.
          </p>
        </header>
        {!session ? (
          <div className="rounded-2xl border border-border bg-card p-5 text-sm">
            Please <Link to="/auth" className="underline text-accent">sign in</Link> to send a report tied to your account.
          </div>
        ) : (
          <SupportForm
            defaultCategory="bug"
            lockCategory
            cta="Send bug report"
          />
        )}
      </div>
    </AppShell>
  );
}