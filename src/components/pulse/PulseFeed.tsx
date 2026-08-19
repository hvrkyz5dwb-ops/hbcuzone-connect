import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Radio, Sparkles } from "lucide-react";
import { useAvailability, useDrops, type AvailabilityWithSeller, type DropWithSeller } from "@/hooks/use-pulse";
import { useMarketplace } from "@/hooks/use-listings";
import { useProfile } from "@/hooks/use-profile";
import { claimFlashDrop } from "@/lib/pulse-db";
import { ErrorState } from "@/components/QueryStates";
import { AvailableNowCard, DropCard, money } from "./PulseCards";

export const PULSE_FILTERS = [
  { key: "all", label: "All" },
  { key: "available", label: "Available now" },
  { key: "food", label: "Food" },
  { key: "hair", label: "Hair" },
  { key: "nails", label: "Beauty" },
  { key: "rides", label: "Rides" },
  { key: "events", label: "Events" },
  { key: "clothing", label: "Clothing" },
  { key: "services", label: "Services" },
  { key: "trending", label: "Trending" },
] as const;

export type PulseFilter = (typeof PULSE_FILTERS)[number]["key"];

const SERVICE_CATEGORIES = ["hair", "nails", "photo", "design", "music", "tutoring", "rides"];

type Item =
  | { kind: "availability"; at: number; row: AvailabilityWithSeller }
  | { kind: "drop"; at: number; row: DropWithSeller }
  | { kind: "listing"; at: number; id: string; title: string; price: number; who: string; category: string };

