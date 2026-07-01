import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Users,
  Calendar,
  Store,
  Newspaper,
  GraduationCap,
  Crown,
  BadgeCheck,
  Home as HomeIcon,
  Check,
  Trophy,
  Briefcase,
  School as SchoolIcon,
  Sparkles,
  Heart,
  ChevronRight,
  MapPin,
  Bookmark,
  Send,
  TrendingUp,
  Radio,
  Bot,
  Lock,
  Mail,
  IdCard,
  Award,
  Megaphone,
  Sun,
  Quote,
  Flame,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AiNewsFeed } from "@/components/AiNewsFeed";
import { MiniCampusLayout } from "@/components/MiniCampusLayout";
import { hbcus } from "@/lib/mock-data";
import { useHomeCampus } from "@/hooks/use-home-campus";
import { useHbcusVerification } from "@/hooks/use-hbcus-verification";
import {
  hbcuNewsFilters,
  hbcuLiveNews,
  liveScores,
  upcomingGames,
  completedGames,
  conferenceStandings,
  topPerformers,
  sportsTabs,
  sportLeagues,
  schoolProfiles,
  getSchoolDetail,
  internships,
  internshipFilters,
  scholarshipsList,
  scholarshipCategories,
  blackBusinesses,
  networkingProfiles,
  networkingFilters,
  liveEvents,
  pluguDailyTopics,
  aiSuggestedPrompts,
  type SchoolProfile,
  hbcusHomeSections,
  type HbcusHomeSection,
  breakingNews,
  announcements,
  homecomingCountdowns,
  successStories,
  trendingConvos,
  dailyMotivation,
  communityFeedSample,
  communityRails,
  alumniNetwork,
  alumniIndustries,
  excellenceFeed,
  excellenceCategories,
  rankingCategories,
  hbcusRankings,
  type RankingCategory,
  studentSpotlights,
  studyAbroadPrograms,
  financialTips,
  marketTickers,
  marketHeadlines,
  mustReadNews,
  careerOpportunities,
  schoolSlug,
} from "@/lib/hbcus-data";
import statueImg from "@/assets/plugu-statue.jpg.asset.json";

export const Route = createFileRoute("/hbcus")({
  head: () => ({
    meta: [
      { title: "HBC\"US\" — PlugU" },
      { name: "description", content: "The HBCU experience inside PlugU: live news, sports, schools, internships, scholarships, marketplace, networking, events, and PlugU Daily." },
      { property: "og:title", content: "HBC\"US\" on PlugU" },
      { property: "og:description", content: "A complete mini-app for HBCU students — news, sports, scholarships, internships, events, and more." },
    ],
  }),
  component: HbcusPage,
});

function HbcusPage() {
  const verification = useHbcusVerification();

  if (!verification.hydrated) {
    return <AppShell title='HBC"US"'><div className="px-5 pt-10 text-xs text-muted-foreground">Loading…</div></AppShell>;
  }
  if (!verification.verified) {
    return <VerificationWall onVerified={verification.verify} />;
  }
  return <HbcusApp verifiedSchool={verification.school} />;
}

function HbcusApp({ verifiedSchool }: { verifiedSchool?: string }) {
  const { home, active, setActive, setHomeCampus } = useHomeCampus();
  const [showSwitch, setShowSwitch] = useState(false);
  const [section, setSection] = useState<HbcusHomeSection>("Home");
  const [showAI, setShowAI] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (verifiedSchool) setActive(verifiedSchool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedSchool]);

  // Scroll horizontally to active section pill
  useEffect(() => {
    const el = sectionRefs.current[section];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [section]);

  return (
    <AppShell title='HBC"US"'>
      <div className="hbcus-theme relative min-h-[calc(100dvh-9rem)]">
        <div className="hbcus-theme-bg" aria-hidden="true" />

        {/* Hero */}
        <section className="px-5 pt-5 hbcus-rise">
          <div className="hbcus-card overflow-hidden">
            <img src={statueImg.url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.18] mix-blend-luminosity" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--hbcu-night) 88%, transparent) 80%)" }} />
            <div className="relative p-5">
              <div className="flex items-center gap-2">
                <span className="hbcus-chip">
                  <Crown className="h-3 w-3 hbcus-crown" /> Exclusive Network
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-400/40 text-emerald-200 bg-emerald-500/10">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
              </div>
              <h1 className="mt-3 text-[2.6rem] leading-none tracking-tight">
                <span className="hbcus-wordmark">HBC</span>
                <span className="hbcus-wordmark italic">"US"</span>
              </h1>
              <div className="hbcus-rule my-3 max-w-[12rem]" />
              <p className="text-[12px] leading-relaxed max-w-xs" style={{ color: "color-mix(in oklab, var(--hbcu-cream) 78%, transparent)" }}>
                The members-only digital home of Historically Black Colleges & Universities — built for the culture, by the culture.
              </p>
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowSwitch(true)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold tap"
                  style={{ background: "var(--hbcu-gold-grad)", color: "var(--hbcu-night)", boxShadow: "0 8px 22px -10px color-mix(in oklab, var(--hbcu-gold) 70%, transparent)" }}
                >
                  <SchoolIcon className="h-3.5 w-3.5" />
                  {active}
                </button>
                <span className="text-[10px] inline-flex items-center gap-1" style={{ color: "color-mix(in oklab, var(--hbcu-cream) 65%, transparent)" }}>
                  <HomeIcon className="h-3 w-3" /> Home: {home}
                </span>
                <button
                  onClick={() => setShowAI(true)}
                  className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs tap"
                  style={{ border: "1px solid color-mix(in oklab, var(--hbcu-gold) 45%, transparent)", color: "var(--hbcu-gold)", background: "color-mix(in oklab, var(--hbcu-deep) 70%, transparent)" }}
                >
                  <Bot className="h-3.5 w-3.5" /> Ask AI
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky section nav */}
        <nav
          className="sticky top-0 z-30 mt-4 backdrop-blur-xl"
          style={{
            background: "color-mix(in oklab, var(--hbcu-night) 72%, transparent)",
            borderTop: "1px solid color-mix(in oklab, var(--hbcu-gold) 18%, transparent)",
            borderBottom: "1px solid color-mix(in oklab, var(--hbcu-gold) 18%, transparent)",
          }}
        >
          <div className="px-5 flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {hbcusHomeSections.map((key) => {
              const isActive = section === key;
              return (
                <button
                  key={key}
                  ref={(el) => { sectionRefs.current[key] = el; }}
                  onClick={() => setSection(key)}
                  data-active={isActive}
                  className="hbcus-tab shrink-0 tap"
                >
                  {key}
                </button>
              );
            })}
          </div>
        </nav>

        <section className="px-5 pt-4 pb-6 view-enter hbcus-rise" key={section}>
        {section === "Home" && <HomePanel activeSchool={active} onJump={setSection} />}
        {section === "News" && <NewsPanel activeSchool={active} />}
        {section === "Sports" && <SportsPanel />}
        {section === "Schools" && <SchoolsPanel onPick={setActive} />}
        {section === "Greek Life" && <GreekLifePanel />}
        {section === "Communities" && <CommunitiesPanel activeSchool={active} />}
        {section === "Internships" && <InternshipsPanel />}
        {section === "Scholarships" && <ScholarshipsPanel />}
        {section === "Marketplace" && <MarketplacePanel />}
        {section === "Networking" && <NetworkingPanel />}
        {section === "Alumni" && <AlumniPanel />}
        {section === "Excellence" && <ExcellencePanel />}
        {section === "Rankings" && <RankingsPanel />}
        {section === "Events" && <EventsPanel />}
        {section === "PlugU Daily" && <DailyPanel />}
        </section>
      </div>

      {showSwitch && (
        <SwitchSheet
          home={home}
          active={active}
          setActive={(n) => { setActive(n); setShowSwitch(false); }}
          setHome={setHomeCampus}
          onClose={() => setShowSwitch(false)}
        />
      )}

      {showAI && <AISheet onClose={() => setShowAI(false)} />}
    </AppShell>
  );
}

