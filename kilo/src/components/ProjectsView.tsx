import { useState } from "react";
import UsMap from "./UsMap";
import { Button, ConfidenceMeter, SectionHead, StatusMarkIcon, WorkflowRail } from "./ui";
import { PROJECTS, PORTFOLIO_TOTAL_MW } from "../data/portfolio";
import { getPathway } from "../data/pathways";
import { geographyById } from "../lib/geo";

const STAGE_TONE: Record<string, string> = {
  Evaluating: "",
  "Utility Engagement": "warn",
  "Securing Capacity": "signal",
};

export default function ProjectsView({
  onOpenPathway,
  onNewSearch,
}: {
  onOpenPathway: (id: string) => void;
  onNewSearch: () => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const pathways = PROJECTS.map((p) => getPathway(p.pathwayId)).filter((p) => p !== undefined);
  const secured = PROJECTS.filter((p) => p.stage === "Securing Capacity").reduce((s, p) => s + p.mw, 0);
  return (
    <div className="pageview">
      <div className="subbar">
        <div className="subbar-title">Projects</div>
        <div className="subbar-sub">Active capacity development portfolio</div>
        <div className="subbar-spacer" />
        <WorkflowRail active="Verify" compact />
        <span className="topbar-sep" />
        <span className="demo-chip">Demo data</span>
        <Button size="sm" onClick={onNewSearch}>
          New search
        </Button>
      </div>

      <div className="page">
        <div className="page-inner">
          {/* Portfolio header */}
          <header className="portfolio">
            <div className="portfolio-primary">
              <div className="mlabel">Total under evaluation</div>
              <div className="portfolio-mw num">
                {PORTFOLIO_TOTAL_MW}
                <span>MW</span>
              </div>
              <div className="portfolio-sub">
                Across {PROJECTS.length} projects in {new Set(PROJECTS.map((p) => p.state)).size}{" "}
                states and {new Set(pathways.map((p) => p.market)).size} markets
              </div>
            </div>

            <div className="portfolio-stats">
              <div className="pstat">
                <div className="mlabel">In securing</div>
                <div className="pstat-val num signal">{secured} MW</div>
                <div className="pstat-sub">Project Orion, ERCOT West</div>
              </div>
              <div className="pstat">
                <div className="mlabel">Utility-confirmed MW</div>
                <div className="pstat-val num">Unknown</div>
                <div className="pstat-sub">No project has a utility letter</div>
              </div>
              <div className="pstat">
                <div className="mlabel">Earliest supported date</div>
                <div className="pstat-val num">Unknown</div>
                <div className="pstat-sub">Modeled dates are not energization dates</div>
              </div>
              <div className="pstat">
                <div className="mlabel">Capital at risk</div>
                <div className="pstat-val num">Unknown</div>
                <div className="pstat-sub">Not sourced from a contract</div>
              </div>
            </div>
          </header>

          <div className="projgrid">
            <div className="projlist">
              <SectionHead eyebrow="Portfolio" title="Active projects" />

              {PROJECTS.map((proj) => {
                const path = getPathway(proj.pathwayId);
                return (
                  <article
                    className={`projcard${hoveredId === proj.pathwayId ? " hovered" : ""}`}
                    key={proj.id}
                    onMouseEnter={() => setHoveredId(proj.pathwayId)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onOpenPathway(proj.pathwayId)}
                  >
                    <div className="projcard-head">
                      <div className="projcard-code num">{proj.codename}</div>
                      <div className="projcard-title">
                        <h3>{proj.name}</h3>
                        <div className="projcard-loc">
                          {proj.state} · {path?.utility ?? ""} · {path?.market ?? ""}
                        </div>
                      </div>
                      <span className={`tag ${STAGE_TONE[proj.stage]}`}>{proj.stage}</span>
                    </div>

                    <div className="projcard-figs">
                      <div>
                        <div className="mlabel">Capacity</div>
                        <div className="num projcard-mw">{proj.mw} MW</div>
                      </div>
                      <div>
                        <div className="mlabel">Energization</div>
                        <div className="num">{proj.energization}</div>
                      </div>
                      <div>
                        <div className="mlabel">Indicative</div>
                        <div className="num">{proj.priceBand}</div>
                      </div>
                      <div>
                        <div className="mlabel">Confidence</div>
                        <ConfidenceMeter value={proj.confidence} width={52} />
                      </div>
                      <div>
                        <div className="mlabel">Committed</div>
                        <div className="num">{proj.committedCapex}</div>
                      </div>
                    </div>

                    <div className="projcard-milestones">
                      {proj.milestones.map((m, i) => (
                        <div className={`milestone ${m.status}`} key={m.label}>
                          <span className="milestone-node" />
                          {i < proj.milestones.length - 1 && <span className="milestone-line" />}
                          <span className="milestone-label">{m.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="projcard-foot">
                      <div className="projcard-next">
                        <StatusMarkIcon status="warn" />
                        <span className="projcard-next-text">{proj.nextAction}</span>
                        <span className="projcard-due num">{proj.nextActionDue}</span>
                      </div>
                      <div className="projcard-meta mono">
                        {proj.owner} · updated {proj.updated}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="projside">
              <div className="panel projmap">
                <div className="projmap-head">
                  <span className="mlabel">Portfolio geography</span>
                  <span className="demo-chip">Demo</span>
                </div>
                <div className="projmap-canvas">
                  <UsMap
                    pathways={pathways}
                    geography={geographyById("national")}
                    selectedId={hoveredId}
                    hoveredId={hoveredId}
                    onSelect={onOpenPathway}
                    onHover={setHoveredId}
                    emphasizeGeography={false}
                  />
                </div>
              </div>

              <div className="panel projsummary">
                <div className="mlabel">Portfolio by market</div>
                <div className="projsummary-list">
                  {Object.entries(
                    PROJECTS.reduce<Record<string, number>>((acc, p) => {
                      const m = getPathway(p.pathwayId)?.market ?? "Other";
                      acc[m] = (acc[m] ?? 0) + p.mw;
                      return acc;
                    }, {}),
                  ).map(([market, mw]) => (
                    <div className="projsummary-row" key={market}>
                      <span className="projsummary-label">{market}</span>
                      <span className="projsummary-track">
                        <span style={{ width: `${(mw / PORTFOLIO_TOTAL_MW) * 100}%` }} />
                      </span>
                      <span className="num projsummary-val">{mw} MW</span>
                    </div>
                  ))}
                </div>

                <div className="projsummary-div" />

                <div className="mlabel">Portfolio by stage</div>
                <div className="projsummary-list">
                  {["Evaluating", "Utility Engagement", "Securing Capacity"].map((stage) => {
                    const mw = PROJECTS.filter((p) => p.stage === stage).reduce((s, p) => s + p.mw, 0);
                    return (
                      <div className="projsummary-row" key={stage}>
                        <span className="projsummary-label">{stage}</span>
                        <span className="projsummary-track">
                          <span style={{ width: `${(mw / PORTFOLIO_TOTAL_MW) * 100}%` }} />
                        </span>
                        <span className="num projsummary-val">{mw} MW</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>

          <footer className="detail-foot">
            <span className="demo-chip">Demo data</span>
            <p>
              Projects, milestones, capital figures, owners and next actions are fictional and exist
              only to demonstrate the product.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
