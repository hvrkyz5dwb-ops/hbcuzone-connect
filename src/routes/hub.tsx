import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, DollarSign, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AiNewsFeed } from "@/components/AiNewsFeed";
import { useProfile } from "@/hooks/use-profile";


type Hub = "career" | "money";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "Career & Money Hub — PlugU" },
      { name: "description", content: "Internships, campus jobs, scholarships, grants, side hustles, financial literacy, and small business resources — built for HBCU students." },
      { property: "og:title", content: "PlugU Career & Money Hub" },
      { property: "og:description", content: "Where students go to get plugged into careers and money." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Hub,
});

function Hub() {
  const [hub, setHub] = useState<Hub>("career");
  const { profile } = useProfile();
  const major = profile?.major ?? null;


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
            onClick={() => setHub("career")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              hub === "career" ? "bg-[image:var(--gradient-bronze)] text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Briefcase className="h-4 w-4" /> Career
          </button>
          <button
            onClick={() => setHub("money")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              hub === "money" ? "bg-[image:var(--gradient-bronze)] text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <DollarSign className="h-4 w-4" /> Money
          </button>
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

      <section className="px-5 mt-2 pb-6">
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
