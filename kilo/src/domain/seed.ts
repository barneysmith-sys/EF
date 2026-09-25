import type { CommercialTerm, Counterparty, Decision, LoadEnvelope, PowerProject, RiskRow, StageNode } from "./types";

const UNKNOWN_LOAD: LoadEnvelope = {
  ultimateMw: "UNKNOWN",
  initialMw: "UNKNOWN",
  ramp: "UNKNOWN",
  loadFactor: "UNKNOWN",
  peakMw: "UNKNOWN",
  firmMw: "UNKNOWN",
  flexibleMw: "UNKNOWN",
  curtailment: "UNKNOWN",
  curtailmentHours: "UNKNOWN",
  notice: "UNKNOWN",
  shifting: "UNKNOWN",
  reliability: "UNKNOWN",
};

const COMMERCIAL: CommercialTerm[] = [
  "Minimum contract term",
  "Minimum billing demand",
  "Take-or-pay",
  "Upfront contribution",
  "Collateral",
  "Exit fee",
  "Network upgrade responsibility",
  "Construction contribution",
  "Generation obligation",
  "Rate structure",
  "Termination exposure",
].map((field) => ({ field, value: "UNKNOWN", status: "UNKNOWN" as const }));

const RISKS: RiskRow[] = [
  "Site diligence",
  "Utility studies",
  "Network upgrades",
  "Generation",
  "Equipment",
  "Construction",
  "Project delay",
  "Project abandonment",
].map((risk) => ({ risk, customer: "UNKNOWN", utility: "UNKNOWN", developer: "UNKNOWN", other: "UNKNOWN" }));

function stages(utility: string): StageNode[] {
  const titles = [
    ["requirement", "Power requirement"],
    ["credibility", "Customer credibility"],
    ["site", "Site control"],
    ["load", "Load definition"],
    ["utility", "Utility engagement"],
    ["study", "T&D study"],
    ["adequacy", "Resource adequacy"],
    ["supply", "Resource / supply plan"],
    ["service", "Service structure"],
    ["rate", "Commercial / rate structure"],
    ["permit", "Permitting"],
    ["infra", "Infrastructure"],
    ["equipment", "Long-lead equipment"],
    ["construction", "Construction"],
    ["testing", "Testing"],
    ["energization", "Energization"],
  ] as const;
  return titles.map(([id, title]) => ({
    id,
    title,
    status: id === "requirement" ? "IN PROGRESS" : "NOT STARTED",
    owner: "UNKNOWN",
    authority: id === "utility" || id === "study" ? utility : "UNKNOWN",
    counterparty: id === "utility" ? utility : "UNKNOWN",
    prerequisites: "Not established for this project.",
    nextAction: "UNKNOWN",
    blocker: id === "utility" ? "No project-specific utility assessment." : "UNKNOWN",
    capital: "UNKNOWN",
  }));
}

function decisions(utility: string): Decision[] {
  return [
    {
      id: "load",
      title: "Define load envelope",
      description: "State firm, flexible, and ramp before anyone can scope service.",
      status: "BLOCKED",
      owner: "UNKNOWN",
      authority: "Customer",
      counterparty: "Customer",
      why: "Without a load envelope, a utility cannot tell which process applies.",
      prerequisites: ["A named requirement"],
      missing: ["Load profile", "Firm and flexible split"],
      unlocks: ["Utility engagement packet", "Service structure questions"],
    },
    {
      id: "site",
      title: "Establish site control",
      description: "Show that the customer can put this load on a specific site.",
      status: "BLOCKED",
      owner: "UNKNOWN",
      authority: "Customer or developer",
      counterparty: "Landowner",
      why: "A geography is not a site.",
      prerequisites: ["Identified parcel or campus"],
      missing: ["Site-control document"],
      unlocks: ["A service address a utility can study"],
    },
    {
      id: "path",
      title: "Determine utility engagement path",
      description: "Learn which process, documents, and counterpart apply before anyone sends a request.",
      status: "UPCOMING",
      owner: "UNKNOWN",
      authority: utility,
      counterparty: "UNKNOWN",
      why: "No project-specific utility feasibility evidence exists.",
      prerequisites: ["A stated requirement"],
      missing: ["Utility process", "Required documents", "Named counterpart"],
      unlocks: ["A decision to initiate engagement"],
    },
    {
      id: "utility",
      title: "Initiate utility engagement",
      description: "Open the formal path with the serving utility.",
      status: "UPCOMING",
      owner: "UNKNOWN",
      authority: utility,
      counterparty: utility,
      why: "No project-specific utility feasibility evidence exists.",
      prerequisites: [
        "Confirm customer entity",
        "Define requested service",
        "Establish load profile",
        "Confirm site information",
        "Identify the utility engagement path",
      ],
      missing: ["Customer entity", "Load profile", "Site control"],
      unlocks: ["A study scope", "A counterpart at the utility"],
    },
    {
      id: "connection",
      title: "Determine connection structure",
      description: "Voltage, delivery point, and whether upgrades are required.",
      status: "BLOCKED",
      owner: "UNKNOWN",
      authority: utility,
      counterparty: utility,
      why: "Connection structure is an engineering outcome, not a map inference.",
      prerequisites: ["Utility engagement or equivalent engineering evidence"],
      missing: ["Study", "Connection voltage"],
      unlocks: ["Infrastructure definition", "Commercial structure"],
    },
    {
      id: "commercial",
      title: "Select commercial service structure",
      description: "Term, demand charges, contributions, and exit.",
      status: "BLOCKED",
      owner: "UNKNOWN",
      authority: "Contracting parties",
      counterparty: utility,
      why: "No tariff excerpt or term sheet is attached.",
      prerequisites: ["Service structure", "Credit posture"],
      missing: ["Tariff or agreement"],
      unlocks: ["A view of who pays if the load does not materialize"],
    },
  ];
}

