export type StatusMark = "ok" | "warn" | "risk" | "pending";

export interface ChecklistItem {
  label: string;
  status: StatusMark;
  note: string;
}

export interface PathwayMix {
  grid: number;
  generation: number;
  storage: number;
}

export interface StageAction {
  text: string;
  status: StatusMark;
}

export interface Stage {
  key: string;
  name: string;
  /** Short descriptor shown under the node in the flow diagram. */
  subtitle: string;
  owner: string;
  window: string;
  durationMonths: number;
  status: StatusMark;
  actions: StageAction[];
  metric: { label: string; value: string };
}

export interface EvidenceDoc {
  id: string;
  title: string;
  kind: "Queue data" | "Study" | "Tariff" | "GIS" | "Survey" | "Filing" | "Market data" | "Correspondence";
  source: string;
  dated: string;
  /** Which estimate this evidence supports. */
  supports: string;
  weight: number;
  excerpt: string;
  freshness: "current" | "aging" | "stale";
}

export interface RiskItem {
  title: string;
  severity: "High" | "Medium" | "Low";
  likelihood: number;
  impact: string;
  mitigation: string;
  delayMonths: number;
}

export interface CostLine {
  label: string;
  value: string;
  detail: string;
  kind: "energy" | "capex" | "charge";
}

export interface TimelinePhase {
  name: string;
  startQ: number;
  endQ: number;
  track: "Regulatory" | "Physical" | "Commercial" | "Equipment";
  status: StatusMark;
}

export interface Section {
  key: string;
  title: string;
  headline: string;
  confidence: number;
  rows: { label: string; value: string; note?: string; status?: StatusMark }[];
  body: string;
  evidenceIds: string[];
}

export interface Pathway {
  id: string;
  rank: number;
  state: string;
  stateCode: string;
  locality: string;
  coords: [number, number];
  /** Nearby substation node, drawn as the transmission tie on the map. */
  tieCoords: [number, number];
  utility: string;
  market: string;
  marketZone: string;
  deliverableMw: number;
  energization: string;
  energizationQ: number;
  priceLow: number;
  priceHigh: number;
  transmissionDistanceMi: number;
  transmissionVoltage: string;
  generationAvailability: string;
  generationMw: number;
  storageAvailability: string;
  storageMw: number;
  storageMwh: number;
  land: string;
  landAcres: number;
  fiber: string;
  fiberCarriers: number;
  reliability: string;
  reliabilityTier: "Standard" | "High" | "Mission Critical";
  majorConstraint: string;
  confidence: number;
  carbonIntensity: number;
  carbonNote: string;
  mix: PathwayMix;
  checklist: ChecklistItem[];
  summary: string;
  stages: Stage[];
  sections: Section[];
  evidence: EvidenceDoc[];
  risks: RiskItem[];
  costs: CostLine[];
  allInLow: number;
  allInHigh: number;
  capexPerKw: number;
  timeline: TimelinePhase[];
  /** Quarters of headroom vs. the searched requirement date. */
  scheduleNote: string;
}
