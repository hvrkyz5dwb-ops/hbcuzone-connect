import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, MapPin, Users, Calendar, Briefcase, Home as HomeIcon,
  Utensils, ShieldAlert, BookOpen, Search as SearchIcon, Trophy,
  Store, Megaphone, Phone, Map as MapIcon, Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AiNewsFeed } from "@/components/AiNewsFeed";
import { CampusLayoutAI } from "@/components/CampusLayoutAI";
import { CampusWayfinder } from "@/components/CampusWayfinder";
import {
  findSchoolBySlug, schoolSlug, schoolProfiles,
  blackBusinesses, liveEvents, liveScores, upcomingGames,
  conferenceStandings, topPerformers, internships,
} from "@/lib/hbcus-data";

export const Route = createFileRoute("/hbcus/school/$slug")({
  head: ({ params }) => {
    const s = findSchoolBySlug(params.slug);
    const title = s ? `${s.name} — PlugU Community` : "School — PlugU";
    return {
      meta: [
        { title },
        { name: "description", content: s ? `${s.name}'s mini-community on PlugU: feed, businesses, events, sports, dining, housing, jobs, lost & found and emergency contacts.` : "HBCU community on PlugU." },
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell title="School">
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-muted-foreground">School not found.</p>
        <Link to="/hbcus" className="text-accent text-sm mt-2 inline-block">← Back to HBCUS</Link>
      </div>
    </AppShell>
  ),
  loader: ({ params }) => {
    const school = findSchoolBySlug(params.slug);
    if (!school) throw notFound();
    return { school };
  },
  component: SchoolCommunity,
});

type TabKey =
  | "Feed" | "Businesses" | "Events" | "Organizations" | "Sports"
  | "Maps" | "Dining" | "Housing" | "Jobs" | "Lost & Found"
  | "Emergency" | "Resources";

const TABS: TabKey[] = [
  "Feed", "Businesses", "Events", "Organizations", "Sports",
  "Maps", "Dining", "Housing", "Jobs", "Lost & Found",
  "Emergency", "Resources",
];

function SchoolCommunity() {
  const { school } = Route.useLoaderData();
  const [tab, setTab] = useState<TabKey>("Feed");

  return (
    <AppShell title={school.name}>
      <div className="hbcus-theme relative min-h-[calc(100dvh-9rem)]">
        <div className="hbcus-theme-bg" aria-hidden="true" />
        {/* Header */}
        <section className="px-5 pt-5 hbcus-rise">
        <Link to="/hbcus" className="inline-flex items-center gap-1 text-[11px] tap" style={{ color: "color-mix(in oklab, var(--hbcu-cream) 65%, transparent)" }}>
          <ArrowLeft className="h-3.5 w-3.5" /> HBCUS Directory
        </Link>
        <div className={`mt-3 relative overflow-hidden hbcus-card h-40 bg-gradient-to-br ${school.color}`}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--hbcu-night) 25%, transparent) 0%, color-mix(in oklab, var(--hbcu-night) 85%, transparent) 100%)" }} />
          <div className="absolute top-3 right-3 hbcus-chip">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 plugu-pulse" /> Live
          </div>
          <div className="absolute bottom-3 left-4 right-4">
            <p className="hbcus-wordmark text-2xl leading-tight">{school.name}</p>
            <div className="hbcus-rule my-2 max-w-[8rem]" />
            <p className="text-xs inline-flex items-center gap-1" style={{ color: "color-mix(in oklab, var(--hbcu-cream) 80%, transparent)" }}>
              <MapPin className="h-3 w-3" /> {school.city} · Est. {school.founded}
            </p>
            <p className="text-[11px] mt-1 inline-flex items-center gap-1" style={{ color: "color-mix(in oklab, var(--hbcu-cream) 85%, transparent)" }}>
              <Users className="h-3 w-3" /> {school.pluguStudents.toLocaleString()} on PlugU · {school.liveActivity}
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-4 px-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            data-active={t === tab}
            className="hbcus-tab shrink-0 tap"
          >
            {t}
          </button>
        ))}
      </div>

      <section className="mt-4 px-5 pb-6 hbcus-rise" key={tab}>
        {tab === "Feed" && <FeedTab school={school.name} />}
        {tab === "Businesses" && <BusinessesTab school={school.name} />}
        {tab === "Events" && <EventsTab school={school.name} />}
        {tab === "Organizations" && <OrganizationsTab school={school.name} />}
        {tab === "Sports" && <SportsTab school={school.name} />}
        {tab === "Maps" && <MapsTab school={school} />}
        {tab === "Dining" && <DiningTab school={school.name} />}
        {tab === "Housing" && <HousingTab school={school.name} />}
        {tab === "Jobs" && <JobsTab school={school.name} />}
        {tab === "Lost & Found" && <LostFoundTab school={school.name} />}
        {tab === "Emergency" && <EmergencyTab school={school} />}
        {tab === "Resources" && <ResourcesTab school={school.name} />}
      </section>

      {/* Cross-links to other HBCUs */}
      <section className="px-5 pb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: "color-mix(in oklab, var(--hbcu-gold) 70%, transparent)" }}>Jump to another HBCU</p>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {schoolProfiles.filter((s) => s.name !== school.name).map((s) => (
            <Link
              key={s.name}
              to="/hbcus/school/$slug"
              params={{ slug: schoolSlug(s.name) }}
              className="shrink-0 hbcus-tab tap"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </section>
      </div>
    </AppShell>
  );
}

