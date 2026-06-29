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
  category: z.string().min(1).max(80),
  school: z.string().max(80).optional(),
  count: z.number().int().min(1).max(12).optional(),
  context: z.string().max(200).optional(),
});

const SYSTEM = `You are PlugU NewsAI, generating short, plausible, real-world style news briefs for Black college students at HBCUs and across America.
Treat the user prompt as a category. Produce up-to-date sounding stories that a Black college student would care about — campus, HBCU funding & policy, scholarships, internships, Black business, Black culture, sports (HBCU football/basketball/track), markets/finance, careers, study abroad, social justice, and national headlines that affect Black students.

Return STRICT JSON ONLY (no markdown) with shape:
{
  "items": [
    {
      "headline": "Concise, news-style headline (<= 90 chars)",
      "summary": "1-2 short factual-sounding sentences",
      "source": "Realistic outlet (AP, Reuters, NYT, The Root, HBCU Buzz, ESPN, Bloomberg, Atlanta Journal-Constitution, Andscape, etc.)",
      "time": "e.g. 12m, 2h, 1d",
      "tag": "Short category tag, 1-2 words",
      "emoji": "Single relevant emoji",
      "url": "Optional plausible search URL on google.com/news or the outlet's domain"
    }
  ]
}

Rules:
- Do NOT fabricate quotes, exact dollar figures attributed to a named person, or breaking-news claims that could be mistaken for verified facts.
- Keep tone neutral and informational. Phrase as "reports", "announces", "expands", "launches", "named", "ranks".
- Diversify across the requested category. If category is "All HBCUs" mix schools (Howard, Spelman, Morehouse, FAMU, Hampton, Jackson State, NCCU, Tuskegee, Southern, etc.).
- Never include phone numbers, emails, addresses, or unsafe content.
- Return between 6 and 10 items unless a different count is requested.`;

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

export const generateNews = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<AiNewsResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return fallback(data.category, "AI news is offline. Try again later.");

    const count = data.count ?? 8;
    const userPrompt =
      `Category: ${data.category}\n` +
      (data.school ? `Student's home HBCU: ${data.school}\n` : "") +
      (data.context ? `Extra context: ${data.context}\n` : "") +
      `Generate ${count} fresh news briefs relevant to Black college students RIGHT NOW. ` +
      `Mix national, HBCU-specific, and student-impact angles. Vary sources and timeframes (minutes to a few days old).`;

    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
          "X-Lovable-AIG-SDK": "vercel-ai-sdk",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (r.status === 429) return fallback(data.category, "PlugU NewsAI is busy — try again in a moment.");
      if (r.status === 402) return fallback(data.category, "PlugU NewsAI is temporarily out of credits.");
      if (!r.ok) return fallback(data.category, `AI error (${r.status}).`);
      const j = await r.json();
      const raw = j?.choices?.[0]?.message?.content ?? "";
      const parsed = safeParse(raw);
      const arr = Array.isArray(parsed?.items) ? parsed.items : [];
      if (arr.length === 0) return fallback(data.category, "No stories generated.");
      const items: AiNewsItem[] = arr.slice(0, count).map((it: any, i: number) => ({
        id: `ai-${Date.now()}-${i}`,
        headline: String(it.headline ?? "").slice(0, 160),
        summary: String(it.summary ?? "").slice(0, 280),
        source: String(it.source ?? "PlugU"),
        time: String(it.time ?? "now"),
        tag: String(it.tag ?? data.category).slice(0, 24),
        emoji: String(it.emoji ?? "📰").slice(0, 4),
        url: typeof it.url === "string" ? it.url : undefined,
      }));
      return { items, generatedAt: new Date().toISOString() };
    } catch {
      return fallback(data.category, "AI unreachable.");
    }
  });