// PlugU school context — single source of truth derived from the verified .edu.
// Falls back to persona campus for unverified/preview state.
import { useEffect, useState } from "react";
import { getStudent } from "@/lib/auth";
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

function computeSchool(): SchoolContext {
  if (typeof window === "undefined") {
    return { slug: "plugu", name: "Your Campus", verified: false };
  }
  const s = getStudent();
  const name = s?.school ?? "Your Campus";
  return {
    slug: slugify(name),
    name,
    domain: s?.domain,
    verified: !!s?.verifiedStudent,
    ...fromDetails(name),
  };
}

export function useSchool(): SchoolContext {
  const [ctx, setCtx] = useState<SchoolContext>(computeSchool);
  useEffect(() => {
    setCtx(computeSchool());
    const on = () => setCtx(computeSchool());
    window.addEventListener("plugu:student", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("plugu:student", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return ctx;
}