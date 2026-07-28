import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SupportForm } from "@/components/SupportForm";
import { useSession } from "@/hooks/use-session";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: "Delete Account — PlugU" },
      { name: "description", content: "Request permanent deletion of your PlugU account and associated data." },
      { property: "og:title", content: "Delete your PlugU account" },
      { property: "og:description", content: "Submit a verified deletion request for your PlugU account." },
    ],
  }),
  component: DeleteAccount,
});

function DeleteAccount() {
  const { session } = useSession();
  const [confirmed, setConfirmed] = useState(false);

  return (
    <AppShell title="DELETE ACCOUNT">
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: "var(--plugu-gold)" }}>Delete your account</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Deletion is permanent. Your profile, listings, messages, and reviews will be removed from PlugU. Some records (orders, payouts, safety reports) may be retained where required by law or to prevent fraud.
          </p>
        </header>

        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
          <p className="font-semibold inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Before you delete
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-xs text-rose-100/85">
            <li>Cancel any active seller subscription from Manage Plan.</li>
            <li>Complete or refund any open orders and bookings.</li>
            <li>Download anything you want to keep (messages, receipts).</li>
          </ul>
        </div>

        {!session ? (
          <div className="rounded-2xl border border-border bg-card p-5 text-sm">
            Please <Link to="/auth" className="underline text-accent">sign in</Link> so we can verify the request comes from the account owner.
          </div>
        ) : (
          <>
            <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span>
                I understand this is a permanent deletion request. PlugU will confirm by email before removing my account.
              </span>
            </label>
            {confirmed && (
              <SupportForm
                defaultCategory="delete_account"
                lockCategory
                defaultSubject="Account deletion request"
                defaultDescription="Please permanently delete my PlugU account."
                cta="Submit deletion request"
              />
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}