import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { useMyBusiness } from "@/hooks/use-business";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Loader2, Save, ChevronRight, ChevronLeft, ShieldCheck, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-errors";

export const Route = createFileRoute("/seller/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Become a seller — PlugU" },
      { name: "description", content: "Set up your PlugU seller profile in a few quick steps. Your progress saves as you go." },
    ],
  }),
  component: SellerOnboarding,
});

const CATEGORIES = [
  "Food & Drinks", "Haircuts & Grooming", "Nails & Lashes", "Fashion & Apparel",
  "Tutoring & Academic", "Photography & Video", "Rides & Delivery", "Digital & Design",
  "Events & Promo", "Wellness", "Other",
];

const FULFILLMENT: { key: string; label: string; desc: string }[] = [
  { key: "pickup", label: "Pickup", desc: "Buyers pick up from you" },
  { key: "delivery", label: "Delivery", desc: "You bring it to them on campus" },
  { key: "appointment", label: "Appointment", desc: "Bookable time slots" },
  { key: "digital", label: "Digital", desc: "Delivered online" },
];

const CONTACT_METHODS = [
  { key: "plugu_dm", label: "PlugU DM (recommended)" },
  { key: "plugu_notifications", label: "PlugU notifications only" },
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "biz";
}

type Draft = {
  name: string;
  category: string;
  description: string;
  avatar_url: string;
  campus_name: string;
  fulfillment: string[];
  availability: string;
  cancellation_policy: string;
  contact_method: string;
  rules_accepted: boolean;
};

const STEP_TITLES = ["Business basics", "Story & logo", "Campus & fulfillment", "Policies & contact", "Seller agreement"];

