import { createFileRoute } from "@tanstack/react-router";
import { FreeAccessNotice } from "@/components/FreeAccessNotice";

// Plan/membership checkout is removed for this release — PlugU sells no
// digital subscriptions. Marketplace checkout for real goods and services
// lives at /checkout/$listingId and is unaffected.
export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Nothing To Pay — PlugU" },
      { name: "description", content: "PlugU has no paid plans. All app features are free for verified students." },
      { property: "og:title", content: "Nothing To Pay — PlugU" },
      { property: "og:description", content: "PlugU sells no memberships or digital upgrades." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <FreeAccessNotice title="INCLUDED" />,
});
