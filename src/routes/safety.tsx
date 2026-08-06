import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle, Phone, MapPin, ShieldCheck, GraduationCap, Heart,
  Car, BookOpen, Home, Calendar, Tag, Bell, Search, Mail
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";
import { lostAndFound, rideBoard, studyGroups, housingBoard, studentDeals, events } from "@/lib/mock-data";

export const Route = createFileRoute("/safety")({
  head: () => ({ meta: [{ title: "Safety & Tools — PlugU" }] }),
  component: SafetyHub,
});

const TABS = [
  { key: "verify", label: ".edu Verify", icon: GraduationCap },
  { key: "lost", label: "Lost & Found", icon: Search },
  { key: "rides", label: "Rides", icon: Car },
  { key: "study", label: "Study", icon: BookOpen },
  { key: "housing", label: "Housing", icon: Home },
  { key: "events", label: "Events", icon: Calendar },
  { key: "deals", label: "Deals", icon: Tag },
  { key: "notif", label: "Alerts", icon: Bell },
] as const;

function SafetyHub() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("verify");
  const [sos, setSos] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");

  function sendVerification() {
    const email = verifyEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.edu$/.test(email)) {
      toast.error("Enter a valid .edu email address");
      return;
    }
    toast.success(`Verification link sent to ${email}`);
    setVerifyEmail("");
  }

  return (
    <AppShell title="SAFETY & TOOLS">
      {/* Emergency button */}
      <section className="px-5 pt-5">
        <button
          onClick={() => setSos(true)}
          className="w-full rounded-2xl bg-destructive/15 border border-destructive/40 p-4 flex items-center gap-3 text-left"
        >
          <div className="h-12 w-12 rounded-full grid place-items-center bg-destructive text-destructive-foreground">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-destructive">Emergency — Campus Safety</p>
            <p className="text-[11px] text-muted-foreground">Tap to call escort + share your location.</p>
          </div>
          <Phone className="h-5 w-5 text-destructive" />
        </button>
        {sos && (
          <p className="mt-2 text-[11px] text-center text-destructive">
            Connecting to campus safety… (demo)
          </p>
        )}
      </section>

      <nav className="mt-4 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs border ${
                active
                  ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </nav>

      <section className="px-5 mt-3 pb-6 space-y-3">
        {tab === "verify" && (
          <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Verify with your .edu email</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Get the verified student badge, join campus-only chats, and unlock student deals.
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={verifyEmail}
                onChange={(e) => setVerifyEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendVerification(); }}
                placeholder="you@school.edu"
                aria-label="School email"
                className="bg-transparent flex-1 text-sm outline-none"
              />
            </div>
            <button
              onClick={sendVerification}
              className="tap w-full py-2.5 rounded-xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-sm font-medium"
            >
              Send verification link
            </button>
          </div>
        )}

        {tab === "lost" && (
          <Listing
            items={lostAndFound.map((i) => ({
              title: i.title,
              meta: `${i.kind} · ${i.where} · ${i.when}`,
            }))}
            cta="Post item"
          />
        )}

        {tab === "rides" && (
          <Listing
            items={rideBoard.map((r) => ({
              title: `${r.from} → ${r.to}`,
              meta: `${r.when} · ${r.seats} seats · ${r.price}`,
            }))}
            cta="Offer / request ride"
          />
        )}

        {tab === "study" && (
          <Listing
            items={studyGroups.map((s) => ({
              title: `${s.course} — ${s.topic}`,
              meta: `${s.when} · ${s.where} · ${s.size} people`,
            }))}
            cta="Start a group"
          />
        )}

        {tab === "housing" && (
          <Listing
            items={housingBoard.map((h) => ({
              title: h.title,
              meta: `${h.rent} · ${h.when} · ${h.contact}`,
            }))}
            cta="Post a room"
          />
        )}

        {tab === "events" && (
          <Listing
            items={events.map((e) => ({
              title: e.title,
              meta: `${e.when} · ${e.where}`,
            }))}
            cta="Add event"
          />
        )}

        {tab === "deals" && (
          <Listing
            items={studentDeals.map((d) => ({
              title: `${d.brand} — ${d.offer}`,
              meta: `Code: ${d.code}`,
            }))}
            cta="Submit a deal"
          />
        )}

        {tab === "notif" && (
          <ul className="rounded-2xl bg-card border border-border divide-y divide-border">
            {[
              ["New message alerts", true],
              ["Listing replies", true],
              ["Campus safety alerts", true],
              ["Event reminders", false],
              ["KingPin drops", false],
            ].map(([label, on]) => (
              <li key={String(label)} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{label as string}</span>
                <span
                  className={`h-6 w-10 rounded-full p-0.5 ${on ? "bg-primary" : "bg-secondary"}`}
                >
                  <span className={`block h-5 w-5 rounded-full bg-background transition-transform ${on ? "translate-x-4" : ""}`} />
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="pt-2 grid grid-cols-2 gap-2">
          <Link to="/saved" className="rounded-2xl bg-card border border-border p-3 text-sm flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" /> Saved listings
          </Link>
          <Link to="/map" className="rounded-2xl bg-card border border-border p-3 text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Campus map
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function Listing({ items, cta }: { items: { title: string; meta: string }[]; cta: string }) {
  return (
    <>
      <ul className="rounded-2xl bg-card border border-border divide-y divide-border">
        {items.map((it, i) => (
          <li key={i} className="px-4 py-3">
            <p className="text-sm font-medium">{it.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{it.meta}</p>
          </li>
        ))}
      </ul>
      <button className="mt-3 w-full py-2.5 rounded-xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-sm font-medium">
        {cta}
      </button>
    </>
  );
}