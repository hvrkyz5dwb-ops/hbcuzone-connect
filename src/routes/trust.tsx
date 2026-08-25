import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck, RefreshCw, Flag, UserX, Scale, BookOpen, MapPin, Phone, Receipt,
  ChevronRight, ArrowLeft, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust Center — PlugU" },
      { name: "description", content: "Refunds, disputes, reports, safety tips, and your transaction history on PlugU." },
      { property: "og:title", content: "PlugU Trust Center" },
      { property: "og:description", content: "The safest college marketplace in America." },
    ],
  }),
  component: Trust,
});

type SectionKey =
  | "refund" | "report-seller" | "report-buyer" | "dispute"
  | "guidelines" | "safe-meetup" | "emergency" | "history";

const sections: { key: SectionKey; label: string; icon: typeof RefreshCw; hint: string; tone: "gold" | "purple" | "danger" | "muted" }[] = [
  { key: "refund", label: "Refund Request", icon: RefreshCw, hint: "Get your money back on an order", tone: "gold" },
  { key: "report-seller", label: "Report Seller", icon: Flag, hint: "Flag a vendor for review", tone: "danger" },
  { key: "report-buyer", label: "Report Buyer", icon: UserX, hint: "Report a buyer or no-show", tone: "danger" },
  { key: "dispute", label: "Dispute Transaction", icon: Scale, hint: "Open a formal dispute with PlugU", tone: "purple" },
  { key: "guidelines", label: "Community Guidelines", icon: BookOpen, hint: "How we keep PlugU clean", tone: "muted" },
  { key: "safe-meetup", label: "Safe Meet-Up Tips", icon: MapPin, hint: "Meet on-campus, in the open", tone: "muted" },
  { key: "emergency", label: "Emergency Contacts", icon: Phone, hint: "Campus PD, Title IX, SOS", tone: "danger" },
  { key: "history", label: "Transaction History", icon: Receipt, hint: "Every order, every receipt", tone: "purple" },
];

function toneClass(t: string) {
  switch (t) {
    case "gold": return "text-accent bg-accent/10 border-accent/30";
    case "purple": return "text-[var(--plugu-purple)] bg-[var(--plugu-purple)]/10 border-[var(--plugu-purple)]/30";
    case "danger": return "text-rose-300 bg-rose-500/10 border-rose-500/30";
    default: return "text-muted-foreground bg-secondary/40 border-border";
  }
}

