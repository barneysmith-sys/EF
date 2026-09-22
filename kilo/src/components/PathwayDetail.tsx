import { useMemo, useState } from "react";
import SupplyChain from "./SupplyChain";
import EvidencePanel from "./EvidencePanel";
import Gantt from "./Gantt";
import UsMap from "./UsMap";
import {
  Button,
  ConfidenceMeter,
  MixBar,
  SectionHead,
  StatusDot,
  StatusMarkIcon,
  WorkflowRail,
} from "./ui";
import { getPathway, qLabel } from "../data/pathways";
import { geographyById } from "../lib/geo";
import type { SearchCriteria } from "../lib/search";
import type { Section } from "../data/types";

interface Props {
  id: string;
  criteria: SearchCriteria;
  onBack: () => void;
  onRequestCapacity: () => void;
}

export default function PathwayDetail({ id, criteria, onBack, onRequestCapacity }: Props) {
  const p = getPathway(id);
  const [openSection, setOpenSection] = useState<string | null>(p?.sections[0]?.key ?? null);

  const capexTotal = useMemo(() => {
    if (!p) return 0;
    return Math.round((p.capexPerKw * p.deliverableMw * 1000) / 1_000_000);
  }, [p]);

  if (!p) return <div className="empty">Pathway not found.</div>;

  const quartersLate = p.energizationQ - criteria.requiredByIndex;
  const meetsDate = quartersLate <= 0;

  return (
    <div className="detail">
      <div className="subbar">
        <button className="backlink" onClick={onBack}>
          ← Results
        </button>
        <div className="subbar-title">{p.state}</div>
        <div className="subbar-sub">{p.locality}</div>
        <div className="subbar-spacer" />
        <WorkflowRail active="Verify" compact />
        <span className="topbar-sep" />
        <span className="demo-chip">Demo data</span>
        <Button variant="primary" size="sm" onClick={onRequestCapacity}>
          Request Capacity →
        </Button>
      </div>

      <div className="page">
        <div className="detail-inner">
          {/* ───────── Hero ───────── */}
          <header className="dhero">
            <div className="dhero-main">
              <div className="dhero-eyebrow">
                <span className="tag info">{p.market}</span>
                <span className="tag">{p.marketZone}</span>
                <span className="dhero-utility">{p.utility}</span>
              </div>

              <div className="dhero-figures">
                <div className="dfig primary">
                  <div className="dfig-value num">
                    {p.deliverableMw}
                    <span className="dfig-unit">MW</span>
                  </div>
                  <div className="mlabel">Estimated deliverable</div>
                </div>
                <div className="dfig-div" />
                <div className="dfig">
                  <div className="dfig-value num">{p.state}</div>
                  <div className="mlabel">{p.locality}</div>
                </div>
                <div className="dfig-div" />
                <div className="dfig">
                  <div className={`dfig-value num${meetsDate ? "" : " warn"}`}>{p.energization}</div>
                  <div className="mlabel">Target energization</div>
                </div>
                <div className="dfig-div" />
                <div className="dfig">
                  <div className="dfig-value num">
                    {p.confidence}
                    <span className="dfig-unit">%</span>
                  </div>
                  <div className="mlabel">Pathway confidence</div>
                </div>
              </div>

              <p className="dhero-summary">{p.summary}</p>
            </div>

            <aside className="dhero-side">
              <div className="dside-card">
                <div className="dside-row">
                  <span className="mlabel">Indicative cost</span>
                  <span className="dside-val num signal">
                    ${p.allInLow}–{p.allInHigh}/MWh
                  </span>
                </div>
                <div className="dside-row">
                  <span className="mlabel">Est. capex</span>
                  <span className="dside-val num">${capexTotal}M</span>
                </div>
                <div className="dside-row">
                  <span className="mlabel">Carbon intensity</span>
                  <span className="dside-val num">{p.carbonIntensity} kg/MWh</span>
                </div>
                <div className="dside-row">
                  <span className="mlabel">Reliability</span>
                  <span className="dside-val">{p.reliabilityTier}</span>
                </div>
                <div className="dside-row">
                  <span className="mlabel">Vs. requirement</span>
                  <span className={`dside-val num ${meetsDate ? "ok" : "warn"}`}>
                    {meetsDate
                      ? `${Math.abs(quartersLate)} qtr float`
                      : `${quartersLate} qtr late`}
                  </span>
                </div>
                <div className="dside-mix">
                  <span className="mlabel">Power pathway</span>
                  <MixBar grid={p.mix.grid} generation={p.mix.generation} storage={p.mix.storage} showLegend height={7} />
                </div>
                <Button variant="primary" full onClick={onRequestCapacity}>
                  Request Capacity
                </Button>
                <div className="dside-cta-note">
                  Converts this pathway into a standardized Power Request and puts it in front of
                  utilities, generators and developers.
                </div>
              </div>
            </aside>
          </header>

          {/* ───────── Status checklist ───────── */}
          <section className="dchecklist">
            {p.checklist.map((c) => (
              <div className={`dcheck ${c.status}`} key={c.label}>
                <StatusMarkIcon status={c.status} label={c.label} />
                <div className="dcheck-note">{c.note}</div>
              </div>
            ))}
          </section>

          {/* ───────── Supply chain ───────── */}
          <SupplyChain stages={p.stages} />

          {/* ───────── Body: sections + evidence ───────── */}
          <div className="dbody">
            <div className="dbody-main">
              <SectionHead
                eyebrow="Pathway diligence"
                title="What we know, and how well we know it"
                right={<span className="demo-chip">Demo data</span>}
              />

              <div className="dsections">
                {p.sections.map((s) => (
                  <SectionBlock
                    key={s.key}
                    section={s}
                    open={openSection === s.key}
                    onToggle={() => setOpenSection(openSection === s.key ? null : s.key)}
                    evidenceTitles={p.evidence}
                  />
                ))}
              </div>

              {/* Estimated cost */}
              <div className="dblock" id="cost">
                <SectionHead
                  eyebrow="Estimated cost"
                  title="Delivered cost and capital requirement"
                  right={
                    <span className="dblock-headline num signal">
                      ${p.allInLow}–{p.allInHigh}/MWh all-in
                    </span>
                  }
                />
                <div className="costgrid">
                  <div className="costcol">
                    <div className="mlabel costcol-head">Energy and charges — $/MWh</div>
                    {p.costs
                      .filter((c) => c.kind !== "capex")
                      .map((c) => (
                        <div className="costrow" key={c.label}>
                          <div className="costrow-main">
                            <span className="costrow-label">{c.label}</span>
                            <span className="costrow-value num">{c.value}</span>
                          </div>
                          <div className="costrow-detail">{c.detail}</div>
                        </div>
                      ))}
                    <div className="costrow total">
                      <div className="costrow-main">
                        <span className="costrow-label">All-in delivered</span>
                        <span className="costrow-value num signal">
                          ${p.allInLow}–{p.allInHigh}/MWh
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="costcol">
                    <div className="mlabel costcol-head">Capital — one time</div>
                    {p.costs
                      .filter((c) => c.kind === "capex")
                      .map((c) => (
                        <div className="costrow" key={c.label}>
                          <div className="costrow-main">
                            <span className="costrow-label">{c.label}</span>
                            <span className="costrow-value num">{c.value}</span>
                          </div>
                          <div className="costrow-detail">{c.detail}</div>
                        </div>
                      ))}
                    <div className="costrow total">
                      <div className="costrow-main">
                        <span className="costrow-label">Indicative capex</span>
                        <span className="costrow-value num signal">
                          ${capexTotal}M · ${p.capexPerKw.toLocaleString()}/kW
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="dblock" id="timeline">
                <SectionHead
                  eyebrow="Timeline"
                  title="Critical path to first megawatt"
                  right={
                    <span className={`dblock-headline num ${meetsDate ? "ok" : "warn"}`}>
                      {p.scheduleNote}
                    </span>
                  }
                />
                <Gantt
                  phases={p.timeline}
                  energizationQ={p.energizationQ}
                  requiredByQ={criteria.requiredByIndex}
                />
              </div>

              {/* Risks */}
              <div className="dblock" id="risks">
                <SectionHead
                  eyebrow="Key risks"
                  title="What would move the date or the price"
                  right={
                    <span className="dblock-headline num">
                      {p.risks.filter((r) => r.severity === "High").length} high · {p.risks.length} total
                    </span>
                  }
                />
                <div className="risklist">
                  {p.risks.map((r) => (
                    <div className={`riskcard sev-${r.severity.toLowerCase()}`} key={r.title}>
                      <div className="risk-head">
                        <span className={`tag ${r.severity === "High" ? "risk" : r.severity === "Medium" ? "warn" : ""}`}>
                          {r.severity}
                        </span>
                        <h4 className="risk-title">{r.title}</h4>
                        <div className="risk-metrics">
                          <span className="risk-metric">
                            <span className="mlabel">Likelihood</span>
                            <span className="num">{r.likelihood}%</span>
                          </span>
                          <span className="risk-metric">
                            <span className="mlabel">Schedule</span>
                            <span className="num">
                              {r.delayMonths > 0 ? `+${r.delayMonths} mo` : "No delay"}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="risk-cols">
                        <div>
                          <div className="mlabel">If it happens</div>
                          <p>{r.impact}</p>
                        </div>
                        <div>
                          <div className="mlabel">Mitigation</div>
                          <p>{r.mitigation}</p>
                        </div>
                      </div>
                      <div className="risk-bar">
                        <span style={{ width: `${r.likelihood}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ───────── Sidebar ───────── */}
            <aside className="dbody-side">
              <div className="dside-sticky">
                <div className="dmini-map panel">
                  <div className="dmini-map-head">
                    <span className="mlabel">Location</span>
                    <span className="mono dmini-coords">
                      {Math.abs(p.coords[1]).toFixed(2)}°N {Math.abs(p.coords[0]).toFixed(2)}°W
                    </span>
                  </div>
                  <div className="dmini-map-canvas">
                    <UsMap
                      pathways={[p]}
                      geography={geographyById(criteria.geographyId)}
                      selectedId={p.id}
                      hoveredId={null}
                      onSelect={() => {}}
                      onHover={() => {}}
                      emphasizeGeography={false}
                    />
                  </div>
                  <div className="dmini-map-foot">
                    <div>
                      <span className="mlabel">Transmission</span>
                      <span className="num">
                        {p.transmissionDistanceMi} mi · {p.transmissionVoltage}
                      </span>
                    </div>
                    <div>
                      <span className="mlabel">Land</span>
                      <span className="num">{p.landAcres} ac</span>
                    </div>
                    <div>
                      <span className="mlabel">Fiber</span>
                      <span className="num">{p.fiberCarriers} carriers</span>
                    </div>
                  </div>
                </div>

                <EvidencePanel evidence={p.evidence} />

                <div className="dconf panel">
                  <div className="mlabel">Confidence composition</div>
                  <div className="dconf-total">
                    <span className="num">{p.confidence}%</span>
                    <ConfidenceMeter value={p.confidence} showLabel={false} width={100} />
                  </div>
                  <div className="dconf-list">
                    {p.sections.slice(0, 9).map((s) => (
                      <div className="dconf-row" key={s.key}>
                        <span className="dconf-label">{s.title}</span>
                        <span className="dconf-track">
                          <span
                            className={`dconf-fill ${s.confidence >= 80 ? "high" : s.confidence >= 65 ? "mid" : "low"}`}
                            style={{ width: `${s.confidence}%` }}
                          />
                        </span>
                        <span className="dconf-val num">{s.confidence}</span>
                      </div>
                    ))}
                  </div>
                  <div className="dconf-note">
                    Pathway confidence is the evidence-weighted blend of the section scores above.
                    Illustrative only.
                  </div>
                </div>

                <div className="dcta panel">
                  <div className="mlabel">Next step</div>
                  <h4 className="dcta-title">Request Capacity</h4>
                  <p className="dcta-body">
                    Publish a standardized Power Request for {p.deliverableMw} MW in {p.state} by{" "}
                    {p.energization} and collect normalized proposals.
                  </p>
                  <Button variant="primary" full onClick={onRequestCapacity}>
                    Request Capacity →
                  </Button>
                </div>
              </div>
            </aside>
          </div>

          <footer className="detail-foot">
            <span className="demo-chip">Demo data</span>
            <p>
              This page is a demonstration. Deliverable capacity, energization dates, pricing,
              interconnection positions, permitting status, equipment lead times and every document in
              the evidence panel are synthetic figures created to illustrate the product. They are not
              verified, not sourced from any utility or market operator, and must not be relied upon
              for any decision. Requirement date shown for comparison: {qLabel(criteria.requiredByIndex)}.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Section block ───────────────────────── */

function SectionBlock({
  section,
  open,
  onToggle,
  evidenceTitles,
}: {
  section: Section;
  open: boolean;
  onToggle: () => void;
  evidenceTitles: { id: string; title: string }[];
}) {
  const tone = section.confidence >= 80 ? "high" : section.confidence >= 65 ? "mid" : "low";
  const warnCount = section.rows.filter((r) => r.status === "warn" || r.status === "risk").length;

  return (
    <div className={`dsection${open ? " open" : ""}`}>
      <button className="dsection-head" onClick={onToggle}>
        <span className="dsection-chevron" aria-hidden>
          {open ? "−" : "+"}
        </span>
        <span className="dsection-title">{section.title}</span>
        <span className="dsection-headline">{section.headline}</span>
        {warnCount > 0 && (
          <span className="dsection-flags">
            <StatusDot status="warn" />
            <span className="num">{warnCount}</span>
          </span>
        )}
        <span className={`dsection-conf num ${tone}`}>{section.confidence}%</span>
      </button>

      {open && (
        <div className="dsection-body">
          <div className="dsection-rows">
            {section.rows.map((r) => (
              <div className="drow" key={r.label}>
                <div className="drow-label">{r.label}</div>
                <div className="drow-value">
                  <span className={`num${r.status ? ` ${r.status}` : ""}`}>{r.value}</span>
                  {r.status && <StatusDot status={r.status} />}
                </div>
                {r.note && <div className="drow-note">{r.note}</div>}
              </div>
            ))}
          </div>
          <div className="dsection-prose">
            <p>{section.body}</p>
            <div className="dsection-evidence">
              <span className="mlabel">Evidence</span>
              <div className="dsection-evidence-list">
                {section.evidenceIds.map((eid) => {
                  const doc = evidenceTitles.find((e) => e.id === eid);
                  return doc ? (
                    <span className="evref" key={eid} title={doc.title}>
                      {doc.title}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
