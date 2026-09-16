import { useCallback, useEffect, useRef, useState } from "react";

const VIDEO_MP4_SRC = "/media/plugu-campus-intro.mp4";
const VIDEO_WEBM_SRC = "/media/plugu-campus-intro.webm";
const POSTER_SRC = "/media/plugu-campus-intro-poster.jpg";
const FULL_INTRO_MS = 2875;
const REDUCED_INTRO_MS = 750;
const EXIT_MS = 180;
const WATCHDOG_MS = 3400;

function localAsset(path: string): string {
  if (typeof window === "undefined") return path;
  const capacitor = (
    window as unknown as {
      Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string };
    }
  ).Capacitor;
  if (capacitor?.isNativePlatform?.() && capacitor.getPlatform?.() === "ios") {
    return `capacitor://localhost${path}`;
  }
  return path;
}

/**
 * Apple-compliant in-app intro. The native iOS LaunchScreen remains static;
 * this overlay runs only after React has mounted and the real destination is
 * already available beneath it. It is muted, bounded, and locally bundled.
 */
export function SplashScreen({ onDone }: { onDone?: () => void }) {
  const [reduced, setReduced] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const doneRef = useRef(false);
  const exitTimer = useRef<number | undefined>(undefined);
  const watchdog = useRef<number | undefined>(undefined);
  const reducedTimer = useRef<number | undefined>(undefined);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const finish = useCallback((immediate = false) => {
    if (doneRef.current) return;
    doneRef.current = true;
    window.clearTimeout(watchdog.current);
    window.clearTimeout(reducedTimer.current);
    setExiting(true);
    exitTimer.current = window.setTimeout(() => {
      setGone(true);
      onDoneRef.current?.();
    }, immediate ? 0 : EXIT_MS);
  }, []);

  useEffect(() => {
    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);

    if (prefersReduced) {
      reducedTimer.current = window.setTimeout(() => finish(), REDUCED_INTRO_MS);
    } else {
      // This timer is authoritative if media events are delayed or lost.
      watchdog.current = window.setTimeout(() => finish(), WATCHDOG_MS);
    }

    return () => {
      window.clearTimeout(watchdog.current);
      window.clearTimeout(reducedTimer.current);
      window.clearTimeout(exitTimer.current);
    };
  }, [finish]);

  if (gone) return null;

  return (
    <section
      className={`intro-root fixed inset-0 z-[100] overflow-hidden bg-background ${
        exiting ? "intro-exiting" : ""
      } ${reduced ? "intro-reduced" : ""}`}
      aria-label="PlugU introduction"
      data-testid="plugu-intro"
    >
      <div className="intro-stage absolute inset-0">
        <img
          src={localAsset(POSTER_SRC)}
          alt="The illuminated stone PlugU P statue on an HBCU campus"
          className="intro-poster absolute inset-0 h-full w-full"
          draggable={false}
        />

        {!reduced && (
          <video
            className="intro-video absolute inset-0 h-full w-full"
            poster={localAsset(POSTER_SRC)}
            autoPlay
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            onEnded={() => finish()}
            onError={() => finish(true)}
          >
            <source src={localAsset(VIDEO_WEBM_SRC)} type="video/webm" />
            <source src={localAsset(VIDEO_MP4_SRC)} type="video/mp4" />
          </video>
        )}

        <div className="intro-shade absolute inset-0" aria-hidden="true" />
        <div className="intro-title absolute inset-x-5 text-center" aria-live="off">
          <p>YOU'VE BEEN PLUGGED IN.</p>
        </div>
      </div>

      <button type="button" onClick={() => finish()} className="intro-skip" aria-label="Skip intro">
        Skip
      </button>
    </section>
  );
}

export const INTRO_MEDIA_DURATION_MS = FULL_INTRO_MS;