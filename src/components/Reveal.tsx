import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * IntersectionObserver-driven reveal wrapper.
 * Fades + slides children up once on first entry; staggers via `index * 40ms`.
 */
export function Reveal({
  children,
  index = 0,
  as: Tag = "div",
  className = "",
  delay,
}: {
  children: ReactNode;
  index?: number;
  as?: "div" | "section" | "li" | "article";
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style = { ["--reveal-delay" as string]: `${delay ?? index * 40}ms` } as React.CSSProperties;
  const cls = `reveal ${visible ? "is-visible" : ""} ${className}`.trim();

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} style={style} className={cls}>
      {children}
    </Tag>
  );
}