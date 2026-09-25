import { useState } from "react";
import type { Actor, PathStep, VirginiaWorkspace } from "../data/discovery";
import type { Pathway } from "../data/types";
import { ATLAS_CLAIMS, BOTTLENECK, COMMERCIAL, CONTROL, EVIDENCE_ROOM, MUST_BECOME_TRUE, READINESS } from "../lib/evidence/atlas";
import { readinessState } from "../lib/evidence/types";
import { EvidenceBadge } from "./evidence/EvidenceBadge";
import { track } from "../lib/analytics";

const DEAL = [
  { id: "customer", kicker: "Customer", question: "Who needs 100 MW, and who can sign for it?" },
  { id: "utility", kicker: "Utility", question: "What would Dominion have to study, and who pays?" },
  { id: "infra", kicker: "Developer", question: "What has to be built, and who would build it?" },
];

export default function ProjectWorkspace({
  pathway,
  workspace,
  requestedMw,
  requiredBy,
}: {
  pathway: Pathway;
  workspace: VirginiaWorkspace;
  requestedMw: number;
  requiredBy: string;
}) {
  const [actorId, setActorId] = useState("customer");
  const [stepId, setStepId] = useState(workspace.path[0]?.id ?? "");
  const actor = workspace.actors.find((item) => item.id === actorId) ?? workspace.actors[0];
  const step = workspace.path.find((item) => item.id === stepId) ?? workspace.path[0];

  return (
    <div className="workspace">
      <section className="ws-block path-brief" onClick={() => track("path to power opened")}>
        <div className="mlabel">Path to power · demo</div>
        <div className="brief-grid">
          <div><span className="mlabel">Target energization</span><strong>{BOTTLENECK.target}</strong><EvidenceBadge claim={ATLAS_CLAIMS.targetDate} /></div>
          <div><span className="mlabel">Earliest supported</span><strong className="unknown">{BOTTLENECK.earliest}</strong><EvidenceBadge claim={ATLAS_CLAIMS.earliestDate} /></div>
          <div><span className="mlabel">Bottleneck</span><strong>{BOTTLENECK.bottleneck}</strong></div>
          <div><span className="mlabel">Bottleneck owner</span><strong>{BOTTLENECK.owner}</strong></div>
          <div><span className="mlabel">Next decision</span><strong>{BOTTLENECK.next}</strong></div>
          <div><span className="mlabel">Who can unblock it</span><strong className="unknown">{BOTTLENECK.unblock}</strong></div>
          <div><span className="mlabel">Capital at risk</span><strong className="unknown">{BOTTLENECK.capital}</strong></div>
        </div>
      </section>
      <header className="ws-head">
        <div>
          <div className="mlabel">Deal room · mock</div>
          <h2 className="ws-name">{workspace.projectName}</h2>
          <p className="ws-lead">
            An illustration of a {requestedMw} MW data-center requirement in {pathway.state}, asked for{" "}
            {requiredBy}. The figures below are a model of one pathway. They are not capacity Dominion
            or PJM has offered.
          </p>
        </div>
        <dl className="ws-facts">
          <Fact k="Requirement" v={`${requestedMw} MW`} note="Stated. Unverified." />
          <Fact k="Modeled deliverable" v={`${pathway.deliverableMw} MW`} note="Estimate. Not available." />
          <Fact k="Modeled energization" v={pathway.energization} note="Estimate. Not a commitment." />
          <Fact k="Utility in the model" v={pathway.utility} note="Unverified for this site." />
        </dl>
      </header>

      <section className="ws-block">
        <div className="mlabel">Customer, utility, developer</div>
        <p className="ws-lead">
          Three parties have to be in the room before anyone can talk about energizing this load. The others may have a veto. Selecting one does not mean they are the customer for Kilo.
        </p>
        <div className="deal">
          {DEAL.map((item) => (
            <button
              key={item.id}
              className={actorId === item.id ? "active" : ""}
              onClick={() => setActorId(item.id)}
            >
              <span className="mlabel">{item.kicker}</span>
              <span>{item.question}</span>
            </button>
          ))}
        </div>
        <div className="actors">
          <div className="actor-nav">
            {workspace.actors.map((item) => (
              <button
                key={item.id}
                className={item.id === actor?.id ? "active" : ""}
                onClick={() => setActorId(item.id)}
              >
                {item.role}
              </button>
            ))}
          </div>
          {actor && <ActorCard actor={actor} />}
        </div>
        <div className="seats">
          {workspace.seats.map((seat) => (
            <div key={seat.seat} className="seat">
              <div className="mlabel">{seat.seat}</div>
              <div className="unknown">{seat.who}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="ws-block">
        <div className="mlabel">One possible path to power</div>
        <p className="ws-lead">
          This order is a hypothesis for a Dominion and PJM data-center load. It is not the sequence for every utility, every state, or every commercial structure. Steps can stall, run together, or turn out to be unnecessary.
        </p>
        <div className="path">
          <ol className="path-nav">
            {workspace.path.map((item, index) => (
              <li key={item.id}>
                <button
                  className={item.id === step?.id ? "active" : ""}
                  onClick={() => setStepId(item.id)}
                >
                  <span className="num">{String(index + 1).padStart(2, "0")}</span>
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
          {step && <StepCard step={step} />}
        </div>
      </section>

      <section className="ws-block">
        <div className="mlabel">Readiness · not a score</div>
        <div className="ready-grid">
          {READINESS.map((dimension) => (
            <div key={dimension.name}>
              <div className="mlabel">{dimension.name}</div>
              <strong className={readinessState(dimension.items) === "VERIFIED" ? "" : "unknown"}>
                {readinessState(dimension.items)}
              </strong>
              <ul>
                {dimension.items.map((item) => (
                  <li key={item.label}>{item.label} · {item.mark}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="ws-block">
        <div className="mlabel">What must become true</div>
        <ul className="must">
          {MUST_BECOME_TRUE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="ws-block">
        <div className="mlabel">Who controls what</div>
        <table className="control">
          <tbody>
            {CONTROL.map((row) => (
              <tr key={row.decision}>
                <td>{row.decision}</td>
                <td>{row.who}</td>
                <td className={row.status === "UNKNOWN" ? "unknown" : ""}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="ws-block">
        <div className="mlabel">Commercial terms · unsourced</div>
        <table className="control">
          <tbody>
            {COMMERCIAL.map((row) => (
              <tr key={row.field}>
                <td>{row.field}</td>
                <td className="unknown">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="ws-block">
        <div className="mlabel">Evidence room · nothing attached</div>
        <ul className="must">
          {EVIDENCE_ROOM.map((doc) => (
            <li key={doc.type}>{doc.type} · {doc.status}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ActorCard({ actor }: { actor: Actor }) {
  return (
    <dl className="actor-card">
      <Row k="Role and incentive" v={actor.incentive} />
      <Row k="Decisions they control" v={actor.controls} />
      <Row k="Decisions requiring another party" v={actor.needsOthers} />
      <Row k="Financial commitments and risks" v={actor.money} />
      <Row k="Outstanding information" v={actor.outstanding} />
      <Row k="Next action" v={actor.next} />
    </dl>
  );
}

function StepCard({ step }: { step: PathStep }) {
  return (
    <dl className="actor-card">
      <Row k="Responsible" v={step.responsible} />
      <Row k="Dependencies" v={step.depends} />
      <Row k="Evidence required" v={step.evidence} />
      <Row k="Blocker" v={step.blocker} />
      <Row k="Why this may not apply" v={step.note} />
    </dl>
  );
}

function Fact({ k, v, note }: { k: string; v: string; note: string }) {
  return (
    <div>
      <dt className="mlabel">{k}</dt>
      <dd className="num">{v}</dd>
      <dd className="ws-fact-note">{note}</dd>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  const unknown = v.includes("UNKNOWN") || v === "Unknown";
  return (
    <div className="ws-row">
      <dt>{k}</dt>
      <dd className={unknown ? "unknown" : ""}>{v}</dd>
    </div>
  );
}
