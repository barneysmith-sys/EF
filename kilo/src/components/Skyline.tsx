import type { ReactNode } from "react";

/**
 * The opening illustration. A dusk city drawn as flat vector shapes —
 * sunlit slabs, a colder skyline beside them, clouds in front of the
 * bases, and a hill that scroll brings into frame.
 *
 * Motion lives in CSS (custom properties set by Opening), so pointer
 * and scroll never rebuild this tree.
 */

const INK = "#241c16";

interface TowerSpec {
  x: number;
  w: number;
  h: number;
  sun: boolean;
  cols: number;
  floors: number;
  antenna?: number;
  beacon?: boolean;
  crown?: "flat" | "step" | "mech";
  far?: boolean;
}

const GROUND = 980;

const FAR: TowerSpec[] = [
  { x: -20, w: 70, h: 280, sun: false, cols: 5, floors: 18, far: true },
  { x: 86, w: 48, h: 190, sun: false, cols: 3, floors: 12, far: true },
  { x: 250, w: 40, h: 150, sun: false, cols: 3, floors: 10, far: true },
  { x: 860, w: 46, h: 160, sun: true, cols: 3, floors: 11, far: true },
  { x: 1288, w: 52, h: 210, sun: false, cols: 4, floors: 14, far: true },
  { x: 1520, w: 90, h: 240, sun: false, cols: 5, floors: 15, far: true },
];

const TOWERS: TowerSpec[] = [
  { x: 18, w: 118, h: 620, sun: false, cols: 8, floors: 34, antenna: 36, beacon: true, crown: "mech" },
  { x: 150, w: 86, h: 470, sun: false, cols: 6, floors: 26, beacon: true },
  { x: 250, w: 64, h: 340, sun: true, cols: 5, floors: 20, beacon: true },
  { x: 328, w: 150, h: 690, sun: true, cols: 9, floors: 38, antenna: 22, beacon: true, crown: "step" },
  { x: 494, w: 172, h: 790, sun: true, cols: 10, floors: 42, antenna: 52, beacon: true, crown: "mech" },
  { x: 682, w: 62, h: 300, sun: true, cols: 4, floors: 18 },
  { x: 758, w: 108, h: 430, sun: true, cols: 7, floors: 24, beacon: true, crown: "step" },
  { x: 880, w: 48, h: 230, sun: false, cols: 3, floors: 14 },
  { x: 942, w: 128, h: 580, sun: false, cols: 8, floors: 32, antenna: 18, beacon: true, crown: "mech" },
  { x: 1086, w: 96, h: 450, sun: false, cols: 6, floors: 26, beacon: true },
  { x: 1196, w: 70, h: 310, sun: false, cols: 5, floors: 18 },
  { x: 1280, w: 124, h: 520, sun: false, cols: 8, floors: 28, antenna: 28, beacon: true, crown: "step" },
  { x: 1420, w: 100, h: 380, sun: false, cols: 6, floors: 22, beacon: true },
];

