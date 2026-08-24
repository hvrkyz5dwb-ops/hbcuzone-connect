// Single entry point every publish path uses. The client rule set gives the
// student instant feedback; the server call is the authoritative decision and
// records rejected content in the admin moderation queue.
import { assertContentAllowed } from "@/lib/content-filter";
import { screenUserContent } from "@/lib/moderation.functions";

export async function screenBeforePublish(
  contentType: string,
  text: string,
  contentId?: string,
) {
  const value = (text ?? "").trim();
  if (!value) return;
  assertContentAllowed(value);
  const res = await screenUserContent({ data: { contentType, text: value, contentId } });
  if (!res.ok) {
    const err = new Error(res.reason);
    (err as Error & { category?: string }).category = res.category;
    throw err;
  }
}
