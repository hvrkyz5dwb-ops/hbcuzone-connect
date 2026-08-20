import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/seller-agreement")({
  head: () => ({
    meta: [
      { title: "Seller Agreement — PlugU" },
      { name: "description", content: "The rules and expectations for selling products, services, and bookings on PlugU." },
      { property: "og:title", content: "PlugU Seller Agreement" },
      { property: "og:description", content: "The rules and expectations for selling on PlugU." },
    ],
  }),
  component: SellerAgreement,
});

function SellerAgreement() {
  return (
    <AppShell title="SELLER AGREEMENT">
      <article className="max-w-2xl mx-auto px-5 py-6 text-sm text-white/80 space-y-5">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>Seller Agreement</h1>
          <p className="text-xs text-muted-foreground mt-1">Maintained by PlugU. Last updated: {new Date().toLocaleDateString()}.</p>
        </header>

        <Section title="1. Who can sell">
          You must have a verified student account and have completed seller onboarding to list products, services, or bookings on PlugU.
        </Section>
        <Section title="2. Your listings">
          You are solely responsible for what you list. Descriptions, photos, pricing, availability, and fulfillment claims must be accurate. Do not list anything covered in our <Link to="/prohibited-items" className="underline text-accent">Prohibited Items Policy</Link>.
        </Section>
        <Section title="3. Fulfilling orders">
          Ship, hand off, or perform services on the timeline promised on your listing. Communicate through PlugU messages. No-shows and repeated cancellations can lead to suspension.
        </Section>
        <Section title="4. Fees and payouts">
          PlugU charges a platform fee plus processor fees on paid transactions. Fees are shown before you accept an order. Payouts are handled by our payments partner and require completed onboarding.
        </Section>
        <Section title="5. Taxes">
          You are responsible for your own taxes, licenses, and any campus rules that apply to your activity.
        </Section>
        <Section title="6. Refunds and disputes">
          Follow our <Link to="/refunds" className="underline text-accent">Refund & Dispute Policy</Link>. PlugU may mediate disputes and, where warranted, reverse a transaction.
        </Section>
        <Section title="7. Suspension">
          PlugU may pause or terminate seller access for policy violations, fraud, safety concerns, or repeated poor reviews.
        </Section>
        <Section title="8. Changes">
          We will update this agreement over time. Continuing to sell after an update means you accept the changes.
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