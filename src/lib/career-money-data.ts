import {
  Briefcase, Building2, Laptop, Clock, Users, FileText, Network, GraduationCap,
  Sparkles, DollarSign, TrendingUp, Newspaper, Tag, Wallet, BookOpen, CreditCard, Store,
  type LucideIcon,
} from "lucide-react";

export type HubCategory =
  | "internships" | "campus-jobs" | "remote" | "part-time" | "career-fairs"
  | "resume" | "networking" | "mentorship" | "companies"
  | "scholarships" | "grants" | "stocks" | "business-news"
  | "discounts" | "side-hustles" | "literacy" | "credit" | "small-biz";

export type HubItem = {
  id: string;
  hub: "career" | "money";
  category: HubCategory;
  icon: LucideIcon;
  title: string;
  detail: string;
  meta?: string;
  accent?: "gold" | "purple";
};

export const careerSections: { key: HubCategory; label: string; icon: LucideIcon }[] = [
  { key: "internships", label: "Internships", icon: Briefcase },
  { key: "campus-jobs", label: "Campus Jobs", icon: Building2 },
  { key: "remote", label: "Remote Jobs", icon: Laptop },
  { key: "part-time", label: "Part-Time", icon: Clock },
  { key: "career-fairs", label: "Career Fairs", icon: Users },
  { key: "resume", label: "Resume Help", icon: FileText },
  { key: "networking", label: "Networking", icon: Network },
  { key: "mentorship", label: "Mentorship", icon: GraduationCap },
  { key: "companies", label: "Companies Hiring", icon: Sparkles },
];

export const moneySections: { key: HubCategory; label: string; icon: LucideIcon }[] = [
  { key: "scholarships", label: "Scholarships", icon: GraduationCap },
  { key: "grants", label: "Grants", icon: DollarSign },
  { key: "stocks", label: "Stock News", icon: TrendingUp },
  { key: "business-news", label: "Business News", icon: Newspaper },
  { key: "discounts", label: "Student Discounts", icon: Tag },
  { key: "side-hustles", label: "Side Hustles", icon: Wallet },
  { key: "literacy", label: "Financial Literacy", icon: BookOpen },
  { key: "credit", label: "Credit Education", icon: CreditCard },
  { key: "small-biz", label: "Small Biz Resources", icon: Store },
];

