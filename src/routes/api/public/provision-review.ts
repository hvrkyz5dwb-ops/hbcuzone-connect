// TEMPORARY provisioning endpoint — removed immediately after use.
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/provision-review")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { email, password } = (await request.json()) as {
          email: string;
          password: string;
        };
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // School row for the demo account.
        const domain = email.split("@")[1];
        await supabaseAdmin
          .from("schools")
          .upsert(
            { name: "Demo University", domain, type: "university", is_active: true },
            { onConflict: "domain" },
          );
        const { data: school } = await supabaseAdmin
          .from("schools")
          .select("id")
          .eq("domain", domain)
          .maybeSingle();

        // Find or create the auth user, pre-confirmed.
        let userId: string | null = null;
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            account_type: "student",
            full_name: "PlugU App Review",
            school_name: "Demo University",
            school_domain: domain,
            year: "Senior",
            major: "Business",
            is_hbcu_student: false,
            terms_accepted: "true",
          },
        });
        if (created?.user) userId = created.user.id;
        if (!userId) {
          const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
          const found = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
          if (!found) {
            return Response.json({ ok: false, error: createErr?.message ?? "not found" }, { status: 400 });
          }
          userId = found.id;
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
          });
        }

        const now = new Date().toISOString();
        await supabaseAdmin.from("profiles").upsert(
          {
            id: userId,
            email,
            full_name: "PlugU App Review",
            display_name: "App Review",
            username: "appreview",
            school_name: "Demo University",
            school_domain: domain,
            school_id: school?.id ?? null,
            year: "Senior",
            major: "Business",
            bio: "Demo account for App Review.",
            status: "student",
            account_type: "student",
            verification_status: "verified",
            is_suspended: false,
            onboarding_completed_at: now,
            terms_accepted_at: now,
          },
          { onConflict: "id" },
        );

        await supabaseAdmin
          .from("policy_acceptances")
          .upsert(
            { user_id: userId, policy_version: "2026-01-plugu-v1" },
            { onConflict: "user_id,policy_version", ignoreDuplicates: true },
          );

        return Response.json({ ok: true, userId });
      },
    },
  },
});
