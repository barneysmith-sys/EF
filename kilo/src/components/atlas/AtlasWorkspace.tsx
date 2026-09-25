import { useState } from "react";
import { EVIDENCE_TYPES, SCENARIOS } from "../../domain/seed";
import { blockingCount, materialBlockers, nextDecision, packetChecks, useProjects } from "../../domain/store";
import type { AtlasSection, PowerProject } from "../../domain/types";

const NAV: { id: AtlasSection; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "case", label: "Power case" },
  { id: "requirement", label: "Requirement" },
  { id: "path", label: "Path to answer" },
  { id: "decisions", label: "Decisions" },
  { id: "evidence", label: "Evidence" },
  { id: "counterparties", label: "Counterparties" },
  { id: "commercial", label: "Economics" },
  { id: "memo", label: "Memo" },
  { id: "activity", label: "Activity" },
];

export default function AtlasWorkspace({
  projectId,
  section,
  onSection,
  onClose,
}: {
  projectId: string;
  section: AtlasSection;
  onSection: (section: AtlasSection) => void;
  onClose: () => void;
}) {
  const store = useProjects();
  const project = store.project(projectId);
  const decision = nextDecision(project);

  return (
    <div className="atlas">
      <aside className="atlas-nav">
        <button className="backlink" onClick={onClose}>← Portfolio</button>
        <div className="atlas-name">{project.name}</div>
        <div className="demo-chip">Demo project</div>
        <button className="text-btn" onClick={() => store.setInterview(!store.interview)}>
          {store.interview ? "Interview on" : "Interview off"}
        </button>
        <nav>
          {NAV.map((item) => (
            <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => onSection(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
        <FounderNote module={section} projectId={project.id} />
      </aside>
      <div className="atlas-main">
        <header className="atlas-strip">
          <Strip k="Requirement" v={`${project.mw} MW`} onClick={() => onSection("requirement")} />
          <Strip k="Target" v={project.target} onClick={() => onSection("case")} />
          <Strip k="Supported energization" v="Unknown" unknown onClick={() => onSection("case")} />
          <Strip k="Utility-confirmed MW" v="Unknown" unknown onClick={() => onSection("case")} />
          <Strip k="Current phase" v="Pre-utility engagement" onClick={() => onSection("overview")} />
          <Strip k="Primary blocker" v="Utility feasibility" onClick={() => onSection("decisions")} />
          <Strip k="Next decision" v={decision.title} onClick={() => onSection("decisions")} />
        </header>
        {store.interview && <InterviewBar module={section} projectId={project.id} />}
        {section === "overview" && <Overview project={project} onSection={onSection} />}
        {section === "case" && <PowerCase project={project} onSection={onSection} />}
        {section === "requirement" && <Requirement project={project} />}
        {section === "path" && <Path project={project} />}
        {section === "decisions" && <Decisions project={project} onSection={onSection} />}
        {section === "evidence" && <Evidence project={project} />}
        {section === "counterparties" && <Counterparties project={project} />}
        {section === "commercial" && <Commercial project={project} />}
        {section === "memo" && <Memo project={project} />}
        {section === "activity" && <Activity project={project} />}
      </div>
    </div>
  );
}

function Strip({ k, v, onClick, unknown }: { k: string; v: string; onClick: () => void; unknown?: boolean }) {
  return (
    <button className="strip" onClick={onClick}>
      <span className="mlabel">{k}</span>
      <strong className={unknown ? "unknown" : ""}>{v}</strong>
    </button>
  );
}

function Overview({ project, onSection }: { project: PowerProject; onSection: (section: AtlasSection) => void }) {
  const decision = nextDecision(project);
  const checks = packetChecks(project);
  const known = project.claims.filter((claim) => claim.status !== "UNKNOWN" && claim.status !== "UNSUPPORTED").length;
  return (
    <div className="atlas-grid">
      <section>
        <h2>What we are trying to do</h2>
        <p>{project.mw} MW · {project.geography} · Target {project.target} · {project.useCase} · {project.reliability}</p>
        <p className="quiet">Where we are: {project.phase}. This is a candidate project record, not available capacity.</p>
      </section>
      <section>
        <h2>Next decision</h2>
        <p className="decision-title">{decision.title}</p>
        <p>{decision.why}</p>
        <p className="quiet">Status {decision.status}. Counterparty {project.utility}. Specific contact unknown. Owner unknown.</p>
        <button className="text-btn" onClick={() => onSection("decisions")}>Prepare decision packet</button>
      </section>
      <section>
        <h2>Material blockers</h2>
        <ul className="blocker-list">
          {materialBlockers(project).map((item) => (
            <li key={item.title}>
              <button onClick={() => onSection(item.section)}>
                <span className="mlabel">{item.kind}</span>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Evidence</h2>
        <p>{known} claims have a source. {project.claims.length - known} are unknown or unsupported. {project.evidence.length} documents registered.</p>
        <p className="quiet">Packet blocking items: {blockingCount(project)}. Entity {checks.entity ? "named" : "unknown"}. Load {checks.load ? "entered" : "missing"}. Site {checks.site ? "noted" : "missing"}.</p>
        <button className="text-btn" onClick={() => onSection("evidence")}>Open evidence</button>
      </section>
      <section>
        <h2>Recent material changes</h2>
        <ul className="activity-list">
          {project.activity.slice(0, 4).map((item) => (
            <li key={item.id}><span className="mlabel">{item.at} · Demo</span> {item.label}. {item.detail}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Requirement({ project }: { project: PowerProject }) {
  const store = useProjects();
  const [draft, setDraft] = useState(project.load);
  const [entity, setEntity] = useState(project.customerEntity === "UNKNOWN" ? "" : project.customerEntity);
  return (
    <div className="atlas-stack">
      <section>
        <h2>Identity</h2>
        <Field k="Requirement" v={`#${project.requirementId}`} />
        <Field k="Customer" v={project.customer} />
        <label className="field">Legal entity
          <input
            value={entity}
            placeholder="UNKNOWN"
            onChange={(event) => setEntity(event.target.value)}
            onBlur={(event) => store.setCustomerEntity(project.id, event.currentTarget.value.trim() || "UNKNOWN")}
          />
        </label>
        <Field k="Geography" v={project.geography} />
        <Field k="Target" v={`${project.target} · user supplied, not an energization date`} />
        <Field k="Use case" v={project.useCase} />
      </section>
      <section>
        <h2>Load envelope</h2>
        <p className="quiet">Nameplate MW alone does not define the service requirement. Saving a scenario does not change supported energization, confirmed capacity, or utility feasibility.</p>
        <div className="form-grid">
          {(
            [
              ["ultimateMw", "Ultimate MW"],
              ["initialMw", "Initial MW"],
              ["ramp", "Ramp schedule"],
              ["firmMw", "Firm MW"],
              ["flexibleMw", "Flexible MW"],
              ["loadFactor", "Expected load factor"],
              ["peakMw", "Peak load"],
              ["curtailment", "Curtailment capability"],
              ["curtailmentHours", "Maximum curtailment duration"],
              ["notice", "Notice requirement"],
              ["shifting", "Workload shifting"],
            ] as const
          ).map(([key, label]) => (
            <label className="field" key={key}>{label}
              <input
                value={draft[key] === "UNKNOWN" ? "" : draft[key]}
                placeholder="UNKNOWN"
                onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
              />
            </label>
          ))}
        </div>
        <button
          className="text-btn"
          onClick={() => {
            const next = { ...draft };
            (Object.keys(next) as (keyof typeof next)[]).forEach((key) => {
              if (!next[key].trim()) next[key] = "UNKNOWN";
            });
            setDraft(next);
            store.setCustomerEntity(project.id, entity.trim() || "UNKNOWN");
            store.updateLoad(project.id, next);
          }}
        >
          Save load envelope
        </button>
        <Field k="Reliability" v={`${project.load.reliability} · user supplied where stated`} />
      </section>
      <section>
        <h2>Service configuration</h2>
        <p className="quiet">Scenario, not an engineering determination. Exploring a configuration does not change energization, confirmed capacity, cost, or utility feasibility.</p>
        <div className="scenario-row">
          {SCENARIOS.map((scenario) => (
            <button key={scenario} className={project.scenario === scenario ? "active" : ""} onClick={() => store.setScenario(project.id, scenario)}>
              {scenario}
            </button>
          ))}
        </div>
        <p>Questions created: firm versus flexible split, curtailment rights, and whether generation is required.</p>
        <p className="quiet">Evidence required: a load profile, a utility process, and a site. None of those are created by selecting a scenario.</p>
      </section>
    </div>
  );
}

function Path({ project }: { project: PowerProject }) {
  const [open, setOpen] = useState(project.stages[4]?.id ?? "");
  const node = project.stages.find((item) => item.id === open) ?? project.stages[0];
  return (
    <div className="atlas-split">
      <div>
        <p className="mlabel">What we must learn before a power case is supportable</p>
        <ol className="stage-list">
          {answerChain(project).map((step) => (
            <li key={step.title}><span>{step.title}</span> <span className="mlabel">{step.status}</span></li>
          ))}
        </ol>
        <p className="mlabel">Preliminary process model</p>
        <p className="quiet">This process is a research hypothesis. Actual requirements vary by utility, region, configuration, connection voltage, and customer structure.</p>
        <p className="quiet">Processes may run in parallel, stall, or not apply. This is not a universal sequence.</p>
        <ol className="stage-list">
          {project.stages.map((stage) => (
            <li key={stage.id}>
              <button className={stage.id === open ? "active" : ""} onClick={() => setOpen(stage.id)}>
                <span>{stage.title}</span>
                <span className="mlabel">{stage.status}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      {node && (
        <dl className="detail-card">
          <Row k="Status" v={node.status} />
          <Row k="Owner" v={node.owner} />
          <Row k="Authority" v={node.authority} />
          <Row k="Counterparty" v={node.counterparty} />
          <Row k="Prerequisites" v={node.prerequisites} />
          <Row k="Next action" v={node.nextAction} />
          <Row k="Blocker" v={node.blocker} />
          <Row k="Capital at risk" v={node.capital} />
        </dl>
      )}
    </div>
  );
}

function Decisions({ project, onSection }: { project: PowerProject; onSection: (section: AtlasSection) => void }) {
  const decision = nextDecision(project);
  const [open, setOpen] = useState(decision.id);
  const item = project.decisions.find((entry) => entry.id === open) ?? project.decisions[0];
  const checks = packetChecks(project);
  return (
    <div className="atlas-split">
      <ol className="stage-list">
        {project.decisions.map((entry) => (
          <li key={entry.id}>
            <button className={entry.id === open ? "active" : ""} onClick={() => setOpen(entry.id)}>
              <span>{entry.title}</span>
              <span className="mlabel">{entry.id === decision.id ? decision.status : entry.status}</span>
            </button>
          </li>
        ))}
      </ol>
      {item && (
        <div className="detail-card">
          <h2>{item.title}</h2>
          <p>{item.why}</p>
          <Row k="Who owns it" v={item.owner} />
          <Row k="Who can approve it" v={item.authority} />
          <Row k="Counterparty" v={item.counterparty} />
          <Row k="Specific contact" v="UNKNOWN" />
          <Row k="What must be true first" v={item.prerequisites.join(" · ")} />
          <Row k="Evidence missing" v={item.missing.join(" · ")} />
          <Row k="What it unlocks" v={item.unlocks.join(" · ")} />
          {item.id === "utility" && (
            <div className="packet">
              <h3>Utility engagement packet</h3>
              <p className="quiet">Nothing is sent. Readiness is a list, not a score.</p>
              <Row k="Project" v={project.name} />
              <Row k="Request" v={`${project.mw} MW`} />
              <Row k="Target" v={project.target} />
              <Row k="Location" v={project.geography} />
              <Row k="Customer entity" v={checks.entity ? project.customerEntity : "UNKNOWN"} />
              <Row k="Load profile" v={checks.load ? "User supplied" : "MISSING"} />
              <Row k="Site control" v={checks.site ? "Note registered" : "UNKNOWN"} />
              <Row k="Attachments" v={String(project.evidence.length)} />
              <Row k="Readiness" v={blockingCount(project) === 0 ? "Ready to prepare" : "Not ready"} />
              <Row k="Blocking items" v={String(blockingCount(project))} />
              <div className="packet-actions">
                <button className="text-btn" onClick={() => onSection("requirement")}>Define load</button>
                <button className="text-btn" onClick={() => onSection("evidence")}>Register evidence</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Evidence({ project }: { project: PowerProject }) {
  const store = useProjects();
  const [title, setTitle] = useState("");
  const [type, setType] = useState(EVIDENCE_TYPES[0]);
  const [notes, setNotes] = useState("");
  function add() {
    if (!title.trim()) return;
    store.addEvidence(project.id, {
      title: title.trim(),
      type,
      source: "User-entered demo record",
      date: new Date().toISOString().slice(0, 10),
      counterparty: type.startsWith("Utility") || type === "Service request" ? project.utility : "UNKNOWN",
      status: "USER_SUPPLIED",
      notes: notes.trim() || "Registered in the evidence room. Not extracted.",
      supports: [type],
    });
    setTitle("");
    setNotes("");
  }
  const unsupported = project.claims.filter((claim) => claim.status === "UNKNOWN" || claim.status === "UNSUPPORTED");
  return (
    <div className="atlas-stack">
      <section>
        <h2>Register evidence</h2>
        <div className="form-grid">
          <label className="field">Title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label className="field">Type
            <select value={type} onChange={(event) => setType(event.target.value)}>
              {EVIDENCE_TYPES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="field">Notes<input value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        </div>
        <button className="text-btn" onClick={add}>Add evidence</button>
        <ul className="activity-list">
          {project.evidence.length === 0 && <li>No documents. Unknown claims stay unknown.</li>}
          {project.evidence.map((item) => (
            <li key={item.id}><span className="mlabel">{item.type} · {item.status}</span> {item.title}. {item.notes}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Claim ledger</h2>
        <table className="ledger">
          <tbody>
            {project.claims.map((claim) => (
              <tr key={claim.id}>
                <td>{claim.claim}</td>
                <td>{claim.value}</td>
                <td className={claim.status === "UNKNOWN" || claim.status === "UNSUPPORTED" ? "unknown" : ""}>{claim.status}</td>
                <td>{claim.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Project claims without evidence</h3>
        <ul className="activity-list">
          {unsupported.map((claim) => (
            <li key={claim.id}>{claim.claim}: {claim.notes}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Counterparties({ project }: { project: PowerProject }) {
  const seats = ["Day-to-day owner", "Internal champion", "Technical decision maker", "Economic buyer", "Budget owner", "Contract signer", "Approval authority", "Veto authority"];
  return (
    <div className="atlas-stack">
      <section>
        <h2>Seats</h2>
        {seats.map((seat) => <Row key={seat} k={seat} v="UNKNOWN" />)}
      </section>
      <section>
        <h2>Who controls what</h2>
        <table className="ledger">
          <tbody>
            {[
              ["Site selection", "Customer", "UNKNOWN"],
              ["Site control", "Customer or developer", "UNKNOWN"],
              ["Load definition", "Customer", "UNKNOWN"],
              ["Utility service approval", project.utility, "Not started"],
              ["Transmission study", "Utility or grid operator", "UNKNOWN"],
              ["Capital approval", "Customer or investor", "UNKNOWN"],
              ["Rate treatment", "Utility or regulator", "UNKNOWN"],
              ["Final contract", "Contracting parties", "UNKNOWN"],
            ].map(([decision, owner, status]) => (
              <tr key={decision}><td>{decision}</td><td>{owner}</td><td className={status === "UNKNOWN" ? "unknown" : ""}>{status}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      {project.counterparties.map((party) => (
        <section key={party.id}>
          <h2>{party.role}</h2>
          <Row k="Organization" v={party.organization} />
          <Row k="What they control" v={party.controls} />
          <Row k="What they need" v={party.needs} />
          <Row k="Current engagement" v={party.engagement} />
          <Row k="Open question" v={party.openQuestion} />
          <Row k="Next action" v={party.nextAction} />
        </section>
      ))}
    </div>
  );
}

function answerChain(project: PowerProject) {
  const checks = packetChecks(project);
  return [
    { title: "Power requirement", status: "PARTIAL" },
    { title: "Site / territory", status: "PARTIAL" },
    { title: "Load definition", status: checks.load ? "USER SUPPLIED" : "BLOCKED" },
    { title: "Utility engagement", status: checks.utility ? "EVIDENCE REGISTERED" : "NOT STARTED" },
    { title: "Feasibility / study", status: "UNKNOWN" },
    { title: "Infrastructure requirements", status: "UNKNOWN" },
    { title: "Service structure", status: "UNKNOWN" },
    { title: "Commercial structure", status: "UNKNOWN" },
    { title: "Supported power case", status: "NOT ESTABLISHED" },
  ];
}

function Commercial({ project }: { project: PowerProject }) {
  return (
    <div className="atlas-stack">
      <section>
        <h2>What would this project have to pay and commit to?</h2>
        <p className="quiet">Market context is not a customer rate. Total cost of the power case: insufficient evidence. No levelized price is shown.</p>
        <h2>Utility service terms</h2>
        <p className="quiet">Unsourced. A blank is unknown, not zero.</p>
        <table className="ledger">
          <tbody>
            {project.commercial.map((term) => (
              <tr key={term.field}><td>{term.field}</td><td className="unknown">{term.value}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2>Who pays if this does not materialize</h2>
        <p className="unknown">Unknown. No contract allocates this.</p>
      </section>
      <section>
        <h2>Risk allocation</h2>
        <table className="ledger">
          <thead>
            <tr><th>Risk</th><th>Customer</th><th>Utility</th><th>Developer</th><th>Others</th></tr>
          </thead>
          <tbody>
            {project.risks.map((row) => (
              <tr key={row.risk}>
                <td>{row.risk}</td>
                <td className="unknown">{row.customer}</td>
                <td className="unknown">{row.utility}</td>
                <td className="unknown">{row.developer}</td>
                <td className="unknown">{row.other}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Activity({ project }: { project: PowerProject }) {
  return (
    <ul className="activity-list">
      {project.activity.map((item) => (
        <li key={item.id}>
          <span className="mlabel">{item.at} · Demo · {item.status}</span>
          <strong>{item.label}</strong>
          <span>{item.detail}</span>
        </li>
      ))}
    </ul>
  );
}

function PowerCase({ project, onSection }: { project: PowerProject; onSection: (section: AtlasSection) => void }) {
  const checks = packetChecks(project);
  const decision = nextDecision(project);
  return (
    <div className="atlas-stack memo">
      <p className="mlabel">Power case · demo</p>
      <h2>Insufficient evidence for a supported power case</h2>
      <p>Can this be defended to an executive? Not yet. A target date is not an energization date.</p>
      <section>
        <h3>Power</h3>
        <Row k="Customer requirement" v={`${project.mw} MW · user supplied`} />
        <Row k="Utility-confirmed capacity" v="UNKNOWN" />
        <Row k="Supported energization" v="UNKNOWN" />
        <Row k="Connection voltage" v="UNKNOWN" />
        <Row k="Service structure" v="UNKNOWN" />
        <Row k="Grid region" v={`${project.rto} · public data`} />
        <Row k="Serving utility" v={`${project.utility} · public territory, not a service commitment`} />
      </section>
      <section>
        <h3>Economics</h3>
        <Row k="Customer electricity rate" v="UNKNOWN" />
        <Row k="Applicable tariff" v="UNKNOWN" />
        <Row k="Demand charges" v="UNKNOWN" />
        <Row k="Infrastructure contribution" v="UNKNOWN" />
        <Row k="Minimum commitment" v="UNKNOWN" />
        <Row k="Collateral" v="UNKNOWN" />
        <Row k="Exit exposure" v="UNKNOWN" />
      </section>
      <section>
        <h3>Project</h3>
        <Row k="Site" v={`${project.geography} candidate pathway · modeled sketch`} />
        <Row k="Site control" v={checks.site ? "Note registered · user supplied" : "UNKNOWN"} />
        <Row k="Load profile" v={project.evidence.some((item) => item.type === "Load profile") ? "Registered · user supplied" : "MISSING"} />
        <Row k="Firm / flexible" v={checks.load ? `${project.load.firmMw} firm / ${project.load.flexibleMw} flexible · user supplied` : "UNKNOWN"} />
        <Row k="Ramp" v={checks.load ? project.load.ramp : "UNKNOWN"} />
      </section>
      <section>
        <h3>Still open</h3>
        <ul className="activity-list">
          {[
            "Can this site serve the required load?",
            "When could service begin?",
            "What infrastructure would be required?",
            "What service structure would apply?",
            "What would the customer have to fund?",
            "What contractual commitments would apply?",
            "What could cause the project to fail or slip?",
          ].map((question) => <li key={question}>{question} · unknown</li>)}
        </ul>
        <p>Primary blocker: utility feasibility. Next decision: {decision.title}.</p>
        <button className="text-btn" onClick={() => onSection("decisions")}>Open the decision</button>
      </section>
      {checks.load && (
        <section>
          <h3>Questions created by the load scenario</h3>
          <p>Flexible or staged service may matter. Utility feasibility stays unknown. Supported energization stays unknown.</p>
        </section>
      )}
    </div>
  );
}

function Memo({ project }: { project: PowerProject }) {
  const decision = nextDecision(project);
  return (
    <article className="atlas-stack memo">
      <p className="mlabel">Power diligence memo · demo · printable</p>
      <h2>{project.name}</h2>
      <p>{project.mw} MW · {project.geography} · Target {project.target}</p>
      <h3>Power case status</h3>
      <p>Insufficient evidence for a supported power case. This memo does not recommend proceeding.</p>
      <Row k="Utility-confirmed MW" v="UNKNOWN" />
      <Row k="Supported energization" v="UNKNOWN" />
      <Row k="Service structure" v="UNKNOWN" />
      <Row k="Customer rate" v="UNKNOWN" />
      <Row k="Infrastructure contribution" v="UNKNOWN" />
      <Row k="Commercial commitment" v="UNKNOWN" />
      <Row k="Primary blocker" v="Utility feasibility" />
      <Row k="Next decision" v={decision.title} />
      <h3>Critical missing evidence</h3>
      <ul className="activity-list">
        <li>Load profile {project.evidence.some((item) => item.type === "Load profile") ? "· registered" : "· missing"}</li>
        <li>Ramp schedule {packetChecks(project).load ? "· user supplied" : "· missing"}</li>
        <li>Site control {packetChecks(project).site ? "· note registered" : "· missing"}</li>
        <li>Utility correspondence {packetChecks(project).utility ? "· registered" : "· missing"}</li>
        <li>Service structure · unknown</li>
      </ul>
      <button className="text-btn" onClick={() => window.print()}>Print</button>
    </article>
  );
}

function InterviewBar({ module, projectId }: { module: string; projectId: string }) {
  const store = useProjects();
  const [note, setNote] = useState("");
  const kinds = ["Wrong", "Missing", "Important", "Not important", "Would pay", "Already solved", "Follow up"];
  return (
    <div className="interview-bar">
      <span className="mlabel">Interview</span>
      {kinds.map((kind) => (
        <button key={kind} className="text-btn" onClick={() => store.addNote({ module, projectId, kind, role: "", companyType: "", note: note || kind })}>
          {kind}
        </button>
      ))}
      <input placeholder="Note" value={note} onChange={(event) => setNote(event.target.value)} />
    </div>
  );
}

function FounderNote({ module, projectId }: { module: string; projectId: string }) {
  const store = useProjects();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("This is wrong");
  const [role, setRole] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [note, setNote] = useState("");
  if (!open) return <button className="text-btn" onClick={() => setOpen(true)}>Founder note</button>;
  return (
    <form className="founder" onSubmit={(event) => {
      event.preventDefault();
      if (!note.trim()) return;
      store.addNote({ module, projectId, kind, role, companyType, note: note.trim() });
      setNote("");
      setOpen(false);
    }}>
      <select value={kind} onChange={(event) => setKind(event.target.value)}>
        {["This is wrong", "Missing workflow", "Wrong owner", "Wrong sequence", "Already solved", "Would use", "Would pay", "Needs a person", "Other"].map((item) => <option key={item}>{item}</option>)}
      </select>
      <input placeholder="Role" value={role} onChange={(event) => setRole(event.target.value)} />
      <input placeholder="Company type" value={companyType} onChange={(event) => setCompanyType(event.target.value)} />
      <textarea placeholder="Note" value={note} onChange={(event) => setNote(event.target.value)} />
      <button className="text-btn" type="submit">Record</button>
    </form>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return <div className="field-read"><span className="mlabel">{k}</span><span>{v}</span></div>;
}

function Row({ k, v }: { k: string; v: string }) {
  const unknown = v === "UNKNOWN" || v.includes("UNKNOWN") || v === "MISSING";
  return <div className="field-read"><span className="mlabel">{k}</span><span className={unknown ? "unknown" : ""}>{v}</span></div>;
}
