import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/awards")({
  head: () => ({ meta: [
    { title: "Student Opportunities — PlugU" },
    { name: "description", content: "Explore current HBCU student opportunities on PlugU." },
    { property: "og:title", content: "PlugU Student Opportunities" },
    { property: "og:description", content: "Explore current HBCU student opportunities on PlugU." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <Navigate to="/hub" replace />,
});
