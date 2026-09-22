import { useState } from "react";
import { Button, SectionHead, Sparkline } from "./ui";
import { MARKET_REGIONS, type MarketRegion } from "../data/portfolio";

const HEADROOM_TONE: Record<MarketRegion["headroom"], string> = {
  Deep: "ok",
  Moderate: "",
  Tight: "warn",
  "Severely constrained": "risk",
};

export default function MarketView({ onSearch }: { onSearch: () => void }) {
  const [selected, setSelected] = useState<string>(MARKET_REGIONS[0].code);
  const region = MARKET_REGIONS.find((r) => r.code === selected)!;

  const maxQueue = Math.max(...MARKET_REGIONS.map((r) => r.queueGw));

  return (
    <div className="pageview">
      <div className="subbar">
        <div className="subbar-title">Market</div>
        <div className="subbar-sub">Deliverability, price and schedule by region</div>
        <div className="subbar-spacer" />
        <span className="demo-chip">Demo data</span>
        <Button size="sm" onClick={onSearch}>
          New search
        </Button>
      </div>

      <div className="page">
        <div className="page-inner">
          <SectionHead
            eyebrow="Regional conditions"
            title="Where megawatts are actually deliverable"
            right={
              <span className="market-asof mono">
                INDICATIVE · MODELED FROM PUBLIC DATA · DEMO
              </span>
            }
          />

          <div className="markettable-wrap panel">
            <table className="dtable markettable">
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Operator</th>
                  <th className="r">Median $/MWh</th>
                  <th className="r">12-qtr trend</th>
                  <th className="r">Energization lag</th>
                  <th className="r">Load queue</th>
                  <th className="r">Cleared</th>
                  <th className="r">kg CO₂/MWh</th>
                  <th>Headroom</th>
                </tr>
              </thead>
              <tbody>
                {MARKET_REGIONS.map((r) => (
                  <tr
                    key={r.code}
                    className={`clickable${selected === r.code ? " selected-row" : ""}`}
                    onClick={() => setSelected(r.code)}
                  >
                    <td className="strong">
                      <span className="market-code mono">{r.code}</span> {r.name}
                    </td>
                    <td>{r.operator}</td>
                    <td className="r num strong">${r.medianPrice}</td>
                    <td className="r">
                      <div className="market-trend">
                        <Sparkline
                          data={r.series}
                          tone={r.priceDelta > 5 ? "risk" : r.priceDelta < 0 ? "ok" : "signal"}
                        />
                        <span className={`num market-delta ${r.priceDelta > 0 ? "up" : "down"}`}>
                          {r.priceDelta > 0 ? "+" : ""}
                          {r.priceDelta.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="r num">
                      {r.medianLagQuarters} qtrs
                      <span className={`market-sub ${r.lagDelta > 0 ? "up" : "down"}`}>
                        {r.lagDelta > 0 ? `+${r.lagDelta}` : r.lagDelta}
                      </span>
                    </td>
                    <td className="r">
                      <div className="queuecell">
                        <span className="queuebar">
                          <span style={{ width: `${(r.queueGw / maxQueue) * 100}%` }} />
                        </span>
                        <span className="num">{r.queueGw} GW</span>
                      </div>
                    </td>
                    <td className="r num">{r.clearedGw} GW</td>
                    <td className="r num">{r.carbon}</td>
                    <td>
                      <span className={`tag ${HEADROOM_TONE[r.headroom]}`}>{r.headroom}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="marketdetail">
            <div className="marketdetail-main panel">
              <div className="marketdetail-head">
                <div>
                  <div className="mlabel">{region.operator}</div>
                  <h3>{region.name}</h3>
                </div>
                <span className={`tag ${HEADROOM_TONE[region.headroom]}`}>{region.headroom}</span>
              </div>
              <p className="marketdetail-note">{region.note}</p>

              <div className="marketdetail-figs">
                <div>
                  <div className="mlabel">Queue conversion</div>
                  <div className="num">{((region.clearedGw / region.queueGw) * 100).toFixed(1)}%</div>
                  <div className="marketdetail-sub">
                    {region.clearedGw} GW cleared of {region.queueGw} GW requested
                  </div>
                </div>
                <div>
                  <div className="mlabel">Typical wait</div>
                  <div className="num">{region.medianLagQuarters} quarters</div>
                  <div className="marketdetail-sub">Request to energization, median</div>
                </div>
                <div>
                  <div className="mlabel">Deliverability score</div>
                  <div className="num">{region.headroomScore}/100</div>
                  <div className="marketdetail-sub">Blend of headroom, queue depth and lag</div>
                </div>
              </div>

              <div className="scorebars">
                {MARKET_REGIONS.map((r) => (
                  <div className={`scorebar${r.code === region.code ? " active" : ""}`} key={r.code}>
                    <span className="scorebar-label mono">{r.code}</span>
                    <span className="scorebar-track">
                      <span
                        className={HEADROOM_TONE[r.headroom] || "neutral"}
                        style={{ width: `${r.headroomScore}%` }}
                      />
                    </span>
                    <span className="num scorebar-val">{r.headroomScore}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="marketdetail-side panel">
              <div className="mlabel">What the market is telling you</div>
              <ul className="marketinsights">
                <li>
                  <span className="mi-num num">01</span>
                  <span>
                    The cheapest power and the fastest interconnection are in the same place —
                    ERCOT — and so is the most settlement risk.
                  </span>
                </li>
                <li>
                  <span className="mi-num num">02</span>
                  <span>
                    Virginia has the deepest ecosystem and the worst deliverability. Proximity to
                    Ashburn does not create megawatts.
                  </span>
                </li>
                <li>
                  <span className="mi-num num">03</span>
                  <span>
                    Queue conversion is under 10% everywhere. Requested capacity is a poor proxy for
                    capacity that will exist.
                  </span>
                </li>
                <li>
                  <span className="mi-num num">04</span>
                  <span>
                    Non-ISO territory trades a queue for a negotiation. The Carolinas move fast
                    physically and slowly commercially.
                  </span>
                </li>
              </ul>
              <div className="marketinsights-foot">
                <span className="demo-chip">Demo data</span>
                Figures are modeled illustrations, not market data.
              </div>
            </aside>
          </div>

          <footer className="detail-foot">
            <span className="demo-chip">Demo data</span>
            <p>
              Regional prices, queue volumes, energization lags, carbon intensities and headroom
              assessments are synthetic figures produced for this prototype. They are not sourced
              from PJM, ERCOT, MISO, any utility or any market operator.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