const LOW: TowerSpec[] = [
  { x: 214, w: 48, h: 150, sun: false, cols: 3, floors: 9 },
  { x: 600, w: 78, h: 140, sun: true, cols: 5, floors: 8 },
  { x: 820, w: 56, h: 120, sun: true, cols: 4, floors: 7 },
  { x: 1048, w: 64, h: 150, sun: false, cols: 4, floors: 9 },
];

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function Tower({ spec, ground = GROUND }: { spec: TowerSpec; ground?: number }) {
  const { x, w, h, sun, cols, floors, antenna = 0, beacon, crown = "flat" } = spec;
  const y = ground - h;
  const side = Math.max(7, Math.round(w * 0.075));
  const face = sun ? "#ef8634" : "#31456f";
  const sideFill = sun ? "#c85a22" : "#243656";
  const cap = sun ? "#f6b56e" : "#4c5e8a";
  const pad = Math.max(5, w * 0.07);
  const pitch = (h - (crown === "flat" ? 18 : 28)) / floors;
  const winH = Math.max(2.2, pitch * 0.52);
  const gap = Math.max(1.6, (w - pad * 2) * 0.045);
  const winW = (w - pad * 2 - gap * (cols - 1)) / cols;
  const seed = Math.round(x * 3 + h);

  const windows: ReactNode[] = [];
  for (let row = 0; row < floors; row++) {
    for (let col = 0; col < cols; col++) {
      const n = hash(seed + row * 17 + col * 3);
      const lit = sun ? n > 0.62 : n > 0.34;
      const flicker = n > 0.82;
      const wy = y + 14 + row * pitch;
      const wx = x + pad + col * (winW + gap);
      windows.push(
        <rect
          key={`${row}-${col}`}
          x={wx}
          y={wy}
          width={winW}
          height={winH}
          rx={0.4}
          className={lit ? `win-lit${flicker ? " win-flick" : ""}` : "win-dark"}
          style={flicker ? { animationDelay: `${(n * 9).toFixed(2)}s` } : undefined}
          fill={
            lit
              ? sun
                ? n > 0.88
                  ? "#fff1c2"
                  : "#ffd98a"
                : "#ffe6a6"
              : sun
                ? "#c4622c"
                : "#1c2744"
          }
        />,
      );
    }
  }

  const crownH = crown === "step" ? 22 : crown === "mech" ? 16 : 0;
  const crownW = crown === "step" ? w * 0.62 : w * 0.34;
  const crownX = x + (w - crownW) / 2;

  return (
    <g>
      <polygon
        points={`${x + w},${y} ${x + w + side},${y + side * 0.45} ${x + w + side},${y + h} ${x + w},${y + h}`}
        fill={sideFill}
        stroke={INK}
        strokeWidth={1.15}
        strokeLinejoin="miter"
      />
      <rect x={x} y={y} width={w} height={h} fill={face} stroke={INK} strokeWidth={1.35} />
      <rect x={x} y={y} width={w} height={7} fill={cap} />
      {windows}
      {crown !== "flat" && (
        <g>
          <rect
            x={crownX}
            y={y - crownH}
            width={crownW}
            height={crownH + 2}
            fill={sun ? "#f0a868" : "#445580"}
            stroke={INK}
            strokeWidth={1.15}
          />
          {crown === "mech" && (
            <>
              <rect x={crownX + 6} y={y - crownH + 4} width={crownW * 0.28} height={crownH - 8} fill={sun ? "#c4622c" : "#1c2744"} />
              <rect x={crownX + crownW * 0.5} y={y - crownH + 5} width={crownW * 0.22} height={crownH - 9} fill={sun ? "#c4622c" : "#1c2744"} />
            </>
          )}
        </g>
      )}
      {antenna > 0 && (
        <g stroke={INK} strokeWidth={1.3} fill="none">
          <path d={`M${x + w / 2} ${y - crownH} V${y - crownH - antenna}`} />
          <path d={`M${x + w / 2 - 7} ${y - crownH - antenna * 0.45} H${x + w / 2 + 7}`} />
        </g>
      )}
      {beacon && (
        <circle
          className="sky-beacon"
          cx={x + w * 0.72}
          cy={y - crownH - (antenna > 0 ? 2 : 3)}
          r={2.35}
          fill="#ff3a2e"
          style={{ animationDelay: `${(hash(seed) * 2.4).toFixed(2)}s` }}
        />
      )}
    </g>
  );
}

/** One outline, so a cloud reads as a single puff rather than a stack of bubbles. */
function Cloud({ x, y, s = 1, v = 0 }: { x: number; y: number; s?: number; v?: number }) {
  const d = [
    "M-96 18 C-100 -2 -74 -14 -52 -2 C-50 -30 -14 -40 6 -18 C22 -42 74 -34 80 -4 C108 -2 116 22 92 34 C98 50 60 56 36 46 C14 60 -28 54 -42 38 C-72 50 -108 36 -96 18 Z",
    "M-70 14 C-74 -4 -48 -16 -30 -4 C-28 -26 2 -32 16 -12 C28 -30 66 -24 70 0 C90 2 96 20 78 30 C70 42 40 44 22 36 C4 46 -24 42 -34 30 C-56 40 -80 28 -70 14 Z",
    "M-110 16 C-116 -6 -80 -20 -54 -4 C-52 -36 -8 -46 14 -20 C32 -44 92 -36 98 -2 C128 0 136 26 108 40 C114 58 68 66 40 54 C12 70 -36 62 -52 44 C-88 58 -124 38 -110 16 Z",
  ][v % 3];
  return (
    <path
      d={d}
      transform={`translate(${x} ${y}) scale(${s})`}
      fill={v === 1 ? "#f4eef8" : "#ebe2f3"}
      stroke={INK}
      strokeWidth={1.7 / s}
      strokeLinejoin="round"
    />
  );
}

