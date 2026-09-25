import { qIndex } from "./pathways";
import type { StatusMark } from "./types";

export interface Milestone {
  label: string;
  status: StatusMark;
}

export interface Project {
  id: string;
  name: string;
  codename: string;
  mw: number;
  state: string;
  stateCode: string;
  coords: [number, number];
  stage: "Evaluating" | "Utility Engagement" | "Securing Capacity";
  stageIndex: number;
  pathwayId: string;
  energization: string;
  confidence: number;
  priceBand: string;
  owner: string;
  updated: string;
  nextAction: string;
  nextActionDue: string;
  milestones: Milestone[];
  spendToDate: string;
  committedCapex: string;
}

/** The four-step spine the whole product is organized around. */
export const WORKFLOW = ["Search", "Verify", "Request", "Secure"] as const;
export type WorkflowStep = (typeof WORKFLOW)[number];

export const PROJECTS: Project[] = [
  {
    id: "atlas",
    name: "Project Atlas",
    codename: "ATL",
    mw: 100,
    state: "Virginia",
    stateCode: "VA",
    coords: [-77.91, 38.01],
    stage: "Evaluating",
    stageIndex: 1,
    pathwayId: "va-louisa",
    energization: "Q2 2029 target",
    confidence: 0,
    priceBand: "UNKNOWN",
    owner: "UNKNOWN",
    updated: "Demo record",
    nextAction: "Identify who at Dominion would take a formal request",
    nextActionDue: "No date",
    spendToDate: "UNKNOWN",
    committedCapex: "UNKNOWN",
    milestones: [
      { label: "Site identified", status: "warn" },
      { label: "Land option", status: "pending" },
      { label: "Utility-confirmed capacity", status: "pending" },
      { label: "Proposals requested", status: "pending" },
      { label: "Interconnection filed", status: "pending" },
      { label: "Capacity secured", status: "pending" },
    ],
  },
  {
    id: "nova",
    name: "Project Nova",
    codename: "NVA",
    mw: 75,
    state: "Ohio",
    stateCode: "OH",
    coords: [-82.75, 40.08],
    stage: "Utility Engagement",
    stageIndex: 2,
    pathwayId: "oh-licking",
    energization: "Q4 2028",
    confidence: 78,
    priceBand: "$58–66/MWh",
    owner: "S. Okonkwo",
    updated: "Yesterday",
    nextAction: "Counter AEP Ohio on the 85% minimum take floor",
    nextActionDue: "Due in 3 days",
    spendToDate: "$3.8M",
    committedCapex: "$14M",
    milestones: [
      { label: "Site identified", status: "ok" },
      { label: "Land option", status: "ok" },
      { label: "Capacity verified", status: "ok" },
      { label: "Proposals requested", status: "ok" },
      { label: "Interconnection filed", status: "warn" },
      { label: "Capacity secured", status: "pending" },
    ],
  },
  {
    id: "orion",
    name: "Project Orion",
    codename: "ORN",
    mw: 200,
    state: "Texas",
    stateCode: "TX",
    coords: [-99.73, 32.45],
    stage: "Securing Capacity",
    stageIndex: 3,
    pathwayId: "tx-taylor",
    energization: "Q3 2028",
    confidence: 88,
    priceBand: "$41–58/MWh",
    owner: "D. Raskin",
    updated: "2 hours ago",
    nextAction: "Execute Oncor interconnection agreement and post collateral",
    nextActionDue: "Due in 6 days",
    spendToDate: "$9.4M",
    committedCapex: "$71M",
    milestones: [
      { label: "Site identified", status: "ok" },
      { label: "Land option", status: "ok" },
      { label: "Capacity verified", status: "ok" },
      { label: "Proposals requested", status: "ok" },
      { label: "Interconnection filed", status: "ok" },
      { label: "Capacity secured", status: "warn" },
    ],
  },
];

export const PORTFOLIO_TOTAL_MW = PROJECTS.reduce((s, p) => s + p.mw, 0);

