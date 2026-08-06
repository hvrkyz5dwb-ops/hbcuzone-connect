// Real-time frame-rate instrumentation for the splash (and any future
// cinematic surface). Samples requestAnimationFrame deltas, classifies
// dropped frames against the device's actual refresh budget, streams a
// live HUD when enabled (?fps=1 in the URL, or localStorage
// "plugu:fps-hud" = "1"), and persists a JSON report to sessionStorage
// so it can be pulled off a physical iPhone/Android after a run.
//
// On-device verification:
//   1. Open the app with ?fps=1 appended — a live FPS chip overlays the
//      top-left of the splash.
//   2. After the splash, the full report is in sessionStorage under
//      "plugu:splash-fps" and on window.__PLUGU_SPLASH_FPS__ (inspect via
//      Safari Web Inspector / chrome://inspect).
//   3. A one-line summary is always console.info'd at splash end.

export interface HudStats {
  fps: number;
  dropped: number;
  budgetMs: number;
  hz: number;
}

export interface FpsReport {
  label: string;
  reducedMotion: boolean;
  durationMs: number;
  frames: number;
  refreshHz: number;
  frameBudgetMs: number;
  avgFps: number;
  minFps: number;
  worstFrameMs: number;
  p95FrameMs: number;
  droppedFrames: number;
  droppedPct: number;
  jankEvents: number; // frames taking >= 2 frame budgets
  longTasks: number; // main-thread tasks > 50ms (Chromium only)
  device: {
    dpr: number;
    width: number;
    height: number;
    cores: number | null;
    memoryGb: number | null;
    mobile: boolean;
  };
  fpsTrace: number[]; // rolling 500ms fps samples across the whole run
  at: string;
}

const REPORT_KEY = "plugu:splash-fps";
const LOCK_AFTER = 24; // frames to sample before locking the refresh budget

export function fpsHudEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("fps")) return params.get("fps") !== "0";
    return window.localStorage.getItem("plugu:fps-hud") === "1";
  } catch {
    return false;
  }
}

export function readLastSplashFpsReport(): FpsReport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(REPORT_KEY);
    return raw ? (JSON.parse(raw) as FpsReport) : null;
  } catch {
    return null;
  }
}

function median(sorted: number[]): number {
  if (!sorted.length) return 16.7;
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface FpsMonitor {
  sample(): HudStats;
  stop(): FpsReport;
  abort(): void;
}

const IDLE_HUD: HudStats = { fps: 0, dropped: 0, budgetMs: 16.7, hz: 60 };

export function startFpsMonitor(label: string, opts?: { reducedMotion?: boolean }): FpsMonitor {
  if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
    return {
      sample: () => IDLE_HUD,
      stop: () => buildReport(label, opts, [], [], 0, 0),
      abort: () => {},
    };
  }

  const deltas: number[] = [];
  const fpsTrace: number[] = [];
  const startedAt = performance.now();

  let running = true;
  let stopped = false;
  let finalReport: FpsReport | null = null;
  let raf = 0;
  let last = 0;
  let longTasks = 0;

  // Provisional budget for the live HUD; the final report recomputes
  // the budget from the full run for accuracy.
  let budgetMs = 16.7;
  let locked = false;
  let dropped = 0;
  let traceFrames = 0;
  let traceStart = 0;

  let observer: PerformanceObserver | null = null;
  try {
    observer = new PerformanceObserver((list) => {
      longTasks += list.getEntries().length;
    });
    observer.observe({ entryTypes: ["longtask"] });
  } catch {
    // iOS Safari has no longtask support — longTasks stays 0.
  }

  const tick = (now: number) => {
    if (!running) return;
    if (last) {
      const d = now - last;
      // Ignore background-tab / visibility gaps so they don't read as jank.
      if (d > 0 && d < 250) {
        deltas.push(d);
        if (!locked && deltas.length >= LOCK_AFTER) {
          budgetMs = Math.min(33.4, Math.max(4, median([...deltas].sort((a, b) => a - b))));
          locked = true;
        }
        if (locked) {
          dropped += Math.max(0, Math.round(d / budgetMs) - 1);
        }
      }
    }
    traceFrames++;
    if (!traceStart) traceStart = now;
    if (now - traceStart >= 500) {
      fpsTrace.push(Math.round((traceFrames * 1000) / (now - traceStart)));
      traceFrames = 0;
      traceStart = now;
    }
    last = now;
    raf = window.requestAnimationFrame(tick);
  };
  raf = window.requestAnimationFrame(tick);

  const teardown = () => {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
    try {
      observer?.disconnect();
    } catch {}
  };

  return {
    sample(): HudStats {
      const recent = deltas.slice(-30);
      const mean = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
      return {
        fps: mean ? Math.min(Math.round(1000 / mean), Math.round(1000 / budgetMs)) : 0,
        dropped,
        budgetMs,
        hz: Math.round(1000 / budgetMs),
      };
    },
    stop(): FpsReport {
      if (finalReport) return finalReport;
      teardown();
      stopped = true;
      const durationMs = performance.now() - startedAt;
      finalReport = buildReport(label, opts, deltas, fpsTrace, durationMs, longTasks);
      publish(finalReport);
      return finalReport;
    },
    abort(): void {
      if (stopped) return;
      stopped = true;
      teardown();
    },
  };
}

