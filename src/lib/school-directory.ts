// PlugU school directory — powers the searchable school picker at signup.
// Merges every HBCU in APPROVED_SCHOOLS with the national college directory,
// tagging each entry with a state so students can filter by HBCU, by state,
// or by "near me" (device location snapped to the closest state).
import { APPROVED_SCHOOLS } from "./auth";
import { COLLEGES_BY_STATE } from "./colleges-by-state";

export type SchoolEntry = {
  name: string;
  state: string;
  hbcu: boolean;
  domain?: string;
};

export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "Washington, D.C.",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", PR: "Puerto Rico",
};

// Approximate geographic centers — used only to snap a student's location to
// the nearest state for the "Near me" filter.
export const STATE_CENTERS: Record<string, [number, number]> = {
  AL: [32.8, -86.8], AK: [64.0, -152.0], AZ: [34.3, -111.7], AR: [34.9, -92.4],
  CA: [37.2, -119.5], CO: [39.0, -105.5], CT: [41.6, -72.7], DE: [39.0, -75.5],
  DC: [38.9, -77.0], FL: [28.6, -82.4], GA: [32.6, -83.4], HI: [20.3, -156.4],
  ID: [44.4, -114.6], IL: [40.0, -89.2], IN: [39.9, -86.3], IA: [42.1, -93.5],
  KS: [38.5, -98.4], KY: [37.5, -85.3], LA: [31.0, -92.0], ME: [45.4, -69.2],
  MD: [39.0, -76.8], MA: [42.3, -71.8], MI: [44.3, -85.4], MN: [46.3, -94.3],
  MS: [32.7, -89.7], MO: [38.4, -92.5], MT: [47.0, -109.6], NE: [41.5, -99.8],
  NV: [39.3, -116.6], NH: [43.7, -71.6], NJ: [40.2, -74.7], NM: [34.4, -106.1],
  NY: [42.9, -75.5], NC: [35.5, -79.4], ND: [47.4, -100.5], OH: [40.3, -82.8],
  OK: [35.6, -97.5], OR: [43.9, -120.6], PA: [40.9, -77.8], RI: [41.7, -71.6],
  SC: [33.9, -80.9], SD: [44.4, -100.2], TN: [35.9, -86.4], TX: [31.5, -99.3],
  UT: [39.3, -111.7], VT: [44.1, -72.7], VA: [37.5, -78.8], WA: [47.4, -120.5],
  WV: [38.6, -80.6], WI: [44.6, -89.7], WY: [43.0, -107.6], PR: [18.2, -66.4],
};

const HBCU_STATES: Record<string, string> = {
  "Howard University": "DC", "Spelman College": "GA", "Morehouse College": "GA",
  "Hampton University": "VA", FAMU: "FL", "Talladega College": "AL",
  "Tuskegee University": "AL", NCCU: "NC", "Jackson State": "MS",
  "Southern University": "LA", "Alabama State": "AL", "Alabama A&M": "AL",
  "Grambling State": "LA", "Prairie View A&M": "TX", "Texas Southern": "TX",
  "Tennessee State": "TN", "Fisk University": "TN", "Clark Atlanta": "GA",
  "Morgan State": "MD", "Bowie State": "MD", "Coppin State": "MD",
  "Delaware State": "DE", "Lincoln University": "PA", "Cheyney University": "PA",
  "North Carolina A&T": "NC", "Winston-Salem State": "NC",
  "Fayetteville State": "NC", "Elizabeth City State": "NC",
  "Johnson C. Smith": "NC", "Livingstone College": "NC", "Shaw University": "NC",
  "Saint Augustine's": "NC", "Bennett College": "NC", "Bethune-Cookman": "FL",
  "Edward Waters": "FL", "Florida Memorial": "FL", "South Carolina State": "SC",
  "Claflin University": "SC", "Benedict College": "SC", "Allen University": "SC",
  "Voorhees University": "SC", "Norfolk State": "VA", "Virginia State": "VA",
  "Virginia Union": "VA", "Virginia University of Lynchburg": "VA",
  "West Virginia State": "WV", "Bluefield State": "WV", "Kentucky State": "KY",
  "Central State": "OH", "Wilberforce University": "OH",
  "Lincoln University (MO)": "MO", "Harris-Stowe State": "MO",
  "Langston University": "OK", "Philander Smith": "AR", "Arkansas Baptist": "AR",
  UAPB: "AR", "Xavier University of Louisiana": "LA", "Dillard University": "LA",
  "Southern University at New Orleans": "LA", "Miles College": "AL",
  "Stillman College": "AL", "Oakwood University": "AL", "Selma University": "AL",
  "Rust College": "MS", "Tougaloo College": "MS", "Alcorn State": "MS",
  "Mississippi Valley State": "MS", "Paul Quinn College": "TX",
  "Wiley University": "TX", "Huston-Tillotson": "TX", "Jarvis Christian": "TX",
};

function build(): SchoolEntry[] {
  const seen = new Set<string>();
  const list: SchoolEntry[] = [];
  for (const s of APPROVED_SCHOOLS) {
    const key = s.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({ name: s.name, state: HBCU_STATES[s.name] ?? "", hbcu: true, domain: s.domains[0] });
  }
  for (const [state, names] of Object.entries(COLLEGES_BY_STATE)) {
    for (const name of names) {
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      list.push({ name, state, hbcu: false });
    }
  }
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

export const SCHOOL_DIRECTORY: SchoolEntry[] = build();

export const DIRECTORY_STATES: { code: string; label: string }[] = Object.keys(STATE_NAMES)
  .filter((code) => SCHOOL_DIRECTORY.some((s) => s.state === code))
  .map((code) => ({ code, label: STATE_NAMES[code] }))
  .sort((a, b) => a.label.localeCompare(b.label));

/** Snap a coordinate to the closest state code (great-circle approximation). */
export function nearestState(lat: number, lon: number): string {
  let best = "";
  let bestD = Infinity;
  for (const [code, [clat, clon]] of Object.entries(STATE_CENTERS)) {
    const dy = lat - clat;
    const dx = (lon - clon) * Math.cos(((lat + clat) / 2) * (Math.PI / 180));
    const d = dy * dy + dx * dx;
    if (d < bestD) {
      bestD = d;
      best = code;
    }
  }
  return best;
}

export type SchoolFilters = { query: string; hbcuOnly: boolean; state: string };

export function searchSchools(
  { query, hbcuOnly, state }: SchoolFilters,
  limit = 40,
): SchoolEntry[] {
  const q = query.trim().toLowerCase();
  const results = SCHOOL_DIRECTORY.filter((s) => {
    if (hbcuOnly && !s.hbcu) return false;
    if (state && s.state !== state) return false;
    if (!q) return true;
    return s.name.toLowerCase().includes(q);
  });
  if (!q) return results.slice(0, limit);
  // Prefix matches first so "how" surfaces Howard before Cal State Northridge.
  return results
    .sort((a, b) => {
      const ap = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bp = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return ap - bp || a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}
