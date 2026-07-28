import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldCheck, Users, Store, Flag, Megaphone, BarChart3, Crown,
  GraduationCap, CreditCard, MapPin, Ban, Check, X, Lock, School as SchoolIcon
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  adminStats, pendingVendors, openReports, pendingAmbassadors,
  hbcus, listings, pricingTiers,
} from "@/lib/mock-data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — PlugU" }] }),
  component: Admin,
});

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "kingpins", label: "KingPins", icon: Crown },
  { key: "vendors", label: "Vendors", icon: Store },
  { key: "listings", label: "Listings", icon: ShieldCheck },
  { key: "reports", label: "Reports", icon: Flag },
  { key: "users", label: "Users", icon: Users },
  { key: "campuses", label: "Campuses", icon: MapPin },
  { key: "access", label: "School Access", icon: SchoolIcon },
  { key: "announce", label: "Announce", icon: Megaphone },
  { key: "pricing", label: "Pricing", icon: CreditCard },
  { key: "ambass", label: "Ambassadors", icon: GraduationCap },
] as const;

function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("overview");

  if (!unlocked) {
    return (
      <AppShell title="ADMIN">
        <section className="px-5 pt-16 max-w-sm mx-auto text-center">
          <div className="mx-auto h-16 w-16 rounded-full border border-primary/40 grid place-items-center bg-card">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mt-4 text-xl font-bold">Admin only</h1>
          <p className="text-xs text-muted-foreground mt-1">Owner dashboard. Enter your code.</p>
          <input
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            type="password"
            placeholder="Owner code"
            className="mt-5 w-full px-4 py-3 rounded-2xl bg-card border border-border text-sm outline-none focus:border-primary"
          />
          <button
            onClick={() => setUnlocked(pwd.toLowerCase() === "kingpin")}
            className="mt-3 w-full py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground font-medium text-sm"
          >
            Unlock
          </button>
          <p className="mt-3 text-[10px] text-muted-foreground">
            Demo gate — wire to real auth + role check before launch.
          </p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="ADMIN">
      <section className="px-5 pt-5">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Owner Dashboard
        </h1>
        <p className="text-xs text-muted-foreground">Run the whole PlugU network from here.</p>
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

      <section className="px-5 mt-3 pb-6">
        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-3">
            {adminStats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-card border border-border p-4">
                <p className="text-[10px] tracking-wider uppercase text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </div>
            ))}
            <Link to="/payment-history" className="col-span-2 rounded-2xl bg-card border border-border p-4 text-sm flex items-center justify-between">
              <span>View all payments</span><span className="text-primary">→</span>
            </Link>
          </div>
        )}

        {tab === "kingpins" && (
          <ActionList
            items={["@kingmarc", "@jadadrip", "@treybeats", "@imaniH"]}
            leftLabel="Verify"
            rightLabel="Unverify"
          />
        )}

        {tab === "vendors" && (
          <ul className="space-y-2">
            {pendingVendors.map((v) => (
              <li key={v.id} className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{v.name}</p>
                  <p className="text-[11px] text-muted-foreground">{v.owner} · {v.campus} · {v.category}</p>
                </div>
                <AdminBtn variant="ok"><Check className="h-3.5 w-3.5" /> Approve</AdminBtn>
                <AdminBtn variant="bad"><X className="h-3.5 w-3.5" /> Remove</AdminBtn>
              </li>
            ))}
          </ul>
        )}

        {tab === "listings" && (
          <ul className="space-y-2">
            {listings.slice(0, 5).map((l) => (
              <li key={l.id} className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
                <img src={l.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{l.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{l.seller} · {l.campus}</p>
                </div>
                <AdminBtn variant="ok">Feature</AdminBtn>
                <AdminBtn variant="bad">Remove</AdminBtn>
              </li>
            ))}
          </ul>
        )}

        {tab === "reports" && (
          <ul className="space-y-2">
            {openReports.map((r) => (
              <li key={r.id} className="rounded-2xl bg-card border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{r.target}</p>
                  <span className="text-[10px] text-muted-foreground">{r.when}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{r.reason}</p>
                <div className="mt-2 flex gap-2">
                  <AdminBtn variant="ok">Resolve</AdminBtn>
                  <AdminBtn variant="bad">Suspend</AdminBtn>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === "users" && (
          <ActionList
            items={["@scammerX", "@drip_fake", "@new_user_22"]}
            leftLabel="Restore"
            rightLabel={<><Ban className="h-3.5 w-3.5" /> Suspend</>}
          />
        )}

        {tab === "campuses" && (
          <ul className="space-y-2">
            {hbcus.slice(0, 6).map((h) => (
              <li key={h.name} className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{h.name}</p>
                  <p className="text-[11px] text-muted-foreground">{h.city} · {h.students} students</p>
                </div>
                <AdminBtn variant="ok">Manage</AdminBtn>
              </li>
            ))}
          </ul>
        )}

        {tab === "access" && <SchoolAccessPanel />}

        {tab === "announce" && (
          <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <input placeholder="Announcement title" className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm outline-none" />
            <textarea placeholder="Message..." rows={4} className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm outline-none" />
            <button className="w-full py-2.5 rounded-xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-sm font-medium">
              Push to all campuses
            </button>
          </div>
        )}

        {tab === "pricing" && (
          <ul className="space-y-2">
            {pricingTiers.map((t) => (
              <li key={t.key} className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.tagline}</p>
                </div>
                <input
                  defaultValue={t.price}
                  type="number"
                  className="w-16 px-2 py-1.5 rounded-lg bg-secondary border border-border text-sm text-right"
                />
                <AdminBtn variant="ok">Save</AdminBtn>
              </li>
            ))}
          </ul>
        )}

        {tab === "ambass" && (
          <ul className="space-y-2">
            {pendingAmbassadors.map((a) => (
              <li key={a.name} className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-[11px] text-muted-foreground">{a.school} · {a.year}</p>
                </div>
                <AdminBtn variant="ok">Approve</AdminBtn>
                <AdminBtn variant="bad">Deny</AdminBtn>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function AdminBtn({ children, variant }: { children: React.ReactNode; variant: "ok" | "bad" }) {
  return (
    <button
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] border ${
        variant === "ok"
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-destructive/10 border-destructive/30 text-destructive"
      }`}
    >
      {children}
    </button>
  );
}

function ActionList({
  items, leftLabel, rightLabel,
}: { items: string[]; leftLabel: React.ReactNode; rightLabel: React.ReactNode }) {
  return (
    <ul className="space-y-2">
      {items.map((h) => (
        <li key={h} className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
          <span className="flex-1 text-sm">{h}</span>
          <AdminBtn variant="ok">{leftLabel}</AdminBtn>
          <AdminBtn variant="bad">{rightLabel}</AdminBtn>
        </li>
      ))}
    </ul>
  );
}