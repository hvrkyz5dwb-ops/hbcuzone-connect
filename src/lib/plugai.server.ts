// Server-only helpers for Ask PlugU. Grounds the assistant in real marketplace rows.
import type { SupabaseClient } from "@supabase/supabase-js";

import type { AskPlugUResult, PlugUHit } from "./plugai-types";
export type { AskPlugUResult, PlugUHit };

const money = (c: number | null | undefined) =>
  typeof c === "number" ? `$${(c / 100).toFixed(c % 100 === 0 ? 0 : 2)}` : "Ask price";

/** Pull the live campus context the assistant is allowed to answer from. */
export async function gatherContext(
  supabase: SupabaseClient<any>,
  question: string,
  schoolId: string | null,
): Promise<PlugUHit[]> {
  const terms = question.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2);
  const hits: PlugUHit[] = [];

  let lq = supabase
    .from("listings")
    .select("id,title,description,category,price_cents,campus_name,kind,created_at")
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false })
    .limit(40);
  if (schoolId) lq = lq.eq("school_id", schoolId);
  if (terms.length) lq = lq.or(terms.slice(0, 4).map((t) => `title.ilike.%${t}%,category.ilike.%${t}%`).join(","));
  const { data: listings } = await lq;
  for (const l of listings ?? []) {
    hits.push({
      kind: "listing",
      id: l.id as string,
      listingId: l.id as string,
      title: (l.title as string) ?? "Listing",
      subtitle: `${(l.campus_name as string) ?? "On campus"} · ${money(l.price_cents as number)}`,
      category: (l.category as string) ?? "general",
      priceCents: (l.price_cents as number) ?? null,
    });
  }

  const nowIso = new Date().toISOString();
  let aq = supabase
    .from("seller_availability")
    .select("id,listing_id,service_label,category,zone_name,price_from_cents,available_until")
    .eq("is_active", true)
    .or(`available_until.is.null,available_until.gt.${nowIso}`)
    .limit(12);
  if (schoolId) aq = aq.eq("school_id", schoolId);
  const { data: avail } = await aq;
  for (const a of avail ?? []) {
    hits.push({
      kind: "available",
      id: a.id as string,
      listingId: (a.listing_id as string) ?? null,
      title: (a.service_label as string) ?? "Available now",
      subtitle: `Available now${a.zone_name ? ` · ${a.zone_name}` : ""} · from ${money(a.price_from_cents as number)}`,
      category: (a.category as string) ?? "services",
      priceCents: (a.price_from_cents as number) ?? null,
    });
  }

  let dq = supabase
    .from("drops")
    .select("id,listing_id,body,category,zone_name,price_cents,is_flash,expires_at")
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(12);
  if (schoolId) dq = dq.eq("school_id", schoolId);
  const { data: drops } = await dq;
  for (const d of drops ?? []) {
    hits.push({
      kind: "drop",
      id: d.id as string,
      listingId: (d.listing_id as string) ?? null,
      title: (d.is_flash ? "Flash drop: " : "Drop: ") + String(d.body ?? "").slice(0, 60),
      subtitle: `Ends ${new Date(d.expires_at as string).toLocaleString([], { month: "short", day: "numeric", hour: "numeric" })}${d.zone_name ? ` · ${d.zone_name}` : ""}`,
      category: (d.category as string) ?? "drops",
      priceCents: (d.price_cents as number) ?? null,
    });
  }

  return hits;
}

const SYSTEM = `You are PlugU AI inside a college marketplace app.
You answer ONLY from the CONTEXT rows provided (real live listings, availability and drops on the student's campus).
Never invent businesses, prices, phone numbers or addresses. If the context has nothing relevant, say so plainly and suggest what to search instead.
Return STRICT JSON only:
{"answer":"1-2 short sentences","ids":["context id you recommend, best first, max 5"],"links":[{"label":"Search '<q>' on TikTok","url":"https://www.tiktok.com/search?q=...","source":"tiktok"}]}
links: 2-3 external SEARCH urls (tiktok/instagram/youtube/google) related to the question. Never link scraped content.`;

export async function runPlugUAI(question: string, hits: PlugUHit[]): Promise<AskPlugUResult> {
  const links = webLinks(question);
  const key = process.env['LOVABLE_API_KEY'];
  if (!key) return { answer: localAnswer(question, hits), hits: hits.slice(0, 5), links };

  const context = hits
    .slice(0, 40)
    .map((h) => `- id=${h.id} [${h.kind}/${h.category}] ${h.title} — ${h.subtitle}`)
    .join("\n");

  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `QUESTION: ${question}\n\nCONTEXT:\n${context || "(no live rows on this campus)"}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) {
      const msg = r.status === 429 ? "PlugU AI is busy — try again in a moment."
        : r.status === 402 ? "PlugU AI is temporarily out of credits."
        : `AI error (${r.status}).`;
      return { answer: localAnswer(question, hits), hits: hits.slice(0, 5), links, error: msg };
    }
    const j = await r.json();
    const parsed = safeParse(j?.choices?.[0]?.message?.content ?? "");
    if (!parsed) return { answer: localAnswer(question, hits), hits: hits.slice(0, 5), links };
    const byId = new Map(hits.map((h) => [h.id, h]));
    const picked = (Array.isArray(parsed.ids) ? parsed.ids : [])
      .map((id: unknown) => byId.get(String(id)))
      .filter(Boolean) as PlugUHit[];
    const aiLinks = Array.isArray(parsed.links)
      ? parsed.links.filter((l: any) => typeof l?.url === "string" && l.url.startsWith("https://")).slice(0, 3)
      : [];
    return {
      answer: String(parsed.answer ?? localAnswer(question, hits)),
      hits: (picked.length ? picked : hits.slice(0, 5)).slice(0, 5),
      links: aiLinks.length ? aiLinks : links,
    };
  } catch {
    return { answer: localAnswer(question, hits), hits: hits.slice(0, 5), links, error: "AI unreachable — showing live matches." };
  }
}

function localAnswer(q: string, hits: PlugUHit[]): string {
  if (!hits.length) return `Nothing live on your campus matches “${q}” right now. Try a broader search or check back later.`;
  return `Here ${hits.length === 1 ? "is" : "are"} ${Math.min(hits.length, 5)} live match${hits.length === 1 ? "" : "es"} on your campus right now.`;
}

function webLinks(q: string): AskPlugUResult["links"] {
  const enc = encodeURIComponent(q);
  return [
    { label: `Search "${q}" on TikTok`, url: `https://www.tiktok.com/search?q=${enc}`, source: "tiktok" },
    { label: `Search "${q}" on Instagram`, url: `https://www.google.com/search?q=site%3Ainstagram.com+${enc}`, source: "instagram" },
    { label: `Search "${q}" on the web`, url: `https://www.google.com/search?q=${enc}`, source: "web" },
  ];
}

function safeParse(s: string): any | null {
  try { return JSON.parse(s); } catch { /* fallthrough */ }
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { /* ignore */ } }
  return null;
}
