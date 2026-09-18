import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-errors";

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: "Delete Account — PlugU" },
      { name: "description", content: "Permanently delete your PlugU account and personal data from inside the app." },
      { property: "og:title", content: "Delete your PlugU account" },
      { property: "og:description", content: "Permanent, in-app account deletion for PlugU students." },
    ],
  }),
  component: DeleteAccount,
});

function DeleteAccount() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const email = session?.user?.email ?? "";
  const ready = phrase.trim().toUpperCase() === "DELETE" && password.length > 0;

  async function runDelete() {
    if (!ready || busy) return;
    setBusy(true);
    setErr(null);
    try {
      // Reauthenticate: the password must match the signed-in account.
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) {
        setErr("That password doesn't match this account.");
        setBusy(false);
        return;
      }
      await deleteMyAccount();
      await supabase.auth.signOut({ scope: "global" }).catch(() => {});
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
      } catch {}
      toast.success("Your account has been permanently deleted.");
      navigate({ to: "/auth", search: { next: "/", mode: "" } });
    } catch (e) {
      setErr(friendlyError(e, "We couldn't complete the deletion. Please try again."));
      setBusy(false);
    }
  }

  return (
    <AppShell title="DELETE ACCOUNT">
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>Delete your account</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            This is permanent and immediate. Your profile, listings, posts, uploaded media, messages,
            reviews, saved items and notifications are deleted, and every active session is revoked.
            Completed order and payout records are kept in de-identified form for the period tax and
            fraud-prevention law requires; they are no longer linked to your name or contact details.
          </p>
        </header>

        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
          <p className="font-semibold inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Before you delete
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-xs text-rose-100/85">
            <li>Let buyers know if you have listings or bookings still open.</li>
            <li>Complete or refund any open orders and bookings.</li>
            <li>Download anything you want to keep (messages, receipts).</li>
          </ul>
        </div>

        {!session ? (
          <div className="rounded-2xl border border-border bg-card p-5 text-sm">
            Please <Link to="/auth" className="underline text-accent">sign in</Link> so we can verify the request comes from the account owner.
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="del-pass">
                Confirm your password for {email}
              </label>
              <input
                id="del-pass"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm"
                placeholder="Password"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="del-phrase">
                Type DELETE to confirm
              </label>
              <input
                id="del-phrase"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm tracking-[0.2em]"
                placeholder="DELETE"
              />
            </div>
            {err && <p className="text-xs text-rose-300">{err}</p>}
            <button
              type="button"
              disabled={!ready || busy}
              onClick={runDelete}
              className="tap w-full rounded-2xl bg-rose-600 disabled:opacity-40 px-4 py-3.5 text-sm font-semibold text-white inline-flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Deleting…" : "Permanently delete my account"}
            </button>
            <p className="text-[11px] text-muted-foreground">
              You never need to email or call support to delete your account — this button does it.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
