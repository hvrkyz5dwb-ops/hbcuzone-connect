import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/economy")({
  head: () => ({ meta: [
    { title: "HBCU Marketplace — PlugU" },
    { name: "description", content: "Browse complete listings from HBCU student sellers." },
    { property: "og:title", content: "PlugU HBCU Marketplace" },
    { property: "og:description", content: "Browse complete listings from HBCU student sellers." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <Navigate to="/market" replace />,
});
