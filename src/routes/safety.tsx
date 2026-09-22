import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Ban, FileText, HeartHandshake, Mail, MapPin, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useSession } from "@/hooks/use-session";
import { requestAuthentication } from "@/components/RequireAuthPrompt";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety Center — PlugU" },
      { name: "description", content: "PlugU safety tools, reporting, blocking, community standards, and support." },
    ],
  }),
  component: SafetyCenter,
});

function SafetyCenter() {
  const { session } = useSession();
  return (
    <AppShell title="SAFETY CENTER">
      <section className="px-5 pt-6 pb-8">
        <div className="rounded-3xl border border-primary/35 bg-primary/5 p-5">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="mt-3 text-xl font-bold">Your safety comes first</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            PlugU combines school-email verification, content moderation, reporting, and blocking to support safer campus commerce.
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <SafetyCard icon={FileText} title="Report content" body="Open the menu on a listing, profile, message, or community post and choose Report. Reports are reviewed by PlugU’s moderation team." />
          <SafetyCard icon={Ban} title="Block a user" body="Blocking hides that person’s content and prevents contact. You can review blocked accounts from Settings at any time." />
          <SafetyCard icon={HeartHandshake} title="Meet and trade safely" body="Meet in a public campus location, inspect items before accepting them, and keep communication inside PlugU." />
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link to="/community-guidelines" className="tap inline-flex min-h-11 items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold">
            Community Guidelines
          </Link>
          <Link to="/prohibited-items" className="tap inline-flex min-h-11 items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold">
            Prohibited Items
          </Link>
          <Link
            to="/blocked"
            onClick={(event) => { if (!session) { event.preventDefault(); requestAuthentication(); } }}
            className="tap inline-flex min-h-11 items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
          >
            Manage Blocked Users
          </Link>
          <Link to="/support" className="tap inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-semibold">
            <Mail className="h-4 w-4" /> Contact Support
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-destructive/35 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <h2 className="text-sm font-semibold">Emergency help</h2>
              <p className="mt-1 text-xs text-muted-foreground">If anyone is in immediate danger, call 911 or your campus public-safety department.</p>
            </div>
          </div>
          <a href="tel:911" className="tap mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-bold text-destructive-foreground">
            <MapPin className="h-4 w-4" /> Call 911
          </a>
        </div>
      </section>
    </AppShell>
  );
}

function SafetyCard({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">{title}</h2></div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}