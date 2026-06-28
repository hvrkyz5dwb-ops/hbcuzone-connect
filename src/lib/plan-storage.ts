const KEY = "plugu.selectedPlan";
const HISTORY_KEY = "plugu.paymentHistory";

export type SavedPlan = { key: string; name: string; price: number; selectedAt: string };
export type PaymentRecord = SavedPlan & { status: "pending" | "paid" | "failed" };

export function getSelectedPlan(): SavedPlan | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}

export function saveSelectedPlan(plan: Omit<SavedPlan, "selectedAt">) {
  if (typeof window === "undefined") return;
  const record: SavedPlan = { ...plan, selectedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(record));
  const history = getPaymentHistory();
  history.unshift({ ...record, status: "pending" });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 25)));
}

export function clearSelectedPlan() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function getPaymentHistory(): PaymentRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}