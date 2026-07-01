type Fig = {
  dur: number;
  delay: number;
  scale: number;
  bottom: string;
  dir: "r" | "l";
  opacity: number;
  blur?: number;
};

const FIGURES: Fig[] = [
  { dur: 9,  delay: -1, scale: 1.55, bottom: "5vh",  dir: "r", opacity: 1 },
  { dur: 11, delay: -3, scale: 1.3,  bottom: "8vh",  dir: "l", opacity: 0.95 },
  { dur: 8,  delay: -5, scale: 1.7,  bottom: "4vh",  dir: "r", opacity: 1 },
  { dur: 10, delay: -2, scale: 1.0,  bottom: "12vh", dir: "l", opacity: 0.85 },
  { dur: 12, delay: -6, scale: 0.8,  bottom: "15vh", dir: "r", opacity: 0.65, blur: 1.4 },
  { dur: 9,  delay: -4, scale: 1.15, bottom: "10vh", dir: "l", opacity: 0.9 },
  { dur: 11, delay: -7, scale: 1.4,  bottom: "6vh",  dir: "r", opacity: 1 },
  { dur: 13, delay: -2, scale: 0.85, bottom: "14vh", dir: "l", opacity: 0.7, blur: 1.2 },
  { dur: 10, delay: -8, scale: 1.5,  bottom: "5vh",  dir: "r", opacity: 1 },
  { dur: 12, delay: -5, scale: 0.75, bottom: "16vh", dir: "l", opacity: 0.55, blur: 1.8 },
];

function Figure({ f }: { f: Fig }) {
  const walkAnim = `plugu-crowd-walk-${f.dir} ${f.dur}s linear ${f.delay}s infinite`;
  const armAnim  = `plugu-crowd-arm-raise ${f.dur}s linear ${f.delay}s infinite`;
  const flashAnim = `plugu-crowd-flash ${f.dur}s linear ${f.delay}s infinite`;
  return (
    <div className="cine-crowd-fig" style={{ bottom: f.bottom, left: 0, animation: walkAnim }}>
      <div style={{
        transform: `scale(${f.scale})`,
        transformOrigin: "bottom center",
        opacity: f.opacity,
        filter: f.blur ? `blur(${f.blur}px)` : undefined,
      }}>
        <div className="cine-crowd-bob">
          <svg width="28" height="72" viewBox="0 0 28 72" aria-hidden>
            {/* head */}
            <circle cx="14" cy="8" r="4.5" fill="#040404" />
            {/* torso */}
            <path d="M8.5 13 h11 a2.5 2.5 0 0 1 2.5 2.5 v18 a2 2 0 0 1 -2 2 h-12 a2 2 0 0 1 -2 -2 v-18 a2.5 2.5 0 0 1 2.5 -2.5 z" fill="#040404" />
            {/* left static arm */}
            <rect x="5.5" y="15" width="2.6" height="17" rx="1.2" fill="#040404" />
            {/* legs */}
            <g transform="translate(11 35)">
              <rect className="cine-crowd-leg-a" x="-1.3" y="0" width="2.8" height="22" rx="1" fill="#040404" />
            </g>
            <g transform="translate(17 35)">
              <rect className="cine-crowd-leg-b" x="-1.3" y="0" width="2.8" height="22" rx="1" fill="#040404" />
            </g>
            {/* right arm — raises with phone + flash */}
            <g style={{ transformOrigin: "20px 15px", animation: armAnim }}>
              <rect x="19" y="15" width="2.6" height="17" rx="1.2" fill="#040404" />
              <rect x="17.6" y="30" width="5.2" height="8" rx="1" fill="#0b0b0b" stroke="rgba(246,210,122,0.55)" strokeWidth="0.4" />
              <rect x="17.6" y="30" width="5.2" height="8" rx="1" fill="rgba(255,240,200,0.95)" style={{ animation: flashAnim }} />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

export function CrowdLayer({ dense = true }: { dense?: boolean }) {
  const figs = dense ? FIGURES : FIGURES.slice(0, 6);
  return (
    <div className="absolute inset-0 pointer-events-none cine-crowd-layer" aria-hidden>
      {/* ground haze */}
      <div className="absolute inset-x-0 bottom-0 h-[28vh]" style={{
        background: "linear-gradient(180deg, transparent, rgba(10,12,18,0.55) 55%, rgba(0,0,0,0.9))",
      }} />
      {figs.map((f, i) => <Figure key={i} f={f} />)}
    </div>
  );
}