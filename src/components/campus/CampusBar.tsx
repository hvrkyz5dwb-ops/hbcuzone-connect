// PlugU Campus Bar — the persistent "which campus am I on" header used at the
// top of Home, Market, Events and Search.
//
// It answers three questions at a glance, on every screen:
//   1. Which HBCU campus the feed is showing.
//   2. Whether this student is a Verified Student on that campus.
//   3. How to explore another PlugU campus (same app, same account).
import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, ChevronDown, Clock3, GraduationCap, ShieldAlert, X } from "lucide-react";
import { SchoolPicker } from "@/components/SchoolPicker";
import { useCampusScope } from "@/hooks/use-campus-scope";
import { useProfile } from "@/hooks/use-profile";

export type VerificationState = "verified" | "pending" | "unverified";

export function useVerificationState(): VerificationState {
  const { profile } = useProfile();
  if (!profile) return "unverified";
  if (profile.verification_status === "verified" && profile.school_id) return "verified";
  if (profile.verification_status === "pending") return "pending";
  return "unverified";
}

export function VerificationPill({ state, className = "" }: { state: VerificationState; className?: string }) {
  if (state === "verified") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary ${className}`}
      >
        <BadgeCheck className="h-3 w-3" aria-hidden="true" /> Verified student
      </span>
    );
  }
  if (state === "pending") {
    return (
      <Link
        to="/request-school-access"
        className={`tap inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground ${className}`}
      >
        <Clock3 className="h-3 w-3" aria-hidden="true" /> Pending review
      </Link>
    );
  }
  return (
    <Link
      to="/request-school-access"
      className={`tap inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground ${className}`}
    >
      <ShieldAlert className="h-3 w-3" aria-hidden="true" /> Unverified
    </Link>
  );
}

export function CampusBar({ subtitle }: { subtitle?: ReactNode }) {
  const { campusName, homeCampusName, exploring, setCampus, resetToHome } = useCampusScope();
  const state = useVerificationState();
  const [open, setOpen] = useState(false);

  return (
    <section className="px-5 pt-3">
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border"
          style={{ borderColor: "color-mix(in oklab, var(--plugu-gold) 40%, transparent)" }}
        >
          <GraduationCap className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
            {exploring ? "Exploring campus" : "Your campus"}
          </p>
          <p className="truncate text-sm font-bold text-foreground">{campusName}</p>
          {subtitle && <p className="truncate text-[10px] text-muted-foreground">{subtitle}</p>}
        </div>
        {!exploring && <VerificationPill state={state} className="shrink-0" />}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Switch campus"
          className="tap inline-flex h-11 shrink-0 items-center gap-1 rounded-xl border border-border px-2.5 text-[11px] font-semibold text-muted-foreground"
        >
          Switch <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {exploring && (
        <button
          type="button"
          onClick={resetToHome}
          className="tap mt-2 inline-flex h-11 items-center rounded-xl px-2 text-[11px] font-semibold text-primary"
        >
          ← Back to {homeCampusName ?? "your campus"}
        </button>
      )}

      {open && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] grid place-items-end bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border border-border bg-card p-5"
              style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: "var(--plugu-gold)" }}>
                    PlugU campuses
                  </p>
                  <h2 className="mt-1 text-lg font-bold">Explore another campus</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    One PlugU app, every campus. Switching only changes what you browse — your
                    verified school stays {homeCampusName ?? "unchanged"}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="tap grid h-11 w-11 place-items-center text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4">
                <SchoolPicker
                  value={campusName}
                  onChange={(name) => {
                    setCampus(name === homeCampusName ? null : name);
                    setOpen(false);
                  }}
                />
              </div>

              {homeCampusName && (
                <button
                  type="button"
                  onClick={() => {
                    resetToHome();
                    setOpen(false);
                  }}
                  className="tap mt-4 h-12 w-full rounded-2xl border border-border text-sm font-semibold"
                >
                  Back to {homeCampusName}
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
