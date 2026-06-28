import {
  Newspaper,
  Trophy,
  School,
  Briefcase,
  GraduationCap,
  Store,
  Users,
  Calendar,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type HbcusSection =
  | "News"
  | "Sports"
  | "Schools"
  | "Internships"
  | "Scholarships"
  | "Marketplace"
  | "Networking"
  | "Events"
  | "PlugU Daily";

export const hbcusSections: { key: HbcusSection; icon: LucideIcon }[] = [
  { key: "News", icon: Newspaper },
  { key: "Sports", icon: Trophy },
  { key: "Schools", icon: School },
  { key: "Internships", icon: Briefcase },
  { key: "Scholarships", icon: GraduationCap },
  { key: "Marketplace", icon: Store },
  { key: "Networking", icon: Users },
  { key: "Events", icon: Calendar },
  { key: "PlugU Daily", icon: Sparkles },
];

export const hbcuNewsFilters = [
  "My School",
  "Nearby",
  "All HBCUs",
  "Athletics",
  "Academics",
  "Culture",
  "Business",
  "Politics",
  "Entertainment",
] as const;

export type HbcuNewsItem = {
  id: string;
  title: string;
  summary: string;
  category: (typeof hbcuNewsFilters)[number];
  school: string;
  time: string;
  tag: string;
  accent?: "gold" | "purple" | "default";
};

export const hbcuLiveNews: HbcuNewsItem[] = [
  { id: "n1", title: "Howard lands record $90M research grant", summary: "Federal initiative funds AI, biotech, and climate research across the Yard.", category: "Academics", school: "Howard University", time: "32m", tag: "Research", accent: "gold" },
  { id: "n2", title: "Spelman senior named Rhodes Scholar", summary: "Political science major heads to Oxford this fall on a full ride.", category: "Academics", school: "Spelman College", time: "1h", tag: "Spotlight", accent: "purple" },
  { id: "n3", title: "FAMU Marching 100 invited to Super Bowl halftime", summary: "Iconic band joins headliner for a 12-minute feature performance.", category: "Culture", school: "FAMU", time: "2h", tag: "Culture" },
  { id: "n4", title: "Morehouse alum closes $40M Series B", summary: "Atlanta-based fintech founded by a 2018 grad raises monster round.", category: "Business", school: "Morehouse College", time: "3h", tag: "Business", accent: "gold" },
  { id: "n5", title: "Hampton expands need-based aid 30%", summary: "New endowment cuts tuition gap for in-state and Pell-eligible students.", category: "Academics", school: "Hampton University", time: "4h", tag: "Financial Aid" },
  { id: "n6", title: "NCCU Eagles top Division I in academic progress", summary: "Athletic department posts best APR score in school history.", category: "Athletics", school: "NCCU", time: "6h", tag: "Athletics" },
  { id: "n7", title: "Greek Life: AKA hosts national leadership summit", summary: "1,800 sorors gather in DC for a weekend of policy and service.", category: "Culture", school: "Howard University", time: "7h", tag: "Greek Life", accent: "purple" },
  { id: "n8", title: "Tuskegee study abroad opens 5 new programs", summary: "Ghana, South Africa, and Brazil join the global semester lineup.", category: "Academics", school: "Tuskegee University", time: "9h", tag: "Study Abroad" },
  { id: "n9", title: "Campus safety: new blue-light network at Talladega", summary: "12 emergency stations rolled out across residential paths.", category: "Politics", school: "Talladega College", time: "11h", tag: "Safety" },
  { id: "n10", title: "Student government wins seat on board of trustees", summary: "Spelman SGA secures historic voting role on the governing board.", category: "Politics", school: "Spelman College", time: "13h", tag: "SGA" },
  { id: "n11", title: "Alum signs to Def Jam, credits HU radio start", summary: "WHBC alum drops debut single after viral campus showcase.", category: "Entertainment", school: "Howard University", time: "1d", tag: "Alumni", accent: "purple" },
  { id: "n12", title: "Commencement speakers announced across the Yard", summary: "Six HBCUs reveal headline speakers for spring graduation.", category: "Academics", school: "All HBCUs", time: "1d", tag: "Graduation" },
];

export const liveScores = [
  { id: "g1", home: "Howard", homeScore: 28, away: "Hampton", awayScore: 21, status: "Q4 · 2:14", sport: "Football", live: true },
  { id: "g2", home: "FAMU", homeScore: 14, away: "B-CU", awayScore: 17, status: "HALFTIME", sport: "Football", live: true },
  { id: "g3", home: "Morehouse", homeScore: 78, away: "Clark Atlanta", awayScore: 72, status: "Q3 · 5:42", sport: "Basketball", live: true },
];

export const upcomingGames = [
  { id: "u1", home: "NCCU", away: "NC A&T", date: "Sat · 3:30p", sport: "Football", network: "ESPN+" },
  { id: "u2", home: "Tuskegee", away: "Talladega", date: "Sat · 6:00p", sport: "Football", network: "HBCU Go" },
  { id: "u3", home: "Spelman", away: "Tougaloo", date: "Sun · 2:00p", sport: "Volleyball", network: "Stream" },
];

export const completedGames = [
  { id: "c1", home: "Jackson State", homeScore: 35, away: "Alabama State", awayScore: 14, sport: "Football" },
  { id: "c2", home: "Grambling", homeScore: 24, away: "Southern", awayScore: 31, sport: "Football" },
];

export const conferenceStandings = [
  { conf: "SWAC", teams: [
    { name: "Jackson State", record: "9-1" },
    { name: "Southern", record: "8-2" },
    { name: "Alabama State", record: "6-4" },
  ]},
  { conf: "MEAC", teams: [
    { name: "Howard", record: "7-2" },
    { name: "NCCU", record: "6-3" },
    { name: "Hampton", record: "5-4" },
  ]},
];

export const topPerformers = [
  { name: "Marcus J.", school: "Howard", stat: "312 yds · 3 TD", sport: "Football" },
  { name: "Jada R.", school: "Spelman", stat: "28 pts · 11 reb", sport: "Basketball" },
  { name: "Trey L.", school: "FAMU", stat: "9.8s · 100m", sport: "Track" },
];

export const sportsTabs = ["Live", "Upcoming", "Final", "Standings", "Top Performers"] as const;

export const sportLeagues = ["Football", "Basketball", "Baseball", "Softball", "Track", "Soccer", "Volleyball"] as const;

export type SchoolProfile = {
  name: string;
  city: string;
  enrollment: string;
  founded: number;
  acceptance: string;
  tuition: string;
  website: string;
  color: string;
  mascot: string;
  conference: string;
  pluguStudents: number;
  liveActivity: string;
  topMajors: string[];
};

export const schoolProfiles: SchoolProfile[] = [
  { name: "Howard University", city: "Washington, DC", enrollment: "12,065", founded: 1867, acceptance: "32%", tuition: "$32K", website: "howard.edu", color: "from-blue-900 to-indigo-800", mascot: "Bison", conference: "MEAC", pluguStudents: 1842, liveActivity: "2.1K active now", topMajors: ["Political Science", "Biology", "Business"] },
  { name: "Spelman College", city: "Atlanta, GA", enrollment: "2,100", founded: 1881, acceptance: "43%", tuition: "$30K", website: "spelman.edu", color: "from-blue-900 to-violet-800", mascot: "Jaguars", conference: "SIAC", pluguStudents: 612, liveActivity: "780 active now", topMajors: ["Psychology", "Pre-Med", "Economics"] },
  { name: "Morehouse College", city: "Atlanta, GA", enrollment: "2,200", founded: 1867, acceptance: "58%", tuition: "$31K", website: "morehouse.edu", color: "from-amber-900 to-orange-700", mascot: "Maroon Tigers", conference: "SIAC", pluguStudents: 588, liveActivity: "640 active now", topMajors: ["Business", "Engineering", "Film"] },
  { name: "Hampton University", city: "Hampton, VA", enrollment: "3,600", founded: 1868, acceptance: "36%", tuition: "$29K", website: "hamptonu.edu", color: "from-sky-900 to-blue-700", mascot: "Pirates", conference: "CAA", pluguStudents: 720, liveActivity: "910 active now", topMajors: ["Nursing", "Marine Sci", "Journalism"] },
  { name: "FAMU", city: "Tallahassee, FL", enrollment: "9,700", founded: 1887, acceptance: "36%", tuition: "$18K", website: "famu.edu", color: "from-orange-900 to-amber-700", mascot: "Rattlers", conference: "SWAC", pluguStudents: 1320, liveActivity: "1.6K active now", topMajors: ["Pharmacy", "Business", "Music"] },
  { name: "Talladega College", city: "Talladega, AL", enrollment: "1,200", founded: 1867, acceptance: "29%", tuition: "$14K", website: "talladega.edu", color: "from-rose-900 to-red-700", mascot: "Tornadoes", conference: "GCAC", pluguStudents: 410, liveActivity: "330 active now", topMajors: ["Bio", "Computer Sci", "Edu"] },
  { name: "Tuskegee University", city: "Tuskegee, AL", enrollment: "2,800", founded: 1881, acceptance: "33%", tuition: "$22K", website: "tuskegee.edu", color: "from-red-900 to-rose-800", mascot: "Golden Tigers", conference: "SIAC", pluguStudents: 502, liveActivity: "440 active now", topMajors: ["Vet Med", "Engineering", "Architecture"] },
  { name: "NCCU", city: "Durham, NC", enrollment: "8,100", founded: 1909, acceptance: "44%", tuition: "$21K", website: "nccu.edu", color: "from-emerald-900 to-teal-700", mascot: "Eagles", conference: "MEAC", pluguStudents: 980, liveActivity: "1.1K active now", topMajors: ["Law", "Pharmacy", "Mass Comm"] },
];

export type Internship = {
  id: string;
  role: string;
  company: string;
  location: string;
  type: "Remote" | "Hybrid" | "On-site";
  pay: string;
  deadline: string;
  tag: "Summer" | "Corporate" | "Government" | "Startup" | "Research" | "On-Campus" | "Work Study";
};

export const internships: Internship[] = [
  { id: "i1", role: "SWE Intern", company: "Google", location: "Mountain View, CA", type: "On-site", pay: "$11K/mo", deadline: "Mar 1", tag: "Corporate" },
  { id: "i2", role: "Investment Banking Analyst", company: "Goldman Sachs", location: "New York, NY", type: "On-site", pay: "$95/hr", deadline: "Feb 14", tag: "Corporate" },
  { id: "i3", role: "Policy Fellow", company: "U.S. State Dept.", location: "Washington, DC", type: "Hybrid", pay: "$6K/mo", deadline: "Feb 28", tag: "Government" },
  { id: "i4", role: "Founding Engineer Intern", company: "Caelum AI", location: "Remote", type: "Remote", pay: "$50/hr", deadline: "Rolling", tag: "Startup" },
  { id: "i5", role: "Biomed Research Asst.", company: "NIH", location: "Bethesda, MD", type: "On-site", pay: "$5.2K/mo", deadline: "Apr 1", tag: "Research" },
  { id: "i6", role: "Resident Asst. (RA)", company: "Howard ResLife", location: "On-Campus", type: "On-site", pay: "Housing + stipend", deadline: "Mar 15", tag: "On-Campus" },
  { id: "i7", role: "Library Aide", company: "Spelman Libraries", location: "On-Campus", type: "On-site", pay: "$15/hr", deadline: "Feb 10", tag: "Work Study" },
  { id: "i8", role: "Marketing Intern", company: "Nike", location: "Beaverton, OR", type: "Hybrid", pay: "$8K/mo", deadline: "Feb 20", tag: "Summer" },
];

export const internshipFilters = ["All", "Remote", "Summer", "Corporate", "Government", "Startup", "Research", "On-Campus", "Work Study"] as const;

export type ScholarshipItem = {
  id: string;
  name: string;
  amount: string;
  deadline: string;
  category: "National" | "School" | "Minority" | "Business" | "Engineering" | "Medical" | "Law" | "STEM" | "Arts" | "Athletics" | "Need-Based" | "Merit-Based";
  org: string;
};

export const scholarshipsList: ScholarshipItem[] = [
  { id: "s1", name: "Thurgood Marshall Scholarship", amount: "$6,200", deadline: "May 31", category: "National", org: "TMCF" },
  { id: "s2", name: "UNCF/Mellon Mays", amount: "$5,000", deadline: "Mar 31", category: "Merit-Based", org: "UNCF" },
  { id: "s3", name: "Tom Joyner Full Ride", amount: "Full Tuition", deadline: "Apr 15", category: "Merit-Based", org: "Tom Joyner Foundation" },
  { id: "s4", name: "Jackie Robinson Foundation", amount: "$30,000", deadline: "Feb 15", category: "Minority", org: "JRF" },
  { id: "s5", name: "Ron Brown Scholar", amount: "$40,000", deadline: "Jan 9", category: "National", org: "Ron Brown" },
  { id: "s6", name: "BHW STEM Scholarship", amount: "$3,000", deadline: "Apr 15", category: "STEM", org: "BHW Group" },
  { id: "s7", name: "NMF Medical Scholarship", amount: "$10,000", deadline: "Mar 1", category: "Medical", org: "Nat'l Medical" },
  { id: "s8", name: "ABA Legal Diversity", amount: "$15,000", deadline: "Mar 31", category: "Law", org: "American Bar Assn." },
  { id: "s9", name: "PlugU Founders Grant", amount: "$2,500", deadline: "Open", category: "Business", org: "PlugU", },
];

export const scholarshipCategories = ["All", "National", "School", "Minority", "Business", "Engineering", "Medical", "Law", "STEM", "Arts", "Athletics", "Need-Based", "Merit-Based"] as const;

export type BlackBiz = {
  id: string;
  name: string;
  owner: string;
  category: string;
  school: string;
  verified?: boolean;
  followers: string;
};

export const blackBusinesses: BlackBiz[] = [
  { id: "b1", name: "Crowned Curls Co.", owner: "Ayanna B.", category: "Hair", school: "Spelman", verified: true, followers: "8.4K" },
  { id: "b2", name: "Stitch & Soul", owner: "Jordan T.", category: "Fashion", school: "Howard", verified: true, followers: "12.1K" },
  { id: "b3", name: "Vault Sound", owner: "Trey L.", category: "Music", school: "Morehouse", followers: "3.2K" },
  { id: "b4", name: "The Plug Eats", owner: "Maya G.", category: "Food", school: "Howard", verified: true, followers: "5.9K" },
  { id: "b5", name: "PixelMade Studios", owner: "Devon W.", category: "Technology", school: "FAMU", followers: "1.8K" },
  { id: "b6", name: "Lens by Imani", owner: "Imani K.", category: "Photographer", school: "Hampton", verified: true, followers: "9.7K" },
  { id: "b7", name: "Fade God", owner: "Quincy R.", category: "Barber", school: "Talladega", followers: "2.4K" },
  { id: "b8", name: "Luxe Nails", owner: "Brielle A.", category: "Nail Tech", school: "Spelman", verified: true, followers: "6.1K" },
  { id: "b9", name: "Quad Tutors", owner: "Solomon E.", category: "Tutor", school: "NCCU", followers: "910" },
  { id: "b10", name: "Sable Canvas", owner: "Naima O.", category: "Artist", school: "Tuskegee", followers: "4.4K" },
  { id: "b11", name: "House of Hosts", owner: "Cam D.", category: "Event Host", school: "FAMU", followers: "7.2K" },
];

export type NetProfile = {
  id: string;
  name: string;
  role: string;
  company: string;
  school: string;
  tag: "Mentor" | "Entrepreneur" | "Athlete" | "Artist" | "Investor" | "Recruiter" | "Founder" | "Creator" | "Professional" | "Study Partner";
  bio: string;
};

export const networkingProfiles: NetProfile[] = [
  { id: "p1", name: "Kendra A.", role: "Sr. PM", company: "Meta", school: "Howard '19", tag: "Mentor", bio: "Helping HBCU grads break into Big Tech PM roles." },
  { id: "p2", name: "Marcus J.", role: "Founder & CEO", company: "Caelum AI", school: "Morehouse '22", tag: "Founder", bio: "Building AI infra. Hiring interns." },
  { id: "p3", name: "Jada R.", role: "Forward · WNBA", company: "Atlanta Dream", school: "Spelman '23", tag: "Athlete", bio: "Open to NIL collabs with HBCU creatives." },
  { id: "p4", name: "Solomon E.", role: "Partner", company: "Harlem Capital", school: "Hampton '14", tag: "Investor", bio: "Investing in Black-founded pre-seed startups." },
  { id: "p5", name: "Imani K.", role: "Creative Director", company: "Self", school: "FAMU '21", tag: "Creator", bio: "Editorial photography + brand worlds." },
  { id: "p6", name: "Trey L.", role: "University Recruiter", company: "Goldman Sachs", school: "Howard '18", tag: "Recruiter", bio: "DM me about IBD summer analyst spots." },
  { id: "p7", name: "Naima O.", role: "Visual Artist", company: "Sable Canvas", school: "Tuskegee '23", tag: "Artist", bio: "Commissions open. Murals + fine art." },
  { id: "p8", name: "Devon W.", role: "Pre-Med · Junior", company: "—", school: "Spelman '26", tag: "Study Partner", bio: "MCAT prep group meets Sundays at the Cafe." },
];

export const networkingFilters = ["All", "Mentor", "Founder", "Investor", "Recruiter", "Athlete", "Creator", "Artist", "Entrepreneur", "Professional", "Study Partner"] as const;

export type LiveEvent = {
  id: string;
  title: string;
  type: "Homecoming" | "Step Show" | "Concert" | "Career Fair" | "Tailgate" | "Org Event" | "Mixer" | "Volunteer" | "Tour";
  school: string;
  when: string;
  where: string;
  rsvp: number;
};

export const liveEvents: LiveEvent[] = [
  { id: "e1", title: "Howard Homecoming Yard Fest", type: "Homecoming", school: "Howard", when: "Sat · 12pm", where: "The Yard", rsvp: 2840 },
  { id: "e2", title: "AKA vs. Delta Step Show", type: "Step Show", school: "Spelman", when: "Fri · 8pm", where: "Sisters Chapel", rsvp: 1620 },
  { id: "e3", title: "J. Cole Surprise Concert", type: "Concert", school: "Morehouse", when: "Sun · 9pm", where: "Forbes Arena", rsvp: 4910 },
  { id: "e4", title: "Big 4 Career Fair", type: "Career Fair", school: "FAMU", when: "Thu · 10am", where: "Grand Ballroom", rsvp: 980 },
  { id: "e5", title: "Pre-Game Tailgate", type: "Tailgate", school: "Jackson State", when: "Sat · 9am", where: "Lot D", rsvp: 1240 },
  { id: "e6", title: "Black Founders Mixer", type: "Mixer", school: "Hampton", when: "Wed · 7pm", where: "Innovation Hub", rsvp: 320 },
  { id: "e7", title: "MLK Day of Service", type: "Volunteer", school: "All", when: "Mon · 8am", where: "Citywide", rsvp: 1610 },
];

export const pluguDailyTopics = [
  { tag: "Stocks", title: "S&P closes at all-time high — what students should know", time: "1h" },
  { tag: "Crypto", title: "BTC reclaims $120K as ETF inflows accelerate", time: "2h" },
  { tag: "AI", title: "OpenAI launches free student tier with GPT-6", time: "3h" },
  { tag: "Careers", title: "5 résumé moves that land HBCU grads at FAANG", time: "4h" },
  { tag: "Money", title: "How to build credit before you graduate", time: "5h" },
  { tag: "Culture", title: "The new Black music economy is HBCU-built", time: "6h" },
  { tag: "Politics", title: "Pell Grant cap raised — what it means for you", time: "8h" },
  { tag: "Entrepreneurship", title: "From dorm to $1M ARR: a Hampton senior's story", time: "10h" },
];

export const aiSuggestedPrompts = [
  "What scholarships fit me?",
  "Find internships near me.",
  "What events are tonight?",
  "Which HBCU has the best business program?",
  "What football games are today?",
  "What majors does Howard offer?",
  "How do I transfer to an HBCU?",
  "What companies are recruiting HBCU students?",
];
/* ============================================================
   PHASE 3 — HBCUS exclusive additions
============================================================ */

export const hbcusHomeSections = [
  "Home", "News", "Sports", "Schools", "Communities", "Marketplace",
  "Events", "Scholarships", "Internships", "Alumni", "Excellence",
  "Rankings", "Networking", "PlugU Daily",
] as const;
export type HbcusHomeSection = (typeof hbcusHomeSections)[number];

export const breakingNews = [
  { id: "br1", title: "Vice President addresses HBCU summit at Howard tonight", time: "12m", school: "Howard" },
  { id: "br2", title: "FAMU lands $50M federal STEM expansion", time: "47m", school: "FAMU" },
  { id: "br3", title: "Spelman & Morehouse announce joint AI institute", time: "1h", school: "Spelman" },
];

export const announcements = [
  { id: "a1", title: "Spring registration opens Monday 8AM", school: "Howard", tag: "Registrar" },
  { id: "a2", title: "New shuttle route to Aramark dining", school: "Spelman", tag: "Transit" },
  { id: "a3", title: "Library 24/7 hours start Sunday", school: "Talladega", tag: "Academics" },
];

export const homecomingCountdowns = [
  { school: "Howard", days: 12, theme: "Bison Forever" },
  { school: "FAMU", days: 24, theme: "Rattler Reign" },
  { school: "Morehouse", days: 38, theme: "Maroon Pride" },
];

export const successStories = [
  { id: "ss1", name: "Aaliyah Pierce", school: "Hampton '24", note: "Signed offer letter at Apple — first in family." },
  { id: "ss2", name: "Devon Whitaker", school: "FAMU '25", note: "Closed first $10K month with PixelMade Studios." },
  { id: "ss3", name: "Brielle Akins", school: "Spelman '26", note: "Luxe Nails crosses 1K bookings on PlugU." },
];

export const trendingConvos = [
  { id: "tc1", title: "Best HBCU homecoming in 2026?", replies: 412 },
  { id: "tc2", title: "How are y'all paying for grad school?", replies: 289 },
  { id: "tc3", title: "Dorm tips for incoming Bison freshmen", replies: 167 },
];

export const dailyMotivation = [
  "You are not the sum of your circumstances. You are the sum of your decisions.",
  "Excellence is the gradual result of always striving to do better.",
  "We are the dream and the hope of the slave.",
  "Lift as you climb.",
];

/* === School Communities === */
export type CommunityFeedItem = { id: string; user: string; tag: string; post: string; likes: number; time: string };
export const communityFeedSample: CommunityFeedItem[] = [
  { id: "cf1", user: "Maya G.", tag: "Marketplace", post: "Plates ready by 7 — DM the plug 🍝", likes: 184, time: "8m" },
  { id: "cf2", user: "Quincy R.", tag: "Greek Life", post: "Probate dropping Friday at the Yard 👀", likes: 921, time: "1h" },
  { id: "cf3", user: "Solomon E.", tag: "Study", post: "MCAT group meets at the Cafe, 6pm", likes: 42, time: "2h" },
];

export const communityRails = [
  "School Feed", "Marketplace", "Student Businesses", "Athletics", "Organizations",
  "Greek Life", "Events", "Campus News", "Alumni", "Lost & Found", "Campus Alerts", "Discussions",
] as const;

/* === Alumni Network === */
export type Alum = {
  id: string; name: string; school: string; year: string; company: string;
  role: string; industry: "Tech" | "Finance" | "Media" | "Healthcare" | "Law" | "Engineering" | "Entrepreneurship" | "Sports";
  location: string; offers: ("Mentorship" | "Internships" | "Jobs" | "Investment")[];
};
export const alumniNetwork: Alum[] = [
  { id: "al1", name: "Kendra Allen", school: "Howard", year: "2019", company: "Meta", role: "Senior PM", industry: "Tech", location: "Menlo Park, CA", offers: ["Mentorship", "Jobs"] },
  { id: "al2", name: "Marcus Jenkins", school: "Morehouse", year: "2022", company: "Caelum AI", role: "Founder & CEO", industry: "Entrepreneurship", location: "NYC", offers: ["Internships", "Investment"] },
  { id: "al3", name: "Jada Reed", school: "Spelman", year: "2023", company: "Atlanta Dream", role: "Forward · WNBA", industry: "Sports", location: "Atlanta, GA", offers: ["Mentorship"] },
  { id: "al4", name: "Solomon Estes", school: "Hampton", year: "2014", company: "Harlem Capital", role: "Partner", industry: "Finance", location: "NYC", offers: ["Investment", "Mentorship"] },
  { id: "al5", name: "Trey Lewis", school: "Howard", year: "2018", company: "Goldman Sachs", role: "University Recruiter", industry: "Finance", location: "NYC", offers: ["Jobs", "Internships"] },
  { id: "al6", name: "Imani Knox", school: "FAMU", year: "2021", company: "Self", role: "Creative Director", industry: "Media", location: "LA", offers: ["Mentorship"] },
  { id: "al7", name: "Naima Owens", school: "Tuskegee", year: "2023", company: "Sable Canvas", role: "Visual Artist", industry: "Entrepreneurship", location: "Atlanta, GA", offers: ["Mentorship"] },
  { id: "al8", name: "Dr. Renee Carter", school: "NCCU", year: "2008", company: "Duke Health", role: "Cardiologist", industry: "Healthcare", location: "Durham, NC", offers: ["Mentorship"] },
];
export const alumniIndustries = ["All", "Tech", "Finance", "Media", "Healthcare", "Law", "Engineering", "Entrepreneurship", "Sports"] as const;

/* === Black Excellence Hub === */
export type ExcellenceItem = {
  id: string; name: string; school: string;
  category: "Entrepreneur" | "Artist" | "Athlete" | "Researcher" | "Faculty" | "Alumni" | "Business" | "Historical";
  highlight: string;
};
export const excellenceFeed: ExcellenceItem[] = [
  { id: "ex1", name: "Marcus Jenkins", school: "Morehouse", category: "Entrepreneur", highlight: "Closed $40M Series B for Caelum AI." },
  { id: "ex2", name: "Naima Owens", school: "Tuskegee", category: "Artist", highlight: "Solo show at the High Museum next spring." },
  { id: "ex3", name: "Marcus Jordan", school: "Howard", category: "Athlete", highlight: "First Bison QB drafted in 25 years." },
  { id: "ex4", name: "Dr. Lela Brown", school: "Spelman", category: "Researcher", highlight: "Sickle cell breakthrough published in Nature." },
  { id: "ex5", name: "Prof. Ade Okafor", school: "FAMU", category: "Faculty", highlight: "MacArthur 'Genius' grant recipient 2026." },
  { id: "ex6", name: "Aaliyah Pierce", school: "Hampton", category: "Alumni", highlight: "Apple SWE — first in family college grad." },
  { id: "ex7", name: "Crowned Curls Co.", school: "Spelman", category: "Business", highlight: "Ulta national distribution deal." },
  { id: "ex8", name: "Mary McLeod Bethune", school: "Bethune-Cookman", category: "Historical", highlight: "Founder. Educator. Stateswoman." },
];
export const excellenceCategories = ["All", "Entrepreneur", "Artist", "Athlete", "Researcher", "Faculty", "Alumni", "Business", "Historical"] as const;

/* === HBCUS National Rankings === */
export type RankingCategory =
  | "Campus Economy" | "Student Businesses" | "Marketplace Activity"
  | "Student Engagement" | "Athletic Success" | "Fastest Growing";
export const rankingCategories: RankingCategory[] = [
  "Campus Economy", "Student Businesses", "Marketplace Activity",
  "Student Engagement", "Athletic Success", "Fastest Growing",
];
export const hbcusRankings: Record<RankingCategory, { school: string; metric: string; delta: string }[]> = {
  "Campus Economy": [
    { school: "Howard", metric: "$842K", delta: "+18%" },
    { school: "FAMU", metric: "$612K", delta: "+24%" },
    { school: "Spelman", metric: "$498K", delta: "+9%" },
    { school: "Hampton", metric: "$412K", delta: "+12%" },
    { school: "Morehouse", metric: "$388K", delta: "+15%" },
  ],
  "Student Businesses": [
    { school: "Howard", metric: "412 active", delta: "+32" },
    { school: "Spelman", metric: "318 active", delta: "+24" },
    { school: "FAMU", metric: "289 active", delta: "+19" },
    { school: "Morehouse", metric: "211 active", delta: "+14" },
    { school: "Talladega", metric: "94 active", delta: "+8" },
  ],
  "Marketplace Activity": [
    { school: "FAMU", metric: "2.4K orders", delta: "+41%" },
    { school: "Howard", metric: "2.1K orders", delta: "+22%" },
    { school: "Hampton", metric: "1.3K orders", delta: "+18%" },
    { school: "NCCU", metric: "1.1K orders", delta: "+14%" },
    { school: "Tuskegee", metric: "0.8K orders", delta: "+9%" },
  ],
  "Student Engagement": [
    { school: "Spelman", metric: "92 DAU/100", delta: "+4" },
    { school: "Morehouse", metric: "88 DAU/100", delta: "+3" },
    { school: "Howard", metric: "86 DAU/100", delta: "+5" },
    { school: "FAMU", metric: "81 DAU/100", delta: "+6" },
    { school: "Hampton", metric: "78 DAU/100", delta: "+2" },
  ],
  "Athletic Success": [
    { school: "Jackson State", metric: "9-1 FB", delta: "↑2" },
    { school: "Howard", metric: "7-2 FB", delta: "↑1" },
    { school: "Southern", metric: "8-2 FB", delta: "→" },
    { school: "NCCU", metric: "6-3 FB", delta: "↑3" },
    { school: "FAMU", metric: "6-4 FB", delta: "↓1" },
  ],
  "Fastest Growing": [
    { school: "Talladega", metric: "PlugU users", delta: "+62%" },
    { school: "Tuskegee", metric: "PlugU users", delta: "+48%" },
    { school: "NCCU", metric: "PlugU users", delta: "+39%" },
    { school: "Hampton", metric: "PlugU users", delta: "+27%" },
    { school: "FAMU", metric: "PlugU users", delta: "+21%" },
  ],
};
