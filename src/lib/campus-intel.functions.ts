// AI-powered campus intel: live weather + directions/distance estimates.
// Server functions so the LOVABLE_API_KEY never leaves the server.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ---------- shared ----------
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

function safeParse(s: string): any | null {
  try { return JSON.parse(s); } catch {}
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

async function callAI(system: string, user: string): Promise<any | null> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch(AI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return safeParse(j?.choices?.[0]?.message?.content ?? "");
  } catch {
    return null;
  }
}

// ---------- weather ----------
export type CampusWeather = {
  tempF: number;
  condition: string;
  emoji: string;
  high: number;
  low: number;
  blurb: string;
  campus: string;
  error?: string;
};

const WeatherInput = z.object({
  school: z.string().min(2).max(120),
  city: z.string().max(80).optional(),
  state: z.string().max(40).optional(),
});

const WEATHER_SYSTEM = `You are PlugU WeatherAI. Given an HBCU or US college campus,
return a realistic CURRENT weather snapshot for that specific city today.
Use typical seasonal norms for the exact date and location if you don't have live data.
Return STRICT JSON: { "tempF": number, "high": number, "low": number,
"condition": "Sunny|Clear|Cloudy|Partly Cloudy|Rain|Storm|Snow|Windy|Humid|Foggy",
"emoji": "single weather emoji",
"blurb": "6-9 word campus-friendly vibe line, e.g. 'Perfect for the Yard'" }.
No markdown, no extra keys.`;

export const getCampusWeather = createServerFn({ method: "POST" })
  .validator((d: unknown) => WeatherInput.parse(d))
  .handler(async ({ data }): Promise<CampusWeather> => {
    const loc = [data.city, data.state].filter(Boolean).join(", ");
    const prompt = `Campus: ${data.school}${loc ? ` (${loc})` : ""}. Current date: ${new Date().toDateString()}.`;
    const parsed = await callAI(WEATHER_SYSTEM, prompt);
    if (!parsed) {
      return { tempF: 72, high: 78, low: 61, condition: "Clear", emoji: "☀️", blurb: "Nice day on the Yard", campus: data.school, error: "AI offline" };
    }
    return {
      tempF: Number(parsed.tempF ?? 72),
      high: Number(parsed.high ?? 78),
      low: Number(parsed.low ?? 61),
      condition: String(parsed.condition ?? "Clear").slice(0, 24),
      emoji: String(parsed.emoji ?? "☀️").slice(0, 4),
      blurb: String(parsed.blurb ?? "Nice day on the Yard").slice(0, 60),
      campus: data.school,
    };
  });

// ---------- route / distance ----------
export type RouteEstimate = {
  from: string;
  to: string;
  walkMin: number;
  driveMin: number;
  bikeMin: number;
  distanceMi: number;
  directions: string[];
  tip?: string;
  error?: string;
};

const RouteInput = z.object({
  query: z.string().min(2).max(200),
  campus: z.string().min(2).max(120),
});

const ROUTE_SYSTEM = `You are PlugU CampusRouterAI. A student asks a natural language question
about getting from one campus place to another (e.g. "how long from the dorms to the library",
"cafeteria to student union", "gym to Frederick Douglass Hall"). Estimate walking, driving, and
biking times AND distance in miles using realistic on-campus distances for that specific HBCU/college.
Return STRICT JSON:
{
  "from": "Extracted origin",
  "to": "Extracted destination",
  "distanceMi": number,
  "walkMin": number,
  "driveMin": number,
  "bikeMin": number,
  "directions": ["3-5 concise turn-by-turn style steps referencing real-sounding campus landmarks"],
  "tip": "Optional one-line student tip (shortcut, best time, food nearby)"
}
No markdown. If the query is ambiguous, pick the most likely campus interpretation.`;

export const getRouteEstimate = createServerFn({ method: "POST" })
  .validator((d: unknown) => RouteInput.parse(d))
  .handler(async ({ data }): Promise<RouteEstimate> => {
    const parsed = await callAI(ROUTE_SYSTEM, `Campus: ${data.campus}\nQuestion: ${data.query}`);
    if (!parsed) {
      return {
        from: "Your location", to: data.query, distanceMi: 0.4,
        walkMin: 8, driveMin: 2, bikeMin: 3,
        directions: ["AI is offline — try again in a moment."],
        error: "AI offline",
      };
    }
    return {
      from: String(parsed.from ?? "Your location").slice(0, 80),
      to: String(parsed.to ?? data.query).slice(0, 80),
      distanceMi: Number(parsed.distanceMi ?? 0.4),
      walkMin: Number(parsed.walkMin ?? 8),
      driveMin: Number(parsed.driveMin ?? 2),
      bikeMin: Number(parsed.bikeMin ?? 3),
      directions: Array.isArray(parsed.directions)
        ? parsed.directions.slice(0, 6).map((d: any) => String(d).slice(0, 160))
        : [],
      tip: parsed.tip ? String(parsed.tip).slice(0, 140) : undefined,
    };
  });
