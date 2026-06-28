import hoodieImg from "@/assets/listing-hoodie.jpg";

export const categories = [
  { key: "hair", label: "Hair", emoji: "💈" },
  { key: "nails", label: "Nails", emoji: "💅" },
  { key: "clothing", label: "Clothing", emoji: "👕" },
  { key: "food", label: "Food", emoji: "🍔" },
  { key: "rides", label: "Rides", emoji: "🚗" },
  { key: "tutoring", label: "Tutoring", emoji: "📚" },
  { key: "photo", label: "Photo", emoji: "📸" },
  { key: "studio", label: "Studio", emoji: "🎙️" },
];

export type Listing = {
  id: string;
  title: string;
  price: string;
  category: string;
  seller: string;
  campus: string;
  rating: number;
  image: string;
  saved?: boolean;
};

export const listings: Listing[] = [
  { id: "1", title: "STAYDOWN Hoodie — New Drop", price: "$40", category: "Clothing", seller: "Drip Locker", campus: "Talladega College", rating: 4.7, image: hoodieImg },
  { id: "2", title: "Fresh Fade — Walk-ins Welcome", price: "$25", category: "Hair", seller: "Fade God", campus: "Talladega College", rating: 4.9, image: hoodieImg },
  { id: "3", title: "Acrylic Full Set", price: "$55", category: "Nails", seller: "Luxe Nails", campus: "Spelman", rating: 4.8, image: hoodieImg },
  { id: "4", title: "Sunday Plate — Soul Food", price: "$12", category: "Food", seller: "The Plug Eats", campus: "Howard", rating: 4.6, image: hoodieImg },
  { id: "5", title: "Campus Ride — Airport Run", price: "$20", category: "Rides", seller: "QuickPlug", campus: "Hampton", rating: 4.5, image: hoodieImg },
  { id: "6", title: "Studio Time — 2hr Block", price: "$60", category: "Studio", seller: "Vault Sound", campus: "Morehouse", rating: 4.9, image: hoodieImg },
];

export const nearbyServices = [
  { name: "Fade God", type: "Barber", distance: "0.2 mi", rating: 4.9 },
  { name: "Luxe Nails", type: "Nail Tech", distance: "0.3 mi", rating: 4.8 },
  { name: "Drip Locker", type: "Clothing", distance: "0.4 mi", rating: 4.7 },
  { name: "The Plug Eats", type: "Food", distance: "0.5 mi", rating: 4.6 },
];

export const popularOnCampus = [
  { name: "The Spot", type: "Food", location: "Near Student Center", rating: 4.8 },
  { name: "Campus Kuts", type: "Barber", location: "Near Gym", rating: 4.0 },
  { name: "Threaded", type: "Clothing", location: "Near Library", rating: 4.7 },
];

export const announcements = [
  { title: "Homecoming Week kicks off Monday", tag: "Campus", time: "2h" },
  { title: "Free tutoring at the Learning Commons tonight", tag: "Academic", time: "5h" },
  { title: "Plug-In Mixer — Friday 8pm at Quad", tag: "Event", time: "1d" },
];

export const featuredKingpins = [
  { name: "Marcus", handle: "@kingmarc", campus: "Talladega", followers: "1.2K" },
  { name: "Jada", handle: "@jadadrip", campus: "Spelman", followers: "3.4K" },
  { name: "Trey", handle: "@treybeats", campus: "Morehouse", followers: "892" },
];

export const messagesList = [
  { id: "fade", name: "Fade God", preview: "You: How much for a cut?", time: "2m", unread: false },
  { id: "luxe", name: "Luxe Nails", preview: "Available today 💅", time: "15m", unread: true },
  { id: "plug", name: "The Plug Eats", preview: "You: Bet, I'll pull up", time: "1h", unread: false },
  { id: "kuts", name: "Campus Kuts", preview: "Appointment confirmed", time: "2h", unread: false },
  { id: "drip", name: "Drip Locker", preview: "You: Is the hoodie in stock?", time: "3h", unread: false },
];

export const hbcus = [
  { name: "Howard University", city: "Washington, DC", students: "12K", color: "from-blue-900 to-blue-700" },
  { name: "Spelman College", city: "Atlanta, GA", students: "2.1K", color: "from-blue-900 to-indigo-800" },
  { name: "Morehouse College", city: "Atlanta, GA", students: "2.2K", color: "from-amber-900 to-amber-700" },
  { name: "Hampton University", city: "Hampton, VA", students: "3.6K", color: "from-sky-900 to-sky-700" },
  { name: "FAMU", city: "Tallahassee, FL", students: "9.7K", color: "from-orange-900 to-orange-700" },
  { name: "Talladega College", city: "Talladega, AL", students: "1.2K", color: "from-rose-900 to-rose-700" },
  { name: "Tuskegee University", city: "Tuskegee, AL", students: "2.8K", color: "from-red-900 to-red-700" },
  { name: "NCCU", city: "Durham, NC", students: "8.1K", color: "from-emerald-900 to-emerald-700" },
];