/* ----------------- Helpers ----------------- */
function SectionTitle({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-2 mb-3">
      <Icon className="h-4 w-4 mt-0.5" style={{ color: "var(--plugu-gold)" }} />
      <div>
        <p className="text-sm font-bold leading-tight">{title}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <li className="hbcus-card p-3.5">{children}</li>;
}

/* ----------------- Tabs ----------------- */
function FeedTab({ school }: { school: string }) {
  return (
    <div className="space-y-3">
      <SectionTitle icon={Sparkles} title={`${school} live feed`} subtitle="Real-time campus stories from PlugU NewsAI" />
      <AiNewsFeed category={`Campus news, events and student stories at ${school}`} school={school} count={10} />
    </div>
  );
}

function BusinessesTab({ school }: { school: string }) {
  const local = blackBusinesses.filter((b) => b.school === school);
  const list = local.length ? local : blackBusinesses.slice(0, 5);
  return (
    <div>
      <SectionTitle icon={Store} title="Student-owned businesses" subtitle={`${list.length} active on ${school}`} />
      <ul className="space-y-2 hbcus-stagger">
        {list.map((b) => (
          <Card key={b.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{b.name}</p>
                <p className="text-[11px] text-muted-foreground">{b.category} · {b.owner}</p>
              </div>
              <span className="text-[10px] text-accent">{b.followers} followers{b.verified ? " · Verified" : ""}</span>
            </div>
          </Card>
        ))}
      </ul>
      <Link to="/market" className="mt-3 block text-center text-xs text-accent">Open campus marketplace →</Link>
    </div>
  );
}

function EventsTab({ school }: { school: string }) {
  const items = liveEvents.length ? liveEvents : [];
  return (
    <div>
      <SectionTitle icon={Calendar} title={`What's happening at ${school}`} />
      <ul className="space-y-2 hbcus-stagger">
        {items.slice(0, 8).map((e: any) => (
          <Card key={e.id ?? e.title}>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--plugu-gold)" }}>
              {e.tag ?? "Event"} · {e.time ?? e.date ?? "TBA"}
            </p>
            <p className="font-semibold text-sm mt-0.5">{e.title ?? e.name}</p>
            {e.location && <p className="text-[11px] text-muted-foreground">{e.location}</p>}
          </Card>
        ))}
      </ul>
      <Link to="/events" className="mt-3 block text-center text-xs text-accent">Full event calendar →</Link>
    </div>
  );
}

function OrganizationsTab({ school }: { school: string }) {
  const orgs = [
    { name: "Student Government Association", type: "Governance", members: 38 },
    { name: "NAACP Campus Chapter", type: "Advocacy", members: 124 },
    { name: "NSBE — Black Engineers", type: "Pre-Professional", members: 86 },
    { name: "NABJ — Journalists", type: "Pre-Professional", members: 41 },
    { name: "Pre-Med Society", type: "Academic", members: 92 },
    { name: "Royal Court", type: "Tradition", members: 14 },
    { name: "Greek Life Council", type: "Greek", members: 210 },
    { name: "Gospel Choir", type: "Arts", members: 64 },
    { name: "Marching Band", type: "Arts", members: 180 },
  ];
  return (
    <div>
      <SectionTitle icon={Megaphone} title={`${school} student organizations`} />
      <ul className="space-y-2 hbcus-stagger">
        {orgs.map((o) => (
          <Card key={o.name}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{o.name}</p>
                <p className="text-[11px] text-muted-foreground">{o.type}</p>
              </div>
              <span className="text-[11px] text-accent">{o.members} members</span>
            </div>
          </Card>
        ))}
      </ul>
    </div>
  );
}

function SportsTab({ school }: { school: string }) {
  const live = (liveScores as any[]).filter((g) => g.home === school || g.away === school);
  const upc = (upcomingGames as any[]).filter((g) => g.home === school || g.away === school);
  const inConf = conferenceStandings.find((c: any) => c.team?.includes(school) || c.name?.includes(school));
  return (
    <div className="space-y-4">
      <SectionTitle icon={Trophy} title={`${school} athletics`} />
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Live & upcoming</p>
        <ul className="space-y-2 hbcus-stagger">
          {[...live, ...upc].slice(0, 4).map((g: any, i) => (
            <Card key={i}>
              <p className="text-sm font-semibold">{g.home} vs {g.away}</p>
              <p className="text-[11px] text-muted-foreground">{g.sport ?? "Football"} · {g.status ?? g.date ?? "TBA"}</p>
            </Card>
          ))}
          {live.length + upc.length === 0 && (
            <p className="text-[11px] text-muted-foreground">No games scheduled this week.</p>
          )}
        </ul>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Top performers</p>
        <ul className="space-y-2 hbcus-stagger">
          {topPerformers.filter((p) => p.school === school || p.school === school.split(" ")[0]).slice(0, 4).map((p, i) => (
            <Card key={i}>
              <p className="font-semibold text-sm">{p.name} · {p.sport}</p>
              <p className="text-[11px] text-muted-foreground">{p.stat}</p>
            </Card>
          ))}
        </ul>
      </div>
      {inConf && (
        <p className="text-[11px] text-muted-foreground">Conference: <span className="text-foreground font-semibold">{school.split(" ")[0]}</span></p>
      )}
    </div>
  );
}

function MapsTab({ school }: { school: any }) {
  return (
    <div>
      <SectionTitle icon={MapIcon} title={`${school.name} campus map`} subtitle="Pins, dorms, dining, safety & events" />
      <CampusWayfinder school={school.name} city={school.city} mascot={school.mascot} />
      <div className="mt-3">
        <Link to="/map" className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border border-border bg-card tap">
          <MapIcon className="h-3.5 w-3.5 text-accent" /> Open live campus map
        </Link>
      </div>
    </div>
  );
}

function DiningTab({ school }: { school: string }) {
  const places = [
    { name: "Main Dining Hall", hours: "7a – 9p", meal: "All-you-can-eat" },
    { name: "Student Union Food Court", hours: "10a – 11p", meal: "Quick service" },
    { name: "Late Night Grill", hours: "9p – 2a", meal: "Burgers & wings" },
    { name: "Coffee Bar", hours: "6a – 8p", meal: "Drinks & pastries" },
    { name: "Halal Cart (Yard side)", hours: "11a – 4p", meal: "Halal plates" },
    { name: "Soul Food Friday", hours: "Fri 12p – 3p", meal: "Catered" },
  ];
  return (
    <div>
      <SectionTitle icon={Utensils} title={`Dining at ${school}`} subtitle="Halls, food courts and student plugs" />
      <ul className="space-y-2 hbcus-stagger">
        {places.map((p) => (
          <Card key={p.name}>
            <p className="font-semibold text-sm">{p.name}</p>
            <p className="text-[11px] text-muted-foreground">{p.meal} · {p.hours}</p>
          </Card>
        ))}
      </ul>
    </div>
  );
}

function HousingTab({ school }: { school: string }) {
  const dorms = [
    { name: "Freshman Quad", type: "On-campus", price: "Included" },
    { name: "Tubman Hall", type: "On-campus · Women", price: "$3,800/sem" },
    { name: "Douglass Hall", type: "On-campus · Men", price: "$3,800/sem" },
    { name: "The Yard Apartments", type: "On-campus apt", price: "$5,200/sem" },
    { name: "Off-campus listings", type: "Sublease board", price: "Varies" },
  ];
  return (
    <div>
      <SectionTitle icon={HomeIcon} title={`${school} housing`} subtitle="Dorms, apartments & student sublets" />
      <ul className="space-y-2 hbcus-stagger">
        {dorms.map((d) => (
          <Card key={d.name}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{d.name}</p>
                <p className="text-[11px] text-muted-foreground">{d.type}</p>
              </div>
              <span className="text-[11px] text-accent">{d.price}</span>
            </div>
          </Card>
        ))}
      </ul>
      <Link to="/safety" className="mt-3 block text-center text-xs text-accent">Roommate & housing board →</Link>
    </div>
  );
}

function JobsTab({ school }: { school: string }) {
  const list = internships.slice(0, 6);
  return (
    <div>
      <SectionTitle icon={Briefcase} title={`Jobs & internships for ${school}`} subtitle="On-campus, work-study and partner roles" />
      <ul className="space-y-2 hbcus-stagger">
        {list.map((j) => (
          <Card key={j.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--plugu-gold)" }}>{j.tag} · {j.type}</p>
                <p className="font-semibold text-sm mt-0.5">{j.role}</p>
                <p className="text-[11px] text-muted-foreground">{j.company} · {j.location}</p>
              </div>
              <span className="text-xs font-bold text-accent shrink-0">{j.pay}</span>
            </div>
          </Card>
        ))}
      </ul>
      <Link to="/hub" className="mt-3 block text-center text-xs text-accent">Career & Money Hub →</Link>
    </div>
  );
}

function LostFoundTab({ school }: { school: string }) {
  const [q, setQ] = useState("");
  const items = [
    { id: "lf1", item: "Black AirPods Pro", status: "Lost", where: "Library 2nd floor", when: "2h ago" },
    { id: "lf2", item: "Student ID — A. Johnson", status: "Found", where: "Student Union", when: "5h ago" },
    { id: "lf3", item: "Silver MacBook charger", status: "Found", where: "Coffee Bar", when: "1d ago" },
    { id: "lf4", item: "Blue Hydro Flask", status: "Lost", where: "Gym", when: "1d ago" },
    { id: "lf5", item: "Car keys (Honda)", status: "Found", where: "Parking Lot C", when: "2d ago" },
  ].filter((i) => i.item.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <SectionTitle icon={SearchIcon} title={`${school} Lost & Found`} />
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary border border-border mb-3">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search lost & found"
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
        />
      </div>
      <ul className="space-y-2 hbcus-stagger">
        {items.map((i) => (
          <Card key={i.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{i.item}</p>
                <p className="text-[11px] text-muted-foreground">{i.where} · {i.when}</p>
              </div>
              <span
                className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border"
                style={{
                  borderColor: i.status === "Found" ? "color-mix(in oklab, var(--plugu-gold) 50%, transparent)" : "var(--border)",
                  color: i.status === "Found" ? "var(--plugu-gold)" : "var(--muted-foreground)",
                }}
              >
                {i.status}
              </span>
            </div>
          </Card>
        ))}
      </ul>
      <button className="mt-3 w-full py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold tap">
        Report a lost or found item
      </button>
    </div>
  );
}

function EmergencyTab({ school }: { school: any }) {
  const contacts = [
    { label: "Campus Police", number: "911" },
    { label: `${school.name} Public Safety`, number: "(555) 010-1212" },
    { label: "Counseling & Wellness", number: "(555) 010-1818" },
    { label: "Title IX Office", number: "(555) 010-1919" },
    { label: "Health Center", number: "(555) 010-1234" },
    { label: "RA / Residence Life", number: "(555) 010-2000" },
    { label: "Rideshare Safe Ride", number: "(555) 010-7878" },
  ];
  return (
    <div>
      <SectionTitle icon={ShieldAlert} title={`${school.name} emergency contacts`} subtitle="Tap to call — works on mobile" />
      <ul className="space-y-2 hbcus-stagger">
        {contacts.map((c) => (
          <Card key={c.label}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">{c.label}</p>
                <p className="text-[11px] text-muted-foreground">24/7</p>
              </div>
              <a
                href={`tel:${c.number.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-[image:var(--gradient-bronze)] text-primary-foreground tap"
              >
                <Phone className="h-3.5 w-3.5" /> {c.number}
              </a>
            </div>
          </Card>
        ))}
      </ul>
      <Link to="/safety" className="mt-3 block text-center text-xs text-accent">Open Safety Center →</Link>
    </div>
  );
}

function ResourcesTab({ school }: { school: string }) {
  const links = [
    { label: "Financial Aid Office", to: "/hub" as const, desc: "FAFSA, grants, work-study" },
    { label: "Academic Advising", to: "/hub" as const, desc: "Plan your semester" },
    { label: "Career Services", to: "/hub" as const, desc: "Resume, interviews, fairs" },
    { label: "Library Resources", to: "/news" as const, desc: "Databases & study guides" },
    { label: "Mental Health & Wellness", to: "/safety" as const, desc: "Confidential support" },
    { label: "Tutoring & Writing Center", to: "/safety" as const, desc: "Free peer tutoring" },
    { label: "International Student Office", to: "/hbcus" as const, desc: "Visas & study abroad" },
    { label: "Disability Services", to: "/safety" as const, desc: "Accommodations" },
  ];
  return (
    <div>
      <SectionTitle icon={BookOpen} title={`${school} campus resources`} />
      <ul className="space-y-2 hbcus-stagger">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="block rounded-2xl bg-card border border-border p-3.5 tap">
              <p className="font-semibold text-sm">{l.label}</p>
              <p className="text-[11px] text-muted-foreground">{l.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}