/** What Kilo is willing to say about a fact, and why. */

export type EvidenceStatus =
  | "VERIFIED"
  | "PUBLIC_DATA"
  | "REPORTED"
  | "USER_SUPPLIED"
  | "MODELED"
  | "INFERRED"
  | "UNKNOWN";

export interface Evidence {
  value: string;
  unit?: string;
  evidenceStatus: EvidenceStatus;
  sourceName: string;
  sourceUrl?: string;
  sourceDate?: string;
  retrievedAt?: string;
  geographicScope: string;
  methodology?: string;
  notes: string;
}

export type ReadinessMark = "verified" | "missing" | "blocking";

export interface ReadinessItem {
  label: string;
  mark: ReadinessMark;
}

export type ReadinessState = "VERIFIED" | "MISSING" | "BLOCKING";

export function readinessState(items: ReadinessItem[]): ReadinessState {
  if (items.length === 0) return "MISSING";
  if (items.some((item) => item.mark === "blocking")) return "BLOCKING";
  if (items.every((item) => item.mark === "verified")) return "VERIFIED";
  return "MISSING";
}

/** A live feed never becomes a demo number. Missing data stays unavailable. */
export type FeedState = "LIVE" | "DEMO" | "UNAVAILABLE";

export function feedState(input: { live: boolean; demo: boolean }): FeedState {
  if (input.live) return "LIVE";
  if (input.demo) return "DEMO";
  return "UNAVAILABLE";
}
