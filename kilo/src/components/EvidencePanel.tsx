import { useState } from "react";
import type { EvidenceDoc } from "../data/types";

const KIND_ABBR: Record<EvidenceDoc["kind"], string> = {
  "Queue data": "QUE",
  Study: "STU",
  Tariff: "TAR",
  GIS: "GIS",
  Survey: "SRV",
  Filing: "FIL",
  "Market data": "MKT",
  Correspondence: "COR",
};

export default function EvidencePanel({
  evidence,
  highlightIds,
  compact = false,
}: {
  evidence: EvidenceDoc[];
  highlightIds?: string[];
  compact?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(evidence[0]?.id ?? null);

  return (
    <section className={`evidence panel${compact ? " compact" : ""}`}>
      <div className="evidence-head">
        <div>
          <div className="mlabel">Underlying inputs</div>
          <h3 className="evidence-title">Evidence</h3>
        </div>
        <span className="demo-chip">Demo data</span>
      </div>

      <div className="evidence-note">
        Every estimate on this page traces to one of these inputs. In the prototype all documents are
        synthetic — no real filing, study or correspondence is represented.
      </div>

      <ol className="evidence-list">
        {evidence.map((d) => {
          const open = openId === d.id;
          const highlighted = highlightIds?.includes(d.id);
          return (
            <li key={d.id} className={`edoc${open ? " open" : ""}${highlighted ? " hl" : ""}`}>
              <button className="edoc-head" onClick={() => setOpenId(open ? null : d.id)}>
                <span className={`edoc-kind mono ${d.freshness}`}>{KIND_ABBR[d.kind]}</span>
                <span className="edoc-main">
                  <span className="edoc-title">{d.title}</span>
                  <span className="edoc-meta mono">
                    {d.source} · {d.dated}
                  </span>
                </span>
                <span className="edoc-weight">
                  <span className="edoc-weight-bar">
                    <span style={{ width: `${d.weight * 100 * 2.6}%` }} />
                  </span>
                  <span className="edoc-weight-val num">{(d.weight * 100).toFixed(0)}%</span>
                </span>
              </button>

              {open && (
                <div className="edoc-body">
                  <div className="edoc-row">
                    <span className="mlabel">Supports</span>
                    <span className="edoc-supports">{d.supports}</span>
                  </div>
                  <blockquote className="edoc-excerpt">
                    <span className="edoc-watermark">DEMO DATA</span>
                    {d.excerpt}
                  </blockquote>
                  <div className="edoc-foot">
                    <span className={`tag ${d.freshness === "current" ? "ok" : d.freshness === "aging" ? "warn" : "risk"}`}>
                      {d.freshness === "current" ? "Current" : d.freshness === "aging" ? "Aging" : "Stale"}
                    </span>
                    <span className="edoc-foot-meta mono">
                      {d.kind} · contributes {(d.weight * 100).toFixed(0)}% of confidence
                    </span>
                    <button className="edoc-open">Open document →</button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
