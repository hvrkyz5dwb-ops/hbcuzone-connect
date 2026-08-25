import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Quote, Newspaper, Plug, Megaphone } from "lucide-react";

type Slide = {
  key: string;
  eyebrow: string;
  title: string;
  blurb: string;
  to: "/daily" | "/news" | "/business" | "/promote";
  cta: string;
  icon: typeof Quote;
  tint: string;
  emoji: string;
};

// Motivational quotes from modern celebrities and legends.
// One is chosen deterministically per day.
const QUOTES: { text: string; who: string }[] = [
  { text: "You have to be at your strongest when you're feeling at your weakest.", who: "Serena Williams" },
  { text: "Real success is finding your lifework in the work that you love.", who: "David McCullough" },
  { text: "If you don't like something, change it. If you can't change it, change your attitude.", who: "Maya Angelou" },
  { text: "I never dreamed about success. I worked for it.", who: "Estée Lauder" },
  { text: "The time is always right to do what is right.", who: "Dr. Martin Luther King Jr." },
  { text: "You can't be what you can't see.", who: "Marian Wright Edelman" },
  { text: "Don't count the days, make the days count.", who: "Muhammad Ali" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", who: "Stephen Covey" },
  { text: "The best revenge is massive success.", who: "Frank Sinatra" },
  { text: "Started from the bottom now we're here.", who: "Drake" },
  { text: "Every accomplishment starts with the decision to try.", who: "John F. Kennedy" },
  { text: "Life is 10% what happens to you and 90% how you react to it.", who: "Charles R. Swindoll" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", who: "Winston Churchill" },
  { text: "I've missed more than 9,000 shots. I've failed over and over — that is why I succeed.", who: "Michael Jordan" },
  { text: "Ambition is priceless. It's something that's in your DNA.", who: "Jay-Z" },
];

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

export function DailySlides() {
  const [today, setToday] = useState("");
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const resume = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    setToday(new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }));
    setQuoteIdx(dayOfYear() % QUOTES.length);
  }, []);

  const q = QUOTES[quoteIdx];

  const slides: Slide[] = [
    {
      key: "quote",
      eyebrow: "Daily Motivation",
      title: `"${q.text}"`,
      blurb: `— ${q.who}`,
      to: "/daily",
      cta: "More daily",
      icon: Quote,
      tint: "var(--plugu-gold)",
      emoji: "✨",
    },
    {
      key: "news",
      eyebrow: "PlugU Daily",
      title: "Today's most important campus news",
      blurb: "Curated stories every student should know today.",
      to: "/news",
      cta: "Read briefing",
      icon: Newspaper,
      tint: "var(--plugu-purple)",
      emoji: "📰",
    },
    {
      key: "become",
      eyebrow: "Grow Your Bag",
      title: "Become a Plug",
      blurb: "Sell items, food, services, rides, tutoring & more.",
      to: "/business",
      cta: "Get started",
      icon: Plug,
      tint: "var(--plugu-gold)",
      emoji: "🔌",
    },
    {
      key: "promote",
      eyebrow: "Free On-Campus",
      title: "Promote your local event",
      blurb: "Pin your event to a spot on your live campus map — free for on-campus, paid boosts available.",
      to: "/promote",
      cta: "Promote now",
      icon: Megaphone,
      tint: "var(--plugu-purple)",
      emoji: "📣",
    },
  ];

  // Auto-advance every 7s, paused for 10s whenever the student swipes or taps.
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length, paused]);

  useEffect(() => () => { if (resume.current) clearTimeout(resume.current); }, []);

  const hold = () => {
    setPaused(true);
    if (resume.current) clearTimeout(resume.current);
    resume.current = setTimeout(() => setPaused(false), 10_000);
  };

  const go = (dir: number) => {
    hold();
    setI((n) => (n + dir + slides.length) % slides.length);
  };

  const s = slides[i];
  const Icon = s.icon;

  return (
    <section className="px-5 pt-5">
      <div className="relative">
        <Link
          key={s.key}
          to={s.to}
          onTouchStart={(e) => { hold(); startX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - (startX.current ?? 0);
            if (Math.abs(dx) > 40) { e.preventDefault(); go(dx < 0 ? 1 : -1); }
            startX.current = null;
          }}
          className="tap relative block overflow-hidden rounded-3xl border border-border bg-card p-5"
          style={{ animation: "plugu-fade-up 0.4s ease-out both", touchAction: "pan-y" }}
        >
          <div
            className="absolute -top-16 -right-16 h-52 w-52 rounded-full blur-3xl opacity-50"
            style={{ background: s.tint }}
          />
          <div
            className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full blur-3xl opacity-30"
            style={{ background: "var(--plugu-purple)" }}
          />
          <div className="relative flex items-start gap-4">
            <div
              className="h-14 w-14 shrink-0 grid place-items-center rounded-2xl border border-white/10 text-3xl"
              style={{ background: "color-mix(in oklab, var(--card) 60%, black)" }}
            >
              {s.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.18em] uppercase"
                  style={{ color: s.tint }}
                >
                  <Icon className="h-3 w-3" /> {s.eyebrow}
                </span>
                {today && <span className="text-[10px] text-muted-foreground">· {today}</span>}
              </div>
              <h2 className="mt-1 text-[15px] font-black leading-snug">{s.title}</h2>
              <p className="text-[12px] text-muted-foreground line-clamp-2 mt-0.5">{s.blurb}</p>
            </div>
          </div>
          <div className="relative mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {slides.map((sl, idx) => (
                <button
                  key={sl.key}
                  type="button"
                  aria-label={`Show ${sl.eyebrow}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setI(idx); }}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: idx === i ? 18 : 6,
                    background: idx === i ? s.tint : "color-mix(in oklab, var(--foreground) 25%, transparent)",
                  }}
                />
              ))}
            </div>
            <span className="inline-flex items-center gap-1 font-semibold" style={{ color: s.tint }}>
              {s.cta} <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}