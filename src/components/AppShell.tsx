import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home, Map, MessageSquare, User, Store, Sun, Moon,
  Plug, Sparkles, Briefcase, Building2, ShieldAlert, X, Trophy,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import pluguLogo from "@/assets/plugu-logo.png";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/use-theme";
import { SplashScreen } from "@/components/SplashScreen";

let SPLASH_SHOWN = false;

type Tab = { to: string; label: string; icon: LucideIcon };

const tabs: Tab[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/market", label: "Market", icon: Store },
  { to: "/map", label: "Map", icon: Map }, // center replaced by Plug button
  { to: "/messages", label: "Inbox", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
];

const quickActions: { to: string; label: string; icon: LucideIcon; hint: string }[] = [
  { to: "/business", label: "Become a Plug", icon: Building2, hint: "Sell items, food, services & more" },
  { to: "/economy", label: "Campus Economy", icon: Trophy, hint: "Live rankings, grant & wealth index" },
  { to: "/upgrade", label: "Upgrade to KingPin", icon: Sparkles, hint: "Boost listings & rep your campus" },
  { to: "/hub", label: "Career & Money Hub", icon: Briefcase, hint: "Internships, grants, side hustles" },
  { to: "/map", label: "Live Campus Map", icon: Map, hint: "What's near you, right now" },
  { to: "/safety", label: "Safety & Tools", icon: ShieldAlert, hint: "SOS, rides, lost & found" },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [plugOpen, setPlugOpen] = useState(false);
  const [showSplash] = useState(() => {
    if (typeof window === "undefined") return false;
    if (SPLASH_SHOWN) return false;
    SPLASH_SHOWN = true;
    return true;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname === "/onboarding") return;
    try {
      if (!window.localStorage.getItem("plugu.onboarded")) {
        window.localStorage.setItem("plugu.onboarded", "1");
        navigate({ to: "/onboarding" });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md min-h-screen flex flex-col relative pb-28 pb-safe">
        <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-background/75 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-2">
            <img
              src={pluguLogo}
              alt="PlugU"
              className="h-7 w-7 object-contain drop-shadow-[0_0_12px_var(--plugu-gold)]"
              width={28}
              height={28}
            />
            <span className="font-bold tracking-[0.2em] text-sm">{title ?? "PLUGU"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/hbcus"
              className="tap text-[10px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            >
              HBCUS
            </Link>
            <button
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="tap grid h-8 w-8 place-items-center rounded-full border border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main key={pathname} className="flex-1 view-enter">{children}</main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 mb-safe">
          <div className="mx-3 mb-3 rounded-3xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-[var(--shadow-elegant)]">
            <ul className="grid grid-cols-5 items-end px-2 py-2 relative">
              {tabs.map((t, idx) => {
                const Icon = t.icon;
                const active = pathname === t.to;
                const isMiddle = idx === 2;
                if (isMiddle) {
                  return (
                    <li key="plug-center" className="flex justify-center">
                      <button
                        onClick={() => setPlugOpen(true)}
                        className="tap -mt-7 grid place-items-center w-14 h-14 rounded-full border border-primary/40 bg-[image:var(--gradient-bronze)] shadow-[var(--shadow-glow)] relative"
                        aria-label="Open Plug quick actions"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full opacity-70"
                          style={{ boxShadow: "0 0 30px var(--plugu-gold)" }}
                        />
                        <Plug className="relative h-6 w-6 text-primary-foreground" />
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={t.to} className="flex justify-center">
                    <Link
                      to={t.to}
                      aria-current={active ? "page" : undefined}
                      className={`tap relative flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] tracking-wide transition-colors ${
                        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.75} />
                      <span>{t.label}</span>
                      {active && (
                        <span
                          className="absolute -bottom-0.5 h-1 w-1 rounded-full"
                          style={{ background: "var(--plugu-gold)" }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>

      {plugOpen && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Close"
            onClick={() => setPlugOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "plugu-fade-up 0.2s ease-out both" }}
          />
          <div
            role="dialog"
            aria-label="Quick actions"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border rounded-t-3xl p-5 mb-safe"
            style={{ animation: "plugu-slide-up 0.32s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: "var(--plugu-gold)" }}>The Plug</p>
                <h3 className="text-lg font-bold">What you tryna do?</h3>
              </div>
              <button
                onClick={() => setPlugOpen(false)}
                aria-label="Close"
                className="tap h-9 w-9 grid place-items-center rounded-full bg-secondary border border-border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-2">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <li key={a.to}>
                    <Link
                      to={a.to}
                      onClick={() => setPlugOpen(false)}
                      className="tap flex items-center gap-3 p-3 rounded-2xl border border-border bg-background/60 hover:border-primary/40 transition-colors"
                    >
                      <div className="h-10 w-10 grid place-items-center rounded-xl bg-[image:var(--gradient-bronze)] text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{a.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{a.hint}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <Toaster position="top-center" />
      {showSplash && <SplashScreen />}
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-end justify-between mb-3 px-5">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {action && <button className="tap text-xs text-primary">{action}</button>}
    </div>
  );
}