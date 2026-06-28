export type NewsTab =
  | "Campus" | "PlugU" | "HBCU" | "Money" | "Stocks" | "Careers"
  | "Scholarships" | "Grants" | "Real World" | "Culture" | "Sports";

export type NewsFilter =
  | "My Campus" | "My State" | "HBCUs" | "National" | "Business" | "Opportunities";

export type Article = {
  id: string;
  tab: NewsTab;
  filters: NewsFilter[];
  headline: string;
  summary: string;
  source: string;
  time: string;     // "2h", "1d"
  thumb: string;    // emoji used as fallback thumbnail
  accent?: "gold" | "purple";
};

export const newsTabs: NewsTab[] = [
  "Campus", "PlugU", "HBCU", "Money", "Stocks", "Careers",
  "Scholarships", "Grants", "Real World", "Culture", "Sports",
];

export const newsFilters: NewsFilter[] = [
  "My Campus", "My State", "HBCUs", "National", "Business", "Opportunities",
];

export const articles: Article[] = [
  { id: "n1", tab: "Campus", filters: ["My Campus"], headline: "Homecoming parade route updated", summary: "The new route loops past the Quad and Student Center. Tap for full map.", source: "Campus Comms", time: "2h", thumb: "🎉", accent: "gold" },
  { id: "n2", tab: "Campus", filters: ["My Campus", "My State"], headline: "Library extends hours through midterms", summary: "Founders Library open until 2am Sun–Thu starting next week.", source: "Student Affairs", time: "5h", thumb: "📚" },
  { id: "n3", tab: "PlugU", filters: ["HBCUs"], headline: "PlugU x HBCU Founders Grant launches", summary: "Five student-owned businesses awarded $2,500 each, every month.", source: "PlugU News", time: "1d", thumb: "🔌", accent: "purple" },
  { id: "n4", tab: "PlugU", filters: ["HBCUs", "Business"], headline: "PlugU hits 50 verified campuses", summary: "More vendors, faster bookings, deeper student deals across the network.", source: "PlugU News", time: "3d", thumb: "🏛️" },
  { id: "n5", tab: "HBCU", filters: ["HBCUs", "National"], headline: "HBCU enrollment hits a 10-year high", summary: "Applications up double digits at Howard, Spelman, and FAMU.", source: "Atlanta Beat", time: "1d", thumb: "🎓", accent: "gold" },
  { id: "n6", tab: "HBCU", filters: ["HBCUs"], headline: "Morehouse partners with a major tech firm", summary: "Joint research lab brings 40 student fellowships next semester.", source: "Campus Wire", time: "2d", thumb: "🤝" },
  { id: "n7", tab: "Money", filters: ["National", "Business"], headline: "Fed signals slower rate path", summary: "Markets rally as inflation cools; student loans rates unchanged.", source: "Reuters", time: "1h", thumb: "💵" },
  { id: "n8", tab: "Money", filters: ["Business"], headline: "Why 'side hustle' income now needs a 1099-K", summary: "What student sellers should know about reporting Venmo + PlugU earnings.", source: "PlugU Money", time: "4h", thumb: "🧾" },
  { id: "n9", tab: "Stocks", filters: ["National", "Business"], headline: "Nvidia, Apple lift S&P to a record close", summary: "Tech rally continues; AI names lead the tape into the close.", source: "Bloomberg", time: "30m", thumb: "📈", accent: "gold" },
  { id: "n10", tab: "Stocks", filters: ["Business"], headline: "Student investing club beats S&P 3 quarters running", summary: "Spelman portfolio up 18% YTD on smart energy and AI picks.", source: "PlugU News", time: "1d", thumb: "💹" },
  { id: "n11", tab: "Careers", filters: ["Opportunities", "National"], headline: "Google BOLD Internship now open", summary: "Paid summer program for HBCU rising juniors. Rolling reviews.", source: "Google Careers", time: "6h", thumb: "💼", accent: "purple" },
  { id: "n12", tab: "Careers", filters: ["Opportunities", "My Campus"], headline: "Capital One on-campus interviews next week", summary: "Sign up in the Career Center — product, design, engineering tracks.", source: "Career Services", time: "1d", thumb: "🧑‍💻" },
  { id: "n13", tab: "Scholarships", filters: ["Opportunities", "HBCUs"], headline: "UNCF / Wells Fargo Scholarship — $5,000", summary: "Open to sophomores and juniors with a 3.0+ GPA. Short essay.", source: "UNCF", time: "Deadline Fri", thumb: "🏆", accent: "gold" },
  { id: "n14", tab: "Scholarships", filters: ["Opportunities"], headline: "Tom Joyner Foundation — rolling award", summary: "$2,500 awarded monthly to HBCU students in good standing.", source: "Tom Joyner Foundation", time: "Rolling", thumb: "🎖️" },
  { id: "n15", tab: "Grants", filters: ["Opportunities", "Business"], headline: "PlugU Founders Grant — $2,500 / month", summary: "For student-owned businesses listed on PlugU Market.", source: "PlugU", time: "Rolling", thumb: "💸", accent: "purple" },
  { id: "n16", tab: "Grants", filters: ["Opportunities", "HBCUs"], headline: "New federal STEM grant boosts 4 HBCUs", summary: "$12M earmarked for AI, biotech, and clean energy programs.", source: "AP", time: "2d", thumb: "🔬" },
  { id: "n17", tab: "Real World", filters: ["National"], headline: "Senate passes student housing relief bill", summary: "Caps off-campus rent increases near federally funded campuses.", source: "NPR", time: "3h", thumb: "🏠" },
  { id: "n18", tab: "Real World", filters: ["National"], headline: "Voter registration deadline this Friday", summary: "Register on campus at the Student Center, or online in 2 minutes.", source: "Campus Civic Hub", time: "1d", thumb: "🗳️" },
  { id: "n19", tab: "Culture", filters: ["HBCUs"], headline: "Spelhouse Battle of the Bands sells out in 1 hour", summary: "Resale capped at face value through the PlugU ticket exchange.", source: "PlugU Culture", time: "2h", thumb: "🎺", accent: "gold" },
  { id: "n20", tab: "Culture", filters: ["National"], headline: "Black indie film festival comes to Atlanta", summary: "Free student passes available with .edu verification.", source: "Atlanta Beat", time: "1d", thumb: "🎬" },
  { id: "n21", tab: "Sports", filters: ["HBCUs", "My Campus"], headline: "Homecoming football: Tigers vs Bulldogs", summary: "Kickoff Saturday 2pm. Student section opens at noon.", source: "Athletics", time: "1d", thumb: "🏈", accent: "purple" },
  { id: "n22", tab: "Sports", filters: ["HBCUs", "National"], headline: "HBCU basketball preseason rankings drop", summary: "Howard, Norfolk State, and FAMU top the MEAC list.", source: "ESPN", time: "2d", thumb: "🏀" },
];