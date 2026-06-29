// PlugU Student-Only Auth (client-side scaffold)
// Backend (email verification codes) wired in a later phase.

export type ApprovedSchool = {
  name: string;
  domains: string[]; // approved institutional email domains
};

// Approved HBCU + institutional email domains.
// Add more here as the network expands.
export const APPROVED_SCHOOLS: ApprovedSchool[] = [
  { name: "Howard University",     domains: ["howard.edu", "bison.howard.edu"] },
  { name: "Spelman College",       domains: ["spelman.edu"] },
  { name: "Morehouse College",     domains: ["morehouse.edu"] },
  { name: "Hampton University",    domains: ["hamptonu.edu", "my.hamptonu.edu"] },
  { name: "FAMU",                  domains: ["famu.edu"] },
  { name: "Talladega College",     domains: ["talladega.edu"] },
  { name: "Tuskegee University",   domains: ["tuskegee.edu"] },
  { name: "NCCU",                  domains: ["nccu.edu", "eagles.nccu.edu"] },
];

export type StudentAccount = {
  id: string;
  name: string;
  email: string;
  school: string;
  domain: string;
  year: string;
  major: string;
  verifiedStudent: true;
  // Reserved for future code-based verification step.
  emailVerified: boolean;
  createdAt: number;
};

const KEY = "plugu.student";

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
  if (!school) {
    return {
      ok: false,
      reason: "PlugU is students-only. Use your school email (.edu / approved institutional domain).",
    };
  }
  if (requestedSchool && school.name !== requestedSchool) {
    return { ok: false, reason: `That email belongs to ${school.name}. Switch your school selection to continue.` };
  }
  return { ok: true, school, domain };
}

export function getStudent(): StudentAccount | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StudentAccount) : null;
  } catch {
    return null;
  }
}

export function isVerifiedStudent(): boolean {
  return !!getStudent()?.verifiedStudent;
}

function persist(s: StudentAccount | null) {
  try {
    if (s) window.localStorage.setItem(KEY, JSON.stringify(s));
    else window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("plugu:student"));
  } catch {}
}

export type SignUpInput = {
  name: string;
  email: string;
  school: string;
  year: string;
  major: string;
};

export type AuthResult =
  | { ok: true; student: StudentAccount }
  | { ok: false; reason: string };

export function signUpStudent(input: SignUpInput): AuthResult {
  if (!input.name.trim()) return { ok: false, reason: "Enter your full name." };
  if (!input.school) return { ok: false, reason: "Select your school." };
  const v = validateStudentEmail(input.email, input.school);
  if (!v.ok) return { ok: false, reason: v.reason };
  const student: StudentAccount = {
    id: `stu_${Date.now().toString(36)}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    school: v.school.name,
    domain: v.domain,
    year: input.year || "Freshman",
    major: input.major || "Undeclared",
    verifiedStudent: true,
    // TODO(server): set true only after one-time code verification.
    emailVerified: false,
    createdAt: Date.now(),
  };
  persist(student);
  return { ok: true, student };
}

export function signInStudent(email: string): AuthResult {
  const v = validateStudentEmail(email);
  if (!v.ok) return { ok: false, reason: v.reason };
  const existing = getStudent();
  if (existing && existing.email === email.trim().toLowerCase()) {
    return { ok: true, student: existing };
  }
  // Lightweight "find or create" for the placeholder login flow.
  const student: StudentAccount = {
    id: `stu_${Date.now().toString(36)}`,
    name: existing?.name ?? email.split("@")[0],
    email: email.trim().toLowerCase(),
    school: v.school.name,
    domain: v.domain,
    year: existing?.year ?? "Freshman",
    major: existing?.major ?? "Undeclared",
    verifiedStudent: true,
    emailVerified: false,
    createdAt: existing?.createdAt ?? Date.now(),
  };
  persist(student);
  return { ok: true, student };
}

export function signOutStudent() {
  persist(null);
}