import { qLabel, Q_BASE_YEAR, Q_SPAN } from "../data/pathways";
import type { TimelinePhase } from "../data/types";

const TRACK_ORDER: TimelinePhase["track"][] = ["Commercial", "Regulatory", "Equipment", "Physical"];

export default function Gantt({
  phases,
  energizationQ,
  requiredByQ,
}: {
  phases: TimelinePhase[];
  energizationQ: number;
  requiredByQ: number;
}) {
  const years = Array.from({ length: Q_SPAN / 4 }, (_, i) => Q_BASE_YEAR + i);
  const pct = (q: number) => (q / Q_SPAN) * 100;

  const grouped = TRACK_ORDER.map((t) => ({
    track: t,
    items: phases.filter((p) => p.track === t),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="gantt">
      {/* Year header */}
      <div className="gantt-head">
        <div className="gantt-label-col" />
        <div className="gantt-track-col">
          {years.map((y) => (
            <div className="gantt-year" key={y} style={{ width: `${(4 / Q_SPAN) * 100}%` }}>
              <span className="gantt-year-label num">{y}</span>
              <div className="gantt-quarters">
                {[1, 2, 3, 4].map((q) => (
                  <span key={q} className="gantt-q mono">
                    Q{q}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="gantt-body">
        <div className="gantt-label-col">
          {grouped.map((g) => (
            <div key={g.track} className="gantt-group-labels">
              <div className="gantt-track-name mlabel">{g.track}</div>
              {g.items.map((p) => (
                <div key={p.name} className="gantt-row-label" title={p.name}>
                  {p.name}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="gantt-track-col gantt-canvas">
          {/* Quarter gridlines */}
          <div className="gantt-grid" aria-hidden>
            {Array.from({ length: Q_SPAN }, (_, i) => (
              <span key={i} className={`gantt-gridline${i % 4 === 0 ? " year" : ""}`} />
            ))}
          </div>

          {/* Requirement date and energization markers */}
          <div className="gantt-marker required" style={{ left: `${pct(requiredByQ + 1)}%` }}>
            <span className="gantt-marker-label mono">REQUIRED {qLabel(requiredByQ)}</span>
          </div>
          <div className="gantt-marker energized" style={{ left: `${pct(energizationQ + 1)}%` }}>
            <span className="gantt-marker-label mono">ENERGIZED {qLabel(energizationQ)}</span>
          </div>

          {grouped.map((g) => (
            <div key={g.track} className="gantt-group-rows">
              <div className="gantt-track-spacer" />
              {g.items.map((p) => (
                <div key={p.name} className="gantt-row">
                  <div
                    className={`gantt-bar ${p.status}`}
                    style={{
                      left: `${pct(p.startQ)}%`,
                      width: `${pct(p.endQ - p.startQ + 1)}%`,
                    }}
                    title={`${p.name} · ${qLabel(p.startQ)} – ${qLabel(p.endQ)}`}
                  >
                    <span className="gantt-bar-label num">
                      {qLabel(p.startQ)} – {qLabel(p.endQ)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="gantt-legend">
        <span className="gantt-leg ok">On track</span>
        <span className="gantt-leg warn">Attention</span>
        <span className="gantt-leg risk">Critical path risk</span>
        <span className="gantt-leg pending">Not started</span>
        <span className="gantt-leg-spacer" />
        <span className="gantt-leg-marker required">Requirement date</span>
        <span className="gantt-leg-marker energized">Target energization</span>
      </div>
    </div>
  );
}
