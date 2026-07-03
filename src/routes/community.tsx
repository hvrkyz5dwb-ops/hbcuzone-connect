import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Users, Ban, ShieldAlert, HeartHandshake, MapPin, Flag } from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Guidelines — PlugU" },
      { name: "description", content: "How students treat each other on PlugU." },
    ],
  }),
  component: Community,
});

const rules = [
  { icon: Users, title: "Respect other students", body: "Treat everyone with dignity. PlugU is a shared campus space." },
  { icon: Ban, title: "No scams", body: "Don't misrepresent items, prices, availability, or identity." },
  { icon: ShieldAlert, title: "No counterfeit goods", body: "Only list authentic products and honest services." },
  { icon: HeartHandshake, title: "No hate speech or harassment", body: "Zero tolerance for slurs, threats, discrimination, or targeted harassment." },
  { icon: Ban, title: "No illegal items", body: "Weapons, drugs, stolen goods, and academic dishonesty services are banned." },
  { icon: MapPin, title: "Meet safely", body: "When meeting up, choose public, well-lit campus locations. Bring a friend when you can." },
  { icon: Flag, title: "Report suspicious behavior", body: "Use the Report button on listings and messages. Our team reviews every report." },
];

function Community() {
  return (
    <AppShell title="COMMUNITY">
      <article className="max-w-2xl mx-auto px-5 py-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>Community Guidelines</h1>
          <p className="mt-1 text-sm text-white/70">Plain-language rules for how we treat each other on PlugU. These sit alongside our Terms of Service.</p>
        </header>
        <ul className="grid gap-2">
          {rules.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-2xl border border-border bg-card p-4 flex gap-3">
              <div className="h-9 w-9 grid place-items-center rounded-xl bg-[image:var(--gradient-bronze)] text-primary-foreground shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{body}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-white/50">Repeated or severe violations can result in permanent removal from PlugU.</p>
      </article>
    </AppShell>
  );
}