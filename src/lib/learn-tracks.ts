// PlugU learn tracks — the real content behind the home slideshow cards.
// Each track is an ordered deck of slides students swipe through.
export type LearnSlide = {
  kicker: string;
  title: string;
  body: string;
  points?: string[];
  note?: string;
};

export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  why: string;
};

export type GlossaryTerm = { term: string; def: string };

export type LearnTrack = {
  slug: "business-101" | "investing" | "motivation" | "budget";
  name: string;
  tagline: string;
  cta: string;
  /** Shown as a persistent banner on every slide (used for investing). */
  disclaimer?: string;
  glossary?: GlossaryTerm[];
  quiz?: QuizQuestion[];
  slides: LearnSlide[];
};

export const learnTracks: LearnTrack[] = [
  {
    slug: "business-101",
    name: "Business 101",
    tagline: "Start a business from your dorm and sell it on PlugU.",
    cta: "Business 101",
    slides: [
      {
        kicker: "Step 1",
        title: "Start with a problem you already solve",
        body: "The best student businesses come from something people already text you about — fades, lashes, plates, rides, tutoring, photos, nails, tech help.",
        points: [
          "Write the exact problem in one sentence.",
          "Name three people on campus who have it today.",
          "Charge them a real price this week — not 'free for practice'.",
        ],
      },
      {
        kicker: "Step 2",
        title: "Price it so you actually make money",
        body: "Price = materials + your time + a profit cushion. Most students undercharge because they forget their own hours.",
        points: [
          "Add up supplies per job.",
          "Pay yourself at least $20/hr of active work.",
          "Add 20–30% profit on top. That's your price.",
        ],
        note: "Raise prices $5 every 20 completed jobs.",
      },
      {
        kicker: "Step 3",
        title: "Make it legit",
        body: "You can operate as a sole proprietor day one, but going formal protects you and unlocks business banking.",
        points: [
          "Get an EIN free at irs.gov (10 minutes).",
          "Register an LLC in your state when you clear ~$5K/yr.",
          "Open a separate business checking account — never mix money.",
          "Save 25–30% of profit for taxes.",
        ],
      },
      {
        kicker: "Step 4",
        title: "Set up shop on PlugU",
        body: "Your PlugU storefront is the business. Verified .edu buyers, in-app payments, reviews and receipts all in one place.",
        points: [
          "Seller dashboard → create your first listing.",
          "Add 3+ real photos and a clear price.",
          "Turn on Available Now when you're free — you show up on the campus map.",
          "Post a Flash Drop when you need bookings today.",
        ],
      },
      {
        kicker: "Step 5",
        title: "Get your first 10 customers",
        body: "Ten happy customers beats a thousand followers. Reviews are the engine of your PlugScore.",
        points: [
          "Offer your first 5 a founding-customer rate.",
          "Ask every buyer for a review inside PlugU right after the job.",
          "Post your work to Campus Posts twice a week.",
          "Refer a friend seller — both of you rank higher on the leaderboard.",
        ],
      },
      {
        kicker: "Step 6",
        title: "Run it like an operator",
        body: "Track the numbers weekly so the hustle turns into a real business.",
        points: [
          "Revenue, costs, profit — one spreadsheet, updated Sundays.",
          "Watch your peak selling hour in Seller Analytics and staff it.",
          "Reinvest 20% into supplies, gear or ads.",
          "When you're booked out 2 weeks straight, raise prices or hire help.",
        ],
      },
    ],
  },
  {
    slug: "investing",
    name: "Investing & Stocks",
    tagline: "Learn how investing actually works before you put a dollar in.",
    cta: "Stocks & Investing",
    slides: [
      {
        kicker: "Concept",
        title: "What a stock really is",
        body: "A share of stock is a slice of ownership in a company. You make money two ways: the price goes up (capital gains) or the company pays you part of its profit (dividends).",
        points: [
          "Shares = ownership, not a lottery ticket.",
          "Price moves on expectations of future profit.",
          "You only lock in a gain or loss when you sell.",
        ],
      },
      {
        kicker: "Concept",
        title: "Compound growth is the whole point",
        body: "Your returns start earning returns. Time in the market matters more than timing it.",
        points: [
          "$50/month at 8% from age 19 → about $250K by 60.",
          "The same $50 started at 30 → roughly $105K.",
          "Starting early beats investing more later.",
        ],
        note: "Illustrative math at a historical average return. Markets are not guaranteed.",
      },
      {
        kicker: "Types",
        title: "The main things you can own",
        body: "Know what's in your account before you buy it.",
        points: [
          "Individual stocks — one company, highest risk.",
          "Index funds / ETFs — hundreds of companies in one buy (S&P 500).",
          "Bonds — you lend money, get interest, lower risk.",
          "REITs — real estate without buying property.",
          "Crypto — highly volatile; only money you can lose.",
        ],
      },
      {
        kicker: "Accounts",
        title: "Where you invest matters as much as what",
        body: "The account wrapper decides your taxes.",
        points: [
          "Roth IRA — post-tax money, grows tax-free. Elite for students in a low tax bracket.",
          "Brokerage — flexible, taxed on gains.",
          "401(k) — if a job matches, that's an instant 100% return. Take it.",
          "HSA — triple tax advantage if you have a high-deductible plan.",
        ],
      },
      {
        kicker: "Strategy",
        title: "Dollar-cost averaging",
        body: "Invest the same amount on the same day every month, regardless of the news. It removes emotion and averages out your buy price.",
        points: [
          "Automate $25–$100 per month.",
          "Never try to time the bottom.",
          "Keep contributing when the market drops — that's the discount.",
        ],
      },
      {
        kicker: "Risk",
        title: "Diversification and your risk tolerance",
        body: "Don't put everything into one name, one industry, or one meme.",
        points: [
          "A broad index fund is instant diversification.",
          "Keep an emergency fund in cash before investing.",
          "Rule of thumb: if a 30% drop would make you sell, invest less.",
          "Watch fees — a 1% expense ratio eats years of gains.",
        ],
      },
      {
        kicker: "Start",
        title: "Your first 30 days",
        body: "A simple, boring plan that works.",
        points: [
          "Week 1: build a $300 emergency buffer.",
          "Week 2: open a Roth IRA at a no-fee brokerage.",
          "Week 3: set up an automatic $25 monthly buy of a total-market or S&P 500 index fund.",
          "Week 4: don't check it. Keep building your PlugU income.",
        ],
        note: "Educational only — PlugU is not a financial advisor.",
      },
    ],
  },
  {
    slug: "motivation",
    name: "Daily Motivation",
    tagline: "Books by Black authors that build your mind and your bag.",
    cta: "Daily Motivation",
    slides: [
      {
        kicker: "Mindset",
        title: "Think and Grow Rich: A Black Choice — Dennis Kimbro",
        body: "Kimbro studied Black achievers across America and mapped the habits behind their success. The blueprint book for building wealth with your mind first.",
        note: "Read it when you need proof it's been done before.",
      },
      {
        kicker: "Money",
        title: "The Black Girl's Guide to Financial Freedom — Paris Woods",
        body: "A step-by-step path from student debt to real assets, written for Black women who were never taught this at home or in school.",
      },
      {
        kicker: "Business",
        title: "Black Faces in White Places — Randal Pinkett & Jeffrey Robinson",
        body: "Ten strategies for redefining the game instead of just playing it. Built for students walking into rooms nobody prepared them for.",
      },
      {
        kicker: "Discipline",
        title: "The Wealth Choice — Dennis Kimbro",
        body: "Interviews with 1,000 Black millionaires. The recurring theme isn't luck — it's ownership, patience and relentless work.",
      },
      {
        kicker: "Self",
        title: "Their Eyes Were Watching God — Zora Neale Hurston",
        body: "On finding your own voice before you chase anybody else's approval. Still one of the most important books written on the HBCU reading list.",
      },
      {
        kicker: "Legacy",
        title: "The Autobiography of Malcolm X — as told to Alex Haley",
        body: "The most complete story of self-education ever written. He built a mind in the worst conditions imaginable — you have a library and Wi-Fi.",
      },
      {
        kicker: "Purpose",
        title: "Between the World and Me — Ta-Nehisi Coates",
        body: "A letter to his son about the body, the country and what it costs to be free. Short enough to finish in a weekend, heavy enough to stay with you.",
      },
      {
        kicker: "Power",
        title: "Becoming — Michelle Obama",
        body: "From the South Side to the White House. A masterclass in doing the work when nobody's clapping yet.",
      },
      {
        kicker: "Foundation",
        title: "Up From Slavery — Booker T. Washington",
        body: "The founding text of the HBCU tradition — skill, self-reliance and building institutions that outlive you.",
      },
      {
        kicker: "Ownership",
        title: "Our Black Year — Maggie Anderson",
        body: "One family spent a year buying Black only. What she learned about the dollar's circulation is the whole argument for shopping your campus first.",
      },
    ],
  },
  {
    slug: "budget",
    name: "Budget Smarter",
    tagline: "Cheap subscriptions, real budgeting, and help when money's short.",
    cta: "Budget Smarter",
    slides: [
      {
        kicker: "Method",
        title: "The student 50/30/20",
        body: "Split every dollar that hits your account the day it lands.",
        points: [
          "50% needs — rent, food, transport, phone.",
          "30% wants — going out, drip, delivery.",
          "20% future — savings, debt, investing.",
          "On a tight semester, run 60/20/20 instead of skipping savings entirely.",
        ],
      },
      {
        kicker: "Subscriptions",
        title: "Student pricing on what you already pay for",
        body: "Your .edu is worth real money every month. These are the standard student rates — verify with your school email.",
        points: [
          "Spotify Premium Student — about $5.99/mo, bundled with Hulu.",
          "Apple Music Student — about $5.99/mo.",
          "YouTube Premium Student — about $7.99/mo.",
          "Amazon Prime Student — 6 months free, then half price.",
          "Adobe Creative Cloud Student — around 60% off the full suite.",
          "Notion, Figma, GitHub Student Pack — free with .edu.",
        ],
        note: "Prices change — always confirm on the provider's student page.",
      },
      {
        kicker: "Cut",
        title: "Audit your subscriptions tonight",
        body: "The average student leaks $40–$80 a month on things they forgot about.",
        points: [
          "Open your bank app and filter recurring charges.",
          "Cancel anything you haven't opened in 30 days.",
          "Downgrade to student or ad-supported tiers.",
          "Split family plans with roommates — one payer, everyone Venmos.",
        ],
      },
      {
        kicker: "Food",
        title: "Eat well for under $50 a week",
        body: "Food is the biggest flexible line in a student budget.",
        points: [
          "Cook 4 base meals on Sunday: rice, beans, chicken, veg.",
          "Use every meal-plan swipe before buying out.",
          "Grocery-store apps (Kroger, Aldi, Walmart) have digital coupons — clip before you go.",
          "Delivery fees + tip = roughly a 40% tax on every meal.",
        ],
      },
      {
        kicker: "Help",
        title: "SNAP and campus food assistance",
        body: "Many college students qualify for SNAP (food stamps) and don't know it. There is no shame in using what you're eligible for.",
        points: [
          "Students enrolled at least half-time may qualify with a work-study award, 20+ hrs/week of work, or a dependent child.",
          "Apply through your state's SNAP office — search '[your state] SNAP apply'.",
          "Most campuses have a free food pantry — check the Dean of Students page.",
          "Ask financial aid about emergency grants; many are unadvertised.",
        ],
        note: "Eligibility rules vary by state. Your school's financial aid office can confirm yours.",
      },
      {
        kicker: "Debt",
        title: "Loans, credit and staying out the hole",
        body: "Borrow federal before private, and never carry a credit card balance.",
        points: [
          "Refresh your FAFSA every year — grants beat loans.",
          "Take subsidized federal loans before unsubsidized, private last.",
          "Credit cards: pay the full statement balance monthly, keep usage under 30%.",
          "Avoid payday and cash-advance apps — the effective rate is brutal.",
        ],
      },
      {
        kicker: "Grow",
        title: "Close the gap with income, not just cuts",
        body: "You can only cut so far. The fastest fix to a broke semester is one more income stream.",
        points: [
          "List a service on PlugU this week — tutoring, hair, food, photos.",
          "One $30 job a week is $480 a semester.",
          "Bank half of every PlugU payout automatically.",
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Disclaimers, glossary and end-of-deck quizzes
// ---------------------------------------------------------------------------

const DISCLAIMERS: Partial<Record<LearnTrack["slug"], string>> = {
  investing:
    "Educational content only. PlugU is not a broker, financial advisor or fiduciary. Nothing here is investment advice or a recommendation to buy or sell any security. All investing carries risk, including the possible loss of your entire principal. Past performance never guarantees future results.",
  "business-101":
    "Educational content only. PlugU does not provide legal, tax or accounting advice — confirm business registration and tax rules with a licensed professional in your state.",
  budget:
    "Educational content only. Prices, benefit rules and eligibility change — always confirm with the provider or your state agency.",
};

const GLOSSARIES: Partial<Record<LearnTrack["slug"], GlossaryTerm[]>> = {
  investing: [
    { term: "Share / Stock", def: "A unit of ownership in a company. Owning one makes you a part-owner of that business." },
    { term: "Index fund", def: "A fund that holds every company in an index (like the S&P 500) so one purchase spreads your money across hundreds of businesses." },
    { term: "ETF", def: "Exchange-Traded Fund — a fund that trades on an exchange like a single stock throughout the day." },
    { term: "Dividend", def: "A cash payment some companies send shareholders out of their profits, usually quarterly." },
    { term: "Capital gain", def: "The profit you make when you sell an investment for more than you paid. It is only realized once you sell." },
    { term: "Compound growth", def: "Growth on your growth — returns that get reinvested and then earn returns of their own." },
    { term: "Dollar-cost averaging", def: "Investing a fixed amount on a fixed schedule so your purchase price averages out over time." },
    { term: "Diversification", def: "Spreading money across many companies, industries and asset types so one failure can't wipe you out." },
    { term: "Volatility", def: "How sharply a price swings up and down. Higher volatility means bigger moves in both directions." },
    { term: "Bear market", def: "A drop of 20% or more from recent highs." },
    { term: "Bull market", def: "A sustained period of rising prices." },
    { term: "Expense ratio", def: "The annual percentage a fund charges you. A 1% ratio costs $10 a year on every $1,000 invested." },
    { term: "Roth IRA", def: "A retirement account funded with money you've already paid tax on; qualified withdrawals later are tax-free." },
    { term: "401(k)", def: "An employer retirement plan. Many employers match part of what you contribute." },
    { term: "Brokerage account", def: "A standard taxable investment account with no contribution limits or withdrawal penalties." },
    { term: "Bond", def: "A loan you make to a government or company in exchange for interest payments." },
    { term: "REIT", def: "Real Estate Investment Trust — a company that owns income-producing property you can buy shares of." },
    { term: "Risk tolerance", def: "How much of a drop you can sit through without panic-selling." },
    { term: "Emergency fund", def: "Cash set aside for surprises, kept out of the market so you never have to sell at a loss." },
    { term: "Prospectus", def: "The legal document describing a fund's holdings, strategy, risks and fees. Read it before you buy." },
  ],
};

const QUIZZES: Record<LearnTrack["slug"], QuizQuestion[]> = {
  "business-101": [
    {
      q: "What's the strongest starting point for a student business?",
      options: ["A trending idea you saw online", "A problem people already ask you to solve", "Whatever has the least competition", "Whatever needs the least work"],
      answer: 1,
      why: "Demand you can already see beats a guess. Start where people are already texting you.",
    },
    {
      q: "How should you price a job?",
      options: ["Match the cheapest person on campus", "Materials only", "Materials + your time + a profit cushion", "Whatever the customer offers"],
      answer: 2,
      why: "Most students forget to pay themselves. Price = supplies + your hours + 20–30% profit.",
    },
    {
      q: "Roughly how much profit should you set aside for taxes?",
      options: ["0%", "5%", "25–30%", "60%"],
      answer: 2,
      why: "Self-employment income isn't withheld for you — bank 25–30% of profit so tax season isn't a crisis.",
    },
    {
      q: "What actually drives your PlugScore as a seller?",
      options: ["Follower count", "Completed orders and real reviews", "How many listings you post", "How often you log in"],
      answer: 1,
      why: "Ten happy customers with reviews beat a thousand followers.",
    },
  ],
  investing: [
    {
      q: "What does owning a share of stock mean?",
      options: ["You lent the company money", "You own a slice of the company", "You're guaranteed a payout", "You control company decisions"],
      answer: 1,
      why: "A share is ownership. Lending money is a bond, not a stock.",
    },
    {
      q: "Which one gives you instant diversification?",
      options: ["One hot tech stock", "A broad index fund", "A single crypto coin", "Your friend's startup"],
      answer: 1,
      why: "An S&P 500 or total-market index fund spreads one purchase across hundreds of companies.",
    },
    {
      q: "Dollar-cost averaging means…",
      options: ["Buying only when prices dip", "Investing a fixed amount on a fixed schedule", "Selling half your position yearly", "Timing the market bottom"],
      answer: 1,
      why: "Same amount, same day, every month — it removes emotion and averages your buy price.",
    },
    {
      q: "Before investing, you should first…",
      options: ["Max out a credit card for leverage", "Build an emergency cash buffer", "Buy the most volatile asset", "Borrow from a payday app"],
      answer: 1,
      why: "Cash for surprises means you never have to sell an investment at a loss.",
    },
    {
      q: "A 1% expense ratio means…",
      options: ["The fund pays you 1%", "You pay $10 a year per $1,000 invested", "A guaranteed 1% return", "A one-time $1 fee"],
      answer: 1,
      why: "Fees compound against you the same way returns compound for you.",
    },
  ],
  motivation: [
    {
      q: "Which author studied 1,000 Black millionaires in The Wealth Choice?",
      options: ["Ta-Nehisi Coates", "Dennis Kimbro", "Paris Woods", "Randal Pinkett"],
      answer: 1,
      why: "Dennis Kimbro's research found ownership, patience and work — not luck — behind the wealth.",
    },
    {
      q: "Black Faces in White Places is built around…",
      options: ["Ten strategies for redefining the game", "A budgeting system", "A stock-picking method", "A memoir of the White House"],
      answer: 0,
      why: "Pinkett and Robinson lay out ten strategies for redefining rooms you weren't prepared for.",
    },
    {
      q: "Which book is the founding text of the HBCU self-reliance tradition?",
      options: ["Becoming", "Between the World and Me", "Up From Slavery", "Our Black Year"],
      answer: 2,
      why: "Booker T. Washington's Up From Slavery is about skill, self-reliance and building institutions.",
    },
    {
      q: "Our Black Year is an argument for…",
      options: ["Index investing", "Circulating dollars in Black-owned businesses", "Moving off campus", "Avoiding credit cards"],
      answer: 1,
      why: "Maggie Anderson's year of buying Black only is the case for shopping your campus first.",
    },
  ],
  budget: [
    {
      q: "In the student 50/30/20 split, what is the 20%?",
      options: ["Going out", "Rent", "Savings, debt and investing", "Groceries"],
      answer: 2,
      why: "Needs 50, wants 30, future 20 — pay the future automatically the day money lands.",
    },
    {
      q: "What's the fastest legit way to cut monthly spend tonight?",
      options: ["Cancel forgotten subscriptions and downgrade to student tiers", "Skip meals", "Open a new credit card", "Use a cash-advance app"],
      answer: 0,
      why: "The average student leaks $40–$80/month on subscriptions they forgot about.",
    },
    {
      q: "Which students may qualify for SNAP?",
      options: ["Nobody in college", "Only graduate students", "Half-time students with work-study, 20+ hrs/week of work, or a dependent child", "Only students with no income at all"],
      answer: 2,
      why: "Eligibility varies by state, but many enrolled students qualify and never apply.",
    },
    {
      q: "The safest borrowing order is…",
      options: ["Private loans, then federal", "Subsidized federal, unsubsidized federal, then private", "Credit cards first", "Payday loans for the gap"],
      answer: 1,
      why: "Grants first, then subsidized federal, unsubsidized federal, and private only as a last resort.",
    },
  ],
};

for (const track of learnTracks) {
  track.disclaimer = DISCLAIMERS[track.slug];
  track.glossary = GLOSSARIES[track.slug];
  track.quiz = QUIZZES[track.slug];
}

// Friendly aliases so shared/typed links land on the right deck instead of 404.
const SLUG_ALIASES: Record<string, LearnTrack["slug"]> = {
  business: "business-101",
  "business101": "business-101",
  invest: "investing",
  stocks: "investing",
  motivate: "motivation",
  daily: "motivation",
  budgeting: "budget",
  "budget-smarter": "budget",
};

export function getLearnTrack(slug: string): LearnTrack | undefined {
  const key = (slug ?? "").toLowerCase();
  const resolved = SLUG_ALIASES[key] ?? key;
  return learnTracks.find((t) => t.slug === resolved);
}
