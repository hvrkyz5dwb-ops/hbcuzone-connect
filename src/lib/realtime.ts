// Central realtime helper.
//
// Every live subscription in the app goes through `subscribeChannel` so that:
//  - subscribe status changes (SUBSCRIBED / CHANNEL_ERROR / TIMED_OUT / CLOSED)
//    are logged with the topic, tables and error detail,
//  - failures are tracked in one place so the UI can show a "Reconnect" button,
//  - a manual reconnect can rebuild every channel without a page reload.
import { supabase } from "@/integrations/supabase/client";

export type RealtimeHealth = {
  /** "ok" — everything subscribed. "degraded" — at least one channel failed. */
  status: "ok" | "connecting" | "degraded";
  failedTopics: string[];
  lastError: string | null;
  lastErrorAt: number | null;
  reconnecting: boolean;
};

type Builder = (channel: any) => any;

type Entry = {
  topic: string;
  build: Builder;
  channel: any;
  state: "connecting" | "subscribed" | "failed";
};

const entries = new Map<string, Entry>();
const listeners = new Set<() => void>();

let snapshot: RealtimeHealth = {
  status: "ok",
  failedTopics: [],
  lastError: null,
  lastErrorAt: null,
  reconnecting: false,
};

const serverSnapshot: RealtimeHealth = snapshot;

function recompute(partial?: Partial<RealtimeHealth>) {
  const failedTopics = [...entries.values()].filter((e) => e.state === "failed").map((e) => e.topic);
  const connecting = [...entries.values()].some((e) => e.state === "connecting");
  const next: RealtimeHealth = {
    ...snapshot,
    ...partial,
    failedTopics,
    status: failedTopics.length ? "degraded" : connecting ? "connecting" : "ok",
  };
  snapshot = next;
  listeners.forEach((l) => l());
}

export function subscribeToRealtimeHealth(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getRealtimeHealth() {
  return snapshot;
}

export function getRealtimeServerHealth() {
  return serverSnapshot;
}

function log(level: "info" | "warn" | "error", topic: string, message: string, extra?: unknown) {
  const line = `[PlugU realtime] ${topic} — ${message}`;
  if (level === "error") console.error(line, extra ?? "");
  else if (level === "warn") console.warn(line, extra ?? "");
  else console.info(line, extra ?? "");
}

function open(entry: Entry) {
  const channel = entry.build(supabase.channel(entry.topic));
  entry.channel = channel;
  entry.state = "connecting";
  recompute();

  channel.subscribe((status: string, err?: Error) => {
    if (status === "SUBSCRIBED") {
      entry.state = "subscribed";
      log("info", entry.topic, "live updates connected");
      recompute();
      return;
    }
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      entry.state = "failed";
      const detail = err?.message ?? status;
      log("error", entry.topic, `live updates failed (${status})`, {
        status,
        error: detail,
        online: typeof navigator !== "undefined" ? navigator.onLine : null,
      });
      recompute({ lastError: detail, lastErrorAt: Date.now() });
      return;
    }
    if (status === "CLOSED") {
      // Normal on unmount; only note it when the entry is still registered.
      if (entries.has(entry.topic)) log("warn", entry.topic, "live updates closed");
    }
  });
}

/**
 * Subscribe to a realtime topic. Returns a teardown function.
 * `build` receives the raw channel and should attach `.on(...)` handlers only
 * (never call `.subscribe()` — this helper does that).
 */
export function subscribeChannel(topic: string, build: Builder) {
  if (entries.has(topic)) {
    // Defensive: a duplicate topic would throw
    // "cannot add postgres_changes callbacks after subscribe()".
    log("warn", topic, "duplicate subscription requested; reusing a unique topic is required");
  }
  const entry: Entry = { topic, build, channel: null, state: "connecting" };
  entries.set(topic, entry);
  open(entry);

  return () => {
    entries.delete(topic);
    try {
      if (entry.channel) supabase.removeChannel(entry.channel);
    } catch (e) {
      log("warn", topic, "teardown failed", e);
    }
    recompute();
  };
}

/** Rebuild every registered channel — used by the visible "Reconnect" button. */
export async function reconnectRealtime() {
  recompute({ reconnecting: true });
  log("info", "all-channels", `manual reconnect for ${entries.size} channel(s)`);
  for (const entry of entries.values()) {
    try {
      if (entry.channel) await supabase.removeChannel(entry.channel);
    } catch (e) {
      log("warn", entry.topic, "could not close channel before reconnect", e);
    }
    open(entry);
  }
  // Give the sockets a beat to report status before clearing the spinner.
  await new Promise((r) => setTimeout(r, 900));
  recompute({ reconnecting: false });
}