export const events = [
  { title: "Yard Show", when: "Tonight · 7pm", where: "The Quad" },
  { title: "Open Mic + Plug Mixer", when: "Fri · 8pm", where: "Student Center" },
  { title: "Tailgate Pop-Up", when: "Sat · 12pm", where: "Stadium Lot B" },
];

/* -------- Live Campus Map -------- */

export type PinCategory =
  | "food"
  | "event"
  | "ride"
  | "study"
  | "building"
  | "dorm"
  | "dining"
  | "library"
  | "gym"
  | "parking"
  | "safety"
  | "phone"
  | "hotspot"
  | "vendor";

export const pinFilters: { key: PinCategory | "all"; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "✨" },
  { key: "food", label: "Food", emoji: "🍔" },
  { key: "event", label: "Events", emoji: "🎉" },
  { key: "vendor", label: "Vendors", emoji: "🛍️" },
  { key: "ride", label: "Rides", emoji: "🚗" },
  { key: "study", label: "Study", emoji: "📚" },
  { key: "dorm", label: "Dorms", emoji: "🛏️" },
  { key: "dining", label: "Dining", emoji: "🍽️" },
  { key: "library", label: "Library", emoji: "📖" },
  { key: "gym", label: "Gym", emoji: "🏋️" },
  { key: "parking", label: "Parking", emoji: "🅿️" },
  { key: "safety", label: "Safety", emoji: "🚨" },
  { key: "phone", label: "Emergency Phone", emoji: "📞" },
  { key: "hotspot", label: "Hot Spots", emoji: "🔥" },
  { key: "building", label: "Buildings", emoji: "🏛️" },
];

export type MapPin = {
  id: string;
  name: string;
  category: PinCategory;
  distance: string; // "0.2 mi"
  description: string;
  open?: boolean;
  // approx % position over the campus map image (top-left origin)
  x: number;
  y: number;
};

export const mapPins: MapPin[] = [
  { id: "p1", name: "The Plug Eats", category: "food", distance: "0.1 mi", description: "Soul food popup · Open till 10pm", open: true, x: 32, y: 38 },
  { id: "p2", name: "Yard Show", category: "event", distance: "0.2 mi", description: "Tonight · 7pm @ The Quad", x: 52, y: 30 },
  { id: "p3", name: "Drip Locker Pop-Up", category: "vendor", distance: "0.3 mi", description: "Streetwear drop · Until 9pm", open: true, x: 68, y: 44 },
  { id: "p4", name: "QuickPlug Rides", category: "ride", distance: "0.1 mi", description: "Driver 2 min away", x: 42, y: 62 },
  { id: "p5", name: "Founders Library", category: "library", distance: "0.4 mi", description: "24/7 study floor open", open: true, x: 25, y: 55 },
  { id: "p6", name: "Savery Hall", category: "dorm", distance: "0.2 mi", description: "Residence hall", x: 60, y: 70 },
  { id: "p7", name: "Dining Commons", category: "dining", distance: "0.3 mi", description: "Late night menu · Open till 1am", open: true, x: 48, y: 50 },
  { id: "p8", name: "Rec Center Gym", category: "gym", distance: "0.5 mi", description: "Open till 11pm", open: true, x: 78, y: 60 },
  { id: "p9", name: "Lot B Parking", category: "parking", distance: "0.2 mi", description: "Student permits only", x: 18, y: 72 },
  { id: "p10", name: "Campus Safety", category: "safety", distance: "0.3 mi", description: "24/7 escort service", open: true, x: 72, y: 25 },
  { id: "p11", name: "The Yard", category: "hotspot", distance: "0.1 mi", description: "Where everybody at", x: 50, y: 45 },
  { id: "p12", name: "Quiet Reading Room", category: "study", distance: "0.4 mi", description: "Inside Founders, 3rd floor", x: 28, y: 50 },
  { id: "p13", name: "Swayne Hall", category: "building", distance: "0.5 mi", description: "Historic academic building", x: 38, y: 22 },
  { id: "p14", name: "Late Night Wings", category: "food", distance: "0.6 mi", description: "Vendor pop-up · 9pm–2am", open: true, x: 82, y: 80 },
  { id: "p15", name: "Blue Light Phone — Quad", category: "phone", distance: "0.05 mi", description: "Emergency call box · One-press to Campus Safety", open: true, x: 47, y: 35 },
  { id: "p16", name: "Blue Light Phone — Lot B", category: "phone", distance: "0.2 mi", description: "Emergency call box · Parking entrance", open: true, x: 20, y: 78 },
  { id: "p17", name: "Blue Light Phone — Rec", category: "phone", distance: "0.4 mi", description: "Emergency call box · Outside gym", open: true, x: 80, y: 55 },
  { id: "p18", name: "Blue Light Phone — Library", category: "phone", distance: "0.35 mi", description: "Emergency call box · West entry", open: true, x: 22, y: 60 },
];

