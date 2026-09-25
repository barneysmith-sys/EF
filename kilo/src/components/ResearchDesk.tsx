import { useState } from "react";
import { track } from "../lib/analytics";
import { useProjects } from "../domain/store";

const HYPOTHESES = [
  "H1. Power-development teams struggle to produce a defensible power case before site capital is committed. UNTESTED.",
  "H2. The person who builds the power case may not be the economic buyer. UNTESTED.",
  "H3. Utility engagement and project-specific evidence are a bottleneck for a credible date. UNTESTED.",
  "H4. Teams use spreadsheets, email, consultants, and documents. UNTESTED.",
  "H5. The value may be better capital decisions, not public grid data. UNTESTED.",
  "H6. Utilities may have a mirror problem judging whether a large load is credible. UNTESTED.",
  "H7. Power economics may be hard enough that teams already pay someone to model them. UNTESTED.",
];

interface Interview {
  role: string;
  organization: string;
  pain: string;
  buyer: string;
  signer: string;
  delay: string;
  workaround: string;
}

const EMPTY: Interview = {
  role: "",
  organization: "",
  pain: "",
  buyer: "",
  signer: "",
  delay: "",
  workaround: "",
};

export default function ResearchDesk({ onBack }: { onBack: () => void }) {
  const { notes } = useProjects();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [draft, setDraft] = useState<Interview>(EMPTY);
  const n = interviews.length;

  function add() {
    if (!draft.pain.trim()) return;
    setInterviews((list) => [...list, draft]);
    setDraft(EMPTY);
    track("research hypothesis updated");
  }

  return (
    <div className="pageview">
      <div className="subbar">
        <div className="subbar-title">Research</div>
        <div className="subbar-sub">Internal. Not in public navigation.</div>
        <div className="subbar-spacer" />
        <button className="research-toggle" onClick={onBack}>Back</button>
      </div>
      <div className="page">
        <div className="page-inner research-desk">
          <ul className="must">
            {HYPOTHESES.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="ws-lead">Interviews {n}. Observations {notes.length}. Supported hypotheses 0. Contradicted hypotheses 0. Notes are not conclusions.</p>
          {notes.length > 0 && (
            <ul className="must">
              {notes.map((item) => (
                <li key={item.id}>{item.kind} · {item.module} · {item.note}</li>
              ))}
            </ul>
          )}
          <section className="ws-block">
            <div className="mlabel">What we believe now</div>
            {n === 0 ? (
              <p>No belief has supporting evidence. Aggregations stay blank until interviews exist.</p>
            ) : (
              <ul className="must">
                <li>Reported pain · {count(interviews, "pain")} / {n} interviews</li>
                <li>Named buyer · {count(interviews, "buyer")} / {n} interviews</li>
                <li>Named contract signer · {count(interviews, "signer")} / {n} interviews</li>
              </ul>
            )}
          </section>
          <section className="ws-block">
            <div className="mlabel">Interview log</div>
            {(["role", "organization", "pain", "buyer", "signer", "delay", "workaround"] as const).map((key) => (
              <label key={key} className="research-field">
                <span className="mlabel">{key}</span>
                <input value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
              </label>
            ))}
            <button className="research-toggle" onClick={add}>Add interview</button>
            <ul className="must">
              {interviews.map((item, index) => (
                <li key={index}>{item.role || "Unspecified role"} · {item.organization || "Unknown org"} · {item.pain}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function count(list: Interview[], key: "pain" | "buyer" | "signer") {
  return list.filter((item) => item[key].trim().length > 0).length;
}
