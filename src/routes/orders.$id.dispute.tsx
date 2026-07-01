import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, ShieldCheck, Camera } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { getOrder, openDispute, type Order } from "@/lib/orders-storage";

export const Route = createFileRoute("/orders/$id/dispute")({
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
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [details, setDetails] = useState("");
  const [evidence, setEvidence] = useState(false);

  useEffect(() => { setOrder(getOrder(id)); }, [id]);

  function submit() {
    if (!order) return;
    openDispute(order.id, reason);
    toast.success("Dispute opened", { description: "PlugU Trust & Safety will reach out within 24h." });
    navigate({ to: "/orders/$id", params: { id: order.id } });
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
            Your funds stay held while our Trust team reviews. Most disputes resolve within 24 hours.
          </p>
        </div>

        <p className="mt-5 text-[11px] tracking-[0.24em] uppercase text-muted-foreground">Reason</p>
        <div className="mt-2 space-y-2">
          {REASONS.map((r) => {
            const active = reason === r;
            return (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`tap w-full text-left px-4 py-3 rounded-2xl border text-sm ${
                  active ? "border-accent bg-secondary" : "border-border bg-card"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[11px] tracking-[0.24em] uppercase text-muted-foreground">Details</p>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          placeholder="What happened? Include dates and any relevant context."
          className="mt-2 w-full bg-card rounded-2xl p-3 text-sm outline-none border border-border"
        />

        <button
          onClick={() => { setEvidence(true); toast.success("Evidence uploaded (demo)"); }}
          className="mt-3 tap w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold"
        >
          <Camera className="h-3.5 w-3.5" /> {evidence ? "Evidence attached ✓" : "Attach photo evidence"}
        </button>

        <button
          onClick={submit}
          className="mt-4 tap w-full py-3.5 rounded-2xl text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-bronze)" }}
        >
          Submit dispute
        </button>
        <p className="mt-2 text-center text-[10px] tracking-[0.2em] uppercase text-muted-foreground inline-flex items-center gap-1 w-full justify-center">
          <ShieldCheck className="h-3 w-3" /> Protected by PlugU
        </p>
      </section>
    </AppShell>
  );
}