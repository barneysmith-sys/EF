import { Button, SectionHead } from "./ui";
import { REQUESTS, REQUEST_STEPS, PROVIDER_RESPONSES } from "../data/portfolio";

const STATUS_TONE: Record<string, string> = {
  Draft: "",
  Open: "info",
  "Evaluating responses": "signal",
  Awarded: "ok",
  Closed: "",
};

export default function RequestsView({
  onOpenPathway,
  onOpenRequest,
}: {
  onOpenPathway: (id: string) => void;
  onOpenRequest: (pathwayId: string) => void;
}) {
  const openRequests = REQUESTS.filter((r) => r.status !== "Closed");
  const totalMw = openRequests.reduce((s, r) => s + r.mw, 0);
  const totalResponses = openRequests.reduce((s, r) => s + r.responses, 0);

  return (
    <div className="pageview">
      <div className="subbar">
        <div className="subbar-title">Requests</div>
        <div className="subbar-sub">Standardized power requirements in market</div>
        <div className="subbar-spacer" />
        <span className="demo-chip">Demo data</span>
      </div>

      <div className="page">
        <div className="page-inner">
          <header className="reqhead">
            <div className="reqhead-stat">
              <div className="mlabel">Open requests</div>
              <div className="num">{openRequests.length}</div>
            </div>
            <div className="reqhead-div" />
            <div className="reqhead-stat">
              <div className="mlabel">Capacity in market</div>
              <div className="num">{totalMw} MW</div>
            </div>
            <div className="reqhead-div" />
            <div className="reqhead-stat">
              <div className="mlabel">Responses received</div>
              <div className="num">{totalResponses}</div>
            </div>
            <div className="reqhead-div" />
            <div className="reqhead-stat">
              <div className="mlabel">Median response time</div>
              <div className="num">4.5 days</div>
            </div>
          </header>

          <SectionHead
            eyebrow="Power requests"
            title="Every requirement, in one standardized format"
            right={<span className="demo-chip">Demo data</span>}
          />

          <div className="panel reqtable-wrap">
            <table className="dtable reqtable">
              <thead>
                <tr>
                  <th>Request</th>
                  <th className="r">Capacity</th>
                  <th>Location</th>
                  <th className="r">Required by</th>
                  <th className="r">Firm / flex</th>
                  <th className="r">Term</th>
                  <th>Reliability</th>
                  <th className="r">Responses</th>
                  <th>Stage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {REQUESTS.map((r) => (
                  <tr
                    key={r.id}
                    className={r.pathwayId ? "clickable" : ""}
                    onClick={() => r.pathwayId && onOpenRequest(r.pathwayId)}
                  >
                    <td className="strong num">#{r.number}</td>
                    <td className="r num strong">{r.mw} MW</td>
                    <td>{r.location}</td>
                    <td className="r num">{r.requiredBy}</td>
                    <td className="r num">
                      {r.firmMw} / {r.flexibleMw}
                    </td>
                    <td className="r num">{r.termYears} yr</td>
                    <td>{r.reliability}</td>
                    <td className="r num">{r.responses}</td>
                    <td>
                      <div className="stepdots">
                        {REQUEST_STEPS.map((s, i) => (
                          <span
                            key={s.key}
                            className={`stepdot${i <= r.stepIndex ? " on" : ""}`}
                            title={s.label}
                          />
                        ))}
                        <span className="stepdots-label">{REQUEST_STEPS[r.stepIndex].label}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`tag ${STATUS_TONE[r.status]}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Live request detail */}
          <div className="reqlive">
            <SectionHead
              eyebrow="Request #1842 · 120 MW Pennsylvania"
              title="Responses in market"
              right={
                <Button size="sm" variant="primary" onClick={() => onOpenRequest("pa-luzerne")}>
                  Open request →
                </Button>
              }
            />
            <div className="reqlive-grid">
              {PROVIDER_RESPONSES.map((r) => (
                <div className="reqlive-card panel" key={r.id}>
                  <div className="reqlive-card-head">
                    <span className={`tag ${r.status === "Responsive" ? "ok" : r.status === "Partial" ? "warn" : ""}`}>
                      {r.status}
                    </span>
                    <span className="mono reqlive-time">{r.responded}</span>
                  </div>
                  <h4>{r.provider}</h4>
                  <div className="reqlive-type mono">{r.providerType.toUpperCase()}</div>
                  <div className="reqlive-figs">
                    <div>
                      <div className="mlabel">Offered</div>
                      <div className="num">{r.mw} MW</div>
                    </div>
                    <div>
                      <div className="mlabel">Price</div>
                      <div className="num">{r.price}</div>
                    </div>
                    <div>
                      <div className="mlabel">Energized</div>
                      <div className="num">{r.energization}</div>
                    </div>
                    <div>
                      <div className="mlabel">Match</div>
                      <div className="num signal-text">{r.match}%</div>
                    </div>
                  </div>
                  <p className="reqlive-structure">{r.structure}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="reqcta panel">
            <div>
              <div className="mlabel">Coverage</div>
              <h4>Kilo has not verified any of this</h4>
              <p>
                In a production system, a Power Request would carry verified load, credit and site
                control, and every response would be backed by a named counterparty under an NDA. In
                this prototype, all of it is fabricated.
              </p>
            </div>
            <Button onClick={() => onOpenPathway("pa-luzerne")}>View underlying pathway →</Button>
          </div>

          <footer className="detail-foot">
            <span className="demo-chip">Demo data</span>
            <p>
              Requests, counterparties, response times, proposals and terms are fictional
              demonstration content.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