/* ============================================================
   VERIFICATION WALL — non-HBCU students see info; HBCU students verify
============================================================ */
function VerificationWall({
  onVerified,
}: { onVerified: (v: { method: "edu" | "id" | "school"; email?: string; school?: string }) => void }) {
  const [tab, setTab] = useState<"edu" | "id" | "school">("edu");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState(schoolProfiles[0].name);
  const [error, setError] = useState<string | null>(null);

  const eduDomains = ["howard.edu", "spelman.edu", "morehouse.edu", "hamptonu.edu", "famu.edu", "talladega.edu", "tuskegee.edu", "nccu.edu", "jsums.edu", "subr.edu", "bethune.edu", "cau.edu"];

  function submit() {
    setError(null);
    if (tab === "edu") {
      const domain = email.split("@")[1]?.toLowerCase();
      if (!domain || !eduDomains.some((d) => domain.endsWith(d))) {
        setError("Please use a valid HBCU .edu email.");
        return;
      }
      const match = schoolProfiles.find((s) => domain.includes(s.website.split(".")[0].toLowerCase()));
      onVerified({ method: "edu", email, school: match?.name ?? schoolProfiles[0].name });
    } else if (tab === "id") {
      onVerified({ method: "id", school });
    } else {
      onVerified({ method: "school", school });
    }
  }

  return (
    <AppShell title='HBC"US"'>
      <div className="hbcus-theme relative min-h-[calc(100dvh-9rem)]">
        <div className="hbcus-theme-bg" aria-hidden="true" />
        <section className="px-5 pt-5 hbcus-rise">
        <div className="relative overflow-hidden rounded-3xl border border-border">
          <img src={statueImg.url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          <div className="relative p-6">
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-primary/40 text-primary bg-primary/10">
              <Lock className="h-3 w-3" /> Members Only
            </span>
            <h1 className="mt-3 text-[2.6rem] leading-none tracking-tight">
              <span className="hbcus-wordmark">HBC</span>
              <span className="hbcus-wordmark italic">"US"</span>
            </h1>
            <div className="hbcus-rule my-3 max-w-[10rem]" />
            <p className="text-sm mt-2 max-w-sm" style={{ color: "color-mix(in oklab, var(--hbcu-cream) 78%, transparent)" }}>
              HBC"US" is an exclusive experience for verified HBCU students. Verify your status below to unlock the full network.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pt-5 space-y-3">
        <h2 className="text-xs tracking-widest uppercase text-muted-foreground">What you unlock</h2>
        <ul className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["School Communities", Users],
            ["Live Sports Center", Trophy],
            ["Alumni Network", Award],
            ["Black Excellence", Sparkles],
            ["HBCU Marketplace", Store],
            ["National Rankings", TrendingUp],
          ].map(([label, Icon]) => {
            const I = Icon as typeof Users;
            return (
              <li key={label as string} className="p-3 rounded-2xl bg-card border border-border flex items-center gap-2">
                <I className="h-4 w-4 text-accent" />
                <span>{label as string}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="px-5 pt-6">
        <div className="rounded-3xl border border-border bg-card p-5">
          <h3 className="font-semibold">Verify your HBCU status</h3>
          <p className="text-xs text-muted-foreground mt-1">Choose one method. You only need to do this once.</p>

          <div className="mt-4 grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-secondary border border-border">
            {([
              ["edu", "Email", Mail],
              ["id", "Student ID", IdCard],
              ["school", "School", SchoolIcon],
            ] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`py-2 rounded-xl text-[11px] font-medium inline-flex items-center justify-center gap-1.5 tap ${
                  tab === key ? "bg-[image:var(--gradient-bronze)] text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {tab === "edu" && (
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">HBCU .edu email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@howard.edu"
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-secondary border border-border outline-none text-sm"
                />
              </label>
            )}
            {tab === "id" && (
              <div className="space-y-2">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">School</span>
                  <select
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm"
                  >
                    {schoolProfiles.map((s) => <option key={s.name}>{s.name}</option>)}
                  </select>
                </label>
                <div className="border border-dashed border-border rounded-xl p-4 text-center text-xs text-muted-foreground">
                  Upload a photo of your student ID
                  <br />
                  <span className="text-[10px]">(simulated — accepted instantly in this build)</span>
                </div>
              </div>
            )}
            {tab === "school" && (
              <div>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">School verification</span>
                  <select
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm"
                  >
                    {schoolProfiles.map((s) => <option key={s.name}>{s.name}</option>)}
                  </select>
                </label>
                <p className="mt-2 text-[10px] text-muted-foreground">School registrar verification coming soon.</p>
              </div>
            )}

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <button
              onClick={submit}
              className="w-full py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground font-semibold tap"
            >
              Verify & Unlock HBC"US"
            </button>
            <p className="text-[10px] text-muted-foreground text-center">
              Not at an HBCU? You'll keep all your PlugU features — HBC"US" stays exclusive to verified HBCU students.
            </p>
          </div>
        </div>
      </section>
      </div>
    </AppShell>
  );
}

/* ============================================================
   HOME — intelligent dashboard
============================================================ */
function HomePanel({ activeSchool, onJump }: { activeSchool: string; onJump: (s: HbcusHomeSection) => void }) {
  const quote = useMemo(() => dailyMotivation[new Date().getDate() % dailyMotivation.length], []);
  const homecoming = homecomingCountdowns.find((h) => h.school === activeSchool) ?? homecomingCountdowns[0];
  const liveGame = liveScores[0];

  return (
    <div className="space-y-5">
      <SectionHeader icon={Flame} title="HBC&quot;US&quot; Today" subtitle={`Your ${activeSchool} briefing`} live />

      {/* Breaking */}
      <div className="rounded-3xl border border-rose-500/40 bg-rose-500/5 p-4">
        <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-rose-300">
          <Megaphone className="h-3 w-3" /> Breaking
        </p>
        <ul className="mt-2 space-y-2">
          {breakingNews.map((b) => (
            <li key={b.id} className="flex items-start gap-2 text-sm">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500 plugu-pulse shrink-0" />
              <span className="flex-1">{b.title} <span className="text-[10px] text-muted-foreground">· {b.school} · {b.time}</span></span>
            </li>
          ))}
        </ul>
      </div>

      {/* Live AI feeds (real-world) */}
      <div className="rounded-3xl border border-border bg-card/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-accent" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Live · Powered by PlugU AI</p>
          </div>
          <button onClick={() => onJump("News")} className="text-[11px] text-accent tap">See all →</button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-yellow-300" /> HBCU Sports & Scores</p>
            <AiNewsFeed category="HBCU sports scores rankings" school={activeSchool} count={4} compact />
          </div>
          <div>
            <p className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-accent" /> Black Excellence & Alumni Wins</p>
            <AiNewsFeed category="Black excellence alumni wins culture" school={activeSchool} count={4} compact />
          </div>
          <div>
            <p className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-emerald-300" /> Scholarships & Internships</p>
            <AiNewsFeed category="Scholarships internships for Black college students with deadlines" school={activeSchool} count={4} compact />
          </div>
          <div>
            <p className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-pink-300" /> Events on the Yard & Nationally</p>
            <AiNewsFeed category="HBCU campus events homecomings career fairs conferences" school={activeSchool} count={4} compact />
          </div>
        </div>
      </div>

      {/* Quick tiles row */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onJump("Sports")} className="text-left rounded-2xl border border-border bg-card p-4 tap">
          <p className="text-[10px] uppercase tracking-widest text-rose-400 inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 plugu-pulse" /> Live · {liveGame.sport}
          </p>
          <p className="mt-2 text-sm font-semibold">{liveGame.home} {liveGame.homeScore} — {liveGame.awayScore} {liveGame.away}</p>
          <p className="text-[11px] text-muted-foreground">{liveGame.status}</p>
        </button>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-widest text-primary">Homecoming</p>
          <p className="mt-2 text-3xl font-black tracking-tight" style={{ color: "var(--plugu-gold)" }}>{homecoming.days}</p>
          <p className="text-[11px] text-muted-foreground">days · {homecoming.school} · {homecoming.theme}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-widest text-primary">Campus Weather</p>
          <p className="mt-2 text-2xl font-bold flex items-center gap-2"><Sun className="h-5 w-5 text-yellow-300" /> 72°</p>
          <p className="text-[11px] text-muted-foreground">Sunny on the Yard</p>
        </div>
        <button onClick={() => onJump("Scholarships")} className="text-left rounded-2xl border border-border bg-card p-4 tap">
          <p className="text-[10px] uppercase tracking-widest text-accent">Scholarship</p>
          <p className="mt-2 text-sm font-semibold">{scholarshipsList[0].name}</p>
          <p className="text-[11px] text-muted-foreground">{scholarshipsList[0].amount} · {scholarshipsList[0].deadline}</p>
        </button>
      </div>

      {/* Announcements */}
      <DashRow title="School Announcements" onMore={() => onJump("News")}>
        <ul className="space-y-2">
          {announcements.map((a) => (
            <li key={a.id} className="p-3 rounded-2xl bg-card border border-border flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-accent">{a.tag}</span>
              <span className="text-sm flex-1">{a.title}</span>
              <span className="text-[10px] text-muted-foreground">{a.school}</span>
            </li>
          ))}
        </ul>
      </DashRow>

      {/* Upcoming events horizontal */}
      <DashRow title="Upcoming Events" onMore={() => onJump("Events")}>
        <div className="-mx-5 px-5 flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {liveEvents.slice(0, 5).map((e) => (
            <div key={e.id} className="shrink-0 w-56 rounded-2xl bg-card border border-border p-3">
              <p className="text-[10px] uppercase tracking-widest text-primary">{e.type}</p>
              <p className="font-semibold text-sm mt-1 line-clamp-2">{e.title}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{e.when} · {e.school}</p>
            </div>
          ))}
        </div>
      </DashRow>

      {/* Opportunities */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onJump("Internships")} className="text-left rounded-2xl border border-border bg-card p-4 tap">
          <p className="text-[10px] uppercase tracking-widest text-primary">Internship</p>
          <p className="font-semibold mt-1 text-sm">{internships[0].role}</p>
          <p className="text-[11px] text-muted-foreground">{internships[0].company} · {internships[0].pay}</p>
        </button>
        <button onClick={() => onJump("Alumni")} className="text-left rounded-2xl border border-border bg-card p-4 tap">
          <p className="text-[10px] uppercase tracking-widest text-accent">Alumni Spotlight</p>
          <p className="font-semibold mt-1 text-sm">{alumniNetwork[0].name}</p>
          <p className="text-[11px] text-muted-foreground">{alumniNetwork[0].role} @ {alumniNetwork[0].company}</p>
        </button>
      </div>

      {/* Business spotlight */}
      <DashRow title="Black-Owned Business" onMore={() => onJump("Marketplace")}>
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-14 w-14 rounded-xl bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-black text-xl">
            {blackBusinesses[0].name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold flex items-center gap-1">{blackBusinesses[0].name}<BadgeCheck className="h-3.5 w-3.5 text-accent" /></p>
            <p className="text-[11px] text-muted-foreground">{blackBusinesses[0].owner} · {blackBusinesses[0].school}</p>
          </div>
          <span className="text-[11px] text-accent">{blackBusinesses[0].followers}</span>
        </div>
      </DashRow>

      {/* Student success */}
      <DashRow title="Student Success" onMore={() => onJump("Excellence")}>
        <ul className="space-y-2">
          {successStories.map((s) => (
            <li key={s.id} className="p-3 rounded-2xl bg-card border border-border">
              <p className="text-sm font-semibold">{s.name} <span className="text-[10px] text-muted-foreground">· {s.school}</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.note}</p>
            </li>
          ))}
        </ul>
      </DashRow>

      {/* Trending convos */}
      <DashRow title="Trending Conversations" onMore={() => onJump("Communities")}>
        <ul className="space-y-2">
          {trendingConvos.map((c) => (
            <li key={c.id} className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between">
              <span className="text-sm">{c.title}</span>
              <span className="text-[11px] text-muted-foreground">{c.replies} replies</span>
            </li>
          ))}
        </ul>
      </DashRow>

      {/* Student Spotlights */}
      <DashRow title="Student Spotlights" onMore={() => onJump("Excellence")}>
        <div className="-mx-5 px-5 flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {studentSpotlights.map((s) => (
            <div key={s.id} className="shrink-0 w-60 rounded-2xl bg-card border border-border p-4">
              <p className="text-2xl">{s.emoji}</p>
              <p className="mt-1 font-semibold text-sm">{s.name}</p>
              <p className="text-[11px] text-accent">{s.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.school}</p>
              <p className="text-xs text-muted-foreground mt-2">{s.note}</p>
            </div>
          ))}
        </div>
      </DashRow>

      {/* Career Opportunities */}
      <DashRow title="Career Opportunities" onMore={() => onJump("Internships")}>
        <ul className="space-y-2">
          {careerOpportunities.map((c) => (
            <li key={c.id} className="p-3 rounded-2xl bg-card border border-border flex items-center gap-3">
              <span className="text-xl">{c.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{c.role}</p>
                <p className="text-[11px] text-muted-foreground">{c.company} · {c.type}</p>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-rose-300">Due {c.deadline}</span>
            </li>
          ))}
        </ul>
      </DashRow>

      {/* Study Abroad */}
      <DashRow title="Study Abroad">
        <div className="-mx-5 px-5 flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {studyAbroadPrograms.map((p) => (
            <div key={p.id} className="shrink-0 w-56 rounded-2xl bg-card border border-border p-4">
              <p className="text-2xl">{p.emoji}</p>
              <p className="text-[10px] uppercase tracking-widest text-primary mt-1">{p.country}</p>
              <p className="mt-1 text-sm font-semibold leading-tight">{p.program}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{p.school} · {p.term}</p>
              <p className="text-[11px] text-accent mt-1">{p.cost}</p>
            </div>
          ))}
        </div>
      </DashRow>

      {/* Financial Literacy */}
      <DashRow title="Financial Literacy">
        <ul className="grid grid-cols-1 gap-2">
          {financialTips.map((t) => (
            <li key={t.id} className="p-3.5 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{t.title}</p>
                <span className="text-[10px] uppercase tracking-widest text-accent">{t.tag}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t.body}</p>
            </li>
          ))}
        </ul>
      </DashRow>

      {/* Stocks & Market */}
      <DashRow title="Stocks & Market News">
        <div className="-mx-5 px-5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-3">
          {marketTickers.map((t) => (
            <div key={t.symbol} className="shrink-0 px-3 py-2 rounded-xl bg-card border border-border min-w-[120px]">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t.symbol}</p>
              <p className="text-sm font-semibold">{t.price}</p>
              <p className={`text-[11px] font-semibold ${t.up ? "text-emerald-400" : "text-rose-400"}`}>{t.change}</p>
            </div>
          ))}
        </div>
        <ul className="space-y-2">
          {marketHeadlines.map((m) => (
            <li key={m.id} className="p-3 rounded-2xl bg-card border border-border flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-sm flex-1">{m.title}</span>
              <span className="text-[10px] text-muted-foreground">{m.time}</span>
            </li>
          ))}
        </ul>
      </DashRow>

      {/* News Black college students should know */}
      <DashRow title="News You Should Know" onMore={() => onJump("News")}>
        <ul className="space-y-2">
          {mustReadNews.map((n) => (
            <li key={n.id} className="p-3.5 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-primary">{n.tag}</span>
                <span className="text-[10px] text-muted-foreground">· {n.source} · {n.time}</span>
              </div>
              <p className="text-sm font-semibold mt-1">{n.title}</p>
            </li>
          ))}
        </ul>
      </DashRow>

      {/* Motivation */}
      <div className="rounded-3xl border border-border p-5 bg-[image:var(--gradient-bronze)] text-primary-foreground">
        <Quote className="h-5 w-5 opacity-70" />
        <p className="mt-2 text-base font-semibold leading-snug">"{quote}"</p>
        <p className="mt-1 text-[10px] uppercase tracking-widest opacity-80">Daily motivation</p>
      </div>
    </div>
  );
}

function DashRow({ title, onMore, children }: { title: string; onMore?: () => void; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {onMore && (
          <button onClick={onMore} className="text-[11px] text-accent inline-flex items-center gap-0.5 tap">
            See all <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/* ============================================================
   COMMUNITIES — per-school digital campus
============================================================ */
function CommunitiesPanel({ activeSchool }: { activeSchool: string }) {
  const [rail, setRail] = useState<string>("School Feed");
  const school = schoolProfiles.find((s) => s.name === activeSchool) ?? schoolProfiles[0];
  return (
    <div className="space-y-4">
      <SectionHeader icon={Users} title="School Communities" subtitle={`${school.name} · ${school.pluguStudents} on PlugU`} />

      <div className={`relative h-28 rounded-3xl overflow-hidden bg-gradient-to-br ${school.color} border border-border`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-white font-bold">{school.name}</p>
          <p className="text-white/70 text-[11px]">{school.mascot} · {school.conference} · {school.liveActivity}</p>
        </div>
      </div>

      <FilterChips values={communityRails as readonly string[]} active={rail} onChange={setRail} />

      <ul className="space-y-2">
        {communityFeedSample.map((c) => (
          <li key={c.id} className="p-3.5 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground text-xs font-bold">
                {c.user[0]}
              </div>
              <div>
                <p className="text-sm font-semibold">{c.user}</p>
                <p className="text-[10px] text-muted-foreground">{c.tag} · {c.time}</p>
              </div>
              <span className="ml-auto text-[11px] text-muted-foreground inline-flex items-center gap-1">
                <Heart className="h-3 w-3" /> {c.likes}
              </span>
            </div>
            <p className="text-sm mt-2">{c.post}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   ALUMNI NETWORK
============================================================ */
function AlumniPanel() {
  const [industry, setIndustry] = useState<string>("All");
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const items = useMemo(() => {
    return alumniNetwork.filter((a) => {
      const matchInd = industry === "All" || a.industry === industry;
      const t = q.toLowerCase();
      const matchQ = !t || a.name.toLowerCase().includes(t) || a.school.toLowerCase().includes(t) || a.company.toLowerCase().includes(t) || a.year.includes(t);
      return matchInd && matchQ;
    });
  }, [industry, q]);
  return (
    <div className="space-y-4">
      <SectionHeader icon={Award} title="Alumni Network" subtitle="Mentorship, jobs, internships, capital" />
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by school, company, year" className="bg-transparent outline-none text-sm flex-1" />
      </div>
      <FilterChips values={alumniIndustries as readonly string[]} active={industry} onChange={setIndustry} />
      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a.id} className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">{a.name[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{a.name} <span className="text-[10px] text-accent uppercase tracking-widest">· {a.industry}</span></p>
                <p className="text-xs text-muted-foreground truncate">{a.role} @ {a.company}</p>
                <p className="text-[11px] text-muted-foreground">{a.school} '{a.year.slice(2)} · {a.location}</p>
              </div>
              <button
                onClick={() => {
                  setConnected((s) => new Set(s).add(a.id));
                  toast.success(`Request sent to ${a.name}`, { description: "We'll ping you when they accept." });
                  setTimeout(() => navigate({ to: "/messages" }), 400);
                }}
                className={`text-[11px] px-3 py-1.5 rounded-full font-semibold tap ${connected.has(a.id) ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-[image:var(--gradient-bronze)] text-primary-foreground"}`}
              >
                {connected.has(a.id) ? "Requested" : "Connect"}
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {a.offers.map((o) => (
                <span key={o} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-accent">{o}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   BLACK EXCELLENCE HUB
============================================================ */
function ExcellencePanel() {
  const [cat, setCat] = useState<string>("All");
  const items = useMemo(() => (cat === "All" ? excellenceFeed : excellenceFeed.filter((e) => e.category === cat)), [cat]);
  return (
    <div className="space-y-4">
      <SectionHeader icon={Sparkles} title="Black Excellence Hub" subtitle="Celebrating HBCU culture & achievement" />
      <FilterChips values={excellenceCategories as readonly string[]} active={cat} onChange={setCat} />
      <div className="grid grid-cols-1 gap-3">
        {items.map((e) => (
          <article key={e.id} className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="h-28 bg-[image:var(--gradient-bronze)] relative">
              <div className="absolute inset-0 bg-black/40" />
              <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-background/80 backdrop-blur px-2 py-1 rounded-full text-accent">{e.category}</span>
              <div className="absolute bottom-3 left-3">
                <p className="text-white font-bold text-lg">{e.name}</p>
                <p className="text-white/70 text-[11px]">{e.school}</p>
              </div>
            </div>
            <p className="p-4 text-sm text-muted-foreground">{e.highlight}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   NATIONAL RANKINGS
============================================================ */
function RankingsPanel() {
  const [cat, setCat] = useState<RankingCategory>("Campus Economy");
  const data = hbcusRankings[cat];
  return (
    <div className="space-y-4">
      <SectionHeader icon={Crown} title="HBCU National Rankings" subtitle="Exclusive to HBC&quot;US&quot; members" />
      <FilterChips values={rankingCategories as readonly string[]} active={cat} onChange={(v) => setCat(v as RankingCategory)} />
      <ol className="space-y-2">
        {data.map((row, i) => (
          <li key={row.school} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
            <span className={`h-8 w-8 grid place-items-center rounded-xl font-black ${i === 0 ? "bg-[image:var(--gradient-bronze)] text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{row.school}</p>
              <p className="text-[11px] text-muted-foreground">{row.metric}</p>
            </div>
            <span className={`text-xs font-semibold ${row.delta.startsWith("-") || row.delta.startsWith("↓") ? "text-rose-400" : "text-emerald-400"}`}>
              {row.delta}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ============================================================
   NEWS
============================================================ */
function NewsPanel({ activeSchool }: { activeSchool: string }) {
  const [filter, setFilter] = useState<(typeof hbcuNewsFilters)[number]>("All HBCUs");

  return (
    <div className="space-y-4">
      <SectionHeader icon={Radio} title="Live HBCU News" subtitle="Real-time across the Yard" live />
      <FilterChips
        values={hbcuNewsFilters as readonly string[]}
        active={filter}
        onChange={(v) => setFilter(v as typeof filter)}
      />
      <AiNewsFeed
        category={`HBCU News — ${filter}`}
        school={filter === "My School" ? activeSchool : undefined}
        count={10}
        fallback={hbcuLiveNews.map((n) => ({
          id: n.id, headline: n.title, summary: n.summary,
          source: n.school, time: n.time, tag: n.tag, emoji: "📰",
        }))}
      />
    </div>
  );
}

function ArticleActions() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
      <button onClick={() => setLiked((v) => !v)} className="inline-flex items-center gap-1 tap">
        <Heart className={`h-4 w-4 ${liked ? "fill-current text-rose-500" : ""}`} />
        {liked ? "Liked" : "Like"}
      </button>
      <button onClick={() => setSaved((v) => !v)} className="inline-flex items-center gap-1 tap">
        <Bookmark className={`h-4 w-4 ${saved ? "fill-current text-accent" : ""}`} />
        {saved ? "Saved" : "Save"}
      </button>
      <button
        onClick={() => {
          if (typeof navigator !== "undefined" && navigator.share) {
            navigator.share({ title: "PlugU", url: typeof location !== "undefined" ? location.href : "" }).catch(() => {});
          } else {
            toast.success("Link copied", { description: "Share it with the plug." });
            if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(location.href).catch(() => {});
          }
        }}
        className="inline-flex items-center gap-1 tap ml-auto"
      >
        <Send className="h-4 w-4" /> Share
      </button>
    </div>
  );
}

/* ============================================================
   SPORTS
============================================================ */
function SportsPanel() {
  const [tab, setTab] = useState<(typeof sportsTabs)[number]>("Live");
  const [league, setLeague] = useState<(typeof sportLeagues)[number] | "All">("All");
  const [notify, setNotify] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-4">
      <SectionHeader icon={Trophy} title="Sports Center" subtitle="HBCU scores, standings, and stars" />

      <FilterChips values={sportsTabs as readonly string[]} active={tab} onChange={(v) => setTab(v as typeof tab)} />
      <div className="-mt-1">
        <FilterChips
          values={(["All", ...sportLeagues] as readonly string[])}
          active={league}
          onChange={(v) => setLeague(v as typeof league)}
          small
        />
      </div>

      {tab === "Live" && (
        <ul className="space-y-2">
          {liveScores
            .filter((g) => league === "All" || g.sport === league)
            .map((g) => (
              <li key={g.id} className="p-4 rounded-2xl bg-card border border-border slide-up">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                  <span className="inline-flex items-center gap-1 text-rose-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 plugu-pulse" /> LIVE · {g.sport}
                  </span>
                  <span className="text-muted-foreground">{g.status}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 items-center">
                  <ScoreSide name={g.home} score={g.homeScore} />
                  <div className="text-center text-xs text-muted-foreground">vs</div>
                  <ScoreSide name={g.away} score={g.awayScore} right />
                </div>
              </li>
            ))}
        </ul>
      )}

      {tab === "Upcoming" && (
        <ul className="space-y-2">
          {upcomingGames
            .filter((g) => league === "All" || g.sport === league)
            .map((g) => (
              <li key={g.id} className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-primary">{g.sport} · {g.network}</p>
                  <p className="font-semibold mt-1">{g.away} @ {g.home}</p>
                  <p className="text-xs text-muted-foreground">{g.date}</p>
                </div>
                <button
                  onClick={() => {
                    setNotify((s) => { const n = new Set(s); n.has(g.id) ? n.delete(g.id) : n.add(g.id); return n; });
                    toast.success(notify.has(g.id) ? "Notification off" : `We'll ping you at ${g.date}`);
                  }}
                  className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border tap ${notify.has(g.id) ? "border-emerald-500/40 text-emerald-300" : "border-accent/40 text-accent"}`}
                >
                  {notify.has(g.id) ? "Notifying" : "Notify"}
                </button>
              </li>
            ))}
        </ul>
      )}

      {tab === "Final" && (
        <ul className="space-y-2">
          {completedGames.map((g) => (
            <li key={g.id} className="p-4 rounded-2xl bg-card border border-border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{g.sport} · Final</p>
              <div className="mt-2 flex items-center justify-between text-sm font-semibold">
                <span>{g.home}</span><span>{g.homeScore}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{g.away}</span><span>{g.awayScore}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "Standings" && (
        <div className="space-y-3">
          {conferenceStandings.map((c) => (
            <div key={c.conf} className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="px-4 py-2.5 text-[10px] tracking-widest uppercase text-primary border-b border-border bg-secondary/40">
                {c.conf}
              </div>
              <ul>
                {c.teams.map((t, i) => (
                  <li key={t.name} className="px-4 py-2.5 flex items-center justify-between text-sm border-t border-border first:border-t-0">
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                      {t.name}
                    </span>
                    <span className="text-xs text-accent font-semibold">{t.record}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab === "Top Performers" && (
        <ul className="space-y-2">
          {topPerformers.map((p) => (
            <li key={p.name} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                {p.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.school} · {p.sport}</p>
              </div>
              <span className="text-xs text-accent font-semibold">{p.stat}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ScoreSide({ name, score, right }: { name: string; score: number; right?: boolean }) {
  return (
    <div className={`flex flex-col ${right ? "items-end" : "items-start"}`}>
      <span className="text-xs text-muted-foreground">{name}</span>
      <span className="text-2xl font-black tracking-tight">{score}</span>
    </div>
  );
}

/* ============================================================
   SCHOOLS DIRECTORY
============================================================ */
function SchoolsPanel({ onPick }: { onPick: (name: string) => void }) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<SchoolProfile | null>(null);
  const [stateFilter, setStateFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "Public" | "Private">("All");

  const states = useMemo(
    () => ["All", ...Array.from(new Set(schoolProfiles.map((s) => s.state))).sort()],
    [],
  );

  const filtered = useMemo(
    () => {
      const q = query.trim().toLowerCase();
      return schoolProfiles.filter((s) => {
        if (stateFilter !== "All" && s.state !== stateFilter) return false;
        if (typeFilter !== "All" && s.type !== typeFilter) return false;
        if (!q) return true;
        return (
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.state.toLowerCase().includes(q) ||
          s.mascot.toLowerCase().includes(q) ||
          s.conference.toLowerCase().includes(q) ||
          s.topMajors.some((m) => m.toLowerCase().includes(q))
        );
      });
    },
    [query, stateFilter, typeFilter],
  );

  return (
    <div className="space-y-4">
      <SectionHeader icon={SchoolIcon} title="School Directory" subtitle="Every HBCU, beautifully indexed" />

      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by school, city, mascot, major…"
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-[10px] uppercase tracking-widest text-muted-foreground tap"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full bg-secondary border border-border">
          <MapPin className="h-3 w-3 text-accent" />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-transparent outline-none text-[11px] pr-1"
            aria-label="Filter by state"
          >
            {states.map((st) => (
              <option key={st} value={st}>{st === "All" ? "All States" : st}</option>
            ))}
          </select>
        </label>
        <div className="inline-flex rounded-full bg-secondary border border-border p-0.5">
          {(["All", "Public", "Private"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-[11px] px-2.5 py-1 rounded-full tap ${
                typeFilter === t ? "bg-[image:var(--gradient-bronze)] text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground">
          {filtered.length} school{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {filtered.length === 0 && (
        <EmptyFilters
          title="No schools match those filters"
          hint="Try another state, clear filters, or search a mascot."
          chips={[
            { label: "Clear filters", onClick: () => { setQuery(""); setStateFilter("All"); setTypeFilter("All"); } },
            { label: "Georgia", onClick: () => setStateFilter("GA") },
            { label: "Alabama", onClick: () => setStateFilter("AL") },
            { label: "North Carolina", onClick: () => setStateFilter("NC") },
            { label: "Aggies", onClick: () => setQuery("Aggies") },
            { label: "Bison", onClick: () => setQuery("Bison") },
          ]}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((s) => (
          <div key={s.name} className="relative">
            <Link
              to="/hbcus/school/$slug"
              params={{ slug: schoolSlug(s.name) }}
              className="block relative aspect-[3/4] rounded-2xl overflow-hidden text-left border border-border tap"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color}`} />
              <div className="absolute inset-0 opacity-70">
                <MiniCampusLayout school={s.name} city={s.city} mascot={s.mascot} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/10" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ boxShadow: "inset 0 0 0 1px rgba(201,162,74,0.35)" }}
              />
              <div className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-background/80 backdrop-blur text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 plugu-pulse" />
                Live
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-white font-bold text-sm leading-tight">{s.name}</p>
                <p className="text-white/70 text-[11px] mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {s.city}
                </p>
                <p className="text-white/90 text-[11px] mt-2 flex items-center gap-1">
                  <Users className="h-3 w-3" /> {s.pluguStudents} on PlugU
                </p>
              </div>
            </Link>
            <button
              onClick={() => setPicked(s)}
              className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-background/80 backdrop-blur text-accent tap"
              aria-label="Quick preview"
            >
              Preview
            </button>
          </div>
        ))}
      </div>

      {picked && (
        <SchoolSheet
          school={picked}
          onClose={() => setPicked(null)}
          onPick={() => { onPick(picked.name); setPicked(null); }}
        />
      )}
    </div>
  );
}

function SchoolSheet({
  school, onClose, onPick,
}: { school: SchoolProfile; onClose: () => void; onPick: () => void }) {
  const detail = getSchoolDetail(school.name);
  const [view, setView] = useState<"About" | "Alumni" | "Greek">("About");
  return (
    <BottomSheet onClose={onClose}>
      <div className={`h-32 rounded-2xl bg-gradient-to-br ${school.color} mb-4 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-bold text-lg">{school.name}</p>
          <p className="text-white/80 text-xs">{school.city} · Est. {school.founded}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <Stat label="Enrollment" value={school.enrollment} />
        <Stat label="Acceptance" value={school.acceptance} />
        <Stat label="Tuition" value={school.tuition} />
        <Stat label="Mascot" value={school.mascot} />
        <Stat label="Conference" value={school.conference} />
        <Stat label="On PlugU" value={`${school.pluguStudents}`} />
      </dl>

      {detail && (
        <div className="mt-4">
          <div className="flex gap-1.5 mb-3">
            {(["About", "Alumni", "Greek"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="text-[11px] px-3 py-1.5 rounded-full border tap"
                style={{
                  background: view === v ? "var(--gradient-bronze)" : "transparent",
                  borderColor: view === v ? "transparent" : "var(--border)",
                  color: view === v ? "var(--primary-foreground)" : "var(--foreground)",
                }}
              >
                {v}
              </button>
            ))}
          </div>
          {view === "About" && (
            <div>
              <p className="text-xs leading-relaxed text-muted-foreground">{detail.about}</p>
              <p className="mt-2 text-[11px] italic text-accent">{detail.legacy}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {school.topMajors.map((m) => (
                  <span key={m} className="text-[11px] px-2.5 py-1 rounded-full bg-secondary border border-border">{m}</span>
                ))}
              </div>
            </div>
          )}
          {view === "Alumni" && (
            <ul className="space-y-1.5">
              {detail.alumni.slice(0, 5).map((a) => (
                <li key={a.name} className="p-2.5 rounded-xl bg-secondary border border-border">
                  <p className="text-xs font-semibold">{a.name}{a.era ? <span className="text-accent"> · {a.era}</span> : null}</p>
                  <p className="text-[11px] text-muted-foreground">{a.note}</p>
                </li>
              ))}
            </ul>
          )}
          {view === "Greek" && (
            <div className="space-y-2">
              {detail.greek.fraternities.length > 0 && (
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Fraternities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.greek.fraternities.map((f) => (
                      <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-secondary border border-border">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {detail.greek.sororities.length > 0 && (
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Sororities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.greek.sororities.map((f) => (
                      <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-secondary border border-border">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground pt-1">{detail.greek.tradition}</p>
            </div>
          )}
        </div>
      )}

      <Link
        to="/hbcus/school/$slug"
        params={{ slug: schoolSlug(school.name) }}
        className="mt-4 block w-full text-center py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold tap"
      >
        Open full {school.name} page →
      </Link>
      <button
        onClick={onPick}
        className="mt-2 w-full py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground font-semibold tap"
      >
        Switch to {school.name}
      </button>
    </BottomSheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-xl bg-secondary border border-border">
      <dt className="text-[10px] tracking-widest uppercase text-muted-foreground">{label}</dt>
      <dd className="font-semibold mt-0.5">{value}</dd>
    </div>
  );
}

/* ============================================================
   GREEK LIFE — Divine Nine across every HBCU
============================================================ */
function GreekLifePanel() {
  const [query, setQuery] = useState("");
  const [org, setOrg] = useState<string>("All");

  const allOrgs = useMemo(() => {
    const set = new Set<string>();
    schoolProfiles.forEach((s) => {
      const d = getSchoolDetail(s.name);
      d?.greek.fraternities.forEach((f) => set.add(f));
      d?.greek.sororities.forEach((f) => set.add(f));
    });
    return ["All", ...Array.from(set)];
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return schoolProfiles
      .map((s) => ({ school: s, detail: getSchoolDetail(s.name) }))
      .filter(({ school, detail }) => {
        if (!detail) return false;
        if (org !== "All") {
          const has = detail.greek.fraternities.includes(org) || detail.greek.sororities.includes(org);
          if (!has) return false;
        }
        if (!q) return true;
        return (
          school.name.toLowerCase().includes(q) ||
          school.city.toLowerCase().includes(q) ||
          detail.greek.tradition.toLowerCase().includes(q) ||
          detail.greek.fraternities.some((f) => f.toLowerCase().includes(q)) ||
          detail.greek.sororities.some((f) => f.toLowerCase().includes(q))
        );
      });
  }, [query, org]);

  return (
    <div className="space-y-4">
      <SectionHeader icon={Crown} title="Greek Life" subtitle="The Divine Nine across the Yard" />

      <div className="rounded-3xl border border-border bg-card p-4">
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground">The Divine Nine (NPHC)</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {[
            "Alpha Phi Alpha", "Alpha Kappa Alpha",
            "Kappa Alpha Psi", "Delta Sigma Theta",
            "Omega Psi Phi", "Zeta Phi Beta",
            "Phi Beta Sigma", "Sigma Gamma Rho",
            "Iota Phi Theta",
          ].map((o) => (
            <span key={o} className="text-[11px] px-2.5 py-1 rounded-full bg-secondary border border-border text-center">{o}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Greek life by school or chapter…"
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
        />
      </div>
      <div className="-mx-5 px-5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {allOrgs.map((o) => (
          <button
            key={o}
            onClick={() => setOrg(o)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium tap border ${
              org === o
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-muted-foreground border-border"
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      {rows.length === 0 && (
        <EmptyFilters
          title="No chapters match those filters"
          hint="Try a different org or search a school name."
          chips={[
            { label: "Clear filters", onClick: () => { setQuery(""); setOrg("All"); } },
            { label: "Alpha Phi Alpha", onClick: () => setOrg("Alpha Phi Alpha") },
            { label: "Delta Sigma Theta", onClick: () => setOrg("Delta Sigma Theta") },
            { label: "Alpha Kappa Alpha", onClick: () => setOrg("Alpha Kappa Alpha") },
          ]}
        />
      )}

      <ul className="space-y-3">
        {rows.map(({ school, detail }) => (
          <li key={school.name} className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className={`h-14 bg-gradient-to-br ${school.color} relative`}>
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 px-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-bold leading-tight">{school.name}</p>
                  <p className="text-white/70 text-[10px]">{school.city} · {detail!.colors}</p>
                </div>
                <Link
                  to="/hbcus/school/$slug"
                  params={{ slug: schoolSlug(school.name) }}
                  className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-white tap"
                >
                  Open →
                </Link>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {detail!.greek.fraternities.length > 0 && (
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5">Fraternities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail!.greek.fraternities.map((f) => (
                      <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-secondary border border-border">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {detail!.greek.sororities.length > 0 && (
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5">Sororities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail!.greek.sororities.map((f) => (
                      <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-secondary border border-border">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground italic">{detail!.greek.tradition}</p>
              <p className="text-[10px] text-accent">{detail!.greek.houses}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   INTERNSHIPS
============================================================ */
function InternshipsPanel() {
  const [filter, setFilter] = useState<string>("All");
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const items = useMemo(() => {
    if (filter === "All") return internships;
    if (filter === "Remote") return internships.filter((i) => i.type === "Remote");
    return internships.filter((i) => i.tag === filter);
  }, [filter]);

  return (
    <div className="space-y-4">
      <SectionHeader icon={Briefcase} title="Internship Hub" subtitle="Opportunities tailored to HBCU students" />
      <FilterChips values={internshipFilters as readonly string[]} active={filter} onChange={setFilter} />
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] tracking-widest uppercase text-primary">{it.tag} · {it.type}</p>
                <p className="font-semibold mt-1">{it.role}</p>
                <p className="text-xs text-muted-foreground">{it.company} · {it.location}</p>
              </div>
              <span className="text-xs font-bold text-accent shrink-0">{it.pay}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Deadline: {it.deadline}</span>
              <button
                onClick={() => {
                  setApplied((s) => new Set(s).add(it.id));
                  toast.success(`Application started · ${it.company}`, { description: "We'll save your progress." });
                }}
                className={`text-[11px] px-3 py-1.5 rounded-full font-semibold tap ${applied.has(it.id) ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-[image:var(--gradient-bronze)] text-primary-foreground"}`}
              >
                {applied.has(it.id) ? "Applied" : "Apply"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   SCHOLARSHIPS
============================================================ */
function ScholarshipsPanel() {
  const [cat, setCat] = useState<string>("All");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const items = useMemo(
    () => (cat === "All" ? scholarshipsList : scholarshipsList.filter((s) => s.category === cat)),
    [cat],
  );
  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <SectionHeader icon={GraduationCap} title="Scholarship Center" subtitle="Track deadlines. Save apps. Win money." />
      <FilterChips values={scholarshipCategories as readonly string[]} active={cat} onChange={setCat} />
      <ul className="space-y-2">
        {items.map((s) => (
          <li key={s.id} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{s.name}</p>
              <p className="text-xs text-muted-foreground truncate">{s.org} · {s.category}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Deadline: {s.deadline}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-sm font-bold text-accent">{s.amount}</span>
              <button onClick={() => toggleSave(s.id)} className="tap">
                <Bookmark className={`h-4 w-4 ${saved.has(s.id) ? "fill-current text-accent" : "text-muted-foreground"}`} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   BLACK BUSINESS HUB / MARKETPLACE
============================================================ */
function MarketplacePanel() {
  return (
    <div className="space-y-4">
      <SectionHeader icon={Store} title="Black Business Hub" subtitle="Spotlighting student entrepreneurs" />
      <div className="grid grid-cols-2 gap-3">
        {blackBusinesses.map((b) => (
          <div key={b.id} className="rounded-2xl bg-card border border-border p-3 tap">
            <div className="h-20 rounded-xl bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-black text-2xl">
              {b.name[0]}
            </div>
            <p className="mt-2 font-semibold text-sm flex items-center gap-1">
              {b.name}
              {b.verified && <BadgeCheck className="h-3.5 w-3.5 text-accent" />}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">{b.owner} · {b.school}</p>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{b.category}</span>
              <span className="text-accent">{b.followers}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   NETWORKING
============================================================ */
function NetworkingPanel() {
  const [filter, setFilter] = useState<string>("All");
  const items = useMemo(
    () => (filter === "All" ? networkingProfiles : networkingProfiles.filter((p) => p.tag === filter)),
    [filter],
  );
  return (
    <div className="space-y-4">
      <SectionHeader icon={Users} title="Networking" subtitle="Mentors, founders, athletes, investors" />
      <FilterChips values={networkingFilters as readonly string[]} active={filter} onChange={setFilter} />
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id} className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                {p.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold flex items-center gap-1.5">
                  {p.name}
                  <span className="text-[10px] tracking-widest uppercase text-accent">· {p.tag}</span>
                </p>
                <p className="text-xs text-muted-foreground truncate">{p.role} @ {p.company}</p>
                <p className="text-[11px] text-muted-foreground">{p.school}</p>
              </div>
              <button className="text-[11px] px-3 py-1.5 rounded-full bg-secondary border border-border tap">
                Connect
              </button>
            </div>
            <p className="mt-2.5 text-sm text-muted-foreground italic">"{p.bio}"</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   EVENTS
============================================================ */
function EventsPanel() {
  const [rsvped, setRsvped] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    setRsvped((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  return (
    <div className="space-y-4">
      <SectionHeader icon={Calendar} title="Live Events" subtitle="Homecoming, step shows, mixers, more" />
      <ul className="space-y-2">
        {liveEvents.map((e) => {
          const yes = rsvped.has(e.id);
          return (
            <li key={e.id} className="p-4 rounded-2xl bg-card border border-border">
              <p className="text-[10px] tracking-widest uppercase text-primary">{e.type} · {e.school}</p>
              <p className="font-semibold mt-1">{e.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {e.when} · {e.where}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                  <Users className="h-3 w-3" /> {e.rsvp.toLocaleString()} going
                </span>
                <button
                  onClick={() => toggle(e.id)}
                  className={`text-[11px] px-3 py-1.5 rounded-full tap font-semibold ${
                    yes
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-[image:var(--gradient-bronze)] text-primary-foreground"
                  }`}
                >
                  {yes ? "RSVP'd" : "RSVP"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================================================
   PLUGU DAILY
============================================================ */
function DailyPanel() {
  return (
    <div className="space-y-4">
      <SectionHeader icon={Sparkles} title="PlugU Daily" subtitle="Curated for college minds, 18–24" />
      <AiNewsFeed
        category="PlugU Daily — top stories Black college students should know today"
        count={10}
        fallback={pluguDailyTopics.map((t, i) => ({
          id: `pd${i}`, headline: t.title, summary: "",
          source: "PlugU", time: t.time, tag: t.tag, emoji: "🔌",
        }))}
      />
    </div>
  );
}

/* ============================================================
   SHARED
============================================================ */
function SectionHeader({
  icon: Icon, title, subtitle, live,
}: { icon: typeof Newspaper; title: string; subtitle: string; live?: boolean }) {
  return (
    <header className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {live && (
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 plugu-pulse" /> Live
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </header>
  );
}

function FilterChips({
  values, active, onChange, small,
}: { values: readonly string[]; active: string; onChange: (v: string) => void; small?: boolean }) {
  return (
    <div className="-mx-5 px-5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {values.map((v) => {
        const a = v === active;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`shrink-0 rounded-full ${small ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]"} font-medium tap border ${
              a
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-muted-foreground border-border"
            }`}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

function EmptyFilters({
  title,
  hint,
  chips,
}: {
  title: string;
  hint: string;
  chips: { label: string; onClick: () => void }[];
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 px-5 py-8 text-center">
      <div className="mx-auto h-11 w-11 rounded-2xl grid place-items-center bg-[image:var(--gradient-bronze)] text-primary-foreground">
        <Search className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {chips.map((c) => (
          <button
            key={c.label}
            onClick={c.onClick}
            className="text-[11px] px-3 py-1.5 rounded-full border border-accent/40 text-accent bg-secondary tap"
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BottomSheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-md bg-card border-t border-border rounded-t-3xl p-5 pb-8 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        {children}
      </div>
    </div>
  );
}

function SwitchSheet({
  home, active, setActive, setHome, onClose,
}: { home: string; active: string; setActive: (n: string) => void; setHome: (n: string) => void; onClose: () => void }) {
  return (
    <BottomSheet onClose={onClose}>
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
                <button onClick={() => setActive(h.name)} className="flex-1 flex items-center gap-3 text-left min-w-0">
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
                  <button onClick={() => setHome(h.name)} className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full border border-accent/40 text-accent">
                    Set home
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}

function AISheet({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  return (
    <BottomSheet onClose={onClose}>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl grid place-items-center bg-[image:var(--gradient-bronze)] text-primary-foreground">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">HBC"US" AI</h3>
          <p className="text-[11px] text-muted-foreground">Ask anything about HBCU life.</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary border border-border">
        <Sparkles className="h-4 w-4 text-accent" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask: 'Find internships near me…'"
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
        />
        <button className="text-[11px] px-3 py-1.5 rounded-full bg-[image:var(--gradient-bronze)] text-primary-foreground font-semibold tap">
          Ask
        </button>
      </div>
      <p className="mt-4 text-[10px] tracking-widest uppercase text-muted-foreground">Try one of these</p>
      <ul className="mt-2 space-y-1.5">
        {aiSuggestedPrompts.map((p) => (
          <li key={p}>
            <button onClick={() => setQ(p)} className="w-full text-left text-sm p-3 rounded-xl bg-secondary border border-border tap">
              {p}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[10px] text-muted-foreground text-center">
        Powered by PlugU. AI answers coming online soon.
      </p>
    </BottomSheet>
  );
}


