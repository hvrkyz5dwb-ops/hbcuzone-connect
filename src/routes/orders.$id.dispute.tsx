import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, AlertTriangle, ShieldCheck, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useOrder, useOpenDispute } from "@/hooks/use-orders";

export const Route = createFileRoute("/orders/$id/dispute")({
  ssr: false,
  head: () => ({ meta: [{ title: "Dispute — PlugU" }] }),
  component: DisputeForm,
});

const REASONS = [
  "Item never delivered",
  "Item not as described",
  "Seller unresponsive",
  "Damaged / defective",
  "Was charged wrong amount",
  "Something else",
];

function DisputeForm() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: order, isPending } = useOrder(id);
  const openDispute = useOpenDispute();
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [details, setDetails] = useState("");
  const [evidence, setEvidence] = useState(false);

  async function submit() {
    if (!order) return;
    try {
      const combined = details.trim() ? `${reason} — ${details.trim()}` : reason;
      await openDispute.mutateAsync({ id: order.id, reason: combined });
      toast.success("Dispute opened", { description: "PlugU Trust & Safety will reach out within 24h." });
      navigate({ to: "/orders/$id", params: { id: order.id } });
    } catch (err) {
      toast.error("Couldn't open dispute", { description: (err as Error).message });
    }
  }

  if (isPending) {
    return <AppShell title="DISPUTE"><div className="p-8 grid place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin"/></div></AppShell>;
  }
  if (!order) {
    return (
      <AppShell title="DISPUTE">
        <section className="px-5 pt-10 text-center">
          <p className="text-sm text-muted-foreground">Order not found.</p>
          <Link to="/orders" className="mt-4 inline-block text-xs text-accent">← All orders</Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="DISPUTE">
      <section className="px-5 pt-4 pb-8 slide-up">
        <Link to="/orders/$id" params={{ id: order.id }} className="tap inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to order
        </Link>

        <div
          className="mt-3 rounded-2xl p-4"
          style={{
            background: "linear-gradient(160deg, rgba(28,28,28,0.9), rgba(10,10,10,0.9))",
            border: "1px solid color-mix(in oklab, var(--plugu-gold) 40%, transparent)",
          }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent" />
            <p className="text-xs font-semibold" style={{ color: "var(--plugu-gold)" }}>Open a protected dispute</p>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Your funds stay held while our Trust &amp; Safety team reviews the case. Most disputes resolve within 24 hours.
          </p>
        </div>

        <p className="mt-5 text-[11px] tracking-[0.24em] uppercase text-muted-foreground px-1">What went wrong?</p>
        <div className="mt-2 space-y-2">
          {REASONS.map((r) => {
            const active = reason === r;
            return (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`tap w-full text-left px-4 py-3 rounded-2xl border text-xs font-semibold transition-colors ${
                  active ? "border-accent bg-secondary text-foreground" : "border-border bg-card text-muted-foreground"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[11px] tracking-[0.24em] uppercase text-muted-foreground px-1">Details</p>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Tell us what happened. Include dates, times and any receipts."
          className="mt-2 w-full bg-card border border-border rounded-2xl p-3 text-sm outline-none"
        />

        <button
          onClick={() => setEvidence((v) => !v)}
          className={`mt-3 tap w-full py-2.5 rounded-2xl border text-xs font-semibold inline-flex items-center justify-center gap-2 ${
            evidence ? "border-accent bg-secondary" : "border-border bg-card text-muted-foreground"
          }`}
        >
          <Camera className="h-3.5 w-3.5" /> {evidence ? "Evidence attached" : "Attach evidence (photos, screenshots)"}
        </button>

        <button
          onClick={submit}
          disabled={openDispute.isPending}
          className="mt-5 tap w-full py-3.5 rounded-2xl text-sm font-semibold text-primary-foreground disabled:opacity-60"
          style={{ background: "var(--gradient-bronze)" }}
        >
          {openDispute.isPending ? "Opening dispute…" : "Open protected dispute"}
        </button>

        <p className="mt-4 text-[10px] tracking-[0.25em] uppercase text-center text-muted-foreground inline-flex items-center gap-1 w-full justify-center">
          <ShieldCheck className="h-3 w-3" /> Trust &amp; Safety · Protected by PlugU
        </p>
      </section>
    </AppShell>
  );
}