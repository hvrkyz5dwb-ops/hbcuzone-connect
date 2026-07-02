// PlugU DMs — client-side thread storage seeded from mock inbox.
import { messagesList } from "@/lib/mock-data";

export type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  createdAt: number;
};

export type ChatThread = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: boolean;
  messages: ChatMessage[];
};

const KEY = "plugu.threads.v1";
const EVENT = "plugu:threads";

function seed(): ChatThread[] {
  const t = Date.now();
  return messagesList.map((m, i) => ({
    id: m.id,
    name: m.name,
    preview: m.preview,
    time: m.time,
    unread: m.unread,
    messages: [
      { id: `${m.id}-1`, from: "them", text: `Yo — appreciate you reaching out. How can I plug you?`, createdAt: t - (i + 1) * 3600_000 * 2 },
      { id: `${m.id}-2`, from: "me", text: m.preview.replace(/^You:\s*/, ""), createdAt: t - (i + 1) * 3600_000 * 2 + 90_000 },
      ...(m.unread
        ? [{ id: `${m.id}-3`, from: "them" as const, text: "Available today — pull up whenever 🙌", createdAt: t - 60_000 * 12 }]
        : []),
    ],
  }));
}

function read(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as ChatThread[];
  } catch { return []; }
}

function write(list: ChatThread[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

export function listThreads(): ChatThread[] {
  return read();
}

export function getThread(id: string): ChatThread | undefined {
  return read().find((t) => t.id === id);
}

export function markThreadRead(id: string) {
  const list = read().map((t) => t.id === id ? { ...t, unread: false } : t);
  write(list);
}

export function sendMessage(id: string, text: string): ChatThread | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const list = read();
  const idx = list.findIndex((t) => t.id === id);
  if (idx < 0) return undefined;
  const t = list[idx];
  const msg: ChatMessage = { id: `${id}-${Date.now().toString(36)}`, from: "me", text: trimmed, createdAt: Date.now() };
  const updated: ChatThread = { ...t, unread: false, time: "now", preview: `You: ${trimmed}`, messages: [...t.messages, msg] };
  list[idx] = updated;
  write(list);
  return updated;
}

export function threadsUnreadCount(): number {
  return read().filter((t) => t.unread).length;
}

export function subscribeThreads(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => cb();
  window.addEventListener(EVENT, h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener(EVENT, h);
    window.removeEventListener("storage", h);
  };
}