// PlugU school context — single source of truth derived from the verified .edu.
// Reads from the current signed-in Supabase profile.
import { useProfile } from "./use-profile";
import { schoolDetails } from "@/lib/hbcus-data";

export type SchoolContext = {
  slug: string;          // url-safe slug
  name: string;          // display name
  city?: string;
  state?: string;
  mascot?: string;
  colors?: { primary?: string; accent?: string };
  verified: boolean;     // true when derived from a verified .edu
  domain?: string;
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fromDetails(name: string): Partial<SchoolContext> {
  try {
    const details = (schoolDetails as any) ?? {};
    const match = Object.values(details).find((d: any) => d?.name === name) as any;
    if (match) {
      return {
        city: match.city,
        state: match.state,
        mascot: match.mascot,
        colors: match.colors,
      };
    }
  } catch {}
  return {};
}

export function useSchool(): SchoolContext {
  const { profile } = useProfile();
  const name = profile?.school_name ?? "Your Campus";
  return {
    slug: slugify(name),
    name,
    domain: profile?.school_domain ?? undefined,
    verified: !!profile?.school_domain,
    ...fromDetails(name),
  };
}