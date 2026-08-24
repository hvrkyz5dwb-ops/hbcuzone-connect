import { createFileRoute } from "@tanstack/react-router";
import { FreeAccessNotice } from "@/components/FreeAccessNotice";

export const Route = createFileRoute("/seller/plans")({
  head: () => ({
    meta: [
      { title: "Selling On PlugU Is Free — PlugU" },
      { name: "description", content: "There are no seller memberships on PlugU. Listings, services, bookings and analytics are free." },
      { property: "og:title", content: "Selling On PlugU Is Free" },
      { property: "og:description", content: "No seller tiers, no subscriptions — every selling tool is included." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <FreeAccessNotice title="SELLING IS FREE" />,
});
