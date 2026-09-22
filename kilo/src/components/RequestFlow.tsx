import { useEffect, useState } from "react";
import { Button, StatusMarkIcon, WorkflowRail } from "./ui";
import { getPathway, qLabel } from "../data/pathways";
import { PROVIDER_RESPONSES, REQUEST_STEPS, VERIFICATION_CHECKS } from "../data/portfolio";
import type { SearchCriteria } from "../lib/search";
import type { ProviderResponse } from "../data/portfolio";

interface Props {
  pathwayId: string;
  criteria: SearchCriteria;
  onBack: () => void;
  onDone: () => void;
}

const COUNTERPARTIES = [
  "PPL Electric Utilities",
  "Susquehanna Power Marketing",
  "Keystone Bridge Power",
  "Talen Energy Marketing",
  "Constellation Energy",
  "Vistra Commercial",
  "NextEra Energy Resources",
  "Invenergy Development",
  "Fluence Energy",
  "LS Power Development",
  "Ørsted Onshore",
  "Brookfield Renewable",
  "Exelon Business Services",
  "Calpine Commercial",
];

export default function RequestFlow({ pathwayId, criteria, onBack, onDone }: Props) {
  const p = getPathway(pathwayId);
  const [step, setStep] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sent, setSent] = useState(0);
  const [responsesIn, setResponsesIn] = useState(0);
  const [awardedId, setAwardedId] = useState<string | null>(null);
  const [executed, setExecuted] = useState(false);

  // Counterparties receive the request one by one — the request reads as going somewhere.
  useEffect(() => {
    if (step !== 1 || sent >= COUNTERPARTIES.length) return;
    const t = setTimeout(() => setSent((s) => s + 1), 95);
    return () => clearTimeout(t);
  }, [step, sent]);

  useEffect(() => {
    if (step !== 1 || sent < COUNTERPARTIES.length || responsesIn >= PROVIDER_RESPONSES.length) return;
    const t = setTimeout(() => setResponsesIn((r) => r + 1), 520);
    return () => clearTimeout(t);
  }, [step, sent, responsesIn]);

  if (!p) return <div className="empty">Pathway not found.</div>;

  const firmMw = Math.round(p.deliverableMw * 0.667);
  const flexMw = p.deliverableMw - firmMw;

  return (
    <div className="reqflow">
      <div className="subbar">
        <button className="backlink" onClick={onBack}>
          ← Pathway
        </button>
        <div className="subbar-title">Power Request #1842</div>
        <div className="subbar-sub">
          {p.deliverableMw} MW · {p.state} · {p.energization}
        </div>
        <div className="subbar-spacer" />
        <WorkflowRail active={step >= 3 ? "Secure" : "Request"} compact />
        <span className="topbar-sep" />
        <span className="demo-chip">Demo data</span>
      </div>

      <div className="page">
        <div className="page-inner">
          <div className="reqgrid">
            {/* ───────── The standardized request document ───────── */}
            <aside className="reqdoc-col">
              <div className="reqdoc">
                <div className="reqdoc-watermark">DEMO DATA</div>
                <header className="reqdoc-head">
                  <div className="reqdoc-brand mono">KILO POWER REQUEST</div>
                  <div className="reqdoc-number num">#1842</div>
                </header>

                <div className="reqdoc-hero">
                  <div className="reqdoc-mw num">
                    {p.deliverableMw}
                    <span className="reqdoc-mw-unit">MW</span>
                  </div>
                  <div className="reqdoc-loc">{p.state}</div>
                </div>

                <dl className="reqdoc-terms">
                  <Term label="Required by" value={p.energization} />
                  <Term label="Term" value="15-year requirement" />
                  <Term label="Firm load" value={`${firmMw} MW`} />
                  <Term label="Flexible load" value={`${flexMw} MW`} />
                  <Term label="Reliability" value="Mission critical" />
                  <Term label="Ramp" value="6 quarters to full load" />
                  <Term label="Interconnection" value={`${p.transmissionVoltage}, ${p.market}`} />
                  <Term label="Counterparty" value="Investment grade" />
                </dl>

                <div className="reqdoc-foot">
                  <div className="reqdoc-status">
                    <span className={`reqdoc-dot ${executed ? "ok" : "open"}`} />
                    <span>
                      {executed ? "Capacity secured" : step >= 2 ? "Evaluating responses" : step >= 1 ? "Open to market" : "Draft"}
                    </span>
                  </div>
                  <div className="reqdoc-meta mono">
                    ISSUED {new Date().toISOString().slice(0, 10)} · EXP {qLabel(criteria.requiredByIndex)}
                  </div>
                </div>
              </div>

              <div className="reqdoc-note">
                A Power Request is the standardized unit Kilo puts into the market. One document, one
                normalized set of terms, so proposals from a regulated utility, a generator and a
                developer can be compared on the same basis.
              </div>
            </aside>

            {/* ───────── Steps ───────── */}
            <div className="reqmain">
              <ol className="reqsteps">
                {REQUEST_STEPS.map((s, i) => (
                  <li
                    key={s.key}
                    className={`reqstep${i === step ? " active" : ""}${i < step ? " done" : ""}`}
                  >
                    <button
                      className="reqstep-head"
                      onClick={() => i <= step && setStep(i)}
                      disabled={i > step}
                    >
                      <span className="reqstep-idx num">{i < step ? "✓" : i + 1}</span>
                      <span className="reqstep-text">
                        <span className="reqstep-label">{s.label}</span>
                        <span className="reqstep-caption">{s.caption}</span>
                      </span>
                      <span className="reqstep-state mono">
                        {i < step ? "COMPLETE" : i === step ? "IN PROGRESS" : "PENDING"}
                      </span>
                    </button>

                    {i === step && (
                      <div className="reqstep-body">
                        {i === 0 && (
                          <VerifyStep
                            verifying={verifying}
                            verified={verified}
                            onVerify={() => {
                              setVerifying(true);
                              setTimeout(() => {
                                setVerifying(false);
                                setVerified(true);
                              }, 1200);
                            }}
                            onNext={() => setStep(1)}
                          />
                        )}
                        {i === 1 && (
                          <RequestStep
                            sent={sent}
                            responsesIn={responsesIn}
                            onNext={() => setStep(2)}
                          />
                        )}
                        {i === 2 && (
                          <CompareStep
                            awardedId={awardedId}
                            onAward={setAwardedId}
                            onNext={() => setStep(3)}
                          />
                        )}
                        {i === 3 && (
                          <SecureStep
                            response={PROVIDER_RESPONSES.find((r) => r.id === awardedId) ?? PROVIDER_RESPONSES[0]}
                            executed={executed}
                            onExecute={() => setExecuted(true)}
                            onDone={onDone}
                          />
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <footer className="detail-foot">
            <span className="demo-chip">Demo data</span>
            <p>
              This transaction flow is a demonstration. The counterparties, proposals, pricing, terms,
              collateral requirements and responses shown are entirely fictional. No request has been
              published, no proposal has been received, and nothing on this page constitutes an offer
              or an indication from any real company.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <div className="reqterm">
      <dt className="mlabel">{label}</dt>
      <dd className="num">{value}</dd>
    </div>
  );
}

/* ───────────────────────── Step 1 ───────────────────────── */

function VerifyStep({
  verifying,
  verified,
  onVerify,
  onNext,
}: {
  verifying: boolean;
  verified: boolean;
  onVerify: () => void;
  onNext: () => void;
}) {
  const open = VERIFICATION_CHECKS.filter((c) => c.status === "warn").length;
  return (
    <div className="stepbody">
      <p className="stepintro">
        Before a requirement goes to market, Kilo verifies that it is real and financeable. Anything
        unresolved is disclosed to counterparties rather than hidden — an unverified request gets
        priced for uncertainty.
      </p>

      <div className="vchecks">
        {VERIFICATION_CHECKS.map((c) => (
          <div className={`vcheck ${c.status}`} key={c.label}>
            <StatusMarkIcon status={c.status} />
            <div className="vcheck-main">
              <div className="vcheck-label">{c.label}</div>
              <div className="vcheck-value num">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="stepfoot">
        <div className="stepfoot-note">
          <span className="num">{VERIFICATION_CHECKS.length - open}</span> of{" "}
          <span className="num">{VERIFICATION_CHECKS.length}</span> checks clear.{" "}
          <span className="warn-text">{open} disclosed as open</span> — these will be published with
          the request.
        </div>
        {verified ? (
          <Button variant="primary" onClick={onNext}>
            Publish to market →
          </Button>
        ) : (
          <Button variant="primary" onClick={onVerify} disabled={verifying}>
            {verifying ? (
              <>
                <span className="btn-spinner" /> Verifying
              </>
            ) : (
              "Verify project"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Step 2 ───────────────────────── */

function RequestStep({
  sent,
  responsesIn,
  onNext,
}: {
  sent: number;
  responsesIn: number;
  onNext: () => void;
}) {
  const complete = sent >= COUNTERPARTIES.length;
  return (
    <div className="stepbody">
      <p className="stepintro">
        The request goes to qualified counterparties in and around the target market — regulated
        utilities, generators, independent power producers and developers. Each receives the same
        standardized document.
      </p>

      <div className="sendgrid">
        <div className="sendlist">
          <div className="sendlist-head">
            <span className="mlabel">Distribution</span>
            <span className="num sendlist-count">
              {sent} / {COUNTERPARTIES.length}
            </span>
          </div>
          <div className="sendlist-body">
            {COUNTERPARTIES.map((c, i) => (
              <div className={`sendrow${i < sent ? " sent" : ""}`} key={c}>
                <span className="sendrow-dot" />
                <span className="sendrow-name">{c}</span>
                <span className="sendrow-state mono">{i < sent ? "DELIVERED" : "QUEUED"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="respstatus">
          <div className="mlabel">Responses</div>
          <div className="respstatus-num num">
            {responsesIn}
            <span>/ {COUNTERPARTIES.length} invited</span>
          </div>
          <div className="respstatus-bar">
            <span style={{ width: `${(responsesIn / PROVIDER_RESPONSES.length) * 100}%` }} />
          </div>
          <ul className="respstatus-list">
            {PROVIDER_RESPONSES.map((r, i) => (
              <li key={r.id} className={i < responsesIn ? "in" : ""}>
                <span className="sdot ok" />
                <span>{r.provider}</span>
                <span className="mono">{i < responsesIn ? r.responded : "—"}</span>
              </li>
            ))}
          </ul>
          {!complete && <div className="respstatus-note mono">DISTRIBUTING REQUEST…</div>}
        </div>
      </div>

      <div className="stepfoot">
        <div className="stepfoot-note">
          {responsesIn === PROVIDER_RESPONSES.length
            ? "Three counterparties responded with deliverable proposals."
            : "Awaiting responses. In a live market this window would run 10–20 business days."}
        </div>
        <Button variant="primary" onClick={onNext} disabled={responsesIn < PROVIDER_RESPONSES.length}>
          Compare pathways →
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────── Step 3 ───────────────────────── */

const COMPARE_ROWS: {
  label: string;
  get: (r: ProviderResponse) => string;
  best?: (rs: ProviderResponse[]) => string;
}[] = [
  { label: "Capacity offered", get: (r) => `${r.mw} MW`, best: (rs) => rs.reduce((a, b) => (b.mw > a.mw ? b : a)).id },
  { label: "Firm / flexible", get: (r) => `${r.firmMw} / ${r.flexibleMw} MW` },
  {
    label: "Energization",
    get: (r) => r.energization,
    best: (rs) => rs.reduce((a, b) => (b.energization < a.energization ? b : a)).id,
  },
  {
    label: "Indicative price",
    get: (r) => r.price,
    best: (rs) => rs.reduce((a, b) => (b.priceNumeric < a.priceNumeric ? b : a)).id,
  },
  { label: "Term", get: (r) => r.term },
  {
    label: "Carbon intensity",
    get: (r) => `${r.carbon} kg/MWh`,
    best: (rs) => rs.reduce((a, b) => (b.carbon < a.carbon ? b : a)).id,
  },
  { label: "Collateral", get: (r) => r.collateral },
  { label: "Exclusivity", get: (r) => r.exclusivity },
  {
    label: "Requirement match",
    get: (r) => `${r.match}%`,
    best: (rs) => rs.reduce((a, b) => (b.match > a.match ? b : a)).id,
  },
];

function CompareStep({
  awardedId,
  onAward,
  onNext,
}: {
  awardedId: string | null;
  onAward: (id: string) => void;
  onNext: () => void;
}) {
  const totalMw = PROVIDER_RESPONSES.reduce((s, r) => s + r.mw, 0);
  return (
    <div className="stepbody">
      <p className="stepintro">
        Three responses, three fundamentally different products: regulated grid service, a contracted
        generation attribute, and privately built bridge power. Normalized here so they can actually
        be compared. Together they offer <span className="num">{totalMw} MW</span> against a 120 MW
        requirement — the realistic outcome is a combination, not a winner.
      </p>

      <div className="respcards">
        {PROVIDER_RESPONSES.map((r) => (
          <button
            key={r.id}
            className={`respcard${awardedId === r.id ? " awarded" : ""}`}
            onClick={() => onAward(r.id)}
          >
            <div className="respcard-head">
              <span className={`tag ${r.status === "Responsive" ? "ok" : r.status === "Partial" ? "warn" : ""}`}>
                {r.status}
              </span>
              <span className="respcard-match num">{r.match}% match</span>
            </div>
            <h4 className="respcard-provider">{r.provider}</h4>
            <div className="respcard-type mono">{r.providerType.toUpperCase()}</div>
            <div className="respcard-pathway">{r.pathwayLabel}</div>

            <div className="respcard-figures">
              <div>
                <div className="mlabel">Offered</div>
                <div className="num">{r.mw} MW</div>
              </div>
              <div>
                <div className="mlabel">Energized</div>
                <div className="num">{r.energization}</div>
              </div>
              <div>
                <div className="mlabel">Price</div>
                <div className="num">{r.price}</div>
              </div>
            </div>

            <div className="respcard-lists">
              <div className="mlabel">Strengths</div>
              <ul className="respcard-ul ok">
                {r.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <div className="mlabel">Conditions</div>
              <ul className="respcard-ul warn">
                {r.conditions.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="respcard-select">
              <span className="respcard-radio" />
              {awardedId === r.id ? "Selected for award" : "Select this pathway"}
            </div>
          </button>
        ))}
      </div>

      <div className="comparetable-wrap">
        <div className="mlabel comparetable-title">Normalized comparison</div>
        <table className="dtable comparetable">
          <thead>
            <tr>
              <th>Term</th>
              {PROVIDER_RESPONSES.map((r) => (
                <th key={r.id} className="r">
                  {r.provider}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => {
              const bestId = row.best?.(PROVIDER_RESPONSES);
              return (
                <tr key={row.label}>
                  <td className="strong">{row.label}</td>
                  {PROVIDER_RESPONSES.map((r) => (
                    <td key={r.id} className={`r num${bestId === r.id ? " best" : ""}`}>
                      {row.get(r)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="stepfoot">
        <div className="stepfoot-note">
          {awardedId
            ? "Selection recorded. Proceed to award and execution."
            : "Select a pathway to proceed."}
        </div>
        <Button variant="primary" onClick={onNext} disabled={!awardedId}>
          Secure capacity →
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────── Step 4 ───────────────────────── */

function SecureStep({
  response,
  executed,
  onExecute,
  onDone,
}: {
  response: ProviderResponse;
  executed: boolean;
  onExecute: () => void;
  onDone: () => void;
}) {
  const steps = [
    { label: "Award notice issued", detail: `${response.provider} notified of selection` },
    { label: "Definitive agreement", detail: response.structure },
    { label: "Collateral posted", detail: response.collateral },
    { label: "Interconnection filed", detail: "Position secured in the next available cycle" },
    { label: "Capacity contracted", detail: `${response.mw} MW committed for ${response.term}` },
  ];

  return (
    <div className="stepbody">
      {!executed ? (
        <>
          <p className="stepintro">
            Awarding converts a pathway into a contracted position. In a live transaction each line
            below is a document, a signature and a wire.
          </p>

          <div className="awardsummary">
            <div className="awardsummary-head">
              <div>
                <div className="mlabel">Awarding to</div>
                <h4>{response.provider}</h4>
                <div className="awardsummary-type mono">{response.providerType.toUpperCase()}</div>
              </div>
              <div className="awardsummary-figs">
                <div>
                  <div className="mlabel">Capacity</div>
                  <div className="num">{response.mw} MW</div>
                </div>
                <div>
                  <div className="mlabel">Price</div>
                  <div className="num">{response.price}</div>
                </div>
                <div>
                  <div className="mlabel">Term</div>
                  <div className="num">{response.term}</div>
                </div>
                <div>
                  <div className="mlabel">Energized</div>
                  <div className="num">{response.energization}</div>
                </div>
              </div>
            </div>
            <ol className="awardsteps">
              {steps.map((s, i) => (
                <li key={s.label}>
                  <span className="awardstep-idx num">{i + 1}</span>
                  <span className="awardstep-label">{s.label}</span>
                  <span className="awardstep-detail">{s.detail}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="stepfoot">
            <div className="stepfoot-note">
              This is a demonstration. No award will be issued and no counterparty will be contacted.
            </div>
            <Button variant="primary" onClick={onExecute}>
              Execute award
            </Button>
          </div>
        </>
      ) : (
        <div className="secured">
          <div className="secured-mark">✓</div>
          <h3 className="secured-title">Capacity secured</h3>
          <p className="secured-body">
            <span className="num">{response.mw} MW</span> awarded to {response.provider} for{" "}
            {response.term}, energizing {response.energization} at {response.price}. Power Request
            #1842 is now closed and the position is tracked under Project Atlas.
          </p>
          <div className="secured-chain">
            {["Search", "Verify", "Request", "Secure"].map((s) => (
              <span className="secured-chain-item" key={s}>
                {s}
              </span>
            ))}
          </div>
          <div className="secured-actions">
            <Button variant="primary" onClick={onDone}>
              View in Projects →
            </Button>
          </div>
          <div className="secured-demo">
            <span className="demo-chip">Demo data</span> Nothing was executed, sent or committed.
          </div>
        </div>
      )}
    </div>
  );
}
