import { useEffect, useMemo, useRef, useState } from "react";
import UsMap from "./UsMap";
import FilterRail from "./FilterRail";
import ResultCard from "./ResultCard";
import { Segmented } from "./ui";
import { LiveReference } from "./LiveTape";
import { PERSPECTIVES, useDiscovery } from "./DiscoveryContext";
import { geographyById, type Geography } from "../lib/geo";
import { qLabel } from "../data/pathways";
import {
  applyFilters,
  scorePathways,
  sortPathways,
  SORT_OPTIONS,
  type Filters,
  type SearchCriteria,
  type SortKey,
} from "../lib/search";

interface Props {
  criteria: SearchCriteria;
  filters: Filters;
  onFilterChange: (next: Partial<Filters>) => void;
  onFilterReset: () => void;
  onOpenPathway: (id: string) => void;
  onEditSearch: () => void;
}

export default function SearchView({
  criteria,
  filters,
  onFilterChange,
  onFilterReset,
  onOpenPathway,
  onEditSearch,
}: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { perspective } = useDiscovery();
  const view = PERSPECTIVES.find((p) => p.id === perspective) ?? PERSPECTIVES[0];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("fit");
  const listRef = useRef<HTMLDivElement>(null);

  const scored = useMemo(() => scorePathways(criteria), [criteria]);
  const filtered = useMemo(() => applyFilters(scored, filters), [scored, filters]);
  const results = useMemo(() => sortPathways(filtered, sort), [filtered, sort]);

  // Pathways that clear every filter except geography. Surfacing them separately keeps
  // the search honest: the best answer is sometimes outside the box the buyer drew.
  const nearby = useMemo(() => {
    const anyGeo = applyFilters(scored, { ...filters, geographyId: "national" });
    const inScope = new Set(filtered.map((r) => r.pathway.id));
    return sortPathways(
      anyGeo.filter((r) => !inScope.has(r.pathway.id)),
      sort,
    );
  }, [scored, filters, filtered, sort]);

  const geo: Geography = geographyById(filters.geographyId);

  useEffect(() => {
    if (results.length && !results.some((r) => r.pathway.id === selectedId)) {
      setSelectedId(results[0].pathway.id);
    }
  }, [results, selectedId]);

  // Selecting on the map scrolls the matching card into view.
  const selectAndReveal = (id: string) => {
    setSelectedId(id);
    const el = listRef.current?.querySelector(`[data-card="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const totalAvailable = results.reduce((s, r) => s + r.pathway.deliverableMw, 0);
  const onTime = results.filter((r) => r.meetsDate).length;

  return (
    <div className="searchview">
      <div className="subbar">
        <button className="backlink" onClick={onEditSearch}>
          ← Edit search
        </button>
        <div className="crit">
          <span className="crit-item num">{criteria.mw} MW</span>
          <span className="crit-sep" />
          <span className="crit-item">{geographyById(criteria.geographyId).label}</span>
          <span className="crit-sep" />
          <span className="crit-item num">by {qLabel(criteria.requiredByIndex)}</span>
          <span className="crit-sep" />
          <span className="crit-item muted">{criteria.flexibility}</span>
          <span className="crit-sep" />
          <span className="crit-item muted">{criteria.reliability}</span>
        </div>
        <div className="subbar-spacer" />
        <div className="subbar-stats mono">
          <span>
            <b className="num">{results.length}</b> pathways
          </span>
          <span className="topbar-sep" />
          <span>
            <b className="num">{totalAvailable}</b> MW available
          </span>
          <span className="topbar-sep" />
          <span>
            <b className="num">{onTime}</b> meet the date
          </span>
        </div>
        <span className="demo-chip">Demo data</span>
      </div>

      <LiveReference />

      <div className="searchbody">
        <FilterRail
          filters={filters}
          onChange={onFilterChange}
          onReset={onFilterReset}
          shown={results.length}
          total={scored.length}
        />

        <div className="mapcol">
          <UsMap
            pathways={[...results, ...nearby].map((r) => ({ ...r.pathway, rank: r.rank }))}
            geography={geo}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={selectAndReveal}
            onHover={setHoveredId}
            mutedIds={nearby.map((r) => r.pathway.id)}
          />
        </div>

        <div className="resultscol">
          <div className="results-head">
            <div>
              <div className="mlabel">Power pathways</div>
              <div className="results-count">
                <span className="num">{results.length}</span> in {geo.label}
                {nearby.length > 0 && (
                  <span className="results-count-extra">
                    {" "}
                    · <span className="num">{nearby.length}</span> outside
                  </span>
                )}
              </div>
              <p className="results-question">
                {view.label} view — {view.question}
              </p>
            </div>
            <Segmented size="sm" options={SORT_OPTIONS} value={sort} onChange={setSort} />
          </div>

          <div className="results-list" ref={listRef}>
            {results.length === 0 && (
              <div className="empty">
                No pathways match these filters.
                <br />
                <button className="rail-reset" onClick={onFilterReset}>
                  Reset filters
                </button>
              </div>
            )}
            {results.map((r) => (
              <div key={r.pathway.id} data-card={r.pathway.id}>
                <ResultCard
                  scored={r}
                  selected={selectedId === r.pathway.id}
                  onHover={setHoveredId}
                  onSelect={setSelectedId}
                  onOpen={onOpenPathway}
                />
              </div>
            ))}

            {nearby.length > 0 && (
              <>
                <div className="results-divider">
                  <div className="results-divider-line" />
                  <div className="results-divider-text">
                    <span className="mlabel">Outside {geo.label}</span>
                    <span>
                      {nearby.length} pathway{nearby.length > 1 ? "s" : ""} that meet every other
                      criterion. Worth seeing — the cheapest and fastest megawatts are often not
                      where the search began.
                    </span>
                  </div>
                </div>
                {nearby.map((r) => (
                  <div key={r.pathway.id} data-card={r.pathway.id} className="rcard-outside">
                    <ResultCard
                      scored={r}
                      selected={selectedId === r.pathway.id}
                      onHover={setHoveredId}
                      onSelect={setSelectedId}
                      onOpen={onOpenPathway}
                    />
                  </div>
                ))}
              </>
            )}

            <div className="results-foot">
              <span className="demo-chip">Demo data</span>
              <p>
                Results are generated for demonstration. Deliverable capacity, energization dates,
                pricing and utility positions are illustrative and have not been verified with any
                utility, market operator or landowner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
