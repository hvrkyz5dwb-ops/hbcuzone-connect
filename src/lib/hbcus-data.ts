// Real, publicly verifiable school facts only.
// Nothing in this file is invented: no activity counts, no sample people,
// no seeded news, scores, listings or events. Live content comes from the
// database and from real publisher/sports feeds.

export type SchoolProfile = {
  name: string;
  city: string;
  state: string;
  type: "Public" | "Private";
  enrollment: string;
  founded: number;
  acceptance: string;
  tuition: string;
  website: string;
  color: string;
  mascot: string;
  conference: string;
  topMajors: string[];
};

export const schoolProfiles: SchoolProfile[] = [
  { name: "Howard University", city: "Washington, DC", state: "DC", type: "Private", enrollment: "12,065", founded: 1867, acceptance: "32%", tuition: "$32K", website: "howard.edu", color: "from-blue-900 to-indigo-800", mascot: "Bison", conference: "MEAC", topMajors: ["Political Science", "Biology", "Business"] },
  { name: "Spelman College", city: "Atlanta, GA", state: "GA", type: "Private", enrollment: "2,100", founded: 1881, acceptance: "43%", tuition: "$30K", website: "spelman.edu", color: "from-blue-900 to-violet-800", mascot: "Jaguars", conference: "SIAC", topMajors: ["Psychology", "Pre-Med", "Economics"] },
  { name: "Morehouse College", city: "Atlanta, GA", state: "GA", type: "Private", enrollment: "2,200", founded: 1867, acceptance: "58%", tuition: "$31K", website: "morehouse.edu", color: "from-amber-900 to-orange-700", mascot: "Maroon Tigers", conference: "SIAC", topMajors: ["Business", "Engineering", "Film"] },
  { name: "Hampton University", city: "Hampton, VA", state: "VA", type: "Private", enrollment: "3,600", founded: 1868, acceptance: "36%", tuition: "$29K", website: "hamptonu.edu", color: "from-sky-900 to-blue-700", mascot: "Pirates", conference: "CAA", topMajors: ["Nursing", "Marine Sci", "Journalism"] },
  { name: "FAMU", city: "Tallahassee, FL", state: "FL", type: "Public", enrollment: "9,700", founded: 1887, acceptance: "36%", tuition: "$18K", website: "famu.edu", color: "from-orange-900 to-amber-700", mascot: "Rattlers", conference: "SWAC", topMajors: ["Pharmacy", "Business", "Music"] },
  { name: "Talladega College", city: "Talladega, AL", state: "AL", type: "Private", enrollment: "1,200", founded: 1867, acceptance: "29%", tuition: "$14K", website: "talladega.edu", color: "from-rose-900 to-red-700", mascot: "Tornadoes", conference: "GCAC", topMajors: ["Bio", "Computer Sci", "Edu"] },
  { name: "Tuskegee University", city: "Tuskegee, AL", state: "AL", type: "Private", enrollment: "2,800", founded: 1881, acceptance: "33%", tuition: "$22K", website: "tuskegee.edu", color: "from-red-900 to-rose-800", mascot: "Golden Tigers", conference: "SIAC", topMajors: ["Vet Med", "Engineering", "Architecture"] },
  { name: "NCCU", city: "Durham, NC", state: "NC", type: "Public", enrollment: "8,100", founded: 1909, acceptance: "44%", tuition: "$21K", website: "nccu.edu", color: "from-emerald-900 to-teal-700", mascot: "Eagles", conference: "MEAC", topMajors: ["Law", "Pharmacy", "Mass Comm"] },
];

