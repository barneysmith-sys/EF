import type { StatusMark } from "./types";

/** How sure the prototype is. Unknown is a valid and useful answer. */
export type Certainty = "Known" | "Estimated" | "Unknown" | "Requires verification";

export interface Fact {
  label: string;
  value: string;
  certainty: Certainty;
}

export interface LifecycleStage {
  label: string;
  owner: string;
  decisionMaker: string;
  evidence: string;
  capitalAtRisk: string;
  status: string;
  blocker: string;
  next: string;
}

export interface Actor {
  role: string;
  wants: string;
  controls: string;
  doesNot: string;
  risk: string;
  pays: string;
  decision: string;
  status: string;
}

export interface Seat {
  seat: string;
  who: string;
}

export interface DecisionNode {
  decision: string;
  actor: string;
  depends: string;
  money: string;
  evidence: string;
  time: string;
  status: StatusMark | "unknown";
}

export interface ReadinessItem {
  label: string;
  state: string;
  evidence: string;
}

export interface Discovery {
  projectName: string;
  nextDecision: string;
  demand: Fact[];
  grid: Fact[];
  supply: Fact[];
  lifecycle: LifecycleStage[];
  actors: Actor[];
  seats: Seat[];
  decisions: DecisionNode[];
  readiness: ReadinessItem[];
  ramp: { when: string; mw: string }[];
  firmMw: string;
  flexMw: string;
  term: string;
  siteControl: string;
  credit: string;
  utilityEngagement: string;
}

const UNKNOWN = "Unknown";

function seats(partial: Partial<Record<Seat["seat"], string>>): Seat[] {
  const names = [
    "Day-to-day problem owner",
    "Internal champion",
    "Economic buyer",
    "Technical decision maker",
    "Budget owner",
    "Contract signer",
    "Grid authority",
  ];
  return names.map((seat) => ({ seat, who: partial[seat] ?? UNKNOWN }));
}

