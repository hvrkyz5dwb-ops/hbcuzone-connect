// Personalized Home — the six Campus OS sections, each self-contained so the
// student can reorder or hide them. All reads are public/own-user data only.
import type React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays, ChevronRight, GraduationCap, MapPin, Megaphone,
  Package, MessageSquare, Bookmark, SlidersHorizontal, ArrowUp, ArrowDown, Eye, EyeOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/AppShell";
import { RightNowRail } from "@/components/home/RightNowRail";
import { useProfile } from "@/hooks/use-profile";
import { useMarketplace } from "@/hooks/use-listings";
import { useMyOrders } from "@/hooks/use-orders";
import { useUnreadCount } from "@/hooks/use-messages";
import { useHomeLayout } from "@/hooks/use-home-layout";
import { HOME_SECTIONS, type HomeSectionKey } from "@/lib/campus-os";
import { opportunities, opportunityMeta } from "@/lib/opportunities-data";
import { useActiveCampus } from "@/hooks/use-campus-os";
import { useSession } from "@/hooks/use-session";

const db = supabase as any;

function Empty({ text, cta, to }: { text: string; cta?: string; to?: string }) {
  return (
    <div className="mx-5 rounded-2xl border border-dashed border-border bg-card/50 p-4 text-center">
      <p className="text-xs text-muted-foreground">{text}</p>
      {cta && to && (
        <Link to={to} className="tap mt-2 inline-block text-xs font-semibold text-primary">
          {cta}
        </Link>
      )}
    </div>
  );
}