/* ───────────────────────────── Market ───────────────────────────── */

export interface MarketRegion {
  code: string;
  name: string;
  operator: string;
  medianPrice: number;
  priceDelta: number;
  medianLagQuarters: number;
  lagDelta: number;
  queueGw: number;
  clearedGw: number;
  carbon: number;
  headroom: "Deep" | "Moderate" | "Tight" | "Severely constrained";
  headroomScore: number;
  note: string;
  /** 12 quarters of indicative $/MWh, for the sparkline. */
  series: number[];
}

export const MARKET_REGIONS: MarketRegion[] = [
  {
    code: "ERCOT",
    name: "Texas",
    operator: "ERCOT",
    medianPrice: 49,
    priceDelta: -3.2,
    medianLagQuarters: 8,
    lagDelta: -1,
    queueGw: 41.2,
    clearedGw: 6.8,
    carbon: 210,
    headroom: "Deep",
    headroomScore: 86,
    note: "Fastest large-load interconnection in the country. Energy-only market means volatility is the price of speed.",
    series: [44, 51, 47, 43, 58, 62, 49, 45, 52, 47, 44, 49],
  },
  {
    code: "PJM-W",
    name: "PJM West",
    operator: "PJM Interconnection",
    medianPrice: 61,
    priceDelta: 6.8,
    medianLagQuarters: 12,
    lagDelta: 1,
    queueGw: 58.4,
    clearedGw: 4.1,
    carbon: 395,
    headroom: "Tight",
    headroomScore: 38,
    note: "AEP and ATSI zones absorbing extraordinary load growth. Upgrade cost allocation is the defining commercial issue.",
    series: [48, 50, 53, 51, 56, 59, 57, 62, 64, 61, 60, 61],
  },
  {
    code: "PJM-E",
    name: "PJM East",
    operator: "PJM Interconnection",
    medianPrice: 68,
    priceDelta: 9.1,
    medianLagQuarters: 11,
    lagDelta: 0,
    queueGw: 44.9,
    clearedGw: 3.6,
    carbon: 310,
    headroom: "Moderate",
    headroomScore: 54,
    note: "PPL and PSEG zones retain pockets of genuine headroom. Capacity prices are the fastest-moving variable.",
    series: [51, 54, 52, 57, 60, 63, 66, 64, 69, 71, 67, 68],
  },
  {
    code: "DOM",
    name: "Virginia",
    operator: "PJM (DOM zone)",
    medianPrice: 77,
    priceDelta: 12.4,
    medianLagQuarters: 17,
    lagDelta: 3,
    queueGw: 71.3,
    clearedGw: 2.2,
    carbon: 265,
    headroom: "Severely constrained",
    headroomScore: 14,
    note: "The largest data center market on earth is currently the slowest. Delivery, not generation, is the binding constraint.",
    series: [58, 61, 63, 66, 64, 69, 72, 75, 74, 79, 81, 77],
  },
  {
    code: "CAR",
    name: "Carolinas",
    operator: "Duke (non-ISO)",
    medianPrice: 64,
    priceDelta: 2.1,
    medianLagQuarters: 10,
    lagDelta: -1,
    queueGw: 12.6,
    clearedGw: 2.9,
    carbon: 340,
    headroom: "Moderate",
    headroomScore: 58,
    note: "No organized market. Capacity is allocated through the utility's resource plan, so outcomes turn on negotiation.",
    series: [59, 60, 62, 61, 63, 65, 64, 63, 66, 65, 64, 64],
  },
  {
    code: "MISO",
    name: "Midwest",
    operator: "MISO",
    medianPrice: 54,
    priceDelta: 1.4,
    medianLagQuarters: 14,
    lagDelta: 2,
    queueGw: 49.8,
    clearedGw: 3.1,
    carbon: 430,
    headroom: "Moderate",
    headroomScore: 47,
    note: "Land and water are abundant. The queue backlog and a fragmented utility landscape are the drags.",
    series: [47, 49, 51, 50, 53, 55, 52, 54, 56, 55, 53, 54],
  },
];