function SellerOnboarding() {
  const { user } = useSession();
  const { profile } = useProfile();
  const { business, loading, refetch } = useMyBusiness();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({
    name: "",
    category: "",
    description: "",
    avatar_url: "",
    campus_name: profile?.school_name ?? "",
    fulfillment: [],
    availability: "",
    cancellation_policy: "",
    contact_method: "plugu_dm",
    rules_accepted: false,
  });

  // Hydrate from existing draft
  useEffect(() => {
    if (business) {
      setDraft((d) => ({
        ...d,
        name: business.name ?? "",
        category: business.category ?? "",
        description: business.description ?? business.bio ?? "",
        avatar_url: business.avatar_url ?? "",
        campus_name: business.campus_name ?? profile?.school_name ?? "",
        fulfillment: business.fulfillment ?? [],
        availability: business.availability ?? "",
        cancellation_policy: business.cancellation_policy ?? "",
        contact_method: business.contact_method ?? "plugu_dm",
        rules_accepted: !!business.rules_accepted_at,
      }));
      const next = Math.max(1, Math.min(5, (business.onboarding_step || 0) + 1));
      setStep(business.onboarding_step >= 5 ? 5 : next);
    } else if (profile?.school_name && !draft.campus_name) {
      setDraft((d) => ({ ...d, campus_name: profile.school_name! }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id, profile?.school_name]);

  const verified = profile?.verification_status === "verified";

  const canContinue = useMemo(() => {
    if (step === 1) return draft.name.trim().length >= 2 && !!draft.category;
    if (step === 2) return draft.description.trim().length >= 20;
    if (step === 3) return !!draft.campus_name.trim() && draft.fulfillment.length > 0 && draft.availability.trim().length > 0;
    if (step === 4) return draft.cancellation_policy.trim().length >= 10 && !!draft.contact_method;
    if (step === 5) return draft.rules_accepted;
    return false;
  }, [step, draft]);

  async function saveStep(next: number, finalize = false): Promise<boolean> {
    if (!user) return false;
    setSaving(true);
    setErr(null);
    const payload = {
      owner_user_id: user.id,
      school_id: profile?.school_id ?? null,
      name: draft.name.trim(),
      slug: slugify(draft.name),
      category: draft.category || null,
      description: draft.description.trim() || null,
      bio: draft.description.trim() || null,
      avatar_url: draft.avatar_url.trim() || null,
      campus_name: draft.campus_name.trim() || null,
      fulfillment: draft.fulfillment,
      availability: draft.availability.trim() || null,
      cancellation_policy: draft.cancellation_policy.trim() || null,
      contact_method: draft.contact_method,
      onboarding_step: Math.max(business?.onboarding_step ?? 0, next - 1, finalize ? 5 : next - 1),
      is_active: finalize ? true : false,
      rules_accepted_at: finalize ? new Date().toISOString() : (business?.rules_accepted_at ?? null),
    };

    let error;
    if (business?.id) {
      ({ error } = await supabase.from("businesses").update(payload).eq("id", business.id));
    } else {
      ({ error } = await supabase.from("businesses").insert(payload));
    }
    setSaving(false);
    if (error) {
      setErr(friendlyError(error));
      return false;
    }
    await refetch();
    qc.invalidateQueries({ queryKey: ["my-business"] });
    return true;
  }

  async function onContinue() {
    if (!canContinue) return;
    if (step === 5) {
      const ok = await saveStep(5, true);
      if (ok) {
        toast.success("You're live! Welcome to the Plug Business Center.");
        navigate({ to: "/seller" });
      }
      return;
    }
    const ok = await saveStep(step);
    if (ok) setStep((s) => s + 1);
  }

  async function saveAndExit() {
    const ok = await saveStep(step);
    if (ok) {
      toast.success("Progress saved. Pick up where you left off.");
      navigate({ to: "/profile" });
    }
  }

  if (loading) {
    return (
      <AppShell title="SELLER SETUP">
        <div className="p-8 grid place-items-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!verified) {
    return (
      <AppShell title="SELLER SETUP">
        <section className="p-5">
          <div className="rounded-3xl border border-border bg-card p-5">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="mt-2 text-lg font-bold">Verify your school first</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              PlugU only lets verified students sell. If your school isn't recognized yet, request access and we'll review it.
            </p>
            <Link to="/request-school-access" className="mt-4 inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Request school access <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="SELLER SETUP">
      <section className="p-5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Step {step} of 5</span>
          <span>{STEP_TITLES[step - 1]}</span>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={`h-1 rounded-full ${n <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-border bg-card p-5 space-y-4">
          {step === 1 && (
            <>
              <Field label="Business name">
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Yard Fresh Cuts" maxLength={60}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
              </Field>
              <Field label="Category">
                <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
                  <option value="">Select a category…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Business description">
                <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={5} maxLength={600}
                  placeholder="Tell students what you sell, why they should buy from you, and what makes you different."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
                <p className="text-[10px] text-muted-foreground">{draft.description.length}/600 — min 20 characters.</p>
              </Field>
              <Field label="Logo or profile image URL (optional)">
                <input value={draft.avatar_url} onChange={(e) => setDraft({ ...draft, avatar_url: e.target.value })}
                  placeholder="https://…" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <Field label="Campus">
                <input value={draft.campus_name} onChange={(e) => setDraft({ ...draft, campus_name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
                <p className="text-[10px] text-muted-foreground">Defaults to your verified school.</p>
              </Field>
              <Field label="How can students get your product or service?">
                <div className="grid gap-2">
                  {FULFILLMENT.map((f) => {
                    const on = draft.fulfillment.includes(f.key);
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setDraft({
                          ...draft,
                          fulfillment: on ? draft.fulfillment.filter((k) => k !== f.key) : [...draft.fulfillment, f.key],
                        })}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm ${on ? "border-primary bg-primary/10" : "border-border bg-background"}`}
                      >
                        <span className={`h-4 w-4 rounded-md border grid place-items-center ${on ? "bg-primary border-primary" : "border-border"}`}>
                          {on && <Check className="h-3 w-3 text-primary-foreground" />}
                        </span>
                        <span className="flex-1">
                          <span className="block font-medium">{f.label}</span>
                          <span className="block text-[11px] text-muted-foreground">{f.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="General availability">
                <input value={draft.availability} onChange={(e) => setDraft({ ...draft, availability: e.target.value })}
                  placeholder="e.g. Mon–Fri 5–10pm, weekends by appointment"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
              </Field>
            </>
          )}

          {step === 4 && (
            <>
              <Field label="Cancellation policy">
                <textarea value={draft.cancellation_policy} onChange={(e) => setDraft({ ...draft, cancellation_policy: e.target.value })}
                  rows={4} maxLength={400}
                  placeholder="e.g. Free cancellation up to 24 hours before appointment. Late cancellations forfeit deposit."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
              </Field>
              <Field label="Preferred contact method inside PlugU">
                <select value={draft.contact_method} onChange={(e) => setDraft({ ...draft, contact_method: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
                  {CONTACT_METHODS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
                <p className="text-[10px] text-muted-foreground">PlugU never shares your personal contact info off-platform.</p>
              </Field>
            </>
          )}

          {step === 5 && (
            <>
              <div className="rounded-2xl border border-border bg-background/60 p-4 text-xs leading-relaxed text-muted-foreground max-h-64 overflow-y-auto">
                <p className="font-semibold text-foreground">Seller rules summary</p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Be a real, verified student and sell only what you can legally offer.</li>
                  <li>Fulfill orders in the timeframe you promise; refund what you can't deliver.</li>
                  <li>Communicate through PlugU DMs so we can support disputes.</li>
                  <li>No prohibited items: illegal drugs, controlled substances, weapons, stolen goods, adult services, hate content, or academic dishonesty products (test answers, papers-for-sale).</li>
                  <li>Violations may result in suspension or permanent removal from PlugU.</li>
                </ul>
                <p className="mt-3">
                  Full text: <Link to="/community-guidelines" className="underline text-primary">community guidelines</Link>,{" "}
                  <Link to="/terms" className="underline text-primary">terms</Link>,{" "}
                  <Link to="/refunds" className="underline text-primary">refund policy</Link>.
                </p>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={draft.rules_accepted}
                  onChange={(e) => setDraft({ ...draft, rules_accepted: e.target.checked })}
                  className="mt-0.5 h-4 w-4 accent-[var(--plugu-gold)]" />
                <span>I agree to the PlugU seller rules and prohibited-items policy.</span>
              </label>
            </>
          )}

          {err && (
            <p className="flex items-start gap-1.5 text-[12px] text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {err}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || saving}
              className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={saveAndExit}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground"
              >
                <Save className="h-3.5 w-3.5" /> Save & exit
              </button>
              <button
                type="button"
                onClick={onContinue}
                disabled={!canContinue || saving}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === 5 ? "Launch my business" : "Continue"} {step !== 5 && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}