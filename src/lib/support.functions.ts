import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  category: z.string().trim().min(1).max(60),
  subject: z.string().trim().min(1, "Add a subject").max(200),
  message: z.string().trim().min(10, "Tell us a bit more").max(5000),
});

/** Public support form. Works without an account (App Review 1.5). */
export const submitPublicSupportMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await (supabaseAdmin as any)
      .from("public_support_messages")
      .insert({
        name: data.name,
        email: data.email.toLowerCase(),
        category: data.category,
        subject: data.subject,
        message: data.message,
        status: "open",
      })
      .select("ticket_code")
      .single();
    if (error) throw new Error("We couldn't send that right now. Please email plugusupport@gmail.com.");
    return { ok: true as const, ticketCode: (row?.ticket_code as string | null) ?? null };
  });

