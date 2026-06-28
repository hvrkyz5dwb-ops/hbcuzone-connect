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