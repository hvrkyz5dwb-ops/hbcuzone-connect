import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/ambassadors")({
  head: () => ({ meta: [
    { title: "Campus Community — PlugU" },
    { name: "description", content: "Explore the PlugU HBCU campus community." },
    { property: "og:title", content: "PlugU Campus Community" },
    { property: "og:description", content: "Explore the PlugU HBCU campus community." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <Navigate to="/" replace />,
});
