// One-time mandatory policy acceptance for existing accounts. Nothing in the
// app is reachable until the current policy version is accepted and recorded.
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { hasAcceptedCurrentPolicy, recordPolicyAcceptance, POLICY_CONSENT_TEXT } from "@/lib/policy";
import { signOutAndReset } from "@/lib/sign-out";

export function TermsGate() {
  const { session, loading } = useSession();
  const uid = session?.user?.id ?? null;
  const qc = useQueryClient();
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  const q = useQuery({
    queryKey: ["policy-accepted", uid],
    enabled: !!uid,
    staleTime: Infinity,
    queryFn: () => hasAcceptedCurrentPolicy(uid!),
  });

  if (loading || !uid || q.isPending || q.data !== false) return null;

  const accept = async () => {
    if (!checked || busy) return;
    setBusy(true);
    try {
      await recordPolicyAcceptance(uid);
      await qc.invalidateQueries({ queryKey: ["policy-accepted", uid] });
    } catch (e) {
      toast.error("Couldn't save your acceptance", { description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/95 p-4 backdrop-blur-xl">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
        <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-accent">
          <ScrollText className="h-3 w-3" /> Updated policies
        </p>
        <h1 className="mt-2 text-xl font-bold">Please review and accept</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          We've updated the documents that govern PlugU. Accept them to keep using your account.
        </p>

        <div className="mt-4 grid gap-2">
          <PolicyLink to="/terms" label="Terms of Use" />
          <PolicyLink to="/privacy" label="Privacy Policy" />
          <PolicyLink to="/community-guidelines" label="Community Guidelines" />
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-2xl border border-border bg-background/60 p-3 text-[12px] leading-snug">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--plugu-gold)]"
          />
          <span>{POLICY_CONSENT_TEXT}</span>
        </label>

        <button
          onClick={accept}
          disabled={!checked || busy}
          className="tap mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Agree and continue
        </button>
        <button
          onClick={() => signOutAndReset(qc)}
          className="mt-3 w-full text-[11px] text-muted-foreground underline"
        >
          Sign out instead
        </button>
      </div>
    </div>
  );
}

function PolicyLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to as "/terms"}
      target="_blank"
      className="rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-primary underline"
    >
      {label}
    </Link>
  );
}
