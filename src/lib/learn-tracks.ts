// PlugU learn tracks — the real content behind the home slideshow cards.
// Each track is an ordered deck of slides students swipe through.
export type LearnSlide = {
  kicker: string;
  title: string;
  body: string;
  points?: string[];
  note?: string;
};

export type LearnTrack = {
  slug: "business-101" | "investing" | "motivation" | "budget";
  name: string;
  tagline: string;
  cta: string;
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

export function getLearnTrack(slug: string): LearnTrack | undefined {
  return learnTracks.find((t) => t.slug === slug);
}
