// Promo code server functions. Validation runs through the
// validate_promo_code RPC (security definer) which enforces active
// state, expiry, total redemption caps, and per-account limits.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PromoValidation = {
  valid: boolean;
  message: string;
  code?: string;
  code_id?: string;
  discount_percent?: number;
  applies_to?: string;
};

export const validatePromoCode = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ code: z.string().trim().min(2).max(40) }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.rpc("validate_promo_code", {
      _code: data.code,
      _user_id: context.userId,
    });
    if (error) throw error;
    return result as unknown as PromoValidation;
  });