import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, CalendarDays, Clock3, MapPin, MessageCircle, RadioTower, Search, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PullToRefresh } from "@/components/PullToRefresh";
import { CampusBar } from "@/components/campus/CampusBar";
import { AvailableNowCard } from "@/components/pulse/PulseCards";
import { useAvailability } from "@/hooks/use-pulse";
import { useMarketplace } from "@/hooks/use-listings";
import { useCampusEvents, useMyRsvps, useRsvpToggle } from "@/hooks/use-campus";
import { useCampusSchoolId } from "@/hooks/use-campus-scope";
import { useSchool } from "@/hooks/use-school";
import { useSession } from "@/hooks/use-session";
import { requestAuthentication } from "@/components/RequireAuthPrompt";
import { addComment, listCommunityPosts, subscribeCommunityPosts, type CommunityPost } from "@/lib/community-storage";
import { bucketOf } from "@/lib/campus-db";
import { formatPrice, type PriceType } from "@/lib/categories";

export const Route = createFileRoute("/pulse")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "PlugU Now — Buy, Book, and Go" },
      { name: "description", content: "Book available student services, shop new listings, RSVP for tonight, or answer requests near your school." },
      { property: "og:title", content: "PlugU Now" },
      { property: "og:description", content: "Real marketplace activity around your school and nearby community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlugUNow,
});

type NowTab = "available" | "posted" | "tonight" | "requests";
const TABS: { key: NowTab; label: string }[] = [
  { key: "available", label: "Available now" },
  { key: "posted", label: "Just posted" },
  { key: "tonight", label: "Tonight" },
  { key: "requests", label: "Requests" },
];

function relativeTime(value: string | number) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Updated now";
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  return `Updated ${Math.floor(hours / 24)}d ago`;
}

