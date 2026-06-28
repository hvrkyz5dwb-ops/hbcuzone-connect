import {
  Newspaper, Calendar, GraduationCap, Briefcase, TrendingUp,
  UtensilsCrossed, Store, ShieldAlert, Users, Sparkles,
  type LucideIcon,
} from "lucide-react";

export type DailyCategory =
  | "For You" | "Campus" | "Opportunities" | "Money" | "Eats" | "Safety";

export type DailyItem = {
  id: string;
  category: DailyCategory;
  kind: string;          // short label, e.g. "Scholarship"
  icon: LucideIcon;
  title: string;
  summary: string;
  meta?: string;         // deadline / time / source
  accent?: "gold" | "purple" | "default";
};

export const dailyGreetingTime = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export const dailyItems: DailyItem[] = [
  {
    id: "d1", category: "Campus", kind: "Campus update", icon: Newspaper,
    title: "Homecoming parade route updated",
    summary: "New route loops past the Quad and Student Center — full map inside.",
    meta: "2h · Campus Comms", accent: "gold",
  },
  {
    id: "d2", category: "Opportunities", kind: "Scholarship", icon: GraduationCap,
    title: "UNCF / Wells Fargo Scholarship — $5,000",
    summary: "Open to sophomores and juniors with a 3.0+ GPA. Quick essay required.",
    meta: "Deadline Fri", accent: "purple",
  },
  {
    id: "d3", category: "Opportunities", kind: "Internship", icon: Briefcase,
    title: "Google BOLD Internship — Summer '26",
    summary: "Paid internship for HBCU rising juniors. Apps reviewed on a rolling basis.",
    meta: "Closes in 9 days",
  },
  {
    id: "d4", category: "Opportunities", kind: "Job", icon: Briefcase,
    title: "Campus Brand Ambassador — Nike",
    summary: "Earn $22/hr repping product on campus. 8 hrs/week.",
    meta: "3 open spots",
  },
  {
    id: "d5", category: "Money", kind: "Markets", icon: TrendingUp,
    title: "Nvidia, Apple lift S&P to record close",
    summary: "Tech rally continues as Fed signals slower rate path heading into Q3.",
    meta: "Reuters · 1h",
  },
  {
    id: "d6", category: "Money", kind: "Student business", icon: Sparkles,
    title: "Spelman senior raises $250K for her hair brand",
    summary: "PlugU vendor 'Crown Roots' closes pre-seed led by Black-led VC.",
    meta: "PlugU News", accent: "gold",
  },
  {
    id: "d7", category: "Eats", kind: "Food deal", icon: UtensilsCrossed,
    title: "$6 plate Tuesdays at The Plug Eats",
    summary: "Wings, mac, greens — show your .edu badge in app for the deal.",
    meta: "Today only",
  },
  {
    id: "d8", category: "Eats", kind: "Trending vendor", icon: Store,
    title: "Fade God booked 38 cuts this week",
    summary: "Spots filling fast for homecoming weekend — book through Market.",
    meta: "Trending #1",
  },
  {
    id: "d9", category: "Campus", kind: "Event", icon: Calendar,
    title: "Yard Show — Tonight 7pm at the Quad",
    summary: "All Greek orgs stepping. PlugU table on the south lawn.",
    meta: "Tonight", accent: "purple",
  },
  {
    id: "d10", category: "Safety", kind: "Safety alert", icon: ShieldAlert,
    title: "Power maintenance — West Dorms, 1–3am",
    summary: "Backup lighting active. Campus Safety on patrol; SOS button live in app.",
    meta: "Facilities · 30m", accent: "gold",
  },
  {
    id: "d11", category: "Opportunities", kind: "Networking", icon: Users,
    title: "Black in Tech mixer — Friday 8pm",
    summary: "Engineers from Google, Capital One, Pinterest. Free for verified students.",
    meta: "RSVPs open",
  },
  {
    id: "d12", category: "Money", kind: "Grant", icon: GraduationCap,
    title: "PlugU x HBCU Founders Grant — $2,500",
    summary: "For student-owned businesses listed on PlugU Market. 5 awarded monthly.",
    meta: "Rolling", accent: "purple",
  },
];

export const dailyTabs: DailyCategory[] = [
  "For You", "Campus", "Opportunities", "Money", "Eats", "Safety",
];