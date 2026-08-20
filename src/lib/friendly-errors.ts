// Turns backend/auth errors into calm, user-readable copy. Raw database or
// policy messages (RLS codes, constraint names, JWT text) must never reach
// the UI — Apple review and students alike should only see plain language.
export function friendlyError(input: unknown, fallback = "Something went wrong. Please try again."): string {
  const raw =
    typeof input === "string"
      ? input
      : input && typeof input === "object" && "message" in input
        ? String((input as { message?: unknown }).message ?? "")
        : "";
  const m = raw.toLowerCase();

  if (!m) return fallback;
  if (/failed to fetch|networkerror|network request failed|load failed|offline/.test(m))
    return "You're offline. Check your connection and try again.";
  if (/invalid login credentials/.test(m))
    return "That email and password don't match. Try again or reset your password.";
  if (/email not confirmed/.test(m))
    return "Please verify your email first. Check your inbox for the PlugU confirmation link.";
  if (/user already registered|already been registered|duplicate key.*email/.test(m))
    return "An account already exists for that email. Sign in instead, or reset your password.";
  if (/duplicate key|unique constraint/.test(m))
    return "That's already taken. Try a different one.";
  if (/rate limit|too many requests|for security purposes/.test(m))
    return "Too many attempts. Please wait a minute and try again.";
  if (/password.*(short|least|6|8)/.test(m))
    return "Please choose a password with at least 8 characters.";
  if (/invalid.*email|email address.*invalid/.test(m))
    return "That email address doesn't look right.";
  if (/expired|invalid token|jwt|session/.test(m))
    return "Your session expired. Please sign in again.";
  if (/row-level security|permission denied|not authorized|42501|policy/.test(m))
    return "You don't have permission to do that.";
  if (/timeout|timed out/.test(m))
    return "That took too long. Please try again.";
  // Anything technical-looking (codes, SQL, stack-ish text) is hidden.
  if (/[{}()]|_id\b|\b\d{4,5}\b|supabase|postgres|pgrst/.test(m)) return fallback;
  return raw.length > 140 ? fallback : raw;
}
