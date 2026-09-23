// HBCUS access is derived entirely from the backend profile row:
//   is_hbcu_student (set by handle_new_user based on schools.type = 'hbcu')
//   verification_status = 'verified' (set when the .edu domain matched a school)
// No client-side self-verify path exists — users cannot bypass by writing
// localStorage or picking a school in the UI. The documented App Review demo
// account is the only non-.edu exception and remains a normal member account.
import { isAppReviewEmail } from "@/lib/auth";
import { useProfile } from "./use-profile";

export type HbcusVerification = {
  verified: boolean;
  method: "edu" | null;
  email?: string;
  school?: string;
  hydrated: boolean;
  /** No-op — retained so legacy callers compile. */
  verify: () => void;
  reset: () => void;
};

export function useHbcusVerification(): HbcusVerification {
  const { profile, loading } = useProfile();
  const verified =
    !!profile &&
    (profile.is_hbcu_student === true || isAppReviewEmail(profile.email)) &&
    profile.verification_status === "verified";
  return {
    verified,
    method: verified ? "edu" : null,
    email: profile?.email,
    school: profile?.school_name ?? undefined,
    hydrated: !loading,
    verify: () => {},
    reset: () => {},
  };
}
