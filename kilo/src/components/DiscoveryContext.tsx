import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Perspective = "customer" | "utility" | "developer";

export const PERSPECTIVES: {
  id: Perspective;
  label: string;
  question: string;
  cares: string;
}[] = [
  {
    id: "customer",
    label: "Customer",
    question: "How can I get this load energized by the date?",
    cares: "Speed, cost, reliability, other pathways, and the blocker in front of energization.",
  },
  {
    id: "utility",
    label: "Utility",
    question: "Is this load credible, and what will serving it require?",
    cares: "Readiness, ramp, site control, financial commitment, flexibility, and outstanding information.",
  },
  {
    id: "developer",
    label: "Developer",
    question: "Which credible loads could match infrastructure I can build?",
    cares: "Whether the demand is real, where it is, how many MW, how long, and who can pay.",
  },
];

export interface ResearchNote {
  learned: string;
  confidence: string;
}

interface DiscoveryState {
  perspective: Perspective;
  setPerspective: (p: Perspective) => void;
  research: boolean;
  setResearch: (on: boolean) => void;
  notes: Record<string, ResearchNote>;
  setNote: (screen: string, note: ResearchNote) => void;
}

const Ctx = createContext<DiscoveryState | null>(null);

const NOTES_KEY = "kilo-research-notes";

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [perspective, setPerspective] = useState<Perspective>("customer");
  const [research, setResearch] = useState(false);
  const [notes, setNotes] = useState<Record<string, ResearchNote>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTES_KEY);
      if (raw) setNotes(JSON.parse(raw) as Record<string, ResearchNote>);
    } catch {
      /* empty notes are fine */
    }
  }, []);

  const setNote = (screen: string, note: ResearchNote) => {
    setNotes((prev) => {
      const next = { ...prev, [screen]: note };
      try {
        localStorage.setItem(NOTES_KEY, JSON.stringify(next));
      } catch {
        /* private mode */
      }
      return next;
    });
  };

  return (
    <Ctx.Provider value={{ perspective, setPerspective, research, setResearch, notes, setNote }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDiscovery() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDiscovery requires DiscoveryProvider");
  return ctx;
}
