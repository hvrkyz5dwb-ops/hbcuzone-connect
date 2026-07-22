/**
 * PlugU Charging Loader — reusable, lightweight loading indicator.
 * Electricity travels up the plug outline as content loads.
 */
export function ChargingLoader({
  size = 48,
  message,
  full = false,
}: {
  size?: number;
  message?: string;
  full?: boolean;
}) {
  const svg = (
    <svg width={size} height={size * 1.4} viewBox="0 0 40 56" aria-hidden>
      <defs>
        <linearGradient id="plugCharge" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0%" stopColor="#f4c96a" />
          <stop offset="100%" stopColor="#fff6d6" />
        </linearGradient>
        <clipPath id="plugShape">
          <path d="M10 4 L14 4 L14 12 L26 12 L26 4 L30 4 L30 14 Q30 20 24 22 L24 34 Q24 44 20 52 Q16 44 16 34 L16 22 Q10 20 10 14 Z" />
        </clipPath>
      </defs>
      <path d="M10 4 L14 4 L14 12 L26 12 L26 4 L30 4 L30 14 Q30 20 24 22 L24 34 Q24 44 20 52 Q16 44 16 34 L16 22 Q10 20 10 14 Z"
        fill="none" stroke="#f4c96a" strokeOpacity="0.35" strokeWidth="1.5" />
      <g clipPath="url(#plugShape)">
        <rect x="0" y="0" width="40" height="56" fill="url(#plugCharge)" className="charging-fill" />
      </g>
    </svg>
  );
  if (!full) {
    return (
      <div className="inline-flex flex-col items-center gap-2">
        {svg}
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur">
      <div className="flex flex-col items-center gap-3">
        {svg}
        <p className="text-sm text-muted-foreground tracking-wide">
          {message ?? "Plugging you in…"}
        </p>
      </div>
    </div>
  );
}