function counterparties(utility: string, rto: string): Counterparty[] {
  return [
    {
      id: "customer",
      role: "Customer",
      organization: "Confidential AI infrastructure developer",
      controls: "Requirement, site choice, capital approval",
      needs: "A date someone will stand behind",
      engagement: "Requirement stated. Entity unknown.",
      openQuestion: "Who can sign?",
      nextAction: "Name the legal entity",
    },
    {
      id: "utility",
      role: "Utility",
      organization: utility,
      controls: "Service approval and the study",
      needs: "A defined load and a site",
      engagement: "Not started",
      openQuestion: "Which desk takes a load of this size?",
      nextAction: "Identify the engagement path",
    },
    {
      id: "rto",
      role: "RTO",
      organization: rto,
      controls: "Regional transmission process, where it applies",
      needs: "A utility-defined request",
      engagement: "Not started",
      openQuestion: "Does this load enter an RTO process at all?",
      nextAction: "UNKNOWN",
    },
    {
      id: "regulator",
      role: "Regulator",
      organization: "Relevant state regulatory authority",
      controls: "Rate treatment, if a filing is required",
      needs: "UNKNOWN",
      engagement: "Specific involvement UNKNOWN",
      openQuestion: "Is a regulatory filing on the path?",
      nextAction: "UNKNOWN",
    },
    {
      id: "infra",
      role: "Infrastructure developer",
      organization: "UNKNOWN",
      controls: "UNKNOWN",
      needs: "UNKNOWN",
      engagement: "UNKNOWN",
      openQuestion: "Is a developer on this project?",
      nextAction: "UNKNOWN",
    },
    {
      id: "generation",
      role: "Power / generation developer",
      organization: "UNKNOWN",
      controls: "UNKNOWN",
      needs: "UNKNOWN",
      engagement: "UNKNOWN",
      openQuestion: "Is paired generation required?",
      nextAction: "UNKNOWN",
    },
    {
      id: "epc",
      role: "EPC",
      organization: "UNKNOWN",
      controls: "Construction, if engaged",
      needs: "A defined scope",
      engagement: "UNKNOWN",
      openQuestion: "Who builds?",
      nextAction: "UNKNOWN",
    },
    {
      id: "capital",
      role: "Capital",
      organization: "UNKNOWN",
      controls: "Financing, if any",
      needs: "UNKNOWN",
      engagement: "UNKNOWN",
      openQuestion: "Who is exposed if the project stops?",
      nextAction: "UNKNOWN",
    },
  ];
}

export function seedProjects(): PowerProject[] {
  return [
    atlas(),
    thin("nova", "Project Nova", "1836", "75", "Ohio", "AEP Ohio", "PJM", "Q4 2028", "oh-licking"),
    thin("orion", "Project Orion", "1829", "200", "Texas", "Oncor Electric Delivery", "ERCOT", "Q3 2028", "tx-taylor"),
  ];
}

