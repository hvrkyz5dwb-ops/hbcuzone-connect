import { createFileRoute } from "@tanstack/react-router";
import { FreeAccessNotice } from "@/components/FreeAccessNotice";

export const Route = createFileRoute("/plug-reach")({
  head: () => ({
    meta: [
      { title: "Reach Is Free — PlugU" },
      { name: "description", content: "PlugU no longer sells paid visibility packages. Reach on campus is earned through reviews, response time and PlugScore." },
      { property: "og:title", content: "Reach Is Free — PlugU" },
      { property: "og:description", content: "No paid boosts. Every student gets the same reach tools for free." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <FreeAccessNotice title="REACH IS FREE" />,
});
