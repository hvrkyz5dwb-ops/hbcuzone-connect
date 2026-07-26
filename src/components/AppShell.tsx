import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home, Map, MessageSquare, User, Store, Sun, Moon,
  Sparkles, Briefcase, Building2, ShieldAlert, X, Trophy, Rocket,
  Package, BarChart3, Gift, Crown, Flame, CalendarHeart, Newspaper,
  Bell, type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import pluguLogo from "@/assets/plugu-charger-mark.png";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/use-theme";
import { SplashScreen } from "@/components/SplashScreen";
import { AchievementBurst } from "@/components/AchievementBurst";
import { isVerifiedStudent, isHbcuStudent } from "@/lib/auth";
import { useNotifications } from "@/hooks/use-notifications";

// Module-scoped flag prevents any re-mount of AppShell (internal navigation,
// layout swaps) from replaying the splash within the same JS runtime.
let SPLASH_SHOWN = false;

// Keys used to gate the splash across refreshes and tabs.
// - `PLAYED_KEY` (sessionStorage): once the splash plays in a tab, refreshing
//   that tab won't replay it. Cleared automatically when the tab closes.
// - `RECENT_KEY` (localStorage):   timestamp of the most recent play in ANY
//   tab. A second tab opened right after the first will see this and skip,
//   preventing multi-tab duplicates.
const PLAYED_KEY = "plugu.splash.playedThisSession";
const RECENT_KEY = "plugu.splash.lastPlayedAt";
const MULTI_TAB_WINDOW_MS = 15_000;

function shouldPlaySplash(): boolean {
  if (typeof window === "undefined") return false;
  if (SPLASH_SHOWN) return false;
  // Splash is a post-verification moment only. Unverified visitors get
  // routed to /login by the gate below and never see the statue.
  try {
    if (!isVerifiedStudent()) return false;
  } catch {
    return false;
  }
  try {
    // Refresh of the same tab: sessionStorage survives reload but not close.
    if (window.sessionStorage.getItem(PLAYED_KEY)) return false;
    // Multi-tab: another tab played the splash very recently — skip here.
    const recent = Number(window.localStorage.getItem(RECENT_KEY) ?? 0);
    if (recent && Date.now() - recent < MULTI_TAB_WINDOW_MS) return false;
  } catch {}
  return true;
}

function markSplashPlayed() {
  if (typeof window === "undefined") return;
  SPLASH_SHOWN = true;
  try {
    window.sessionStorage.setItem(PLAYED_KEY, "1");
    window.localStorage.setItem(RECENT_KEY, String(Date.now()));
  } catch {}
}

type Tab = { to: string; label: string; icon: LucideIcon };

