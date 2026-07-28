import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import {
  SUPPORT_CATEGORIES,
  submitSupportRequest,
  type SupportCategory,
} from "@/lib/support-db";

type Props = {
  defaultCategory?: SupportCategory;
  lockCategory?: boolean;
  defaultSubject?: string;
  defaultDescription?: string;
  defaultOrderId?: string;
  defaultListingId?: string;
  cta?: string;
  onSubmitted?: () => void;
};

export function SupportForm({
  defaultCategory = "general",
  lockCategory = false,
  defaultSubject = "",
  defaultDescription = "",
  defaultOrderId = "",
  defaultListingId = "",
  cta = "Send to support",
  onSubmitted,
}: Props) {
  const [category, setCategory] = useState<SupportCategory>(defaultCategory);
  const [subject, setSubject] = useState(defaultSubject);
  const [description, setDescription] = useState(defaultDescription);
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [listingId, setListingId] = useState(defaultListingId);
  const [sending, setSending] = useState(false);
  const [sentId, setSentId] = useState<string | null>(null);

  useEffect(() => { setCategory(defaultCategory); }, [defaultCategory]);

  const submit = async () => {
    if (sending) return;
    setSending(true);
    try {
      const res = await submitSupportRequest({
        category,
        subject,
        description,
        relatedOrderId: orderId || null,
        relatedListingId: listingId || null,
      });
      setSentId(res.id);
      setSubject("");
      setDescription("");
      setOrderId("");
      setListingId("");
      toast.success("Support request sent");
      onSubmitted?.();
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't send. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Category</span>
        <select
          value={category}
          disabled={lockCategory}
          onChange={(e) => setCategory(e.target.value as SupportCategory)}
          className="mt-1 w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60 disabled:opacity-60"
        >
          {SUPPORT_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Subject</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          placeholder="Short summary"
          className="mt-1 w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60"
        />
      </label>

      <label className="block">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={5000}
          rows={6}
          placeholder="Tell us what happened, what you expected, and any steps we can take to reproduce it."
          className="mt-1 w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60 resize-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Related order ID</span>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full bg-card border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-primary/60"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Related listing ID</span>
          <input
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full bg-card border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-primary/60"
          />
        </label>
      </div>

      <button
        onClick={submit}
        disabled={sending || !subject.trim() || !description.trim()}
        className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold tap disabled:opacity-50"
      >
        {sending ? "Sending…" : cta}
      </button>

      {sentId && (
        <p className="text-xs text-emerald-300 inline-flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Request #{sentId.slice(0, 8)} received. We'll reply by email.
        </p>
      )}
    </div>
  );
}