import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal, BadgeCheck,
  Crown, ImagePlus, Video, Tag, Plus, ChevronLeft, ChevronRight, X,
  ShoppingBag, CalendarCheck2, GraduationCap, Car, Megaphone, Sparkles,
  Flame, AlertTriangle, Trophy, Bell,
} from "lucide-react";
import {
  feedPosts, stories, feedFilters, filterPosts,
  featuredCreators, announcements,
  type FeedFilter, type FeedPost,
} from "@/lib/feed-data";
import { toast } from "sonner";

const SAVED_KEY = "plugu.feed.saved";
const LIKED_KEY = "plugu.feed.liked";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(window.localStorage.getItem(key) || "[]")); } catch { return new Set(); }
}
function writeSet(key: string, set: Set<string>) {
  try { window.localStorage.setItem(key, JSON.stringify([...set])); } catch {}
}

export function CampusFeed() {
  const [filter, setFilter] = useState<FeedFilter>("For You");
  const [composerOpen, setComposerOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(() => readSet(LIKED_KEY));
  const [saved, setSaved] = useState<Set<string>>(() => readSet(SAVED_KEY));

  const posts = useMemo(() => filterPosts(feedPosts, filter), [filter]);

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      writeSet(LIKED_KEY, next);
      return next;
    });
  }
  function toggleSave(id: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast("Removed from saved"); }
      else { next.add(id); toast.success("Saved to your collection"); }
      writeSet(SAVED_KEY, next);
      return next;
    });
  }

  return (
    <section className="mt-6">
      {/* Section header */}
      <div className="flex items-end justify-between px-5 mb-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: "var(--plugu-gold)" }}>
            Campus Feed
          </p>
          <h2 className="text-xl font-black leading-tight">What's poppin today</h2>
        </div>
        <Link to="/messages" className="tap text-[11px] font-medium text-muted-foreground hover:text-foreground">
          Inbox →
        </Link>
      </div>

      {/* Stories */}
      <div className="flex gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stories.map((s, i) => {
          const isCreate = s.id === "create";
          return (
            <button
              key={s.id}
              onClick={() => isCreate ? setComposerOpen(true) : setStoryOpen(s.id)}
              className="tap flex flex-col items-center gap-1.5 shrink-0 w-16"
            >
              <div className="relative h-16 w-16">
                <div
                  className="absolute inset-0 rounded-full p-[2px]"
                  style={{ background: isCreate
                    ? "color-mix(in oklab, var(--border) 80%, transparent)"
                    : "conic-gradient(from 180deg, var(--plugu-gold), var(--plugu-purple), var(--plugu-gold))" }}
                >
                  <div className="h-full w-full rounded-full bg-card grid place-items-center text-2xl">
                    {s.emoji}
                  </div>
                </div>
                {s.live && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-px rounded-md text-[8px] font-bold tracking-wider bg-accent text-accent-foreground">
                    LIVE
                  </span>
                )}
                {isCreate && (
                  <span className="absolute bottom-0 right-0 h-5 w-5 grid place-items-center rounded-full bg-primary border-2 border-background">
                    <Plus className="h-3 w-3 text-primary-foreground" />
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground truncate max-w-[64px]">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Announcements ticker */}
      <div className="mx-5 mb-3 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-stretch">
          <div className="shrink-0 grid place-items-center px-3 bg-[image:var(--gradient-bronze)] text-primary-foreground">
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div
              className="flex gap-8 whitespace-nowrap py-2.5 pl-4 text-xs"
              style={{ animation: "plugu-ticker 38s linear infinite" }}
            >
              {[...announcements, ...announcements].map((a, idx) => (
                <span key={`${a.id}-${idx}`} className="inline-flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider ${
                    a.tag === "Alert" ? "bg-destructive/15 text-destructive" :
                    a.tag === "Win"   ? "bg-accent/15"
                                      : "bg-secondary text-muted-foreground"
                  }`} style={a.tag === "Win" ? { color: "var(--plugu-gold)" } : undefined}>
                    {a.tag.toUpperCase()}
                  </span>
                  <span className="font-semibold">{a.campus}:</span>
                  <span className="text-muted-foreground">{a.title}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {feedFilters.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`tap shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Create post entry */}
      <button
        onClick={() => setComposerOpen(true)}
        className="tap mx-5 mb-5 w-[calc(100%-2.5rem)] flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-card text-left"
      >
        <div className="h-9 w-9 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">K</div>
        <span className="flex-1 text-sm text-muted-foreground">Share a drop, plate, or moment…</span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <ImagePlus className="h-4 w-4" />
          <Video className="h-4 w-4" />
        </span>
      </button>

      {/* Featured Creators rail */}
      <div className="mb-5">
        <div className="flex items-center justify-between px-5 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--plugu-gold)" }} />
            <h3 className="text-sm font-bold">Featured Creators</h3>
          </div>
          <button className="text-[11px] text-muted-foreground tap">See all</button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredCreators.map((c) => (
            <article
              key={c.id}
              className="tap shrink-0 w-[156px] rounded-2xl overflow-hidden border border-border relative"
              style={{ background: c.gradient, aspectRatio: "3/4" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur px-2 py-0.5 text-[9px] font-bold text-white border border-white/15">
                <Flame className="h-2.5 w-2.5" /> {c.followers}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-5xl drop-shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
                {c.emoji}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold truncate">{c.name}</p>
                  {c.kingpin && <Crown className="h-3 w-3 shrink-0" style={{ color: "var(--plugu-gold)" }} />}
                </div>
                <p className="text-[10px] text-white/70 truncate">{c.craft} · {c.campus}</p>
                <button className="tap mt-2 w-full py-1.5 rounded-full text-[11px] font-semibold text-black"
                  style={{ background: "var(--plugu-gold)" }}>
                  Follow
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-7">
        {posts.map((p, i) => (
          <PostCard
            key={p.id}
            post={p}
            liked={liked.has(p.id)}
            saved={saved.has(p.id)}
            onLike={() => toggleLike(p.id)}
            onSave={() => toggleSave(p.id)}
            index={i}
          />
        ))}
        {posts.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10 px-5">
            Nothing here yet. Try another filter or post something fresh.
          </p>
        )}
      </div>

      {composerOpen && <Composer onClose={() => setComposerOpen(false)} />}
      {storyOpen && <StoryViewer id={storyOpen} onClose={() => setStoryOpen(null)} />}
    </section>
  );
}

function ctaIcon(cta: NonNullable<FeedPost["vendor"]>["cta"]) {
  switch (cta) {
    case "Shop": return ShoppingBag;
    case "Book": return CalendarCheck2;
    case "Apply": return GraduationCap;
    case "RSVP": return CalendarCheck2;
    case "Ride": return Car;
  }
}

function typeBadge(type: FeedPost["type"]): { label: string; icon: any; tint: string } | null {
  switch (type) {
    case "product":      return { label: "Trending Product", icon: Flame,         tint: "var(--plugu-gold)" };
    case "announcement": return { label: "Announcement",     icon: Bell,          tint: "var(--plugu-purple)" };
    case "daily":        return { label: "PlugU Daily",      icon: Megaphone,     tint: "var(--plugu-gold)" };
    case "hbcu":         return { label: "HBCU Wire",        icon: Trophy,        tint: "var(--plugu-purple)" };
    case "event":        return { label: "Campus Event",     icon: CalendarCheck2,tint: "var(--plugu-gold)" };
    case "scholarship":  return { label: "Opportunity",      icon: GraduationCap, tint: "var(--plugu-purple)" };
    default: return null;
  }
}

function PostCard({
  post, liked, saved, onLike, onSave, index,
}: {
  post: FeedPost; liked: boolean; saved: boolean;
  onLike: () => void; onSave: () => void; index: number;
}) {
  const [slide, setSlide] = useState(0);
  const total = post.media.length;
  const CtaIcon = post.vendor ? ctaIcon(post.vendor.cta) : null;
  const badge = typeBadge(post.type);
  const BadgeIcon = badge?.icon;
  const isAnnouncement = post.type === "announcement";

  return (
    <article
      className="mx-3 rounded-[28px] border border-border bg-card overflow-hidden shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]"
      style={{ animation: `plugu-fade-up 0.4s ease-out ${Math.min(index, 5) * 60}ms both` }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-3.5 pb-3">
        <div className="relative shrink-0">
          <div
            className="h-11 w-11 rounded-full p-[2px]"
            style={{ background: post.user.kingpin
              ? "conic-gradient(from 180deg, var(--plugu-gold), var(--plugu-purple), var(--plugu-gold))"
              : "color-mix(in oklab, var(--border) 70%, transparent)" }}
          >
            <div className="h-full w-full rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
              {post.user.name[0]}
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-sm font-semibold truncate">{post.user.name}</p>
            {post.user.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
            {post.user.kingpin && <Crown className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--plugu-gold)" }} />}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="truncate">{post.user.campus}</span>
            <span>·</span>
            <span>{post.time}</span>
            {post.sponsored && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-0.5" style={{ color: "var(--plugu-gold)" }}>
                  <Megaphone className="h-3 w-3" /> Sponsored
                </span>
              </>
            )}
          </div>
        </div>
        <button aria-label="More" className="tap h-8 w-8 grid place-items-center rounded-full text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </header>

      {/* Media */}
      <div className={`relative w-full overflow-hidden ${isAnnouncement ? "aspect-[16/9]" : "aspect-[4/5]"}`}>
        <div
          className="absolute inset-0 grid place-items-center"
          style={{
            background:
              "radial-gradient(55% 55% at 28% 30%, color-mix(in oklab, var(--plugu-purple) 38%, transparent), transparent 70%), radial-gradient(70% 70% at 80% 82%, color-mix(in oklab, var(--plugu-gold) 30%, transparent), transparent 70%), #0a0a0a",
          }}
        >
          <span className="text-[180px] drop-shadow-[0_14px_40px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:scale-105">
            {post.media[slide]}
          </span>
        </div>

        {/* Type badge (top-left) */}
        {badge && BadgeIcon && (
          <span
            className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-white border border-white/15"
            style={{ color: badge.tint }}
          >
            <BadgeIcon className="h-3 w-3" /> {badge.label}
          </span>
        )}

        {/* Vendor price tag (top-right) */}
        {post.vendor?.tag && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/65 backdrop-blur px-2.5 py-1 text-[10px] font-semibold text-white border border-white/15">
            <Tag className="h-3 w-3" /> {post.vendor.tag}{post.vendor.price ? ` · ${post.vendor.price}` : ""}
          </span>
        )}

        {/* Bottom caption gradient overlay for immersion */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />

        {total > 1 && (
          <>
            <button
              onClick={() => setSlide((s) => Math.max(0, s - 1))}
              disabled={slide === 0}
              className="tap absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-black/50 text-white backdrop-blur disabled:opacity-30"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSlide((s) => Math.min(total - 1, s + 1))}
              disabled={slide === total - 1}
              className="tap absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-black/50 text-white backdrop-blur disabled:opacity-30"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {post.media.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-4 bg-white" : "w-1.5 bg-white/40"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 pt-3.5">
        <button onClick={onLike} aria-label="Like" className="tap h-9 w-9 grid place-items-center rounded-full hover:bg-secondary">
          <Heart className={`h-[22px] w-[22px] transition-all ${liked ? "fill-accent text-accent scale-110" : "text-foreground"}`} />
        </button>
        <button aria-label="Comment" className="tap h-9 w-9 grid place-items-center rounded-full hover:bg-secondary">
          <MessageCircle className="h-[22px] w-[22px]" />
        </button>
        <Link to="/messages" aria-label="Share" className="tap h-9 w-9 grid place-items-center rounded-full hover:bg-secondary">
          <Send className="h-[22px] w-[22px]" />
        </Link>
        <div className="flex-1" />
        <button onClick={onSave} aria-label="Save" className="tap h-9 w-9 grid place-items-center rounded-full hover:bg-secondary">
          <Bookmark className={`h-[22px] w-[22px] transition-colors ${saved ? "fill-primary text-primary" : "text-foreground"}`} />
        </button>
      </div>

      {/* Likes + caption */}
      <div className="px-4 pb-3.5">
        <p className="text-sm font-semibold">{(post.likes + (liked ? 1 : 0)).toLocaleString()} likes</p>
        <p className="mt-1.5 text-[14px] leading-relaxed">
          <span className="font-semibold mr-1.5">{post.user.name}</span>
          {post.caption}
        </p>
        <button className="mt-1.5 text-xs text-muted-foreground tap">View all {post.comments} comments</button>
      </div>

      {/* Vendor CTAs */}
      {post.vendor && CtaIcon && (
        <div className="grid grid-cols-3 gap-2 px-3 pb-4">
          <Link
            to="/market"
            className="tap col-span-2 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-sm font-semibold"
          >
            <CtaIcon className="h-4 w-4" /> {post.vendor.cta} now
          </Link>
          <Link
            to="/messages"
            className="tap flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-secondary border border-border text-sm font-medium"
          >
            <MessageCircle className="h-4 w-4" /> Message
          </Link>
        </div>
      )}

      {/* Announcement CTA */}
      {isAnnouncement && (
        <div className="px-3 pb-4">
          <button className="tap w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-border bg-secondary text-sm font-medium">
            <AlertTriangle className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} /> Mark as read
          </button>
        </div>
      )}
    </article>
  );
}

function Composer({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState<"Post" | "Drop" | "Service" | "Event">("Post");
  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-label="Create post"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border rounded-t-3xl p-5 mb-safe"
        style={{ animation: "plugu-slide-up 0.32s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">Create</h3>
          <button onClick={onClose} aria-label="Close" className="tap h-9 w-9 grid place-items-center rounded-full bg-secondary border border-border">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 mb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["Post", "Drop", "Service", "Event"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`tap shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${
                kind === k ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            kind === "Drop" ? "What dropped? Add a price + size run." :
            kind === "Service" ? "What service? Hours + price." :
            kind === "Event" ? "Event details: when, where, free or $." :
            "What's the vibe on campus?"
          }
          rows={4}
          className="w-full bg-secondary border border-border rounded-2xl p-3 text-sm outline-none placeholder:text-muted-foreground resize-none"
        />
        <div className="mt-3 flex items-center gap-2">
          <button className="tap flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary border border-border text-xs font-medium">
            <ImagePlus className="h-4 w-4" /> Photo
          </button>
          <button className="tap flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary border border-border text-xs font-medium">
            <Video className="h-4 w-4" /> Video
          </button>
          <button className="tap flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary border border-border text-xs font-medium">
            <Tag className="h-4 w-4" /> Tag
          </button>
        </div>
        <button
          onClick={() => { onClose(); toast.success("Posted to your campus feed"); }}
          disabled={!text.trim()}
          className="tap mt-4 w-full py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground font-semibold disabled:opacity-50"
        >
          Share
        </button>
      </div>
    </div>
  );
}

function StoryViewer({ id, onClose }: { id: string; onClose: () => void }) {
  const story = stories.find((s) => s.id === id);
  if (!story) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/95" onClick={onClose}>
      <div className="absolute inset-x-4 top-4 h-1 rounded-full bg-white/20 overflow-hidden">
        <div className="h-full bg-white" style={{ animation: "plugu-slide-up 5s linear forwards", width: "100%" }} />
      </div>
      <button onClick={onClose} aria-label="Close" className="tap absolute top-6 right-4 h-9 w-9 grid place-items-center rounded-full bg-white/10 text-white">
        <X className="h-4 w-4" />
      </button>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[120px] drop-shadow-[0_8px_30px_rgba(255,255,255,0.2)]">{story.emoji}</div>
          <p className="mt-4 text-white text-2xl font-bold">{story.label}</p>
          <p className="text-white/60 text-sm mt-1 uppercase tracking-widest">{story.group}</p>
        </div>
      </div>
    </div>
  );
}