import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Flag, Loader2 } from "lucide-react";

import { toast } from "sonner";
import {
  REPORT_REASONS,
  submitReport,
  DuplicateReportError,
  type ReportReason,
  type ReportTargetType,
} from "@/lib/moderation";

export function ReportDialog({
  open, onClose, targetType, targetId, targetLabel, reportedUserId, snapshot, onReported,
}: {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel?: string;
  reportedUserId?: string | null;
  snapshot?: string | null;
  onReported?: () => void;
}) {
  const [reason, setReason] = useState<ReportReason>("harassment");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open || typeof document === "undefined") return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await submitReport({ targetType, targetId, reason, details, reportedUserId, snapshot: snapshot ?? targetLabel ?? null });
      toast.success("Report received", {
        description: "Our safety team will review it. This content is now hidden from you.",
      });
      onReported?.();
      onClose();
      setDetails("");
    } catch (err) {
      if (err instanceof DuplicateReportError) {
        toast("Already reported", { description: err.message });
        onReported?.();
        onClose();
      } else {
        toast.error("Couldn't send report", { description: (err as Error).message });
      }
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>

      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-5 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.24em] uppercase text-accent inline-flex items-center gap-1">
              <Flag className="h-3 w-3"/> Report
            </p>
            <h2 className="mt-1 text-lg font-bold capitalize">Report this {targetType}</h2>
            {targetLabel && <p className="text-xs text-muted-foreground truncate">{targetLabel}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="tap p-1 text-muted-foreground"><X className="h-5 w-5"/></button>
        </div>

        <div>
          <label className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground">Reason</label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {REPORT_REASONS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setReason(r.key)}
                aria-pressed={reason === r.key}
                className={`px-3 py-1.5 rounded-full text-[11px] border ${
                  reason === r.key
                    ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground">Supporting details (optional)</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            maxLength={800}
            placeholder="What happened? Include order IDs, times, or context."
            className="mt-1 w-full rounded-xl bg-background border border-border p-3 text-sm outline-none focus:border-primary"
          />
          <p className="mt-1 text-[10px] text-muted-foreground text-right">{details.length}/800</p>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="tap w-full py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-sm font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin"/> : <Flag className="h-4 w-4"/>}
          Submit report
        </button>

        <p className="text-[10px] text-muted-foreground text-center">
          Reports are confidential and reviewed by our safety team. Abuse of the reporting system may result in suspension.
        </p>
      </form>
    </div>,
    document.body,
  );

}
