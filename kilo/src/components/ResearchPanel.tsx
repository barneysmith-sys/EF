import { useState } from "react";
import { useDiscovery } from "./DiscoveryContext";

const EMPTY = { findings: "", assumptions: "", willingness: "" };

export default function ResearchPanel({ screen }: { screen: string }) {
  const { research, notes, setNote } = useDiscovery();
  const [open, setOpen] = useState(false);
  if (!research) return null;

  const note = notes[screen] ?? EMPTY;

  return (
    <aside className={`research${open ? " open" : ""}`}>
      <button className="research-bar" onClick={() => setOpen((value) => !value)}>
        <span className="mlabel">Research notes</span>
        <span>Interview findings stay off the customer view until this is opened.</span>
        <span className="mono">{open ? "HIDE" : "OPEN"}</span>
      </button>
      {open && (
        <div className="research-body">
          <p className="research-hypothesis">
            Unverified hypothesis: several parties share authority over energizing a large load, and it is not yet known who would pay to coordinate them.
          </p>
          <label>
            <span className="mlabel">Interview findings</span>
            <textarea
              value={note.findings}
              placeholder="Who said what. Leave blank until a conversation happens."
              onChange={(event) => setNote(screen, { ...note, findings: event.target.value })}
            />
          </label>
          <label>
            <span className="mlabel">Unverified assumptions</span>
            <textarea
              value={note.assumptions}
              placeholder="What this screen is assuming, and what would prove it wrong."
              onChange={(event) => setNote(screen, { ...note, assumptions: event.target.value })}
            />
          </label>
          <label>
            <span className="mlabel">Willingness to pay</span>
            <textarea
              value={note.willingness}
              placeholder="Who felt the pain, and whether they would pay. UNKNOWN is a valid note."
              onChange={(event) => setNote(screen, { ...note, willingness: event.target.value })}
            />
          </label>
        </div>
      )}
    </aside>
  );
}
