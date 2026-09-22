// Real-network data feeds for the HBCUS hub.
// Weather  -> Open-Meteo (live observations + forecast, no key)
// News     -> Google News RSS (real headlines, real outlets, real links)
// Sports   -> ESPN public scoreboard API (real scores, records, broadcasts)
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const UA = { "User-Agent": "Mozilla/5.0 (compatible; PlugU/1.0)" };

async function getJson(url: string, ms = 8000): Promise<any | null> {
  try {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(ms) });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

async function getText(url: string, ms = 8000): Promise<string | null> {
  try {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(ms) });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

/* ============================ WEATHER ============================ */

export type LiveWeather = {
  tempF: number;
  high: number;
  low: number;
  condition: string;
  emoji: string;
  windMph: number;
  humidity: number;
  precipChance: number;
  blurb: string;
  campus: string;
  place: string;
  source: string;
  observedAt: string;
  error?: string;
};

const WMO: Record<number, [string, string]> = {
  0: ["Clear", "☀️"], 1: ["Mostly Clear", "🌤️"], 2: ["Partly Cloudy", "⛅"], 3: ["Cloudy", "☁️"],
  45: ["Fog", "🌫️"], 48: ["Freezing Fog", "🌫️"],
  51: ["Light Drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Heavy Drizzle", "🌦️"],
  61: ["Light Rain", "🌧️"], 63: ["Rain", "🌧️"], 65: ["Heavy Rain", "🌧️"],
  66: ["Freezing Rain", "🌧️"], 67: ["Freezing Rain", "🌧️"],
  71: ["Light Snow", "🌨️"], 73: ["Snow", "🌨️"], 75: ["Heavy Snow", "❄️"], 77: ["Snow Grains", "🌨️"],
  80: ["Showers", "🌦️"], 81: ["Showers", "🌦️"], 82: ["Heavy Showers", "⛈️"],
  85: ["Snow Showers", "🌨️"], 86: ["Snow Showers", "🌨️"],
  95: ["Thunderstorms", "⛈️"], 96: ["Thunderstorms", "⛈️"], 99: ["Thunderstorms", "⛈️"],
};

function vibe(code: number, t: number): string {
  if (code >= 95) return "Storms rolling through — stay inside";
  if (code >= 71 && code <= 86) return "Bundle up, it's coming down";
  if (code >= 51) return "Grab an umbrella before the Yard";
  if (t >= 88) return "Hot one — hydrate on the Yard";
  if (t <= 40) return "Cold on the Yard — layer up";
  if (t >= 68) return "Perfect for the Yard";
  return "Light jacket kind of day";
}