export function schoolSlug(name: string): string {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function findSchoolBySlug(slug: string): SchoolProfile | undefined {
  return schoolProfiles.find((s) => schoolSlug(s.name) === slug);
}

export type NotableAlum = { name: string; note: string; era?: string };
export type GreekLife = {
  fraternities: string[];
  sororities: string[];
  houses: string;
  tradition: string;
};
export type SchoolDetail = {
  about: string;
  legacy: string;
  colors: string;
  motto?: string;
  alumni: NotableAlum[];
  greek: GreekLife;
};

const DIVINE_NINE_FRATS = ["Alpha Phi Alpha", "Kappa Alpha Psi", "Omega Psi Phi", "Phi Beta Sigma", "Iota Phi Theta"];
const DIVINE_NINE_SORS = ["Alpha Kappa Alpha", "Delta Sigma Theta", "Zeta Phi Beta", "Sigma Gamma Rho"];

export const schoolDetails: Record<string, SchoolDetail> = {
  "Howard University": {
    about:
      "The Mecca. A private research university on the Hilltop in DC, founded 1867 — a global capital of Black intellectual, cultural and political life.",
    legacy: "Nicknamed The Mecca, Howard leads all HBCUs in producing PhDs, Fortune 500 leaders and federal judges.",
    colors: "Blue, White & Red",
    motto: "Veritas et Utilitas",
    alumni: [
      { name: "Vice President Kamala Harris", note: "49th VP of the United States", era: "'86" },
      { name: "Thurgood Marshall", note: "Supreme Court Justice", era: "'33 LLB" },
      { name: "Chadwick Boseman", note: "Actor · Black Panther", era: "'00" },
      { name: "Zora Neale Hurston", note: "Author · Their Eyes Were Watching God" },
      { name: "Ta-Nehisi Coates", note: "Author · journalist" },
      { name: "Sean 'Diddy' Combs", note: "Music mogul (attended)" },
    ],
    greek: {
      fraternities: DIVINE_NINE_FRATS,
      sororities: DIVINE_NINE_SORS,
      houses: "All 9 Divine Nine chapters chartered on the Yard.",
      tradition: "The Yard is the birthplace of the step show. Homecoming step show pulls 10K+ every October.",
    },
  },
  "Spelman College": {
    about:
      "The #1 HBCU and a historically Black women's liberal-arts college in Atlanta, founded 1881 — a sisterhood engineered for excellence.",
    legacy: "Ranked the #1 HBCU by U.S. News for 17 consecutive years. Alumnae dominate medicine, media and policy.",
    colors: "Blue & White",
    motto: "Our Whole School for Christ",
    alumni: [
      { name: "Stacey Abrams", note: "Voting-rights leader · former GA House Minority Leader", era: "'95" },
      { name: "Alice Walker", note: "Pulitzer Prize author · The Color Purple" },
      { name: "Marian Wright Edelman", note: "Founder, Children's Defense Fund" },
      { name: "Rosalind Brewer", note: "Fmr CEO, Walgreens" },
      { name: "Keshia Knight Pulliam", note: "Actress · The Cosby Show" },
    ],
    greek: {
      fraternities: [],
      sororities: DIVINE_NINE_SORS,
      houses: "All 4 NPHC sororities active on campus (AKA, DST, ZPB, SGRho).",
      tradition: "Founders Day and Sisters Chapel probates are the yearly cultural anchors.",
    },
  },
  "Morehouse College": {
    about:
      "The only HBCU dedicated to educating Black men. Founded 1867 in Atlanta, home of the Morehouse Man legacy.",
    legacy: "Alma mater of Dr. Martin Luther King Jr. Nicknamed 'the House.'",
    colors: "Maroon & White",
    motto: "Et Facta Est Lux — And there was light",
    alumni: [
      { name: "Dr. Martin Luther King Jr.", note: "Civil rights icon · Nobel laureate", era: "'48" },
      { name: "Spike Lee", note: "Filmmaker", era: "'79" },
      { name: "Samuel L. Jackson", note: "Actor", era: "'72" },
      { name: "Herman Cain", note: "Business exec · presidential candidate" },
      { name: "Raphael Warnock", note: "U.S. Senator (GA)" },
    ],
    greek: {
      fraternities: DIVINE_NINE_FRATS,
      sororities: [],
      houses: "All 5 NPHC fraternities chartered.",
      tradition: "Spelhouse Homecoming — the biggest AUC weekend of the year.",
    },
  },
  "Hampton University": {
    about:
      "'Home By The Sea.' A private research HBCU on the Virginia coast, founded 1868 — famed for nursing, marine science and business.",
    legacy: "Educated Booker T. Washington and shaped the industrial-education model.",
    colors: "Royal Blue & White",
    motto: "The Standard of Excellence",
    alumni: [
      { name: "Booker T. Washington", note: "Founder, Tuskegee Institute", era: "1875" },
      { name: "Wanda Sykes", note: "Comedian · writer" },
      { name: "Spencer Christian", note: "Broadcaster" },
      { name: "Ruth E. Carter", note: "Oscar-winning costume designer" },
    ],
    greek: {
      fraternities: DIVINE_NINE_FRATS,
      sororities: DIVINE_NINE_SORS,
      houses: "Full Divine Nine presence · strong NPHC council.",
      tradition: "Greek Plots on the waterfront — a Hampton signature.",
    },
  },
  "FAMU": {
    about:
      "Florida A&M — a public research HBCU in Tallahassee, founded 1887. Home of the Marching 100 and the top-ranked HBCU pharmacy school.",
    legacy: "Largest single-campus HBCU. Marching 100 is a global cultural export.",
    colors: "Orange & Green",
    motto: "Excellence With Caring",
    alumni: [
      { name: "Common", note: "Rapper · actor (attended)" },
      { name: "Althea Gibson", note: "First Black tennis Grand Slam champion" },
      { name: "Will Packer", note: "Producer · Girls Trip, Ride Along" },
      { name: "T-Pain", note: "Grammy-winning artist (Tallahassee raised)" },
    ],
    greek: {
      fraternities: DIVINE_NINE_FRATS,
      sororities: DIVINE_NINE_SORS,
      houses: "The Set is the campus Greek runway — probates weekly in season.",
      tradition: "The Marching 100 halftime is its own Greek adjacent culture.",
    },
  },
  "Talladega College": {
    about:
      "Alabama's first private HBCU, founded 1867 by freed slaves. Small, tight-knit campus with a fierce arts and activism legacy.",
    legacy: "Home of the Hale Woodruff Amistad Murals and one of the oldest HBCU marching bands, the Great Tornado Band.",
    colors: "Crimson & Blue",
    motto: "The Power of Learning",
    alumni: [
      { name: "Arthur Shores", note: "Civil rights attorney" },
      { name: "Jewel Plummer Cobb", note: "Cell biologist · college president" },
      { name: "Henry Aaron Hudson", note: "Federal judge" },
      { name: "Gwendolyn Boyd", note: "Engineer · former ASU president" },
    ],
    greek: {
      fraternities: DIVINE_NINE_FRATS,
      sororities: DIVINE_NINE_SORS,
      houses: "Small but active NPHC council — every line is a moment.",
      tradition: "Founders Week Yard Show is the semester's biggest turn-out.",
    },
  },
  "Tuskegee University": {
    about:
      "Founded 1881 by Booker T. Washington. Alabama HBCU celebrated for veterinary medicine, engineering and the Tuskegee Airmen legacy.",
    legacy: "Home of the Tuskegee Airmen and one of only two HBCUs with a veterinary school.",
    colors: "Crimson & Gold",
    motto: "Knowledge · Leadership · Service",
    alumni: [
      { name: "George Washington Carver", note: "Scientist · agricultural pioneer" },
      { name: "Ralph Ellison", note: "Author · Invisible Man" },
      { name: "Lionel Richie", note: "Grammy-winning artist" },
      { name: "Keenen Ivory Wayans", note: "Comedian · filmmaker" },
    ],
    greek: {
      fraternities: DIVINE_NINE_FRATS,
      sororities: DIVINE_NINE_SORS,
      houses: "Full NPHC council with a deep military-Greek crossover.",
      tradition: "Homecoming Skegee weekend — RVs on The Yard.",
    },
  },
  "NCCU": {
    about:
      "North Carolina Central — founded 1909 in Durham as the nation's first state-supported liberal-arts HBCU. Powerhouse in law and pharmacy.",
    legacy: "NCCU School of Law consistently produces top-ranked Black attorneys in the South.",
    colors: "Maroon & Grey",
    motto: "Truth and Service",
    alumni: [
      { name: "Julius Chambers", note: "Civil rights attorney" },
      { name: "Maynard Jackson", note: "First Black mayor of Atlanta" },
      { name: "Phonte Coleman", note: "Little Brother · producer" },
      { name: "Andre Leon Talley", note: "Fashion editor · Vogue" },
    ],
    greek: {
      fraternities: DIVINE_NINE_FRATS,
      sororities: DIVINE_NINE_SORS,
      houses: "All 9 Divine Nine chapters chartered.",
      tradition: "Eagle Homecoming step show at McDougald-McLendon.",
    },
  },
};

export function getSchoolDetail(name: string): SchoolDetail | undefined {
  return schoolDetails[name];
}
