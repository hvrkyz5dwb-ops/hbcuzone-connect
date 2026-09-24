import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home, RadioTower, User, Store, Sun, Moon,
  Sparkles, X, Plus, Scissors, Megaphone, LayoutDashboard,
  Bell, type LucideIcon, Radio, Briefcase,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import pluguLogo from "@/assets/plugu-charger-mark.png";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/use-theme";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { OnboardingExperience } from "@/components/OnboardingExperience";
import { CoachMarks } from "@/components/CoachMarks";
import { AchievementBurst } from "@/components/AchievementBurst";
import { TermsGate } from "@/components/TermsGate";
import { RealtimeStatusBar } from "@/components/RealtimeStatusBar";
import { RequireAuthPrompt, requestAuthentication } from "@/components/RequireAuthPrompt";

import { useNotifications } from "@/hooks/use-notifications";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { useKeyboardOffset } from "@/hooks/use-keyboard-offset";
import { useUnreadCount } from "@/hooks/use-messages";
import { useMyBusiness } from "@/hooks/use-business";
import { isAppReviewEmail } from "@/lib/auth";
import { useHbcusVerification } from "@/hooks/use-hbcus-verification";
import {
  hasOnboarded,
  markOnboarded,
  hasToured,
  markToured,
  consumeWelcomePending,
  setFeedStaggerPending,
  FIRST_FEED_EVENT,
} from "@/lib/first-launch";

type Tab = { to: string; label: string; icon: LucideIcon };