const PA: Discovery = {
  projectName: "Project Atlas",
  nextDecision: "Whether PPL will open a load study before a transformer slot is reserved",
  demand: [
    { label: "Who needs the power", value: "Unnamed data-center developer, represented in this demo as Project Atlas", certainty: "Requires verification" },
    { label: "Load", value: "120 MW requested · 120 MW modeled as deliverable", certainty: "Estimated" },
    { label: "Site control", value: "310 acres described as under option through Q3 2027", certainty: "Requires verification" },
    { label: "Financing", value: UNKNOWN, certainty: "Unknown" },
    { label: "Load ramp", value: "Modeled, not a customer schedule", certainty: "Estimated" },
    { label: "Firm vs flexible", value: "80 MW firm / 40 MW flexible — an assumption, not a signed profile", certainty: "Estimated" },
  ],
  grid: [
    { label: "Utility", value: "PPL Electric Utilities", certainty: "Known" },
    { label: "ISO/RTO", value: "PJM, PPL / MAAC zone", certainty: "Known" },
    { label: "Studies", value: "Which study this load would actually enter is not confirmed", certainty: "Unknown" },
    { label: "Upgrades", value: "Transformer lead time is the modeled constraint. Network upgrades are not", certainty: "Estimated" },
    { label: "Authority to say yes", value: "Who at PPL or PJM can commit a date", certainty: "Unknown" },
  ],
  supply: [
    { label: "Existing generation", value: "30 MW modeled as an adjacent nuclear PPA. No contract is in hand", certainty: "Estimated" },
    { label: "New generation", value: "Whether any new generation is required", certainty: "Unknown" },
    { label: "Storage", value: "20 MW / 80 MWh modeled. No developer identified", certainty: "Estimated" },
    { label: "Who builds it", value: UNKNOWN, certainty: "Unknown" },
    { label: "Land and equipment", value: "Parcel and a 128-week transformer quote are modeled", certainty: "Requires verification" },
  ],
  lifecycle: [
    { label: "Requirement", owner: "Customer", decisionMaker: UNKNOWN, evidence: "A written MW, date and ramp", capitalAtRisk: "Internal staff time", status: "Drafted in this demo", blocker: "No named customer", next: "Put a real load owner on the requirement" },
    { label: "Site", owner: "Site developer", decisionMaker: UNKNOWN, evidence: "Option, title, zoning", capitalAtRisk: "Option payment — amount unknown", status: "Described as optioned", blocker: "Option not in the evidence set", next: "Confirm the option is real and assignable" },
    { label: "Utility engagement", owner: "Customer, then utility", decisionMaker: "Unknown at PPL", evidence: "A utility meeting note or study request", capitalAtRisk: "Study deposits — unknown", status: "Not started", blocker: "No engagement on record", next: "Identify the PPL key-account owner" },
    { label: "Power pathway", owner: UNKNOWN, decisionMaker: UNKNOWN, evidence: "A sourced mix of grid, generation and storage", capitalAtRisk: UNKNOWN, status: "Preliminary model", blocker: "Mix is not a commercial structure", next: "Separate what is grid service from what must be built" },
    { label: "Studies", owner: "Utility / PJM", decisionMaker: "PJM and PPL — roles not separated yet", evidence: "Study scope and queue position", capitalAtRisk: "Study fees, unknown", status: "Pending", blocker: "Nothing filed", next: "Learn which process this load would enter" },
    { label: "Commercial structure", owner: UNKNOWN, decisionMaker: UNKNOWN, evidence: "Term sheet: who sells, who buys, who builds", capitalAtRisk: UNKNOWN, status: "Unknown", blocker: "No structure chosen", next: "Ask who would sign, and for what" },
    { label: "Infrastructure", owner: UNKNOWN, decisionMaker: UNKNOWN, evidence: "Equipment slot, construction party", capitalAtRisk: "Transformer deposit — not held", status: "Quoted, not committed", blocker: "128-week transformer, no slot", next: "Find who would pay to hold the slot" },
    { label: "Contracted", owner: UNKNOWN, decisionMaker: UNKNOWN, evidence: "Executed agreements", capitalAtRisk: UNKNOWN, status: "Not started", blocker: "No counterparty", next: "Do not treat a model as a contract" },
    { label: "Energized", owner: "Utility", decisionMaker: UNKNOWN, evidence: "Permission to energize", capitalAtRisk: "Full project — unknown", status: "Target Q2 2029, modeled", blocker: "Every prior stage", next: "Treat the date as a hypothesis" },
  ],
  actors: [
    { role: "Power customer", wants: "120 MW energized on a date they can underwrite", controls: "The requirement, if they exist", doesNot: "Whether the grid can serve it", risk: "Site and schedule risk — unquantified", pays: UNKNOWN, decision: "Whether to keep this site", status: "Not named" },
    { role: "Utility", wants: "A load that will actually show up and pay", controls: "Distribution and the local study, subject to tariff", doesNot: "PJM market outcomes", risk: "Stranded upgrades if the load slips", pays: "Study work, recovered or not — unknown", decision: "Whether to open a study", status: "Not engaged" },
    { role: "ISO/RTO", wants: "A reliable system", controls: "Wholesale market rules and regional transmission planning", doesNot: "The retail relationship with the customer", risk: "System, not project, risk", pays: "Socialized where the tariff says so", decision: "Whether this load is a regional transmission problem", status: "Unknown" },
    { role: "Power developer", wants: "A credible offtaker", controls: "Generation and storage they choose to build", doesNot: "The interconnection date", risk: "Development capital", pays: "Development spend", decision: "Whether this load is real enough to spend on", status: "No developer attached" },
    { role: "Site developer", wants: "A tenant or a sale", controls: "The land, if the option is real", doesNot: "Power delivery", risk: "Land basis", pays: "Carry on the land", decision: "How long to hold the option", status: "Unverified" },
    { role: "Generation owner", wants: "A long contract", controls: "Existing plant output", doesNot: "Delivery to this site", risk: "Merchant price if unsold", pays: "Plant operations", decision: "Whether to offer 30 MW", status: "Modeled, not offered" },
    { role: "Storage developer", wants: "A flexibility buyer", controls: "The storage project", doesNot: "Whether the utility counts it", risk: "Equipment and interconnection", pays: "Storage capex", decision: "Whether 20 MW is even needed", status: "Unknown" },
    { role: "Regulator", wants: "Rates and reliability", controls: "Tariff and siting approvals where they apply", doesNot: "Commercial terms between private parties", risk: "Political", pays: "Nothing directly", decision: "Whether an approval is required here", status: "Unknown" },
    { role: "Investor / capital", wants: "A dated path to revenue", controls: "Whether capital is available", doesNot: "The energization date", risk: "Capital", pays: "The project, if they commit", decision: "What evidence is enough to fund", status: "Unknown" },
    { role: "Other", wants: UNKNOWN, controls: UNKNOWN, doesNot: UNKNOWN, risk: UNKNOWN, pays: UNKNOWN, decision: "Who else has a veto", status: "Unknown" },
  ],
  seats: seats({
    "Grid authority": "Split between PPL and PJM — boundary not mapped",
  }),
  decisions: [
    { decision: "Is there a real customer?", actor: "Customer", depends: "Nothing", money: "None yet", evidence: "A named entity and a budget owner", time: "Unknown", status: "unknown" },
    { decision: "Hold the land option?", actor: "Site developer", depends: "Customer credibility", money: "Option cost — unknown", evidence: "The option agreement", time: "Before Q3 2027, if the model is right", status: "warn" },
    { decision: "Ask the utility for a study?", actor: "Customer or site developer", depends: "Someone willing to be the applicant", money: "Study deposit — unknown", evidence: "Utility application rules", time: "Unknown", status: "pending" },
    { decision: "Reserve a transformer?", actor: UNKNOWN, depends: "Someone willing to fund a slot", money: "Deposit — not sized", evidence: "A quote and a cancellation right", time: "128 weeks quoted", status: "warn" },
    { decision: "File at PJM?", actor: UNKNOWN, depends: "Study path", money: "Queue deposits", evidence: "Which cycle and which request type", time: "Unknown", status: "unknown" },
    { decision: "Choose a commercial structure?", actor: UNKNOWN, depends: "Who is selling power versus building wires", money: "Changes who funds capex", evidence: "A term sheet", time: "Unknown", status: "unknown" },
  ],
  readiness: [
    { label: "Site control", state: "Described, not verified", evidence: "Demo note of a 310-acre option. No document." },
    { label: "Financing", state: "Unknown", evidence: "No evidence." },
    { label: "Load requirement", state: "Stated", evidence: "120 MW entered in search. Not a customer load letter." },
    { label: "Target date", state: "Stated", evidence: "Q2 2029 from the search. Not agreed with a utility." },
    { label: "Utility engagement", state: "Not started", evidence: "No correspondence." },
    { label: "Power pathway", state: "Preliminary", evidence: "A modeled 70 / 30 / 20 mix. Not a study." },
    { label: "Interconnection / studies", state: "Pending", evidence: "Nothing filed." },
    { label: "Commercial commitment", state: "Unknown", evidence: "No term sheet, no buyer, no seller." },
  ],
  ramp: [
    { when: "2028", mw: "40 MW" },
    { when: "2029", mw: "80 MW" },
    { when: "2030", mw: "120 MW" },
  ],
  firmMw: "80 MW",
  flexMw: "40 MW",
  term: "15-year expected requirement",
  siteControl: "Described as optioned — not verified",
  credit: "Unknown",
  utilityEngagement: "Not started",
};

