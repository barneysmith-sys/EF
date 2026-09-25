import { qLabel, qIndex } from "../data/pathways";
import { GEOGRAPHIES } from "../lib/geo";
import type { Filters, Reliability } from "../lib/search";

interface Props {
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
  onReset: () => void;
  shown: number;
  total: number;
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
  scale,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display: string;
  onChange: (v: number) => void;
  scale?: [string, string];
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="filt">
      <div className="filt-head">
        <span className="mlabel">{label}</span>
        <span className="filt-value num">{display}</span>
      </div>
      <input
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--pct" as string]: `${pct}%` }}
      />
      {scale && (
        <div className="filt-scale mono">
          <span>{scale[0]}</span>
          <span>{scale[1]}</span>
        </div>
      )}
    </div>
  );
}

const RELIABILITY_FILTER: (Reliability | "Any")[] = ["Any", "Standard", "High", "Mission Critical"];

export default function FilterRail({ filters, onChange, onReset, shown, total }: Props) {
  return (
    <aside className="rail">
      <div className="rail-head">
        <span className="mlabel">Filters</span>
        <button className="rail-reset" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="rail-body">
        <Slider
          label="Minimum MW"
          value={filters.minMw}
          min={0}
          max={250}
          step={5}
          display={filters.minMw === 0 ? "Any" : `${filters.minMw}+ MW`}
          onChange={(v) => onChange({ minMw: v })}
          scale={["0", "250"]}
        />

        <Slider
          label="Energized by"
          value={filters.maxEnergizationIndex}
          min={qIndex(2028, 1)}
          max={qIndex(2031, 4)}
          display={qLabel(filters.maxEnergizationIndex)}
          onChange={(v) => onChange({ maxEnergizationIndex: v })}
          scale={["Q1 2028", "Q4 2031"]}
        />

        <Slider
          label="Maximum price"
          value={filters.maxPrice}
          min={35}
          max={120}
          display={filters.maxPrice >= 120 ? "Any" : `$${filters.maxPrice}/MWh`}
          onChange={(v) => onChange({ maxPrice: v })}
          scale={["$35", "$120"]}
        />

        <div className="filt">
          <div className="filt-head">
            <span className="mlabel">Geography</span>
          </div>
          <select
            className="rail-select"
            value={filters.geographyId}
            onChange={(e) => onChange({ geographyId: e.target.value })}
          >
            {GEOGRAPHIES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filt">
          <div className="filt-head">
            <span className="mlabel">Reliability</span>
          </div>
          <div className="radiolist">
            {RELIABILITY_FILTER.map((r) => (
              <button
                key={r}
                className={`radioitem${filters.reliability === r ? " active" : ""}`}
                onClick={() => onChange({ reliability: r })}
              >
                <span className="radiomark" />
                {r}
              </button>
            ))}
          </div>
        </div>

        <Slider
          label="Carbon intensity"
          value={filters.maxCarbon}
          min={150}
          max={600}
          step={5}
          display={filters.maxCarbon >= 600 ? "Any" : `≤ ${filters.maxCarbon} kg/MWh`}
          onChange={(v) => onChange({ maxCarbon: v })}
          scale={["150", "600 kg/MWh"]}
        />

        <Slider
          label="Modeled score floor"
          value={filters.minConfidence}
          min={0}
          max={95}
          step={1}
          display={filters.minConfidence === 0 ? "Any" : `${filters.minConfidence}%+`}
          onChange={(v) => onChange({ minConfidence: v })}
          scale={["0%", "95%"]}
        />
      </div>

      <div className="rail-foot">
        <span className="num">
          {shown} of {total}
        </span>
        <span> pathways shown</span>
      </div>
    </aside>
  );
}
