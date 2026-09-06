// Server-only helper: pulls real, live headlines from the Google News wire so
// the AI feeds can be grounded in stories that actually exist right now
// instead of inventing them.

export type WireItem = {
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
};

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

async function getText(url: string, ms = 8000): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    const r = await fetch(url, { signal: ctrl.signal, headers: { "user-agent": "PlugU/1.0" } });
    clearTimeout(t);
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

/** Fetch up to `count` real headlines matching a free-text query. */
export async function fetchWire(query: string, count = 12): Promise<WireItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const xml = await getText(url);
  if (!xml) return [];
  const out: WireItem[] = [];
  for (const b of xml.split("<item>").slice(1, count + 1)) {
    const pick = (tag: string) => {
      const m = b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return m ? decode(m[1]) : "";
    };
    const title = pick("title").trim();
    const link = pick("link").trim();
    if (!title || !link) continue;
    const pub = pick("pubDate");
    out.push({
      headline: title,
      summary: decode(pick("description")).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240),
      source: pick("source") || "Google News",
      url: link,
      publishedAt: pub ? new Date(pub).toISOString() : new Date().toISOString(),
    });
  }
  return out;
}