export const hubItems: HubItem[] = [
  // Career — internships
  { id: "h1", hub: "career", category: "internships", icon: Briefcase, title: "Google BOLD Internship — Summer '26", detail: "Paid software/PM internship for HBCU rising juniors. Rolling reviews.", meta: "Closes in 9 days", accent: "purple" },
  { id: "h2", hub: "career", category: "internships", icon: Briefcase, title: "Capital One Tech Internship", detail: "Software & data internships across McLean, NYC, Plano.", meta: "Deadline Dec 1" },
  { id: "h3", hub: "career", category: "internships", icon: Briefcase, title: "JPMorgan Advancing Black Pathways", detail: "Sophomore-year program — fast-track to a junior-year internship.", meta: "Open now" },
  // Campus jobs
  { id: "h4", hub: "career", category: "campus-jobs", icon: Building2, title: "Library Front Desk Assistant", detail: "Founders Library · 10–15 hrs/week · flexible class schedule.", meta: "$14/hr" },
  { id: "h5", hub: "career", category: "campus-jobs", icon: Building2, title: "Rec Center Lifeguard", detail: "Cert preferred — training provided.", meta: "$16/hr" },
  // Remote
  { id: "h6", hub: "career", category: "remote", icon: Laptop, title: "Notion Campus Lead — Remote", detail: "Host workshops, build community. Stipend + swag.", meta: "$1.5K/sem" },
  { id: "h7", hub: "career", category: "remote", icon: Laptop, title: "Stripe Customer Ops (PT, Remote)", detail: "Async email + chat support. 20 hrs/week.", meta: "$24/hr" },
  // Part-time
  { id: "h8", hub: "career", category: "part-time", icon: Clock, title: "Nike Campus Brand Ambassador", detail: "Rep product on campus — 8 hrs/week.", meta: "$22/hr", accent: "gold" },
  { id: "h9", hub: "career", category: "part-time", icon: Clock, title: "PlugU Vendor Support (PT)", detail: "Help new vendors set up shop. Built for students by students.", meta: "$18/hr" },
  // Fairs
  { id: "h10", hub: "career", category: "career-fairs", icon: Users, title: "AUC Career Expo — Spring", detail: "100+ employers across Spelman, Morehouse, CAU.", meta: "Feb 12 · 10am" },
  { id: "h11", hub: "career", category: "career-fairs", icon: Users, title: "HBCU Tech Connect", detail: "Virtual + in-person. Google, Meta, Pinterest, Snap.", meta: "Mar 4" },
  // Resume
  { id: "h12", hub: "career", category: "resume", icon: FileText, title: "1-on-1 Resume Review", detail: "Book a 20-min session with Career Services.", meta: "Free" },
  { id: "h13", hub: "career", category: "resume", icon: FileText, title: "PlugU Resume Templates", detail: "ATS-friendly templates designed for student profiles.", meta: "Download" },
  // Networking
  { id: "h14", hub: "career", category: "networking", icon: Network, title: "Black in Tech Mixer — Friday 8pm", detail: "Engineers from Google, Capital One, Pinterest. Free for verified students.", meta: "RSVPs open", accent: "purple" },
  { id: "h15", hub: "career", category: "networking", icon: Network, title: "HBCU Founders Brunch", detail: "Student founders + alumni VCs · curated table.", meta: "Sat · 11am" },
  // Mentorship
  { id: "h16", hub: "career", category: "mentorship", icon: GraduationCap, title: "Get matched with an alumni mentor", detail: "Filter by industry, school, and time commitment.", meta: "Apply" },
  { id: "h17", hub: "career", category: "mentorship", icon: GraduationCap, title: "PlugU Founders Circle", detail: "Monthly cohort calls with student entrepreneurs.", meta: "Open" },
  // Companies
  { id: "h18", hub: "career", category: "companies", icon: Sparkles, title: "Top hirers for HBCU students this season", detail: "Google · Capital One · JPMorgan · Pinterest · Snap · Stripe · Nike.", meta: "Updated weekly", accent: "gold" },

  // Money — scholarships
  { id: "h19", hub: "money", category: "scholarships", icon: GraduationCap, title: "UNCF / Wells Fargo — $5,000", detail: "Sophomores and juniors with a 3.0+ GPA. Short essay.", meta: "Deadline Fri", accent: "purple" },
  { id: "h20", hub: "money", category: "scholarships", icon: GraduationCap, title: "Tom Joyner Foundation", detail: "Rolling awards for HBCU students in good standing.", meta: "$2,500" },
  { id: "h21", hub: "money", category: "scholarships", icon: GraduationCap, title: "Thurgood Marshall College Fund", detail: "Merit + need-based. Up to $6,200.", meta: "May 15" },
  // Grants
  { id: "h22", hub: "money", category: "grants", icon: DollarSign, title: "PlugU x HBCU Founders Grant — $2,500", detail: "For student-owned businesses listed on PlugU Market. 5 awarded monthly.", meta: "Rolling", accent: "gold" },
  { id: "h23", hub: "money", category: "grants", icon: DollarSign, title: "Pell Grant — Refresh your FAFSA", detail: "Up to $7,395 / year. Check your eligibility in 5 minutes.", meta: "Federal" },
  // Stocks
  { id: "h24", hub: "money", category: "stocks", icon: TrendingUp, title: "Nvidia, Apple lift S&P to a record close", detail: "Tech rally continues; AI names lead the tape into the close.", meta: "Bloomberg · 30m" },
  { id: "h25", hub: "money", category: "stocks", icon: TrendingUp, title: "Investing 101 for students", detail: "Index funds, Roth IRAs, and the magic of starting at 19.", meta: "PlugU Money" },
  // Business
  { id: "h26", hub: "money", category: "business-news", icon: Newspaper, title: "Fed signals slower rate path", detail: "Markets rally as inflation cools; student loan rates unchanged.", meta: "Reuters · 1h" },
  { id: "h27", hub: "money", category: "business-news", icon: Newspaper, title: "Spelman senior raises $250K for hair brand", detail: "PlugU vendor 'Crown Roots' closes pre-seed led by Black-led VC.", meta: "PlugU News", accent: "gold" },
  // Discounts
  { id: "h28", hub: "money", category: "discounts", icon: Tag, title: "Spotify Student — $5.99/mo", detail: "With .edu verification — Hulu + Showtime included.", meta: "Save 50%" },
  { id: "h29", hub: "money", category: "discounts", icon: Tag, title: "Amazon Prime Student — 6 mo free", detail: "Then 50% off. Free shipping on textbooks.", meta: "Free trial" },
  // Side hustles
  { id: "h30", hub: "money", category: "side-hustles", icon: Wallet, title: "Become a Plug on Market", detail: "Sell food, clothes, services, rides, tutoring — keep 100% (no platform fee in beta).", meta: "Open store" },
  { id: "h31", hub: "money", category: "side-hustles", icon: Wallet, title: "Tutor your strongest class", detail: "Avg PlugU tutor makes $32/hr. Set your own rate.", meta: "Easy" },
  // Literacy
  { id: "h32", hub: "money", category: "literacy", icon: BookOpen, title: "Budgeting on a student income", detail: "The 50/30/20 rule, simplified for stipend + side-hustle life.", meta: "5 min read" },
  { id: "h33", hub: "money", category: "literacy", icon: BookOpen, title: "Roth IRA at 19 — why it matters", detail: "Start with $25/month. The math is wild.", meta: "Guide" },
  // Credit
  { id: "h34", hub: "money", category: "credit", icon: CreditCard, title: "Build credit without debt", detail: "Secured cards, on-time rent reporting, and what NOT to do.", meta: "How-to" },
  { id: "h35", hub: "money", category: "credit", icon: CreditCard, title: "Your first credit card, ranked", detail: "Best student cards for cashback, no fees, and travel.", meta: "Reviewed" },
  // Small biz
  { id: "h36", hub: "money", category: "small-biz", icon: Store, title: "Register an LLC as a student", detail: "Step-by-step + state-by-state cost breakdown.", meta: "Guide" },
  { id: "h37", hub: "money", category: "small-biz", icon: Store, title: "Free tools for student founders", detail: "Stripe Atlas, Notion, Figma, AWS Activate, Google Workspace.", meta: "Stack" },
];

export const careerHighlights = hubItems.filter((i) => i.hub === "career").slice(0, 6);
export const moneyHighlights = hubItems.filter((i) => i.hub === "money").slice(0, 6);