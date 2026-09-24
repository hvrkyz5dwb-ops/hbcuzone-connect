import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Flag, Trash2, ExternalLink, ShieldCheck, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ReportDialog } from "@/components/ReportDialog";
import { requestAuthentication } from "@/components/RequireAuthPrompt";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { fetchBlockedUserIds } from "@/lib/moderation";
import {
  CIRCLE_RULES, circleBySlug, createCirclePost, deleteCirclePost, fetchCircleMembers, fetchCirclePosts,
  fetchMyCircles, fetchPeople, personName, setCircleMembership, type CirclePost,
} from "@/lib/network-db";
import { CollabBoard, CollabForm, EventsList, PersonCard, VerifiedTag, useConnectionMap } from "@/components/hbcus/NetworkPanels";

export const Route = createFileRoute("/hbcus_/circle/$slug")({
  loader: ({ params }) => {
    const c = circleBySlug(params.slug);
    if (!c) throw notFound();
    return { circle: c };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.circle.name ?? "Circle";
    const d = loaderData?.circle.blurb ?? "A cross-campus HBCUS Circle on PlugU.";
    return {
      meta: [
        { title: `${name} Circle — HBCUS on PlugU` },
        { name: "description", content: d },
        { property: "og:title", content: `${name} Circle — HBCUS` },
        { property: "og:description", content: d },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell title="Circle"><p className="p-6 text-sm">That Circle doesn't exist. <Link to="/hbcus" className="text-primary">Back to HBCUS</Link></p></AppShell>
  ),
  component: CirclePage,
});

const TABS = ["Posts", "Collabs", "Events", "Members", "Learn", "Rules"] as const;
const btn = "tap inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold";
const input = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60";

function CirclePage() {
  const { circle } = Route.useLoaderData();
  const { session } = useSession();
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Posts");
  const [collabOpen, setCollabOpen] = useState(false);
  const mine = useQuery({ queryKey: ["my-circles"], queryFn: fetchMyCircles, enabled: !!session });
  const joined = (mine.data ?? []).includes(circle.slug);
  const join = useMutation({
    mutationFn: () => setCircleMembership(circle.slug, !joined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-circles"] }); qc.invalidateQueries({ queryKey: ["circle-members", circle.slug] }); toast.success(joined ? "Left Circle" : "Joined Circle"); },
    onError: (e: any) => toast.error("Couldn't update", { description: e?.message }),
  });
  const tabs = TABS.filter((t) => t !== "Learn" || circle.slug === "money-markets" || circle.slug === "politics");

  return (
    <AppShell title={circle.name}>
      <section className="px-4 pt-4 sm:px-5">
        <Link to="/hbcus" className="tap inline-flex min-h-[44px] items-center gap-1 text-xs text-muted-foreground"><ArrowLeft className="h-3.5 w-3.5" /> HBCUS</Link>
        <div className="rounded-xl border border-primary/30 bg-card/80 p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Circle</p>
          <h1 className="font-editorial mt-1 text-3xl leading-tight">{circle.name}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{circle.blurb}</p>
          <button onClick={() => session ? join.mutate() : requestAuthentication()} disabled={join.isPending}
            className={`${btn} mt-3 ${joined ? "border border-border bg-secondary" : "bg-primary text-primary-foreground"}`}>
            {joined ? "Joined · Leave" : "Join Circle"}
          </button>
        </div>
      </section>
      <nav className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:px-5 [scrollbar-width:none]">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}
            className={`tap min-h-[44px] shrink-0 rounded-lg border px-4 text-xs font-semibold ${tab === t ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground"}`}>{t}</button>
        ))}
      </nav>
      <div className="px-4 pt-4 pb-10 sm:px-5">
        {tab === "Posts" && <Posts slug={circle.slug} />}
        {tab === "Collabs" && (
          <div className="space-y-2">
            {session && <button onClick={() => setCollabOpen(true)} className={`${btn} w-full bg-primary text-primary-foreground`}><Plus className="h-4 w-4" /> Post a collab request</button>}
            <CollabBoard circle={circle.slug} onBuild={() => setCollabOpen(true)} />
          </div>
        )}
        {tab === "Events" && <EventsList />}
        {tab === "Members" && <Members slug={circle.slug} />}
        {tab === "Learn" && (circle.slug === "money-markets" ? <MoneyLearn /> : <CivicLearn />)}
        {tab === "Rules" && <Rules />}
      </div>
      <CollabForm open={collabOpen} onClose={() => setCollabOpen(false)} defaultCircle={circle.slug} />
    </AppShell>
  );
}

