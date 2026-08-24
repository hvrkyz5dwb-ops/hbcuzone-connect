import { createFileRoute } from "@tanstack/react-router";
import { FreeAccessNotice } from "@/components/FreeAccessNotice";

export const Route = createFileRoute("/upgrade")({
  head: () => ({
    meta: [
      { title: "All Features Included — PlugU" },
      { name: "description", content: "Every PlugU feature is free for verified students. No memberships, no subscriptions, no paid boosts." },
      { property: "og:title", content: "All Features Included — PlugU" },
      { property: "og:description", content: "PlugU has no paid memberships. Everything is free for verified students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <FreeAccessNotice title="INCLUDED" />,
});