export function PulseFilterBar({ value, onChange }: { value: PulseFilter; onChange: (v: PulseFilter) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {PULSE_FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => onChange(f.key)}
          aria-pressed={value === f.key}
          className={`tap shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-colors ${
            value === f.key
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export function PulseFeed({ filter }: { filter: PulseFilter }) {
  const qc = useQueryClient();
  const { profile } = useProfile();
  const availability = useAvailability({ limit: 40 });
  const drops = useDrops({ limit: 40 });
  const listings = useMarketplace({
    school_id: profile?.school_id ?? undefined,
    campus_scope: profile?.school_id ? "mine" : "all",
    sort: filter === "trending" ? "popular" : "newest",
    limit: 12,
  });

  const loading = availability.isLoading || drops.isLoading || listings.isLoading;
  const failed = availability.isError && drops.isError;

  async function claim(id: string) {
    try {
      const res = await claimFlashDrop(id);
      if (res?.claimed) {
        toast.success("Offer claimed", { description: "Show this at checkout with the plug." });
      } else {
        toast.error(
          res?.reason === "sold out" ? "That flash drop just sold out"
            : res?.reason === "expired" ? "That flash drop already ended"
            : res?.reason === "already claimed" ? "You already claimed this one"
            : "Couldn't claim that offer",
        );
      }
      qc.invalidateQueries({ queryKey: ["drops"] });
    } catch {
      toast.error("Couldn't claim that offer. Try again.");
    }
  }

  const items = useMemo<Item[]>(() => {
    const matchCat = (c?: string | null) => {
      if (filter === "all" || filter === "trending" || filter === "available") return true;
      if (filter === "services") return !!c && SERVICE_CATEGORIES.includes(c);
      return c === filter;
    };
    const out: Item[] = [];
    for (const row of availability.data ?? []) {
      if (!matchCat(row.category)) continue;
      out.push({ kind: "availability", at: new Date(row.updated_at).getTime(), row });
    }
    if (filter !== "available") {
      for (const row of drops.data?.items ?? []) {
        if (!matchCat(row.category)) continue;
        out.push({ kind: "drop", at: new Date(row.created_at).getTime(), row });
      }
      for (const l of listings.data ?? []) {
        if (!matchCat(l.category)) continue;
        out.push({
          kind: "listing", at: new Date(l.created_at).getTime(), id: l.id, title: l.title,
          price: l.price_cents, category: l.category,
          who: l.seller?.display_name ?? l.campus_name ?? "New on your campus",
        });
      }
    }
    // Availability and flash drops always float to the top — they are the
    // things a student can act on right this minute.
    return out.sort((a, b) => {
      const rank = (i: Item) => (i.kind === "availability" ? 0 : i.kind === "drop" && i.row.is_flash ? 1 : 2);
      return rank(a) - rank(b) || b.at - a.at;
    });
  }, [availability.data, drops.data, listings.data, filter]);

  if (failed) {
    return (
      <ErrorState
        title="Campus activity couldn't load"
        description="We couldn't reach the campus feed. Check your connection and try again."
        onRetry={() => { availability.refetch(); drops.refetch(); }}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-2.5 px-5 pt-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-card" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-5 mt-4 rounded-3xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-border text-primary">
          <Radio className="h-5 w-5" />
        </div>
        <h3 className="mt-3 text-sm font-semibold">Nobody is available right now</h3>
        <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
          Campus is quiet on this filter. Check another category, or flip on Available Now and be the plug.
        </p>
        <Link
          to="/seller"
          className="tap mt-4 inline-block rounded-full bg-[image:var(--gradient-bronze)] px-4 py-2 text-[11px] font-semibold text-primary-foreground"
        >
          Go available
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 px-5 pt-3">
      {items.map((it) =>
        it.kind === "availability" ? (
          <AvailableNowCard key={`a-${it.row.id}`} row={it.row} />
        ) : it.kind === "drop" ? (
          <DropCard
            key={`d-${it.row.id}`}
            drop={it.row}
            claimed={drops.data?.claimed.has(it.row.id)}
            onClaim={claim}
          />
        ) : (
          <Link
            key={`l-${it.id}`}
            to="/checkout/$listingId"
            params={{ listingId: it.id }}
            className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-border text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{it.title}</p>
              <p className="truncate text-[11px] text-muted-foreground">New listing · {it.who}</p>
            </div>
            <span className="text-xs font-bold" style={{ color: "var(--plugu-gold)" }}>{money(it.price)}</span>
          </Link>
        ),
      )}
    </div>
  );
}

export function AvailableNowRail() {
  const { data, isLoading } = useAvailability({ limit: 12 });
  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto px-5 pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 w-56 shrink-0 animate-pulse rounded-2xl border border-border bg-card" />
        ))}
      </div>
    );
  }
  if (!data || data.length === 0) return null;
  return (
    <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {data.map((row) => <AvailableNowCard key={row.id} row={row} compact />)}
    </div>
  );
}

export function FlashDropsRail() {
  const qc = useQueryClient();
  const { data, isLoading } = useDrops({ flashOnly: true, limit: 10 });
  async function claim(id: string) {
    const res = await claimFlashDrop(id).catch(() => null);
    if (res?.claimed) toast.success("Offer claimed");
    else toast.error(res?.reason === "sold out" ? "Just sold out" : "Couldn't claim that offer");
    qc.invalidateQueries({ queryKey: ["drops"] });
  }
  if (isLoading) return null;
  if (!data || data.items.length === 0) return null;
  return (
    <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {data.items.map((d) => (
        <DropCard key={d.id} drop={d} compact claimed={data.claimed.has(d.id)} onClaim={claim} />
      ))}
    </div>
  );
}

export function EventsTonightRail() {
  const { profile } = useProfile();
  const { data, isLoading } = useMarketplace({
    category: "events",
    school_id: profile?.school_id ?? undefined,
    sort: "newest",
    limit: 6,
  });
  if (isLoading || !data || data.length === 0) return null;
  return (
    <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {data.map((e) => (
        <Link
          key={e.id}
          to="/checkout/$listingId"
          params={{ listingId: e.id }}
          className="tap w-56 min-w-[220px] shrink-0 rounded-2xl border border-border bg-card p-3"
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: "var(--plugu-gold)" }}>
            <CalendarDays className="h-3 w-3" /> Event
          </div>
          <p className="mt-1.5 truncate text-sm font-semibold">{e.title}</p>
          <p className="truncate text-[11px] text-muted-foreground">{e.campus_name ?? "Campus"}</p>
          <p className="mt-1 text-xs font-bold" style={{ color: "var(--plugu-gold)" }}>{money(e.price_cents)}</p>
        </Link>
      ))}
    </div>
  );
}
