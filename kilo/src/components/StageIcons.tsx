/** Schematic glyphs — deliberately drawn like one-line diagrams, not app icons. */

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
};

export function StageIcon({ kind, size = 22 }: { kind: string; size?: number }) {
  const p = { ...base };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {kind === "generation" && (
        <g {...p}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 9 V3.5" />
          <path d="M14.6 13.5 L19.4 16.3" />
          <path d="M9.4 13.5 L4.6 16.3" />
          <path d="M3 20.5 H21" />
        </g>
      )}
      {kind === "transmission" && (
        <g {...p}>
          <path d="M12 3 V21" />
          <path d="M6 8 L12 5 L18 8" />
          <path d="M5 13 L12 9.5 L19 13" />
          <path d="M8 21 L12 12 L16 21" />
        </g>
      )}
      {kind === "substation" && (
        <g {...p}>
          <rect x="3.5" y="7.5" width="7" height="9" />
          <rect x="13.5" y="7.5" width="7" height="9" />
          <path d="M10.5 12 H13.5" />
          <path d="M3.5 5 V3" />
          <path d="M20.5 5 V3" />
          <path d="M3.5 19 V21" />
          <path d="M20.5 19 V21" />
        </g>
      )}
      {kind === "utility" && (
        <g {...p}>
          <rect x="4" y="4" width="16" height="16" />
          <circle cx="12" cy="11" r="3.4" />
          <path d="M12 11 L14 9" />
          <path d="M7.5 16.5 H16.5" />
        </g>
      )}
      {kind === "site" && (
        <g {...p}>
          <path d="M3.5 8 V3.5 H8" />
          <path d="M16 3.5 H20.5 V8" />
          <path d="M20.5 16 V20.5 H16" />
          <path d="M8 20.5 H3.5 V16" />
          <path d="M8.5 14.5 L12 9 L15.5 14.5 Z" />
        </g>
      )}
      {kind === "datacenter" && (
        <g {...p}>
          <rect x="3.5" y="4" width="17" height="5" />
          <rect x="3.5" y="11" width="17" height="5" />
          <path d="M6.5 6.5 H8" />
          <path d="M6.5 13.5 H8" />
          <circle cx="17" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="17" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
          <path d="M8 18.5 H16" />
          <path d="M12 16 V18.5" />
          <path d="M9 21 H15" />
        </g>
      )}
    </svg>
  );
}
