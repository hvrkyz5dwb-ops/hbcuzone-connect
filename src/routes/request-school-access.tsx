import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RequestSchoolAccess } from "@/components/RequestSchoolAccess";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/request-school-access")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Request school access — PlugU" },
      { name: "description", content: "Ask the PlugU team to add your college so you can get verified." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth", search: { next: "/request-school-access", mode: "" } });
  },
  component: Page,
});

function Page() {
  return (
    <AppShell title="School Access">
      <section className="px-5 pt-5 max-w-lg">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <h1 className="mt-3 text-2xl font-bold">Add your school to PlugU</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          PlugU only unlocks fully once your school's email domain is verified. If yours isn't on file yet, request it here.
        </p>
        <div className="mt-5">
          <RequestSchoolAccess />
        </div>
      </section>
    </AppShell>
  );
}