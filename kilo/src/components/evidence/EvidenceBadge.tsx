import { useState } from "react";
import type { Evidence } from "../../lib/evidence/types";
import { track } from "../../lib/analytics";

export function EvidenceBadge({ claim }: { claim: Evidence }) {
  const [open, setOpen] = useState(false);
  const label = claim.evidenceStatus.replaceAll("_", " ");
  return (
    <span className="ebadge-wrap">
      <button
        type="button"
        className={`ebadge ebadge-${claim.evidenceStatus.toLowerCase()}`}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
          track(claim.evidenceStatus === "UNKNOWN" ? "unknown clicked" : "evidence opened", claim.sourceName);
        }}
      >
        {label}
      </button>
      {open && (
        <span className="epop" onClick={(event) => event.stopPropagation()}>
          <strong>
            {claim.value}
            {claim.unit ? ` ${claim.unit}` : ""}
          </strong>
          <span>{claim.notes}</span>
          <span className="epop-src">
            {claim.sourceName}
            {claim.geographicScope ? ` · ${claim.geographicScope}` : ""}
          </span>
        </span>
      )}
    </span>
  );
}

export function UnknownState({ label }: { label: string }) {
  return <span className="unknown-state">{label}</span>;
}
