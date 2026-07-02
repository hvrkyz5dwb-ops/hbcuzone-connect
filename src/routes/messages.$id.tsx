import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Shield, Flag, Ban } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { getThread, markThreadRead, sendMessage, subscribeThreads, type ChatThread } from "@/lib/messages-storage";
import { VerifiedStudentBadge } from "@/components/VerifiedStudentBadge";

export const Route = createFileRoute("/messages/$id")({
  head: () => ({
    meta: [
      { title: "Chat — PlugU" },
      { name: "description", content: "Direct message with a PlugU seller." },
    ],
  }),
  component: Thread,
});

function fmtTime(t: number) {
  const d = new Date(t);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function Thread() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState<ChatThread | undefined>(() => getThread(id));
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    markThreadRead(id);
    setThread(getThread(id));
    return subscribeThreads(() => setThread(getThread(id)));
  }, [id]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [thread?.messages.length]);

  if (!thread) {
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

  function onSend(e?: React.FormEvent) {
    e?.preventDefault();
    const updated = sendMessage(id, text);
    if (updated) {
      setThread(updated);
      setText("");
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
            <div className="h-9 w-9 shrink-0 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
              {thread.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate inline-flex items-center gap-1">
                {thread.name}
                <VerifiedStudentBadge size="xs" iconOnly />
              </p>
              <p className="text-[10px] text-muted-foreground truncate">Protected by PlugU · usually replies in minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              aria-label="Report"
              onClick={() => toast("Reported", { description: "Our team will review this conversation." })}
              className="tap h-9 w-9 grid place-items-center rounded-full bg-secondary border border-border"
            >
              <Flag className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              aria-label="Block"
              onClick={() => toast("Blocked", { description: `You won't see messages from ${thread.name}.` })}
              className="tap h-9 w-9 grid place-items-center rounded-full bg-secondary border border-border"
            >
              <Ban className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </section>

      <div
        ref={listRef}
        className="mt-3 px-4 pb-32 space-y-2 overflow-y-auto"
        style={{ maxHeight: "calc(100dvh - 240px)" }}
      >
        <div className="mx-auto max-w-[220px] text-center text-[10px] text-muted-foreground bg-secondary/60 border border-border rounded-full px-3 py-1.5 inline-flex items-center gap-1.5">
          <Shield className="h-3 w-3" style={{ color: "var(--plugu-gold)" }} /> Protected by PlugU
        </div>
        {thread.messages.map((m) => {
          const mine = m.from === "me";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  mine ? "text-black" : "bg-card border border-border text-foreground"
                }`}
                style={mine ? { background: "var(--plugu-gold)" } : undefined}
              >
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <p className={`mt-1 text-[9px] ${mine ? "text-black/60" : "text-muted-foreground"}`}>{fmtTime(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={onSend}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-30"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-full border border-border bg-card px-2 py-2 shadow-[var(--shadow-elegant)]">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${thread.name}…`}
            className="min-w-0 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            aria-label="Send"
            className="tap h-10 w-10 grid place-items-center rounded-full text-black disabled:opacity-40"
            style={{ background: "var(--plugu-gold)" }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </AppShell>
  );
}