function PlugUNow() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { session } = useSession();
  const school = useSchool();
  const { schoolId, schoolIds, campusName } = useCampusSchoolId();
  const [tab, setTab] = useState<NowTab>("available");
  const availability = useAvailability({ limit: 40 });
  const listings = useMarketplace({
    school_id: schoolId ?? undefined,
    school_ids: schoolIds.length ? schoolIds : undefined,
    campus_scope: "mine",
    sort: "newest",
    limit: 24,
  });
  const eventsQ = useCampusEvents();
  const rsvpsQ = useMyRsvps();
  const rsvp = useRsvpToggle();
  const [requests, setRequests] = useState<CommunityPost[]>([]);
  const [offerFor, setOfferFor] = useState<CommunityPost | null>(null);
  const [offer, setOffer] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const refresh = () => setRequests(listCommunityPosts(school.name).filter((post) => post.tag === "looking"));
    refresh();
    return subscribeCommunityPosts(refresh);
  }, [school.name]);

  const tonight = useMemo(
    () => (eventsQ.data ?? []).filter((event) => bucketOf(event) === "now" || bucketOf(event) === "today"),
    [eventsQ.data],
  );
  const going = useMemo(() => new Set(rsvpsQ.data ?? []), [rsvpsQ.data]);

  async function sendOffer() {
    if (!offerFor) return;
    if (!session) { requestAuthentication(); return; }
    const text = offer.trim();
    if (!text) return;
    setSending(true);
    try {
      await addComment(offerFor.id, "", `Offer: ${text}`);
      toast.success("Offer sent", { description: "Your offer is now attached to this request." });
      setOffer("");
      setOfferFor(null);
    } catch {
      toast.error("Offer wasn't sent", { description: "Check your connection and try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell title="PLUGU NOW">
      <PullToRefresh onRefresh={async () => { await qc.refetchQueries({ type: "active" }); }}>
        <CampusBar subtitle="Book, buy, or attend nearby" />
        <section className="px-5 pt-5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary"><RadioTower className="h-3 w-3" /> Live board</p>
          <h1 className="mt-1 text-[26px] font-black leading-tight">PlugU Now</h1>
          <p className="mt-1 text-xs text-muted-foreground">Real things students can book, buy, or attend around {campusName}.</p>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="PlugU Now views">
            {TABS.map((item) => (
              <button key={item.key} type="button" role="tab" aria-selected={tab === item.key} onClick={() => setTab(item.key)} className={`tap h-11 shrink-0 rounded-full border px-4 text-xs font-semibold ${tab === item.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}>{item.label}</button>
            ))}
          </div>
        </section>

        <section className="pb-8 pt-2" role="tabpanel">
          {tab === "available" && (
            availability.isLoading ? <CardSkeletons /> : availability.isError ? <Unavailable label="Availability couldn't load" onRetry={() => void availability.refetch()} /> : availability.data?.length ? (
              <div className="space-y-3 px-5">{availability.data.map((row) => <AvailableNowCard key={row.id} row={row} />)}</div>
            ) : <Empty title="Nobody has opened a slot right now" text="Availability only appears when a seller turns it on. Check back soon or browse all services." action="Browse services" onAction={() => navigate({ to: "/market" })} />
          )}

          {tab === "posted" && (
            listings.isLoading ? <CardSkeletons /> : listings.isError ? <Unavailable label="New listings couldn't load" onRetry={() => void listings.refetch()} /> : listings.data?.length ? (
              <div className="space-y-3 px-5">{listings.data.map((listing) => (
                <article key={listing.id} className="flex gap-3 overflow-hidden rounded-xl border border-border bg-card p-3">
                  <img src={listing.images[0]?.url} alt={listing.title} className="h-24 w-24 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{listing.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">{listing.seller?.display_name ?? listing.seller?.username ?? "Student seller"}{listing.seller?.verification_status === "verified" && <BadgeCheck className="h-3 w-3 shrink-0 text-primary" />}</p>
                    <p className="mt-1 text-xs font-bold text-primary">{formatPrice(listing.price_cents, listing.price_type as PriceType)}</p>
                    <p className="mt-1 truncate text-[10px] text-muted-foreground">{listing.campus_name} · {relativeTime(listing.created_at)}</p>
                    <Link to="/checkout/$listingId" params={{ listingId: listing.id }} className="tap mt-2 inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-3 text-[11px] font-bold text-primary-foreground"><ShoppingBag className="h-3 w-3" />{listing.kind === "service" ? "Book" : "Buy"}</Link>
                  </div>
                </article>
              ))}</div>
            ) : <Empty title="Nothing new here yet" text="No complete listings have been posted for this school and nearby community." action="Open Market" onAction={() => navigate({ to: "/market" })} />
          )}

          {tab === "tonight" && (
            eventsQ.isLoading ? <CardSkeletons /> : eventsQ.isError ? <Unavailable label="Tonight's events couldn't load" onRetry={() => void eventsQ.refetch()} /> : tonight.length ? (
              <div className="space-y-3 px-5">{tonight.map((event) => (
                <article key={event.id} className="overflow-hidden rounded-xl border border-border bg-card">
                  {event.cover_url && <img src={event.cover_url} alt="" className="h-36 w-full object-cover" />}
                  <div className="p-3">
                    <p className="text-sm font-bold">{event.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><CalendarDays className="h-3 w-3" />{new Date(event.starts_at).toLocaleString([], { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" })}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" />{event.location || "Location TBA"}{event.host_name ? ` · ${event.host_name}` : ""}</p>
                    <button type="button" disabled={rsvp.isPending} onClick={() => session ? rsvp.mutate({ eventId: event.id, going: !going.has(event.id) }, { onError: () => toast.error("RSVP wasn't saved") }) : requestAuthentication()} className="tap mt-3 h-10 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground disabled:opacity-50">{going.has(event.id) ? "Going" : "RSVP"}</button>
                  </div>
                </article>
              ))}</div>
            ) : <Empty title="Nothing confirmed tonight" text="Only events with a real time and organizer appear here." action="See all events" onAction={() => navigate({ to: "/events" })} />
          )}

          {tab === "requests" && (
            requests.length ? <div className="space-y-3 px-5">{requests.map((post) => (
              <article key={post.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3"><p className="flex items-center gap-1 text-xs font-semibold">{post.author}<BadgeCheck className="h-3 w-3 text-primary" /></p><span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock3 className="h-3 w-3" />{relativeTime(post.createdAt).replace("Updated ", "")}</span></div>
                <p className="mt-2 text-sm leading-relaxed">{post.text}</p>
                <p className="mt-2 text-[10px] text-muted-foreground">{post.school || campusName}</p>
                <button type="button" onClick={() => session ? setOfferFor(post) : requestAuthentication()} className="tap mt-3 inline-flex h-10 items-center gap-1 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground"><MessageCircle className="h-3.5 w-3.5" />Make an offer</button>
              </article>
            ))}</div> : <Empty title="No requests here yet" text="Students can ask for something they can't find, and sellers can respond with a real offer." action="Post a request" onAction={() => session ? navigate({ to: "/market" }) : requestAuthentication()} />
          )}
        </section>
      </PullToRefresh>

      {offerFor && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-background/80 p-4 backdrop-blur-sm" onClick={() => setOfferFor(null)}>
          <div role="dialog" aria-modal="true" aria-label="Make an offer" onClick={(event) => event.stopPropagation()} className="mb-safe w-full max-w-md rounded-xl border border-border bg-card p-4">
            <h2 className="text-base font-bold">Make an offer</h2>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{offerFor.text}</p>
            <label htmlFor="offer" className="mt-4 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Your offer</label>
            <textarea id="offer" value={offer} onChange={(event) => setOffer(event.target.value.slice(0, 140))} autoFocus placeholder="What can you provide, for how much, and when?" className="mt-2 min-h-24 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary" />
            <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => setOfferFor(null)} className="tap h-11 rounded-xl border border-border text-sm">Cancel</button><button type="button" disabled={sending || !offer.trim()} onClick={() => void sendOffer()} className="tap h-11 rounded-xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50">{sending ? "Sending…" : "Send offer"}</button></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function CardSkeletons() {
  return <div className="space-y-3 px-5">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-xl border border-border bg-card" />)}</div>;
}

function Empty({ title, text, action, onAction }: { title: string; text: string; action: string; onAction: () => void }) {
  return <div className="mx-5 rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center"><Search className="mx-auto h-5 w-5 text-primary" /><h2 className="mt-3 text-sm font-bold">{title}</h2><p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">{text}</p><button type="button" onClick={onAction} className="tap mt-4 h-11 rounded-xl border border-primary/40 bg-primary/10 px-4 text-xs font-bold text-primary">{action}</button></div>;
}

function Unavailable({ label, onRetry }: { label: string; onRetry: () => void }) {
  return <div className="mx-5 rounded-xl border border-border bg-card p-6 text-center"><p className="text-sm font-bold">{label}</p><p className="mt-1 text-xs text-muted-foreground">Check your connection and try again.</p><button type="button" onClick={onRetry} className="tap mt-4 h-11 rounded-xl border border-border px-4 text-xs font-bold">Retry</button></div>;
}