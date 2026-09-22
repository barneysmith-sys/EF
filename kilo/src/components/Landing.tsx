import { useRef } from "react";
import { Segmented, Button } from "./ui";
import Opening from "./Opening";
import { GEOGRAPHIES, geographyById } from "../lib/geo";
import type { SearchCriteria, Flexibility, Reliability } from "../lib/search";
import { QUARTER_OPTIONS } from "../lib/search";

const FLEX_OPTS = [
  { value: "Firm" as Flexibility, label: "Firm" },
  { value: "Flexible" as Flexibility, label: "Flexible" },
  { value: "Mixed" as Flexibility, label: "Mixed" },
];

const REL_OPTS = [
  { value: "Standard" as Reliability, label: "Standard" },
  { value: "High" as Reliability, label: "High" },
  { value: "Mission Critical" as Reliability, label: "Mission Critical" },
];

const MW_PRESETS = [50, 100, 200, 500];

interface Props {
  criteria: SearchCriteria;
  onChange: (next: Partial<SearchCriteria>) => void;
  onSearch: () => void;
  searching: boolean;
}

export default function Landing({ criteria, onChange, onSearch, searching }: Props) {
  const geo = geographyById(criteria.geographyId);
  const stageRef = useRef<HTMLElement>(null);

  return (
    <div className="landing">
      <Opening criteria={criteria} onCompose={() => stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} />

      <main className="landing-main" ref={stageRef} id="kilo-search">
        <div className="stage-copy">
          <p className="stage-kicker">The requirement</p>
          <h2 className="stage-title">Where can this load actually be energized.</h2>
        </div>

        <section
          className="console"
          aria-label="Power search"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !searching && criteria.mw > 0) onSearch();
          }}
        >
          <div className="console-head">
            <span className="mlabel">Capacity requirement</span>
            <span className="console-head-note mono">KILO SEARCH · v0.4 DEMO</span>
          </div>

          <div className="console-row primary">
            <div className="field mw">
              <label className="mlabel" htmlFor="mw">
                Power required
              </label>
              <div className="field-input">
                <button
                  className="stepper"
                  onClick={() => onChange({ mw: Math.max(5, criteria.mw - 5) })}
                  aria-label="Decrease"
                >
                  −
                </button>
                <input
                  id="mw"
                  className="num"
                  value={criteria.mw}
                  inputMode="numeric"
                  onChange={(e) => {
                    const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                    onChange({ mw: Number.isNaN(v) ? 0 : Math.min(2000, v) });
                  }}
                />
                <span className="field-unit">MW</span>
                <button
                  className="stepper"
                  onClick={() => onChange({ mw: Math.min(2000, criteria.mw + 5) })}
                  aria-label="Increase"
                >
                  +
                </button>
              </div>
              <div className="presets">
                {MW_PRESETS.map((v) => (
                  <button
                    key={v}
                    className={`preset num${criteria.mw === v ? " active" : ""}`}
                    onClick={() => onChange({ mw: v })}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-divider" />

            <div className="field">
              <label className="mlabel" htmlFor="loc">
                Location
              </label>
              <div className="field-input">
                <select
                  id="loc"
                  className="field-select"
                  value={criteria.geographyId}
                  onChange={(e) => onChange({ geographyId: e.target.value })}
                >
                  {GEOGRAPHIES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-hint">{geo.blurb}</div>
            </div>

            <div className="field-divider" />

            <div className="field">
              <label className="mlabel" htmlFor="by">
                Required by
              </label>
              <div className="field-input">
                <select
                  id="by"
                  className="field-select"
                  value={criteria.requiredByIndex}
                  onChange={(e) => onChange({ requiredByIndex: Number(e.target.value) })}
                >
                  {QUARTER_OPTIONS.map((q) => (
                    <option key={q.index} value={q.index}>
                      {q.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-hint">First megawatt energized</div>
            </div>
          </div>

          <div className="console-row secondary">
            <div className="field wide">
              <label className="mlabel">Load flexibility</label>
              <Segmented options={FLEX_OPTS} value={criteria.flexibility} onChange={(v) => onChange({ flexibility: v })} />
            </div>

            <div className="field-divider short" />

            <div className="field wide">
              <label className="mlabel">Reliability</label>
              <Segmented options={REL_OPTS} value={criteria.reliability} onChange={(v) => onChange({ reliability: v })} />
            </div>
          </div>

          <div className="console-foot">
            <p className="requirement">
              <span className="requirement-quote">“</span>I need{" "}
              <strong className="num">{criteria.mw} MW</strong> on the{" "}
              <strong>{geo.label}</strong> by{" "}
              <strong className="num">{QUARTER_OPTIONS.find((q) => q.index === criteria.requiredByIndex)?.label}</strong>
              <span className="requirement-quote">”</span>
            </p>
            <Button variant="primary" size="lg" onClick={onSearch} disabled={searching || criteria.mw <= 0}>
              {searching ? (
                <>
                  <span className="btn-spinner" aria-hidden /> Searching pathways
                </>
              ) : (
                <>Find Power →</>
              )}
            </Button>
          </div>

          {searching && (
            <div className="console-progress">
              <div className="console-progress-bar" />
              <div className="console-progress-log mono">
                Scanning interconnection queues · utility load studies · transmission headroom · land and fiber
              </div>
            </div>
          )}
        </section>

        <section className="landing-flow" aria-label="How Kilo works">
          {[
            { n: "01", t: "Search", d: "Find where megawatts can actually be delivered, not where plants exist." },
            { n: "02", t: "Verify", d: "Test every assumption against queues, studies, land, fiber and equipment." },
            { n: "03", t: "Request", d: "Publish one standardized requirement to utilities, generators and developers." },
            { n: "04", t: "Secure", d: "Compare normalized pathways and convert one into contracted capacity." },
          ].map((s) => (
            <div className="flowcard" key={s.n}>
              <div className="flowcard-n num">{s.n}</div>
              <div className="flowcard-t">{s.t}</div>
              <div className="flowcard-d">{s.d}</div>
            </div>
          ))}
        </section>
      </main>

      <footer className="landing-foot">
        <span className="demo-chip">Demo data</span>
        <span>
          Kilo is a demonstration prototype. All capacity, pricing, utility positions, infrastructure
          status and energization dates shown are mock figures generated for illustration. Nothing
          here is verified or offered.
        </span>
      </footer>
    </div>
  );
}
