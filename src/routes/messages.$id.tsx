import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Send, Shield, Flag, Ban, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PageLoader } from "@/components/QueryStates";
import { ReportDialog } from "@/components/ReportDialog";
import { VerifiedStudentBadge } from "@/components/VerifiedStudentBadge";
import { useConversation } from "@/hooks/use-messages";
import { useSession } from "@/hooks/use-session";
import { fetchBlockedUserIds } from "@/lib/moderation";
import {
  blockUser,
  detectOffPlatformAttempt,
  markConversationRead,
  sendMessage,
} from "@/lib/messages-db";
import { formatPrice, type PriceType } from "@/lib/categories";


export const Route = createFileRoute("/messages/$id")({
  head: () => ({
    meta: [
      { title: "Chat — PlugU" },
      { name: "description", content: "Direct message with a PlugU seller." },
    ],
  }),
  component: Thread,
});

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function Thread() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useSession();
  const { header, messages } = useConversation(id);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [warned, setWarned] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;
    markConversationRead(id).catch(() => {});
  }, [id, messages.data?.length]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.data?.length]);

  const other = header.data?.other ?? null;
  const listing = header.data?.listing ?? null;
  const otherName = other?.display_name ?? other?.username ?? "PlugU user";

  const trimmed = text.trim();
  const showOffPlatformWarn = useMemo(() => detectOffPlatformAttempt(text), [text]);

  if (header.isPending || messages.isPending) {
    return (
      <AppShell title="CHAT">
        <PageLoader message="Opening conversation…" />
      </AppShell>
    );
  }

  if (!header.data) {
    return (
      <AppShell title="CHAT">
        <div className="px-5 pt-10 text-center">
          <p className="text-sm text-muted-foreground">This conversation isn't available.</p>
          <button
            onClick={() => navigate({ to: "/messages" })}
            className="tap mt-4 inline-block text-xs font-semibold text-primary px-4 py-2 rounded-full border border-primary/40"
          >
            Back to inbox
          </button>
        </div>
      </AppShell>
    );
  }

  async function onSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!trimmed || sending) return;
    if (showOffPlatformWarn && !warned) {
      setWarned(true);
      toast.warning("Keep it on PlugU", {
        description: "Off-platform payments aren't protected. Tap send again to post anyway.",
      });
      return;
    }
    setSending(true);
    try {
      await sendMessage(id, trimmed);
      setText("");
      setWarned(false);
    } catch (err) {
      toast.error("Message failed", { description: (err as Error).message });
    } finally {
      setSending(false);
    }
  }

  async function onBlock() {
    if (!other) return;
    try {
      await blockUser(other.user_id);
      toast.success("Blocked", { description: `${otherName} can no longer message you.` });
      navigate({ to: "/messages" });
    } catch (err) {
      toast.error("Couldn't block", { description: (err as Error).message });
    }
  }

  async function onReport() {
    if (!other) return;
    try {
      await reportUser(other.user_id, `Reported from conversation ${id}`);
      toast.success("Reported", { description: "Trust & Safety will review this conversation." });
    } catch (err) {
      toast.error("Couldn't report", { description: (err as Error).message });
    }
  }

  return (
    <AppShell title="CHAT">
      <section className="px-3 pt-3">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5">
          <button
            aria-label="Back"
            onClick={() => navigate({ to: "/messages" })}
            className="tap h-9 w-9 grid place-items-center rounded-full bg-secondary border border-border shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex items-center gap-2">
            {other?.avatar_url ? (
              <img src={other.avatar_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="h-9 w-9 shrink-0 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                {otherName[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate inline-flex items-center gap-1">
                {otherName}
                {other?.verification_status === "verified" && <VerifiedStudentBadge size="xs" iconOnly />}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">Protected by PlugU · never share personal info</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              aria-label="Report"
              onClick={onReport}
              className="tap h-9 w-9 grid place-items-center rounded-full bg-secondary border border-border"
            >
              <Flag className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              aria-label="Block"
              onClick={onBlock}
              className="tap h-9 w-9 grid place-items-center rounded-full bg-secondary border border-border"
            >
              <Ban className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {listing && (
          <Link
            to="/checkout/$listingId"
            params={{ listingId: listing.id }}
            className="tap mt-2 flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2"
          >
            {listing.image_url ? (
              <img src={listing.image_url} alt="" className="h-11 w-11 rounded-lg object-cover" />
            ) : (
              <div className="h-11 w-11 rounded-lg bg-secondary" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground">Listing</p>
              <p className="text-sm font-semibold truncate">{listing.title}</p>
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--plugu-gold)" }}>
              {formatPrice(listing.price_cents, listing.price_type as PriceType)}
            </span>
          </Link>
        )}
      </section>

      <div
        ref={listRef}
        className="mt-3 px-4 pb-40 space-y-2 overflow-y-auto"
        style={{ maxHeight: "calc(100dvh - 240px)" }}
      >
        <div className="mx-auto max-w-[260px] text-center text-[10px] text-muted-foreground bg-secondary/60 border border-border rounded-full px-3 py-1.5 inline-flex items-center gap-1.5">
          <Shield className="h-3 w-3" style={{ color: "var(--plugu-gold)" }} /> Protected by PlugU
        </div>
        {(messages.data ?? []).map((m) => {
          const mine = m.sender_user_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  mine ? "text-black" : "bg-card border border-border text-foreground"
                }`}
                style={mine ? { background: "var(--plugu-gold)" } : undefined}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-1 text-[9px] ${mine ? "text-black/60" : "text-muted-foreground"}`}>{fmtTime(m.created_at)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={onSend} className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-30">
        {showOffPlatformWarn && (
          <div className="mb-2 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-[11px] text-accent inline-flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Keep payments and contact info on PlugU — off-platform deals aren't covered by escrow or dispute support.
            </span>
          </div>
        )}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-full border border-border bg-card px-2 py-2 shadow-[var(--shadow-elegant)]">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${otherName}…`}
            maxLength={2000}
            className="min-w-0 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!trimmed || sending}
            aria-label="Send"
            className="tap h-10 w-10 grid place-items-center rounded-full text-black disabled:opacity-40"
            style={{ background: "var(--plugu-gold)" }}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </AppShell>
  );
}