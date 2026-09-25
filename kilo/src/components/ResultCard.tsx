import { ConfidenceMeter, MixBar, StatusMarkIcon } from "./ui";
import type { ScoredPathway } from "../lib/search";
import { getDiscovery } from "../data/discovery";
import { EvidenceBadge } from "./evidence/EvidenceBadge";
import { ATLAS_CLAIMS } from "../lib/evidence/atlas";
import { PERSPECTIVES, useDiscovery } from "./DiscoveryContext";

interface Props {
  scored: ScoredPathway;
  selected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

export default function ResultCard({ scored, selected, onHover, onSelect, onOpen }: Props) {
  const { pathway: p, rank, fit, meetsDate, meetsMw, quartersLate, mwShortfall } = scored;
  const discovery = getDiscovery(p.id);
  const { perspective } = useDiscovery();
  const view = PERSPECTIVES.find((item) => item.id === perspective) ?? PERSPECTIVES[0];
  const lead =
    perspective === "utility"
      ? discovery?.grid.find((f) => f.label.startsWith("Studies"))
      : perspective === "developer"
        ? discovery?.demand[0]
        : discovery?.demand.find((f) => f.label === "Load");

  return (
    <article
      className={`rcard${selected ? " selected" : ""}`}
      onMouseEnter={() => onHover(p.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(p.id)}
    >
      <header className="rcard-head">
        <span className="rcard-rank num">{String(rank).padStart(2, "0")}</span>
        <div className="rcard-title">
          <h3 className="rcard-state">{p.state}</h3>
          <div className="rcard-locality">{p.locality}</div>
        </div>
        <div className="rcard-fit">
          <div className="mlabel">Match</div>
          <div className="rcard-fit-val num">{fit}</div>
        </div>
      </header>

      <div className="rcard-utility">
        <span className="tag info">{p.market}</span>
        <span className="rcard-util-name">{p.utility}</span>
        <span className="rcard-util-zone mono">{p.marketZone}</span>
      </div>

      {/* The four numbers a buyer actually decides on */}
      <div className="rcard-headline">
        <div className="rh-item">
          <div className="mlabel">Modeled deliverable <EvidenceBadge claim={p.id === "va-louisa" ? ATLAS_CLAIMS.modeledMw : { ...ATLAS_CLAIMS.modeledMw, value: String(p.deliverableMw), geographicScope: p.state, notes: "Pathway sketch. Not utility-confirmed capacity." }} /></div>
          <div className={`rh-val num${meetsMw ? "" : " warn"}`}>
            {p.deliverableMw}
            <span className="rh-unit">MW</span>
          </div>
          {!meetsMw && <div className="rh-note warn num">{mwShortfall} MW short</div>}
        </div>
        <div className="rh-div" />
        <div className="rh-item">
          <div className="mlabel">Energization</div>
          <div className={`rh-val num${meetsDate ? "" : " warn"}`}>{p.energization}</div>
          <div className={`rh-note num${meetsDate ? " ok" : " warn"}`}>
            {meetsDate ? "On or before requirement" : `${quartersLate} qtr${quartersLate > 1 ? "s" : ""} late`}
          </div>
        </div>
        <div className="rh-div" />
        <div className="rh-item">
          <div className="mlabel">Indicative</div>
          <div className="rh-val num">
            ${p.priceLow}–{p.priceHigh}
            <span className="rh-unit">/MWh</span>
          </div>
          <div className="rh-note num">{p.carbonIntensity} kg CO₂/MWh</div>
        </div>
        <div className="rh-div" />
        <div className="rh-item">
          <div className="mlabel">Confidence</div>
          <div className="rh-conf">
            <ConfidenceMeter value={p.confidence} width={58} />
          </div>
          <div className="rh-note">{p.reliabilityTier}</div>
        </div>
      </div>

      {/* Power pathway composition */}
      <div className="rcard-mix">
        <div className="mlabel">Power pathway</div>
        <MixBar grid={p.mix.grid} generation={p.mix.generation} storage={p.mix.storage} showLegend />
      </div>

      {/* Supporting attributes */}
      <div className="rcard-grid">
        <Attr label="Transmission" value={`${p.transmissionDistanceMi} mi`} note={p.transmissionVoltage} />
        <Attr label="Generation" value={`${p.generationMw} MW`} note={p.generationAvailability} />
        <Attr label="Storage" value={`${p.storageMw} MW`} note={`${p.storageMwh} MWh`} />
        <Attr label="Land" value={`${p.landAcres} ac`} note={p.land.split(",").slice(1).join(",").trim() || "Contiguous"} />
        <Attr label="Fiber" value={`${p.fiberCarriers} carriers`} note={p.fiber} />
        <Attr label="Reliability" value={p.reliabilityTier} note={p.reliability} />
      </div>

      {/* Status checklist */}
      <div className="rcard-status">
        {p.checklist.map((c) => (
          <StatusMarkIcon key={c.label} status={c.status} label={c.label} />
        ))}
      </div>

      <div className="rcard-constraint">
        <span className="mlabel">Major constraint</span>
        <span className="rcard-constraint-text">{p.majorConstraint}</span>
      </div>

      {discovery && (
        <>
          <div className="rcard-next">
            <span className="mlabel">Next decision</span>
            <span>{discovery.nextDecision}</span>
          </div>
          <div className="rcard-certs">
            <span className="cert cert-estimated">Modeled, not available</span>
            {lead && <span className={`cert cert-${lead.certainty.toLowerCase().replace(/\s+/g, "-")}`}>{view.label}: {lead.certainty}</span>}
          </div>
        </>
      )}

      <footer className="rcard-foot">
        <span className="rcard-schedule num">{p.scheduleNote}</span>
        <button
          className="rcard-open"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(p.id);
          }}
        >
          View power pathway →
        </button>
      </footer>
    </article>
  );
}

function Attr({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="attr">
      <div className="attr-label">{label}</div>
      <div className="attr-value num">{value}</div>
      <div className="attr-note" title={note}>
        {note}
      </div>
    </div>
  );
}
