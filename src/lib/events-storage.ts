// School-scoped user-submitted campus events, persisted in localStorage.
export type UserEvent = {
  id: string;
  school: string;
  title: string;
  when: string;
  where: string;
  createdAt: number;
};

const KEY = "plugu:user-events:v1";

function readAll(): UserEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserEvent[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: UserEvent[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("plugu:events-updated"));
  } catch {}
}

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function listUserEvents(school?: string): UserEvent[] {
  const all = readAll().sort((a, b) => b.createdAt - a.createdAt);
  if (!school) return all;
  const n = norm(school);
  return all.filter((e) => norm(e.school).includes(n) || n.includes(norm(e.school)));
}

export function addUserEvent(input: Omit<UserEvent, "id" | "createdAt">): UserEvent {
  const ev: UserEvent = {
    ...input,
    id: `ue_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  writeAll([ev, ...readAll()]);
  return ev;
}

export function removeUserEvent(id: string) {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function subscribeUserEvents(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("plugu:events-updated", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("plugu:events-updated", handler);
    window.removeEventListener("storage", handler);
  };
}