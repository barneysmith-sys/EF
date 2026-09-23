import { useLiveBoard } from "./LiveTape";

function fmtMw(n: number) {
  return Number.isFinite(n) ? Math.round(n).toLocaleString("en-US") : "—";
}

/** Public regional facts beside the model. None of these is site deliverability. */
export default function RegionalEvidence({ virginia = false }: { virginia?: boolean }) {
  const { board, loading } = useLiveBoard();
  const pjmDemand = board?.eia?.find((row) => row.respondent === "PJM");
  const retail = virginia ? board?.virginiaRetail : null;
  const pjm = board?.pjm;

  return (
    <section className="region" aria-label="Public regional evidence">
      <header className="region-head">
        <div>
          <div className="mlabel">Public evidence</div>
          <p>Regional statistics. They do not say this site can be served, or what it would cost.</p>
        </div>
      </header>
      <div className="region-grid">
        <article>
          <div className="mlabel">EIA · PJM demand</div>
          <div className="region-val num">
            {pjmDemand ? (
              <>
                {fmtMw(pjmDemand.demandMw)} <span>MW</span>
              </>
            ) : (
              loading ? "Reading" : "Not connected"
            )}
          </div>
          <p>{pjmDemand ? `${pjmDemand.coverage} Period ${pjmDemand.period}.` : "Hourly system load for the whole PJM footprint."}</p>
          <p className="region-caveat">{pjmDemand?.caveat ?? "Needs EIA_API_KEY on the dev server."}</p>
        </article>
        <article>
          <div className="mlabel">PJM · wholesale energy</div>
          <div className="region-val num">
            {pjm ? (
              <>
                ${pjm.lmp.toFixed(2)} <span>/MWh</span>
              </>
            ) : (
              loading ? "Reading" : "Not connected"
            )}
          </div>
          <p>{pjm ? `${pjm.node}. ${pjm.coverage}` : "PJM-RTO aggregate, when a Data Miner key is on the server."}</p>
          <p className="region-caveat">{pjm?.caveat ?? "A wholesale print is not a data-center price."}</p>
        </article>
        {virginia && (
          <article>
            <div className="mlabel">EIA · Virginia retail average</div>
            <div className="region-val num">
              {retail ? (
                <>
                  {retail.priceCentsPerKwh.toFixed(2)} <span>¢/kWh</span>
                </>
              ) : (
                loading ? "Reading" : "Not connected"
              )}
            </div>
            <p>{retail ? `${retail.coverage} Month ${retail.period}.` : "Statewide all-sectors average. Not a Dominion quote."}</p>
            <p className="region-caveat">{retail?.caveat ?? "Still not the rate for this load."}</p>
          </article>
        )}
        <article className="region-open">
          <div className="mlabel">Requires the utility</div>
          <ul>
            <li>Whether this load can be served</li>
            <li>The study, and who pays for it</li>
            <li>What infrastructure is actually required</li>
            <li>Who can sign, and for what</li>
            <li>A date anyone will stand behind</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
