import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Briefcase, DollarSign, Search, X, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AiNewsFeed } from "@/components/AiNewsFeed";
import { useProfile } from "@/hooks/use-profile";

import {
  careerSections, moneySections, hubItems,
  type HubCategory,
} from "@/lib/career-money-data";

type Hub = "career" | "money";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "Career & Money Hub — PlugU" },
      { name: "description", content: "Internships, campus jobs, scholarships, grants, side hustles, financial literacy, and small business resources — built for HBCU students." },
      { property: "og:title", content: "PlugU Career & Money Hub" },
      { property: "og:description", content: "Where students go to get plugged into careers and money." },
    ],
  }),
  component: Hub,
});

function Hub() {
  const [hub, setHub] = useState<Hub>("career");
  const [cat, setCat] = useState<HubCategory | "all">("all");
  const [q, setQ] = useState("");
  const { profile } = useProfile();
  const major = profile?.major ?? null;


  const sections = hub === "career" ? careerSections : moneySections;

  const filtered = useMemo(() => {
    return hubItems.filter((i) => {
      if (i.hub !== hub) return false;
      if (cat !== "all" && i.category !== cat) return false;
      if (q && !(`${i.title} ${i.detail}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [hub, cat, q]);

  return (
    <AppShell title="HUB">
      {/* Hero */}
      <section className="px-5 pt-5">
        <div className="rounded-3xl border border-border bg-card p-5 relative overflow-hidden">
          <div
            className="absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-40"
            style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--plugu-purple) 60%, transparent), transparent 70%)" }}
          />
          <p className="text-[10px] tracking-[0.25em] uppercase text-accent">PlugU</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Career & Money Hub</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
            Internships, jobs, scholarships, grants, side hustles, and the money skills to keep what you earn.
          </p>
        </div>
      </section>

      {/* Hub toggle */}
      <section className="px-5 pt-4">
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-secondary border border-border">
          <button
            onClick={() => { setHub("career"); setCat("all"); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              hub === "career" ? "bg-[image:var(--gradient-bronze)] text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Briefcase className="h-4 w-4" /> Career
          </button>
          <button
            onClick={() => { setHub("money"); setCat("all"); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              hub === "money" ? "bg-[image:var(--gradient-bronze)] text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <DollarSign className="h-4 w-4" /> Money
          </button>
        </div>
      </section>

      {/* Search */}
      <section className="px-5 pt-3">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${hub === "career" ? "jobs, internships, mentors" : "scholarships, grants, deals"}`}
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </section>

      {/* Category chips */}
      <section className="mt-3">
        <div tabIndex={0} className="px-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip active={cat === "all"} onClick={() => setCat("all")}>All</Chip>
          {sections.map((s) => (
            <Chip key={s.key} active={cat === s.key} onClick={() => setCat(s.key)}>
              <s.icon className="h-3.5 w-3.5" /> {s.label}
            </Chip>
          ))}
        </div>
      </section>

      {/* Matched to the student's major — live, AI-ranked opportunities */}
      <section className="px-5 pt-2 pb-1">
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="text-[10px] tracking-[0.25em] uppercase text-accent">
            {major ? `Matched to ${major}` : "Matched to you"}
          </p>
          <p className="mt-0.5 mb-2 text-[11px] text-muted-foreground">
            {major
              ? `Live ${hub === "career" ? "internships & jobs" : "scholarships & grants"} for ${major} majors.`
              : `Add your major in your profile to sharpen these ${hub === "career" ? "internships" : "scholarships"}.`}
          </p>
          <AiNewsFeed
            category={
              hub === "career"
                ? `Internships and entry-level jobs for ${major ?? "college"} students`
                : `Scholarships, grants and paid opportunities for ${major ?? "college"} students`
            }
            school={profile?.school_name ?? undefined}
            count={5}
            compact
          />
        </div>
      </section>

      {/* List */}

      <section className="px-5 mt-2 pb-6 space-y-2">
        {filtered.map((i) => (
          <article
            key={i.id}
            className={`relative rounded-2xl border p-4 ${
              i.accent === "gold"
                ? "border-accent/40 bg-card"
                : i.accent === "purple"
                ? "border-border bg-card"
                : "border-border bg-card"
            }`}
            style={i.accent === "purple" ? { boxShadow: "0 0 0 1px color-mix(in oklab, var(--plugu-purple) 30%, transparent) inset" } : undefined}
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 grid place-items-center rounded-xl bg-secondary border border-border shrink-0">
                <i.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground">
                    {sectionLabel(i.category)}
                  </p>
                  {i.meta && (
                    <span className="text-[10px] tracking-wider uppercase text-accent">· {i.meta}</span>
                  )}
                </div>
                <h3 className="mt-0.5 font-semibold leading-snug">{i.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{i.detail}</p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-primary">
                  Open <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-10">
            Nothing here yet. Try another filter.
          </div>
        )}

        <Link
          to="/news"
          className="mt-4 flex items-center justify-between px-4 py-3 rounded-2xl border border-border bg-card text-sm"
        >
          <span className="text-muted-foreground">More headlines in <span className="text-foreground font-medium">News Center</span></span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </section>
    </AppShell>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs border transition-colors ${
        active
          ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
          : "bg-card text-muted-foreground border-border"
      }`}
    >
      {children}
    </button>
  );
}

function sectionLabel(key: HubCategory): string {
  const all = [...careerSections, ...moneySections];
  return all.find((s) => s.key === key)?.label ?? key;
}