import { useState } from "react";
import { StageIcon } from "./StageIcons";
import { StatusMarkIcon } from "./ui";
import type { Stage } from "../data/types";

export default function SupplyChain({ stages }: { stages: Stage[] }) {
  const [active, setActive] = useState(0);
  const stage = stages[active];

  const totalMonths = stages.reduce((s, x) => s + x.durationMonths, 0);

  return (
    <section className="chain panel">
      <div className="chain-head">
        <div>
          <div className="mlabel">Electricity supply to energized load</div>
          <h2 className="chain-title">Power pathway</h2>
        </div>
        <div className="chain-head-right">
          <span className="chain-legend">
            <span className="sdot ok" /> On track
          </span>
          <span className="chain-legend">
            <span className="sdot warn" /> Attention
          </span>
          <span className="chain-legend">
            <span className="sdot risk" /> At risk
          </span>
          <span className="demo-chip">Demo data</span>
        </div>
      </div>

      {/* Stage rail */}
      <div className="chain-rail">
        {stages.map((s, i) => (
          <div className="chain-node-wrap" key={s.key}>
            <button
              className={`chain-node${i === active ? " active" : ""} ${s.status}`}
              onClick={() => setActive(i)}
            >
              <span className="chain-node-idx num">{String(i + 1).padStart(2, "0")}</span>
              <span className="chain-node-icon">
                <StageIcon kind={s.key} />
              </span>
              <span className="chain-node-name">{s.name}</span>
              <span className="chain-node-sub">{s.subtitle}</span>
              <span className="chain-node-metric">
                <span className="chain-node-metric-label">{s.metric.label}</span>
                <span className="chain-node-metric-value num">{s.metric.value}</span>
              </span>
              <span className={`chain-node-bar ${s.status}`} />
            </button>
            {i < stages.length - 1 && (
              <div className="chain-link" aria-hidden>
                <svg viewBox="0 0 40 10" preserveAspectRatio="none">
                  <line x1="0" y1="5" x2="32" y2="5" className="chain-link-line" />
                  <path d="M32 1.5 L38 5 L32 8.5" className="chain-link-arrow" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Relative duration strip — makes the schedule shape legible at a glance */}
      <div className="chain-strip">
        {stages.map((s, i) => (
          <button
            key={s.key}
            className={`chain-strip-seg ${s.status}${i === active ? " active" : ""}`}
            style={{ flex: s.durationMonths }}
            onClick={() => setActive(i)}
            title={`${s.name} · ${s.window}`}
          >
            <span className="chain-strip-label num">{s.durationMonths}mo</span>
          </button>
        ))}
      </div>

      {/* Selected stage detail */}
      <div className="chain-detail">
        <div className="chain-detail-left">
          <div className="chain-detail-head">
            <span className={`chain-detail-idx num ${stage.status}`}>
              {String(active + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="chain-detail-name">{stage.name}</h3>
              <div className="chain-detail-sub">{stage.subtitle}</div>
            </div>
          </div>
          <dl className="chain-facts">
            <div>
              <dt className="mlabel">Owner</dt>
              <dd>{stage.owner}</dd>
            </div>
            <div>
              <dt className="mlabel">Window</dt>
              <dd className="num">{stage.window}</dd>
            </div>
            <div>
              <dt className="mlabel">Duration</dt>
              <dd className="num">{stage.durationMonths} months</dd>
            </div>
            <div>
              <dt className="mlabel">Share of path</dt>
              <dd className="num">{Math.round((stage.durationMonths / totalMonths) * 100)}%</dd>
            </div>
          </dl>
        </div>

        <div className="chain-detail-right">
          <div className="mlabel">What has to happen at this stage</div>
          <ul className="chain-actions">
            {stage.actions.map((a) => (
              <li key={a.text}>
                <StatusMarkIcon status={a.status} />
                <span>{a.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
