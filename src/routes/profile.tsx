import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Settings, BadgeCheck, Heart, ListOrdered, CreditCard, ChevronRight, ShieldAlert, Sparkles, Receipt, ShieldCheck, Store, Briefcase, Trophy, Scale, PlayCircle } from "lucide-react";
import { replayPluguIntro } from "@/components/FirstTimeIntro";
import { VerifiedStudentBadge } from "@/components/VerifiedStudentBadge";
import { getStudent } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { SellerReputation } from "@/components/SellerReputation";
import pluguLogo from "@/assets/plugu-logo.png";
import { listings } from "@/lib/mock-data";
import statue from "@/assets/plugu-statue.jpg.asset.json";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — PlugU" },
      { name: "description", content: "Your PlugU profile, listings, saved items, payments, and settings." },
      { property: "og:title", content: "PlugU Profile" },
      { property: "og:description", content: "Your campus profile." },
    ],
  }),
  component: Profile,
});

const menu: { label: string; icon: typeof Heart; to: string }[] = [
  { label: "Plug Business Center", icon: Store, to: "/business" },
  { label: "Campus Economy", icon: Trophy, to: "/economy" },
  { label: "Career & Money Hub", icon: Briefcase, to: "/hub" },
  { label: "Upgrade to KingPin", icon: Sparkles, to: "/upgrade" },
  { label: "Manage Plan", icon: CreditCard, to: "/manage-plan" },
  { label: "Payment History", icon: Receipt, to: "/payment-history" },
  { label: "My Listings", icon: ListOrdered, to: "/market" },
  { label: "Saved", icon: Heart, to: "/saved" },
  { label: "Trust Center", icon: Scale, to: "/trust" },
  { label: "Safety & Tools", icon: ShieldAlert, to: "/safety" },
  { label: "Admin", icon: ShieldCheck, to: "/admin" },
  { label: "Settings", icon: Settings, to: "/profile" },
];

function Profile() {
  const student = typeof window !== "undefined" ? getStudent() : null;
  const displayName = student?.name ?? "Kingpin";
  const subline = student
    ? `${student.school} · ${student.year} · ${student.major}`
    : "Talladega College · Junior · Business";
  return (
    <AppShell title="PROFILE">
      {/* Cover photo */}
      <section className="relative">
        <div className="relative h-32 overflow-hidden">
          <img src={statue.url} alt="cover" className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background" />
        </div>
      </section>
      <section className="px-5 -mt-12 text-center relative">
        <div className="mx-auto h-24 w-24 rounded-full border-2 border-primary/60 bg-card grid place-items-center shadow-[var(--shadow-glow)]">
          <img src={pluguLogo} alt="Kingpin avatar" className="h-16 w-16 object-contain" />
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
          {displayName} <Crown className="h-5 w-5 text-accent" />
          <VerifiedStudentBadge size="xs" iconOnly />
        </h1>
        <p className="text-sm text-muted-foreground">{subline}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
          <VerifiedStudentBadge size="sm" />
          <span className="inline-flex items-center gap-1 text-[11px] tracking-wider uppercase px-3 py-1 rounded-full border border-accent/40 text-accent">
            <BadgeCheck className="h-3.5 w-3.5" /> Kingpin
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground max-w-xs mx-auto">
          Plug for the culture. Vendor connect, event promoter, and student of the game.
        </p>
      </section>

      {/* Skills & interests */}
      <section className="mt-4 px-5">
        <h2 className="text-sm font-semibold tracking-tight mb-2">Skills & Interests</h2>
        <div className="flex flex-wrap gap-2">
          {["Branding", "Event Promo", "Photography", "Sales", "Marketing", "Entrepreneurship"].map((s) => (
            <span key={s} className="text-[11px] px-3 py-1.5 rounded-full bg-card border border-border text-foreground/80">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-5 px-5">
        <div className="grid grid-cols-3 rounded-2xl bg-card border border-border divide-x divide-border">
          {[
            { n: "42", l: "Posts" },
            { n: "1.2K", l: "Followers" },
            { n: "380", l: "Following" },
          ].map((s) => (
            <div key={s.l} className="py-4 text-center">
              <p className="font-bold">{s.n}</p>
              <p className="text-[11px] text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 px-5">
        <ul className="rounded-2xl bg-card border border-border divide-y divide-border">
          {menu.map((m) => {
            const Icon = m.icon;
            return (
              <li key={m.label}>
                <Link to={m.to as "/upgrade"} className="w-full flex items-center gap-3 px-4 py-4 text-sm">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="flex-1 text-left">{m.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <SellerReputation />

      <section className="mt-6 px-5">
        <button
          onClick={replayPluguIntro}
          className="w-full flex items-center gap-3 px-4 py-4 text-sm rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors"
        >
          <PlayCircle className="h-4 w-4 text-primary" />
          <span className="flex-1 text-left">Replay PlugU Intro</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </section>

      <section className="mt-6 px-5 pb-4">
        <h2 className="text-sm font-semibold tracking-tight mb-3">My Listings</h2>
        <div className="grid grid-cols-3 gap-2">
          {listings.slice(0, 6).map((l) => (
            <div key={l.id} className="aspect-square rounded-xl overflow-hidden border border-border bg-secondary">
              <img src={l.image} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}