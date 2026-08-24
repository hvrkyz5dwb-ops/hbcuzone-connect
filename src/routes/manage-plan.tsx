import { createFileRoute } from "@tanstack/react-router";
import { FreeAccessNotice } from "@/components/FreeAccessNotice";

export const Route = createFileRoute("/manage-plan")({
  head: () => ({
    meta: [
      { title: "Your Account Is Free — PlugU" },
      { name: "description", content: "PlugU has no paid plans to manage. Every feature is free for verified students." },
      { property: "og:title", content: "Your Account Is Free — PlugU" },
      { property: "og:description", content: "There are no PlugU subscriptions or memberships to manage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <FreeAccessNotice title="YOUR ACCOUNT" />,
});
