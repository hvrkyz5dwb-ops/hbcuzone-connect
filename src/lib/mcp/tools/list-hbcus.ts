import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { schoolProfiles } from "@/lib/hbcus-data";

export default defineTool({
  name: "list_hbcus",
  title: "List HBCUs",
  description:
    "List HBCUs in the PlugU directory. Optionally filter by state (two-letter code like 'GA') or by a case-insensitive keyword matched against school name, city, or mascot.",
  inputSchema: {
    state: z.string().length(2).optional().describe("Two-letter state code, e.g. 'GA'."),
    keyword: z.string().min(1).optional().describe("Case-insensitive substring match on name/city/mascot."),
    limit: z.number().int().min(1).max(50).optional().describe("Max rows (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ state, keyword, limit }) => {
    const cap = limit ?? 20;
    const kw = keyword?.toLowerCase();
    const rows = schoolProfiles
      .filter((s) => (state ? s.state.toUpperCase() === state.toUpperCase() : true))
      .filter((s) =>
        kw
          ? s.name.toLowerCase().includes(kw) ||
            s.city.toLowerCase().includes(kw) ||
            s.mascot.toLowerCase().includes(kw)
          : true,
      )
      .slice(0, cap)
      .map((s) => ({
        name: s.name,
        city: s.city,
        state: s.state,
        type: s.type,
        conference: s.conference,
        mascot: s.mascot,
        founded: s.founded,
        website: s.website,
      }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { schools: rows, count: rows.length },
    };
  },
});