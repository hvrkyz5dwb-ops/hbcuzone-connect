import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { hbcus } from "@/lib/mock-data";
import { useHomeCampus } from "@/hooks/use-home-campus";
import {
  hbcusSections,
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
  type HbcusSection,
  type SchoolProfile,
} from "@/lib/hbcus-data";
import statueImg from "@/assets/plugu-statue.jpg";

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
  const { home, active, setActive, setHomeCampus } = useHomeCampus();
  const [showSwitch, setShowSwitch] = useState(false);
  const [section, setSection] = useState<HbcusSection>("News");
  const [showAI, setShowAI] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Scroll horizontally to active section pill
  useEffect(() => {
    const el = sectionRefs.current[section];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [section]);

  return (
    <AppShell title='HBC"US"'>
      {/* Hero */}
      <section className="px-5 pt-5">
        <div className="relative overflow-hidden rounded-3xl border border-border">
          <img src={statueImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          <div className="relative p-5">
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary">The HBCU Experience</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">
              HBC<span style={{ color: "var(--plugu-gold)" }}>"US"</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
              News, sports, scholarships, internships, events — everything for HBCU students, in one place.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setShowSwitch(true)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs bg-[image:var(--gradient-bronze)] text-primary-foreground font-medium tap"
              >
                <SchoolIcon className="h-3.5 w-3.5" />
                {active}
              </button>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <HomeIcon className="h-3 w-3" /> Home: {home}
              </span>
              <button
                onClick={() => setShowAI(true)}
                className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs border border-accent/40 text-accent bg-card/60 backdrop-blur tap"
              >
                <Bot className="h-3.5 w-3.5" /> Ask AI
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky section nav */}
      <nav className="sticky top-0 z-30 mt-4 bg-background/80 backdrop-blur-xl border-y border-border">
        <div className="px-5 flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {hbcusSections.map(({ key, icon: Icon }) => {
            const isActive = section === key;
            return (
              <button
                key={key}
                ref={(el) => { sectionRefs.current[key] = el; }}
                onClick={() => setSection(key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium tap transition-all border ${
                  isActive
                    ? "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary shadow-[0_0_20px_-4px_var(--plugu-gold)]"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {key}
              </button>
            );
          })}
        </div>
      </nav>

      <section className="px-5 pt-4 pb-6 view-enter" key={section}>
        {section === "News" && <NewsPanel activeSchool={active} />}
        {section === "Sports" && <SportsPanel />}
        {section === "Schools" && <SchoolsPanel onPick={setActive} />}
        {section === "Internships" && <InternshipsPanel />}
        {section === "Scholarships" && <ScholarshipsPanel />}
        {section === "Marketplace" && <MarketplacePanel />}
        {section === "Networking" && <NetworkingPanel />}
        {section === "Events" && <EventsPanel />}
        {section === "PlugU Daily" && <DailyPanel />}
      </section>

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
   NEWS
============================================================ */
function NewsPanel({ activeSchool }: { activeSchool: string }) {
  const [filter, setFilter] = useState<(typeof hbcuNewsFilters)[number]>("All HBCUs");

  const items = useMemo(() => {
    if (filter === "My School") return hbcuLiveNews.filter((n) => n.school === activeSchool);
    if (filter === "Nearby") return hbcuLiveNews.slice(0, 6);
    if (filter === "All HBCUs") return hbcuLiveNews;
    return hbcuLiveNews.filter((n) => n.category === filter);
  }, [filter, activeSchool]);

  return (
    <div className="space-y-4">
      <SectionHeader icon={Radio} title="Live HBCU News" subtitle="Real-time across the Yard" live />
      <FilterChips
        values={hbcuNewsFilters as readonly string[]}
        active={filter}
        onChange={(v) => setFilter(v as typeof filter)}
      />

      {/* Featured */}
      {items[0] && (
        <article className="relative overflow-hidden rounded-3xl border border-border bg-card slide-up">
          <div className="h-40 bg-[image:var(--gradient-bronze)] relative">
            <div className="absolute inset-0 bg-black/30" />
            <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase bg-background/80 backdrop-blur px-2 py-1 rounded-full text-accent">
              {items[0].tag}
            </span>
          </div>
          <div className="p-4">
            <p className="text-[10px] tracking-widest uppercase text-primary">{items[0].school} · {items[0].time}</p>
            <h3 className="mt-1 text-lg font-bold leading-tight">{items[0].title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{items[0].summary}</p>
            <ArticleActions />
          </div>
        </article>
      )}

      <ul className="space-y-2">
        {items.slice(1).map((n, i) => (
          <li
            key={n.id}
            className="p-3.5 rounded-2xl bg-card border border-border tap slide-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase" style={{ color: n.accent === "purple" ? "var(--plugu-purple)" : "var(--plugu-gold)" }}>
                {n.tag}
              </span>
              <span className="text-[10px] text-muted-foreground">· {n.school} · {n.time}</span>
            </div>
            <p className="font-semibold mt-1 leading-snug">{n.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.summary}</p>
          </li>
        ))}
        {items.length === 0 && (
          <li className="p-6 rounded-2xl bg-card border border-border text-center text-sm text-muted-foreground">
            No stories for this filter yet.
          </li>
        )}
      </ul>
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
      <button className="inline-flex items-center gap-1 tap ml-auto">
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
                <button className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-accent/40 text-accent">
                  Notify
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

  const filtered = useMemo(
    () => schoolProfiles.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="space-y-4">
      <SectionHeader icon={SchoolIcon} title="School Directory" subtitle="Every HBCU, beautifully indexed" />

      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search HBCUs"
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((s) => (
          <button
            key={s.name}
            onClick={() => setPicked(s)}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden text-left border border-border tap"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.color}`} />
            <div className="absolute inset-0 bg-black/40" />
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
          </button>
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
      <div className="mt-4">
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5">Top majors</p>
        <div className="flex flex-wrap gap-1.5">
          {school.topMajors.map((m) => (
            <span key={m} className="text-[11px] px-2.5 py-1 rounded-full bg-secondary border border-border">{m}</span>
          ))}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
        {["Live Feed", "Marketplace", "Students", "Sports", "Events", "Admissions"].map((q) => (
          <button key={q} className="px-3 py-2.5 rounded-xl bg-secondary border border-border tap text-left">
            {q}
          </button>
        ))}
      </div>
      <button
        onClick={onPick}
        className="mt-4 w-full py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground font-semibold tap"
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
   INTERNSHIPS
============================================================ */
function InternshipsPanel() {
  const [filter, setFilter] = useState<string>("All");
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
              <button className="text-[11px] px-3 py-1.5 rounded-full bg-[image:var(--gradient-bronze)] text-primary-foreground font-semibold tap">
                Apply
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
      <ul className="space-y-2">
        {pluguDailyTopics.map((t, i) => (
          <li key={t.title} className="p-4 rounded-2xl bg-card border border-border flex items-start gap-3 slide-up" style={{ animationDelay: `${i * 30}ms` }}>
            <div className="h-10 w-10 rounded-xl grid place-items-center border border-border" style={{ background: "color-mix(in oklab, var(--plugu-purple) 14%, transparent)" }}>
              <TrendingUp className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--plugu-gold)" }}>
                {t.tag} · {t.time}
              </p>
              <p className="font-semibold leading-snug mt-0.5">{t.title}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground self-center shrink-0" />
          </li>
        ))}
      </ul>
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


