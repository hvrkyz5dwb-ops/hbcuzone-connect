import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home, Map, MessageSquare, User, Store, Sun, Moon,
  Sparkles, X, Plus, Scissors, Megaphone, LayoutDashboard,
  Bell, type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import pluguLogo from "@/assets/plugu-charger-mark.png";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/use-theme";
import { SplashScreen } from "@/components/SplashScreen";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { AchievementBurst } from "@/components/AchievementBurst";
import { useNotifications } from "@/hooks/use-notifications";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { useKeyboardOffset } from "@/hooks/use-keyboard-offset";
import { useUnreadCount } from "@/hooks/use-messages";
import { useMyBusiness } from "@/hooks/use-business";
import { isHbcuDomain, getDomain } from "@/lib/auth";

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
  try {
    if (window.sessionStorage.getItem(PLAYED_KEY)) return false;
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

type QuickAction = { to: string; label: string; icon: LucideIcon; hint: string };

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [plugOpen, setPlugOpen] = useState(false);
  // Tap the "P" for the Campus Hub; hold it for seller quick actions.
  const pressTimer = useRef<number | null>(null);
  const longPress = useRef(false);
  const { unread } = useNotifications();
  const inboxUnread = useUnreadCount();
  const { session, loading: sessionLoading } = useSession();
  const { profile } = useProfile();
  const { business } = useMyBusiness();
  const keyboardOffset = useKeyboardOffset();
  const isSeller = !!business && business.is_active && business.onboarding_step >= 5;
  const hasDraftBusiness = !!business && !isSeller;

  // Only surface actions the current user can actually use.
  const quickActions: QuickAction[] = [];
  if (isSeller) {
    quickActions.push({
      to: "/seller/listings", label: "Create listing", icon: Plus,
      hint: "Post something to sell on your campus market.",
    });
    quickActions.push({
      to: "/seller/listings", label: "Offer a service", icon: Scissors,
      hint: "Haircuts, nails, tutoring, rides — book by the slot.",
    });
    quickActions.push({
      to: "/promote", label: "Promote an event", icon: Megaphone,
      hint: "Pin it to the campus map. Boost to feature it.",
    });
    quickActions.push({
      to: "/seller", label: "Open seller dashboard", icon: LayoutDashboard,
      hint: "Listings, orders, payouts, analytics.",
    });
  } else if (hasDraftBusiness) {
    quickActions.push({
      to: "/seller/onboarding", label: "Finish seller setup", icon: Sparkles,
      hint: `Step ${business!.onboarding_step}/5 — get approved to sell.`,
    });
    quickActions.push({
      to: "/promote", label: "Promote an event", icon: Megaphone,
      hint: "You can promote events without being a full seller.",
    });
  } else {
    quickActions.push({
      to: "/seller/onboarding", label: "Become a Plug", icon: Sparkles,
      hint: "Set up your business to unlock listings & services.",
    });
    quickActions.push({
      to: "/promote", label: "Promote an event", icon: Megaphone,
      hint: "Pin it to the campus map. Boost to feature it.",
    });
  }
  // AI-style HBCU detection: trust the stored flag, but always re-derive from
  // the verified school domain / email so returning students who signed up
  // before the flag existed still see HBCUS. Any @<hbcu>.edu qualifies.
  const emailDomain =
    profile?.school_domain?.toLowerCase() ||
    (profile?.email ? getDomain(profile.email) : null) ||
    (session?.user?.email ? getDomain(session.user.email) : null);
  const hbcuStudent =
    !!profile?.is_hbcu_student || (!!emailDomain && isHbcuDomain(emailDomain));

  // Splash plays after auth is known and only when a student is signed in.
  const [showSplash, setShowSplash] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  useEffect(() => {
    if (sessionLoading || !session) return;
    if (!shouldPlaySplash()) return;
    markSplashPlayed();
    setShowSplash(true);
  }, [sessionLoading, session]);

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
    if (sessionLoading) return;
    // Public surfaces that anyone can see. Everything else requires a session.
    const publicRoutes = ["/", "/auth", "/reset-password", "/onboarding", "/terms", "/privacy"];
    const isPublic =
      publicRoutes.includes(pathname) ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/.");
    if (!session && !isPublic) {
      navigate({ to: "/auth", search: { next: pathname, mode: "" } });
      return;
    }
    if (session && pathname !== "/onboarding") {
      try {
        if (!window.localStorage.getItem("plugu.onboarded")) {
          window.localStorage.setItem("plugu.onboarded", "1");
          navigate({ to: "/onboarding" });
        }
      } catch {}
    }
  }, [pathname, session, sessionLoading, navigate]);

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
            <Link
              to="/hbcus"
              className="tap text-[11px] font-black tracking-[0.22em] transition-colors"
              aria-label={hbcuStudent ? "Open HBCUS — exclusive HBCU network" : "HBCUS — HBCU students only"}
            >
              <span className="text-muted-foreground">HBC</span>
              <span className={hbcuStudent ? "plugu-us-silver" : "text-muted-foreground/70"}>US</span>
            </Link>
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
            className="mx-3 rounded-[28px] border border-white/10 shadow-[var(--shadow-elegant)]"
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
                        onClick={() => { if (longPress.current) { longPress.current = false; return; } navigate({ to: "/campus" }); }}
                        onPointerDown={() => {
                          longPress.current = false;
                          pressTimer.current = window.setTimeout(() => { longPress.current = true; setPlugOpen(true); }, 500);
                        }}
                        onPointerUp={() => { if (pressTimer.current) window.clearTimeout(pressTimer.current); }}
                        onPointerLeave={() => { if (pressTimer.current) window.clearTimeout(pressTimer.current); }}
                        className="tap plugu-breathe -mt-8 grid place-items-center w-16 h-16 rounded-full relative overflow-hidden"
                        style={{
                          background: "radial-gradient(circle at 30% 25%, #1c1c1c 0%, #0a0a0a 60%, #000 100%)",
                          border: "1px solid color-mix(in oklab, var(--plugu-gold) 65%, transparent)",
                        }}
                        aria-label="Open Campus Hub — hold for quick actions"
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
                      <span className="relative">
                        <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.75} />
                        {t.label === "Inbox" && inboxUnread > 0 && (
                          <span
                            className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 grid place-items-center rounded-full text-[9px] font-bold text-black"
                            style={{ background: "var(--plugu-gold)" }}
                          >
                            {inboxUnread > 9 ? "9+" : inboxUnread}
                          </span>
                        )}
                      </span>
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
                <h3 className="text-lg font-bold">Quick actions</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isSeller ? "You're set up as a seller." : hasDraftBusiness ? "Finish setup to unlock listings." : "Become a Plug to start selling."}
                </p>
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
      {showSplash && (
        <SplashScreen
          onDone={() => {
            setShowSplash(false);
            // Right after account creation, greet once the zoom-through lands.
            try {
              if (window.localStorage.getItem("plugu.welcome.pending")) {
                window.localStorage.removeItem("plugu.welcome.pending");
                setShowWelcome(true);
              }
            } catch {}
          }}
        />
      )}
      {showWelcome && <WelcomeOverlay onDone={() => setShowWelcome(false)} />}
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