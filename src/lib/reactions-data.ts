export type ReactionKind = "helpful" | "loved" | "didnt" | "funny" | "surprised";

export const REACTIONS: { kind: ReactionKind; emoji: string; label: string; color: string }[] = [
  { kind: "helpful", emoji: "👍", label: "Helpful", color: "text-sky-400" },
  { kind: "loved", emoji: "❤️", label: "Loved It", color: "text-rose-400" },
  { kind: "didnt", emoji: "👎", label: "Didn't Like", color: "text-zinc-400" },
  { kind: "funny", emoji: "😂", label: "Funny", color: "text-amber-300" },
  { kind: "surprised", emoji: "😮", label: "Surprised", color: "text-violet-300" },
];

export type SellerReputation = {
  overall: number; // 0-5 derived from reactions
  sales: number;
  responseTime: string;
  repeatCustomers: number; // percent
  totals: Record<ReactionKind, number>;
};

export const myReputation: SellerReputation = {
  overall: 4.8,
  sales: 312,
  responseTime: "< 10 min",
  repeatCustomers: 64,
  totals: { helpful: 184, loved: 121, didnt: 6, funny: 27, surprised: 18 },
};

export type SocialReview = {
  id: string;
  author: string;
  school: string;
  avatar?: string;
  time: string;
  text: string;
  reaction: ReactionKind;
  reactions: Partial<Record<ReactionKind, number>>;
};

export const sampleReviews: SocialReview[] = [
  {
    id: "r1",
    author: "Jada M.",
    school: "Howard",
    time: "2d",
    text: "Best silk press I've gotten on campus. She was on time and the vibes were unmatched.",
    reaction: "loved",
    reactions: { loved: 24, helpful: 12, funny: 2 },
  },
  {
    id: "r2",
    author: "Marcus T.",
    school: "Morehouse",
    time: "5d",
    text: "Plate was huge for $10. Whole hall pulled up after I posted it.",
    reaction: "helpful",
    reactions: { helpful: 41, loved: 18, surprised: 6 },
  },
  {
    id: "r3",
    author: "Asha B.",
    school: "Spelman",
    time: "1w",
    text: "Booking flow was smooth and she sent reminders. Will rebook 100%.",
    reaction: "helpful",
    reactions: { helpful: 19, loved: 9 },
  },
  {
    id: "r4",
    author: "Devon K.",
    school: "FAMU",
    time: "2w",
    text: "Ride was late but the driver played the AUX so I can't even be mad 😂",
    reaction: "funny",
    reactions: { funny: 33, helpful: 4, didnt: 2 },
  },
];