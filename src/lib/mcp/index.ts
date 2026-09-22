import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoamiTool from "./tools/whoami";
import listHbcusTool from "./tools/list-hbcus";
import getSchoolInfoTool from "./tools/get-school-info";

// The direct Supabase host is the OAuth issuer. VITE_SUPABASE_PROJECT_ID is
// inlined by Vite at build time; the fallback keeps the URL well-formed during
// the throwaway manifest-extract eval and a token never verifies against it.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "plugu-mcp",
  title: "PlugU",
  version: "0.1.0",
  instructions:
    "Tools for the PlugU HBCU campus marketplace. Use `whoami` to confirm the signed-in student, `list_hbcus` and `get_school_info` to explore the HBCU directory.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoamiTool, listHbcusTool, getSchoolInfoTool],
});