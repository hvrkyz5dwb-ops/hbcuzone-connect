import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { generateCampusLayout, type CampusZone } from "@/lib/campus-layout.functions";

const FILL: Record<CampusZone["category"], { fill: string; stroke: string }> = {
  academic:      { fill: "#3b2a5c", stroke: "#c9a24a" },
  dorm:          { fill: "#2a2140", stroke: "#a97bff" },
  dining:        { fill: "#4a2b1f", stroke: "#e0a86b" },
  athletic:      { fill: "#1f3a2a", stroke: "#6bd39b" },
  "student-life":{ fill: "#4a1f3a", stroke: "#ff7bc7" },
  landmark:      { fill: "#3a2e14", stroke: "#f5c94a" },
  green:         { fill: "#1e2f22", stroke: "#7bd39b" },
  admin:         { fill: "#2a2f3e", stroke: "#8fb0e8" },
  safety:        { fill: "#3a1f22", stroke: "#f26b6b" },
};

type Props = { school: string; city?: string; mascot?: string; className?: string };

export function MiniCampusLayout({ school, city, mascot, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const fn = useServerFn(generateCampusLayout);

  useEffect(() => {
    if (!ref.current || inView) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setInView(true)),
      { rootMargin: "200px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [inView]);

  const q = useQuery({
    queryKey: ["campus-layout", school],
    queryFn: () => fn({ data: { school, city, mascot } }),
    staleTime: 1000 * 60 * 30,
    enabled: inView,
  });

  return (
    <div
      ref={ref}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: "radial-gradient(circle at 30% 20%, #1a1030 0%, #0a0616 70%)" }}
    >
      {!q.data && (
        <div className="absolute inset-0 grid place-items-center">
          <Sparkles className="h-4 w-4 text-accent animate-pulse opacity-60" />
        </div>
      )}
      {q.data && (
        <svg viewBox="0 0 100 75" className="w-full h-full block" preserveAspectRatio="xMidYMid slice">
          {q.data.paths.map((p) => (
            <polyline
              key={p.id}
              points={p.points.map((pt) => `${pt.x},${(pt.y * 75) / 100}`).join(" ")}
              fill="none"
              stroke="rgba(201,162,74,0.55)"
              strokeWidth="0.5"
              strokeDasharray="1 0.8"
              strokeLinecap="round"
            />
          ))}
          {q.data.zones.map((z) => {
            const s = FILL[z.category];
            const h = (z.h * 75) / 100;
            const y = (z.y * 75) / 100;
            return (
              <rect
                key={z.id}
                x={z.x}
                y={y}
                width={z.w}
                height={h}
                rx="1"
                fill={s.fill}
                stroke={s.stroke}
                strokeWidth="0.3"
                opacity="0.95"
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}