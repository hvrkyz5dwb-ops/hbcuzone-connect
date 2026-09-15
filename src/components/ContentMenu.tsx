// The three-dot safety menu that sits on every piece of user generated
// content: posts, listings, comments, reviews, messages, events, profiles and
// uploaded images. Report + Block + Hide, all instant.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Flag, Ban, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ReportDialog } from "@/components/ReportDialog";
import { blockUser, type ReportTargetType } from "@/lib/moderation";
import { hideContent } from "@/lib/ugc-safety";
import { useRefreshBlocklist } from "@/hooks/use-blocklist";
import { useSession } from "@/hooks/use-session";

type Props = {
  targetType: ReportTargetType;
  targetId: string;
  targetLabel?: string;
  /** Copy of the reported content stored with the report for moderators. */
  snapshot?: string | null;
  authorUserId?: string | null;
  authorLabel?: string;
  /** Called after report/block/hide so the parent can drop the item locally. */
  onHidden?: () => void;
  className?: string;
  /** Extra menu entries (e.g. mute a local author). */
  extraActions?: { label: string; onSelect: () => void }[];
};

export function ContentMenu({
  targetType, targetId, targetLabel, snapshot, authorUserId, authorLabel, onHidden, className, extraActions,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { session } = useSession();
  const refreshBlocklist = useRefreshBlocklist();
  const isSelf = !!authorUserId && authorUserId === session?.user?.id;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const doHide = () => {
    hideContent(targetType, targetId);
    setOpen(false);
    onHidden?.();
    toast("Hidden", { description: "You won't see this content again." });
  };

  const doBlock = async () => {
    if (!authorUserId) return;
    setBlocking(true);
    try {
      await blockUser(authorUserId);
      hideContent(targetType, targetId);
      refreshBlocklist();
      setConfirmBlock(false);
      setOpen(false);
      onHidden?.();
      toast.success(`Blocked${authorLabel ? ` ${authorLabel}` : ""}`, {
        description: "Their posts, listings and messages are hidden and you can't contact each other.",
      });
    } catch (err) {
      toast.error("Couldn't block", { description: (err as Error).message });
    } finally {
      setBlocking(false);
    }
  };

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        aria-label="More options"
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen((v) => !v); }}
        className="tap grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {/* Rendered as a fixed sheet, never absolutely inside the card: cards clip
          overflow, which hid the menu on iPhone widths. */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(false); }}
        >
          <div
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
            className="w-full max-w-sm overflow-hidden rounded-t-3xl border border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-elegant)] sm:rounded-3xl sm:pb-0"
          >
            <p className="px-4 pt-4 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {targetLabel ? targetLabel : "Safety options"}
            </p>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => { setOpen(false); setReportOpen(true); }}
                className="w-full flex items-center gap-2 px-4 py-4 text-left text-sm hover:bg-secondary border-t border-border"
              >
                <Flag className="h-4 w-4 text-accent" /> Report
              </button>
              <button
                type="button"
                onClick={doHide}
                className="w-full flex items-center gap-2 px-4 py-4 text-left text-sm hover:bg-secondary border-t border-border"
              >
                <EyeOff className="h-4 w-4 text-muted-foreground" /> Hide this
              </button>
              {(extraActions ?? []).map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => { setOpen(false); a.onSelect(); onHidden?.(); }}
                  className="w-full flex items-center gap-2 px-4 py-4 text-left text-sm hover:bg-secondary border-t border-border"
                >
                  <Ban className="h-4 w-4 text-muted-foreground" /> {a.label}
                </button>
              ))}
              {authorUserId && !isSelf && (
                <button
                  type="button"
                  onClick={() => setConfirmBlock(true)}
                  className="w-full flex items-center gap-2 px-4 py-4 text-left text-sm text-destructive hover:bg-secondary border-t border-border"
                >
                  <Ban className="h-4 w-4" /> Block user
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full px-4 py-4 text-sm text-muted-foreground border-t border-border"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {confirmBlock && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); setConfirmBlock(false); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-5"
          >
            <h3 className="text-base font-bold">Block {authorLabel ?? "this user"}?</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              You won't see their posts, listings, comments, events or messages anywhere in PlugU,
              and neither of you can contact the other. You can unblock them in
              Settings → Privacy &amp; Safety → Blocked users.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmBlock(false)}
                className="tap rounded-2xl border border-border bg-secondary py-3 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doBlock}
                disabled={blocking}
                className="tap inline-flex items-center justify-center gap-2 rounded-2xl bg-destructive py-3 text-sm font-semibold text-destructive-foreground disabled:opacity-60"
              >
                {blocking && <Loader2 className="h-4 w-4 animate-spin" />} Block
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType={targetType}
        targetId={targetId}
        targetLabel={targetLabel}
        snapshot={snapshot}
        reportedUserId={authorUserId ?? null}
        onReported={onHidden}
      />
    </div>
  );
}
