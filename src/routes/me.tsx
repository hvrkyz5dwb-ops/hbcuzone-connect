// ME — one calm hub for everything personal: profile, messages, schedule,
// orders, earnings, saved items, privacy, support and settings.
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  User, MessageSquare, CalendarClock, Package, Wallet, Bookmark,
  ShieldCheck, LifeBuoy, Settings, ChevronRight, Ban, Bell, type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/hooks/use-profile";
import { useSession } from "@/hooks/use-session";
import { useUnreadCount } from "@/hooks/use-messages";

export const Route = createFileRoute("/me")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Me — Your PlugU Account" },
      { name: "description", content: "Your PlugU profile, messages, schedule, orders, earnings, saved items, privacy controls and support in one place." },
      { property: "og:title", content: "Me — Your PlugU Account" },
      { property: "og:description", content: "Profile, messages, orders, earnings, privacy and support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MePage,
});

type Item = { to: string; label: string; hint: string; icon: LucideIcon; badge?: number };

function MePage() {
  const { session } = useSession();
  const { profile } = useProfile();
  const unread = useUnreadCount();

  const groups: { title: string; items: Item[] }[] = [
    {
      title: "Your campus life",
      items: [
        { to: "/profile", label: "Profile", hint: "How other students see you", icon: User },
        { to: "/messages", label: "Messages", hint: "Buyers, sellers and orgs", icon: MessageSquare, badge: unread },
        { to: "/bookings", label: "Schedule", hint: "Upcoming bookings and appointments", icon: CalendarClock },
        { to: "/saved", label: "Saved items", hint: "Listings and places you kept", icon: Bookmark },
      ],
    },
    {
      title: "Money",
      items: [
        { to: "/orders", label: "Orders", hint: "Everything you bought or sold", icon: Package },
        { to: "/seller", label: "Seller earnings", hint: "Payouts, analytics and listings", icon: Wallet },
      ],
    },
    {
      title: "Privacy and safety",
      items: [
        { to: "/settings", label: "Privacy & Safety", hint: "Location, visibility and data", icon: ShieldCheck },
        { to: "/blocked", label: "Blocked users", hint: "Review and unblock accounts", icon: Ban },
        { to: "/notifications", label: "Notifications", hint: "Choose what PlugU can tell you", icon: Bell },
      ],
    },
    {
      title: "Help",
      items: [
        { to: "/support", label: "Support", hint: "Contact a human — no account needed", icon: LifeBuoy },
        { to: "/settings", label: "Settings", hint: "Account, theme and deletion", icon: Settings },
      ],
    },
  ];

  return (
    <AppShell title="ME">
      <section className="px-4 pt-5 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">Your PlugU</p>
        <h1 className="font-editorial mt-1 text-3xl font-bold leading-none">
          {profile?.display_name || profile?.full_name || "Your account"}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {session
            ? profile?.school_name
              ? `${profile.school_name} · ${profile.verification_status === "verified" ? "Verified student" : "Verification pending"}`
              : "Signed in"
            : "Sign in to see your orders, messages and saved items."}
        </p>

        {groups.map((g) => (
          <section key={g.title} className="mt-6" aria-labelledby={`me-${g.title}`}>
            <h2
              id={`me-${g.title}`}
             className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
            >
              {g.title}
            </h2>
             <ul className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card/80">
              {g.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={`${g.title}-${item.label}`}>
                    <Link
                      to={item.to as "/profile"}
                       className="tap flex min-h-14 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/60"
                    >
                       <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10"><Icon className="h-4 w-4 text-primary" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{item.label}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">{item.hint}</span>
                      </span>
                      {!!item.badge && item.badge > 0 && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </section>
    </AppShell>
  );
}
