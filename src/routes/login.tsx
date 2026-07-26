import { createFileRoute, redirect } from "@tanstack/react-router";

// PlugU has one auth surface — /auth. This legacy route routes returning
// students straight into the sign-in tab.
export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    throw redirect({ to: "/auth", search: { next: "", mode: "" } });
  },
});