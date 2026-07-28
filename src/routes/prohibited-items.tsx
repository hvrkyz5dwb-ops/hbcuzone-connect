import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PROHIBITED_ITEMS } from "@/lib/moderation";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/prohibited-items")({
  head: () => ({
    meta: [
      { title: "Prohibited Items Policy — PlugU" },
      { name: "description", content: "What you cannot list, sell, or promote on PlugU." },
      { property: "og:title", content: "PlugU Prohibited Items Policy" },
      { property: "og:description", content: "The list of items and services banned from PlugU." },
    ],
  }),
  component: Prohibited,
});

function Prohibited() {
  return (
    <AppShell title="PROHIBITED ITEMS">
      <article className="max-w-2xl mx-auto px-5 py-6 text-sm text-white/80 space-y-5">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>Prohibited Items Policy</h1>
          <p className="text-xs text-white/50 mt-1">Maintained by PlugU. Last updated: {new Date().toLocaleDateString()}.</p>
          <p className="text-xs text-amber-300/80">
            Placeholder — final attorney-reviewed policy is still pending. This copy is not attorney approved.
          </p>
        </header>

        <p>
          PlugU is a student-only marketplace. To keep campuses safe, the following items and services may not be listed, sold, booked, or promoted on PlugU. Violations can result in listing removal, account suspension, or permanent removal, and where required we will report activity to the appropriate authorities.
        </p>

        <ul className="grid grid-cols-1 gap-2">
          {PROHIBITED_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-100">
              <AlertTriangle className="h-4 w-4 text-rose-300 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-white/60">
          Not sure whether something is allowed? Ask us first through <Link to="/support" className="underline text-accent">Contact Support</Link>. See also the <Link to="/community-guidelines" className="underline text-accent">Community Guidelines</Link> and <Link to="/terms" className="underline text-accent">Terms of Service</Link>.
        </p>
      </article>
    </AppShell>
  );
}