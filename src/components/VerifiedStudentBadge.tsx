import { BadgeCheck } from "lucide-react";

type Size = "xs" | "sm" | "md";

const sizes: Record<Size, { icon: string; text: string; pad: string }> = {
  xs: { icon: "h-3 w-3",   text: "text-[9px]",  pad: "px-1.5 py-0.5" },
  sm: { icon: "h-3.5 w-3.5", text: "text-[10px]", pad: "px-2 py-0.5" },
  md: { icon: "h-4 w-4",   text: "text-[11px]", pad: "px-2.5 py-1" },
};

/**
 * "Verified Student ✔" — shown on every approved student's profile,
 * posts, comments, marketplace listings and messages.
 */
export function VerifiedStudentBadge({
  size = "sm",
  iconOnly = false,
  className = "",
}: {
  size?: Size;
  iconOnly?: boolean;
  className?: string;
}) {
  const s = sizes[size];
  if (iconOnly) {
    return (
      <BadgeCheck
        aria-label="Verified Student"
        className={`${s.icon} text-primary shrink-0 ${className}`}
      />
    );
  }
  return (
    <span
      aria-label="Verified Student"
      className={`inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 text-primary font-medium tracking-wide uppercase ${s.text} ${s.pad} ${className}`}
    >
      <BadgeCheck className={s.icon} />
      Verified Student
    </span>
  );
}