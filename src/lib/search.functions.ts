import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ question: z.string().min(2).max(500) });

export type AskAIResult = {
  answer: string;
  plugu: { title: string; subtitle: string; category: string }[];
  links: { label: string; url: string; source: "instagram" | "tiktok" | "youtube" | "web" }[];
  error?: string;
};

const SYSTEM = `You are PlugU AI, the search assistant inside a college marketplace app for HBCU students.
You help students find: barbers, hairstylists, food vendors, rides, parties/events, tutors, photographers, internships, scholarships, apartments, and student businesses on or near their campus.

Output STRICT JSON only, no markdown. Shape:
{
  "answer": "1-2 short sentences answering the user.",
  "plugu": [ { "title": "...", "subtitle": "campus · price/time", "category": "Hair|Food|Rides|Events|Tutors|Photo|Scholarships|Internships|Apartments|Businesses" } ],
  "links": [ { "label": "Search '<query>' on TikTok", "url": "https://www.tiktok.com/search?q=...", "source": "tiktok" } ]
}

Rules:
- "plugu" should contain 2-4 plausible PlugU listings/results that sound like real student businesses. Never invent phone numbers or addresses.
- "links" must be 2-4 SEARCH or HASHTAG urls (not scraped content) on Instagram, TikTok, YouTube, or general web. Use these patterns:
  · https://www.instagram.com/explore/tags/<tag>/
  · https://www.tiktok.com/search?q=<encoded>
  · https://www.youtube.com/results?search_query=<encoded>
  · https://www.google.com/search?q=<encoded>
- Keep everything safe, no contact info, no promises. Return ONLY the JSON object.`;

export const askAI = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<AskAIResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return fallback(data.question, "AI is offline. Try again later.");
    }
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
            { role: "user", content: data.question },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (r.status === 429) return fallback(data.question, "PlugU AI is busy — try again in a moment.");
      if (r.status === 402) return fallback(data.question, "PlugU AI is temporarily out of credits.");
      if (!r.ok) return fallback(data.question, `AI error (${r.status}).`);
      const j = await r.json();
      const raw = j?.choices?.[0]?.message?.content ?? "";
      const parsed = safeParse(raw);
      if (!parsed) return fallback(data.question, "Couldn't parse AI response.");
      return {
        answer: String(parsed.answer ?? ""),
        plugu: Array.isArray(parsed.plugu) ? parsed.plugu.slice(0, 6) : [],
        links: Array.isArray(parsed.links) ? parsed.links.slice(0, 6) : [],
      };
    } catch (e) {
      return fallback(data.question, "AI unreachable.");
    }
  });

function safeParse(s: string): any | null {
  try { return JSON.parse(s); } catch {}
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

function fallback(q: string, msg: string): AskAIResult {
  const enc = encodeURIComponent(q);
  return {
    answer: msg,
    plugu: [],
    links: [
      { label: `Search "${q}" on TikTok`, url: `https://www.tiktok.com/search?q=${enc}`, source: "tiktok" },
      { label: `Search "${q}" on Instagram`, url: `https://www.google.com/search?q=site%3Ainstagram.com+${enc}`, source: "instagram" },
      { label: `Search "${q}" on YouTube`, url: `https://www.youtube.com/results?search_query=${enc}`, source: "youtube" },
    ],
    error: msg,
  };
}