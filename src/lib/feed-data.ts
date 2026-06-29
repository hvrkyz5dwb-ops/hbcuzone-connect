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
  | "product"
  | "announcement"
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
  "Creators",
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
      return posts.filter((p) => p.type === "daily" || p.type === "hbcu" || p.type === "announcement");
    case "Deals":
      return posts.filter((p) => p.type === "drop" || p.type === "product" || p.sponsored);
    case "Creators":
      return posts.filter((p) => p.type === "lifestyle" || p.user.kingpin);
    default:
      return posts;
  }
}

/* ============ Featured creators ============ */

export type Creator = {
  id: string;
  name: string;
  handle: string;
  campus: string;
  emoji: string;
  craft: string;
  followers: string;
  gradient: string;
  kingpin?: boolean;
};

export const featuredCreators: Creator[] = [
  { id: "c1", name: "Fade God",  handle: "@fadegod",  campus: "Howard",  craft: "Barber",   emoji: "💈", followers: "4.2k", kingpin: true,
    gradient: "linear-gradient(135deg,#3a1d12,#7a3a1f 55%,#d49a4a)" },
  { id: "c2", name: "Lash Loft", handle: "@lashloft", campus: "Hampton", craft: "Lashes",   emoji: "👁️", followers: "3.1k",
    gradient: "linear-gradient(135deg,#1a0f2a,#3b1f5a 55%,#a78bfa)" },
  { id: "c3", name: "Plate Plug",handle: "@plateplug",campus: "Spelman", craft: "Chef",     emoji: "🍱", followers: "5.6k", kingpin: true,
    gradient: "linear-gradient(135deg,#1c1a08,#5a4d12 55%,#f1c75b)" },
  { id: "c4", name: "Drip Co.",  handle: "@dripco",   campus: "AUC",     craft: "Fashion",  emoji: "👕", followers: "8.9k",
    gradient: "linear-gradient(135deg,#0e1d2a,#1f4a6e 55%,#7dd3fc)" },
  { id: "c5", name: "Jasmine T.",handle: "@jaztutors",campus: "Howard",  craft: "Tutor",    emoji: "📚", followers: "1.8k",
    gradient: "linear-gradient(135deg,#1a1212,#5a2a2a 55%,#fda4af)" },
  { id: "c6", name: "Campus Rides",handle:"@cmpride", campus: "ATL",     craft: "Driver",   emoji: "🚗", followers: "2.4k",
    gradient: "linear-gradient(135deg,#0a1a14,#16433a 55%,#73ffb8)" },
];

/* ============ School announcements (pinned ticker) ============ */

export type Announcement = {
  id: string;
  campus: string;
  title: string;
  tag: "Alert" | "Notice" | "Win" | "Event";
};

export const announcements: Announcement[] = [
  { id: "a1", campus: "Howard U",  title: "Library open 24/7 through finals week.",        tag: "Notice" },
  { id: "a2", campus: "Spelman",   title: "Homecoming parade route updated — check map.",  tag: "Event" },
  { id: "a3", campus: "Hampton",   title: "Free flu shots at Health Center Thursday.",     tag: "Notice" },
  { id: "a4", campus: "Morehouse", title: "Men of Morehouse raised $40K for scholarships.",tag: "Win" },
  { id: "a5", campus: "FAMU",      title: "Severe weather watch — shuttle service delayed.",tag: "Alert" },
];

/* ============ Extra posts: products + announcements ============ */

feedPosts.push(
  {
    id: "p11",
    type: "product",
    user: { name: "Yard Vintage", campus: "Trending · AUC", verified: true },
    time: "20m",
    caption: "Restocked: vintage HBCU crewnecks. 24 pieces, all sizes. Going fast.",
    media: ["🧥", "👟", "🧢"],
    likes: 982,
    comments: 74,
    vendor: { cta: "Shop", price: "$38", tag: "Trending" },
    scope: "nearby",
  },
  {
    id: "p12",
    type: "announcement",
    user: { name: "Howard Student Affairs", campus: "Official", verified: true },
    time: "30m",
    caption: "Reminder: Spring registration opens Monday 8AM. Holds must be cleared by Friday.",
    media: ["📢"],
    likes: 421,
    comments: 56,
    scope: "campus",
  },
  {
    id: "p13",
    type: "product",
    user: { name: "Sole Plug", campus: "Trending · National", verified: true, kingpin: true },
    time: "1h",
    caption: "Jordan 4 'Bred Reimagined' — 6 pairs left, student price only on PlugU.",
    media: ["👟"],
    likes: 2410,
    comments: 188,
    vendor: { cta: "Shop", price: "$210", tag: "Drop" },
    scope: "national",
  },
);