import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, LifeBuoy, Loader2, Mail, Clock } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SupportForm } from "@/components/SupportForm";
import { fetchMySupportRequests, SUPPORT_CATEGORIES, type SupportCategory } from "@/lib/support-db";
import { submitPublicSupportMessage } from "@/lib/support.functions";
import { useSession } from "@/hooks/use-session";

export const SUPPORT_EMAIL = "plugusupport@gmail.com";
export const SUPPORT_RESPONSE_TIME = "within 1–2 business days";

type Search = { category?: SupportCategory; subject?: string; orderId?: string; listingId?: string };

export const Route = createFileRoute("/support")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: (s.category as SupportCategory) || undefined,
    subject: typeof s.subject === "string" ? s.subject : undefined,
    orderId: typeof s.orderId === "string" ? s.orderId : undefined,
    listingId: typeof s.listingId === "string" ? s.listingId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "PlugU Support — Help, Reporting & Account Deletion" },
      { name: "description", content: "Contact PlugU support, report content or abusive users, delete your account, and read answers to common questions. No login required." },
      { property: "og:title", content: "PlugU Support" },
      { property: "og:description", content: "Help with PlugU: contact the team, report abuse, delete your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const search = useSearch({ from: "/support" });
  const { session } = useSession();
  const { data: history = [], refetch, isLoading } = useQuery({
    queryKey: ["support-requests", session?.user?.id ?? "anon"],
    queryFn: fetchMySupportRequests,
    enabled: !!session?.user?.id,
  });

  return (
    <AppShell title="SUPPORT">
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-8">
        <header>
          <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-accent">
            <LifeBuoy className="h-3 w-3" /> Help center
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>PlugU Support</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            PlugU is a student marketplace for verified college students. Our team reviews every
            request — including reports of abusive content or users.
          </p>
          <div className="mt-3 grid gap-2 text-xs">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-2 text-accent underline">
              <Mail className="h-3.5 w-3.5" /> {SUPPORT_EMAIL}
            </a>
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Expected response time: {SUPPORT_RESPONSE_TIME}
            </p>
          </div>
        </header>

        <section>
          <h2 className="text-base font-semibold">Send us a message</h2>
          {session ? (
            <div className="mt-3">
              <SupportForm
                defaultCategory={search.category ?? "general"}
                defaultSubject={search.subject ?? ""}
                defaultOrderId={search.orderId ?? ""}
                defaultListingId={search.listingId ?? ""}
                onSubmitted={() => refetch()}
              />
            </div>
          ) : (
            <PublicSupportForm defaultSubject={search.subject ?? ""} />
          )}
        </section>

        <section>
          <h2 className="text-base font-semibold">How to report content or an abusive user</h2>
          <ol className="mt-2 space-y-2 text-xs text-muted-foreground list-decimal pl-4">
            <li>Open the post, listing, comment, review, message, event or profile in the PlugU app.</li>
            <li>Tap the three-dot (⋮) menu on that item.</li>
            <li>Choose <strong className="text-foreground">Report</strong>, pick a reason (harassment, hate speech, sexual content, violence or threats, drugs or illegal activity, scam or fraud, spam, or other), and add details.</li>
            <li>The content is hidden from you immediately and our safety team reviews the report.</li>
            <li>To stop all contact, choose <strong className="text-foreground">Block user</strong> from the same menu. You can unblock later in Settings → Privacy &amp; Safety → Blocked users.</li>
          </ol>
          <p className="mt-2 text-xs text-muted-foreground">
            If you can't access the app, email {SUPPORT_EMAIL} with the username and a description of the content.
            For emergencies or immediate danger, contact local law enforcement or campus police first.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">How to delete your account</h2>
          <ol className="mt-2 space-y-2 text-xs text-muted-foreground list-decimal pl-4">
            <li>Open PlugU and go to Settings → Privacy &amp; Data → Delete account.</li>
            <li>Confirm the deletion. Your profile, listings, posts and messages are removed.</li>
            <li>Prefer email? Send a deletion request from your student email to {SUPPORT_EMAIL} and we'll process it {SUPPORT_RESPONSE_TIME}.</li>
          </ol>
          <p className="mt-2 text-xs text-muted-foreground">
            Records we must keep for legal or fraud-prevention reasons (such as transaction receipts) are retained as described in our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Frequently asked questions</h2>
          <div className="mt-3 space-y-2">
            {FAQS.map((f) => (
              <details key={f.q} className="rounded-2xl border border-border bg-card p-4">
                <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold">Policies</h2>
          <div className="mt-3 grid gap-2 text-sm">
            <Link to="/terms" className="rounded-xl border border-border bg-card px-4 py-3 text-primary underline">Terms of Use</Link>
            <Link to="/privacy" className="rounded-xl border border-border bg-card px-4 py-3 text-primary underline">Privacy Policy</Link>
            <Link to="/community-guidelines" className="rounded-xl border border-border bg-card px-4 py-3 text-primary underline">Community Guidelines</Link>
          </div>
        </section>

        {session && (
          <section>
            <h2 className="text-base font-semibold">Your requests</h2>
            {isLoading ? (
              <p className="mt-3 text-xs text-muted-foreground">Loading…</p>
            ) : history.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">You haven't opened any support requests yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {history.map((r) => (
                  <li key={r.id} className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold truncate">{r.subject}</p>
                      <StatusPill status={r.status} />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {(SUPPORT_CATEGORIES.find((c) => c.key === r.category)?.label ?? r.category)} · #{r.id.slice(0, 8)} · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-xs text-white/70 whitespace-pre-wrap line-clamp-4">{r.description}</p>
                    {r.admin_note && (
                      <p className="mt-2 text-xs text-emerald-300/90">Team reply: {r.admin_note}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}

const FAQS = [
  {
    q: "Who can use PlugU?",
    a: "PlugU is students-only. You need a valid .edu school email to create an account. Everyone you see is a verified student at a real college.",
  },
  {
    q: "Does PlugU cost anything?",
    a: "No. Accounts and every in-app feature are free. You only pay other students for the goods and services you buy from them.",
  },
  {
    q: "What isn't allowed on PlugU?",
    a: "Illegal drugs and controlled substances, weapons, stolen goods, fake IDs, academic cheating, counterfeit items, sexual services, hate speech, threats, harassment and scams. Violations are removed and accounts can be suspended or banned.",
  },
  {
    q: "I never received an order or service I paid for. What now?",
    a: "Open the order in PlugU and start a dispute, or send us the order ID through the form on this page. Our team reviews the transaction and can issue a refund where appropriate.",
  },
  {
    q: "How do I reset my password?",
    a: "On the sign-in screen tap \"Forgot password?\" and enter your school email. We'll send a secure reset link.",
  },
  {
    q: "How do I stop someone from contacting me?",
    a: "Block them from the three-dot menu on their profile, post or message. Blocking is instant and removes their content from your feeds everywhere in the app.",
  },
  {
    q: "How is my personal information handled?",
    a: "We only show your name, school and public profile details to other students. We never sell your data. Full details are in the Privacy Policy linked on this page.",
  },
];

function PublicSupportForm({ defaultSubject }: { defaultSubject: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("general");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const res = await submitPublicSupportMessage({
        data: { name: name.trim(), email: email.trim(), category, subject: subject.trim(), message: message.trim() },
      });
      setTicket(res?.ticketCode ?? null);
      setSent(true);
      setName(""); setEmail(""); setSubject(""); setMessage("");
      toast.success("Support request sent");
    } catch (err: any) {
      const detail = err?.issues?.[0]?.message ?? err?.message ?? "Couldn't send. Try again.";
      toast.error(detail);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <p className="text-xs text-muted-foreground">
        You don't need an account to contact us. If you have a PlugU account, sign in first so we can
        find your orders faster.
      </p>
      <Field label="Your name">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required
          className="mt-1 w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60" />
      </Field>
      <Field label="Email">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required
          placeholder="you@school.edu"
          className="mt-1 w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60" />
      </Field>
      <Field label="Topic">
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60">
          <option value="general">General question</option>
          <option value="report_problem">Report content or a user</option>
          <option value="account">Account or verification</option>
          <option value="payments">Payments or refunds</option>
          <option value="delete_account">Delete my account</option>
          <option value="bug">Bug or broken feature</option>
          <option value="other">Other</option>
        </select>
      </Field>
      <Field label="Subject">
        <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} required
          placeholder="Short summary"
          className="mt-1 w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60" />
      </Field>
      <Field label="Message">
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} rows={6} required
          placeholder="Tell us what happened and what you need help with."
          className="mt-1 w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60 resize-none" />
      </Field>
      <button type="submit" disabled={sending}
        className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold tap disabled:opacity-50 inline-flex items-center justify-center gap-2">
        {sending && <Loader2 className="h-4 w-4 animate-spin" />} {sending ? "Sending…" : "Send to support"}
      </button>
      {sent && (
        <p className="text-xs text-emerald-300 inline-flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Request received{ticket ? ` — ticket ${ticket}` : ""}. We'll reply by email {SUPPORT_RESPONSE_TIME}.
        </p>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-accent/15 text-accent border-accent/30",
    in_progress: "bg-[var(--plugu-purple)]/15 text-[var(--plugu-purple)] border-[var(--plugu-purple)]/30",
    resolved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    closed: "bg-secondary text-muted-foreground border-border",
  };
  return (
    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border ${map[status] ?? map.closed}`}>
      {status.replace("_", " ")}
    </span>
  );
}
