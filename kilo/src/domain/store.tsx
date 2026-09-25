import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { seedProjects } from "./seed";
import type { EvidenceItem, EvidenceStatus, FounderNote, LoadEnvelope, PowerProject } from "./types";

const KEY = "kilo-projects-v2";
const INTERVIEW = "kilo-interview";
const NOTES = "kilo-founder-notes";

interface Store {
  projects: PowerProject[];
  notes: FounderNote[];
  interview: boolean;
  setInterview: (on: boolean) => void;
  project: (id: string) => PowerProject;
  updateLoad: (id: string, patch: Partial<LoadEnvelope>) => void;
  setCustomerEntity: (id: string, value: string) => void;
  setScenario: (id: string, scenario: string) => void;
  addEvidence: (id: string, item: Omit<EvidenceItem, "id">) => void;
  resolveUnknown: (id: string, field: "voltage" | "site", value: string) => void;
  addNote: (note: Omit<FounderNote, "id" | "at">) => void;
}

const Ctx = createContext<Store | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<PowerProject[]>(loadProjects);
  const [notes, setNotes] = useState<FounderNote[]>(loadNotes);
  const [interview, setInterviewState] = useState(() => localStorage.getItem(INTERVIEW) === "on");

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem(NOTES, JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem(INTERVIEW, interview ? "on" : "off");
  }, [interview]);

  const api = useMemo<Store>(() => {
    const patch = (id: string, fn: (project: PowerProject) => PowerProject) => {
      setProjects((list) => list.map((project) => (project.id === id ? fn(project) : project)));
    };
    return {
      projects,
      notes,
      interview,
      setInterview: setInterviewState,
      project: (id) => projects.find((item) => item.id === id) ?? projects[0],
      updateLoad: (id, fields) => {
        patch(id, (project) => {
          const load = { ...project.load, ...fields };
          const claims = upsertLoadClaims(project, load);
          return {
            ...project,
            load,
            claims,
            activity: [entry("Requirement changed", describeLoad(fields)), ...project.activity],
          };
        });
      },
      setCustomerEntity: (id, value) => {
        patch(id, (project) => ({
          ...project,
          customerEntity: value || "UNKNOWN",
          activity: [entry("Customer entity updated", value || "Cleared"), ...project.activity],
        }));
      },
      setScenario: (id, scenario) => {
        patch(id, (project) => ({
          ...project,
          scenario,
          activity: [entry("Service configuration explored", `${scenario}. Not an engineering determination.`), ...project.activity],
        }));
      },
      addEvidence: (id, item) => {
        patch(id, (project) => {
          const evidence = { ...item, id: `ev-${Date.now()}` };
          const claims =
            item.type === "Load profile"
              ? [
                  {
                    id: `c-profile-${evidence.id}`,
                    claim: "A load profile is registered",
                    value: item.title,
                    status: "USER_SUPPLIED" as const,
                    source: item.source,
                    scope: project.name,
                    notes: "Registered by the user. Not a utility study.",
                    updatedAt: today(),
                  },
                  ...project.claims,
                ]
              : project.claims;
          return {
            ...project,
            claims,
            evidence: [evidence, ...project.evidence],
            activity: [entry("Evidence registered", `${item.type}: ${item.title}`), ...project.activity],
          };
        });
      },
      resolveUnknown: (id, field, value) => {
        patch(id, (project) => ({
          ...project,
          claims: project.claims.map((claim) =>
            field === "voltage" && claim.id.endsWith("voltage")
              ? { ...claim, value, status: "USER_SUPPLIED" as const, updatedAt: today() }
              : claim,
          ),
          activity: [entry(field === "site" ? "Site note recorded" : "Field resolved", value), ...project.activity],
          counterparties: project.counterparties,
          customerEntity: project.customerEntity,
          evidence:
            field === "site"
              ? [
                  {
                    id: `ev-${Date.now()}`,
                    title: value,
                    type: "Site control",
                    source: "User-entered demo note",
                    date: today(),
                    counterparty: "Customer",
                    status: "USER_SUPPLIED" as const,
                    notes: "Registered from the decision packet. Not a recorded instrument.",
                    supports: ["Site control"],
                  },
                  ...project.evidence,
                ]
              : project.evidence,
        }));
      },
      addNote: (note) => {
        setNotes((list) => [{ ...note, id: `n-${Date.now()}`, at: new Date().toISOString() }, ...list]);
      },
    };
  }, [projects, notes, interview]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProjects() {
  const store = useContext(Ctx);
  if (!store) throw new Error("ProjectProvider missing");
  return store;
}

export function loadDefined(load: LoadEnvelope) {
  return [load.firmMw, load.flexibleMw, load.ramp].every((value) => filled(value));
}

export function packetChecks(project: PowerProject) {
  const site = project.evidence.some((item) => item.type === "Site control");
  const utility = project.evidence.some((item) =>
    ["Utility correspondence", "Engineering study", "Service request"].includes(item.type),
  );
  return {
    entity: filled(project.customerEntity),
    load: loadDefined(project.load),
    site,
    utility,
  };
}

export function blockingCount(project: PowerProject) {
  const checks = packetChecks(project);
  return [checks.entity, checks.load, checks.site].filter((ok) => !ok).length;
}

export function nextDecision(project: PowerProject) {
  const checks = packetChecks(project);
  if (!checks.load) {
    return {
      id: "load",
      title: "Define load envelope",
      status: "BLOCKED" as const,
      why: "Nameplate megawatts do not define firm, flexible, or ramp service.",
    };
  }
  if (!checks.utility) {
    return {
      id: "path",
      title: "Determine utility engagement path",
      status: "UPCOMING" as const,
      why: "No project-specific utility feasibility evidence exists.",
    };
  }
  return {
    id: "connection",
    title: "Determine connection structure",
    status: "UPCOMING" as const,
    why: "Utility evidence is registered. Connection voltage and upgrades are still unknown.",
  };
}

function upsertLoadClaims(project: PowerProject, load: LoadEnvelope): PowerProject["claims"] {
  const next = project.claims.filter((claim) => !claim.id.startsWith("c-load-"));
  const add = (key: string, statement: string, value: string) => {
    if (!filled(value)) return;
    next.push({
      id: `c-load-${key}`,
      claim: statement,
      value,
      status: "USER_SUPPLIED",
      source: "Load envelope, entered in the demo",
      scope: project.name,
      notes: "User-supplied scenario input. Not a utility confirmation.",
      updatedAt: today(),
    });
  };
  add("firm", "Firm requirement", load.firmMw);
  add("flex", "Flexible requirement", load.flexibleMw);
  add("ramp", "Ramp schedule", load.ramp);
  return next;
}

function describeLoad(fields: Partial<LoadEnvelope>) {
  return Object.entries(fields)
    .filter(([, value]) => value && value !== "UNKNOWN")
    .map(([key, value]) => `${key} ${value}`)
    .join(", ") || "Fields cleared";
}

export function materialBlockers(project: PowerProject) {
  const checks = packetChecks(project);
  return [
    {
      kind: checks.utility ? ("MISSING" as const) : ("BLOCKING" as const),
      title: "Utility feasibility",
      detail: checks.utility
        ? "Some utility evidence is registered. Feasibility is still not confirmed."
        : "No project-specific utility assessment exists.",
      section: "decisions" as const,
    },
    {
      kind: "MISSING" as const,
      title: "Load ramp",
      detail: checks.load ? "A ramp was entered as user-supplied." : "Required service profile has not been established.",
      section: "requirement" as const,
      quiet: checks.load,
    },
    {
      kind: "MISSING" as const,
      title: "Site control",
      detail: checks.site ? "A site-control note is registered." : "No supporting document exists.",
      section: "evidence" as const,
      quiet: checks.site,
    },
    {
      kind: "UNKNOWN" as const,
      title: "Connection voltage",
      detail: "Cannot determine the applicable process without project-specific information.",
      section: "path" as const,
    },
  ].filter((item) => !("quiet" in item && item.quiet));
}

function filled(value: string) {
  return value.trim().length > 0 && value !== "UNKNOWN" && value !== "MISSING";
}

function entry(label: string, detail: string) {
  return {
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: today(),
    label,
    detail,
    status: "USER_SUPPLIED" as EvidenceStatus,
    demo: true,
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loadProjects(): PowerProject[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedProjects();
    const parsed = JSON.parse(raw) as PowerProject[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seedProjects();
    return parsed;
  } catch {
    return seedProjects();
  }
}

function loadNotes(): FounderNote[] {
  try {
    const raw = localStorage.getItem(NOTES);
    return raw ? (JSON.parse(raw) as FounderNote[]) : [];
  } catch {
    return [];
  }
}
