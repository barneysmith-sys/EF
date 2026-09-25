import { useMemo, useState } from "react";
import {
  MAP_W,
  MAP_H,
  pathGen,
  project,
  STATE_FEATURES,
  STATE_MESH,
  NATION_MESH,
  isInGeography,
  type Geography,
} from "../lib/geo";
import type { Pathway } from "../data/types";

interface Props {
  pathways: Pathway[];
  geography: Geography;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  /** Dims everything except in-scope states. */
  emphasizeGeography?: boolean;
  /** Markers rendered de-emphasized — used for results outside the search geography. */
  mutedIds?: string[];
}

const statePath = (f: (typeof STATE_FEATURES)[number]) => pathGen(f) ?? "";

export default function UsMap({
  pathways,
  geography,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  emphasizeGeography = true,
  mutedIds = [],
}: Props) {
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const meshPath = useMemo(() => pathGen(STATE_MESH as never) ?? "", []);
  const outlinePath = useMemo(() => pathGen(NATION_MESH as never) ?? "", []);

  const markers = useMemo(
    () =>
      pathways
        .map((p) => {
          const site = project(p.coords);
          const tie = project(p.tieCoords);
          return site && tie ? { p, site, tie } : null;
        })
        .filter((m): m is { p: Pathway; site: [number, number]; tie: [number, number] } => m !== null),
    [pathways],
  );

  const active = markers.find((m) => m.p.id === (hoveredId ?? selectedId));

  return (
    <div className="map-wrap">
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="map-svg"
        onMouseLeave={() => {
          onHover(null);
          setCursor(null);
        }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setCursor({
            x: ((e.clientX - r.left) / r.width) * MAP_W,
            y: ((e.clientY - r.top) / r.height) * MAP_H,
          });
        }}
      >
        <defs>
          <radialGradient id="map-vignette" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#0f1319" />
            <stop offset="100%" stopColor="#08090b" />
          </radialGradient>
          <pattern id="map-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M 26 0 L 0 0 0 26" fill="none" stroke="#10141a" strokeWidth="0.5" />
          </pattern>
          <filter id="marker-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={MAP_W} height={MAP_H} fill="url(#map-vignette)" />
        <rect width={MAP_W} height={MAP_H} fill="url(#map-grid)" />

        {/* State polygons */}
        <g>
          {STATE_FEATURES.map((f, i) => {
            const inScope = !emphasizeGeography || isInGeography(f.properties.name, geography);
            const hasSite = markers.some((m) => m.p.state === f.properties.name);
            return (
              <path
                key={i}
                d={statePath(f)}
                className={`map-state${inScope ? " in-scope" : ""}${hasSite ? " has-site" : ""}`}
              />
            );
          })}
        </g>

        <path d={meshPath} className="map-mesh" />
        <path d={outlinePath} className="map-outline" />

        {/* Transmission ties — substation node to site */}
        <g>
          {markers.map(({ p, site, tie }) => {
            const isActive = p.id === selectedId || p.id === hoveredId;
            return (
              <g key={`tie-${p.id}`} className={`tie${isActive ? " active" : ""}`}>
                <line x1={tie[0]} y1={tie[1]} x2={site[0]} y2={site[1]} className="tie-line" />
                <path
                  d={`M ${tie[0] - 4} ${tie[1]} L ${tie[0]} ${tie[1] - 4} L ${tie[0] + 4} ${tie[1]} L ${tie[0]} ${tie[1] + 4} Z`}
                  className="tie-node"
                />
              </g>
            );
          })}
        </g>

        {/* Site markers */}
        <g>
          {markers.map(({ p, site }) => {
            const isSelected = p.id === selectedId;
            const isHovered = p.id === hoveredId;
            const isMuted = mutedIds.includes(p.id);
            const r = 4 + Math.sqrt(p.deliverableMw) * 0.62;
            return (
              <g
                key={p.id}
                transform={`translate(${site[0]},${site[1]})`}
                className={`site${isSelected ? " selected" : ""}${isHovered ? " hovered" : ""}${isMuted ? " muted" : ""}`}
                onMouseEnter={() => onHover(p.id)}
                onClick={() => onSelect(p.id)}
              >
                <circle r={r + 16} className="site-hit" />
                {(isSelected || isHovered) && <circle r={r} className="site-pulse" />}
                <circle r={r + 5} className="site-halo" />
                <circle r={r} className="site-core" filter="url(#marker-glow)" />
                <circle r={r * 0.36} className="site-pip" />
                <text y={-r - 9} className="site-rank num">
                  {String(p.rank).padStart(2, "0")}
                </text>
              </g>
            );
          })}
        </g>

        {/* Callout for the active site */}
        {active && (
          <g
            transform={`translate(${Math.min(active.site[0] + 18, MAP_W - 190)},${Math.max(active.site[1] - 52, 12)})`}
            className="callout"
          >
            <rect width="172" height="74" rx="2" className="callout-bg" />
            <line x1="0" y1="0" x2="0" y2="74" className="callout-edge" />
            <text x="11" y="19" className="callout-state">
              {active.p.state.toUpperCase()}
            </text>
            <text x="11" y="40" className="callout-mw num">
              {active.p.deliverableMw} MW
            </text>
            <text x="11" y="55" className="callout-sub num">
              {active.p.energization} · ${active.p.priceLow}–{active.p.priceHigh}/MWh
            </text>
            <text x="11" y="67" className="callout-sub num">
              Modeled sketch · {active.p.utility}
            </text>
          </g>
        )}
      </svg>

      <div className="map-legend">
        <div className="map-legend-row">
          <span className="legend-swatch site" /> Power pathway
        </div>
        <div className="map-legend-row">
          <span className="legend-swatch tie" /> Transmission tie
        </div>
        <div className="map-legend-row">
          <span className="legend-swatch scope" /> {geography.label}
        </div>
      </div>

      <div className="map-readout mono">
        {cursor ? (
          <>
            X {cursor.x.toFixed(0).padStart(3, "0")} · Y {cursor.y.toFixed(0).padStart(3, "0")} · ALBERS USA
          </>
        ) : (
          <>ALBERS USA · SCALE 1:1300 · {markers.length} SITES</>
        )}
      </div>

      <div className="map-corner tl mono">CONTIGUOUS US + AK/HI INSET</div>
      <div className="map-corner tr">
        <span className="demo-chip">Demo data</span>
      </div>
    </div>
  );
}
