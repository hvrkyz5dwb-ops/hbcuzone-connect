// Visible recovery affordance: when any live subscription drops, students get
// a plain-language notice and a "Reconnect" button instead of a silently stale
// screen. Errors are also logged in detail (see src/lib/realtime.ts).
import { useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { useRealtimeHealth } from "@/hooks/use-realtime-health";
import { reconnectRealtime } from "@/lib/realtime";

export function RealtimeStatusBar() {
  const health = useRealtimeHealth();
  const [busy, setBusy] = useState(false);

  if (health.status !== "degraded") return null;

  const onReconnect = async () => {
    setBusy(true);
    try {
      await reconnectRealtime();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] z-40 mx-auto w-[min(26rem,calc(100%-1.5rem))]"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-destructive/40 bg-card/95 px-3.5 py-2.5 shadow-lg backdrop-blur">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-destructive/15 text-destructive">
          <WifiOff className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-tight">Live updates paused</p>
          <p className="truncate text-[10px] text-muted-foreground">
            {health.lastError
              ? `New messages and orders won't appear automatically (${health.lastError}).`
              : "New messages and orders won't appear automatically."}
          </p>
        </div>
        <button
          type="button"
          onClick={onReconnect}
          disabled={busy || health.reconnecting}
          aria-label="Reconnect live updates"
          className="tap inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[image:var(--gradient-bronze)] px-3 py-2 text-[11px] font-semibold text-primary-foreground disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${busy || health.reconnecting ? "animate-spin" : ""}`} aria-hidden="true" />
          {busy || health.reconnecting ? "Reconnecting" : "Reconnect"}
        </button>
      </div>
    </div>
  );
}

export default RealtimeStatusBar;
