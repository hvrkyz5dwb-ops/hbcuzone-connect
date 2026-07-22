import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { scholarshipsList, scholarshipCategories } from "@/lib/hbcus-data";

export default defineTool({
  name: "list_scholarships",
  title: "List scholarships",
  description:
    "List PlugU-tracked scholarship opportunities. Optionally filter by category (e.g. 'STEM', 'National', 'Merit-Based') or by a keyword matched against title/sponsor.",
  inputSchema: {
    category: z
      .string()
      .optional()
      .describe(`Optional category. One of: ${scholarshipCategories.join(", ")}`),
    keyword: z.string().min(1).optional().describe("Case-insensitive substring match on title/sponsor."),
    limit: z.number().int().min(1).max(50).optional().describe("Max rows (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category, keyword, limit }) => {
    const cap = limit ?? 20;
    const kw = keyword?.toLowerCase();
    const cat = category?.toLowerCase();
    const rows = (scholarshipsList as ReadonlyArray<Record<string, unknown>>)
      .filter((s) => (cat ? String(s.category ?? "").toLowerCase() === cat : true))
      .filter((s) =>
        kw
          ? String(s.title ?? "").toLowerCase().includes(kw) ||
            String(s.sponsor ?? "").toLowerCase().includes(kw)
          : true,
      )
      .slice(0, cap);
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { scholarships: rows, count: rows.length },
    };
  },
});