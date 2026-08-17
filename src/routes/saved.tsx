import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, HeartOff, Store } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageLoader, ErrorState } from "@/components/QueryStates";
import { fetchSavedListings } from "@/lib/listings-db";
import { useSession } from "@/hooks/use-session";
import { money } from "@/lib/format";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved listings — PlugU" },
      { name: "description", content: "Everything you saved from the PlugU campus marketplace, in one place." },
      { property: "og:title", content: "Saved listings — PlugU" },
      { property: "og:description", content: "Keep track of the student drops and services you love." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Saved,
});

function Saved() {
  const { session, loading } = useSession();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["saved-listings", session?.user.id ?? "guest"],
    queryFn: fetchSavedListings,
    enabled: !!session,
  });

  return (
    <AppShell title="SAVED">
      <section className="px-5 pt-5">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" /> Saved listings
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Tap the heart on any listing to keep it here.
        </p>

        {!loading && !session && (
          <EmptyCard
            title="Sign in to save listings"
            body="Your saved drops and services follow your PlugU account."
            to="/auth"
            cta="Sign in"
          />
        )}

        {session && (isPending || loading) && <PageLoader message="Loading your saves…" />}

        {session && isError && (
          <ErrorState
            title="Couldn't load your saves"
            description="We couldn't reach your saved listings. Check your connection and try again."
            onRetry={() => void refetch()}
          />
        )}

        {session && !isPending && !isError && (data ?? []).length === 0 && (
          <EmptyCard
            title="Nothing saved yet"
            body="Browse the marketplace and tap the heart on anything you want to come back to."
            to="/market"
            cta="Browse the marketplace"
          />
        )}

        {session && (data ?? []).length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(data ?? []).map((l, i) => (
              <Link
                key={l.id}
                to="/checkout/$listingId"
                params={{ listingId: l.id }}
                className="tap rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/40 transition-colors"
                style={{ animation: `plugu-fade-up 0.4s ease-out ${Math.min(i, 10) * 35}ms both` }}
              >
                {l.images[0]?.url ? (
                  <img src={l.images[0].url} alt={l.title} loading="lazy" className="aspect-square w-full object-cover" />
                ) : (
                  <div className="aspect-square w-full grid place-items-center bg-secondary text-muted-foreground">
                    <Store className="h-6 w-6" aria-hidden="true" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-2">{l.title}</p>
                  <p className="text-primary font-bold mt-1 text-sm">{money(l.price_cents)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function EmptyCard({ title, body, to, cta }: { title: string; body: string; to: string; cta: string }) {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <HeartOff className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">{body}</p>
      <Link
        to={to}
        className="tap mt-5 inline-flex items-center justify-center rounded-full bg-[image:var(--gradient-bronze)] px-4 py-2.5 text-xs font-semibold text-primary-foreground"
      >
        {cta}
      </Link>
    </div>
  );
}