/* -------- HBCUs feature -------- */

export type HbcuTab =
  | "directory"
  | "events"
  | "businesses"
  | "discounts"
  | "news"
  | "transfer"
  | "scholarships"
  | "ambassadors";

export const hbcuEvents = [
  { title: "Homecoming Yard Fest", school: "Howard", when: "Oct 18 · 4pm", where: "The Yard" },
  { title: "Spelhouse Battle of the Bands", school: "Spelman / Morehouse", when: "Nov 2 · 7pm", where: "AUC" },
  { title: "HBCU Founders Day Gala", school: "FAMU", when: "Oct 25 · 8pm", where: "Grand Ballroom" },
  { title: "Plug-In Tour Stop", school: "Hampton", when: "Nov 9 · 6pm", where: "Student Center" },
];

export const hbcuBusinesses = [
  { name: "Kreme + Co", owner: "Kennedy J.", school: "Spelman", category: "Skincare", verified: true },
  { name: "Trapsoul Studio", owner: "Andre R.", school: "Morehouse", category: "Music", verified: true },
  { name: "Bayou Bites", owner: "Jasmine T.", school: "Southern", category: "Food", verified: false },
  { name: "Royal Stitch", owner: "Marcus B.", school: "Talladega", category: "Apparel", verified: true },
];

export const hbcuDiscounts = [
  { brand: "Drip Locker", offer: "15% off with .edu", code: "PLUGU15" },
  { brand: "Fade God", offer: "$5 off first cut", code: "FRESH5" },
  { brand: "The Plug Eats", offer: "Free drink w/ plate", code: "EATWELL" },
  { brand: "Vault Sound", offer: "1 free studio hour", code: "VAULT1" },
];

export const hbcuNews = [
  { title: "HBCU enrollment hits 10-year high", source: "PlugU Daily", time: "2h" },
  { title: "New federal grant boosts STEM at 4 HBCUs", source: "Campus Wire", time: "1d" },
  { title: "Morehouse partners with major tech firm", source: "Atlanta Beat", time: "2d" },
];

export const transferResources = [
  { title: "HBCU Common Application", note: "Apply to 60+ HBCUs at once" },
  { title: "Credit Transfer Guide", note: "Course equivalency by school" },
  { title: "Transfer Scholarship List", note: "Aid for incoming transfers" },
  { title: "Housing for Transfers", note: "On-campus options after Year 1" },
];

export const scholarships = [
  { name: "Tom Joyner Foundation", amount: "$2,500", deadline: "Rolling" },
  { name: "UNCF Merit Scholarship", amount: "$5,000", deadline: "Mar 31" },
  { name: "Thurgood Marshall College Fund", amount: "Up to $6,200", deadline: "May 15" },
  { name: "HBCU Future Leaders", amount: "$1,500", deadline: "Feb 1" },
];

export const ambassadors = [
  { name: "Imani", school: "Howard", year: "Senior · Comms", quote: "I plug freshmen into the right people, fast." },
  { name: "Devin", school: "Morehouse", year: "Junior · CS", quote: "AUC is built different. Come see." },
  { name: "Aaliyah", school: "Spelman", year: "Sophomore · Bio", quote: "Sisterhood is the real currency." },
  { name: "Khalil", school: "FAMU", year: "Senior · Business", quote: "Rattlers move in packs. Tap in." },
];

export const repProfiles = [
  { name: "Kingpin", handle: "@kingpin", school: "Talladega", reps: 312 },
  { name: "Jada", handle: "@jadadrip", school: "Spelman", reps: 287 },
  { name: "Marcus", handle: "@kingmarc", school: "Howard", reps: 251 },
  { name: "Trey", handle: "@treybeats", school: "Morehouse", reps: 198 },
];

/* -------- Pricing tiers -------- */

export type PricingTier = {
  key: string;
  name: string;
  price: number;
  duration?: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
};

