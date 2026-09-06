import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AiNewsItem = {
  id: string;
  headline: string;
  summary: string;
  source: string;
  time: string;
  tag: string;
  emoji: string;
  url?: string;
};

export type AiNewsResult = {
  items: AiNewsItem[];
  generatedAt: string;
  error?: string;
};

const Input = z.object({
  category: z.string().min(1).max(400),
  school: z.string().max(200).optional(),
  count: z.number().int().min(1).max(12).optional(),
  context: z.string().max(1000).optional(),
  /** Topics the student has been tapping on, strongest first. */
  interests: z.array(z.string().max(40)).max(8).optional(),
  /** The student's declared major, used to slant careers/scholarships. */
  major: z.string().max(80).optional(),
});

const SYSTEM = `You are PlugU NewsAI, the newsroom editor inside a college app for Black students at HBCUs and across America.

You are given LIVE WIRE STORIES pulled minutes ago from real newsrooms. Your job is to pick the stories that matter most to THIS student and rewrite each into a tight brief. Never invent a story that is not in the wire list, and never invent a link — copy the wire "url" exactly.

Return STRICT JSON ONLY (no markdown) with shape:
{
  "items": [
    {
      "headline": "Concise, news-style headline (<= 90 chars)",
      "summary": "1-2 short sentences, faithful to the wire story",
      "source": "The outlet from the wire item",
      "time": "e.g. 12m, 2h, 1d — from the wire timestamp",
      "tag": "Short category tag, 1-2 words",
      "emoji": "Single relevant emoji",
      "url": "The exact wire url"
    }
  ]
}

Rules:
- Rank by relevance to the student's interests, major and school first, then by freshness.
- Do NOT fabricate quotes, figures, or claims beyond what the wire headline/summary supports.
- Keep tone neutral and informational.
- Never include phone numbers, emails, addresses, or unsafe content.
- If the wire list is empty, return items: [].`;


function fallback(category: string, msg: string): AiNewsResult {
  return {
    items: [
      {
        id: "fb1",
        headline: `${category} headlines are temporarily offline`,
        summary: msg,
        source: "PlugU",
        time: "now",
        tag: category,
        emoji: "📰",
      },
    ],
    generatedAt: new Date().toISOString(),
    error: msg,
  };
}

function safeParse(s: string): any | null {
  try { return JSON.parse(s); } catch {}
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

function ago(iso: string): string {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `${mins}m`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

export const generateNews = createServerFn({ method: "POST" })
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<AiNewsResult> => {
    const count = data.count ?? 8;
    const { fetchWire } = await import("./news-wire.server");

    const interests = (data.interests ?? []).filter(Boolean).slice(0, 5);
    const queryParts = [
      data.category,
      data.major ? `${data.major} students` : "",
      interests.slice(0, 3).join(" OR "),
    ].filter(Boolean);

    // Narrow first (school + major + interests, last two weeks), then widen
    // until we have enough real stories to rank.
    const attempts = [
      `${[data.school ?? "", ...queryParts].filter(Boolean).join(" ")} when:14d`,
      `${queryParts.join(" ")} when:30d`,
      `${data.category} college students`,
    ];
    let stories: Awaited<ReturnType<typeof fetchWire>> = [];
    for (const q of attempts) {
      stories = await fetchWire(q, 16);
      if (stories.length >= 4) break;
    }


    // Straight-from-the-wire result, used when AI is unavailable so students
    // always see real, current headlines.
    const rawItems: AiNewsItem[] = stories.slice(0, count).map((w, i) => ({
      id: `wire-${i}-${w.url}`,
      headline: w.headline.slice(0, 160),
      summary: w.summary.slice(0, 240),
      source: w.source,
      time: ago(w.publishedAt),
      tag: data.category.slice(0, 24),
      emoji: "📰",
      url: w.url,
    }));

    const key = process.env.LOVABLE_API_KEY;
    if (!key || stories.length === 0) {
      return rawItems.length
        ? { items: rawItems, generatedAt: new Date().toISOString() }
        : fallback(data.category, "Live news is temporarily unavailable.");
    }

    const userPrompt =
      `Category: ${data.category}\n` +
      (data.school ? `Student's school: ${data.school}\n` : "") +
      (data.major ? `Student's major: ${data.major}\n` : "") +
      (interests.length ? `Student's recent interests: ${interests.join(", ")}\n` : "") +
      (data.context ? `Extra context: ${data.context}\n` : "") +
      `Pick and rewrite the ${count} most relevant of these LIVE WIRE STORIES:\n` +
      JSON.stringify(
        stories.map((w) => ({
          headline: w.headline,
          summary: w.summary,
          source: w.source,
          url: w.url,
          age: ago(w.publishedAt),
        })),
      );

    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
          "X-Lovable-AIG-SDK": "vercel-ai-sdk",
        },
        body: JSON.stringify({
          // Strongest available reasoning model for ranking + summarising.
          model: "google/gemini-3-pro-preview",
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!r.ok) return { items: rawItems, generatedAt: new Date().toISOString() };
      const j = await r.json();
      const raw = j?.choices?.[0]?.message?.content ?? "";
      const parsed = safeParse(raw);
      const arr = Array.isArray(parsed?.items) ? parsed.items : [];
      if (arr.length === 0) return { items: rawItems, generatedAt: new Date().toISOString() };
      const allowed = new Set(stories.map((w) => w.url));
      const items: AiNewsItem[] = arr.slice(0, count).map((it: any, i: number) => ({
        id: `ai-${Date.now()}-${i}`,
        headline: String(it.headline ?? "").slice(0, 160),
        summary: String(it.summary ?? "").slice(0, 280),
        source: String(it.source ?? "PlugU"),
        time: String(it.time ?? "now"),
        tag: String(it.tag ?? data.category).slice(0, 24),
        emoji: String(it.emoji ?? "📰").slice(0, 4),
        // Only real wire links survive — no invented URLs.
        url: typeof it.url === "string" && allowed.has(it.url) ? it.url : undefined,
      }));
      return { items, generatedAt: new Date().toISOString() };
    } catch {
      return { items: rawItems, generatedAt: new Date().toISOString() };
    }
  });
