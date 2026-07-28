import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refund & Dispute Policy — PlugU" },
      { name: "description", content: "How refunds and disputes work on PlugU." },
    ],
  }),
  component: Refunds,
});

function Refunds() {
  return (
    <AppShell title="REFUNDS & DISPUTES">
      <article className="max-w-2xl mx-auto px-5 py-6 text-sm text-white/80 space-y-5">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>Refund & Dispute Policy</h1>
          <p className="text-xs text-white/50 mt-1">Maintained by PlugU. Last updated: {new Date().toLocaleDateString()}.</p>
          <p className="text-xs text-amber-300/80 mt-1">Placeholder — final attorney-reviewed policy is still pending. This copy is not attorney approved.</p>
        </header>

        <Section title="PlugU is not the seller">
          Listings on PlugU are posted by other students. PlugU does not manufacture, inspect, own, or guarantee any product or service. Every transaction is between the buyer and seller.
        </Section>
        <Section title="Refunds">
          Refunds are determined by the seller, unless a specific PlugU buyer-protection program is offered on the listing. Contact the seller first through in-app messages.
        </Section>
        <Section title="Reporting a scam">
          If you believe a listing or user is fraudulent, use the Report button on the listing or message. Include screenshots and any receipts. Reports are reviewed by our Trust & Safety team.
        </Section>
        <Section title="Consequences of violations">
          Repeated violations can result in listing removal, account suspension, or permanent removal from PlugU.
        </Section>
        <Section title="Subscriptions">
          Seller plans and boosts are billed on the cycle you select and are non-refundable except where required by law. See <Link to="/terms" className="underline text-accent">Terms of Service</Link>.
        </Section>
      </article>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-1 leading-relaxed">{children}</p>
    </section>
  );
}