import { useState } from "react";
import { RESEARCH_PROMPTS } from "../data/discovery";
import { useDiscovery } from "./DiscoveryContext";

export default function ResearchPanel({ screen }: { screen: string }) {
  const { research, notes, setNote } = useDiscovery();
  const [open, setOpen] = useState(true);
  if (!research) return null;

  const prompt = RESEARCH_PROMPTS[screen] ?? RESEARCH_PROMPTS.search;
  const note = notes[screen] ?? { learned: "", confidence: "Untested" };

  return (
    <aside className={`research${open ? " open" : ""}`}>
      <button className="research-bar" onClick={() => setOpen((v) => !v)}>
        <span className="mlabel">Research mode</span>
        <span>{prompt.assumption}</span>
        <span className="mono">{open ? "HIDE" : "OPEN"}</span>
      </button>
      {open && (
        <div className="research-body">
          <div>
            <div className="mlabel">Assumption being tested</div>
            <p>{prompt.assumption}</p>
          </div>
          <div>
            <div className="mlabel">Who I need to ask</div>
            <p>{prompt.validateWith}</p>
          </div>
          <div>
            <div className="mlabel">What would prove this wrong</div>
            <p>{prompt.disprove}</p>
          </div>
          <label>
            <span className="mlabel">What I learned</span>
            <textarea
              value={note.learned}
              placeholder="Unknown until a conversation happens."
              onChange={(e) => setNote(screen, { ...note, learned: e.target.value })}
            />
          </label>
          <label>
            <span className="mlabel">Confidence in assumption</span>
            <select
              value={note.confidence}
              onChange={(e) => setNote(screen, { ...note, confidence: e.target.value })}
            >
              {["Untested", "Low", "Medium", "High", "Disproved"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      )}
    </aside>
  );
}
