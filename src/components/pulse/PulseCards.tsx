import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BadgeCheck, Clock, MapPin, Star, Zap, MessageCircle, CalendarCheck } from "lucide-react";
import { countdown, sellerName, untilLabel } from "@/lib/pulse-db";
import type { AvailabilityWithSeller, DropWithSeller } from "@/hooks/use-pulse";
import { ContentMenu } from "@/components/ContentMenu";

export function money(cents?: number | null) {
  if (cents == null) return null;
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function Avatar({ url, name }: { url?: string | null; name: string }) {
  return url ? (
    <img src={url} alt="" loading="lazy" className="h-10 w-10 rounded-xl object-cover" />
  ) : (
    <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground text-sm font-bold">
      {name[0]?.toUpperCase() ?? "P"}
    </div>
  );
}

export function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  );
}

export function AvailableNowCard({ row, compact = false }: { row: AvailabilityWithSeller; compact?: boolean }) {
  const name = sellerName(row.seller);
  const until = untilLabel(row.available_until);
  const price = money(row.price_from_cents);
  return (
    <div
      className={`rounded-2xl border border-emerald-500/25 bg-card p-3 ${compact ? "min-w-[220px] w-56 shrink-0" : ""}`}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
        <LiveDot /> Available now
        <ContentMenu
          className="ml-auto"
          targetType="post"
          targetId={row.id}
          targetLabel={row.service_label || "Available now"}
          snapshot={`${name} · ${row.service_label ?? "Available now"}`}
          authorUserId={row.seller_user_id}
          authorLabel={name}
        />
      </div>
      <div className="mt-2 flex items-center gap-2.5">
        <Avatar url={row.seller?.avatar_url} name={name} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <span className="truncate">{name}</span>
            {row.seller?.verification_status === "verified" && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Verified student" />
            )}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {row.service_label || "Available for work"}
          </p>
        </div>
      </div>
      <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
        {until && (
          <li className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Until {until}</li>
        )}
        {row.zone_name && (
          <li className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {row.zone_name}</li>
        )}
        {price && (
          <li className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--plugu-gold)" }}>
            From {price}
            {row.slots_remaining != null && (
              <span className="text-muted-foreground font-normal">· {row.slots_remaining} slot{row.slots_remaining === 1 ? "" : "s"} left</span>
            )}
          </li>
        )}
      </ul>
      <div className="mt-2.5 flex gap-2">
        {row.listing_id ? (
          <Link
            to="/checkout/$listingId"
            params={{ listingId: row.listing_id }}
            className="tap flex-1 rounded-xl bg-primary px-3 py-2 text-center text-[11px] font-semibold text-primary-foreground"
          >
            Book now
          </Link>
        ) : (
          <Link
            to="/market"
            className="tap flex-1 rounded-xl bg-primary px-3 py-2 text-center text-[11px] font-semibold text-primary-foreground"
          >
            See listings
          </Link>
        )}
        {row.seller?.username && (
          <Link
            to="/u/$username"
            params={{ username: row.seller.username }}
            className="tap rounded-xl border border-border px-3 py-2 text-[11px] font-semibold text-muted-foreground"
          >
            Profile
          </Link>
        )}
      </div>
    </div>
  );
}

function useTick(active: boolean) {
  const [, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setN((n) => n + 1), 30_000);
    return () => window.clearInterval(t);
  }, [active]);
}

export function DropCard({
  drop, claimed, onClaim, compact = false,
}: {
  drop: DropWithSeller;
  claimed?: boolean;
  onClaim?: (id: string) => void;
  compact?: boolean;
}) {
  useTick(drop.is_flash);
  const name = sellerName(drop.seller);
  const left = drop.quantity_limit != null ? Math.max(0, drop.quantity_limit - drop.quantity_claimed) : null;
  const soldOut = left === 0;
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-card ${compact ? "min-w-[240px] w-60 shrink-0" : ""} ${
        drop.is_flash ? "border-amber-400/40" : "border-border"
      }`}
    >
      {drop.image_url && (
        <img src={drop.image_url} alt="" loading="lazy" className="h-28 w-full object-cover" />
      )}
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: drop.is_flash ? "var(--plugu-gold)" : undefined }}
          >
            {drop.is_flash ? <><Zap className="h-3 w-3" /> Flash drop</> : <span className="text-muted-foreground">Drop</span>}
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">{countdown(drop.expires_at)} left</span>
          <ContentMenu
            targetType="post"
            targetId={drop.id}
            targetLabel={drop.body}
            snapshot={`${name} · ${drop.body}`}
            authorUserId={drop.seller_user_id}
            authorLabel={name}
          />
        </div>
        <p className="mt-1.5 text-sm font-semibold leading-snug text-foreground">{drop.body}</p>
        <p className="mt-1 truncate text-[11px] text-muted-foreground">
          {name}{drop.zone_name ? ` · ${drop.zone_name}` : ""}
        </p>
        {(drop.discount_percent || drop.price_cents != null) && (
          <p className="mt-1 text-xs font-bold" style={{ color: "var(--plugu-gold)" }}>
            {drop.discount_percent ? `${drop.discount_percent}% off` : money(drop.price_cents)}
            {left != null && <span className="ml-1.5 font-normal text-muted-foreground">{left} left</span>}
          </p>
        )}
        <div className="mt-2.5 flex gap-2">
          {drop.is_flash && onClaim && (
            <button
              type="button"
              disabled={claimed || soldOut}
              onClick={() => onClaim(drop.id)}
              className="tap flex-1 rounded-xl bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground disabled:opacity-50"
            >
              {claimed ? "Claimed ✓" : soldOut ? "Sold out" : "Claim offer"}
            </button>
          )}
          {drop.listing_id && (
            <Link
              to="/checkout/$listingId"
              params={{ listingId: drop.listing_id }}
              className="tap flex-1 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-center text-[11px] font-semibold text-primary"
            >
              <CalendarCheck className="mr-1 inline h-3 w-3" />
              {drop.cta === "buy" ? "Buy" : "Book"}
            </Link>
          )}
          {!drop.listing_id && !drop.is_flash && drop.seller?.username && (
            <Link
              to="/u/$username"
              params={{ username: drop.seller.username }}
              className="tap flex-1 rounded-xl border border-border px-3 py-2 text-center text-[11px] font-semibold text-muted-foreground"
            >
              <MessageCircle className="mr-1 inline h-3 w-3" /> View plug
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function RatingPill({ avg, count }: { avg?: number | null; count?: number | null }) {
  if (!avg || !count) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
      <Star className="h-3 w-3 fill-current" style={{ color: "var(--plugu-gold)" }} /> {avg.toFixed(1)} ({count})
    </span>
  );
}