/* ───────────────────────── Requests and marketplace ───────────────────────── */

export interface ProviderResponse {
  id: string;
  provider: string;
  providerType: "Utility" | "Independent power producer" | "Developer" | "Generator";
  pathwayLabel: string;
  mw: number;
  firmMw: number;
  flexibleMw: number;
  energization: string;
  price: string;
  priceNumeric: number;
  term: string;
  structure: string;
  match: number;
  responded: string;
  status: "Responsive" | "Partial" | "Conditional";
  highlights: string[];
  conditions: string[];
  carbon: number;
  collateral: string;
  exclusivity: string;
}

export const PROVIDER_RESPONSES: ProviderResponse[] = [
  {
    id: "resp-1",
    provider: "PPL Electric Utilities",
    providerType: "Utility",
    pathwayLabel: "Regulated interconnection, 230 kV firm service",
    mw: 70,
    firmMw: 70,
    flexibleMw: 0,
    energization: "Q2 2029",
    price: "$62–68/MWh",
    priceNumeric: 65,
    term: "15 years",
    structure: "Rate LP-5 large power service with a negotiated ramp schedule",
    match: 92,
    responded: "3 days ago",
    status: "Responsive",
    carbon: 310,
    collateral: "$14.2M letter of credit",
    exclusivity: "None requested",
    highlights: [
      "Full 70 MW of firm grid capacity at the requested energization date",
      "Confirms 182 MW of zonal headroom, leaving room for a later expansion",
      "Will support a staged ramp with no minimum take before Q4 2029",
    ],
    conditions: [
      "Conditioned on PJM Cycle 4 entry by the Q1 2027 window",
      "Network upgrade allocation to be finalized at System Impact Study",
      "Collateral posted before facilities construction begins",
    ],
  },
  {
    id: "resp-2",
    provider: "Susquehanna Power Marketing",
    providerType: "Generator",
    pathwayLabel: "Unit-contingent nuclear PPA, hourly matched",
    mw: 40,
    firmMw: 30,
    flexibleMw: 10,
    energization: "Q1 2029",
    price: "$76–84/MWh",
    priceNumeric: 80,
    term: "15 years",
    structure: "Unit-contingent physical PPA with hourly matched energy attribute certificates",
    match: 78,
    responded: "5 days ago",
    status: "Partial",
    carbon: 12,
    collateral: "$22M or parent guarantee",
    exclusivity: "60-day exclusivity requested",
    highlights: [
      "Delivers 24/7 carbon-free energy at roughly 12 kg/MWh on a matched basis",
      "Available one quarter ahead of the requested date",
      "Price is fixed with an inflation collar rather than floating with the market",
    ],
    conditions: [
      "Unit-contingent — no delivery obligation during station outages",
      "Requires investment-grade credit or a parent guarantee",
      "Covers 40 MW only; the balance must come from another counterparty",
    ],
  },
  {
    id: "resp-3",
    provider: "Keystone Bridge Power",
    providerType: "Independent power producer",
    pathwayLabel: "Behind-the-meter bridge generation plus storage",
    mw: 50,
    firmMw: 30,
    flexibleMw: 20,
    energization: "Q4 2027",
    price: "$88–104/MWh",
    priceNumeric: 96,
    term: "7 years, convertible",
    structure: "Build-own-operate behind-the-meter generation with a 20 MW / 80 MWh storage block",
    match: 71,
    responded: "6 days ago",
    status: "Conditional",
    carbon: 420,
    collateral: "$8M plus a 7-year take-or-pay",
    exclusivity: "Site exclusivity for 90 days",
    highlights: [
      "Energizes five quarters before grid service, removing the substation dependency for the first hall",
      "Converts to backup and peak-shaving duty once grid service arrives",
      "Includes the storage block that the pathway model already assumes",
    ],
    conditions: [
      "Requires firm gas transport on Transco Leidy, not yet secured",
      "PADEP air Plan Approval must be granted before construction",
      "Take-or-pay runs the full 7 years regardless of grid service timing",
    ],
  },
];

