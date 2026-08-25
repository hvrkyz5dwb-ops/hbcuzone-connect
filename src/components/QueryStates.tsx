import { Link, useRouter } from "@tanstack/react-router";
import { House, RefreshCw, TriangleAlert, MapPinOff } from "lucide-react";
import { ChargingLoader } from "@/components/ChargingLoader";

/**
 * Shared loading / error / not-found states so no screen ever renders blank
 * during slow or failed requests.
 *
 * - PageLoader            — centered branded pending indicator for route bodies
 * - ErrorState            — friendly failure card with retry, for query errors
 * - RoutePendingFallback  — router defaultPendingComponent
 * - RouteErrorFallback    — router defaultErrorComponent
 * - RouteNotFoundFallback — router defaultNotFoundComponent
 */

export function PageLoader({ message = "Plugging you in…" }: { message?: string }) {
  return (
    <div className="grid place-items-center py-16" role="status" aria-live="polite">
      <ChargingLoader size={44} message={message} />
    </div>
  );
}

export function ErrorState({
  title = "Couldn't plug in",
  description = "The connection dropped on our end. Check your network and try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="mx-5 my-8 rounded-3xl border border-dashed border-destructive/40 bg-card/50 px-6 py-10 text-center view-enter"
      role="alert"
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/15 text-destructive">
        <TriangleAlert className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="tap mt-4 inline-flex items-center gap-1.5 rounded-full bg-[image:var(--gradient-bronze)] px-4 py-2 text-[11px] font-semibold text-primary-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </button>
      )}
    </div>
  );
}

export function RoutePendingFallback() {
  return <ChargingLoader full message="Plugging you in…" />;
}

export function RouteErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const detail = (error as any)?.message ? String((error as any).message) : "";
  if (typeof window !== "undefined") {
    // Surface the underlying cause so it shows up in the console, not just the card.
    console.error("[PlugU route error]", error);
  }
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="w-full max-w-xs rounded-3xl border border-destructive/40 bg-card px-6 py-10 text-center" role="alert">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/15 text-destructive">
          <TriangleAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-lg font-bold tracking-tight">Something didn't plug in</h1>
        <p className="mx-auto mt-1 text-xs text-muted-foreground">
          This screen hit an unexpected error. Your data is safe — try reloading it.
        </p>
        {detail && (
          <p className="mx-auto mt-2 max-w-[16rem] break-words text-[10px] leading-relaxed text-muted-foreground/70">
            {detail.slice(0, 220)}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              reset();
              void router.invalidate();
            }}
            className="tap inline-flex items-center justify-center gap-1.5 rounded-full bg-[image:var(--gradient-bronze)] px-4 py-2.5 text-xs font-semibold text-primary-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reload this screen
          </button>
          <Link to="/" className="tap inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground">
            <House className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RouteNotFoundFallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="w-full max-w-xs rounded-3xl border border-dashed border-border bg-card px-6 py-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground">
          <MapPinOff className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-lg font-bold tracking-tight">This plug doesn't reach here</h1>
        <p className="mx-auto mt-1 text-xs text-muted-foreground">
          The page you're looking for moved or never existed.
        </p>
        <Link
          to="/"
          className="tap mt-5 inline-flex items-center justify-center gap-1.5 rounded-full bg-[image:var(--gradient-bronze)] px-4 py-2.5 text-xs font-semibold text-primary-foreground"
        >
          <House className="h-3.5 w-3.5" /> Back to Home
        </Link>
      </div>
    </div>
  );
}