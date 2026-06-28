import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import statue from "@/assets/plugu-statue.jpg.asset.json";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative mx-5 my-8 overflow-hidden rounded-3xl border border-dashed border-border bg-card/50 px-6 py-10 text-center view-enter">
      <img
        src={statue.url}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto h-32 w-32 object-contain opacity-[0.06]"
      />
      <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="relative mt-4 text-base font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="relative mx-auto mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="relative mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function LoadingList({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="mx-5 space-y-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
        >
          <div className="h-12 w-12 rounded-xl shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded shimmer" />
            <div className="h-2.5 w-1/3 rounded shimmer" />
          </div>
        </li>
      ))}
    </ul>
  );
}