function rewrite(value: string, map: [string, string][]) {
  return map.reduce((s, [from, to]) => s.split(from).join(to), value);
}

function retitle<T>(value: T, map: [string, string][]): T {
  if (typeof value === "string") return rewrite(value, map) as T;
  if (Array.isArray(value)) return value.map((item) => retitle(item, map)) as T;
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) next[key] = retitle(item, map);
    return next as T;
  }
  return value;
}

function variant(
  base: Discovery,
  patch: Partial<Discovery> & { projectName: string },
  map: [string, string][],
): Discovery {
  return retitle({ ...base, ...patch }, map);
}

const OH_MAP: [string, string][] = [
  ["PPL Electric Utilities", "AEP Ohio"],
  ["PPL", "AEP Ohio"],
  ["128-week", "unspecified"],
];

const VA_MAP: [string, string][] = [
  ["PPL Electric Utilities", "Dominion Energy Virginia"],
  ["PPL", "Dominion"],
  ["128-week", "unspecified"],
];

const NC_MAP: [string, string][] = [
  ["PPL Electric Utilities", "Duke Energy Progress"],
  ["PJM and PPL", "Duke"],
  ["PPL", "Duke"],
  ["PJM", "no regional ISO"],
  ["128-week", "unspecified"],
];

const TX_MAP: [string, string][] = [
  ["PPL Electric Utilities", "Oncor"],
  ["PPL", "Oncor"],
  ["PJM", "ERCOT"],
  ["128-week", "unspecified"],
];

