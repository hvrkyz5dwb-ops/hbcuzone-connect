import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/business")({
  head: () => ({ meta: [
    { title: "Seller Tools — PlugU" },
    { name: "description", content: "Manage student marketplace listings and seller activity on PlugU." },
    { property: "og:title", content: "PlugU Seller Tools" },
    { property: "og:description", content: "Manage student marketplace listings and seller activity on PlugU." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <Navigate to="/seller" replace />,
});