function atlas(): PowerProject {
  const project = thin("atlas", "Project Atlas", "1842", "100", "Virginia", "Dominion Energy Virginia", "PJM", "Q2 2029", "va-louisa");
  project.useCase = "AI / data center";
  project.reliability = "Mission critical";
  project.load.reliability = "Mission critical";
  project.load.ultimateMw = "100";
  project.claims = [
    claim("c-mw", "Atlas requires 100 MW", "100 MW", "USER_SUPPLIED", "Search requirement", "This project", "Stated requirement. Not metered load."),
    claim("c-date", "Target is Q2 2029", "Q2 2029", "USER_SUPPLIED", "Customer target", "This project", "A requested quarter, not an energization date."),
    claim("c-utility", "Dominion is the serving utility", "Dominion Energy Virginia", "PUBLIC_DATA", "Utility territory, public", "Louisa County sketch", "Territory is not a service commitment."),
    claim("c-modeled", "90 MW may be feasible", "90 MW", "MODELED", "Pathway sketch", "One modeled site", "Not utility-confirmed capacity."),
    claim("c-confirmed", "Utility-confirmed MW", "UNKNOWN", "UNKNOWN", "No study", "This site", "No project-specific utility feasibility evidence."),
    claim("c-q3", "Q3 2030 is an energization date", "Q3 2030", "UNSUPPORTED", "Pathway sketch", "This site", "The sketch mentions Q3 2030. Nothing supports it as a commitment."),
  ];
  project.activity = [
    act("a1", "2026-09-24", "Power requirement #1842 created", "100 MW / Virginia / Q2 2029", "USER_SUPPLIED"),
    act("a2", "2026-09-25", "Utility identified", "Dominion Energy Virginia", "PUBLIC_DATA"),
    act("a3", "2026-09-25", "Utility-confirmed capacity reviewed", "No supporting evidence. Status remains UNKNOWN.", "UNKNOWN"),
  ];
  return project;
}

function thin(
  id: string,
  name: string,
  requirementId: string,
  mw: string,
  geography: string,
  utility: string,
  rto: string,
  target: string,
  pathwayId: string,
): PowerProject {
  return {
    id,
    name,
    demo: true,
    requirementId,
    customer: "Confidential AI infrastructure developer",
    customerEntity: "UNKNOWN",
    geography,
    utility,
    rto,
    target,
    useCase: "Large load",
    reliability: "UNKNOWN",
    phase: "Pre-engagement",
    pathwayId,
    mw,
    supply: "UNKNOWN",
    load: { ...UNKNOWN_LOAD, ultimateMw: mw },
    claims: [
      claim(`c-${id}-mw`, `${name} requires ${mw} MW`, `${mw} MW`, "USER_SUPPLIED", "Demo requirement", geography, "Stated. Not confirmed."),
      claim(`c-${id}-date`, "Target date", target, "USER_SUPPLIED", "Customer target", geography, "Not an energization date."),
      claim(`c-${id}-cap`, "Utility-confirmed MW", "UNKNOWN", "UNKNOWN", "No study", geography, "No project-specific evidence."),
    ],
    decisions: decisions(utility),
    stages: stages(utility),
    counterparties: counterparties(utility, rto),
    commercial: COMMERCIAL.map((term) => ({ ...term })),
    risks: RISKS.map((row) => ({ ...row })),
    evidence: [],
    activity: [
      act(`a-${id}`, "2026-09-24", `${name} opened as a demo record`, `${mw} MW / ${geography} / ${target}`, "DEMO"),
    ],
    scenario: "100 MW firm",
  };
}

function claim(
  id: string,
  claimText: string,
  value: string,
  status: PowerProject["claims"][number]["status"],
  source: string,
  scope: string,
  notes: string,
): PowerProject["claims"][number] {
  return { id, claim: claimText, value, status, source, scope, notes, updatedAt: "2026-09-25" };
}

function act(
  id: string,
  at: string,
  label: string,
  detail: string,
  status: PowerProject["activity"][number]["status"],
): PowerProject["activity"][number] {
  return { id, at, label, detail, status, demo: true };
}

export const EVIDENCE_TYPES = [
  "Utility correspondence",
  "Service request",
  "Load profile",
  "Site control",
  "Tariff",
  "Engineering study",
  "Interconnection study",
  "Commercial agreement",
  "Financing evidence",
  "Permit",
  "Equipment commitment",
  "Other",
];

export const SCENARIOS = [
  "100 MW firm",
  "80 MW firm / 20 MW flexible",
  "Staged 40 → 70 → 100 MW",
  "Paired generation",
  "Behind-the-meter generation + storage",
];
