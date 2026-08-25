// GUIDED VIRTUAL TOUR — swipe (or tap/keyboard) through the verified stops of
// a published campus tour. Every stop is an administrator-verified place, so
// nothing here is invented; unverified places stay labelled by the caller.
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, MapPin, Clock, Loader2, Footprints } from "lucide-react";
import { useTourStops } from "@/hooks/use-campus-os";
import { categoryShape, PLACE_CATEGORY_LABEL, type CampusPlace } from "@/lib/campus-os";

export type TourSummary = {
  id: string;
  title: string;
  description: string | null;
  duration_min: number | null;
};

export function GuidedTourPlayer({
  tour,
  onClose,
  onOpenPlace,
  onNavigatePlace,
}: {
  tour: TourSummary;
  onClose: () => void;
  onOpenPlace: (p: CampusPlace) => void;
  onNavigatePlace: (p: CampusPlace) => void;
}) {
  const stops = useTourStops(tour.id);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  const list = useMemo(
    () => (stops.data ?? []).filter((s) => !!s.place),
    [stops.data],
  );
  const total = list.length;
  const current = list[Math.min(index, Math.max(0, total - 1))];

  useEffect(() => setIndex(0), [tour.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(total - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      <header className="flex items-start gap-3 border-b border-border px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            Guided tour
          </p>
          <h2 id="tour-title" className="truncate text-base font-bold">{tour.title}</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {total > 0 ? `Stop ${Math.min(index + 1, total)} of ${total}` : "Loading stops"}
            {tour.duration_min ? ` · about ${tour.duration_min} min` : ""}
          </p>
        </div>
        <button onClick={onClose} aria-label="Close guided tour" className="tap grid h-11 w-11 place-items-center rounded-full border border-border">
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* progress */}
      {total > 0 && (
        <div className="flex gap-1 px-5 pt-3" aria-hidden="true">
          {list.map((s, i) => (
            <span
              key={s.id}
              className={`h-1 flex-1 rounded-full ${i <= index ? "bg-primary" : "bg-secondary"}`}
            />
          ))}
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4"
        onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          touchX.current = null;
          if (start == null) return;
          const dx = (e.changedTouches[0]?.clientX ?? start) - start;
          if (Math.abs(dx) < 48) return;
          setIndex((i) => (dx < 0 ? Math.min(total - 1, i + 1) : Math.max(0, i - 1)));
        }}
      >
        {stops.isPending ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading tour stops…
          </p>
        ) : total === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-center">
            <p className="text-sm font-semibold">This tour has no published stops yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Stops appear once an administrator verifies and publishes them.
            </p>
          </div>
        ) : current ? (
          <article aria-live="polite">
            {current.place.media?.[0]?.url ? (
              <img
                src={current.place.media[0].url}
                alt={current.place.media[0].caption || current.place.name}
                loading="lazy"
                className="mb-4 h-48 w-full rounded-3xl border border-border object-cover"
              />
            ) : (
              <div className="mb-4 grid h-32 place-items-center rounded-3xl border border-border bg-card text-3xl" aria-hidden="true">
                {categoryShape(current.place.category)}
              </div>
            )}

            <h3 className="text-lg font-bold">{current.place.name}</h3>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
              {PLACE_CATEGORY_LABEL[current.place.category] ?? "Campus place"}
              {current.place.verification_status !== "verified" ? " · Unverified" : " · Verified"}
            </p>

            {current.note && (
              <p className="mt-3 rounded-2xl border border-border bg-card p-3 text-sm">{current.note}</p>
            )}
            {current.place.description && (
              <p className="mt-3 text-sm text-muted-foreground">{current.place.description}</p>
            )}
            {current.place.accessibility && (
              <p className="mt-2 text-xs text-muted-foreground">Accessibility: {current.place.accessibility}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => onOpenPlace(current.place)}
                className="tap inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Open stop details
              </button>
              <button
                onClick={() => onNavigatePlace(current.place)}
                className="tap inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
              >
                <Footprints className="h-3.5 w-3.5" aria-hidden="true" /> Walk here
              </button>
            </div>
          </article>
        ) : null}
      </div>

      {total > 0 && (
        <nav className="flex items-center justify-between gap-3 border-t border-border px-5 py-3" aria-label="Tour steps">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="tap inline-flex min-h-11 items-center gap-1 rounded-full border border-border px-4 text-xs font-semibold disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back
          </button>
          <ul className="flex flex-1 justify-center gap-1.5">
            {list.map((s, i) => (
              <li key={s.id}>
                <button
                  onClick={() => setIndex(i)}
                  aria-label={`Go to stop ${i + 1}: ${s.place.name}`}
                  aria-current={i === index}
                  className={`h-2.5 w-2.5 rounded-full ${i === index ? "bg-primary" : "bg-secondary"}`}
                />
              </li>
            ))}
          </ul>
          {index >= total - 1 ? (
            <button
              onClick={onClose}
              className="tap inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
            >
              <Clock className="h-4 w-4" aria-hidden="true" /> Finish
            </button>
          ) : (
            <button
              onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
              className="tap inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
            >
              Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </nav>
      )}
    </div>
  );
}

export default GuidedTourPlayer;
