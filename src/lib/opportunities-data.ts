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

// Opportunity listings are never hard-coded. Every opportunity shown in the app
// comes from the `opportunities` table via src/lib/hiring-db.ts.