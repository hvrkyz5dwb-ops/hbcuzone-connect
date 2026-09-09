import {
  Briefcase, GraduationCap, FlaskConical, Crown, HeartHandshake, Sparkles,
  type LucideIcon,
} from "lucide-react";

export type OpportunityKind =
  | "job" | "internship" | "scholarship" | "research" | "leadership" | "volunteer";

export type Opportunity = {
  id: string;
  kind: OpportunityKind;
  title: string;
  org: string;
  meta: string; // pay or due date
  due?: string;
  tag?: string;
};

export const opportunityMeta: Record<OpportunityKind, { label: string; icon: LucideIcon; tone: "gold" | "purple" }> = {
  job:         { label: "Jobs",         icon: Briefcase,     tone: "gold" },
  internship:  { label: "Internships",  icon: Sparkles,      tone: "gold" },
  scholarship: { label: "Scholarships", icon: GraduationCap, tone: "purple" },
  research:    { label: "Research",     icon: FlaskConical,  tone: "purple" },
  leadership:  { label: "Leadership",   icon: Crown,         tone: "gold" },
  volunteer:   { label: "Volunteer",    icon: HeartHandshake, tone: "purple" },
};

export const opportunities: Opportunity[] = [
  { id: "o1", kind: "internship", title: "SWE Intern — Summer '26", org: "Google BOLD", meta: "$10.5K/mo", tag: "Tech" },
  { id: "o2", kind: "internship", title: "Product Design Co-op", org: "Capital One", meta: "Paid", tag: "Design" },
  { id: "o3", kind: "job",        title: "Brand Ambassador",      org: "Nike",        meta: "$22/hr", tag: "On-campus" },
  { id: "o4", kind: "job",        title: "Library Desk Assistant", org: "Founders Library", meta: "$14/hr", tag: "Campus" },
  { id: "o5", kind: "scholarship", title: "UNCF / Wells Fargo",   org: "UNCF",        meta: "$5,000",  due: "Fri", tag: "GPA 3.0+" },
  { id: "o6", kind: "scholarship", title: "Tom Joyner Foundation", org: "TJF",         meta: "$2,500",  due: "Rolling" },
  { id: "o7", kind: "research",    title: "STEM Lab Assistant",   org: "Bio Dept",    meta: "$18/hr", tag: "Paid" },
  { id: "o8", kind: "research",    title: "Undergrad AI Research", org: "CS Dept",     meta: "Stipend", tag: "Open" },
  { id: "o9", kind: "leadership",  title: "SGA Treasurer",        org: "Student Gov", meta: "Apply by Fri" },
  { id: "o10", kind: "leadership", title: "Plug Campus Lead",     org: "PlugU",       meta: "Stipend + perks" },
  { id: "o11", kind: "volunteer",  title: "Tutor a freshman",     org: "Learning Commons", meta: "2 hrs/wk" },
  { id: "o12", kind: "volunteer",  title: "Homecoming Crew",      org: "Campus Life", meta: "Free swag" },
];

export const liveActivity = [
  { who: "Jada",  what: "just booked",  detail: "a nail set with Luxe Nails", when: "now" },
  { who: "Trey",  what: "listed",       detail: "Studio Time — 2hr Block", when: "2m" },
  { who: "Aaliyah", what: "RSVP'd",     detail: "to Yard Show tonight", when: "4m" },
  { who: "Marcus", what: "hit",         detail: "50 completed orders", when: "9m" },
  { who: "Imani", what: "saved",        detail: "UNCF Scholarship", when: "12m" },
];

export const businessSpotlight = {
  name: "Crown Roots",
  owner: "Kennedy J.",
  school: "Spelman",
  blurb: "Natural hair care line built by an HBCU senior — just raised $250K pre-seed.",
  stat: "+312% revenue this month",
};

export const aiRecommendations = [
  { title: "Apply: Google BOLD by Friday", reason: "Matches your CS major", to: "/hub" },
  { title: "Book a fade before Homecoming", reason: "Fade God has 2 slots left", to: "/market" },
  { title: "Join: AUC Career Expo Feb 12", reason: "100+ employers · your year", to: "/hub" },
];