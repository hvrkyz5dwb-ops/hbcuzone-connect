import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// The Supabase auth.oauth namespace is beta and may not be visible to TypeScript.
// Keep a tiny local typed wrapper for the three methods we call.
type OAuthClient = { name?: string } | null | undefined;
type OAuthDetails = {
  client?: OAuthClient;
  redirect_url?: string;
  redirect_to?: string;
  scopes?: string[];
};
type OAuthResult = { data: OAuthDetails | null; error: { message: string } | null };

function oauthClient() {
  const anyAuth = (supabase.auth as unknown as { oauth?: {
    getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
    approveAuthorization: (id: string) => Promise<OAuthResult>;
    denyAuthorization: (id: string) => Promise<OAuthResult>;
  } }).oauth;
  if (!anyAuth) throw new Error("Supabase OAuth server helpers are not available in this client.");
  return anyAuth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthClient().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Authorization unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "an external app";

  async function decide(approve: boolean) {
    setBusy(true);
    setErr(null);
    const { data, error } = approve
      ? await oauthClient().approveAuthorization(authorization_id)
      : await oauthClient().denyAuthorization(authorization_id);
    if (error) { setBusy(false); setErr(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setErr("No redirect returned by the authorization server."); return; }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <p className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground">PlugU · Connect</p>
        <h1 className="mt-2 text-2xl font-bold plugu-antique-wordmark">
          Connect {clientName} to PlugU
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {clientName} will be able to call PlugU tools while you're signed in — read the HBCU
          directory, school details, scholarships, and your own PlugU identity.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          This does not bypass PlugU's rules or share your password.
        </p>
        {err && (
          <p role="alert" className="mt-4 text-sm text-destructive">{err}</p>
        )}
        <div className="mt-6 flex gap-2">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Working…" : "Approve"}
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
          >
            Deny
          </button>
        </div>
      </div>
    </main>
  );
}