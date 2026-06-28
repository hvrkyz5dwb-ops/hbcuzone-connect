import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Map, MessageSquare, User, Store, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import pluguLogo from "@/assets/plugu-logo.png";

type Tab = { to: string; label: string; icon: LucideIcon };

const tabs: Tab[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/market", label: "Market", icon: Store },
  { to: "/map", label: "Map", icon: Map },
  { to: "/messages", label: "Inbox", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md min-h-screen flex flex-col relative pb-28">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-2">
            <img src={pluguLogo} alt="PlugU" className="h-7 w-7 object-contain" width={28} height={28} />
            <span className="font-bold tracking-[0.2em] text-sm">{title ?? "PLUGU"}</span>
          </div>
          <Link
            to="/hbcus"
            className="text-[10px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          >
            HBCUS
          </Link>
        </header>

        <main className="flex-1">{children}</main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40">
          <div className="mx-3 mb-3 rounded-3xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-[var(--shadow-elegant)]">
            <ul className="grid grid-cols-5 items-end px-2 py-2 relative">
              {tabs.map((t, idx) => {
                const Icon = t.icon;
                const active = pathname === t.to;
                const isMiddle = idx === 2;
                if (isMiddle) {
                  // center plug button
                  return (
                    <li key={t.to} className="flex justify-center">
                      <Link
                        to={t.to}
                        className="-mt-7 grid place-items-center w-14 h-14 rounded-full border border-primary/40 bg-[image:var(--gradient-bronze)] shadow-[var(--shadow-glow)]"
                        aria-label={t.label}
                      >
                        <img src={pluguLogo} alt="" className="h-9 w-9 object-contain" />
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={t.to} className="flex justify-center">
                    <Link
                      to={t.to}
                      className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] tracking-wide transition-colors ${
                        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.75} />
                      <span>{t.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-end justify-between mb-3 px-5">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {action && <button className="text-xs text-primary">{action}</button>}
    </div>
  );
}