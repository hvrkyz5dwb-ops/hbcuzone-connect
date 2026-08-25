import { useEffect, useMemo, useState } from "react";
import { Heart, MessageCircle, Send, Trash2, Users, Globe, Lock } from "lucide-react";
import { ContentMenu } from "@/components/ContentMenu";
import { hideCommunityPost, isPostHidden, muteAuthor, isAuthorMuted, isContentHidden } from "@/lib/ugc-safety";
import { screenBeforePublish } from "@/lib/screen";
import { toast } from "sonner";
import { useSchool } from "@/hooks/use-school";
import { useProfile } from "@/hooks/use-profile";
import {
  addCommunityPost,
  addComment,
  listCommunityPosts,
  removeComment,
  removeCommunityPost,
  subscribeCommunityPosts,
  toggleLikeCommunityPost,
  type CommunityPost,
  type Comment,
  type PostTag,
} from "@/lib/community-storage";

const TAGS: { key: PostTag; label: string; emoji: string }[] = [
  { key: "chatter", label: "Chatter", emoji: "💬" },
  { key: "selling", label: "Selling", emoji: "🏷️" },
  { key: "looking", label: "Looking for", emoji: "🔎" },
  { key: "hiring", label: "Hiring", emoji: "💼" },
  { key: "event", label: "Event", emoji: "🎉" },
  { key: "heads_up", label: "Heads up", emoji: "⚡" },
];

function tagDef(key: PostTag) {
  return TAGS.find((t) => t.key === key) ?? TAGS[0];
}

/** Fizz-style hotness: engagement decayed over time so fresh buzz floats up. */
function hotness(p: CommunityPost) {
  const hours = (Date.now() - p.createdAt) / 3_600_000;
  return (p.likes * 2 + p.comments.length * 3 + 1) / Math.pow(hours + 2, 1.3);
}