function Trust() {
  const [open, setOpen] = useState<SectionKey | null>(null);

  if (open) {
    return (
      <AppShell title="TRUST CENTER">
        <div className="px-5 pt-4">
          <button onClick={() => setOpen(null)} className="tap inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        </div>
        <SectionDetail section={open} />
      </AppShell>
    );
  }

  return (
    <AppShell title="TRUST CENTER">
      <section className="px-5 pt-4">
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/15 grid place-items-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-3 text-lg font-bold">PlugU Trust Center</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            The safest college marketplace in America. Refunds, disputes, and safety — all in one place.
          </p>
        </div>
      </section>

      <section className="px-5 mt-5 space-y-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setOpen(s.key)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border tap text-left"
            >
              <span className={`h-9 w-9 rounded-xl grid place-items-center border ${toneClass(s.tone)}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{s.label}</span>
                <span className="block text-[11px] text-muted-foreground">{s.hint}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          );
        })}
      </section>

      <section className="px-5 mt-6 pb-2">
        <Link
          to="/safety"
          className="block rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-center"
        >
          <p className="text-sm font-semibold text-rose-200 inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Emergency? Open Safety Tools
          </p>
          <p className="text-[11px] text-rose-200/70 mt-1">SOS, campus PD, lost & found</p>
        </Link>
      </section>
    </AppShell>
  );
}

function SectionDetail({ section }: { section: SectionKey }) {
  switch (section) {
    case "refund":
      return <FormBlock title="Refund Request" desc="Tell us what went wrong. Refunds are reviewed within 24 hours." cta="Submit Refund" />;
    case "report-seller":
      return <FormBlock title="Report Seller" desc="Help keep PlugU safe. Reports stay anonymous." cta="Send Report" />;
    case "report-buyer":
      return <FormBlock title="Report Buyer" desc="No-shows, scams, or harassment. Tell us everything." cta="Send Report" />;
    case "dispute":
      return <FormBlock title="Dispute Transaction" desc="Open a formal dispute. PlugU mediates within 48 hours." cta="Open Dispute" />;
    case "guidelines":
      return (
        <InfoBlock title="Community Guidelines" items={[
          "Be a student. Be respectful. Period.",
          "No weapons, drugs, alcohol, or counterfeit goods.",
          "Honor your bookings — show up or cancel early.",
          "Keep DMs about the deal. No harassment, ever.",
          "Use real photos of what you're selling.",
        ]} />
      );
    case "safe-meetup":
      return (
        <InfoBlock title="Safe Meet-Up Tips" items={[
          "Meet on campus, in well-lit public areas.",
          "Use the student center, library, or quad — not dorm rooms.",
          "Bring a friend for higher-value transactions.",
          "Confirm identity with the verified student badge.",
          "Pay through PlugU — never cash app strangers.",
        ]} />
      );
    case "emergency":
      return (
        <ContactsBlock contacts={[
          { label: "Campus Police", value: "Dial Campus PD" },
          { label: "911 Emergency", value: "911" },
          { label: "Title IX Coordinator", value: "Your campus office" },
          { label: "PlugU Trust & Safety", value: "trust@plugu.app" },
          { label: "Crisis Text Line", value: "Text HOME to 741741" },
        ]} />
      );
    case "history":
      return <HistoryBlock />;
  }
}

function FormBlock({ title, desc, cta }: { title: string; desc: string; cta: string }) {
  const [sent, setSent] = useState(false);
  return (
    <section className="px-5 mt-3">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      <div className="mt-4 space-y-3">
        <input
          placeholder="Order ID or @username"
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60"
        />
        <select className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60">
          <option>Item not as described</option>
          <option>Never delivered / no-show</option>
          <option>Harassment or unsafe behavior</option>
          <option>Suspected scam</option>
          <option>Other</option>
        </select>
        <textarea
          rows={5}
          placeholder="Add details…"
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60 resize-none"
        />
        <button
          onClick={() => { setSent(true); toast.success("Submitted — we'll get back within 24 hours"); }}
          className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold tap"
        >
          {cta}
        </button>
        {sent && (
          <p className="text-xs text-emerald-300 inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Case opened. Check Inbox for updates.
          </p>
        )}
      </div>
    </section>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="px-5 mt-3">
      <h2 className="text-lg font-bold">{title}</h2>
      <ul className="mt-4 space-y-2">
        {items.map((t) => (
          <li key={t} className="flex gap-3 p-3 rounded-xl bg-card border border-border text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ContactsBlock({ contacts }: { contacts: { label: string; value: string }[] }) {
  return (
    <section className="px-5 mt-3">
      <h2 className="text-lg font-bold">Emergency Contacts</h2>
      <ul className="mt-4 space-y-2">
        {contacts.map((c) => (
          <li key={c.label} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="text-[11px] text-muted-foreground">{c.value}</p>
            </div>
            <Phone className="h-4 w-4 text-rose-300" />
          </li>
        ))}
      </ul>
    </section>
  );
}

function HistoryBlock() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["trust", "order-history"],
    queryFn: () => listMyOrders("buyer"),
    staleTime: 30_000,
  });

  return (
    <section className="px-5 mt-3">
      <h2 className="text-lg font-bold">Transaction History</h2>
      {isLoading ? (
        <ul className="mt-4 space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </ul>
      ) : isError ? (
        <div className="mt-4 p-4 rounded-xl bg-card border border-border text-sm">
          <p className="text-muted-foreground">We couldn’t load your transactions.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 min-h-11 px-4 rounded-full border border-border text-xs font-semibold tap"
          >
            Try again
          </button>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Receipt className="h-8 w-8 mx-auto mb-2 opacity-60" aria-hidden="true" />
          <p>No transactions yet.</p>
          <Link to="/market" className="inline-block mt-3 min-h-11 px-4 py-3 rounded-full border border-border text-xs font-semibold tap">
            Browse the marketplace
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {data.map((o) => (
            <li key={o.id}>
              <Link
                to="/orders/$id"
                params={{ id: o.id }}
                className="block p-4 rounded-xl bg-card border border-border tap"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold line-clamp-1">
                    {o.listing?.title ?? "PlugU order"}
                  </p>
                  <p className="text-sm font-bold shrink-0">{centsToDollars(o.total_cents)}</p>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                  <span>{new Date(o.created_at).toLocaleDateString()}</span>
                  <span className={statusToneClass(o.status)}>{STATUS_LABEL[o.status]}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
