import { useEffect, useState } from "react";
import {
  localWholesale,
  subscribeLive,
  type LiveBoard,
} from "../lib/market/live";

export function useLiveBoard(): { board: LiveBoard | null; loading: boolean } {
  const [board, setBoard] = useState<LiveBoard | null>(null);
  useEffect(() => subscribeLive(setBoard), []);
  return { board, loading: board === null };
}

function fmtMw(n: number) {
  return Number.isFinite(n) ? Math.round(n).toLocaleString("en-US") : "—";
}

const FUEL_CLASS: Record<string, string> = {
  Coal: "coal",
  "Natural Gas": "gas",
  Nuclear: "nuclear",
  Wind: "wind",
  Solar: "solar",
};

export function LiveReference() {
  const { board, loading } = useLiveBoard();
  const miso = board?.miso;

  return (
    <div className="liveref">
      <span className={`livedot${miso ? " on" : ""}`} />
      {loading && <span className="liveref-text">Reading the MISO print…</span>}
      {!loading && miso && (
        <>
          <span className="liveref-kicker">Live wholesale</span>
          <span className="liveref-text">
            MISO marginal energy{" "}
            <b className="num">${miso.marginalEnergy.toFixed(2)}/MWh</b>
            <span className="liveref-muted"> · {fmtMw(miso.demandMw)} MW · {miso.asOf}</span>
          </span>
          <span className="liveref-note">
            This is the energy price. Pathway prices below are modeled all-in, and most of them are not in MISO.
          </span>
        </>
      )}
      {!loading && !miso && (
        <span className="liveref-text">MISO print unavailable. Pathway prices below are still modeled.</span>
      )}
    </div>
  );
}

export function LocalWholesaleRow({ market }: { market: string }) {
  const { board } = useLiveBoard();
  if (!board) return null;
  const ref = localWholesale(market, board);
  return (
    <div className="dside-row dside-live">
      <span>
        <span className="mlabel">{ref.label}</span>
        <span className="dside-live-note">{ref.note}</span>
      </span>
      <span className={`dside-val num${ref.value.startsWith("$") ? " signal" : ""}`}>{ref.value}</span>
    </div>
  );
}

export default function LiveTape() {
  const { board, loading } = useLiveBoard();
  const miso = board?.miso;
  const fuelTotal = miso?.fuel.reduce((s, f) => s + Math.max(0, f.mw), 0) ?? 0;

  return (
    <section className="livetape panel" aria-label="Live wholesale print">
      <header className="livetape-head">
        <div>
          <div className="mlabel">Live print</div>
          <h3>What the grid is doing right now</h3>
        </div>
        <span className="livetape-source mono">
          {miso ? `MISO · ${miso.asOf}` : loading ? "MISO · CONNECTING" : "MISO · OFFLINE"}
        </span>
      </header>

      {miso && (
        <>
          <div className="livetape-figs">
            <div>
              <div className="mlabel">Demand</div>
              <div className="livetape-val num">
                {fmtMw(miso.demandMw)} <span>MW</span>
              </div>
            </div>
            <div>
              <div className="mlabel">Peak forecast</div>
              <div className="livetape-val num">
                {fmtMw(miso.peakForecastMw)} <span>MW</span>
              </div>
            </div>
            <div>
              <div className="mlabel">Marginal energy</div>
              <div className="livetape-val num signal">
                ${miso.marginalEnergy.toFixed(2)} <span>/MWh</span>
              </div>
            </div>
            <div>
              <div className="mlabel">Net export</div>
              <div className="livetape-val num">
                {fmtMw(miso.netExportMw)} <span>MW</span>
              </div>
              <div className="livetape-hint">Negative means the footprint is importing</div>
            </div>
          </div>

          <div className="fuel">
            <div className="fuelbar" aria-hidden>
              {miso.fuel.map((f) => (
                <span
                  key={f.name}
                  className={FUEL_CLASS[f.name] ?? "other"}
                  style={{ width: `${fuelTotal > 0 ? (Math.max(0, f.mw) / fuelTotal) * 100 : 0}%` }}
                />
              ))}
            </div>
            <div className="fuellegend">
              {miso.fuel.map((f) => (
                <span key={f.name}>
                  <i className={FUEL_CLASS[f.name] ?? "other"} />
                  {f.name} <b className="num">{fmtMw(f.mw)}</b>
                </span>
              ))}
            </div>
          </div>

          {miso.hubs.length > 0 && (
            <div className="hubs">
              <span className="mlabel">Hub LMP</span>
              {miso.hubs.map((h) => (
                <span key={h.name} className="hub">
                  <span className="hub-name">{h.name}</span>
                  <span className="num">${h.lmp.toFixed(2)}</span>
                </span>
              ))}
              <span className="hub-note">Texas hub is MISO South, not ERCOT.</span>
            </div>
          )}
        </>
      )}

      {!loading && !miso && (
        <p className="livetape-error">The MISO public feed did not answer. {board?.misoError}</p>
      )}

      <div className="feeds">
        <div className="mlabel">Feeds</div>
        <ul>
          <li>
            <span className="feed-state on">Connected</span>
            <span>
              <b>MISO public API.</b> Five-minute demand, fuel mix and hub LMP. No key.
            </span>
          </li>
          <FeedRow
            on={board?.eiaStatus === "ok"}
            error={board?.eiaStatus === "error"}
            title="EIA Open Data."
            body={
              board?.eiaStatus === "ok"
                ? `Hourly demand is in for ${board.eia?.map((r) => r.name).join(", ")}.`
                : "Hourly demand for PJM and the other regions. The key stays in .env.local on the dev server, not in the site."
            }
          />
          <FeedRow
            on={board?.pjmStatus === "ok"}
            error={board?.pjmStatus === "error"}
            title="PJM Data Miner."
            body={
              board?.pjm && board.pjmStatus === "ok"
                ? `${board.pjm.node} wholesale energy $${board.pjm.lmp.toFixed(2)}/MWh. Not a retail rate.`
                : "PJM-RTO hourly LMP. The subscription key stays on the dev server. This is not the price a data center pays."
            }
          />
        </ul>
        {(board?.eiaError || board?.pjmError) && (
          <p className="livetape-error">
            {board.eiaError ? `EIA: ${board.eiaError}. ` : ""}
            {board.pjmError ? `PJM: ${board.pjmError}.` : ""}
          </p>
        )}
        {board?.eia && board.eia.length > 0 && (
          <div className="eiademand">
            {board.eia.map((r) => (
              <span key={r.respondent}>
                {r.name} <b className="num">{fmtMw(r.demandMw)} MW</b>
                <span className="liveref-muted"> {r.period}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FeedRow({
  on,
  error,
  title,
  body,
}: {
  on: boolean;
  error: boolean;
  title: string;
  body: string;
}) {
  return (
    <li>
      <span className={`feed-state${on ? " on" : error ? " bad" : ""}`}>
        {on ? "Connected" : error ? "Failed" : "Needs a key"}
      </span>
      <span>
        <b>{title}</b> {body}
      </span>
    </li>
  );
}
