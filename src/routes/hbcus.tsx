import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Users,
  Calendar,
  Store,
  Tag,
  Newspaper,
  ArrowLeftRight,
  GraduationCap,
  Megaphone,
  Crown,
  BadgeCheck,
  Home as HomeIcon,
  Copy,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  hbcus,
  hbcuEvents,
  hbcuBusinesses,
  hbcuDiscounts,
  hbcuNews,
  transferResources,
  scholarships,
  ambassadors,
  repProfiles,
  type HbcuTab,
} from "@/lib/mock-data";
import { useHomeCampus } from "@/hooks/use-home-campus";

export const Route = createFileRoute("/hbcus")({
  head: () => ({
    meta: [
      { title: "HBCUs — PlugU" },
      { name: "description", content: "HBCU directory, events, Black-owned student businesses, vendor discounts, news, transfer resources, scholarships, and ambassadors." },
      { property: "og:title", content: "PlugU HBCUs" },
      { property: "og:description", content: "Plug into HBCU campuses across the country." },
    ],
  }),
  component: HbcusPage,
});

const tabs: { key: HbcuTab; label: string; icon: typeof Users }[] = [
  { key: "directory", label: "Directory", icon: Users },
  { key: "events", label: "Events", icon: Calendar },
  { key: "businesses", label: "Businesses", icon: Store },
  { key: "discounts", label: "Discounts", icon: Tag },
  { key: "news", label: "News", icon: Newspaper },
  { key: "transfer", label: "Transfer", icon: ArrowLeftRight },
  { key: "scholarships", label: "Scholarships", icon: GraduationCap },
  { key: "ambassadors", label: "Ambassadors", icon: Megaphone },
];

