import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, CalendarDays, GraduationCap, MapPin, Quote, Star, TrendingUp,
} from "lucide-react";
import { useMarketplace } from "@/hooks/use-listings";
import { useCampusEvents } from "@/hooks/use-campus";
import { opportunities } from "@/lib/opportunities-data";

const GOLD = "var(--plugu-gold)";
const PURPLE = "var(--plugu-purple)";

const QUOTES = [
  "Stay down. Your consistency today builds your success tomorrow.",
  "Every successful entrepreneur started with zero customers.",
  "Small progress every day beats excuses.",
  "Success belongs to those who keep showing up.",
  "Build while everyone else is sleeping.",
];

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

function centsToPrice(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

const SLIDE_COUNT = 5;

function Slide({
  tint, icon, eyebrow, children, cta,
}: {
  tint: string;
  icon: React.ReactNode;
  eyebrow: string;
  children: React.ReactNode;
  cta: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[168px] overflow-hidden p-5">
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
        style={{ background: tint }}
      />
      <div className="relative">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: tint }}
        >
          {icon}
          {eyebrow}
        </span>
        {children}
        <div className="mt-3">{cta}</div>
      </div>
    </div>
  );
}

function Cta({ to, tint, children }: { to: string; tint: string; children: React.ReactNode }) {
  return (
    <Link
      to={to as "/market"}
      className="tap inline-flex items-center gap-1 text-[11px] font-semibold"
      style={{ color: tint }}
    >
      {children} <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

export function HeroCarousel() {
  const { data: trending } = useMarketplace({ sort: "popular", limit: 3 });
  const { data: events } = useCampusEvents();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % SLIDE_COUNT), 6000);
    return () => clearInterval(t);
  }, [paused]);

  const go = (n: number) => setI(((n % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);

  const upcoming = (events ?? []).slice(0, 2);
  const quote = QUOTES[dayOfYear() % QUOTES.length];
  const top = trending?.[0];
  const sellerName = top?.seller?.display_name ?? top?.seller?.username ?? null;
  const opps = opportunities.slice(0, 3);

  const slides = [
    // 1 — Trending listings
    <Slide
      key="trending"
      tint={GOLD}
      icon={<TrendingUp className="h-3 w-3" />}
      eyebrow="Today's trending"
      cta={<Cta to="/market" tint={GOLD}>Explore</Cta>}
    >
      {top ? (
        <ul className="mt-2 space-y-1.5">
          {(trending ?? []).map((l) => (
            <li key={l.id} className="flex items-baseline gap-2 text-[13px]">
              <span className="min-w-0 flex-1 truncate font-medium">{l.title}</span>
              <span className="shrink-0 text-[11px] font-bold" style={{ color: GOLD }}>
                {centsToPrice(l.price_cents)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[13px] text-muted-foreground">
          Fresh drops, services and campus businesses — updated as students post.
        </p>
      )}
    </Slide>,

    // 2 — Campus events
    <Slide
      key="events"
      tint={PURPLE}
      icon={<CalendarDays className="h-3 w-3" />}
      eyebrow="Campus events"
      cta={<Cta to="/campus" tint={PURPLE}>All events</Cta>}
    >
      {upcoming.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {upcoming.map((e) => (
            <li key={e.id} className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{e.title}</p>
                <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5" />
                  {new Date(e.starts_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  {" · "}{e.location}
                </p>
              </div>
              <Link
                to="/campus"
                className="tap shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                style={{ borderColor: "color-mix(in oklab, var(--plugu-purple) 50%, transparent)", color: PURPLE }}
              >
                RSVP
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[13px] text-muted-foreground">
          Games, parties, org events and vendor markets — check the Campus Hub.
        </p>
      )}
    </Slide>,

    // 3 — Opportunities
    <Slide
      key="opps"
      tint={GOLD}
      icon={<GraduationCap className="h-3 w-3" />}
      eyebrow="Campus opportunities"
      cta={<Cta to="/hub" tint={GOLD}>View opportunities</Cta>}
    >
      <ul className="mt-2 space-y-1.5">
        {opps.map((o) => (
          <li key={o.id} className="flex items-baseline gap-2 text-[13px]">
            <span className="min-w-0 flex-1 truncate font-medium">{o.title}</span>
            <span className="shrink-0 text-[10px] text-muted-foreground">{o.meta}</span>
          </li>
        ))}
      </ul>
    </Slide>,

    // 4 — Student spotlight
    <Slide
      key="spotlight"
      tint={PURPLE}
      icon={<Star className="h-3 w-3" />}
      eyebrow="Student spotlight"
      cta={top?.seller?.username
        ? <Cta to={`/u/${top.seller.username}`} tint={PURPLE}>View profile</Cta>
        : <Cta to="/market" tint={PURPLE}>Meet the sellers</Cta>}
    >
      {sellerName && top ? (
        <>
          <h3 className="mt-2 text-[15px] font-black leading-snug">{sellerName}</h3>
          <p className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground">
            Seller of the week — trending with “{top.title}” on your campus market.
          </p>
        </>
      ) : (
        <p className="mt-2 text-[13px] text-muted-foreground">
          Each week we highlight a student entrepreneur, top seller or most-booked service.
        </p>
      )}
    </Slide>,

    // 5 — Daily motivation
    <Slide
      key="quote"
      tint={GOLD}
      icon={<Quote className="h-3 w-3" />}
      eyebrow="Daily motivation"
      cta={<Cta to="/daily" tint={GOLD}>More daily</Cta>}
    >
      <p className="mt-2 text-[15px] font-bold leading-snug">“{quote}”</p>
    </Slide>,
  ];

  return (
    <section className="mt-3 px-5" aria-label="Highlights">
      <div
        className="relative overflow-hidden rounded-3xl border border-border bg-card"
        style={i === 4 ? {
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.1) 55%), radial-gradient(ellipse 90% 70% at 50% 115%, color-mix(in oklab, var(--plugu-gold) 45%, transparent), transparent 70%)",
        } : undefined}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true); }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          touchX.current = null;
          setPaused(false);
          if (start == null) return;
          const dx = e.changedTouches[0].clientX - start;
          if (dx <= -40) go(i + 1);
          else if (dx >= 40) go(i - 1);
        }}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
        >
          {slides.map((s, idx) => (
            <div key={idx} className="min-w-full" aria-hidden={idx !== i}>
              {s}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => go(idx)}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: idx === i ? 18 : 6,
              background: idx === i ? GOLD : "color-mix(in oklab, var(--foreground) 25%, transparent)",
            }}
          />
        ))}
      </div>
    </section>
  );
}