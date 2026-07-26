import { useEffect, useMemo, useState } from "react";
import { Heart, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useSchool } from "@/hooks/use-school";
import { useProfile } from "@/hooks/use-profile";
import {
  addCommunityPost,
  listCommunityPosts,
  removeCommunityPost,
  subscribeCommunityPosts,
  toggleLikeCommunityPost,
  type CommunityPost,
} from "@/lib/community-storage";

function relative(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const MAX = 280;

export function CommunityBoard() {
  const school = useSchool();
  const { profile } = useProfile();
  const authorName = useMemo(
    () => profile?.full_name?.trim() || profile?.email?.split("@")[0] || "Plug",
    [profile],
  );
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const refresh = () => setPosts(listCommunityPosts(school.name));
    refresh();
    return subscribeCommunityPosts(refresh);
  }, [school.name]);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    if (t.length > MAX) { toast.error(`Keep it under ${MAX} characters`); return; }
    addCommunityPost({ school: school.name, author: authorName, text: t });
    setText("");
    toast.success("Posted to your campus");
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
              onChange={(e) => setText(e.target.value.slice(0, MAX))}
              placeholder={`Share an update, a hype moment, or a heads-up for ${school.name}…`}
              rows={2}
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{text.length}/{MAX}</span>
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
            return (
              <li key={p.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold shrink-0">
                    {p.author[0]?.toUpperCase() ?? "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{p.author}</p>
                      <span className="text-[10px] text-muted-foreground">· {relative(p.createdAt)}</span>
                      {mine && <span className="text-[9px] tracking-widest uppercase text-primary">You</span>}
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap break-words">{p.text}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleLikeCommunityPost(p.id)}
                        className="tap inline-flex items-center gap-1 text-xs text-muted-foreground"
                      >
                        <Heart className={`h-3.5 w-3.5 ${p.likedByMe ? "fill-current" : ""}`} style={p.likedByMe ? { color: "var(--plugu-gold)" } : undefined} />
                        {p.likes}
                      </button>
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
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}