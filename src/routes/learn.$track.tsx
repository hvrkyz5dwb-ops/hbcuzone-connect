import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ChevronLeft, ChevronRight, BookOpen, ShieldAlert, X, Check,
  Trophy, RotateCcw, Sparkles,
} from "lucide-react";
import { getLearnTrack, learnTracks, type LearnTrack } from "@/lib/learn-tracks";
import { getProgress, markCompleted, setSlide } from "@/lib/learn-progress";

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

type Stage = { kind: "slide"; index: number } | { kind: "quiz" } | { kind: "done" };

function LearnTrackPage() {
  const { track } = Route.useLoaderData();
  const navigate = useNavigate();
  const slides = track.slides;
  const quiz = track.quiz ?? [];
  // Steps = slides + optional quiz step + completion step.
  const total = slides.length + (quiz.length ? 1 : 0) + 1;

  const [step, setStep] = useState(0);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [badge, setBadge] = useState(false);

  useEffect(() => {
    setStep(0);
    setAnswers({});
    setBadge(getProgress(track.slug).completed);
  }, [track.slug]);

  const stage: Stage = useMemo(() => {
    if (step < slides.length) return { kind: "slide", index: step };
    if (quiz.length && step === slides.length) return { kind: "quiz" };
    return { kind: "done" };
  }, [step, slides.length, quiz.length]);

  const score = quiz.reduce((n, q, i) => (answers[i] === q.answer ? n + 1 : n), 0);
  const quizAnswered = quiz.length > 0 && Object.keys(answers).length === quiz.length;

  useEffect(() => {
    if (stage.kind === "slide") setSlide(track.slug, stage.index);
    if (stage.kind === "done") {
      markCompleted(track.slug, quiz.length ? score : undefined);
      setBadge(true);
    }
  }, [stage, track.slug, score, quiz.length]);

  const canAdvance = stage.kind !== "quiz" || quizAnswered;

  function go(delta: number) {
    setStep((s) => Math.max(0, Math.min(total - 1, s + delta)));
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground">
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 pb-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)" }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          aria-label="Close lesson"
          className="tap rounded-xl border border-border p-2"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold">{track.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {stage.kind === "slide" ? `Slide ${stage.index + 1} of ${slides.length}` : stage.kind === "quiz" ? "Knowledge check" : "Complete"}
          </p>
        </div>
        {badge && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black"
            style={{ background: "var(--plugu-gold)", color: "#0b0b0b" }}
          >
            <Trophy className="h-3 w-3" /> DONE
          </span>
        )}
        {track.glossary && (
          <button
            type="button"
            onClick={() => setGlossaryOpen(true)}
            className="tap inline-flex items-center gap-1 rounded-xl border border-border px-2.5 py-2 text-[11px] font-semibold"
          >
            <BookOpen className="h-3.5 w-3.5" /> Glossary
          </button>
        )}
      </header>

      {/* Progress */}
      <div className="flex gap-1 px-4">
        {Array.from({ length: total }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Step ${idx + 1}`}
            onClick={() => setStep(idx > step && !canAdvance ? step : idx)}
            className="h-1 flex-1 rounded-full transition-all"
            style={{
              background:
                idx <= step ? "var(--plugu-gold)" : "color-mix(in oklab, var(--foreground) 16%, transparent)",
            }}
          />
        ))}
      </div>

      {track.disclaimer && (
        <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl border px-3 py-2"
          style={{ borderColor: "color-mix(in oklab, var(--plugu-gold) 35%, transparent)", background: "color-mix(in oklab, var(--plugu-gold) 7%, transparent)" }}>
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--plugu-gold)" }} />
          <p className="text-[10.5px] leading-snug text-muted-foreground">
            <span className="font-bold uppercase tracking-wider" style={{ color: "var(--plugu-gold)" }}>
              Educational only ·{" "}
            </span>
            {track.disclaimer}
          </p>
        </div>
      )}

      {/* Body */}
      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4">
        {stage.kind === "slide" && <SlideView slide={slides[stage.index]} />}
        {stage.kind === "quiz" && (
          <QuizView track={track} answers={answers} onAnswer={(qi, oi) => setAnswers((a) => (a[qi] === undefined ? { ...a, [qi]: oi } : a))} />
        )}
        {stage.kind === "done" && (
          <CompletionView track={track} score={score} totalQ={quiz.length} onRetake={() => { setAnswers({}); setStep(slides.length); }} />
        )}
      </main>

      {/* Controls */}
      <footer
        className="flex items-center justify-between gap-3 border-t border-border px-5 pt-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
      >
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={step === 0}
          className="tap inline-flex items-center gap-1 rounded-xl border border-border px-3.5 py-2.5 text-[12px] font-semibold disabled:opacity-35"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <span className="text-[12px] font-semibold text-muted-foreground">
          {step + 1} / {total}
        </span>
        {stage.kind === "done" ? (
          <Link
            to="/hub"
            className="tap inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-[12px] font-bold"
            style={{ background: "var(--plugu-gold)", color: "#0b0b0b" }}
          >
            Open Hub <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => go(1)}
            disabled={!canAdvance}
            className="tap inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-[12px] font-bold disabled:opacity-40"
            style={{ background: "var(--plugu-gold)", color: "#0b0b0b" }}
          >
            {stage.kind === "quiz" ? "See results" : "Next"} <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </footer>

      {glossaryOpen && track.glossary && (
        <Glossary terms={track.glossary} onClose={() => setGlossaryOpen(false)} />
      )}
    </div>
  );
}

function SlideView({ slide }: { slide: LearnTrack["slides"][number] }) {
  return (
    <article className="mx-auto max-w-md">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "var(--plugu-gold)" }}>
        {slide.kicker}
      </p>
      <h1 className="mt-2 text-[26px] font-black leading-[1.12] tracking-[-0.02em]">{slide.title}</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{slide.body}</p>
      {slide.points && (
        <ul className="mt-5 space-y-2.5">
          {slide.points.map((p) => (
            <li key={p} className="flex gap-2.5 text-[13.5px] leading-snug">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--plugu-gold)" }} />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
      {slide.note && (
        <p className="mt-5 rounded-xl border border-border bg-secondary px-3 py-2 text-[11.5px] text-muted-foreground">
          {slide.note}
        </p>
      )}
    </article>
  );
}

function QuizView({
  track, answers, onAnswer,
}: {
  track: LearnTrack;
  answers: Record<number, number>;
  onAnswer: (qi: number, oi: number) => void;
}) {
  const quiz = track.quiz ?? [];
  return (
    <div className="mx-auto max-w-md">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "var(--plugu-gold)" }}>
        Knowledge check
      </p>
      <h1 className="mt-2 text-[24px] font-black leading-tight">Lock it in</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Answer all {quiz.length} — you get instant feedback on each one.
      </p>
      <div className="mt-5 space-y-5">
        {quiz.map((q, qi) => {
          const picked = answers[qi];
          const answered = picked !== undefined;
          return (
            <div key={q.q} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[14px] font-bold leading-snug">
                {qi + 1}. {q.q}
              </p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const isAnswer = oi === q.answer;
                  const isPicked = picked === oi;
                  const show = answered && (isAnswer || isPicked);
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={answered}
                      onClick={() => onAnswer(qi, oi)}
                      className="tap flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[13px] disabled:cursor-default"
                      style={{
                        borderColor: show
                          ? isAnswer
                            ? "var(--plugu-gold)"
                            : "var(--destructive)"
                          : "var(--border)",
                        background: show && isAnswer ? "color-mix(in oklab, var(--plugu-gold) 12%, transparent)" : "transparent",
                      }}
                    >
                      <span className="min-w-0 flex-1">{opt}</span>
                      {show && isAnswer && <Check className="h-4 w-4 shrink-0" style={{ color: "var(--plugu-gold)" }} />}
                      {show && !isAnswer && isPicked && <X className="h-4 w-4 shrink-0 text-destructive" />}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <p className="mt-3 rounded-xl border border-border bg-secondary px-3 py-2 text-[12px] leading-snug text-muted-foreground">
                  <span className="font-bold" style={{ color: picked === q.answer ? "var(--plugu-gold)" : undefined }}>
                    {picked === q.answer ? "Correct — " : "Not quite — "}
                  </span>
                  {q.why}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompletionView({
  track, score, totalQ, onRetake,
}: {
  track: LearnTrack;
  score: number;
  totalQ: number;
  onRetake: () => void;
}) {
  return (
    <div className="mx-auto max-w-md text-center">
      <div
        className="mx-auto grid h-28 w-28 place-items-center rounded-full"
        style={{
          background: "radial-gradient(circle at 32% 26%, #1d1d1d 0%, #0a0a0a 62%, #000 100%)",
          border: "1px solid color-mix(in oklab, var(--plugu-gold) 60%, transparent)",
          boxShadow: "0 0 44px -10px color-mix(in oklab, var(--plugu-gold) 65%, transparent)",
        }}
      >
        <Trophy className="h-12 w-12" style={{ color: "var(--plugu-gold)" }} />
      </div>
      <h1 className="mt-5 text-[24px] font-black">{track.name} complete</h1>
      {totalQ > 0 && (
        <p className="mt-2 text-[14px] text-muted-foreground">
          You scored <span className="font-bold" style={{ color: "var(--plugu-gold)" }}>{score}/{totalQ}</span> on the knowledge check.
        </p>
      )}
      <p className="mt-2 text-[13px] text-muted-foreground">
        Badge earned — it stays on this device with your learning progress.
      </p>
      <div className="mt-6 space-y-2">
        {totalQ > 0 && (
          <button
            type="button"
            onClick={onRetake}
            className="tap inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-[13px] font-semibold"
          >
            <RotateCcw className="h-4 w-4" /> Retake the quiz
          </button>
        )}
        {track.slug === "motivation" && (
          <Link
            to="/read"
            className="tap inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-bold"
            style={{ borderColor: "var(--plugu-gold)", color: "var(--plugu-gold)" }}
          >
            <Sparkles className="h-4 w-4" /> Open reading mode
          </Link>
        )}
      </div>

      <div className="mt-8 text-left">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Keep learning</h3>
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
        <Link to="/" className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
      </div>
    </div>
  );
}

function Glossary({ terms, onClose }: { terms: { term: string; def: string }[]; onClose: () => void }) {
  const [q, setQ] = useState("");
  const filtered = terms.filter(
    (t) => !q.trim() || (t.term + t.def).toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur">
      <div className="flex items-center gap-3 px-5" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
        <h2 className="flex-1 text-lg font-black">Investing glossary</h2>
        <button type="button" onClick={onClose} aria-label="Close glossary" className="tap rounded-xl border border-border p-2">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="px-5 pt-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search terms…"
          className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
        />
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-4">
        {filtered.map((t) => (
          <div key={t.term} className="rounded-2xl border border-border bg-card p-3.5">
            <p className="text-[13px] font-bold" style={{ color: "var(--plugu-gold)" }}>{t.term}</p>
            <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">{t.def}</p>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-[13px] text-muted-foreground">No term matched “{q}”.</p>}
      </div>
    </div>
  );
}
