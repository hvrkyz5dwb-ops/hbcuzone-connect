import { createFileRoute, redirect } from "@tanstack/react-router";

// PlugU has one entry point: /signup. The "checklist" signup handles both
// new students and returning students (find-or-create). This route stays
// only to redirect legacy links to the new flow.
export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    throw redirect({ to: "/signup" });
  },
});