function buildReport(
  label: string,
  opts: { reducedMotion?: boolean } | undefined,
  deltas: number[],
  fpsTrace: number[],
  durationMs: number,
  longTasks: number,
): FpsReport {
  const sorted = [...deltas].sort((a, b) => a - b);
  const budgetMs = Math.min(33.4, Math.max(4, median(sorted)));
  const refreshHz = Math.round(1000 / budgetMs);
  const frames = deltas.length;

  let droppedFrames = 0;
  let jankEvents = 0;
  for (const d of deltas) {
    droppedFrames += Math.max(0, Math.round(d / budgetMs) - 1);
    if (d >= budgetMs * 2) jankEvents++;
  }

  const p95Index = sorted.length ? Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95)) : 0;
  const worst = sorted.length ? sorted[sorted.length - 1] : 0;
  const avgFps = frames ? Math.min(1000 / (deltas.reduce((a, b) => a + b, 0) / frames), refreshHz) : 0;
  const minFps = worst ? Math.min(Math.round(1000 / worst), refreshHz) : 0;

  const nav = typeof navigator !== "undefined" ? navigator : ({} as Navigator);
  const navAny = nav as Navigator & { deviceMemory?: number };

  return {
    label,
    reducedMotion: opts?.reducedMotion ?? false,
    durationMs: Math.round(durationMs),
    frames,
    refreshHz,
    frameBudgetMs: Math.round(budgetMs * 100) / 100,
    avgFps: Math.round(avgFps * 10) / 10,
    minFps,
    worstFrameMs: Math.round(worst * 100) / 100,
    p95FrameMs: Math.round((sorted[p95Index] ?? 0) * 100) / 100,
    droppedFrames,
    droppedPct: frames ? Math.round((droppedFrames / (frames + droppedFrames)) * 1000) / 10 : 0,
    jankEvents,
    longTasks,
    device: {
      dpr: typeof window !== "undefined" ? window.devicePixelRatio : 1,
      width: typeof window !== "undefined" ? window.innerWidth : 0,
      height: typeof window !== "undefined" ? window.innerHeight : 0,
      cores: nav.hardwareConcurrency ?? null,
      memoryGb: navAny.deviceMemory ?? null,
      mobile: /Mobi|Android|iPhone|iPad/i.test(nav.userAgent ?? ""),
    },
    fpsTrace,
    at: new Date().toISOString(),
  };
}

function publish(report: FpsReport): void {
  try {
    window.sessionStorage.setItem(REPORT_KEY, JSON.stringify(report));
  } catch {}
  try {
    const w = window as unknown as {
      __PLUGU_SPLASH_FPS__?: FpsReport;
      __PLUGU_FPS_REPORTS__?: FpsReport[];
    };
    w.__PLUGU_SPLASH_FPS__ = report;
    (w.__PLUGU_FPS_REPORTS__ ??= []).push(report);
  } catch {}

  const status =
    report.droppedPct <= 1 && report.avgFps >= report.refreshHz - 2
      ? "PASS 60fps"
      : report.droppedPct <= 5
        ? "OK"
        : "JANK";
  // One scannable line for remote debugging, plus the full object.
  console.info(
    `[PlugU Splash FPS] ${status} · avg ${report.avgFps}/${report.refreshHz}fps · ` +
      `dropped ${report.droppedFrames} (${report.droppedPct}%) · p95 ${report.p95FrameMs}ms · ` +
      `worst ${report.worstFrameMs}ms · jank ${report.jankEvents} · longtasks ${report.longTasks}`,
    report,
  );
}