function Posts({ slug }: { slug: string }) {
  const { session } = useSession();
  const { profile } = useProfile();
  const qc = useQueryClient();
  const [kind, setKind] = useState("all");
  const [sort, setSort] = useState<"newest" | "relevant">("newest");
  const [school, setSchool] = useState("all");
  const [f, setF] = useState({ kind: "discussion", title: "", body: "", link_url: "" });
  const [report, setReport] = useState<CirclePost | null>(null);
  const posts = useQuery({ queryKey: ["circle-posts", slug], queryFn: () => fetchCirclePosts(slug), enabled: !!session });
  const blocked = useQuery({ queryKey: ["blocked-ids", session?.user.id], queryFn: fetchBlockedUserIds, enabled: !!session }).data ?? [];
  const authors = useQuery({ queryKey: ["people", "circle", slug, (posts.data ?? []).length], queryFn: () => fetchPeople((posts.data ?? []).map((p) => p.author_id)), enabled: (posts.data ?? []).length > 0 }).data ?? new Map();

  const create = useMutation({
    mutationFn: () => createCirclePost({ circle: slug, kind: f.kind as any, title: f.title.trim(), body: f.body.trim(), link_url: f.link_url.trim() || null, school_name: profile?.school_name ?? null }),
    onSuccess: () => { toast.success("Posted"); setF({ kind: "discussion", title: "", body: "", link_url: "" }); qc.invalidateQueries({ queryKey: ["circle-posts", slug] }); },
    onError: (e: any) => toast.error("Couldn't post", { description: e?.message?.includes("link_url") ? "Links must start with http:// or https://" : e?.message }),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteCirclePost(id),
    onSuccess: () => { toast.success("Post deleted"); qc.invalidateQueries({ queryKey: ["circle-posts", slug] }); },
    onError: (e: any) => toast.error("Couldn't delete", { description: e?.message }),
  });

  if (!session) {
    return (
      <div className="rounded-xl border border-border bg-card/80 p-5 text-center">
        <p className="text-sm font-semibold">Members only</p>
        <p className="mt-1 text-[11px] text-muted-foreground">Create an account or sign in to use this feature.</p>
        <button onClick={requestAuthentication} className={`${btn} mt-3 bg-primary text-primary-foreground`}>Sign in or create account</button>
      </div>
    );
  }
  const schools = [...new Set((posts.data ?? []).map((p) => p.school_name).filter(Boolean))] as string[];
  let list = (posts.data ?? []).filter((p) => !blocked.includes(p.author_id) && (kind === "all" || p.kind === kind) && (school === "all" || p.school_name === school));
  if (sort === "relevant" && profile?.school_name) list = [...list].sort((a, b) => Number(b.school_name === profile.school_name) - Number(a.school_name === profile.school_name));

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-xl border border-border bg-card/80 p-4">
        <div className="flex gap-2">
          {(["discussion", "project", "resource"] as const).map((k) => (
            <button key={k} onClick={() => setF({ ...f, kind: k })} aria-pressed={f.kind === k} className={`tap min-h-[40px] flex-1 rounded-lg border text-[11px] font-semibold capitalize ${f.kind === k ? "border-primary bg-primary/15 text-primary" : "border-border"}`}>{k}</button>
          ))}
        </div>
        <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={140} placeholder="Title" aria-label="Post title" className={input} />
        <textarea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} rows={3} maxLength={4000} placeholder="Share an idea, a project, or a resource" aria-label="Post body" className={input} />
        {f.kind !== "discussion" && <input value={f.link_url} onChange={(e) => setF({ ...f, link_url: e.target.value })} placeholder="Link (optional, https://…)" aria-label="Link" className={input} />}
        <button onClick={() => create.mutate()} disabled={f.title.trim().length < 3 || !f.body.trim() || create.isPending} className={`${btn} w-full bg-primary text-primary-foreground disabled:opacity-50`}>{create.isPending ? "Posting…" : "Post to Circle"}</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Type" className={input}><option value="all">All types</option><option value="discussion">Discussions</option><option value="project">Projects</option><option value="resource">Resources</option></select>
        <select value={school} onChange={(e) => setSchool(e.target.value)} aria-label="School" className={input}><option value="all">All schools</option>{schools.map((s) => <option key={s}>{s}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} aria-label="Sort" className={input}><option value="newest">Newest</option><option value="relevant">My school first</option></select>
      </div>
      {posts.isPending ? <div className="h-24 animate-pulse rounded-xl bg-card" /> :
        posts.isError ? <p className="text-xs">Posts didn't load. <button onClick={() => posts.refetch()} className="text-primary">Retry</button></p> :
        list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-5 text-center">
            <p className="text-sm font-semibold">No posts yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Start the first conversation in this Circle.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {list.map((p) => {
              const a = authors.get(p.author_id);
              const mine = p.author_id === session.user.id;
              return (
                <li key={p.id} className="rounded-xl border border-border bg-card/80 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-primary">{p.kind}</p>
                  <p className="mt-0.5 font-semibold">{p.title}</p>
                  <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">{p.body}</p>
                  {p.link_url && <a href={p.link_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-[36px] items-center gap-1 text-xs text-primary">Open link <ExternalLink className="h-3 w-3" /></a>}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">{personName(a)}</span>
                    {p.school_name && <span>· {p.school_name}</span>}
                    <VerifiedTag person={a} />
                    <span>· {new Date(p.created_at).toLocaleDateString()}</span>
                    <span className="ml-auto flex gap-1">
                      {mine ? (
                        <button onClick={() => del.mutate(p.id)} aria-label="Delete post" className="tap grid h-11 w-11 place-items-center rounded-lg border border-border"><Trash2 className="h-3.5 w-3.5" /></button>
                      ) : (
                        <button onClick={() => setReport(p)} aria-label="Report post" className="tap grid h-11 w-11 place-items-center rounded-lg border border-border"><Flag className="h-3.5 w-3.5" /></button>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      {report && <ReportDialog open onClose={() => setReport(null)} targetType="circle_post" targetId={report.id} reportedUserId={report.author_id} targetLabel="post" snapshot={`${report.title}\n${report.body}`} />}
    </div>
  );
}

function Members({ slug }: { slug: string }) {
  const { session } = useSession();
  const ids = useQuery({ queryKey: ["circle-members", slug], queryFn: () => fetchCircleMembers(slug), enabled: !!session });
  const blocked = useQuery({ queryKey: ["blocked-ids", session?.user.id], queryFn: fetchBlockedUserIds, enabled: !!session }).data ?? [];
  const others = (ids.data ?? []).filter((id) => id !== session?.user.id && !blocked.includes(id));
  const people = useQuery({ queryKey: ["people", "members", slug, others.join(",")], queryFn: () => fetchPeople(others), enabled: others.length > 0 }).data ?? new Map();
  const { map, refetch } = useConnectionMap();
  if (!session) return <p className="text-xs text-muted-foreground">Create an account or sign in to use this feature.</p>;
  if (ids.isPending) return <div className="h-24 animate-pulse rounded-xl bg-card" />;
  if (!others.length) return <p className="rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground">No other members yet. Invite classmates who'd fit this Circle.</p>;
  return <ul className="space-y-2">{others.map((id) => { const p = people.get(id); return p ? <PersonCard key={id} p={p} conn={map.get(id)} onChanged={() => refetch()} /> : null; })}</ul>;
}

function Rules() {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-primary" /> Circle rules</p>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-xs text-muted-foreground">{CIRCLE_RULES.map((r) => <li key={r}>{r}</li>)}</ol>
      <p className="mt-3 text-[11px] text-muted-foreground">Use the flag on any post, request or person to report harassment, scams, spam or impersonation. Blocking hides someone everywhere on PlugU.</p>
      <Link to="/community-guidelines" className="tap mt-2 inline-flex min-h-[44px] items-center text-xs font-semibold text-primary">Full community guidelines</Link>
    </div>
  );
}

const LESSONS = [
  { t: "Reading a company like a stat sheet", b: "Revenue is how much a company sells. Profit (net income) is what's left after costs. Earnings per share splits profit across each share. Like points per game, one number never tells the whole story — look at trends over several years." },
  { t: "Risk and diversification", b: "Putting everything in one stock is like a team with one scorer. Spreading money across many companies — often through low-cost index funds — lowers the damage any single loss can do. All investing carries risk, including losing money." },
  { t: "Long-term vs. get-rich-quick", b: "Historically, broad markets have risen over long periods with sharp drops along the way. Nobody can reliably predict short-term moves. Anyone who guarantees returns is a red flag." },
  { t: "Spotting scams", b: "Warning signs: guaranteed profits, pressure to act fast, requests to pay in crypto or gift cards, 'mentors' who DM you first, and trading groups asking for a fee. Check advisers on FINRA BrokerCheck and report fraud to the SEC or FTC." },
  { t: "Paper trading", b: "Paper trading means practicing with a fictional balance. PlugU does not offer a paper-trading simulator yet, and does not show live prices. Use this Circle to discuss strategies and share what you're learning — never real-money bets." },
];

function MoneyLearn() {
  return (
    <div className="space-y-2">
      <p className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-[11px]">Education only. PlugU is not a broker or financial adviser, shows no live prices, and never promises returns. No real-money wagers are allowed.</p>
      {LESSONS.map((l) => (
        <details key={l.t} className="rounded-xl border border-border bg-card/80 p-4">
          <summary className="tap min-h-[28px] cursor-pointer text-sm font-semibold">{l.t}</summary>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{l.b}</p>
        </details>
      ))}
      <div className="rounded-xl border border-border bg-card/80 p-4 text-xs">
        <p className="font-semibold">Official resources</p>
        <ul className="mt-2 space-y-1">
          {[["Investor.gov (SEC)", "https://www.investor.gov/"], ["FINRA BrokerCheck", "https://brokercheck.finra.org/"], ["Report fraud (FTC)", "https://reportfraud.ftc.gov/"]].map(([n, u]) => (
            <li key={u}><a href={u} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[36px] items-center gap-1 text-primary">{n} <ExternalLink className="h-3 w-3" /></a></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CivicLearn() {
  const links = [
    ["Register to vote — Vote.gov", "https://vote.gov/"],
    ["Find your state or local election office — USA.gov", "https://www.usa.gov/election-office"],
    ["Election dates & deadlines — USA.gov", "https://www.usa.gov/when-to-vote"],
    ["Voting as a college student — U.S. EAC", "https://www.eac.gov/voters/college-student-voting"],
  ];
  return (
    <div className="space-y-2">
      <p className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-[11px]">Posts in this Circle are members' opinions. For election dates, registration and polling places, always use the official sources below. HBCUS and PlugU do not represent any school, party or political organization.</p>
      <div className="rounded-xl border border-border bg-card/80 p-4 text-xs">
        <p className="font-semibold">Official voting information</p>
        <ul className="mt-2 space-y-1">
          {links.map(([n, u]) => <li key={u}><a href={u} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[36px] items-center gap-1 text-primary">{n} <ExternalLink className="h-3 w-3" /></a></li>)}
        </ul>
        <p className="mt-2 text-[10px] text-muted-foreground">Links last checked September 24, 2026.</p>
      </div>
    </div>
  );
}
