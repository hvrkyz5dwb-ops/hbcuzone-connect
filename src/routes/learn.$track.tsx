import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getLearnTrack, learnTracks } from "@/lib/learn-tracks";

export const Route = createFileRoute("/learn/$track")({
  loader: ({ params }) => {
    const track = getLearnTrack(params.track);
    if (!track) throw notFound();
    return { track };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found — PlugU" }, { name: "robots", content: "noindex" }] };
    }
    const t = loaderData.track;
    const title = `${t.name} — PlugU`;
    return {
      meta: [
        { title },
        { name: "description", content: t.tagline },
        { property: "og:title", content: title },
        { property: "og:description", content: t.tagline },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LearnTrackPage,
});

function LearnTrackPage() {
  const { track } = Route.useLoaderData();
  const scroller = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const total = track.slides.length;

  useEffect(() => {
    setI(0);
    scroller.current?.scrollTo({ left: 0 });
  }, [track.slug]);

  function go(next: number) {
    const el = scroller.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(total - 1, next));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setI(clamped);
  }

  function onScroll() {
    const el = scroller.current;
    if (!el || !el.clientWidth) return;
    setI(Math.min(total - 1, Math.round(el.scrollLeft / el.clientWidth)));
  }

  return (
    <AppShell title={track.name}>
      <section className="px-5 pt-4">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </Link>
        <h1 className="mt-2 text-2xl font-black tracking-tight">{track.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{track.tagline}</p>
      </section>

      {/* Progress bar */}
      <div className="mt-4 flex gap-1 px-5">
        {track.slides.map((s, idx) => (
          <button
            key={s.title}
            type="button"
            aria-label={`Slide ${idx + 1}`}
            onClick={() => go(idx)}
            className="h-1 flex-1 rounded-full transition-all"
            style={{
              background:
                idx <= i ? "var(--plugu-gold)" : "color-mix(in oklab, var(--foreground) 18%, transparent)",
            }}
          />
        ))}
      </div>

      {/* Slides */}
      <div
        ref={scroller}
        onScroll={onScroll}
        className="mt-3 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {track.slides.map((s) => (
          <article key={s.title} className="w-full shrink-0 snap-center px-5">
            <div className="min-h-[420px] rounded-3xl border border-border bg-card p-6">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.25em]"
                style={{ color: "var(--plugu-gold)" }}
              >
                {s.kicker}
              </p>
              <h2 className="mt-2 text-[24px] font-black leading-[1.12] tracking-[-0.02em]">{s.title}</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{s.body}</p>
              {s.points && (
                <ul className="mt-4 space-y-2.5">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-[13.5px] leading-snug">
                      <span
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: "var(--plugu-gold)" }}
                      />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.note && (
                <p className="mt-4 rounded-xl border border-border bg-secondary px-3 py-2 text-[11.5px] text-muted-foreground">
                  {s.note}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-between px-5">
        <button
          type="button"
          onClick={() => go(i - 1)}
          disabled={i === 0}
          className="tap inline-flex items-center gap-1 rounded-xl border border-border px-3.5 py-2 text-[12px] font-semibold disabled:opacity-35"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <span className="text-[12px] font-semibold text-muted-foreground">
          {i + 1} / {total}
        </span>
        {i < total - 1 ? (
          <button
            type="button"
            onClick={() => go(i + 1)}
            className="tap inline-flex items-center gap-1 rounded-xl px-4 py-2 text-[12px] font-bold"
            style={{ background: "var(--plugu-gold)", color: "#0b0b0b" }}
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <Link
            to="/hub"
            className="tap inline-flex items-center gap-1 rounded-xl px-4 py-2 text-[12px] font-bold"
            style={{ background: "var(--plugu-gold)", color: "#0b0b0b" }}
          >
            Open Hub <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Other tracks */}
      <section className="mt-8 px-5 pb-8">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Keep learning
        </h3>
        <div className="mt-3 space-y-2">
          {learnTracks
            .filter((t) => t.slug !== track.slug)
            .map((t) => (
              <Link
                key={t.slug}
                to="/learn/$track"
                params={{ track: t.slug }}
                className="tap flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
              >
                <span>
                  <span className="block text-sm font-bold">{t.name}</span>
                  <span className="block text-[12px] text-muted-foreground">{t.tagline}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
        </div>
      </section>
    </AppShell>
  );
}
