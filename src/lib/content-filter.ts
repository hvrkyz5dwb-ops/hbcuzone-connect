// Automated pre-publication filter for user generated text.
// Rejects clear threats, hate speech, explicit sexual material, illegal drug
// sales and severe harassment before the content is ever stored.

export type FilterResult = { ok: true } | { ok: false; category: string; reason: string };

const RULES: { category: string; reason: string; patterns: RegExp[] }[] = [
  {
    category: "Violence or threats",
    reason:
      "This looks like a threat of violence. Threatening another person is not allowed on PlugU.",
    patterns: [
      /\b(i(?:'m| am)? ?(?:gonna|going to|will)\s+(?:kill|shoot|stab|beat|jump|murder|kick)\s+(?:you|him|her|them|u|yo|that))\b/i,
      /\b(kill yourself|kys|i'?ll kill u|catch a fade with a (?:gun|knife)|shoot up (?:the|your))\b/i,
      /\b(?:i know where you (?:live|stay)|come to your dorm and)\b/i,
    ],
  },
  {
    category: "Hate speech",
    reason:
      "This contains hate speech or a slur. PlugU removes content that attacks people for who they are.",
    patterns: [
      /\bn[i1!]gg(?:er|a)s?\b/i,
      /\bf[a@]gg?(?:ot|ots)?\b/i,
      /\btr[a@]nn(?:y|ies)\b/i,
      /\bk[i1]ke[s]?\b/i,
      /\bsp[i1]cs?\b/i,
      /\bch[i1]nks?\b/i,
      /\bret[a@]rds?\b/i,
      /\b(?:all|every)\s+\w+\s+should\s+(?:die|be killed|be deported)\b/i,
    ],
  },
  {
    category: "Sexual or inappropriate content",
    reason:
      "Sexual services and explicit sexual content are not allowed on PlugU.",
    patterns: [
      /\b(escort service|sugar baby|sell(?:ing)? nudes?|nudes? for \$?\d|onlyfans link|sex for (?:cash|money)|hook ?up for (?:cash|money)|prostitut)\b/i,
      /\b(?:sell|buy|trade)\w*\s+(?:my\s+)?(?:nudes|explicit (?:pics|photos|videos))\b/i,
    ],
  },
  {
    category: "Drugs or illegal activity",
    reason:
      "Selling drugs, controlled substances, weapons or other illegal items is prohibited on PlugU.",
    patterns: [
      // Unambiguous controlled substances.
      /\b(?:selling|sell|plug for|hmu for|delivering)\s+(?:some\s+)?(?:weed|zaza|shrooms|molly|mdma|xans?|xanax|percs?|perc30|adderall|addys?|codeine|cocaine|meth|lsd|dmt|ket(?:amine)?|oxy)\b/i,
      // Slang that is also everyday language ("gas money", "loud music"), so it
      // only counts when paired with an explicit dealing phrase.
      /\b(?:plug for|hmu for)\s+(?:some\s+)?(?:loud|gas|lean|coke|acid)\b/i,
      /\b(?:oz|zip|qp|8th|eighth|gram)s?\s+(?:of\s+)?(?:weed|loud|gas|zaza|shrooms|coke)\b/i,
      /\b(?:selling|sell|got)\s+(?:a\s+)?(?:glock|pistol|ar-?15|firearm|handgun)\b/i,
      /\b(fake ids?|stolen (?:cards?|ids?|phones?)|cloned cards?|cc dumps?|write your (?:paper|essay) for you|take your exam for you)\b/i,
    ],
  },
  {
    category: "Harassment or bullying",
    reason:
      "This reads as targeted harassment. Keep it civil — attacks on other students get removed.",
    patterns: [
      /\b(?:you(?:'re| are)|ur)\s+(?:a\s+)?(?:worthless|disgusting|pathetic)\s+(?:bitch|whore|slut|hoe)\b/i,
      /\bnobody (?:likes|wants) (?:you|u),?\s*(?:go )?(?:die|kill)\b/i,
      /\b(?:everyone should|let'?s all)\s+(?:harass|jump|expose)\s+\w+/i,
    ],
  },
  {
    category: "Personal information",
    reason:
      "Don't post someone's private details. Remove the phone number, address or ID before posting.",
    patterns: [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    ],
  },
];

export function screenContent(text: string): FilterResult {
  const value = (text ?? "").normalize("NFKC");
  if (!value.trim()) return { ok: true };
  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(value)) {
        return { ok: false, category: rule.category, reason: rule.reason };
      }
    }
  }
  return { ok: true };
}

/** Throws a user-facing error when content violates the guidelines. */
export function assertContentAllowed(text: string) {
  const result = screenContent(text);
  if (!result.ok) {
    const err = new Error(result.reason);
    (err as Error & { category?: string }).category = result.category;
    throw err;
  }
}
