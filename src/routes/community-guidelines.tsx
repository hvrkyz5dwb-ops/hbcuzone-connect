import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, AlertTriangle, Ban, MessageCircle, UserX } from "lucide-react";

export const Route = createFileRoute("/community-guidelines")({
  head: () => ({
    meta: [
      { title: "Community Guidelines — PlugU" },
      { name: "description", content: "PlugU community guidelines and prohibited items policy." },
    ],
  }),
  component: CommunityGuidelinesPage,
});

function CommunityGuidelinesPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Community Guidelines</h1>
            <p className="text-xs text-muted-foreground">Keeping PlugU safe, trusted, and student-first.</p>
          </div>
        </div>

        <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            PlugU is a students-only marketplace and campus utility built to help verified students buy, sell, connect,
            and thrive. Everyone on PlugU must follow these guidelines. Violations may result in warnings, temporary
            suspension, or permanent removal of your account.
          </p>

          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-destructive">
              <Ban className="h-4 w-4" />
              <h2 className="font-semibold">Prohibited items & activity</h2>
            </div>
            <p className="mb-2">PlugU strictly prohibits the sale, purchase, distribution, or advertisement of:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Illegal drugs, controlled substances, drug paraphernalia, or counterfeit medication</li>
              <li>Weapons, firearms, ammunition, explosives, or dangerous materials</li>
              <li>Stolen goods, counterfeit items, or fraudulent services</li>
              <li>Academic cheating services, fake IDs, or credentials</li>
              <li>Any item or body text illegal under local, state, or federal law</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-4 w-4" />
              <h2 className="font-semibold">Respect & safety</h2>
            </div>
            <ul className="list-disc space-y-1 pl-5">
              <li>Do not harass, threaten, discriminate against, or impersonate other students.</li>
              <li>Do not share private information about others without consent.</li>
              <li>Keep transactions honest — misrepresented items or scams result in bans.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-foreground">
              <MessageCircle className="h-4 w-4" />
              <h2 className="font-semibold">Community posts</h2>
            </div>
            <p>
              Campus posts should be helpful, hype, or relevant to your school. Spam, hate speech, threats, or
              off-topic promotion may be removed. Use the visibility controls to keep sensitive updates campus-only.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-foreground">
              <UserX className="h-4 w-4" />
              <h2 className="font-semibold">Enforcement</h2>
            </div>
            <p>
              PlugU reserves the right to remove content, suspend accounts, and report illegal activity to campus
              authorities or law enforcement when necessary. If you see something that violates these guidelines,
              please report it immediately.
            </p>
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Link to="/terms" className="text-xs text-primary underline">
            Read Terms of Service
          </Link>
          <Link to="/privacy" className="text-xs text-primary underline">
            Read Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
