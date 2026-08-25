import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X, ChevronRight } from "lucide-react";
import { listings, hbcus, mapPins, events, hbcuBusinesses, scholarships } from "@/lib/mock-data";
import { opportunities } from "@/lib/opportunities-data";

const CHIPS = [
  "All", "Students", "Businesses", "Products", "Services",
  "Orgs", "Buildings", "Events", "Scholarships", "Internships", "Food", "Classes",
] as const;

type Chip = (typeof CHIPS)[number];

type Result = { id: string; label: string; sub: string; group: string; to: string };

export function SmartSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<Chip>("All");

  const results = useMemo<Result[]>(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    const r: Result[] = [];
    if (chip === "All" || chip === "Products" || chip === "Services" || chip === "Food") {
      listings.forEach((l) => {
        if (`${l.title} ${l.seller} ${l.category}`.toLowerCase().includes(needle))
          r.push({ id: `l-${l.id}`, label: l.title, sub: `${l.category} · ${l.seller}`, group: "Marketplace", to: "/market" });
      });
    }
    if (chip === "All" || chip === "Businesses") {
      hbcuBusinesses.forEach((b) => {
        if (`${b.name} ${b.owner} ${b.category}`.toLowerCase().includes(needle))
          r.push({ id: `b-${b.name}`, label: b.name, sub: `${b.category} · ${b.school}`, group: "Businesses", to: "/business" });
      });
    }
    if (chip === "All" || chip === "Events") {
      events.forEach((e) => {
        if (`${e.title} ${e.where}`.toLowerCase().includes(needle))
          r.push({ id: `e-${e.title}`, label: e.title, sub: `${e.when} · ${e.where}`, group: "Events", to: "/events" });
      });
    }
    if (chip === "All" || chip === "Buildings" || chip === "Orgs") {
      mapPins.forEach((p) => {
        if (p.name.toLowerCase().includes(needle))
          r.push({ id: `p-${p.id}`, label: p.name, sub: `${p.category} · ${p.distance}`, group: "On Campus", to: "/map" });
      });
    }
    if (chip === "All" || chip === "Scholarships") {
      scholarships.forEach((s) => {
        if (s.name.toLowerCase().includes(needle))
          r.push({ id: `s-${s.name}`, label: s.name, sub: `${s.amount} · Due ${s.deadline}`, group: "Scholarships", to: "/hub" });
      });
    }
    if (chip === "All" || chip === "Internships") {
      opportunities.filter((o) => o.kind === "internship" || o.kind === "job").forEach((o) => {
        if (`${o.title} ${o.org}`.toLowerCase().includes(needle))
          r.push({ id: `o-${o.id}`, label: o.title, sub: `${o.org} · ${o.meta}`, group: "Opportunities", to: "/hub" });
      });
    }
    if (chip === "All" || chip === "Students") {
      hbcus.forEach((h) => {
        if (h.name.toLowerCase().includes(needle))
          r.push({ id: `h-${h.name}`, label: h.name, sub: `${h.city} · ${h.students} students`, group: "Campuses", to: "/hbcus" });
      });
    }
    return r.slice(0, 30);
  }, [q, chip]);

  const grouped = useMemo(() => {
    const m = new Map<string, Result[]>();
    results.forEach((r) => {
      const arr = m.get(r.group) ?? [];
      arr.push(r);
      m.set(r.group, arr);
    });
    return Array.from(m.entries());
  }, [results]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="tap w-full mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border text-left text-sm text-muted-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1">Search students, vendors, events, classes…</span>
        <kbd className="text-[10px] tracking-widest text-muted-foreground/70 border border-border rounded px-1.5 py-0.5">/</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex flex-col">
          <div className="px-5 pt-5 pb-2 flex items-center gap-2 border-b border-border/60">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search PlugU"
              className="bg-transparent outline-none text-base flex-1 placeholder:text-muted-foreground"
            />
            <button onClick={() => { setOpen(false); setQ(""); }} aria-label="Close" className="tap h-9 w-9 grid place-items-center rounded-full bg-card border border-border">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div tabIndex={0} className="px-5 py-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-border/60">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => setChip(c)}
                className={`tap shrink-0 px-3 py-1.5 rounded-full text-[11px] border transition-colors ${
                  chip === c
                    ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div
            className="flex-1 overflow-y-auto px-5 pt-4"
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
          >
            {!q.trim() ? (
              <div className="text-center text-xs text-muted-foreground mt-10">
                Try "Fade God", "BIO 201", "Yard Show", "UNCF", or "Howard".
              </div>
            ) : grouped.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground mt-10">No results.</div>
            ) : (
              grouped.map(([group, items]) => (
                <div key={group} className="mb-5">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">{group}</p>
                  <ul className="rounded-2xl border border-border bg-card divide-y divide-border">
                    {items.map((r) => (
                      <li key={r.id}>
                        <Link
                          to={r.to as "/market"}
                          onClick={() => { setOpen(false); setQ(""); }}
                          className="tap flex items-center gap-3 px-3 py-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{r.label}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{r.sub}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}