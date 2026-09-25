export type EvidenceStatus =
  | "VERIFIED"
  | "PUBLIC_DATA"
  | "REPORTED"
  | "USER_SUPPLIED"
  | "MODELED"
  | "INFERRED"
  | "UNKNOWN"
  | "UNSUPPORTED";

export type StageStatus =
  | "NOT STARTED"
  | "IN PROGRESS"
  | "WAITING"
  | "BLOCKED"
  | "COMPLETE"
  | "UNKNOWN"
  | "NOT APPLICABLE";

export type DecisionStatus = "UPCOMING" | "READY" | "BLOCKED" | "DECIDED" | "SUPERSEDED";

export type BlockerKind = "BLOCKING" | "MISSING" | "UNKNOWN";

export interface LoadEnvelope {
  ultimateMw: string;
  initialMw: string;
  ramp: string;
  loadFactor: string;
  peakMw: string;
  firmMw: string;
  flexibleMw: string;
  curtailment: string;
  curtailmentHours: string;
  notice: string;
  shifting: string;
  reliability: string;
}

export interface Claim {
  id: string;
  claim: string;
  value: string;
  status: EvidenceStatus;
  source: string;
  scope: string;
  notes: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  status: DecisionStatus;
  owner: string;
  authority: string;
  counterparty: string;
  why: string;
  prerequisites: string[];
  missing: string[];
  unlocks: string[];
}

export interface StageNode {
  id: string;
  title: string;
  status: StageStatus;
  owner: string;
  authority: string;
  counterparty: string;
  prerequisites: string;
  nextAction: string;
  blocker: string;
  capital: string;
}

export interface Counterparty {
  id: string;
  role: string;
  organization: string;
  controls: string;
  needs: string;
  engagement: string;
  openQuestion: string;
  nextAction: string;
}

export interface CommercialTerm {
  field: string;
  value: string;
  status: EvidenceStatus;
}

export interface RiskRow {
  risk: string;
  customer: string;
  utility: string;
  developer: string;
  other: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  type: string;
  source: string;
  date: string;
  counterparty: string;
  status: EvidenceStatus;
  notes: string;
  supports: string[];
}

export interface ActivityItem {
  id: string;
  at: string;
  label: string;
  detail: string;
  status: EvidenceStatus | "DEMO";
  demo: boolean;
}

export interface PowerProject {
  id: string;
  name: string;
  demo: true;
  requirementId: string;
  customer: string;
  customerEntity: string;
  geography: string;
  utility: string;
  rto: string;
  target: string;
  useCase: string;
  reliability: string;
  phase: string;
  pathwayId: string;
  mw: string;
  supply: string;
  load: LoadEnvelope;
  claims: Claim[];
  decisions: Decision[];
  stages: StageNode[];
  counterparties: Counterparty[];
  commercial: CommercialTerm[];
  risks: RiskRow[];
  evidence: EvidenceItem[];
  activity: ActivityItem[];
  scenario: string;
}

export type AtlasSection =
  | "overview"
  | "case"
  | "requirement"
  | "path"
  | "decisions"
  | "evidence"
  | "counterparties"
  | "commercial"
  | "memo"
  | "activity";

export interface FounderNote {
  id: string;
  at: string;
  module: string;
  projectId: string;
  kind: string;
  role: string;
  companyType: string;
  note: string;
}
