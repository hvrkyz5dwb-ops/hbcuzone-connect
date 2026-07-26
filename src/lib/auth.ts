// PlugU school directory + email validation helpers.
//
// NOTE: Real authentication now lives in Supabase (see src/routes/auth.tsx,
// src/hooks/use-session.ts, src/hooks/use-profile.ts). This module keeps the
// pure helpers that many components still import — approved school list,
// domain detection, and .edu validation used at signup time.
//
// The legacy localStorage "StudentAccount" API has been removed; the shim
// functions below return null / false so existing consumers stay compilable
// while they migrate to useProfile().

export type ApprovedSchool = {
  name: string;
  domains: string[]; // approved institutional email domains
};

// Approved HBCU + institutional email domains.
// Every school listed here is an HBCU — PlugU's HBC"US" tab is gated on the
// student's email domain matching one of these entries. Add more as the
// network expands.
export const APPROVED_SCHOOLS: ApprovedSchool[] = [
  { name: "Howard University",     domains: ["howard.edu", "bison.howard.edu"] },
  { name: "Spelman College",       domains: ["spelman.edu"] },
  { name: "Morehouse College",     domains: ["morehouse.edu"] },
  { name: "Hampton University",    domains: ["hamptonu.edu", "my.hamptonu.edu"] },
  { name: "FAMU",                  domains: ["famu.edu", "rattlers.famu.edu"] },
  { name: "Talladega College",     domains: ["talladega.edu"] },
  { name: "Tuskegee University",   domains: ["tuskegee.edu"] },
  { name: "NCCU",                  domains: ["nccu.edu", "eagles.nccu.edu"] },
  { name: "Jackson State",         domains: ["jsums.edu"] },
  { name: "Southern University",   domains: ["subr.edu"] },
  { name: "Alabama State",         domains: ["alasu.edu", "myasu.alasu.edu"] },
  { name: "Alabama A&M",           domains: ["aamu.edu", "bulldogs.aamu.edu"] },
  { name: "Grambling State",       domains: ["gram.edu"] },
  { name: "Prairie View A&M",      domains: ["pvamu.edu"] },
  { name: "Texas Southern",        domains: ["tsu.edu"] },
  { name: "Tennessee State",       domains: ["tnstate.edu", "my.tnstate.edu"] },
  { name: "Fisk University",       domains: ["fisk.edu"] },
  { name: "Clark Atlanta",         domains: ["cau.edu"] },
  { name: "Morgan State",          domains: ["morgan.edu"] },
  { name: "Bowie State",           domains: ["bowiestate.edu"] },
  { name: "Coppin State",          domains: ["coppin.edu"] },
  { name: "Delaware State",        domains: ["desu.edu"] },
  { name: "Lincoln University",    domains: ["lincoln.edu", "lincolnu.edu"] },
  { name: "Cheyney University",    domains: ["cheyney.edu"] },
  { name: "North Carolina A&T",    domains: ["ncat.edu", "aggies.ncat.edu"] },
  { name: "Winston-Salem State",   domains: ["wssu.edu"] },
  { name: "Fayetteville State",    domains: ["uncfsu.edu"] },
  { name: "Elizabeth City State",  domains: ["ecsu.edu"] },
  { name: "Johnson C. Smith",      domains: ["jcsu.edu"] },
  { name: "Livingstone College",   domains: ["livingstone.edu"] },
  { name: "Shaw University",       domains: ["shawu.edu"] },
  { name: "Saint Augustine's",     domains: ["st-aug.edu"] },
  { name: "Bennett College",       domains: ["bennett.edu"] },
  { name: "Bethune-Cookman",       domains: ["cookman.edu"] },
  { name: "Edward Waters",         domains: ["ewu.edu"] },
  { name: "Florida Memorial",      domains: ["fmuniv.edu"] },
  { name: "South Carolina State",  domains: ["scsu.edu"] },
  { name: "Claflin University",    domains: ["claflin.edu"] },
  { name: "Benedict College",      domains: ["benedict.edu"] },
  { name: "Allen University",      domains: ["allenuniversity.edu"] },
  { name: "Voorhees University",   domains: ["voorhees.edu"] },
  { name: "Norfolk State",         domains: ["nsu.edu"] },
  { name: "Virginia State",        domains: ["vsu.edu"] },
  { name: "Virginia Union",        domains: ["vuu.edu"] },
  { name: "Virginia University of Lynchburg", domains: ["vul.edu"] },
  { name: "West Virginia State",   domains: ["wvstateu.edu"] },
  { name: "Bluefield State",       domains: ["bluefieldstate.edu"] },
  { name: "Kentucky State",        domains: ["kysu.edu"] },
  { name: "Central State",         domains: ["centralstate.edu"] },
  { name: "Wilberforce University",domains: ["wilberforce.edu"] },
  { name: "Lincoln University (MO)", domains: ["lincolnu.edu"] },
  { name: "Harris-Stowe State",    domains: ["hssu.edu"] },
  { name: "Langston University",   domains: ["langston.edu"] },
  { name: "Philander Smith",       domains: ["philander.edu"] },
  { name: "Arkansas Baptist",      domains: ["arkansasbaptist.edu"] },
  { name: "UAPB",                  domains: ["uapb.edu"] },
  { name: "Xavier University of Louisiana", domains: ["xula.edu"] },
  { name: "Dillard University",    domains: ["dillard.edu"] },
  { name: "Southern University at New Orleans", domains: ["suno.edu"] },
  { name: "Miles College",         domains: ["miles.edu"] },
  { name: "Stillman College",      domains: ["stillman.edu"] },
  { name: "Oakwood University",    domains: ["oakwood.edu"] },
  { name: "Selma University",      domains: ["selmauniversity.edu"] },
  { name: "Rust College",          domains: ["rustcollege.edu"] },
  { name: "Tougaloo College",      domains: ["tougaloo.edu"] },
  { name: "Alcorn State",          domains: ["alcorn.edu"] },
  { name: "Mississippi Valley State", domains: ["mvsu.edu"] },
  { name: "Paul Quinn College",    domains: ["pqc.edu"] },
  { name: "Wiley University",      domains: ["wileyc.edu"] },
  { name: "Huston-Tillotson",      domains: ["htu.edu"] },
  { name: "Jarvis Christian",      domains: ["jarvis.edu"] },
];

