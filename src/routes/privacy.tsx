import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — PlugU" },
      { name: "description", content: "How PlugU collects, uses, and protects student data." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <AppShell title="PRIVACY POLICY">
      <article className="max-w-2xl mx-auto px-5 py-6 text-sm text-white/80 space-y-5">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>Privacy Policy</h1>
          <p className="text-xs text-white/50 mt-1">Maintained by PlugU. Last updated: {new Date().toLocaleDateString()}.</p>
          <p className="text-xs text-white/50">This is app-owned editable content, not a certification or legal opinion.</p>
        </header>

        <Section title="What we collect">
          Account details you provide (name, school, year, major), your verified school email and domain, listings and messages you create, approximate location if you enable the live map, device and log data needed for reliability, and payment-related information handled by our payment processor.
        </Section>
        <Section title="Why we collect it">
          To verify you are a student, run the marketplace and messaging, show you a campus-relevant feed and map, prevent fraud and abuse, process transactions, and improve the product.
        </Section>
        <Section title="How we use it">
          We use your data to operate PlugU, personalize your campus experience, communicate with you, enforce our Terms and Community Guidelines, and comply with legal obligations.
        </Section>
        <Section title="Who receives it">
          Service providers acting on our behalf, including Stripe for payments, our authentication and hosting providers, and analytics tools used to keep PlugU reliable. We do not sell your personal data.
        </Section>
        <Section title="Your rights">
          You can request access, correction, export, or deletion of your account data by contacting support in the app. You can also delete your account from Settings; some records are retained where required by law or to prevent fraud.
        </Section>
        <Section title="Security">
          We use industry-standard technical and organizational safeguards. No system is perfectly secure — report any suspected vulnerability to support.
        </Section>
        <Section title="Children">
          PlugU is not directed to users under 13, and users under 18 must have any required parental or guardian consent.
        </Section>
        <Section title="Changes">
          We will update this page when practices change. Continued use of PlugU after an update means you accept the revised policy.
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