/** Mock discovery notes. Nothing here is deliverable capacity. */

export type Certainty = "Known" | "Estimated" | "Unverified" | "Unknown";

export interface Fact {
  label: string;
  value: string;
  certainty: Certainty;
}

export interface Actor {
  id: string;
  role: string;
  incentive: string;
  controls: string;
  needsOthers: string;
  money: string;
  outstanding: string;
  next: string;
}

export interface Seat {
  seat: string;
  who: string;
}

export interface PathStep {
  id: string;
  title: string;
  responsible: string;
  depends: string;
  evidence: string;
  blocker: string;
  note: string;
}

export interface Discovery {
  nextDecision: string;
  demand: Fact[];
  grid: Fact[];
  supply: Fact[];
  ramp: { when: string; mw: string }[];
  firmMw: string;
  flexMw: string;
  term: string;
  siteControl: string;
  credit: string;
  utilityEngagement: string;
  workspace?: VirginiaWorkspace;
}

export interface VirginiaWorkspace {
  projectName: string;
  actors: Actor[];
  seats: Seat[];
  path: PathStep[];
}

const UNKNOWN = "UNKNOWN";

const SEATS: Seat[] = [
  { seat: "Day-to-day problem owner", who: UNKNOWN },
  { seat: "Internal champion", who: UNKNOWN },
  { seat: "Economic buyer", who: UNKNOWN },
  { seat: "Budget owner", who: UNKNOWN },
  { seat: "Contract signer", who: UNKNOWN },
];