export const pricingTiers: PricingTier[] = [
  {
    key: "local-boost",
    name: "Local Boost",
    price: 4,
    duration: "24 hours",
    tagline: "Boost one listing on your campus for 24 hours.",
    features: ["24h boosted placement", "Single campus reach", "Listing highlight"],
  },
  {
    key: "campus-featured",
    name: "Campus Featured",
    price: 8,
    duration: "7 days",
    tagline: "Feature a vendor or service on the campus homepage.",
    features: ["Featured on home feed", "Vendor spotlight", "7 day run"],
  },
  {
    key: "kingpin-basic",
    name: "KingPin Basic",
    price: 16,
    duration: "14 days",
    tagline: "Get verified, trusted, and seen first.",
    features: ["KingPin verified badge", "Better profile placement", "Trust status", "14 day run"],
    highlight: true,
  },
  {
    key: "kingpin-pro",
    name: "KingPin Pro",
    price: 32,
    duration: "21 days",
    tagline: "Full creator/vendor toolkit.",
    features: ["KingPin badge", "Featured profile", "Boosted listings", "Priority search", "Vendor analytics", "21 day run"],
  },
  {
    key: "campus-takeover",
    name: "Campus Takeover",
    price: 64,
    duration: "1 month",
    tagline: "Premium promo placement across one campus.",
    features: ["Top of every tab", "Event / brand / vendor", "Single campus", "Full 1 month run"],
  },
  {
    key: "hbcu-network-boost",
    name: "HBCU Network Boost",
    price: 128,
    duration: "2 months",
    tagline: "Promote across HBCUs nationwide — multi-campus reach.",
    features: ["National HBCU exposure", "Multi-campus campaign", "HBCUS tab placement", "Targeted by region", "Performance report", "Full 2 month run"],
  },
];

/* -------- Safety / Need-based -------- */

export const lostAndFound = [
  { id: "lf1", title: "AirPods Pro — gray case", where: "Founders Library 2nd floor", when: "2h ago", kind: "Found" },
  { id: "lf2", title: "Student ID — Jasmine T.", where: "Dining Commons", when: "5h ago", kind: "Found" },
  { id: "lf3", title: "Silver hoop earring", where: "Rec Center", when: "1d ago", kind: "Lost" },
];

export const rideBoard = [
  { id: "r1", from: "Campus", to: "ATL Airport", when: "Fri 4pm", seats: 3, price: "$20" },
  { id: "r2", from: "Dorm", to: "Walmart", when: "Tonight 8pm", seats: 2, price: "$5" },
  { id: "r3", from: "Campus", to: "Home — Birmingham", when: "Sat 10am", seats: 1, price: "$30" },
];

export const studyGroups = [
  { id: "s1", course: "BIO 201", topic: "Midterm review", when: "Tue 7pm", where: "Library Rm 204", size: 6 },
  { id: "s2", course: "ACC 305", topic: "Problem set 4", when: "Wed 6pm", where: "Student Center", size: 4 },
  { id: "s3", course: "CS 150", topic: "Intro to React", when: "Thu 8pm", where: "Online", size: 12 },
];

export const housingBoard = [
  { id: "h1", title: "Roommate needed — 2BR off campus", rent: "$650/mo", when: "Spring", contact: "@jadadrip" },
  { id: "h2", title: "Sublet single — Savery Hall", rent: "$500/mo", when: "Summer", contact: "@treybeats" },
  { id: "h3", title: "Female roommate — quiet, junior+", rent: "$700/mo", when: "Fall", contact: "@imaniH" },
];

export const studentDeals = [
  { brand: "Spotify", offer: "Student Premium — $5.99/mo", code: "EDU" },
  { brand: "Amazon Prime", offer: "6 months free for students", code: "PRIMESTUDENT" },
  { brand: "Apple Music", offer: "Student plan — $5.99/mo", code: "EDU" },
  { brand: "Nike", offer: "10% student discount", code: "STUDENT10" },
];

/* -------- Admin -------- */

export const adminStats = [
  { label: "Active Users", value: "12,418" },
  { label: "KingPins", value: "342" },
  { label: "Vendors", value: "1,205" },
  { label: "Reports Open", value: "17" },
];

export const pendingVendors = [
  { id: "v1", name: "Bayou Bites", owner: "Jasmine T.", campus: "Southern", category: "Food" },
  { id: "v2", name: "Trapsoul Studio", owner: "Andre R.", campus: "Morehouse", category: "Music" },
  { id: "v3", name: "Royal Stitch", owner: "Marcus B.", campus: "Talladega", category: "Apparel" },
];

export const openReports = [
  { id: "rp1", target: "@scammerX", reason: "Took payment, never delivered", when: "1h" },
  { id: "rp2", target: "Listing #482", reason: "Inappropriate image", when: "4h" },
  { id: "rp3", target: "@drip_fake", reason: "Impersonating Drip Locker", when: "1d" },
];

export const pendingAmbassadors = [
  { name: "Tasha", school: "FAMU", year: "Junior · Marketing" },
  { name: "Jamal", school: "Hampton", year: "Senior · Engineering" },
];