export default function Skyline() {
  return (
    <svg className="skyline" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6c82b6" />
          <stop offset="46%" stopColor="#847eae" />
          <stop offset="78%" stopColor="#a8889e" />
          <stop offset="100%" stopColor="#c49890" />
        </linearGradient>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb060" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#ffb060" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffb060" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hill-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0d48a" />
          <stop offset="100%" stopColor="#d7b15a" />
        </linearGradient>
        <filter id="sky-grain" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.18" />
          </feComponentTransfer>
        </filter>
      </defs>

      <rect width="1600" height="900" fill="url(#sky-grad)" />

      <g className="layer layer-sun">
        <circle cx="1248" cy="118" r="120" fill="url(#sun-glow)" />
        <circle cx="1248" cy="118" r="62" fill="#f26e22" />
      </g>

      <g className="layer layer-far" opacity="0.72">
        {FAR.map((t) => (
          <Tower key={`f-${t.x}`} spec={t} />
        ))}
      </g>

      <g className="layer layer-back-clouds">
        <g className="drift drift-slow">
          <Cloud x={160} y={520} s={0.55} v={1} />
          <Cloud x={470} y={490} s={0.42} v={0} />
          <Cloud x={760} y={530} s={0.5} v={2} />
          <Cloud x={1100} y={500} s={0.48} v={1} />
        </g>
      </g>

      <g className="layer layer-city">
        {TOWERS.map((t) => (
          <Tower key={`t-${t.x}`} spec={t} />
        ))}
      </g>

      <g className="layer layer-low">
        {LOW.map((t) => (
          <Tower key={`l-${t.x}`} spec={t} />
        ))}
      </g>

      <g className="layer layer-clouds">
        <g className="drift">
          <Cloud x={-10} y={700} s={1.35} v={2} />
          <Cloud x={250} y={760} s={1.15} v={0} />
          <Cloud x={470} y={690} s={0.9} v={1} />
          <Cloud x={680} y={780} s={1.45} v={2} />
          <Cloud x={960} y={720} s={1.05} v={0} />
          <Cloud x={1180} y={790} s={1.3} v={1} />
          <Cloud x={1420} y={700} s={1.1} v={2} />
          <Cloud x={1580} y={760} s={0.85} v={0} />
        </g>
      </g>

      <g className="layer layer-hill">
        <path
          d="M1080 980 C1160 900, 1280 820, 1420 800 C1520 788, 1580 812, 1680 790 L1680 1040 L1080 1040 Z"
          fill="url(#hill-grad)"
          stroke={INK}
          strokeWidth={1.4}
        />
        <path d="M1160 940 C1280 870, 1420 860, 1600 842" fill="none" stroke="#c4983e" strokeWidth={1.4} />
        <path d="M1220 980 C1340 910, 1500 920, 1660 888" fill="none" stroke="#c9a44e" strokeWidth={1.15} />
        <path d="M1320 868 C1390 854, 1466 860, 1540 842" fill="none" stroke="#b68c38" strokeWidth={1.2} />
        <g transform="translate(1496 848)" fill={INK}>
          <circle cx="0" cy="-16" r="3.1" />
          <path d="M-1.2 -13 L-1.4 -6 L-5.5 1.5 L-2.4 1.8 L-0.6 -3.2 L1.2 -3.2 L3.2 2 L6.2 1.6 L2 -6 L1.2 -13 Z" />
          <path d="M-3.4 -10 Q-7 -2 -5.2 6 L5.4 6 Q7.2 -2 3.6 -10 Z" opacity="0.9" />
        </g>
      </g>

      <rect width="1600" height="900" filter="url(#sky-grain)" opacity="0.35" style={{ mixBlendMode: "multiply" }} />
    </svg>
  );
}
