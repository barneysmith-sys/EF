import { useState } from "react";
import { track } from "../lib/analytics";

const HYPOTHESIS =
  "Data-center power teams cannot name an executable energization date before they commit site capital.";

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
          <p className="ws-lead">{HYPOTHESIS}</p>
          <p className="ws-lead">Confidence: UNTESTED. Sample size {n}.</p>
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
