// Daily Motivation reading list — Black authors only. Every entry is verified
// as written by a Black author; nothing else belongs on this shelf.
export type Book = {
  id: string;
  title: string;
  author: string;
  year: string;
  theme: string;
  about: string;
  quotes: string[];
};

export const BLACK_AUTHOR_BOOKS: Book[] = [
  {
    id: "kimbro-think-grow",
    title: "Think and Grow Rich: A Black Choice",
    author: "Dennis Kimbro",
    year: "1991",
    theme: "Mindset",
    about:
      "Kimbro studied Black achievers across America and mapped the habits behind their success — the blueprint for building wealth with your mind first.",
    quotes: [
      "Life is a self-fulfilling prophecy: you usually get no more than you expect.",
      "Success is not a destination you arrive at — it is the quality of the journey you take.",
    ],
  },
  {
    id: "woods-financial-freedom",
    title: "The Black Girl's Guide to Financial Freedom",
    author: "Paris Woods",
    year: "2021",
    theme: "Money",
    about:
      "A step-by-step path from student debt to real assets, written for Black women who were never taught this at home or in school.",
    quotes: [
      "Debt is not a rite of passage. It is a choice the system hopes you never question.",
      "You do not need a six-figure salary to build wealth. You need a plan you actually follow.",
    ],
  },
  {
    id: "pinkett-black-faces",
    title: "Black Faces in White Places",
    author: "Randal Pinkett & Jeffrey Robinson",
    year: "2010",
    theme: "Business",
    about:
      "Ten strategies for redefining the game instead of just playing it — built for students walking into rooms nobody prepared them for.",
    quotes: [
      "Establish a strong identity and purpose before you walk into any room.",
      "Don't just play the game — redefine it.",
    ],
  },
  {
    id: "kimbro-wealth-choice",
    title: "The Wealth Choice",
    author: "Dennis Kimbro",
    year: "2013",
    theme: "Discipline",
    about:
      "Interviews with 1,000 Black millionaires. The recurring theme isn't luck — it's ownership, patience and relentless work.",
    quotes: [
      "The wealthy are not lucky. They are early, consistent and patient.",
      "Wealth is what you keep, not what you spend.",
    ],
  },
  {
    id: "hurston-their-eyes",
    title: "Their Eyes Were Watching God",
    author: "Zora Neale Hurston",
    year: "1937",
    theme: "Self",
    about:
      "On finding your own voice before you chase anybody else's approval — still one of the most important books on the HBCU reading list.",
    quotes: [
      "There are years that ask questions and years that answer.",
      "Two things everybody's got tuh do fuh theyselves. They got tuh go tuh God, and they got tuh find out about livin' fuh theyselves.",
    ],
  },
  {
    id: "malcolm-x",
    title: "The Autobiography of Malcolm X",
    author: "Malcolm X with Alex Haley",
    year: "1965",
    theme: "Legacy",
    about:
      "The most complete story of self-education ever written. He built a mind in the worst conditions imaginable — you have a library and Wi-Fi.",
    quotes: [
      "Education is our passport to the future, for tomorrow belongs to the people who prepare for it today.",
      "My alma mater was books, a good library.",
    ],
  },
  {
    id: "coates-between",
    title: "Between the World and Me",
    author: "Ta-Nehisi Coates",
    year: "2015",
    theme: "Purpose",
    about:
      "A letter to his son about the body, the country and what it costs to be free. Short enough to finish in a weekend, heavy enough to stay with you.",
    quotes: [
      "You must struggle to truly remember this past in all its nuance, error, and humanity.",
      "The struggle is really all I have for you because it is the only portion of this world under your control.",
    ],
  },
  {
    id: "obama-becoming",
    title: "Becoming",
    author: "Michelle Obama",
    year: "2018",
    theme: "Power",
    about: "From the South Side to the White House — a masterclass in doing the work when nobody's clapping yet.",
    quotes: [
      "Failure is a feeling long before it becomes an actual result.",
      "For me, becoming isn't about arriving somewhere or achieving a certain aim.",
    ],
  },
  {
    id: "washington-up-from",
    title: "Up From Slavery",
    author: "Booker T. Washington",
    year: "1901",
    theme: "Foundation",
    about: "The founding text of the HBCU tradition — skill, self-reliance and building institutions that outlive you.",
    quotes: [
      "Success is to be measured not so much by the position that one has reached in life as by the obstacles overcome.",
      "There is as much dignity in tilling a field as in writing a poem.",
    ],
  },
  {
    id: "anderson-our-black-year",
    title: "Our Black Year",
    author: "Maggie Anderson",
    year: "2012",
    theme: "Ownership",
    about:
      "One family spent a year buying Black only. What she learned about the dollar's circulation is the whole argument for shopping your campus first.",
    quotes: [
      "A dollar spent with a Black-owned business circulates far longer in the community that needs it.",
      "Buying is a form of voting. Most of us vote without thinking.",
    ],
  },
];

/** Deterministic-free shuffle for the "shuffle recommendations" control. */
export function shuffleBooks(books: Book[]): Book[] {
  const a = [...books];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
