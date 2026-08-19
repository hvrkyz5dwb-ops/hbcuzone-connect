import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({ question: z.string().min(2).max(500) });

export const askPlugU = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { gatherContext, runPlugUAI } = await import("./plugai.server");
    const { data: profile } = await context.supabase
      .from("profiles").select("school_id").eq("id", context.userId).maybeSingle();
    const hits = await gatherContext(context.supabase as any, data.question, (profile?.school_id as string) ?? null);
    return runPlugUAI(data.question, hits);
  });
