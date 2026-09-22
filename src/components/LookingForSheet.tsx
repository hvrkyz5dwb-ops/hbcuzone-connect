import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { addCommunityPost } from "@/lib/community-storage";
import { useProfile } from "@/hooks/use-profile";
import { useSession } from "@/hooks/use-session";
import { requestAuthentication } from "@/components/RequireAuthPrompt";

const TEMPLATES = [
  "Need a barber",
  "Need a ride",
  "Need tutoring",
  "Need a photographer",
  "Need a roommate",
  "Need movers",
  "Need a graphic designer",
];

export function LookingForSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile } = useProfile();
  const { session } = useSession();
  const [text, setText] = useState("");
  if (!open || typeof document === "undefined") return null;

  async function post(body: string) {
    const clean = body.trim();
    if (!clean) return;
    if (!session) { onClose(); requestAuthentication(); return; }
    try {
      await addCommunityPost({
        school: profile?.school_name ?? "Campus",
        schoolId: profile?.school_id ?? null,
        author: profile?.display_name ?? profile?.full_name ?? "Plug",
        text: `🔎 Looking for: ${clean} — reply here or DM me if you can help.`,
        visibility: "campus",
      });
    } catch {
      toast.error("Couldn't post your request", { description: "Check your connection and try again." });
      return;
    }
    toast.success("Posted to your campus board", {
      description: "Students reply on the post or message you directly.",
    });
    setText("");
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Post a Looking For request">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-card p-5 pb-8"
        style={{ animation: "plugu-fade-up 0.3s ease-out both" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold">Looking For</h2>
          </div>
          <button onClick={onClose} aria-label="Close sheet" className="tap grid h-9 w-9 place-items-center rounded-full border border-border bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Post a request to your campus board. Responses come through the post and PlugU messages.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t}
              onClick={() => post(t)}
              className="tap rounded-full border border-border bg-secondary px-3 py-2 text-xs font-medium"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") post(text); }}
            placeholder="Or type your own request…"
            aria-label="Custom request"
            className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
          />
          <button
            onClick={() => post(text)}
            disabled={!text.trim()}
            className="tap rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}