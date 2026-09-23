import { useState } from "react";
import type { Discovery, Fact } from "../data/discovery";
import { PERSPECTIVES, useDiscovery } from "./DiscoveryContext";
import type { Pathway } from "../data/types";

export default function ProjectWorkspace({ pathway, discovery }: { pathway: Pathway; discovery: Discovery }) {
  const { perspective } = useDiscovery();
  const view = PERSPECTIVES.find((p) => p.id === perspective) ?? PERSPECTIVES[0];
  const [actor, setActor] = useState(discovery.actors[0]?.role ?? "");
  const selected = discovery.actors.find((a) => a.role === actor) ?? discovery.actors[0];

  return (
    <div className="workspace" data-perspective={perspective}>
      <header className="ws-head">
        <div>
          <div className="mlabel">Power project · mock</div>
          <h2 className="ws-name">{discovery.projectName}</h2>
          <div className="ws-meta num">
            {pathway.deliverableMw} MW modeled · {pathway.state} · Target {pathway.energization}
          </div>
        </div>
        <div className="ws-view">
          <div className="mlabel">{view.label} view</div>
          <p>{view.question}</p>
          <p className="ws-cares">{view.cares}</p>
        </div>
      </header>

      <section className="ws-block">
        <div className="mlabel">Lifecycle</div>
        <ol className="life">
          {discovery.lifecycle.map((stage, i) => (
            <li key={stage.label} className="life-stage">
              <div className="life-idx num">{String(i + 1).padStart(2, "0")}</div>
              <div className="life-label">{stage.label}</div>
              <dl>
                <Row k="Owner" v={stage.owner} />
                <Row k="Decision maker" v={stage.decisionMaker} />
                <Row k="Required evidence" v={stage.evidence} />
                <Row k="Capital at risk" v={stage.capitalAtRisk} />
                <Row k="Status" v={stage.status} />
                <Row k="Primary blocker" v={stage.blocker} />
                <Row k="Next action" v={stage.next} />
              </dl>
            </li>
          ))}
        </ol>
      </section>

      <section className={`ws-block${perspective === "utility" ? " emphasis" : ""}`}>
        <div className="ws-block-head">
          <div className="mlabel">Project readiness</div>
          <p>No overall score. Each line is a claim and the evidence behind it.</p>
        </div>
        <div className="ready">
          {discovery.readiness.map((item) => (
            <div className="ready-item" key={item.label}>
              <div className="ready-top">
                <span>{item.label}</span>
                <span className="ready-state">{item.state}</span>
              </div>
              <div className="ready-ev">{item.evidence}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="ws-split">
        <Party title="Demand" question="Who needs the electricity?" facts={discovery.demand} hot={perspective === "developer"} />
        <Party title="Delivery / grid" question="Who can say it will be served?" facts={discovery.grid} hot={perspective === "utility" || perspective === "customer"} />
        <Party title="Development / supply" question="What has to be built?" facts={discovery.supply} hot={perspective === "developer" || perspective === "customer"} />
      </section>

      <section className="ws-block">
        <div className="mlabel">Who controls what?</div>
        <div className="actors">
          <div className="actor-nav">
            {discovery.actors.map((a) => (
              <button
                key={a.role}
                className={a.role === selected?.role ? "active" : ""}
                onClick={() => setActor(a.role)}
              >
                {a.role}
              </button>
            ))}
          </div>
          {selected && (
            <dl className="actor-card">
              <Row k="Role" v={selected.role} />
              <Row k="What they want" v={selected.wants} />
              <Row k="What they control" v={selected.controls} />
              <Row k="What they do not control" v={selected.doesNot} />
              <Row k="Risk they bear" v={selected.risk} />
              <Row k="What they pay for" v={selected.pays} />
              <Row k="Key decision" v={selected.decision} />
              <Row k="Current status" v={selected.status} />
            </dl>
          )}
        </div>
        <div className="seats">
          {discovery.seats.map((s) => (
            <div key={s.seat} className="seat">
              <div className="mlabel">{s.seat}</div>
              <div className={s.who === "Unknown" ? "unknown" : ""}>{s.who}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={`ws-block${perspective === "customer" ? " emphasis" : ""}`}>
        <div className="mlabel">Decision map</div>
        <p className="ws-lead">Where authority has to change hands before anything is energized.</p>
        <ol className="dmap">
          {discovery.decisions.map((d, i) => (
            <li key={d.decision}>
              <div className="dmap-idx num">{String(i + 1).padStart(2, "0")}</div>
              <div className="dmap-main">
                <div className="dmap-title">{d.decision}</div>
                <div className="dmap-grid">
                  <Row k="Actor responsible" v={d.actor} />
                  <Row k="Dependencies" v={d.depends} />
                  <Row k="Money committed" v={d.money} />
                  <Row k="Evidence required" v={d.evidence} />
                  <Row k="Expected time" v={d.time} />
                  <Row k="Status" v={d.status === "unknown" ? "Unknown" : d.status} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Party({ title, question, facts, hot }: { title: string; question: string; facts: Fact[]; hot: boolean }) {
  return (
    <section className={`party${hot ? " emphasis" : ""}`}>
      <div className="mlabel">{title}</div>
      <p>{question}</p>
      <ul>
        {facts.map((f) => (
          <li key={f.label}>
            <div className="party-label">{f.label}</div>
            <div className="party-value">{f.value}</div>
            <span className={`cert cert-${f.certainty.toLowerCase().replace(/\s+/g, "-")}`}>{f.certainty}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="ws-row">
      <dt>{k}</dt>
      <dd className={v === "Unknown" ? "unknown" : ""}>{v}</dd>
    </div>
  );
}
