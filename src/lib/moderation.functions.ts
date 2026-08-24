import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { screenContent } from "@/lib/content-filter";

/**
 * Server-side pre-publication screening. Every user generated text passes
 * through here before it is written: posts, listings, comments, reviews,
 * messages, bios, events, usernames and service descriptions. Rejected
 * content is recorded in the admin moderation queue so a human can review
 * the decision. The caller is identified from the verified bearer token.
 */
export const screenUserContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z
      .object({
        contentType: z.string().trim().min(1).max(40),
        contentId: z.string().trim().max(120).optional(),
        text: z.string().max(20000),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const result = screenContent(data.text);
    if (result.ok) return { ok: true as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await (supabaseAdmin as any).from("moderation_queue").insert({
      content_type: data.contentType,
      content_id: data.contentId ?? null,
      author_user_id: context.userId,
      content_text: data.text.slice(0, 4000),
      category: result.category,
      decision: "rejected",
      status: "open",
    });

    return { ok: false as const, category: result.category, reason: result.reason };
  });
