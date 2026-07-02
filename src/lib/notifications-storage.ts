// PlugU Notifications Center — client-side event log.
// Deterministic seed on first read so the inbox is never empty for a new student.

export type NotifKind =
  | "like" | "comment" | "follow" | "message"
  | "order" | "payment" | "refund" | "dispute"
  | "referral" | "rank" | "daily" | "promo"
  | "verify" | "seller" | "system";

export type PluguNotification = {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  href?: string;
  createdAt: number;
  read: boolean;
  emoji?: string;
};

const KEY = "plugu.notifications.v1";
const EVENT = "plugu:notifications";
const MAX = 200;

function now() { return Date.now(); }

function seed(): PluguNotification[] {
  const t = now();
  const mins = (n: number) => t - n * 60_000;
  return [
    { id: "n_verify", kind: "verify", emoji: "✔️",
      title: "You're verified", body: "Your .edu email is confirmed. Verified Student badge is live.",
      href: "/profile", createdAt: mins(2), read: false },
    { id: "n_rank",   kind: "rank",   emoji: "👑",
      title: "You moved up 3 spots",  body: "You're climbing the campus leaderboard. Keep going.",
      href: "/nationals", createdAt: mins(14), read: false },
    { id: "n_daily",  kind: "daily",  emoji: "🗞️",
      title: "PlugU Daily just dropped", body: "Trending businesses, wins & campus news — updated today.",
      href: "/daily", createdAt: mins(55), read: false },
    { id: "n_order",  kind: "order",  emoji: "📦",
      title: "Order update", body: "Fade God confirmed your appointment. Tap for details.",
      href: "/orders", createdAt: mins(120), read: true },
    { id: "n_ref",    kind: "referral", emoji: "🎁",
      title: "New referral joined", body: "Someone signed up with your code. Keep your streak alive.",
      href: "/referrals", createdAt: mins(360), read: true },
    { id: "n_promo",  kind: "promo",  emoji: "⚡",
      title: "Local Boost 20% off",  body: "3-day boost is on sale this week. Push your listings.",
      href: "/upgrade", createdAt: mins(720), read: true },
  ];
}

function read(): PluguNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function write(list: PluguNotification[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

export function listNotifications(): PluguNotification[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function unreadCount(): number {
  return read().filter((n) => !n.read).length;
}

export function markRead(id: string) {
  const list = read().map((n) => n.id === id ? { ...n, read: true } : n);
  write(list);
}

export function markAllRead() {
  const list = read().map((n) => ({ ...n, read: true }));
  write(list);
}

export function clearAll() {
  write([]);
}

export function pushNotification(input: Omit<PluguNotification, "id" | "createdAt" | "read"> & { read?: boolean }) {
  const n: PluguNotification = {
    id: `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now(),
    read: input.read ?? false,
    ...input,
  };
  write([n, ...read()]);
  return n;
}

export function subscribeNotifications(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export const NOTIF_LABEL: Record<NotifKind, string> = {
  like: "Likes", comment: "Comments", follow: "Follows", message: "Messages",
  order: "Orders", payment: "Payments", refund: "Refunds", dispute: "Disputes",
  referral: "Referrals", rank: "Rankings", daily: "PlugU Daily", promo: "Promos",
  verify: "Verification", seller: "Seller", system: "System",
};