const tabs: Tab[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/market", label: "Market", icon: Store },
  { to: "/map", label: "Map", icon: Map }, // center replaced by Plug button
  { to: "/messages", label: "Inbox", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
];

const quickActions: { to: string; label: string; icon: LucideIcon; hint: string }[] = [
  { to: "/daily", label: "PlugU Daily", icon: Newspaper, hint: "News, wins & culture — refreshed daily" },
  { to: "/notifications", label: "Notifications", icon: Bell, hint: "Likes, orders, rank changes & more" },
  { to: "/nationals", label: "National Competition", icon: Trophy, hint: "Live campus leaderboard & rankings" },
  { to: "/awards", label: "Year-End Awards", icon: Crown, hint: "Grants, scholarships & top businesses" },
  { to: "/heatmap", label: "Campus Heat Map", icon: Flame, hint: "Where the yard is going off" },
  { to: "/business", label: "Become a Plug", icon: Building2, hint: "Sell items, food, services & more" },
  { to: "/seller/plans", label: "Seller Plans", icon: Crown, hint: "Free · Pro · KingPin — lower your fee" },
  { to: "/seller/analytics", label: "Seller Analytics", icon: BarChart3, hint: "Views, conversions & growth" },
  { to: "/orders", label: "Orders & Disputes", icon: Package, hint: "Escrow, delivery, refunds" },
  { to: "/referrals", label: "Referral Program", icon: Gift, hint: "Your code, streak & achievements" },
  { to: "/ambassadors", label: "Campus Ambassadors", icon: Crown, hint: "Rep PlugU — merch, scholarships, perks" },
  { to: "/milestones", label: "Milestones", icon: Trophy, hint: "Shareable achievements as you grow" },
  { to: "/economy", label: "Campus Economy", icon: Trophy, hint: "Live rankings, grant & wealth index" },
  { to: "/upgrade", label: "Upgrade to KingPin", icon: Sparkles, hint: "Boost listings & rep your campus" },
  { to: "/plug-reach", label: "Plug Reach™ Promo", icon: Rocket, hint: "Launch pricing — campus to nationwide" },
  { to: "/hub", label: "Career & Money Hub", icon: Briefcase, hint: "Internships, grants, side hustles" },
  { to: "/map", label: "Live Campus Map", icon: Map, hint: "What's near you, right now" },
  { to: "/season/homecoming", label: "Seasonal Campaign", icon: CalendarHeart, hint: "Auto-changes with the season" },
  { to: "/safety", label: "Safety & Tools", icon: ShieldAlert, hint: "SOS, rides, lost & found" },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [plugOpen, setPlugOpen] = useState(false);
  const { unread } = useNotifications();
  const [showSplash] = useState(() => {
    const play = shouldPlaySplash();
    if (play) markSplashPlayed();
    return play;
  });
  // Cinematic first-time intro plays before login on brand-new devices,
  // or when replayed via ?replayIntro=1 from Settings.
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("replayIntro") === "1") return true;
    } catch {}
    // Only pre-auth: if the visitor is already verified, no intro needed.
    if (isVerifiedStudent()) return false;
    return !hasSeenIntro();
  });
  // HBCUS link is exclusive to students whose verified .edu maps to an HBCU.
  // Track it in state so the header updates when the student signs in/out.
  const [hbcuStudent, setHbcuStudent] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setHbcuStudent(isHbcuStudent());
    sync();
    window.addEventListener("plugu:student", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("plugu:student", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // If a sibling tab plays the splash while this tab is open, remember it
  // so a later refresh here doesn't replay. (No re-render needed.)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === RECENT_KEY && e.newValue) {
        try { window.sessionStorage.setItem(PLAYED_KEY, "1"); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Student-only auth gate: unauthenticated visitors get bounced to /login.
    const publicRoutes = ["/login", "/signup", "/onboarding"];
    if (!publicRoutes.includes(pathname) && !isVerifiedStudent()) {
      navigate({ to: "/login" });
      return;
    }
    if (pathname === "/onboarding") return;
    try {
      if (!window.localStorage.getItem("plugu.onboarded")) {
        window.localStorage.setItem("plugu.onboarded", "1");
        navigate({ to: "/onboarding" });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md min-h-screen flex flex-col relative pb-28 pb-safe">
        <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-background/75 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center -space-x-1">
            <img
              src={pluguLogo}
              alt="PlugU"
              className="h-8 w-8 object-contain drop-shadow-[0_0_10px_rgba(244,201,106,0.55)] relative z-10"
              width={32}
              height={32}
            />
            <span className="font-bold tracking-[0.2em] text-sm plugu-wordmark pl-1">
              {title ?? "PLUGU"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hbcuStudent && (
              <Link
                to="/hbcus"
                className="tap text-[11px] font-black tracking-[0.22em] transition-colors"
                aria-label="Open HBCUS — exclusive HBCU network"
              >
                <span className="text-muted-foreground">HBC</span>
                <span className="plugu-us-silver">US</span>
              </Link>
            )}
            <Link
              to="/notifications"
              aria-label={unread > 0 ? `${unread} new notifications` : "Notifications"}
              className="tap relative grid h-8 w-8 place-items-center rounded-full border border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold grid place-items-center text-black"
                  style={{ background: "var(--plugu-gold)", boxShadow: "0 0 8px rgba(244,201,106,0.65)" }}
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
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

        <AchievementBurst />

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 mb-safe">
          <div
            className="mx-3 mb-4 rounded-[28px] border border-white/10 shadow-[var(--shadow-elegant)]"
            style={{
              background: "linear-gradient(180deg, rgba(23,23,23,0.72), rgba(10,10,10,0.82))",
              backdropFilter: "blur(28px) saturate(160%)",
              WebkitBackdropFilter: "blur(28px) saturate(160%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 60px -24px rgba(0,0,0,0.85), 0 0 40px -20px rgba(244,201,106,0.25)",
            }}
          >
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
                        className="tap plugu-breathe -mt-8 grid place-items-center w-16 h-16 rounded-full relative overflow-hidden"
                        style={{
                          background: "radial-gradient(circle at 30% 25%, #1c1c1c 0%, #0a0a0a 60%, #000 100%)",
                          border: "1px solid color-mix(in oklab, var(--plugu-gold) 65%, transparent)",
                        }}
                        aria-label="Open Plug quick actions"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-[2px] rounded-full pointer-events-none"
                          style={{
                            background:
                              "conic-gradient(from 210deg, transparent 0deg, rgba(244,201,106,0.55) 60deg, transparent 140deg, transparent 360deg)",
                            filter: "blur(7px)",
                            opacity: 0.7,
                          }}
                        />
                        <img
                          src={pluguLogo}
                          alt=""
                          aria-hidden="true"
                          className="relative h-8 w-8 object-contain"
                          style={{
                            filter:
                              "drop-shadow(0 0 10px rgba(244,201,106,0.75)) drop-shadow(0 0 2px rgba(244,201,106,0.9))",
                          }}
                        />
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
                          className="plugu-underline absolute -bottom-1 h-[3px] w-6 rounded-full"
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
                      className="tap lift-card flex items-center gap-3 p-3.5 rounded-2xl border border-white/10 bg-background/60"
                    >
                      <div
                        className="h-11 w-11 grid place-items-center rounded-xl"
                        style={{
                          background: "linear-gradient(160deg, #1c1c1c, #0f0f0f)",
                          border: "1px solid color-mix(in oklab, var(--plugu-gold) 40%, transparent)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 18px -8px rgba(244,201,106,0.55)",
                        }}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.75} style={{ color: "var(--plugu-gold)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{a.label}</p>
                        <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">{a.hint}</p>
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
      {showIntro && <FirstTimeIntro onDone={() => setShowIntro(false)} />}
    </div>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between mb-3 px-5">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {action && (
        <button
          onClick={onAction}
          disabled={!onAction}
          className="tap text-xs text-primary disabled:opacity-60 disabled:cursor-default"
        >
          {action}
        </button>
      )}
    </div>
  );
}