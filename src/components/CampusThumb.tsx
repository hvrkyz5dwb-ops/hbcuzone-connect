import { useEffect, useRef, useState } from "react";

type Props = {
  school: string;
  city?: string;
  className?: string;
  /** "photo" = real campus photograph, "satellite" = aerial view */
  mode?: "photo" | "satellite";
};

/** Real Google imagery of a campus, loaded only once the card is near view. */
export function CampusThumb({ school, city, className = "", mode = "photo" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setInView(true)),
      { rootMargin: "250px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [inView]);

  const src =
    `/api/public/campus-image?mode=${mode}&school=${encodeURIComponent(school)}` +
    (city ? `&city=${encodeURIComponent(city)}` : "");

  return (
    <div
      ref={ref}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: "radial-gradient(circle at 30% 20%, #1a1030 0%, #0a0616 70%)" }}
    >
      {inView && !failed && (
        <img
          src={src}
          alt={`${school} campus`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
