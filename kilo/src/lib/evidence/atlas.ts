import type { Evidence, ReadinessItem } from "./types";

/** One fictional project. Synthetic fields are marked DEMO. Nothing here is utility-confirmed. */

export const ATLAS_REQUIREMENT = {
  id: "1842",
  customer: "Confidential AI infrastructure developer",
  customerStatus: "DEMO" as const,
  mw: "100",
  firm: "UNKNOWN",
  flexible: "UNKNOWN",
  geography: "Virginia",
  target: "Q2 2029",
  loadType: "AI / data center",
  reliability: "Mission critical",
  term: "UNKNOWN",
  siteControl: "UNKNOWN",
  financing: "UNKNOWN",
  approval: "UNKNOWN",
  utilityEngagement: "Not started",
  technical: "Incomplete",
  credit: "UNKNOWN",
};

export const ATLAS_CLAIMS = {
  requirementMw: {
    value: "100",
    unit: "MW",
    evidenceStatus: "USER_SUPPLIED",
    sourceName: "Search requirement",
    geographicScope: "Virginia, as stated",
    notes: "The customer target entered in search. Not a metered load and not a utility allocation.",
  },
  modeledMw: {
    value: "90",
    unit: "MW",
    evidenceStatus: "MODELED",
    sourceName: "Kilo pathway sketch, Louisa County",
    geographicScope: "One modeled site, not the Dominion system",
    notes: "A sketch of what this pathway might describe. Not utility-confirmed capacity.",
  },
  targetDate: {
    value: "Q2 2029",
    evidenceStatus: "USER_SUPPLIED",
    sourceName: "Customer target",
    geographicScope: "This requirement",
    notes: "A requested date. Not an energization date.",
  },
  earliestDate: {
    value: "UNKNOWN",
    evidenceStatus: "UNKNOWN",
    sourceName: "No study",
    geographicScope: "This site",
    notes: "Insufficient evidence to estimate. The pathway sketch mentions Q3 2030. That is not a supported date.",
  },
  wholesale: {
    value: "See public evidence",
    unit: "$/MWh",
    evidenceStatus: "PUBLIC_DATA",
    sourceName: "PJM-RTO, when the dev server has a key",
    geographicScope: "PJM residual aggregate",
    notes: "Regional market context. Not a customer power quote.",
  },
} satisfies Record<string, Evidence>;

export const READINESS: { name: string; items: ReadinessItem[] }[] = [
  {
    name: "Customer credibility",
    items: [
      { label: "Named customer", mark: "missing" },
      { label: "Credit", mark: "missing" },
      { label: "Corporate approval", mark: "missing" },
    ],
  },
  {
    name: "Site readiness",
    items: [
      { label: "Site control", mark: "blocking" },
      { label: "Zoning", mark: "missing" },
    ],
  },
  {
    name: "Technical definition",
    items: [
      { label: "Firm versus flexible split", mark: "missing" },
      { label: "Load ramp", mark: "missing" },
    ],
  },
  {
    name: "Utility engagement",
    items: [
      { label: "Formal engagement", mark: "blocking" },
      { label: "Study scope", mark: "missing" },
    ],
  },
  {
    name: "Commercial readiness",
    items: [
      { label: "Contract structure", mark: "missing" },
      { label: "Who pays if the load slips", mark: "missing" },
    ],
  },
  {
    name: "Infrastructure readiness",
    items: [
      { label: "Required upgrades", mark: "blocking" },
      { label: "Long-lead equipment", mark: "missing" },
    ],
  },
];

export const MUST_BECOME_TRUE = [
  "Customer executes site control",
  "Utility confirms the study scope",
  "Load ramp is validated",
  "A service study is initiated",
  "Required upgrades are identified",
  "A commercial structure is approved",
  "Long-lead equipment is secured",
  "Construction is complete",
  "Energization is authorized",
];

export const CONTROL = [
  { decision: "Site selection", who: "Customer", status: "UNKNOWN" },
  { decision: "Site control", who: "Customer or a developer", status: "UNKNOWN" },
  { decision: "Utility service approval", who: "Dominion Energy Virginia", status: "Not started" },
  { decision: "Transmission study", who: "Dominion, PJM, or both", status: "UNKNOWN" },
  { decision: "Generation or storage", who: "A developer, if required", status: "UNKNOWN" },
  { decision: "Capital approval", who: "Customer or an investor", status: "UNKNOWN" },
  { decision: "Rate treatment", who: "Utility or a regulator", status: "UNKNOWN" },
  { decision: "Final contracts", who: "The contracting parties", status: "UNKNOWN" },
];

export const COMMERCIAL = [
  { field: "Minimum term", value: "UNKNOWN" },
  { field: "Minimum billing demand", value: "UNKNOWN" },
  { field: "Take-or-pay", value: "UNKNOWN" },
  { field: "Upfront contribution", value: "UNKNOWN" },
  { field: "Collateral", value: "UNKNOWN" },
  { field: "Exit fee", value: "UNKNOWN" },
  { field: "Who pays if the project does not materialize", value: "UNKNOWN" },
];

export const EVIDENCE_ROOM = [
  { type: "Utility correspondence", status: "Missing" },
  { type: "Service request", status: "Missing" },
  { type: "Tariff excerpt", status: "Not attached" },
  { type: "Site-control document", status: "Missing" },
  { type: "Load profile", status: "Missing" },
  { type: "Engineering study", status: "Missing" },
];

export const BOTTLENECK = {
  target: "Q2 2029",
  earliest: "UNKNOWN",
  bottleneck: "Utility feasibility",
  owner: "Utility",
  next: "Identify who at Dominion would take a formal request",
  unblock: "UNKNOWN",
  capital: "UNKNOWN",
};