function HbcusPage() {
  const { home, active, setActive, setHomeCampus } = useHomeCampus();
  const [tab, setTab] = useState<HbcuTab>("directory");
  const [query, setQuery] = useState("");
  const [showSwitch, setShowSwitch] = useState(false);

  const filteredCampuses = useMemo(
    () => hbcus.filter((h) => h.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <AppShell title="HBCUS">
      {/* Hero / active campus */}
      <section className="px-5 pt-5">
        <div className="rounded-3xl p-5 bg-[image:var(--gradient-surface)] border border-border">
          <p className="text-[10px] tracking-[0.25em] uppercase text-primary">Active campus</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight truncate">{active}</h1>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <HomeIcon className="h-3 w-3" /> Home: {home}
              </p>
            </div>
            <button
              onClick={() => setShowSwitch(true)}
              className="shrink-0 px-3 py-2 rounded-full text-xs bg-[image:var(--gradient-bronze)] text-primary-foreground font-medium"
            >
              Switch
            </button>
          </div>
        </div>
      </section>

      {/* Tab strip */}
      <nav className="mt-4">
        <div className="px-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs border transition-colors ${
                  isActive
                    ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Tab content */}
      <section className="px-5 mt-3 pb-4">
        {tab === "directory" && (
          <>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search HBCUs"
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredCampuses.map((h) => {
                const isHome = h.name === home;
                const isActive = h.name === active;
                return (
                  <button
                    key={h.name}
                    onClick={() => setActive(h.name)}
                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden text-left p-4 flex flex-col justify-end border bg-gradient-to-br ${h.color} ${
                      isActive ? "border-primary ring-2 ring-primary/40" : "border-border"
                    }`}
                  >
                    <div className="absolute inset-0 bg-black/40" />
                    {isHome && (
                      <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 text-[10px] tracking-wider uppercase px-2 py-1 rounded-full bg-background/80 backdrop-blur text-accent">
                        <HomeIcon className="h-3 w-3" /> Home
                      </span>
                    )}
                    <div className="relative">
                      <p className="text-white font-bold text-base leading-tight">{h.name}</p>
                      <p className="text-white/70 text-xs mt-1">{h.city}</p>
                      <p className="text-white/90 text-xs mt-3 flex items-center gap-1">
                        <Users className="h-3 w-3" /> {h.students}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {tab === "events" && (
          <ul className="space-y-2">
            {hbcuEvents.map((e) => (
              <li key={e.title} className="p-4 rounded-2xl bg-card border border-border">
                <p className="text-[10px] tracking-widest text-primary uppercase">{e.when}</p>
                <p className="font-semibold mt-1">{e.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{e.school} · {e.where}</p>
              </li>
            ))}
          </ul>
        )}

        {tab === "businesses" && (
          <>
            <p className="text-xs text-muted-foreground mb-3">Black-owned student businesses on PlugU.</p>
            <ul className="space-y-2">
              {hbcuBusinesses.map((b) => (
                <li key={b.name} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
                  <div className="h-12 w-12 rounded-xl bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                    {b.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium flex items-center gap-1.5">
                      {b.name}
                      {b.verified && <BadgeCheck className="h-3.5 w-3.5 text-accent" />}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {b.owner} · {b.school} · {b.category}
                    </p>
                  </div>
                  <button className="text-xs px-3 py-1.5 rounded-full bg-secondary border border-border">
                    Visit
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === "discounts" && (
          <ul className="space-y-2">
            {hbcuDiscounts.map((d) => (
              <DiscountRow key={d.code} brand={d.brand} offer={d.offer} code={d.code} />
            ))}
          </ul>
        )}

        {tab === "news" && (
          <ul className="space-y-2">
            {hbcuNews.map((n) => (
              <li key={n.title} className="p-4 rounded-2xl bg-card border border-border">
                <p className="font-medium leading-snug">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.source} · {n.time}</p>
              </li>
            ))}
          </ul>
        )}

        {tab === "transfer" && (
          <ul className="space-y-2">
            {transferResources.map((r) => (
              <li key={r.title} className="p-4 rounded-2xl bg-card border border-border">
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.note}</p>
              </li>
            ))}
          </ul>
        )}

        {tab === "scholarships" && (
          <ul className="space-y-2">
            {scholarships.map((s) => (
              <li key={s.name} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
                <GraduationCap className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Deadline: {s.deadline}</p>
                </div>
                <span className="text-sm font-bold text-accent">{s.amount}</span>
              </li>
            ))}
          </ul>
        )}

        {tab === "ambassadors" && (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              Student ambassadors put you on. Tap to message.
            </p>
            <ul className="space-y-2 mb-6">
              {ambassadors.map((a) => (
                <li key={a.name} className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                      {a.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.school} · {a.year}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground italic">"{a.quote}"</p>
                </li>
              ))}
            </ul>

            <div className="rounded-3xl p-5 bg-[image:var(--gradient-surface)] border border-border">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-accent" />
                <h3 className="font-semibold">Rep Your Campus</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Top reps this week. Earn points by hosting, posting, and plugging.
              </p>
              <ul className="mt-3 space-y-2">
                {repProfiles.map((r, i) => (
                  <li key={r.handle} className="flex items-center gap-3 p-2.5 rounded-2xl bg-card border border-border">
                    <span className="w-5 text-center text-sm font-bold text-primary">{i + 1}</span>
                    <div className="h-9 w-9 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold text-xs">
                      {r.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground">{r.handle} · {r.school}</p>
                    </div>
                    <span className="text-xs text-accent font-semibold">{r.reps} reps</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>

      {/* Switch campus sheet */}
      {showSwitch && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSwitch(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-md bg-card border-t border-border rounded-t-3xl p-5 pb-8 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <h3 className="text-lg font-semibold">Switch campus</h3>
            <p className="text-xs text-muted-foreground">
              Browsing as <span className="text-foreground">{active}</span>. Set a new home to make it default.
            </p>
            <ul className="mt-4 space-y-2">
              {hbcus.map((h) => {
                const isHome = h.name === home;
                const isActive = h.name === active;
                return (
                  <li key={h.name}>
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-secondary border border-border">
                      <button
                        onClick={() => {
                          setActive(h.name);
                          setShowSwitch(false);
                        }}
                        className="flex-1 flex items-center gap-3 text-left min-w-0"
                      >
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${h.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate flex items-center gap-1.5">
                            {h.name}
                            {isHome && <HomeIcon className="h-3 w-3 text-accent" />}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{h.city}</p>
                        </div>
                        {isActive && <Check className="h-4 w-4 text-primary" />}
                      </button>
                      {!isHome && (
                        <button
                          onClick={() => setHomeCampus(h.name)}
                          className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full border border-accent/40 text-accent"
                        >
                          Set home
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function DiscountRow({ brand, offer, code }: { brand: string; offer: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <li className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
      <div className="h-11 w-11 rounded-xl bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
        {brand[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{brand}</p>
        <p className="text-xs text-muted-foreground truncate">{offer}</p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] tracking-wider uppercase border border-accent/40 text-accent"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : code}
      </button>
    </li>
  );
}