function Skeleton({ n = 3, rail = false }: { n?: number; rail?: boolean }) {
  if (rail) {
    // Matches the real rail card footprint so swapping in data causes no layout shift.
    return (
      <div className="flex gap-3 overflow-hidden px-5 pb-1" aria-hidden="true">
        {Array.from({ length: n }).map((_, i) => (
          <div key={i} className="h-[104px] w-[230px] shrink-0 animate-pulse rounded-2xl border border-border bg-card" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2 px-5" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl border border-border bg-card" />
      ))}
    </div>
  );
}


/* --------------------------------- Around You --------------------------------- */

function AroundYou() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { data, isLoading } = useMarketplace({
    school_id: profile?.school_id ?? undefined,
    campus_scope: profile?.school_id ? "mine" : "all",
    sort: "newest",
    limit: 10,
  });
  const nearby = (data ?? []).filter((l) => l.kind === "service").slice(0, 5);

  return (
    <section className="mt-7" aria-labelledby="home-around-you">
      <SectionHeader title="Student Services Near You" action="Open map" onAction={() => navigate({ to: "/map" })} />
      <h2 id="home-around-you" className="sr-only">Student Services Near You</h2>
      {/* Reserved height matches the skeleton so resolving data never shifts the page. */}
      <div className="min-h-[208px]">
      {isLoading ? (
        <Skeleton />
      ) : nearby.length ? (
        <ul className="space-y-2 px-5">
          {nearby.map((s) => (
            <li key={s.id}>
              <Link
                to="/checkout/$listingId"
                params={{ listingId: s.id }}
                className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[image:var(--gradient-bronze)] font-bold text-primary-foreground">
                  {s.title[0]?.toUpperCase() ?? "?"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{s.title}</span>
                  <span className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {s.campus_name ?? s.seller?.school_name ?? "Nearby"} · ${(s.price_cents / 100).toFixed(0)}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty text="No student services listed on your campus yet." cta="Offer a service" to="/seller/onboarding" />
      )}
      </div>

    </section>
  );
}

/* ----------------------------------- Tonight ---------------------------------- */

function Tonight() {
  const { campus } = useActiveCampus();
  const q = useQuery({
    queryKey: ["home-tonight", campus?.school_id ?? campus?.id ?? "all"],
    staleTime: 60_000,
    queryFn: async () => {
      const now = new Date();
      const end = new Date(now.getTime() + 18 * 3600_000);
      const { data } = await db
        .from("campus_events")
        .select("id, title, location, starts_at, category, status")
        .eq("status", "published")
        .gte("starts_at", now.toISOString())
        .lte("starts_at", end.toISOString())
        .order("starts_at", { ascending: true })
        .limit(6);
      return (data ?? []) as any[];
    },
  });

  return (
    <section className="mt-7" aria-labelledby="home-tonight">
      <SectionHeader title="Campus Events" />
      <h2 id="home-tonight" className="sr-only">Campus Events</h2>
      {/* Reserved height so the skeleton, rail and empty state all occupy the same space. */}
      <div className="min-h-[112px]">
      {q.isPending ? (
        <Skeleton n={2} rail />
      ) : (q.data ?? []).length ? (
        <ul tabIndex={0} className="flex snap-x gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {q.data!.map((e) => (
            <li key={e.id} className="w-[230px] shrink-0 snap-start">
              <Link to="/events" className="tap block h-full rounded-2xl border border-border bg-card p-3.5">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: "var(--plugu-gold)" }}>
                  <CalendarDays className="h-3 w-3" aria-hidden="true" /> {e.category ?? "Event"}
                </span>
                <p className="mt-1.5 line-clamp-2 text-sm font-semibold">{e.title}</p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                  {new Date(e.starts_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {e.location}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty text="Nothing verified on the calendar for tonight." cta="Browse all events" to="/events" />
      )}
      </div>

    </section>
  );
}

/* -------------------------------- Opportunities ------------------------------- */

function Opportunities() {
  const navigate = useNavigate();
  const picks = opportunities.filter((o) => o.kind === "scholarship" || o.kind === "internship" || o.kind === "job").slice(0, 6);
  return (
    <section className="mt-7" aria-labelledby="home-opps">
      <SectionHeader title="Scholarships and Opportunities" action="See all" onAction={() => navigate({ to: "/hub" })} />
      <h2 id="home-opps" className="sr-only">Scholarships and Opportunities</h2>
      <ul tabIndex={0} className="flex snap-x gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {picks.map((o) => {
          const meta = opportunityMeta[o.kind];
          const Icon = meta.icon;
          return (
            <li key={o.id} className="w-[210px] shrink-0 snap-start">
              <Link to="/hub" className="tap block h-full rounded-2xl border border-border bg-card p-3.5">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <Icon className="h-3 w-3" aria-hidden="true" /> {meta.label}
                </span>
                <p className="mt-1.5 line-clamp-2 text-sm font-semibold">{o.title}</p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">{o.org}</p>
                <p className="mt-1 text-xs font-bold" style={{ color: "var(--plugu-gold)" }}>
                  {o.meta}{o.due ? ` · due ${o.due}` : ""}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 flex items-center gap-1 px-5 text-[10px] text-muted-foreground">
        <GraduationCap className="h-3 w-3" aria-hidden="true" /> Always confirm deadlines on the provider's official site.
      </p>
    </section>
  );
}

/* -------------------------------- Campus Updates ------------------------------ */

function CampusUpdates() {
  const { campus } = useActiveCampus();
  const q = useQuery({
    queryKey: ["home-campus-updates", campus?.school_id ?? "all"],
    staleTime: 120_000,
    queryFn: async () => {
      const { data } = await db
        .from("org_announcements")
        .select("id, body, created_at")
        .order("created_at", { ascending: false })
        .limit(4);
      return (data ?? []) as any[];
    },
  });

  return (
    <section className="mt-7" aria-labelledby="home-updates">
      <SectionHeader title="Campus Updates" />
      <h2 id="home-updates" className="sr-only">Campus Updates</h2>
      {/* Reserved height matches the skeleton so resolving data never shifts the page. */}
      <div className="min-h-[136px]">
      {q.isPending ? (
        <Skeleton n={2} />
      ) : (q.data ?? []).length ? (
        <ul className="space-y-2 px-5">
          {q.data!.map((a) => (
            <li key={a.id} className="rounded-2xl border border-border bg-card p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <Megaphone className="h-3 w-3" aria-hidden="true" /> Organization announcement
              </p>
              <p className="mt-1.5 text-sm">{a.body}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {new Date(a.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <Empty text="No official announcements posted right now. Campus information is being verified." />
      )}
      </div>

    </section>
  );
}

/* --------------------------------- Your Activity ------------------------------ */

function YourActivity() {
  const { session } = useSession();
  const orders = useMyOrders("all");
  const unread = useUnreadCount() ?? 0;
  const open = (orders.data ?? []).filter((o: any) => !["completed", "cancelled", "refunded"].includes(o.status)).length;

  const tiles = [
    { to: "/orders" as const, icon: Package, label: "Open orders", value: String(open) },
    { to: "/messages" as const, icon: MessageSquare, label: "Unread messages", value: String(unread) },
    { to: "/bookings" as const, icon: CalendarDays, label: "Bookings", value: "View" },
    { to: "/saved" as const, icon: Bookmark, label: "Saved", value: "View" },
  ];

  if (!session) return null;

  return (
    <section className="mt-7" aria-labelledby="home-activity">
      <SectionHeader title="Your Activity" action="Profile" onAction={() => { window.location.href = "/me"; }} />
      <h2 id="home-activity" className="sr-only">Your Activity</h2>
      <div className="grid grid-cols-2 gap-2 px-5">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="tap rounded-2xl border border-border bg-card p-3.5">
            <t.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <p className="mt-2 text-lg font-black leading-none" style={{ color: "var(--plugu-gold)" }}>{t.value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{t.label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- Renderer ----------------------------------- */

const RENDERERS: Record<HomeSectionKey, React.ComponentType> = {
  right_now: () => <RightNowRail />,
  around_you: AroundYou,
  tonight: Tonight,
  opportunities: Opportunities,
  campus_updates: CampusUpdates,
  your_activity: YourActivity,
};

export function PersonalizedHome() {
  const { order, hidden, toggle, move, reset, saving } = useHomeLayout();

  return (
    <>
      {order
        .filter((k) => !hidden.has(k))
        .map((k) => {
          const C = RENDERERS[k];
          return <C key={k} />;
        })}

      <details className="mx-5 mt-7 rounded-2xl border border-border bg-card">
        <summary className="tap flex cursor-pointer items-center gap-2 p-3.5 text-xs font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Customize your home
        </summary>
        <ul className="divide-y divide-border border-t border-border">
          {order.map((k, i) => {
            const def = HOME_SECTIONS.find((s) => s.key === k)!;
            const isHidden = hidden.has(k);
            return (
              <li key={k} className="flex items-center gap-2 p-3">
                <span className="min-w-0 flex-1 truncate text-sm">{def.label}</span>
                <button
                  type="button"
                  disabled={saving || i === 0}
                  onClick={() => move(k, -1)}
                  aria-label={`Move ${def.label} up`}
                  className="tap grid h-9 w-9 place-items-center rounded-xl border border-border disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={saving || i === order.length - 1}
                  onClick={() => move(k, 1)}
                  aria-label={`Move ${def.label} down`}
                  className="tap grid h-9 w-9 place-items-center rounded-xl border border-border disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={saving || def.locked}
                  onClick={() => toggle(k)}
                  aria-label={`${isHidden ? "Show" : "Hide"} ${def.label}`}
                  aria-pressed={!isHidden}
                  className="tap grid h-9 w-9 place-items-center rounded-xl border border-border disabled:opacity-30"
                >
                  {isHidden ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="p-3">
          <button type="button" onClick={reset} className="tap text-xs font-semibold text-muted-foreground">
            Reset to default order
          </button>
        </div>
      </details>
    </>
  );
}
