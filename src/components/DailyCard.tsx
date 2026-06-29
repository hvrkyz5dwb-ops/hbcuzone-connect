import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, GraduationCap, Flame, UtensilsCrossed, Star, Briefcase, CloudSun, Newspaper } from "lucide-react";

type Topic = {
  key: string;
  eyebrow: string;
  title: string;
  blurb: string;
  to: string;
  cta: string;
  icon: typeof Calendar;
  tint: string;
  emoji: string;
};

const TOPICS: Topic[] = [
  { key: "events",      eyebrow: "Today on Campus", title: "Today's Campus Events",   blurb: "Yard parties, mixers & 6 more happening near you.", to: "/events",   cta: "See events",       icon: Calendar,         tint: "var(--plugu-gold)",   emoji: "🎉" },
  { key: "scholar",     eyebrow: "Closing Soon",     title: "Scholarships Closing",    blurb: "$28K in awards with deadlines this week.",          to: "/hub",      cta: "Apply now",        icon: GraduationCap,    tint: "var(--plugu-purple)", emoji: "🎓" },
  { key: "trending",    eyebrow: "Trending Now",     title: "Trending Businesses",     blurb: "The 5 student plugs everyone's booking today.",     to: "/market",   cta: "Shop trending",    icon: Flame,            tint: "var(--plugu-gold)",   emoji: "🔥" },
  { key: "food",        eyebrow: "Hungry?",          title: "Popular Campus Food",     blurb: "Plates, late-night & cravings — top picks today.",  to: "/market",   cta: "Order plates",     icon: UtensilsCrossed,  tint: "var(--plugu-purple)", emoji: "🍱" },
  { key: "creator",     eyebrow: "Spotlight",        title: "Top Student Creator",     blurb: "Meet today's featured Plug from your network.",     to: "/",         cta: "See creator",      icon: Star,             tint: "var(--plugu-gold)",   emoji: "👑" },
  { key: "internships", eyebrow: "Opportunities",    title: "Internships You'll Love", blurb: "Fresh openings matched to your major and year.",     to: "/hub",      cta: "Browse roles",     icon: Briefcase,        tint: "var(--plugu-purple)", emoji: "💼" },
  { key: "weather",     eyebrow: "Heads Up",         title: "Campus Weather",          blurb: "What to wear and where to study today.",            to: "/map",      cta: "Open map",         icon: CloudSun,         tint: "var(--plugu-gold)",   emoji: "⛅" },
  { key: "news",        eyebrow: "Breaking",         title: "Breaking College News",   blurb: "Top headlines every student should know today.",    to: "/news",     cta: "Read briefing",    icon: Newspaper,        tint: "var(--plugu-purple)", emoji: "📰" },
];

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

export function DailyCard() {
  const t = TOPICS[dayOfYear() % TOPICS.length];
  const Icon = t.icon;
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

  return (
    <section className="px-5 pt-5">
      <Link
        to={t.to}
        className="tap relative block overflow-hidden rounded-3xl border border-border bg-card p-5"
        style={{ animation: "plugu-fade-up 0.4s ease-out both" }}
      >
        <div
          className="absolute -top-16 -right-16 h-52 w-52 rounded-full blur-3xl opacity-50"
          style={{ background: t.tint }}
        />
        <div
          className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full blur-3xl opacity-30"
          style={{ background: "var(--plugu-purple)" }}
        />
        <div className="relative flex items-center gap-4">
          <div
            className="h-14 w-14 shrink-0 grid place-items-center rounded-2xl border border-white/10 text-3xl"
            style={{ background: "color-mix(in oklab, var(--card) 60%, black)" }}
          >
            {t.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.18em] uppercase"
                style={{ color: t.tint }}
              >
                <Icon className="h-3 w-3" /> PlugU Daily
              </span>
              <span className="text-[10px] text-muted-foreground">· {today}</span>
            </div>
            <h2 className="mt-1 text-lg font-black leading-tight truncate">{t.title}</h2>
            <p className="text-[12px] text-muted-foreground line-clamp-2">{t.blurb}</p>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs font-semibold shrink-0" style={{ color: t.tint }}>
            {t.cta} <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="relative mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{t.eyebrow}</span>
          <span className="inline-flex items-center gap-1 font-semibold" style={{ color: t.tint }}>
            {t.cta} <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </section>
  );
}