function relative(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const MAX_POST = 280;
const MAX_COMMENT = 140;

export function CommunityBoard() {
  const school = useSchool();
  const { profile } = useProfile();
  const authorName = useMemo(
    () => profile?.full_name?.trim() || profile?.email?.split("@")[0] || "Plug",
    [profile],
  );
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState<"campus" | "public">("campus");
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [safetyTick, setSafetyTick] = useState(0);

  useEffect(() => {
    const refresh = () =>
      setPosts(
        listCommunityPosts(school.name).filter(
          (p) =>
            !isPostHidden(p.id) &&
            !isContentHidden("post", p.id) &&
            !isAuthorMuted(p.author),
        ),
      );
    refresh();
    return subscribeCommunityPosts(refresh);
  }, [school.name, safetyTick]);

  const submit = async () => {
    const t = text.trim();
    if (!t) return;
    if (t.length > MAX_POST) { toast.error(`Keep it under ${MAX_POST} characters`); return; }
    try {
      await screenBeforePublish("community_post", t);
    } catch (err) {
      const e = err as Error & { category?: string };
      toast.error(`Post blocked — ${e.category ?? "Community Guidelines"}`, { description: e.message });
      return;
    }
    addCommunityPost({ school: school.name, author: authorName, text: t, visibility });
    setText("");
    toast.success(visibility === "public" ? "Posted publicly" : "Posted to your campus");
  };

  const submitComment = async (postId: string) => {
    const t = (commentDrafts[postId] || "").trim();
    if (!t) return;
    if (t.length > MAX_COMMENT) { toast.error(`Comment under ${MAX_COMMENT} chars`); return; }
    try {
      await screenBeforePublish("community_comment", t, postId);
    } catch (err) {
      const e = err as Error & { category?: string };
      toast.error(`Comment blocked — ${e.category ?? "Community Guidelines"}`, { description: e.message });
      return;
    }
    addComment(postId, authorName, t);
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
  };


  return (
    <section className="mt-7 px-5">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--plugu-gold)" }}>Community</p>
          <h2 className="text-lg font-bold">What's going on at {school.name}?</h2>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <Users className="h-3 w-3" /> {posts.length}
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold shrink-0">
            {authorName[0]?.toUpperCase() ?? "P"}
          </div>
          <div className="flex-1 min-w-0">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_POST))}
              placeholder={`Share an update, a hype moment, or a heads-up for ${school.name}…`}
              rows={2}
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{text.length}/{MAX_POST}</span>
              <button
                type="button"
                onClick={submit}
                disabled={!text.trim()}
                className="tap inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" /> Post
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-2">
          <span className="text-[10px] text-muted-foreground mr-1">Visible to:</span>
          <button
            type="button"
            onClick={() => setVisibility("campus")}
            className={`tap inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium border transition-colors ${
              visibility === "campus"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="h-3 w-3" /> {school.name} only
          </button>
          <button
            type="button"
            onClick={() => setVisibility("public")}
            className={`tap inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium border transition-colors ${
              visibility === "public"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="h-3 w-3" /> All PlugU students
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-border p-5 text-center">
          <p className="text-sm font-semibold">No posts yet</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first Plug to put {school.name} on.</p>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {posts.map((p) => {
            const mine = p.author === authorName;
            const commentsOpen = !!openComments[p.id];
            return (
              <li key={p.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold shrink-0">
                    {p.author[0]?.toUpperCase() ?? "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">{p.author}</p>
                      <span className="text-[10px] text-muted-foreground">· {relative(p.createdAt)}</span>
                      {mine && <span className="text-[9px] tracking-widest uppercase text-primary">You</span>}
                      <span
                        className="inline-flex items-center gap-0.5 rounded-full border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground"
                        title={p.visibility === "campus" ? "Only visible on this campus" : "Visible to all PlugU students"}
                      >
                        {p.visibility === "campus" ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                        {p.visibility === "campus" ? "Campus" : "Public"}
                      </span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap break-words">{p.text}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => toggleLikeCommunityPost(p.id)}
                        className="tap inline-flex items-center gap-1 text-xs text-muted-foreground"
                      >
                        <Heart className={`h-3.5 w-3.5 ${p.likedByMe ? "fill-current" : ""}`} style={p.likedByMe ? { color: "var(--plugu-gold)" } : undefined} />
                        {p.likes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenComments((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                        className="tap inline-flex items-center gap-1 text-xs text-muted-foreground"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        {p.comments.length}
                      </button>
                      {!mine && (
                        <ContentMenu
                          targetType="post"
                          targetId={p.id}
                          targetLabel={p.text.slice(0, 60)}
                          authorLabel={p.author}
                          onHidden={() => setSafetyTick((n) => n + 1)}
                          extraActions={[
                            {
                              label: `Block ${p.author}`,
                              onSelect: () => {
                                hideCommunityPost(p.id);
                                muteAuthor(p.author);
                                toast.message(`Blocked ${p.author}`, { description: "Their posts are hidden for you." });
                              },
                            },
                          ]}
                        />
                      )}
                      {mine && (
                        <button
                          type="button"
                          onClick={() => { removeCommunityPost(p.id); toast.message("Post removed"); }}
                          className="tap inline-flex items-center gap-1 text-xs text-muted-foreground"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      )}
                    </div>

                    {commentsOpen && (
                      <div className="mt-3 rounded-xl border border-border bg-background/50 p-3">
                        {p.comments.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No comments yet. Start the conversation.</p>
                        ) : (
                          <ul className="space-y-2 mb-3">
                            {p.comments.map((c) => (
                              <CommentItem key={c.id} postId={p.id} comment={c} authorName={authorName} />
                            ))}
                          </ul>
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            value={commentDrafts[p.id] || ""}
                            onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [p.id]: e.target.value.slice(0, MAX_COMMENT) }))}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(p.id); } }}
                            placeholder="Add a comment…"
                            className="flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => submitComment(p.id)}
                            disabled={!(commentDrafts[p.id] || "").trim()}
                            className="tap inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40"
                          >
                            <Send className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        By posting you agree to PlugU's Community Guidelines and Terms. Harassment, hate, nudity,
        illegal items and spam are not allowed. Reported content is reviewed within 24 hours and
        offending posts and accounts are removed.
      </p>


    </section>
  );
}

function CommentItem({ postId, comment, authorName }: { postId: string; comment: Comment; authorName: string }) {
  const mine = comment.author === authorName;
  return (
    <li className="flex items-start gap-2">
      <div className="h-6 w-6 rounded-full bg-secondary grid place-items-center text-[10px] font-bold shrink-0">
        {comment.author[0]?.toUpperCase() ?? "P"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">{comment.author}</span>
          <span className="text-[10px] text-muted-foreground">{relative(comment.createdAt)}</span>
          {mine && (
            <button
              type="button"
              onClick={() => removeComment(postId, comment.id)}
              className="text-[10px] text-muted-foreground underline hover:text-destructive"
            >
              Delete
            </button>
          )}
        </div>
        <p className="text-xs text-foreground whitespace-pre-wrap break-words">{comment.text}</p>
      </div>
    </li>
  );
}
