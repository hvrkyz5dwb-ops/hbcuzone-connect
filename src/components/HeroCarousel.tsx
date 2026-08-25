import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { getLearnTrack, type LearnTrack } from "@/lib/learn-tracks";
import plugImg from "@/assets/spotlight-plug.jpg";
import businessImg from "@/assets/spotlight-business.jpg";
import budgetImg from "@/assets/spotlight-budget.jpg";
import stocksImg from "@/assets/spotlight-stocks.jpg";
import indeedImg from "@/assets/spotlight-indeed.jpg";
import heroImg from "@/assets/plugu-hero.jpg";

const GOLD = "var(--plugu-gold)";

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

type Slide = {
  key: string;
  title: string;
  subtitle: string;
  meta?: string;
  cta: string;
  to: string;
  params?: Record<string, string>;
  image: string;
};

/** Builds a rotating slide from a learn track deck so each card stays fresh. */
function fromTrack(slug: LearnTrack["slug"], seed: number, image: string): Slide {
  const track = getLearnTrack(slug)!;
  const s = track.slides[seed % track.slides.length];
  return {
    key: slug,
    title: s.title,
    subtitle: s.body,
    meta: `${track.name} · ${s.kicker}`,
    cta: track.cta,
    to: "/learn/$track",
    params: { track: slug },
    image,
  };
}

function Card({ slide }: { slide: Slide }) {
  return (
    <Link
      to={slide.to as "/hub"}
      params={slide.params as never}
      className="tap relative block h-[246px] w-[86%] shrink-0 snap-center overflow-hidden rounded-3xl border border-border"
    >
      <img src={slide.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(6,6,6,0.96) 0%, rgba(6,6,6,0.86) 40%, rgba(6,6,6,0.35) 72%, rgba(6,6,6,0.12) 100%)",
        }}
      />
      <div className="relative flex h-full w-[66%] flex-col justify-between p-5">
        <div>
          <h3 className="text-[22px] font-black leading-[1.1] tracking-[-0.015em] text-foreground line-clamp-3">
            {slide.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-[12.5px] leading-snug text-muted-foreground">
            {slide.subtitle}
          </p>
          {slide.meta && (
            <p className="mt-1.5 text-[11px] font-semibold" style={{ color: GOLD }}>{slide.meta}</p>
          )}
        </div>
        <span
          className="inline-flex w-fit items-center gap-1 rounded-xl px-3.5 py-2 text-[12px] font-bold"
          style={{ background: GOLD, color: "#0b0b0b" }}
        >
          {slide.cta} <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

export function HeroCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  // Rotates the live item shown inside each card so the slideshow never
  // repeats the same copy day to day.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 12_000);
    return () => clearInterval(t);
  }, []);

  // One slideshow, six slides — Become The Plug leads.
  const slides = useMemo<Slide[]>(() => {
    const seed = dayOfYear() + tick;
    return [
      fromTrack("plug", seed, plugImg),
      fromTrack("business-101", seed, businessImg),
      fromTrack("indeed", seed, indeedImg),
      fromTrack("budget", seed, budgetImg),
      fromTrack("investing", seed, stocksImg),
      fromTrack("motivation", seed, heroImg),
    ];
  }, [tick]);

  const step = () => {
    const el = scroller.current;
    return el ? el.scrollWidth / slides.length : 0;
  };

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    const s = el.scrollWidth / slides.length;
    if (s > 0) setI(Math.min(slides.length - 1, Math.round(el.scrollLeft / s)));
  }

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const t = setInterval(() => {
      const s = el.scrollWidth / slides.length;
      if (!s) return;
      const next = (Math.round(el.scrollLeft / s) + 1) % slides.length;
      el.scrollTo({ left: next * s, behavior: "smooth" });
    }, 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="mt-4" aria-label="Highlights">
      <div
        ref={scroller}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s) => (
          <Card key={s.key} slide={s} />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {slides.map((s, idx) => (
          <button
            key={s.key}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => scroller.current?.scrollTo({ left: idx * step(), behavior: "smooth" })}
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
