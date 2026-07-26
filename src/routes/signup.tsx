import { createFileRoute, redirect } from "@tanstack/react-router";

// PlugU has one auth surface — /auth. This legacy route now redirects into
// the create-account tab so any old links keep working.
export const Route = createFileRoute("/signup")({
  beforeLoad: () => {
    throw redirect({ to: "/auth", search: { next: "", mode: "sign-up" } });
  },
});
