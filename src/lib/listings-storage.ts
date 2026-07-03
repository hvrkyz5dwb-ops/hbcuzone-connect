// User-created marketplace listings, persisted in localStorage.
// Merged with seed listings from mock-data on read.
import { listings as seedListings } from "@/lib/mock-data";

export type UserListing = {
  id: string;
  title: string;
  price: string;         // display, e.g. "$25"
  category: string;
  description?: string;
  image: string;         // data URL or remote URL
  seller: string;
  school?: string;
  rating: number;
  createdAt: number;
  mine: true;
};

const KEY = "plugu.listings.v1";
const listeners = new Set<() => void>();

function read(): UserListing[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(list: UserListing[]) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  listeners.forEach((cb) => cb());
}

export function subscribeListings(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}
export function listMine(): UserListing[] { return read(); }

// Combined view for Market grid — user listings appear first.
export function listAll() {
  const mine = read();
  const seeds = (seedListings as any[]).map((l) => ({ ...l, mine: false as const }));
  return [...mine, ...seeds];
}

export function findListing(id: string) {
  return listAll().find((l: any) => l.id === id) as any;
}

export function createListing(
  input: Omit<UserListing, "id" | "createdAt" | "mine" | "rating"> & { rating?: number },
  opts?: { idempotencyKey?: string },
): UserListing {
  const list = read();
  // Idempotency: if a listing with this key already exists, return it instead of creating a duplicate.
  if (opts?.idempotencyKey) {
    const existing = list.find((l) => (l as any).idempotencyKey === opts.idempotencyKey);
    if (existing) return existing;
  }
  const rec: UserListing = {
    id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    rating: input.rating ?? 5.0,
    mine: true,
    ...input,
    ...(opts?.idempotencyKey ? { idempotencyKey: opts.idempotencyKey } : {}),
  } as UserListing;
  write([rec, ...list]);
  return rec;
}

export function updateListing(id: string, patch: Partial<UserListing>) {
  const list = read().map((l) => (l.id === id ? { ...l, ...patch } : l));
  write(list);
}

export function deleteListing(id: string) {
  write(read().filter((l) => l.id !== id));
}