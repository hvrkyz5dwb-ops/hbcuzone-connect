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

/* ============ Demo content — realistic seeded posts ============ */
/* Categories: selfies, campus photos, hair, food, photographers, roommate,
   party flyers, dorm sales, used textbooks, scholarships, memes, internships */
feedPosts.push(
  { id: "p14", type: "lifestyle", user: { name: "Maya R.", campus: "Howard U '26" }, time: "5m",
    caption: "First day fit check 🤎 syllabus week is undefeated",
    media: ["🤳", "💅", "👜"], likes: 412, comments: 28, scope: "campus" },
  { id: "p15", type: "lifestyle", user: { name: "Tré", campus: "Morehouse '25", kingpin: true }, time: "18m",
    caption: "Sunset on the yard hits different. Shot on iPhone, edited on PlugU 📸",
    media: ["🌇", "🏛️", "🌳"], likes: 1820, comments: 96, scope: "campus" },
  { id: "p16", type: "haircut", user: { name: "Cut Different", campus: "FAMU", verified: true }, time: "42m",
    caption: "Walk-ins open till 9. Tapers $20, full cut + line $30. Tag a friend who needs it 💈",
    media: ["💈", "✂️", "🪒"], likes: 367, comments: 41, vendor: { cta: "Book", price: "$20+", tag: "Barber" }, scope: "campus" },
  { id: "p17", type: "beauty", user: { name: "Braids by Niya", campus: "Spelman", verified: true, kingpin: true }, time: "1h",
    caption: "Knotless special this weekend — $140, hair included. 4 slots only.",
    media: ["💇🏾‍♀️", "✨"], likes: 904, comments: 73, vendor: { cta: "Book", price: "$140", tag: "Braids" }, scope: "campus" },
  { id: "p18", type: "food", user: { name: "Auntie's Plates", campus: "Hampton", verified: true }, time: "1h",
    caption: "Friday menu: oxtails, mac, collards, cornbread. $18 plate, $5 delivery to dorms.",
    media: ["🍛", "🌽", "🥧"], likes: 1240, comments: 156, vendor: { cta: "Shop", price: "$18", tag: "Plate" }, scope: "campus" },
  { id: "p19", type: "food", user: { name: "Late Night Wings", campus: "Clark Atlanta" }, time: "2h",
    caption: "10 wings + fries + drink — $12 till 2am. We deliver to the AUC.",
    media: ["🍗", "🍟", "🥤"], likes: 688, comments: 92, vendor: { cta: "Shop", price: "$12", tag: "Late Night" }, scope: "nearby" },
  { id: "p20", type: "vendor", user: { name: "Lens by Kam", campus: "Howard U", verified: true, kingpin: true }, time: "2h",
    caption: "Senior portraits season is here. $125 for 30 min, 15 edits. Booking thru November.",
    media: ["📸", "🎞️", "🖼️"], likes: 1456, comments: 84, vendor: { cta: "Book", price: "$125", tag: "Photos" }, scope: "campus" },
  { id: "p21", type: "vendor", user: { name: "Shot by Sav", campus: "Spelman", verified: true }, time: "3h",
    caption: "Couples + grad shoots open. Free location scouting on the AUC yard.",
    media: ["📷", "💑"], likes: 521, comments: 38, vendor: { cta: "Book", price: "$95", tag: "Photographer" }, scope: "nearby" },
  { id: "p22", type: "lifestyle", user: { name: "Jordan B.", campus: "FAMU '27" }, time: "3h",
    caption: "🆘 Need 1 roommate for spring. Off-campus, $650/mo, w/d in unit. DM serious only.",
    media: ["🏠", "🛏️", "🛋️"], likes: 189, comments: 47, scope: "campus" },
  { id: "p23", type: "lifestyle", user: { name: "Asia K.", campus: "Howard U '26" }, time: "4h",
    caption: "Looking for a roommate at The Towers next semester — clean, quiet, no smoking 🌸",
    media: ["🏢", "🧹"], likes: 142, comments: 33, scope: "campus" },
  { id: "p24", type: "event", user: { name: "Kappa Alpha Psi · Beta", campus: "Tonight · AUC", verified: true }, time: "4h",
    caption: "KRIMSON & KREAM — Saturday 10PM at The Loft. $15 presale, $20 door. Dress to impress.",
    media: ["🎉", "🥂", "🎶"], likes: 2180, comments: 312, vendor: { cta: "RSVP", price: "$15", tag: "Party" }, scope: "nearby" },
  { id: "p25", type: "event", user: { name: "AKA · Alpha Chapter", campus: "Howard U", verified: true }, time: "5h",
    caption: "Pretty in Pink Day Party 💗 Sunday 3PM, free with student ID.",
    media: ["💗", "🎀", "🍾"], likes: 1450, comments: 198, vendor: { cta: "RSVP", tag: "Day Party" }, scope: "campus" },
  { id: "p26", type: "product", user: { name: "Imani W.", campus: "Spelman '25" }, time: "5h",
    caption: "Mini fridge + microwave combo — $60. Moving out, must go this week.",
    media: ["🧊", "🍱"], likes: 76, comments: 18, vendor: { cta: "Shop", price: "$60", tag: "Dorm Sale" }, scope: "campus" },
  { id: "p27", type: "product", user: { name: "Devon C.", campus: "Morehouse '26" }, time: "6h",
    caption: "Selling: queen bedding set ($25), desk lamp ($10), Keurig ($30). Pickup near campus.",
    media: ["🛏️", "💡", "☕"], likes: 54, comments: 22, vendor: { cta: "Shop", price: "$10+", tag: "Dorm Sale" }, scope: "campus" },
  { id: "p28", type: "product", user: { name: "Kayla M.", campus: "Hampton '25" }, time: "7h",
    caption: "Bio 220 textbook (10th ed) — $40 obo. Highlighted but clean. Saved me $200 from bookstore.",
    media: ["📘"], likes: 38, comments: 9, vendor: { cta: "Shop", price: "$40", tag: "Textbook" }, scope: "campus" },
  { id: "p29", type: "product", user: { name: "Marcus T.", campus: "FAMU '24" }, time: "8h",
    caption: "Org Chem + Calc II textbooks bundle — $55 for both. Less than 50% bookstore price.",
    media: ["📚", "📕", "📗"], likes: 62, comments: 14, vendor: { cta: "Shop", price: "$55", tag: "Textbooks" }, scope: "campus" },
  { id: "p30", type: "scholarship", user: { name: "Tom Joyner Foundation", campus: "Opportunity", verified: true }, time: "9h",
    caption: "$10K scholarship for HBCU upperclassmen. 3.0+ GPA. Deadline: November 15.",
    media: ["🎓", "💰"], likes: 1820, comments: 142, vendor: { cta: "Apply", tag: "Scholarship" }, scope: "national" },
  { id: "p31", type: "scholarship", user: { name: "Coca-Cola Scholars", campus: "Opportunity", verified: true }, time: "10h",
    caption: "$20K + leadership network. Apply by Oct 31 — only 150 selected nationally.",
    media: ["🥤", "🏆"], likes: 1320, comments: 88, vendor: { cta: "Apply", tag: "Scholarship" }, scope: "national" },
  { id: "p32", type: "lifestyle", user: { name: "Campus Memes ATL", campus: "AUC", kingpin: true }, time: "11h",
    caption: "When the prof says 'check the syllabus' for the 4th time today 😭",
    media: ["😭", "📑", "💀"], likes: 5240, comments: 412, scope: "nearby" },
  { id: "p33", type: "lifestyle", user: { name: "HBCU Memes", campus: "Network", verified: true }, time: "12h",
    caption: "POV: it's 8AM, you missed the shuttle, and the yard is two miles long 🚶🏾‍♂️💨",
    media: ["🚶🏾‍♂️", "⏰", "🚌"], likes: 3890, comments: 287, scope: "national" },
  { id: "p34", type: "scholarship", user: { name: "Goldman Sachs", campus: "Internship", verified: true }, time: "13h",
    caption: "Summer 2026 Analyst program — applications open. HBCU pipeline priority review.",
    media: ["💼", "🏦"], likes: 2104, comments: 168, vendor: { cta: "Apply", tag: "Internship" }, scope: "national" },
  { id: "p35", type: "scholarship", user: { name: "Microsoft Explore", campus: "Internship", verified: true }, time: "14h",
    caption: "12-week paid internship for freshmen + sophomores. Housing covered. Apps close Nov 1.",
    media: ["💻", "🪟"], likes: 1788, comments: 134, vendor: { cta: "Apply", tag: "Internship" }, scope: "national" },
  { id: "p36", type: "vendor", user: { name: "Nails by Zee", campus: "Spelman", verified: true }, time: "15h",
    caption: "Gel-X set $55, designs +$10. Slots Thurs–Sat. I come to the dorm 💅🏾",
    media: ["💅🏾", "✨"], likes: 612, comments: 58, vendor: { cta: "Book", price: "$55", tag: "Nails" }, scope: "campus" },
);