// Settings blocks: per-category notifications and location privacy.
// Location is always optional; the benefit is explained before any prompt.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPinned } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchLocationSettings, saveLocationSettings, type LocationMode } from "@/lib/campus-os";
import { useSession } from "@/hooks/use-session";

const db = supabase as any;

/* ------------------------------ notifications ----------------------------- */

const CATEGORIES = [
  { key: "bookings", label: "Navigation, schedule & bookings" },
  { key: "orders", label: "Orders" },
  { key: "messages", label: "Messages" },
  { key: "events", label: "Campus announcements & events" },
  { key: "nearby_availability", label: "Safety & nearby availability" },
  { key: "flash_drops", label: "Scholarships & drops" },
  { key: "rankings", label: "HBCUS & rankings" },
  { key: "favorite_sellers", label: "Seller activity" },
] as const;

type CatKey = (typeof CATEGORIES)[number]["key"];

export function NotificationCategories() {
  const { session } = useSession();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["notification-prefs", session?.user.id ?? "guest"],
    enabled: !!session,
    queryFn: async () => {
      const { data } = await db.from("notification_preferences").select("*").maybeSingle();
      return (data ?? null) as Record<string, any> | null;
    },
  });

  const save = useMutation({
    mutationFn: async (patch: Partial<Record<CatKey, boolean>>) => {
      const uid = session?.user.id;
      if (!uid) throw new Error("Sign in required");
      const { error } = await db
        .from("notification_preferences")
        .upsert({ user_id: uid, ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-prefs"] }),
    onError: () => toast.error("Couldn't save that preference"),
  });

  if (!session) return null;

  return (
    <section className="mt-5 px-5" aria-labelledby="notif-cats">
      <h2 id="notif-cats" className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        Notification categories
      </h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {CATEGORIES.map((c) => {
          const on = q.data?.[c.key] ?? true;
          return (
            <label key={c.key} className="flex min-h-12 items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm">{c.label}</span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-[var(--plugu-gold)]"
                checked={!!on}
                disabled={q.isPending || save.isPending}
                onChange={(e) => save.mutate({ [c.key]: e.target.checked } as Partial<Record<CatKey, boolean>>)}
              />
            </label>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Related alerts are grouped, and quiet hours are respected. You can turn any category off at any time.
      </p>
    </section>
  );
}

/* --------------------------------- location -------------------------------- */

const MODES: { key: LocationMode; label: string; hint: string }[] = [
  { key: "never", label: "Never", hint: "PlugU never requests your location." },
  { key: "while_using", label: "While using PlugU", hint: "Walking routes and distances while the app is open." },
  { key: "temporary", label: "Temporary sharing", hint: "Share with one person you pick, with an expiration." },
  { key: "live_business", label: "Live business availability", hint: "Sellers only: show a safe public meetup point while active." },
];

export function LocationPrivacy() {
  const { session } = useSession();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["location-settings", session?.user.id ?? "guest"],
    enabled: !!session,
    queryFn: fetchLocationSettings,
  });

  const save = useMutation({
    mutationFn: (mode: LocationMode) =>
      saveLocationSettings({ mode, live_business_availability: mode === "live_business" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["location-settings"] });
      toast.success("Location preference saved");
    },
    onError: () => toast.error("Couldn't save location preference"),
  });

  if (!session) return null;
  const current = q.data?.mode ?? "never";

  return (
    <section className="mt-5 px-5" aria-labelledby="loc-privacy">
      <h2 id="loc-privacy" className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        Privacy &amp; Safety · Location
      </h2>
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <MapPinned className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Location is optional. It is only used to show walking times to verified campus destinations and what's
          open near you. PlugU never publishes your exact location, dorm room, address or movement history.
        </p>
        <fieldset className="mt-3">
          <legend className="sr-only">Location access</legend>
          <div className="divide-y divide-border">
            {MODES.map((m) => (
              <label key={m.key} className="flex min-h-12 items-start gap-3 py-3">
                <input
                  type="radio"
                  name="location-mode"
                  className="mt-1 h-4 w-4 accent-[var(--plugu-gold)]"
                  checked={current === m.key}
                  disabled={q.isPending || save.isPending}
                  onChange={() => save.mutate(m.key)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{m.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{m.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {q.data?.temporary_share_until && (
          <button
            type="button"
            onClick={() =>
              saveLocationSettings({ mode: "while_using", temporary_share_until: null })
                .then(() => {
                  qc.invalidateQueries({ queryKey: ["location-settings"] });
                  toast.success("Temporary sharing stopped");
                })
                .catch(() => toast.error("Couldn't stop sharing"))
            }
            className="tap mt-2 min-h-11 w-full rounded-xl border border-border text-sm font-semibold"
          >
            Stop temporary sharing now
          </button>
        )}
      </div>
    </section>
  );
}
