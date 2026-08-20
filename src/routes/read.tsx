import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bookmark, BookmarkCheck, Shuffle, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BLACK_AUTHOR_BOOKS, shuffleBooks, type Book } from "@/lib/black-authors";
import { getSavedQuotes, isQuoteSaved, toggleSavedQuote, type SavedQuote } from "@/lib/learn-progress";

export const Route = createFileRoute("/read")({
  head: () => ({
    meta: [
      { title: "Reading Mode — Books by Black Authors | PlugU" },
      { name: "description", content: "Read, save quotes from and shuffle a curated shelf of books by Black authors on mindset, money and ownership." },
      { property: "og:title", content: "Reading Mode — Books by Black Authors | PlugU" },
      { property: "og:description", content: "A distraction-free reading shelf of Black authors. Save the lines that hit." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReadingMode,
});

function ReadingMode() {
  const [order, setOrder] = useState<Book[]>(BLACK_AUTHOR_BOOKS);
  const [i, setI] = useState(0);
  const [saved, setSaved] = useState<SavedQuote[]>([]);
  const [tab, setTab] = useState<"read" | "saved">("read");

  useEffect(() => setSaved(getSavedQuotes()), []);

  const book = order[i];
  const total = order.length;
  const progress = useMemo(() => Math.round(((i + 1) / total) * 100), [i, total]);

  function shuffle() {
    setOrder(shuffleBooks(BLACK_AUTHOR_BOOKS));
    setI(0);
  }

  function save(text: string) {
    setSaved(toggleSavedQuote({ text, author: book.author, book: book.title }));
  }

  return (
    <AppShell title="Reading Mode">
      <section className="px-5 pt-4">
        <Link to="/learn/$track" params={{ track: "motivation" }} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Daily Motivation
        </Link>
        <h1 className="mt-2 text-2xl font-black tracking-tight">Reading Mode</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A shelf of Black authors only — save the lines that hit, shuffle when you need something new.
        </p>
      </section>

      <div className="mt-4 flex gap-2 px-5">
        {(["read", "saved"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="tap flex-1 rounded-xl border px-3 py-2 text-[12px] font-bold"
            style={{
              borderColor: tab === t ? "var(--plugu-gold)" : "var(--border)",
              color: tab === t ? "var(--plugu-gold)" : "var(--muted-foreground)",
              background: tab === t ? "color-mix(in oklab, var(--plugu-gold) 10%, transparent)" : "transparent",
            }}
          >
            {t === "read" ? "Read" : `Saved quotes (${saved.length})`}
          </button>
        ))}
      </div>

      {tab === "read" ? (
        <>
          <div className="mt-4 px-5">
            <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--foreground) 14%, transparent)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--plugu-gold)" }} />
            </div>
          </div>

          <article className="mt-4 px-5">
            <div className="rounded-3xl border border-border bg-card p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "var(--plugu-gold)" }}>
                {book.theme} · {book.year}
              </p>
              <h2 className="mt-2 text-[22px] font-black leading-[1.15]">{book.title}</h2>
              <p className="mt-1 text-[13px] font-semibold text-muted-foreground">by {book.author}</p>
              <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">{book.about}</p>

              <div className="mt-5 space-y-3">
                {book.quotes.map((qt) => {
                  const on = isQuoteSaved(saved, qt);
                  return (
                    <div key={qt} className="rounded-2xl border border-border bg-secondary p-4">
                      <Quote className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
                      <p className="mt-2 text-[14px] italic leading-relaxed">“{qt}”</p>
                      <button
                        type="button"
                        onClick={() => save(qt)}
                        className="tap mt-3 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold"
                        style={{
                          borderColor: on ? "var(--plugu-gold)" : "var(--border)",
                          color: on ? "var(--plugu-gold)" : "var(--muted-foreground)",
                        }}
                      >
                        {on ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                        {on ? "Saved" : "Save quote"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          <div className="mt-4 flex items-center justify-between gap-2 px-5 pb-10">
            <button
              type="button"
              onClick={() => setI((v) => Math.max(0, v - 1))}
              disabled={i === 0}
              className="tap inline-flex items-center gap-1 rounded-xl border border-border px-3.5 py-2.5 text-[12px] font-semibold disabled:opacity-35"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              type="button"
              onClick={shuffle}
              className="tap inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2.5 text-[12px] font-semibold"
            >
              <Shuffle className="h-4 w-4" /> Shuffle
            </button>
            <button
              type="button"
              onClick={() => setI((v) => Math.min(total - 1, v + 1))}
              disabled={i === total - 1}
              className="tap inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-[12px] font-bold disabled:opacity-40"
              style={{ background: "var(--plugu-gold)", color: "#0b0b0b" }}
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <section className="mt-4 space-y-3 px-5 pb-10">
          {saved.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-5 text-[13px] text-muted-foreground">
              No saved quotes yet. Tap “Save quote” on any line to keep it here.
            </p>
          ) : (
            saved.map((s) => (
              <div key={s.text} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-[14px] italic leading-relaxed">“{s.text}”</p>
                <p className="mt-2 text-[11.5px] text-muted-foreground">
                  {s.author} · <span className="italic">{s.book}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setSaved(toggleSavedQuote({ text: s.text, author: s.author, book: s.book }))}
                  className="tap mt-3 text-[11px] text-muted-foreground underline"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </section>
      )}
    </AppShell>
  );
}
