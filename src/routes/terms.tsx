import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — PlugU" },
      { name: "description", content: "The legal agreement between PlugU and its student users." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <AppShell title="TERMS OF SERVICE">
      <article className="prose-invert max-w-2xl mx-auto px-5 py-6 text-sm text-white/80 space-y-5">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>Terms of Service</h1>
          <p className="text-xs text-muted-foreground mt-1">Maintained by PlugU. Last updated: {new Date().toLocaleDateString()}.</p>
          <p className="text-xs text-muted-foreground">PlugU may update these Terms; continued use means you accept the changes. Questions? Contact us from Settings &rarr; Contact support.</p>
        </header>

        <Section title="1. Eligibility">
          You must be at least 18 years old, or have any required parental or guardian consent, and be enrolled at or affiliated with a recognized college or university with a valid .edu email to create an account.
        </Section>
        <Section title="2. Your account & conduct">
          You are responsible for your listings, transactions, communications, and conduct on PlugU. Keep your credentials private and provide accurate information. Impersonation, fraud, harassment, and misuse of school credentials are prohibited and can result in permanent removal.
        </Section>
        <Section title="3. Prohibited items & services">
          You may not list, sell, or promote: weapons, controlled substances, counterfeit goods, academic dishonesty services, stolen goods, adult content, alcohol or tobacco sales, live animals, or anything unlawful in your jurisdiction or on your campus.
        </Section>
        <Section title="4. Marketplace disclaimer">
          PlugU is a platform that connects students. PlugU does not manufacture, inspect, own, or guarantee any product or service listed by users. Transactions are between the buyer and seller.
        </Section>
        <Section title="5. Suspension & termination">
          PlugU may suspend or terminate any account for violations of these Terms, our Community Guidelines, or applicable law, with or without notice.
        </Section>
        <Section title="6. Subscriptions & payments">
          Optional paid features (seller plans, boosts) are billed on the cycle you select. Fees are non-refundable except where required by law. You can cancel at any time from Manage Plan; access continues through the end of the paid period.
        </Section>
        <Section title="7. Dispute process">
          Disputes about a listing, transaction, or user should first be addressed directly with the other party. If unresolved, submit a report through the listing or message. See our <Link to="/refunds" className="underline text-accent">Refund & Dispute Policy</Link>.
        </Section>
        <Section title="8. Limitation of liability">
          To the fullest extent permitted by law, PlugU is provided "as is" without warranties of any kind. PlugU is not liable for indirect, incidental, or consequential damages, or for the acts of third parties, including other users.
        </Section>
        <Section title="9. Contact">
          Questions about these Terms can be sent through the in-app support form.
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