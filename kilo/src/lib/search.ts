import { PATHWAYS, qLabel, qIndex } from "../data/pathways";
import type { Pathway } from "../data/types";
import { geographyById, isInGeography } from "./geo";

export type Flexibility = "Firm" | "Flexible" | "Mixed";
export type Reliability = "Standard" | "High" | "Mission Critical";

export interface SearchCriteria {
  mw: number;
  geographyId: string;
  requiredByIndex: number;
  flexibility: Flexibility;
  reliability: Reliability;
}

export const DEFAULT_CRITERIA: SearchCriteria = {
  mw: 100,
  geographyId: "east-coast",
  requiredByIndex: qIndex(2029, 2),
  flexibility: "Mixed",
  reliability: "Mission Critical",
};

export const QUARTER_OPTIONS = Array.from({ length: 16 }, (_, i) => {
  const index = qIndex(2028, 1) + i;
  return { index, label: qLabel(index) };
});

export interface Filters {
  minMw: number;
  maxEnergizationIndex: number;
  maxPrice: number;
  geographyId: string;
  reliability: Reliability | "Any";
  maxCarbon: number;
  minConfidence: number;
}

export function defaultFilters(c: SearchCriteria): Filters {
  return {
    minMw: 0,
    maxEnergizationIndex: qIndex(2031, 4),
    maxPrice: 120,
    geographyId: c.geographyId,
    reliability: "Any",
    maxCarbon: 600,
    minConfidence: 0,
  };
}

const RELIABILITY_RANK: Record<Reliability, number> = {
  Standard: 0,
  High: 1,
  "Mission Critical": 2,
};

export interface ScoredPathway {
  pathway: Pathway;
  rank: number;
  fit: number;
  meetsMw: boolean;
  meetsDate: boolean;
  meetsReliability: boolean;
  quartersLate: number;
  mwShortfall: number;
}

/**
 * Ranking blends the four things a buyer actually trades off: can you deliver the
 * megawatts, can you deliver them on time, what does it cost, and how sure are you.
 */
export function scorePathways(criteria: SearchCriteria): ScoredPathway[] {
  const prices = PATHWAYS.map((p) => (p.priceLow + p.priceHigh) / 2);
  const pMin = Math.min(...prices);
  const pMax = Math.max(...prices);

  return PATHWAYS.map((pathway) => {
    const quartersLate = Math.max(0, pathway.energizationQ - criteria.requiredByIndex);
    const mwShortfall = Math.max(0, criteria.mw - pathway.deliverableMw);

    const dateScore = quartersLate === 0 ? 1 : Math.max(0, 1 - quartersLate * 0.17);
    const mwScore = Math.min(1, pathway.deliverableMw / Math.max(1, criteria.mw));
    const mid = (pathway.priceLow + pathway.priceHigh) / 2;
    const priceScore = pMax === pMin ? 1 : 1 - (mid - pMin) / (pMax - pMin);
    const confScore = pathway.confidence / 100;
    const relScore =
      RELIABILITY_RANK[pathway.reliabilityTier] >= RELIABILITY_RANK[criteria.reliability] ? 1 : 0.62;

    const fit = Math.round(
      (dateScore * 0.3 + mwScore * 0.26 + confScore * 0.22 + priceScore * 0.14 + relScore * 0.08) * 100,
    );

    return {
      pathway,
      rank: 0,
      fit,
      meetsMw: mwShortfall === 0,
      meetsDate: quartersLate === 0,
      meetsReliability: RELIABILITY_RANK[pathway.reliabilityTier] >= RELIABILITY_RANK[criteria.reliability],
      quartersLate,
      mwShortfall,
    };
  })
    .sort((a, b) => b.fit - a.fit)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

export function applyFilters(scored: ScoredPathway[], f: Filters): ScoredPathway[] {
  const geo = geographyById(f.geographyId);
  return scored.filter(({ pathway: p }) => {
    if (p.deliverableMw < f.minMw) return false;
    if (p.energizationQ > f.maxEnergizationIndex) return false;
    if (p.priceLow > f.maxPrice) return false;
    if (!isInGeography(p.state, geo)) return false;
    if (f.reliability !== "Any" && RELIABILITY_RANK[p.reliabilityTier] < RELIABILITY_RANK[f.reliability])
      return false;
    if (p.carbonIntensity > f.maxCarbon) return false;
    if (p.confidence < f.minConfidence) return false;
    return true;
  });
}

export type SortKey = "fit" | "date" | "price" | "mw" | "confidence";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "fit", label: "Best match" },
  { value: "date", label: "Soonest" },
  { value: "price", label: "Cheapest" },
  { value: "mw", label: "Largest" },
  { value: "confidence", label: "Most certain" },
];

export function sortPathways(list: ScoredPathway[], key: SortKey): ScoredPathway[] {
  const copy = [...list];
  switch (key) {
    case "date":
      return copy.sort((a, b) => a.pathway.energizationQ - b.pathway.energizationQ);
    case "price":
      return copy.sort((a, b) => a.pathway.priceLow - b.pathway.priceLow);
    case "mw":
      return copy.sort((a, b) => b.pathway.deliverableMw - a.pathway.deliverableMw);
    case "confidence":
      return copy.sort((a, b) => b.pathway.confidence - a.pathway.confidence);
    default:
      return copy.sort((a, b) => b.fit - a.fit);
  }
}

export function criteriaSentence(c: SearchCriteria) {
  const geo = geographyById(c.geographyId);
  return `${c.mw} MW · ${geo.label} · by ${qLabel(c.requiredByIndex)} · ${c.flexibility} · ${c.reliability}`;
}
