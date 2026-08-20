import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, TrendingUp, CalendarDays, GraduationCap, Store, Quote } from "lucide-react";
import { useMarketplace } from "@/hooks/use-listings";
import { useCampusEvents } from "@/hooks/use-campus";
import { useFeaturedPromotions } from "@/hooks/use-featured";
import { opportunities } from "@/lib/opportunities-data";
import scholarshipImg from "@/assets/spotlight-scholarship.jpg";
import businessImg from "@/assets/spotlight-business.jpg";
import heroImg from "@/assets/plugu-hero.jpg";
import campusImg from "@/assets/campus-map.jpg";

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

type Card = {
  key: string;
  eyebrow: string;
  tint: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  cta: string;
  to: string;
  image: string;
};

function SlideCard({ card, index, total }: { card: Card; index: number; total: number }) {
  return (
    <Link
      to={card.to as "/market"}
      className="tap relative block h-[236px] w-[88%] shrink-0 snap-start overflow-hidden rounded-3xl border"
      style={{ borderColor: `color-mix(in oklab, ${card.tint} 35%, transparent)` }}
    >
      <img
        src={card.image}
        alt=""
        loading="lazy"
        className="absolute inset-y-0 right-0 h-full w-[62%] object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(8,8,8,0.98) 0%, rgba(8,8,8,0.92) 42%, rgba(8,8,8,0.35) 72%, rgba(8,8,8,0.15) 100%)",
        }}
      />
      <div className="relative flex h-full w-[64%] flex-col justify-between p-4">
        <div>
          <span
            className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: card.tint }}
          >
            {card.icon}
            {card.eyebrow}
          </span>
          <h3 className="mt-2 text-[21px] font-black leading-[1.12] tracking-[-0.01em] text-foreground">
            {card.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
            {card.subtitle}
          </p>
        </div>
        <span
          className="inline-flex w-fit items-center gap-1 rounded-xl px-3.5 py-2 text-[12px] font-bold"
          style={{ background: card.tint, color: "#0b0b0b" }}
        >
          {card.cta} <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <span className="absolute bottom-3 right-4 text-[12px] font-semibold text-foreground/70">
        {index + 1} / {total}
      </span>
    </Link>
  );
}

export function HeroCarousel() {
  const { data: trending } = useMarketplace({ sort: "popular", limit: 3 });
  const { data: events } = useCampusEvents();
  const { data: featured } = useFeaturedPromotions();
  const scroller = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);

  const cards = useMemo<Card[]>(() => {
    const top = trending?.[0];
    const nextEvent = (events ?? [])[0];
    const f = (featured ?? [])[0];
    const opp = opportunities[0];
    return [
      {
        key: "scholarship",
        eyebrow: "Scholarship Spotlight",
        tint: GOLD,
        icon: <GraduationCap className="h-3 w-3" />,
        title: "Scholarships You Can Apply For Now",
        subtitle: opp ? `${opp.title} · ${opp.meta}` : "Fresh opportunities matched to your campus.",
        cta: "View Scholarships",
        to: "/hub",
        image: scholarshipImg,
      },
      {
        key: "business",
        eyebrow: f ? "Businesses You Should Know" : "Business 101",
        tint: PURPLE,
        icon: <Store className="h-3 w-3" />,
        title: f?.name ?? "Turn Your Hustle Into Income",
        subtitle:
          f?.description ??
          "Set up your storefront, take bookings, and get paid on campus.",
        cta: f ? "View Business" : "Start Selling",
        to: f?.username ? `/u/${f.username}` : "/seller/onboarding",
        image: businessImg,
      },
      {
        key: "trending",
        eyebrow: "Today's Trending",
        tint: GOLD,
        icon: <TrendingUp className="h-3 w-3" />,
        title: top?.title ?? "See What's Moving On Campus",
        subtitle: top
          ? `Trending now on ${top.campus_name ?? "your campus"} market.`
          : "Fresh drops, services and campus businesses — updated as students post.",
        cta: "Explore Market",
        to: "/market",
        image: heroImg,
      },
      {
        key: "events",
        eyebrow: "Campus Events",
        tint: PURPLE,
        icon: <CalendarDays className="h-3 w-3" />,
        title: nextEvent?.title ?? "What's Happening This Week",
        subtitle: nextEvent
          ? `${new Date(nextEvent.starts_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${nextEvent.location}`
          : "Games, parties, org events and vendor markets.",
        cta: "See Events",
        to: "/campus",
        image: campusImg,
      },
      {
        key: "quote",
        eyebrow: "Daily Motivation",
        tint: GOLD,
        icon: <Quote className="h-3 w-3" />,
        title: QUOTES[dayOfYear() % QUOTES.length],
        subtitle: "A new one drops every day in Daily.",
        cta: "Open Daily",
        to: "/daily",
        image: heroImg,
      },
    ];
  }, [trending, events, featured]);

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    const step = el.scrollWidth / cards.length;
    setI(Math.round(el.scrollLeft / step));
  }

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const t = setInterval(() => {
      const step = el.scrollWidth / cards.length;
      const next = (Math.round(el.scrollLeft / step) + 1) % cards.length;
      el.scrollTo({ left: next * step, behavior: "smooth" });
    }, 6000);
    return () => clearInterval(t);
  }, [cards.length]);

  return (
    <section className="mt-4" aria-label="Highlights">
      <div
        ref={scroller}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((c, idx) => (
          <SlideCard key={c.key} card={c} index={idx} total={cards.length} />
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-center gap-1.5">
        {cards.map((c, idx) => (
          <button
            key={c.key}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => {
              const el = scroller.current;
              if (!el) return;
              el.scrollTo({ left: idx * (el.scrollWidth / cards.length), behavior: "smooth" });
            }}
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