export interface PowerRequest {
  id: string;
  number: string;
  mw: number;
  location: string;
  requiredBy: string;
  termYears: number;
  firmMw: number;
  flexibleMw: number;
  reliability: string;
  status: "Draft" | "Open" | "Evaluating responses" | "Awarded" | "Closed";
  stepIndex: number;
  created: string;
  responses: number;
  projectId?: string;
  pathwayId?: string;
}

export const REQUESTS: PowerRequest[] = [
  {
    id: "req-1842",
    number: "1842",
    mw: 120,
    location: "Pennsylvania",
    requiredBy: "Q2 2029",
    termYears: 15,
    firmMw: 80,
    flexibleMw: 40,
    reliability: "Mission Critical",
    status: "Evaluating responses",
    stepIndex: 2,
    created: "Today",
    responses: 3,
    projectId: "atlas",
    pathwayId: "pa-luzerne",
  },
  {
    id: "req-1836",
    number: "1836",
    mw: 200,
    location: "Texas — ERCOT West",
    requiredBy: "Q3 2028",
    termYears: 12,
    firmMw: 140,
    flexibleMw: 60,
    reliability: "High",
    status: "Awarded",
    stepIndex: 3,
    created: "42 days ago",
    responses: 6,
    projectId: "orion",
    pathwayId: "tx-taylor",
  },
  {
    id: "req-1829",
    number: "1829",
    mw: 75,
    location: "Ohio — AEP zone",
    requiredBy: "Q4 2028",
    termYears: 12,
    firmMw: 60,
    flexibleMw: 15,
    reliability: "High",
    status: "Open",
    stepIndex: 1,
    created: "18 days ago",
    responses: 4,
    projectId: "nova",
    pathwayId: "oh-licking",
  },
  {
    id: "req-1814",
    number: "1814",
    mw: 45,
    location: "Carolinas",
    requiredBy: "Q1 2030",
    termYears: 10,
    firmMw: 45,
    flexibleMw: 0,
    reliability: "Standard",
    status: "Closed",
    stepIndex: 3,
    created: "94 days ago",
    responses: 2,
  },
];

export const REQUEST_STEPS = [
  {
    key: "create",
    label: "Create power requirement",
    caption: "Write down the load, the date, the ramp, and what is already known.",
  },
  {
    key: "verify",
    label: "Verify project",
    caption: "Separate what is evidenced from what is still a claim.",
  },
  {
    key: "identify",
    label: "Identify pathways",
    caption: "Lay out possible routes to energization. None of them is available capacity.",
  },
  {
    key: "engage",
    label: "Engage parties",
    caption: "Put the same requirement in front of the utility, developers and capital. This is not a purchase.",
  },
  {
    key: "compare",
    label: "Compare structures",
    caption: "Compare who would build, who would sign, and what is still unknown.",
  },
  {
    key: "secure",
    label: "Secure capacity",
    caption: "Only after a structure exists does anyone talk about a contract.",
  },
] as const;

/** Verification checks shown in step 1 of the request flow. */
export const VERIFICATION_CHECKS = [
  { label: "Load profile and ramp schedule", value: "120 MW over 6 quarters", status: "ok" as const },
  { label: "Site control", value: "310 ac under option to Q3 2027", status: "ok" as const },
  { label: "Counterparty credit", value: "Investment grade, confirmed", status: "ok" as const },
  { label: "Reliability requirement", value: "Mission critical, N+1 minimum", status: "ok" as const },
  { label: "Flexibility commitment", value: "40 MW curtailable, 2 hr notice", status: "ok" as const },
  { label: "Interconnection position", value: "Not yet filed — PJM Cycle 4", status: "warn" as const },
  { label: "Long-lead equipment", value: "No transformer slot held", status: "warn" as const },
  { label: "Environmental review", value: "Phase I complete, Phase II pending", status: "warn" as const },
];

export const QUARTER_TICK = qIndex(2029, 2);
