export type FeedPostType =
  | "lifestyle"
  | "vendor"
  | "drop"
  | "food"
  | "haircut"
  | "beauty"
  | "ride"
  | "event"
  | "scholarship"
  | "hbcu"
  | "daily"
  | "sponsored";

export type FeedPost = {
  id: string;
  type: FeedPostType;
  user: { name: string; campus: string; verified?: boolean; kingpin?: boolean };
  time: string;
  caption: string;
  media: string[]; // emoji/gradient placeholders or image urls
  likes: number;
  comments: number;
  vendor?: { cta: "Shop" | "Book" | "Apply" | "RSVP" | "Ride"; price?: string; tag?: string };
  sponsored?: boolean;
  scope: "campus" | "nearby" | "national";
};

export type Story = {
  id: string;
  label: string;
  group: "campus" | "vendor" | "events" | "hbcu" | "daily" | "plugs";
  emoji: string;
  live?: boolean;
};

export const stories: Story[] = [
  { id: "create", label: "Your Story", group: "campus", emoji: "＋" },
  { id: "s1", label: "Homecoming", group: "events", emoji: "🎉", live: true },
  { id: "s2", label: "Fade God", group: "vendor", emoji: "💈" },
  { id: "s3", label: "Plate Plug", group: "vendor", emoji: "🍱" },
  { id: "s4", label: "Howard", group: "hbcu", emoji: "🏛️" },
  { id: "s5", label: "Spelman", group: "hbcu", emoji: "🌸" },
  { id: "s6", label: "Daily", group: "daily", emoji: "📰" },
  { id: "s7", label: "Lash Bar", group: "vendor", emoji: "👁️" },
  { id: "s8", label: "Yard Party", group: "events", emoji: "🎶", live: true },
  { id: "s9", label: "Top Plugs", group: "plugs", emoji: "👑" },
];

export const feedPosts: FeedPost[] = [
  {
    id: "p1",
    type: "haircut",
    user: { name: "Fade God", campus: "Howard U", verified: true, kingpin: true },
    time: "12m",
    caption: "Fresh fades all weekend. DM to lock your slot before homecoming 💈",
    media: ["💈"],
    likes: 248,
    comments: 31,
    vendor: { cta: "Book", price: "$25", tag: "Haircut" },
    scope: "campus",
  },
  {
    id: "p2",
    type: "daily",
    user: { name: "PlugU Daily", campus: "Today's Brief", verified: true },
    time: "1h",
    caption: "Google BOLD internship apps close Friday — $10.5K/mo + housing.",
    media: ["📰"],
    likes: 1204,
    comments: 88,
    scope: "national",
  },
  {
    id: "p3",
    type: "food",
    user: { name: "Plate Plug", campus: "Spelman", verified: true, kingpin: true },
    time: "2h",
    caption: "Sunday plates dropping in 1 hr — salmon, mac, candied yams. 🔥",
    media: ["🍱", "🍗", "🥘"],
    likes: 412,
    comments: 57,
    vendor: { cta: "Shop", price: "$15", tag: "Plate" },
    scope: "campus",
  },
  {
    id: "p4",
    type: "event",
    user: { name: "AUC Events", campus: "Atlanta", verified: true },
    time: "3h",
    caption: "Yard party tonight. Free entry w/ student ID. Bring the energy.",
    media: ["🎶"],
    likes: 877,
    comments: 142,
    vendor: { cta: "RSVP", tag: "Tonight" },
    scope: "nearby",
  },
  {
    id: "p5",
    type: "sponsored",
    user: { name: "Drip Co.", campus: "Boosted", verified: true },
    time: "Promoted",
    caption: "New campus drop — limited 100 hoodies. Use code PLUGU for 15% off.",
    media: ["👕"],
    likes: 320,
    comments: 24,
    vendor: { cta: "Shop", price: "$45", tag: "Drop" },
    sponsored: true,
    scope: "national",
  },
  {
    id: "p6",
    type: "beauty",
    user: { name: "Lash Loft", campus: "Hampton", verified: true },
    time: "5h",
    caption: "Two slots left Friday. Volume sets $55. Walk you out glowing ✨",
    media: ["👁️"],
    likes: 188,
    comments: 19,
    vendor: { cta: "Book", price: "$55", tag: "Lashes" },
    scope: "campus",
  },
  {
    id: "p7",
    type: "ride",
    user: { name: "Campus Rides", campus: "ATL ↔ ATL", verified: true },
    time: "6h",
    caption: "ATL airport runs all week. $20 flat. Trusted student driver.",
    media: ["🚗"],
    likes: 96,
    comments: 12,
    vendor: { cta: "Ride", price: "$20", tag: "Rides" },
    scope: "nearby",
  },
  {
    id: "p8",
    type: "scholarship",
    user: { name: "PlugU x UNCF", campus: "Opportunity", verified: true },
    time: "8h",
    caption: "$5K HBCU Founders Grant — apply by Oct 30. Open to all majors.",
    media: ["🎓"],
    likes: 612,
    comments: 41,
    vendor: { cta: "Apply", tag: "Scholarship" },
    scope: "national",
  },
  {
    id: "p9",
    type: "lifestyle",
    user: { name: "Jasmine T.", campus: "Howard U '27" },
    time: "10h",
    caption: "First A on a calc midterm 😤 thank you to my tutor on PlugU 🫶",
    media: ["📚"],
    likes: 540,
    comments: 63,
    scope: "campus",
  },
  {
    id: "p10",
    type: "hbcu",
    user: { name: "HBCU Wire", campus: "Network", verified: true },
    time: "12h",
    caption: "Morehouse alum just closed a $40M Series A. We keep eating. 🔥",
    media: ["🏛️"],
    likes: 2104,
    comments: 188,
    scope: "national",
  },
];

export const feedFilters = [
  "For You",
  "My Campus",
  "Nearby",
  "Vendors",
  "Events",
  "HBCUs",
  "News",
  "Deals",
] as const;

export type FeedFilter = (typeof feedFilters)[number];

export function filterPosts(posts: FeedPost[], filter: FeedFilter): FeedPost[] {
  switch (filter) {
    case "For You":
      return posts;
    case "My Campus":
      return posts.filter((p) => p.scope === "campus");
    case "Nearby":
      return posts.filter((p) => p.scope !== "national");
    case "Vendors":
      return posts.filter((p) => !!p.vendor && p.type !== "scholarship");
    case "Events":
      return posts.filter((p) => p.type === "event");
    case "HBCUs":
      return posts.filter((p) => p.type === "hbcu" || p.type === "scholarship");
    case "News":
      return posts.filter((p) => p.type === "daily" || p.type === "hbcu");
    case "Deals":
      return posts.filter((p) => p.type === "drop" || p.sponsored);
    default:
      return posts;
  }
}