const VIRGINIA: Discovery = {
  nextDecision: "Who would apply to Dominion, and which process that application would enter",
  demand: [
    { label: "Who needs the power", value: "Illustrative data-center developer. No company is named.", certainty: "Unverified" },
    { label: "Requirement", value: "100 MW stated. Not a measured load.", certainty: "Unverified" },
    { label: "Site control", value: UNKNOWN, certainty: "Unknown" },
    { label: "Financing", value: UNKNOWN, certainty: "Unknown" },
  ],
  grid: [
    { label: "Utility in the model", value: "Dominion Energy Virginia", certainty: "Unverified" },
    { label: "ISO/RTO in the model", value: "PJM, DOM zone", certainty: "Unverified" },
    { label: "Which process applies", value: "Retail service, a transmission request, or both", certainty: "Unknown" },
    { label: "Studies", value: "None in this prototype", certainty: "Unknown" },
  ],
  supply: [
    { label: "Dedicated generation", value: "The model sketches 35 MW. Nobody has agreed to build it.", certainty: "Estimated" },
    { label: "Storage", value: "The model sketches 15 MW. Relevance is not established.", certainty: "Estimated" },
    { label: "Who would build infrastructure", value: UNKNOWN, certainty: "Unknown" },
  ],
  ramp: [
    { when: "2028", mw: "UNKNOWN" },
    { when: "2029", mw: "UNKNOWN" },
    { when: "2030", mw: "100 MW asked" },
  ],
  firmMw: "UNKNOWN",
  flexMw: "UNKNOWN",
  term: "UNKNOWN",
  siteControl: "UNKNOWN",
  credit: "UNKNOWN",
  utilityEngagement: "Not started",
  workspace: {
    projectName: "Project Atlas",
    seats: SEATS,
    actors: [
      {
        id: "customer",
        role: "Power customer",
        incentive: "Get about 100 MW energized on a date the project can underwrite. The company is illustrative. No customer has been interviewed.",
        controls: "The requirement they are willing to state. Whether they keep a site. Their own spend.",
        needsOthers: "Whether the utility will study the load. Whether PJM is involved. Permission to energize. Any infrastructure someone else must build.",
        money: "Site and development spend. Amount UNKNOWN. Risk of committing to land before a service date exists.",
        outstanding: "Legal name, site control, credit, ramp, firm versus flexible load, and who can sign.",
        next: "Name the applicant who would actually contact Dominion.",
      },
      {
        id: "utility",
        role: "Utility — Dominion Energy Virginia",
        incentive: "A hypothesis, not a finding: a load that arrives and pays, without upgrades that are stranded if the load slips.",
        controls: "The retail relationship and the utility studies and construction in their tariff. The exact large-load process for this county is UNKNOWN.",
        needsOthers: "A real applicant. PJM, where the delivery problem is regional. A regulator, where an approval is required. A builder, if new facilities are not the utility's to construct.",
        money: "Study and upgrade costs. Who pays, and how much, is UNKNOWN. Risk sits with whoever funds work for a load that does not show up.",
        outstanding: "Which tariff applies, whether a deposit is required, and who at Dominion would take the conversation.",
        next: "Identify that person. Do not treat this model as a load study.",
      },
      {
        id: "pjm",
        role: "Grid process — PJM, DOM zone",
        incentive: "Reliability of the regional system. This project's schedule is not PJM's objective.",
        controls: "Regional transmission planning and the request types in PJM's rules. Whether this 100 MW load is a PJM matter or only a Dominion retail matter is UNKNOWN.",
        needsOthers: "The transmission owner and an applicant have to file the right request. PJM does not sign the customer's retail contract.",
        money: "Deposits, if a request is filed. Amount UNKNOWN. Who would post them is UNKNOWN.",
        outstanding: "Request type, cycle, and whether the modeled 2030 substation is a real PJM project or only a sketch.",
        next: "Learn which process would apply before describing a queue position.",
      },
      {
        id: "infra",
        role: "Infrastructure developer",
        incentive: "Hypothesis: a fee or a project they can finance. No developer is attached to this requirement.",
        controls: "Work they agree to take. They do not control the energization date.",
        needsOthers: "The utility for interconnection. The customer, or another payer, for a reason to build. Landowners for right-of-way.",
        money: "Development capital. Amount UNKNOWN. The model mentions a 500 kV-class transformer lead time. No slot is held, and no quote is in evidence.",
        outstanding: "Whether a new substation or line is required, who would own it, and whether the 2030 date is anyone's schedule.",
        next: "Separate the sketch from anything a party has agreed to build.",
      },
      {
        id: "supply",
        role: "Supply developer",
        incentive: "Hypothesis: a contract for generation or storage. It is UNKNOWN whether this load needs either.",
        controls: "A project they choose to develop. Not delivery of utility service to the site.",
        needsOthers: "Interconnection, a buyer, and permits. The utility may be able to serve the load without a new plant. That has not been determined.",
        money: "Development and equipment spend. Amount UNKNOWN. Building supply that is not required is the risk.",
        outstanding: "Whether the 35 MW and 15 MW figures in the pathway model are a commercial need or only a sketch.",
        next: "Do not staff a generation or storage project until some party shows it is required.",
      },
      {
        id: "regulator",
        role: "Regulator and permitting",
        incentive: "Land use, rates, and reliability, depending on the office. Not confirmed.",
        controls: "Approvals inside their jurisdiction. They do not set the private commercial terms.",
        needsOthers: "An application from someone. Which office must act — county, state commission, or neither — is UNKNOWN.",
        money: "They do not fund the project. Applicant cost is UNKNOWN.",
        outstanding: "The model flags rezoning in Louisa County. Whether that is the binding approval, and whether a state certificate is required, is UNKNOWN.",
        next: "List the approvals with someone who has permitted a load in this county.",
      },
      {
        id: "capital",
        role: "Capital provider",
        incentive: "Hypothesis: a dated path to repayment. No investor is in this file.",
        controls: "Whether to commit money. Not the date the utility will energize.",
        needsOthers: "A structure, a counterparty, and evidence that both the load and the grid path are real.",
        money: "Instrument and amount UNKNOWN. Who bears upgrade risk is UNKNOWN.",
        outstanding: "Who the economic buyer is, what evidence they would require, and whether they would pay for coordination.",
        next: "Ask what would be enough to fund, and who would be asked to pay.",
      },
    ],
    path: [
      {
        id: "requirement",
        title: "State the requirement",
        responsible: "Power customer",
        depends: "Nothing. This can start before any utility conversation.",
        evidence: "A named entity, megawatts, a target date, a ramp, and what is firm versus flexible.",
        blocker: "The 100 MW figure is an illustration. Firm, flexible, ramp, and term are UNKNOWN.",
        note: "Stating a requirement does not create a right to service.",
      },
      {
        id: "site",
        title: "Hold a site",
        responsible: "Customer or a site developer",
        depends: "Can run beside the requirement. It does not, by itself, unlock power.",
        evidence: "Option or title, and the zoning status.",
        blocker: "Site control is UNKNOWN. The pathway model says the parcel would need rezoning. That document is not here.",
        note: "In another structure the customer never controls the land. This step is not universal.",
      },
      {
        id: "utility",
        title: "Open the utility process",
        responsible: "Customer, then Dominion",
        depends: "Someone willing to be the applicant.",
        evidence: "Dominion's actual large-load or line-extension process for this location, including any deposit.",
        blocker: "That process, and the person who owns it, are UNKNOWN. Engagement has not started.",
        note: "Other utilities do not use Dominion's process. This is not a template for every territory.",
      },
      {
        id: "grid",
        title: "Decide which grid process applies",
        responsible: "Dominion, PJM, or both — unresolved",
        depends: "The utility conversation. The two processes are not a single queue.",
        evidence: "A determination of retail service versus a PJM transmission request, or both.",
        blocker: "No study exists. Describing a queue position now would be invented.",
        note: "In a bilateral state there may be no ISO step at all.",
      },
      {
        id: "infrastructure",
        title: "Infrastructure, if a study requires it",
        responsible: "UNKNOWN",
        depends: "The process in the previous step. It cannot be scoped from this model.",
        evidence: "A study that names facilities, an in-service date, and who builds them.",
        blocker: "The model depends on a substation around 2030. That dependency is unverified.",
        note: "Some loads are served with no new substation. Do not assume this step always exists.",
      },
      {
        id: "supply",
        title: "New supply, only if service requires it",
        responsible: "UNKNOWN",
        depends: "A finding that system power cannot serve the load.",
        evidence: "That finding, plus a developer and a site for the equipment.",
        blocker: "The finding does not exist. The 35 MW and 15 MW sketches are not projects.",
        note: "Generation is a different project from utility service. Many loads never take this step.",
      },
      {
        id: "commercial",
        title: "Choose a commercial structure",
        responsible: "UNKNOWN",
        depends: "Knowing who would sell service, who would build, and who would pay.",
        evidence: "A term sheet that names the signer on each side.",
        blocker: "Contract signer, budget owner, and economic buyer are UNKNOWN.",
        note: "A tariff, a PPA, and a contribution in aid of construction are different structures. They are not one sequence.",
      },
      {
        id: "energized",
        title: "Energize",
        responsible: "Dominion, after the approvals that actually apply",
        depends: "Whichever of the steps above a real study says are required. Not all of them.",
        evidence: "Permission to energize.",
        blocker: "The pathway model estimates Q3 2030 and about 90 MW. Neither figure is a commitment, and neither is 100 MW of available capacity.",
        note: "The searched date can be earlier than anything the utility has said. The utility has said nothing.",
      },
    ],
  },
};

