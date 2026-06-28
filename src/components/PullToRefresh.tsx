import { useRef, useState, type ReactNode, type TouchEvent } from "react";
import { Plug } from "lucide-react";

/**
 * Lightweight pull-to-refresh. Triggers `onRefresh` when the user
 * pulls down at the top of the page beyond ~70px and releases.
 */
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => void | Promise<void>;
  children: ReactNode;
}) {
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const threshold = 70;

  function onTouchStart(e: TouchEvent) {
    if (window.scrollY > 4) return;
    startY.current = e.touches[0].clientY;
  }
  function onTouchMove(e: TouchEvent) {
    if (startY.current === null || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && window.scrollY <= 0) {
      setPull(Math.min(dy * 0.5, 110));
    }
  }
  async function onTouchEnd() {
    if (startY.current === null) return;
    startY.current = null;
    if (pull >= threshold && !refreshing) {
      setRefreshing(true);
      try { await onRefresh(); } finally {
        setTimeout(() => { setRefreshing(false); setPull(0); }, 450);
      }
    } else {
      setPull(0);
    }
  }

  const progress = Math.min(pull / threshold, 1);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative"
    >
      <div
        className="pointer-events-none absolute left-0 right-0 -top-2 flex justify-center transition-transform"
        style={{ transform: `translateY(${pull}px)`, opacity: progress }}
        aria-hidden="true"
      >
        <div
          className={`h-9 w-9 grid place-items-center rounded-full border border-primary/40 bg-card shadow-[var(--shadow-glow)] ${refreshing ? "spin-slow" : ""}`}
          style={{ transform: `rotate(${progress * 360}deg)` }}
        >
          <Plug className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div
        style={{ transform: `translateY(${refreshing ? 24 : pull * 0.4}px)` }}
        className="transition-transform duration-300"
      >
        {children}
      </div>
    </div>
  );
}