export const DISCOVERY: Record<string, Discovery> = {
  "pa-luzerne": PA,
  "oh-licking": variant(PA, {
    projectName: "Project Nova",
    nextDecision: "Whether AEP Ohio will treat 75 MW as a routine load or a system problem",
    firmMw: "50 MW",
    flexMw: "25 MW",
    siteControl: "Unknown",
    credit: "Unknown",
    utilityEngagement: "Described as started — no record in this demo",
    ramp: [
      { when: "2028", mw: "25 MW" },
      { when: "2029", mw: "75 MW" },
    ],
    demand: [
      { label: "Who needs the power", value: "Project Nova, a modeled industrial load", certainty: "Requires verification" },
      { label: "Load", value: "75 MW requested", certainty: "Estimated" },
      { label: "Site control", value: UNKNOWN, certainty: "Unknown" },
      { label: "Financing", value: UNKNOWN, certainty: "Unknown" },
      { label: "Load ramp", value: "Two steps, modeled", certainty: "Estimated" },
      { label: "Firm vs flexible", value: "50 / 25 MW split is an assumption", certainty: "Estimated" },
    ],
    grid: [
      { label: "Utility", value: "AEP Ohio", certainty: "Known" },
      { label: "ISO/RTO", value: "PJM", certainty: "Known" },
      { label: "Studies", value: "Not identified", certainty: "Unknown" },
      { label: "Upgrades", value: UNKNOWN, certainty: "Unknown" },
      { label: "Authority to say yes", value: UNKNOWN, certainty: "Unknown" },
    ],
  }, OH_MAP),
  "va-louisa": variant(PA, {
    projectName: "Project Dominion",
    nextDecision: "Whether a 90 MW load in this zone is even in the current planning window",
    firmMw: "70 MW",
    flexMw: "20 MW",
    siteControl: "Unknown",
    utilityEngagement: "Unknown",
    ramp: [
      { when: "2029", mw: "30 MW" },
      { when: "2030", mw: "90 MW" },
    ],
    demand: [
      { label: "Who needs the power", value: "Unnamed. Virginia is the hardest place in this set to treat as available", certainty: "Unknown" },
      { label: "Load", value: "90 MW modeled deliverable against a later date", certainty: "Estimated" },
      { label: "Site control", value: UNKNOWN, certainty: "Unknown" },
      { label: "Financing", value: UNKNOWN, certainty: "Unknown" },
      { label: "Load ramp", value: "Modeled", certainty: "Estimated" },
      { label: "Firm vs flexible", value: "Assumption", certainty: "Estimated" },
    ],
    grid: [
      { label: "Utility", value: "Dominion Energy Virginia", certainty: "Known" },
      { label: "ISO/RTO", value: "PJM, DOM zone", certainty: "Known" },
      { label: "Studies", value: "Unknown which queue or retail process applies", certainty: "Unknown" },
      { label: "Upgrades", value: "Widely described as constrained. Not sized for this site", certainty: "Estimated" },
      { label: "Authority to say yes", value: UNKNOWN, certainty: "Unknown" },
    ],
  }, VA_MAP),
  "nc-person": variant(PA, {
    projectName: "Project Person",
    nextDecision: "Who at Duke would even take a bilateral conversation",
    firmMw: "80 MW",
    flexMw: "30 MW",
    siteControl: "Unknown",
    utilityEngagement: "Unknown",
    ramp: [
      { when: "2028", mw: "40 MW" },
      { when: "2029", mw: "110 MW" },
    ],
    grid: [
      { label: "Utility", value: "Duke Energy Progress", certainty: "Known" },
      { label: "ISO/RTO", value: "None. Bilateral Carolinas territory", certainty: "Known" },
      { label: "Studies", value: "Utility process, not an ISO queue. Steps unknown", certainty: "Unknown" },
      { label: "Upgrades", value: UNKNOWN, certainty: "Unknown" },
      { label: "Authority to say yes", value: "A Duke negotiator — not identified", certainty: "Unknown" },
    ],
    demand: [
      { label: "Who needs the power", value: "Unnamed", certainty: "Unknown" },
      { label: "Load", value: "110 MW modeled", certainty: "Estimated" },
      { label: "Site control", value: UNKNOWN, certainty: "Unknown" },
      { label: "Financing", value: UNKNOWN, certainty: "Unknown" },
      { label: "Load ramp", value: "Modeled", certainty: "Estimated" },
      { label: "Firm vs flexible", value: "Assumption", certainty: "Estimated" },
    ],
  }, NC_MAP),
  "tx-taylor": variant(PA, {
    projectName: "Project Orion",
    nextDecision: "Whether 200 MW is a retail load, a large-load interconnection, or both",
    firmMw: "140 MW",
    flexMw: "60 MW",
    siteControl: "Described, not verified",
    credit: "Unknown",
    utilityEngagement: "Unknown",
    ramp: [
      { when: "2027", mw: "50 MW" },
      { when: "2028", mw: "200 MW" },
    ],
    demand: [
      { label: "Who needs the power", value: "Project Orion, modeled", certainty: "Requires verification" },
      { label: "Load", value: "200 MW modeled as deliverable", certainty: "Estimated" },
      { label: "Site control", value: "Described, not in evidence", certainty: "Requires verification" },
      { label: "Financing", value: UNKNOWN, certainty: "Unknown" },
      { label: "Load ramp", value: "Modeled", certainty: "Estimated" },
      { label: "Firm vs flexible", value: "140 / 60 is an assumption", certainty: "Estimated" },
    ],
    grid: [
      { label: "Utility", value: "Oncor, in this model", certainty: "Requires verification" },
      { label: "ISO/RTO", value: "ERCOT", certainty: "Known" },
      { label: "Studies", value: "Large-load process versus standard interconnection — not chosen", certainty: "Unknown" },
      { label: "Upgrades", value: UNKNOWN, certainty: "Unknown" },
      { label: "Authority to say yes", value: "Split between the utility and ERCOT. Boundary unknown", certainty: "Unknown" },
    ],
    supply: [
      { label: "Existing generation", value: "ERCOT is an energy-only market. A PPA is commercial, not a right to deliver", certainty: "Known" },
      { label: "New generation", value: "Whether this site needs dedicated generation", certainty: "Unknown" },
      { label: "Storage", value: "40 MW modeled", certainty: "Estimated" },
      { label: "Who builds it", value: UNKNOWN, certainty: "Unknown" },
      { label: "Land and equipment", value: "Not verified", certainty: "Requires verification" },
    ],
  }, TX_MAP),
};