function sketch(nextDecision: string, utility: string, market: string): Discovery {
  return {
    nextDecision,
    demand: [
      { label: "Who needs the power", value: "Not named in this demo.", certainty: "Unknown" },
      { label: "Requirement", value: "The searched megawatts. Not a customer load letter.", certainty: "Unverified" },
    ],
    grid: [
      { label: "Utility in the model", value: utility, certainty: "Unverified" },
      { label: "Market in the model", value: market, certainty: "Unverified" },
      { label: "Studies", value: "None", certainty: "Unknown" },
    ],
    supply: [
      { label: "Who would build", value: UNKNOWN, certainty: "Unknown" },
    ],
    ramp: [],
    firmMw: UNKNOWN,
    flexMw: UNKNOWN,
    term: UNKNOWN,
    siteControl: UNKNOWN,
    credit: UNKNOWN,
    utilityEngagement: UNKNOWN,
  };
}

export const DISCOVERY: Record<string, Discovery> = {
  "va-louisa": VIRGINIA,
  "pa-luzerne": sketch(
    "Whether anyone has asked PPL to study this load",
    "PPL Electric Utilities",
    "PJM",
  ),
  "oh-licking": sketch(
    "Whether AEP Ohio has been asked to look at this load",
    "AEP Ohio",
    "PJM",
  ),
  "nc-person": sketch(
    "Who at Duke would take a bilateral conversation",
    "Duke Energy Progress",
    "No ISO — bilateral Carolinas",
  ),
  "tx-taylor": sketch(
    "Whether this would be retail service, a large-load interconnection, or both",
    "Oncor, in the model",
    "ERCOT",
  ),
};

export function getDiscovery(id: string): Discovery | undefined {
  return DISCOVERY[id];
}