// Fast lookup set of every HBCU-affiliated domain. Used by isHbcuStudent().
const HBCU_DOMAINS = new Set(
  APPROVED_SCHOOLS.flatMap((s) => s.domains.map((d) => d.toLowerCase())),
);

/**
 * AI-style school detection: matches by exact domain, then by trailing
 * subdomain (e.g. `mail.spelman.edu` → Spelman). Returns null if the domain
 * isn't an HBCU we recognize.
 */
export function detectHbcuSchool(email: string): ApprovedSchool | null {
  const domain = getDomain(email);
  if (!domain) return null;
  const d = domain.toLowerCase();
  const exact = APPROVED_SCHOOLS.find((s) => s.domains.some((x) => x === d));
  if (exact) return exact;
  return (
    APPROVED_SCHOOLS.find((s) =>
      s.domains.some((x) => d === x || d.endsWith("." + x)),
    ) ?? null
  );
}

export function isHbcuDomain(domain: string): boolean {
  const d = domain.toLowerCase();
  if (HBCU_DOMAINS.has(d)) return true;
  for (const known of HBCU_DOMAINS) {
    if (d.endsWith("." + known)) return true;
  }
  return false;
}

// Deprecated: HBCU status now lives on profiles.is_hbcu_student. Callers that
// need the live value should read it from useProfile(). Kept as a no-op so
// legacy imports don't crash during the migration.
export function isHbcuStudent(): boolean {
  return false;
}

/** @deprecated Use useProfile() from '@/hooks/use-profile'. */
export type StudentAccount = {
  id: string;
  name: string;
  email: string;
  school: string;
  domain: string;
  year: string;
  major: string;
  verifiedStudent: true;
  emailVerified: boolean;
  createdAt: number;
};

export function getDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  return email.slice(at + 1).trim().toLowerCase();
}

export function findSchoolByDomain(domain: string): ApprovedSchool | null {
  const d = domain.toLowerCase();
  return APPROVED_SCHOOLS.find((s) => s.domains.includes(d)) ?? null;
}

export type EmailValidation =
  | { ok: true; school: ApprovedSchool; domain: string }
  | { ok: false; reason: string };

export function validateStudentEmail(email: string, requestedSchool?: string): EmailValidation {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, reason: "Enter a valid email address." };
  }
  const domain = getDomain(trimmed)!;
  const school = findSchoolByDomain(domain);
  if (school) {
    return { ok: true, school, domain };
  }
  // Subdomain match (e.g. bison.howard.edu → howard.edu).
  const subMatch = APPROVED_SCHOOLS.find((s) =>
    s.domains.some((x) => domain.endsWith("." + x)),
  );
  if (subMatch) {
    const rootDomain = subMatch.domains.find((x) => domain.endsWith("." + x)) ?? domain;
    return { ok: true, school: subMatch, domain: rootDomain };
  }
  // Any other US college — must be a .edu domain. Use the typed school name,
  // or derive one from the root domain when the user didn't provide it.
  if (!/\.edu$/i.test(domain)) {
    return {
      ok: false,
      reason: `PlugU is students-only. "${domain}" isn't a school email — use your official .edu address.`,
    };
  }
  const rootDomain = domain.split(".").slice(-2).join(".");
  const derivedName =
    (requestedSchool && requestedSchool.trim()) ||
    rootDomain.replace(/\.edu$/i, "").replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    ok: true,
    school: { name: derivedName, domains: [rootDomain] },
    domain: rootDomain,
  };
}

/** @deprecated Read the current profile via useProfile() instead. */
export function getStudent(): StudentAccount | null {
  return null;
}

/** @deprecated Use useSession() from '@/hooks/use-session'. */
export function isVerifiedStudent(): boolean {
  return false;
}