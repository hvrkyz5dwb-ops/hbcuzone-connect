import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type NetworkMatch = {
  name: string;
  role: string;
  company: string;
  why: string;
  /** Indeed search URL for roles/companies this student should look at. */
  indeedUrl: string;
  indeedLabel: string;
};

export type NetworkMatchResult = { matches: NetworkMatch[]; error?: string };

const Input = z.object({ interest: z.string().max(120).optional() });

const SYSTEM = `You are PlugU's networking matchmaker for HBCU and college students.
Given a student's school, major and interest, suggest 4 realistic professional archetypes they should connect with
(alumni, recruiters, founders, hiring managers) and pair each with an Indeed job-search link that helps them find those people/roles.
Output STRICT JSON only:
{"matches":[{"name":"...","role":"...","company":"...","why":"one short sentence","indeedLabel":"Search '<query>' on Indeed","indeedUrl":"https://www.indeed.com/jobs?q=<encoded>&l=<encoded location>"}]}
Rules: names must be plausible generic professional names, never real private individuals' contact info.
Every indeedUrl must be an https://www.indeed.com/jobs?q=... search URL with URL-encoded params. Return only the JSON object.`;

export const suggestConnections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => Input.parse(d ?? {}))
  .handler(async ({ data, context }): Promise<NetworkMatchResult> => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("major, school_name")
      .eq("id", context.userId)
      .maybeSingle();

    const major = (profile?.major as string) || "undeclared";
    const school = (profile?.school_name as string) || "an HBCU";
    const interest = data.interest?.trim() || major;

    const key = process.env.LOVABLE_API_KEY;
    if (!key) return fallback(interest, "AI is offline — here are direct Indeed searches.");

    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: `School: ${school}. Major: ${major}. Interest: ${interest}.` },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!r.ok) return fallback(interest, r.status === 429 ? "PlugU AI is busy — try again shortly." : `AI error (${r.status}).`);
      const j = await r.json();
      const raw = j?.choices?.[0]?.message?.content ?? "";
      const parsed = safeParse(raw);
      const matches = Array.isArray(parsed?.matches) ? parsed.matches.slice(0, 6) : [];
      if (!matches.length) return fallback(interest, "Couldn't read AI response.");
      return {
        matches: matches.map((m: any) => ({
          name: String(m.name ?? "Alumni contact"),
          role: String(m.role ?? ""),
          company: String(m.company ?? ""),
          why: String(m.why ?? ""),
          indeedLabel: String(m.indeedLabel ?? "Search on Indeed"),
          indeedUrl: safeIndeed(String(m.indeedUrl ?? ""), interest),
        })),
      };
    } catch {
      return fallback(interest, "AI unreachable.");
    }
  });

function safeIndeed(url: string, q: string) {
  return url.startsWith("https://www.indeed.com/")
    ? url
    : `https://www.indeed.com/jobs?q=${encodeURIComponent(q)}`;
}

function safeParse(s: string): any | null {
  try { return JSON.parse(s); } catch {}
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

function fallback(interest: string, msg: string): NetworkMatchResult {
  const q = encodeURIComponent(interest);
  return {
    error: msg,
    matches: [
      { name: "Campus recruiter", role: "University Recruiting", company: "Fortune 500 programs", why: "Recruiters hire straight off campus pipelines.", indeedLabel: `Internships in ${interest}`, indeedUrl: `https://www.indeed.com/jobs?q=${q}+intern` },
      { name: "Early-career hiring manager", role: "Team Lead", company: "Mid-size employers", why: "Managers post entry-level roles they staff personally.", indeedLabel: `Entry level ${interest}`, indeedUrl: `https://www.indeed.com/jobs?q=${q}+entry+level` },
      { name: "HBCU alum in your field", role: "Senior professional", company: "Alumni network", why: "Alumni respond to students from their own school.", indeedLabel: `${interest} jobs near campus`, indeedUrl: `https://www.indeed.com/jobs?q=${q}` },
      { name: "Founder / small business owner", role: "Owner", company: "Local businesses", why: "Small teams hire fast and give real responsibility.", indeedLabel: `Part time ${interest}`, indeedUrl: `https://www.indeed.com/jobs?q=${q}+part+time` },
    ],
  };
}
