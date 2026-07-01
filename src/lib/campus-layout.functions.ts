import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type CampusZone = {
  id: string;
  label: string;
  category:
    | "academic"
    | "dorm"
    | "dining"
    | "athletic"
    | "student-life"
    | "landmark"
    | "green"
    | "admin"
    | "safety";
  x: number; // 0-100
  y: number; // 0-100
  w: number; // 0-100
  h: number; // 0-100
  emoji: string;
};

export type CampusPath = {
  id: string;
  label: string;
  points: { x: number; y: number }[];
};

export type CampusLayout = {
  school: string;
  tagline: string;
  zones: CampusZone[];
  paths: CampusPath[];
  generatedAt: string;
  error?: string;
};

const Input = z.object({
  school: z.string().min(2).max(80),
  city: z.string().max(80).optional(),
  mascot: z.string().max(60).optional(),
});

const CATEGORIES = [
  "academic",
  "dorm",
  "dining",
  "athletic",
  "student-life",
  "landmark",
  "green",
  "admin",
  "safety",
];

const SYSTEM = `You are PlugU CampusAI. Given an HBCU, produce a stylized top-down campus zone map on a 100x100 grid.
Return STRICT JSON only:
{
  "tagline": "1 short sentence describing the campus vibe",
  "zones": [
    { "label": "Founders Library", "category": "academic", "x": 20, "y": 30, "w": 14, "h": 10, "emoji": "📚" }
  ],
  "paths": [
    { "label": "The Yard walk", "points": [{"x":10,"y":50},{"x":50,"y":50},{"x":85,"y":40}] }
  ]
}

Rules:
- 14-20 zones total. Cover: academic buildings (library, main hall, science, business, arts), dorms (2-4), dining (1-2), athletic (stadium/gym), student-life (union, quad), landmark (iconic building/statue), green space, admin, safety (health center or police).
- Use REAL notable buildings when known for the school (e.g. Howard's Founders Library, Spelman's Sisters Chapel, FAMU's Rattler Statue, Morehouse's MLK Chapel, Hampton's Emancipation Oak).
- Zones must NOT overlap heavily and stay within 2 <= x,y and x+w <= 98 and y+h <= 98. Keep w between 8-22 and h between 6-16.
- 2-4 paths, each with 3-6 points forming a walkable route across campus.
- category MUST be one of: ${CATEGORIES.map((c) => `"${c}"`).join(", ")}.
- emoji: single relevant emoji per zone.
- No text outside the JSON.`;

function fallback(school: string, msg: string): CampusLayout {
  return {
    school,
    tagline: "Campus layout temporarily unavailable.",
    zones: [
      { id: "f1", label: "Main Hall", category: "academic", x: 20, y: 20, w: 20, h: 14, emoji: "🏛️" },
      { id: "f2", label: "Library", category: "academic", x: 50, y: 22, w: 18, h: 12, emoji: "📚" },
      { id: "f3", label: "The Yard", category: "green", x: 20, y: 45, w: 48, h: 18, emoji: "🌳" },
      { id: "f4", label: "Student Union", category: "student-life", x: 72, y: 45, w: 18, h: 14, emoji: "🎓" },
      { id: "f5", label: "Dorms", category: "dorm", x: 20, y: 70, w: 22, h: 14, emoji: "🛏️" },
      { id: "f6", label: "Dining Hall", category: "dining", x: 50, y: 70, w: 18, h: 12, emoji: "🍽️" },
      { id: "f7", label: "Stadium", category: "athletic", x: 74, y: 68, w: 20, h: 18, emoji: "🏟️" },
    ],
    paths: [{ id: "p1", label: "Main walk", points: [{ x: 10, y: 55 }, { x: 50, y: 55 }, { x: 90, y: 55 }] }],
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

function clamp(n: unknown, lo: number, hi: number, def: number): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return def;
  return Math.max(lo, Math.min(hi, v));
}

export const generateCampusLayout = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<CampusLayout> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return fallback(data.school, "AI campus layout is offline.");

    const userPrompt =
      `School: ${data.school}\n` +
      (data.city ? `City: ${data.city}\n` : "") +
      (data.mascot ? `Mascot: ${data.mascot}\n` : "") +
      `Design a stylized top-down campus layout with 14-20 zones + 2-4 walking paths. Use real notable buildings when known.`;

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
      if (r.status === 429) return fallback(data.school, "CampusAI is busy — try again shortly.");
      if (r.status === 402) return fallback(data.school, "CampusAI is temporarily out of credits.");
      if (!r.ok) return fallback(data.school, `AI error (${r.status}).`);
      const j = await r.json();
      const raw = j?.choices?.[0]?.message?.content ?? "";
      const parsed = safeParse(raw);
      const zonesRaw = Array.isArray(parsed?.zones) ? parsed.zones : [];
      if (zonesRaw.length === 0) return fallback(data.school, "No layout generated.");

      const zones: CampusZone[] = zonesRaw.slice(0, 22).map((z: any, i: number) => {
        const cat = CATEGORIES.includes(z?.category) ? z.category : "academic";
        const w = clamp(z?.w, 6, 26, 14);
        const h = clamp(z?.h, 5, 20, 10);
        const x = clamp(z?.x, 1, 99 - w, 20);
        const y = clamp(z?.y, 1, 99 - h, 20);
        return {
          id: `z-${i}`,
          label: String(z?.label ?? "Building").slice(0, 40),
          category: cat as CampusZone["category"],
          x, y, w, h,
          emoji: String(z?.emoji ?? "🏛️").slice(0, 4),
        };
      });

      const pathsRaw = Array.isArray(parsed?.paths) ? parsed.paths : [];
      const paths: CampusPath[] = pathsRaw.slice(0, 5).map((p: any, i: number) => ({
        id: `p-${i}`,
        label: String(p?.label ?? "Path").slice(0, 40),
        points: Array.isArray(p?.points)
          ? p.points.slice(0, 8).map((pt: any) => ({
              x: clamp(pt?.x, 0, 100, 50),
              y: clamp(pt?.y, 0, 100, 50),
            }))
          : [],
      })).filter((p) => p.points.length >= 2);

      return {
        school: data.school,
        tagline: String(parsed?.tagline ?? "").slice(0, 160) || `${data.school} campus at a glance.`,
        zones,
        paths,
        generatedAt: new Date().toISOString(),
      };
    } catch {
      return fallback(data.school, "AI unreachable.");
    }
  });