// Exactly five primary destinations. Everything else lives inside one of
// them — the floating "P" is an action, not a sixth tab.
const tabs: Tab[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/pulse", label: "Now", icon: RadioTower },
  { to: "/market", label: "Market", icon: Store },
  { to: "/me", label: "Me", icon: User },
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

  // Local businesses get their own hiring dashboard; students get the
  // "Businesses Hiring" board.
  const isBusinessAccount = profile?.account_type === "business";

  // Only surface actions the current user can actually use.
  const quickActions: QuickAction[] = [];
  quickActions.push({
    to: "/pulse", label: "See what's live", icon: Radio,
    hint: "Who's available now, flash drops, events tonight.",
  });
  if (isBusinessAccount) {
    quickActions.push({
      to: "/hiring/business", label: "Business dashboard", icon: LayoutDashboard,
      hint: "Verification, opportunities, applicants, find student Plugs.",
    });
  } else {
    quickActions.push({
      to: "/hiring", label: "Businesses hiring", icon: Briefcase,
      hint: "Paid gigs local businesses posted for student Plugs.",
    });
  }
  if (isSeller && !isBusinessAccount) {
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
      hint: "Pin it to the campus map — free for every student.",
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
      hint: "Pin it to the campus map — free for every student.",
    });
  }
  const { verified: hbcuStudent } = useHbcusVerification();
  const canAccessHbcus =
    hbcuStudent || isAppReviewEmail(profile?.email ?? session?.user?.email ?? "");

  // First-launch journey for signed-in members after the global cinematic:
  //   onboarding slides → coach-mark tour → welcome card.
  // Each stage is gated by its own localStorage flag so it plays exactly once.
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const beginFirstLaunch = useCallback(() => {
    if (!hasOnboarded()) {
      setShowOnboarding(true);
      return;
    }
    if (!hasToured()) {
      setShowTour(true);
      return;
    }
    if (consumeWelcomePending()) setShowWelcome(true);
  }, []);

  useEffect(() => {
    if (sessionLoading || !session) return;
    beginFirstLaunch();
  }, [sessionLoading, session, beginFirstLaunch]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionLoading) return;
    // Public surfaces that anyone can see. Everything else requires a session.
    // Public surfaces that must work without a login (App Review 1.5).
    const publicRoutes = [
      "/", "/auth", "/login", "/signup", "/reset-password",
      "/terms", "/privacy", "/community-guidelines", "/prohibited-items",
      "/support", "/safety", "/refunds", "/seller-agreement",
      "/market", "/hub", "/events", "/search", "/campus", "/map", "/pulse", "/hbcus", "/news",
      // Reporting a problem and asking for a missing school must never be
      // locked behind an account (App Review: reachable support + coverage gaps).
      "/report-problem", "/request-school-access",
    ];

    const isPublic =
      publicRoutes.includes(pathname) ||
      pathname.startsWith("/checkout/") ||
      pathname.startsWith("/u/") ||
      pathname.startsWith("/hbcus/") ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/.");
    if (!session && !isPublic) {
      navigate({ to: "/auth", search: { next: pathname, mode: "" } });
    }
  }, [pathname, session, sessionLoading, navigate]);

  useEffect(() => {
    if (sessionLoading || !pathname.startsWith("/hbcus")) return;
    if (!canAccessHbcus) navigate({ to: "/", replace: true });
  }, [canAccessHbcus, navigate, pathname, sessionLoading]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto min-h-screen max-w-md flex flex-col relative pb-nav">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-[image:var(--gradient-bronze)] focus:px-4 focus:py-2 focus:text-[11px] focus:font-semibold focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/50 bg-background/88 px-4 py-3 backdrop-blur-xl sm:px-5">

           <div className="flex min-w-0 items-center -space-x-1">
            <img
              src={pluguLogo}
              alt="PlugU"
              className="h-8 w-8 object-contain drop-shadow-[0_0_10px_rgba(244,201,106,0.55)] relative z-10"
              width={32}
              height={32}
            />
             <span className="truncate pl-1 text-sm font-bold tracking-[0.2em] plugu-wordmark">
              {title ?? "PLUGU"}
            </span>
          </div>
           <div className="flex shrink-0 items-center gap-2">
            {canAccessHbcus && (
              <Link
                to="/hbcus"
                className="tap shrink-0 pr-1 text-[11px] font-black tracking-[0.22em] transition-colors"
                aria-label="Open HBCUS — exclusive HBCU network"
              >
                <span className="text-muted-foreground">HBC</span>
                <span className="plugu-us-silver">US</span>
              </Link>
            )}
            {session ? <Link
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
            </Link> : <Link to="/auth" search={{ next: pathname, mode: "sign-in" }} className="tap inline-flex min-h-11 items-center text-xs font-semibold text-primary">Sign In</Link>}
            <button
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="tap grid h-8 w-8 place-items-center rounded-full border border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} key={pathname} className="flex-1 view-enter">{children}</main>

        <AchievementBurst />

        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 mb-safe"
          style={
            keyboardOffset
              ? {
                  // Keep the horizontal centering: overriding `transform`
                  // without translateX(-50%) shoved the tab bar off-screen
                  // whenever the keyboard opened.
                  transform: `translate(-50%, -${keyboardOffset}px)`,
                  marginBottom: 0,
                }
              : undefined
          }
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 -z-10"
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.72) 45%, rgba(0,0,0,0.94) 100%)" }}
          />
          <div
            className="border-t border-border/80 shadow-[var(--shadow-elegant)]"
            style={{
              background: "linear-gradient(180deg, rgba(17,17,17,0.97), rgba(5,5,5,0.995))",
              backdropFilter: "blur(28px) saturate(160%)",
              WebkitBackdropFilter: "blur(28px) saturate(160%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.05) inset, 0 -18px 50px -30px rgba(244,201,106,0.28)",
            }}
          >
            <ul className="relative grid grid-cols-5 items-end px-3 pb-2 pt-2">
              {/* Floating action: tap for the Campus Hub, hold for quick actions. */}
              <li className="order-3 z-10 -mt-5 flex justify-center">
                <button
                  onClick={() => { if (longPress.current) { longPress.current = false; return; } navigate({ to: "/campus" }); }}
                  onPointerDown={() => {
                    longPress.current = false;
                    pressTimer.current = window.setTimeout(() => { longPress.current = true; setPlugOpen(true); }, 500);
                  }}
                  onPointerUp={() => { if (pressTimer.current) window.clearTimeout(pressTimer.current); }}
                  onPointerLeave={() => { if (pressTimer.current) window.clearTimeout(pressTimer.current); }}
                    className="tap plugu-breathe pointer-events-auto relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border-4 border-background"
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
                    className="relative h-7 w-7 object-contain"
                    style={{
                      filter:
                        "drop-shadow(0 0 10px rgba(244,201,106,0.75)) drop-shadow(0 0 2px rgba(244,201,106,0.9))",
                    }}
                  />
                </button>
              </li>
              {tabs.map((t, idx) => {
                const Icon = t.icon;
                const active = pathname === t.to;
                return (
                  <li key={t.to} className="flex justify-center" style={{ order: idx < 2 ? idx + 1 : idx + 2 }}>
                    <Link
                      to={t.to}
                      onClick={(event) => {
                        if (!session && t.to === "/me") {
                          event.preventDefault();
                          requestAuthentication();
                        }
                      }}
                      aria-current={active ? "page" : undefined}
                      data-tour={t.label.toLowerCase()}
                      className={`tap relative flex min-w-0 flex-col items-center gap-0.5 px-1 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="relative">
                        <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.75} />
                        {t.label === "Me" && inboxUnread > 0 && (
                          <span
                            className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 grid place-items-center rounded-full text-[9px] font-bold text-black"
                            style={{ background: "var(--plugu-gold)" }}
                          >
                            {inboxUnread > 9 ? "9+" : inboxUnread}
                          </span>
                        )}
                      </span>
                      <span className="truncate">{t.label}</span>
                      {t.label === "Me" && inboxUnread > 0 && <span className="sr-only">{inboxUnread} unread messages</span>}
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
            style={{
              animation: "plugu-slide-up 0.32s cubic-bezier(0.22,1,0.36,1) both",
              ...(keyboardOffset
                ? { transform: `translateY(-${keyboardOffset}px)`, marginBottom: 0 }
                : null),
            }}
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
                      onClick={(event) => {
                        setPlugOpen(false);
                        if (!session && a.to !== "/pulse") {
                          event.preventDefault();
                          requestAuthentication();
                        }
                      }}
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

      <RealtimeStatusBar />
      <TermsGate />
      <RequireAuthPrompt />
      <Toaster position="top-center" />


      {showOnboarding && (
        <OnboardingExperience
          showAuthActions={false}
          onComplete={() => {
            markOnboarded();
            setShowOnboarding(false);
            setShowTour(true);
          }}
        />
      )}
      {showTour && (
        <CoachMarks
          onDone={() => {
            markToured();
            setShowTour(false);
            // Fade into Home with the one-time animated feed entrance,
            // then greet the newest member of the yard.
            setFeedStaggerPending();
            consumeWelcomePending();
            try { window.dispatchEvent(new CustomEvent(FIRST_FEED_EVENT)); } catch {}
            setShowWelcome(true);
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