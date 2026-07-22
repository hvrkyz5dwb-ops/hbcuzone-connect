import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { schoolProfiles, getSchoolDetail } from "@/lib/hbcus-data";

export default defineTool({
  name: "get_school_info",
  title: "Get school info",
  description:
    "Return the full PlugU profile for one HBCU: directory row plus about/legacy, colors, notable alumni, and Greek life when available.",
  inputSchema: {
    name: z.string().min(2).describe("Full school name, e.g. 'Howard University'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ name }) => {
    const profile = schoolProfiles.find(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    );
    if (!profile) {
      return {
        content: [{ type: "text", text: `No HBCU named "${name}" in the PlugU directory.` }],
        isError: true,
      };
    }
    const detail = getSchoolDetail(profile.name) ?? null;
    const payload = { profile, detail };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});