export function getDiscovery(id: string): Discovery | undefined {
  return DISCOVERY[id];
}

export const RESEARCH_PROMPTS: Record<string, { assumption: string; validateWith: string; disprove: string }> = {
  search: {
    assumption: "A buyer can learn something true about energization by comparing pathways, before they have talked to a utility.",
    validateWith: "Director of power at a data-center developer. Utility key-account lead.",
    disprove: "Serious buyers already know the pathway is meaningless until the utility opens a study, and they do not shop it.",
  },
  pathway: {
    assumption: "The binding question is who owns the next decision, not where the power plants are.",
    validateWith: "Interconnection manager. Site-selection lead. Project finance.",
    disprove: "Participants say the owner, the signer and the grid authority are already obvious, and the uncertainty is only cost.",
  },
  request: {
    assumption: "A standardized requirement is something more than one party would actually respond to.",
    validateWith: "Utility large-load team. IPP origination. A customer’s internal counsel.",
    disprove: "Every party already has its own form, and a Kilo document would be ignored.",
  },
  market: {
    assumption: "A live wholesale print is useful next to a delivery problem, and people can tell them apart.",
    validateWith: "Energy trader at a hyperscaler. Utility rates analyst.",
    disprove: "Buyers treat the wholesale price as the delivered price, and showing both creates false confidence.",
  },
};
