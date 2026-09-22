import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/referrals")({
  head: () => ({ meta: [
    { title: "PlugU Campus Marketplace" },
    { name: "description", content: "Browse the HBCU student marketplace and campus community." },
    { property: "og:title", content: "PlugU Campus Marketplace" },
    { property: "og:description", content: "Browse the HBCU student marketplace and campus community." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <Navigate to="/" replace />,
});