const WeatherInput = z.object({
  school: z.string().min(2).max(160),
  city: z.string().max(80).optional(),
  state: z.string().max(40).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const getLiveWeather = createServerFn({ method: "POST" })
  .validator((d: unknown) => WeatherInput.parse(d))
  .handler(async ({ data }): Promise<LiveWeather> => {
    let lat = data.lat;
    let lng = data.lng;
    let place = [data.city, data.state].filter(Boolean).join(", ");

    if (lat == null || lng == null) {
      const q = encodeURIComponent(data.city ? `${data.city}${data.state ? " " + data.state : ""}` : data.school);
      const geo = await getJson(`https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=en&format=json`);
      const hit = geo?.results?.[0];
      if (hit) {
        lat = hit.latitude;
        lng = hit.longitude;
        place = [hit.name, hit.admin1].filter(Boolean).join(", ");
      }
    }

    if (lat == null || lng == null) {
      return {
        tempF: 0, high: 0, low: 0, condition: "Unavailable", emoji: "🌡️", windMph: 0, humidity: 0,
        precipChance: 0, blurb: "Live weather unavailable", campus: data.school, place: place || data.school,
        source: "Open-Meteo", observedAt: new Date().toISOString(), error: "no-location",
      };
    }

    const wx = await getJson(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=1`,
    );

    if (!wx?.current) {
      return {
        tempF: 0, high: 0, low: 0, condition: "Unavailable", emoji: "🌡️", windMph: 0, humidity: 0,
        precipChance: 0, blurb: "Live weather unavailable", campus: data.school, place: place || data.school,
        source: "Open-Meteo", observedAt: new Date().toISOString(), error: "offline",
      };
    }

    const code = Number(wx.current.weather_code ?? 0);
    const [condition, emoji] = WMO[code] ?? ["Clear", "🌤️"];
    const tempF = Math.round(Number(wx.current.temperature_2m));
    return {
      tempF,
      high: Math.round(Number(wx.daily?.temperature_2m_max?.[0] ?? tempF)),
      low: Math.round(Number(wx.daily?.temperature_2m_min?.[0] ?? tempF)),
      condition,
      emoji,
      windMph: Math.round(Number(wx.current.wind_speed_10m ?? 0)),
      humidity: Math.round(Number(wx.current.relative_humidity_2m ?? 0)),
      precipChance: Math.round(Number(wx.daily?.precipitation_probability_max?.[0] ?? 0)),
      blurb: vibe(code, tempF),
      campus: data.school,
      place: place || data.school,
      source: "Open-Meteo",
      observedAt: String(wx.current.time ?? new Date().toISOString()),
    };
  });

/* ============================== NEWS ============================== */

export type LiveNewsItem = {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  time: string;
  tag: string;
  emoji: string;
};

export type LiveNewsResult = { items: LiveNewsItem[]; query: string; fetchedAt: string; error?: string };

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function ago(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "now";
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${Math.max(1, m)}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const NEWS_TOPICS: Record<string, { q: string; tag: string; emoji: string }> = {
  Students: { q: "college students campus life university", tag: "Students", emoji: "🎓" },
  HBCUs: { q: "HBCU", tag: "HBCU", emoji: "🎓" },
  "All HBCUs": { q: "HBCU", tag: "HBCU", emoji: "🎓" },
  Campus: { q: "college campus students news", tag: "Campus", emoji: "🏫" },
  Sports: { q: "college football OR basketball students", tag: "Sports", emoji: "🏈" },
  Culture: { q: "college culture homecoming band students", tag: "Culture", emoji: "🎺" },
  Money: { q: "college tuition OR scholarship OR financial aid", tag: "Money", emoji: "💰" },
  Policy: { q: "higher education policy Congress students", tag: "Policy", emoji: "🏛️" },
  Business: { q: "student entrepreneurship small business", tag: "Business", emoji: "💼" },
  Careers: { q: "college internship OR hiring OR career fair", tag: "Careers", emoji: "🚀" },
  Greek: { q: "fraternity sorority Divine Nine college", tag: "Greek", emoji: "🔱" },
};

const NewsInput = z.object({
  topic: z.string().max(60).optional(),
  school: z.string().max(160).optional(),
  count: z.number().int().min(1).max(20).optional(),
});

export const getLiveNews = createServerFn({ method: "POST" })
  .validator((d: unknown) => NewsInput.parse(d))
  .handler(async ({ data }): Promise<LiveNewsResult> => {
    const topic = NEWS_TOPICS[data.topic ?? "Students"] ?? NEWS_TOPICS["Students"]!;
    const query = data.school ? `"${data.school}" ${topic.q}` : topic.q;
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const xml = await getText(url);
    const fetchedAt = new Date().toISOString();

    if (!xml) return { items: [], query, fetchedAt, error: "offline" };

    const blocks = xml.split("<item>").slice(1);
    const items: LiveNewsItem[] = [];
    for (const b of blocks.slice(0, data.count ?? 12)) {
      const pick = (tag: string) => {
        const m = b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
        return m ? decode(m[1]) : "";
      };
      const rawTitle = pick("title");
      const link = pick("link");
      if (!rawTitle || !link) continue;
      const pub = pick("pubDate");
      const iso = pub ? new Date(pub).toISOString() : fetchedAt;
      const source = pick("source") || "Google News";
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      let headline = rawTitle.trim();
      const srcNorm = norm(source);
      for (let i = headline.length; i > 20; i--) {
        const at = headline.lastIndexOf(" - ", i);
        if (at <= 20) break;
        const tail = norm(headline.slice(at + 3));
        if (tail && srcNorm && (srcNorm.startsWith(tail.slice(0, 8)) || tail.startsWith(srcNorm.slice(0, 8)))) {
          headline = headline.slice(0, at).trim();
          break;
        }
        i = at;
      }
      const plain = decode(pick("description"))
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;?/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const desc = norm(plain).startsWith(norm(headline).slice(0, 40)) ? "" : plain;
      items.push({
        id: link,
        headline,
        summary: desc.slice(0, 200),
        source,
        url: link,
        publishedAt: iso,
        time: ago(iso),
        tag: topic.tag,
        emoji: topic.emoji,
      });
    }
    return { items, query, fetchedAt };
  });

/* ============================= SPORTS ============================= */

export type LiveGame = {
  id: string;
  sport: string;
  league: string;
  state: "in" | "pre" | "post";
  status: string;
  startsAt: string;
  home: { name: string; short: string; score: number; logo?: string; record?: string; hbcu: boolean };
  away: { name: string; short: string; score: number; logo?: string; record?: string; hbcu: boolean };
  broadcast?: string;
  venue?: string;
  link?: string;
};

export type LiveSportsResult = {
  live: LiveGame[];
  upcoming: LiveGame[];
  final: LiveGame[];
  fetchedAt: string;
  source: string;
  error?: string;
};

// D1 HBCU athletic programs (SWAC, MEAC, plus independents).
const HBCU_TEAMS = [
  "Alabama A&M", "Alabama State", "Alcorn State", "Arkansas-Pine Bluff", "Bethune-Cookman",
  "Coppin State", "Delaware State", "Florida A&M", "Grambling", "Hampton", "Howard",
  "Jackson State", "Maryland-Eastern Shore", "Mississippi Valley State", "Morgan State",
  "Norfolk State", "North Carolina A&T", "North Carolina Central", "Prairie View",
  "South Carolina State", "Southern", "Tennessee State", "Texas Southern",
];

function isHbcu(name: string): boolean {
  const n = name.toLowerCase();
  return HBCU_TEAMS.some((t) => n.includes(t.toLowerCase()));
}

function mapEvent(e: any, sport: string, league: string): LiveGame | null {
  const c = e?.competitions?.[0];
  if (!c) return null;
  const side = (t: any) => ({
    name: String(t?.team?.displayName ?? t?.team?.name ?? "TBD"),
    short: String(t?.team?.abbreviation ?? t?.team?.shortDisplayName ?? ""),
    score: Number(t?.score ?? 0),
    logo: t?.team?.logo as string | undefined,
    record: t?.records?.[0]?.summary as string | undefined,
    hbcu: isHbcu(String(t?.team?.displayName ?? "")),
  });
  const home = c.competitors?.find((t: any) => t.homeAway === "home");
  const away = c.competitors?.find((t: any) => t.homeAway === "away");
  if (!home || !away) return null;
  const st = e.status?.type ?? {};
  return {
    id: String(e.id),
    sport,
    league,
    state: (st.state === "in" ? "in" : st.state === "post" ? "post" : "pre") as LiveGame["state"],
    status: String(st.shortDetail ?? st.description ?? ""),
    startsAt: String(e.date ?? ""),
    home: side(home),
    away: side(away),
    broadcast: c.broadcasts?.[0]?.names?.[0],
    venue: c.venue?.fullName,
    link: e.links?.[0]?.href,
  };
}

const SPORT_FEEDS: { sport: string; league: string; url: string }[] = [
  {
    sport: "Football",
    league: "FCS",
    url: "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?groups=81&limit=200",
  },
  {
    sport: "Men's Basketball",
    league: "NCAAM",
    url: "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=50&limit=300",
  },
  {
    sport: "Women's Basketball",
    league: "NCAAW",
    url: "https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/scoreboard?groups=50&limit=300",
  },
];

export const getHbcuSports = createServerFn({ method: "GET" }).handler(async (): Promise<LiveSportsResult> => {
  const fetchedAt = new Date().toISOString();
  const feeds = await Promise.all(SPORT_FEEDS.map((f) => getJson(f.url, 9000)));
  const games: LiveGame[] = [];

  feeds.forEach((d, i) => {
    const f = SPORT_FEEDS[i];
    for (const e of d?.events ?? []) {
      const g = mapEvent(e, f.sport, f.league);
      if (g && (g.home.hbcu || g.away.hbcu)) games.push(g);
    }
  });

  if (!games.length && feeds.every((f) => !f)) {
    return { live: [], upcoming: [], final: [], fetchedAt, source: "ESPN", error: "offline" };
  }

  const byTime = (a: LiveGame, b: LiveGame) => +new Date(a.startsAt) - +new Date(b.startsAt);
  return {
    live: games.filter((g) => g.state === "in").sort(byTime),
    upcoming: games.filter((g) => g.state === "pre").sort(byTime),
    final: games.filter((g) => g.state === "post").sort((a, b) => byTime(b, a)),
    fetchedAt,
    source: "ESPN",
  };
});
