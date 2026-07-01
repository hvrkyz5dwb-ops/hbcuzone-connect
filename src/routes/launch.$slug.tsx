import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Users, Store, Rocket, Share2, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CampusUnlockAnimation } from "@/components/CampusUnlockAnimation";
import {
  getLaunchInfo, joinWaitlist, reserveHandle, markUnlocked, countdownParts,
  type LaunchInfo,
} from "@/lib/launch-data";

export const Route = createFileRoute("/launch/$slug")({
  head: () => ({ meta: [{ title: "Campus Launch Countdown — PlugU" }] }),
  component: LaunchPage,
});

function LaunchPage() {
  const { slug } = Route.useParams();
  const [info, setInfo] = useState<LaunchInfo | null>(null);
  const [now, setNow] = useState(Date.now());
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => setInfo(getLaunchInfo(slug)), [slug]);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = useMemo(() => info ? countdownParts(info.launchDate) : null, [info, now]);

  if (!info) {
    return (
      <AppShell title="LAUNCH">
        <div className="px-5 pt-10 text-center">
          <p className="text-sm text-muted-foreground">We don't have this campus on file yet.</p>
          <Link to="/hbcus" className="tap mt-3 inline-flex text-primary text-xs font-semibold">Back to HBCUS</Link>
        </div>
      </AppShell>
    );
  }

  function onJoin() {
    joinWaitlist(slug);
    const next = getLaunchInfo(slug)!;
    setInfo(next);
    toast.success("You're on the waitlist. Tell your friends.");
    if (next.unlockPct >= 100 && next.status === "coming-soon") {
      markUnlocked(slug);
      setInfo(getLaunchInfo(slug)!);
      setCelebrate(true);
    }
  }

  function onReserve() {
    reserveHandle(slug);
    setInfo(getLaunchInfo(slug)!);
    toast.success("Business handle held for launch day.");
  }

  async function onShare() {
    const text = `Help unlock ${info!.campus} on PlugU 🔌 — ${info!.unlockPct}% there.`;
    if (navigator.share) {
      try { await navigator.share({ title: "PlugU", text }); return; } catch {}
    }
    navigator.clipboard?.writeText(text);
    toast.success("Share text copied");
  }

  return (
    <AppShell title="LAUNCH">
      <section className="px-5 pt-5 slide-up">
        <Link to="/hbcus" className="tap inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3 w-3" /> All campuses
        </Link>

        <div
          className="mt-3 rounded-3xl overflow-hidden border border-white/10 p-5"
          style={{ background: "linear-gradient(160deg, rgba(244,201,106,0.35), rgba(15,10,5,0.9))" }}
        >
          <p className="text-[10px] tracking-[0.32em] uppercase text-white/70">
            {info.status === "live" ? "Yard Unlocked" : "Campus Launch"}
          </p>
          <h1 className="mt-1 text-2xl font-bold plugu-antique-wordmark">{info.campus}</h1>
          <p className="mt-1 text-xs text-white/80">
            {info.status === "live"
              ? "Your yard is live. Every seller and student is here."
              : "We launch when the yard hits 100%. Help unlock it."}
          </p>

          {info.status === "coming-soon" && parts && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { l: "Days", v: parts.days },
                { l: "Hours", v: parts.hours },
                { l: "Min", v: parts.minutes },
                { l: "Sec", v: parts.seconds },
              ].map((c) => (
                <div key={c.l} className="rounded-xl bg-black/40 border border-white/10 p-2.5 text-center">
                  <p className="text-xl font-black tabular-nums">{String(c.v).padStart(2, "0")}</p>
                  <p className="text-[9px] tracking-[0.24em] uppercase text-white/50">{c.l}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 pt-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground">Campus Unlocked</p>
              <p className="text-3xl font-black plugu-antique-wordmark leading-none mt-0.5">{info.unlockPct}%</p>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Goal: {info.goal.toLocaleString()} students
            </p>
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{
                width: `${info.unlockPct}%`,
                background: "linear-gradient(90deg, #c68a52, #f4c96a)",
                boxShadow: "0 0 18px rgba(244,201,106,0.6)",
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Metric icon={Users} label="On waitlist" value={info.waitlist.toLocaleString()} />
            <Metric icon={Store} label="Businesses" value={info.businessesSigned.toLocaleString()} />
          </div>
        </div>
      </section>

      {info.status === "coming-soon" && (
        <section className="px-5 pt-4 space-y-2.5">
          <button
            onClick={onJoin}
            className="tap w-full py-3 rounded-2xl font-semibold text-black"
            style={{ background: "linear-gradient(90deg, #f4c96a, #c68a52)" }}
          >
            Join the Waitlist
          </button>
          <button
            onClick={onReserve}
            className="tap w-full py-3 rounded-2xl font-semibold border border-primary text-primary bg-secondary/60 inline-flex items-center justify-center gap-2"
          >
            <Rocket className="h-4 w-4" /> Reserve Business Handle
          </button>
          <button
            onClick={onShare}
            className="tap w-full py-3 rounded-2xl font-semibold border border-border bg-card inline-flex items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4" /> Share to unlock faster
          </button>
        </section>
      )}

      {info.status === "live" && (
        <section className="px-5 pt-4">
          <Link
            to="/hbcus/school/$slug"
            params={{ slug }}
            className="tap block w-full text-center py-3 rounded-2xl font-semibold text-black"
            style={{ background: "linear-gradient(90deg, #f4c96a, #c68a52)" }}
          >
            Enter your yard →
          </Link>
        </section>
      )}

      <p className="px-5 py-6 text-center text-[11px] text-muted-foreground">
        The moment we hit 100%, {info.campus} goes live for every verified student.
      </p>

      {celebrate && (
        <CampusUnlockAnimation campus={info.campus} onDone={() => setCelebrate(false)} />
      )}
    </AppShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}