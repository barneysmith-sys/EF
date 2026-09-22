import { useCallback, useEffect, useState } from "react";
import Landing from "./components/Landing";
import SearchView from "./components/SearchView";
import PathwayDetail from "./components/PathwayDetail";
import RequestFlow from "./components/RequestFlow";
import ProjectsView from "./components/ProjectsView";
import MarketView from "./components/MarketView";
import RequestsView from "./components/RequestsView";
import { Wordmark } from "./components/ui";
import { DEFAULT_CRITERIA, defaultFilters, type Filters, type SearchCriteria } from "./lib/search";
import { PORTFOLIO_TOTAL_MW, PROJECTS, REQUESTS } from "./data/portfolio";

export type Route =
  | { name: "landing" }
  | { name: "search" }
  | { name: "pathway"; id: string }
  | { name: "request"; pathwayId: string }
  | { name: "projects" }
  | { name: "market" }
  | { name: "requests" };

const NAV: { key: Route["name"]; label: string; badge?: string }[] = [
  { key: "search", label: "Search" },
  { key: "projects", label: "Projects", badge: String(PROJECTS.length) },
  { key: "market", label: "Market" },
  { key: "requests", label: "Requests", badge: String(REQUESTS.filter((r) => r.status !== "Closed").length) },
];

export default function App() {
  const [route, setRoute] = useState<Route>({ name: "landing" });
  const [criteria, setCriteria] = useState<SearchCriteria>(DEFAULT_CRITERIA);
  const [filters, setFilters] = useState<Filters>(() => defaultFilters(DEFAULT_CRITERIA));
  const [searching, setSearching] = useState(false);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const updateCriteria = useCallback((next: Partial<SearchCriteria>) => {
    setCriteria((c) => ({ ...c, ...next }));
  }, []);

  const runSearch = useCallback(() => {
    setSearching(true);
    // Deliberate latency — the search reads as work being done, not a filter toggle.
    setTimeout(() => {
      setFilters(defaultFilters(criteria));
      setSearching(false);
      setRoute({ name: "search" });
    }, 1150);
  }, [criteria]);

  const navTo = (name: Route["name"]) => {
    if (name === "search") setRoute({ name: "search" });
    else setRoute({ name } as Route);
  };

  if (route.name === "landing") {
    return (
      <Landing
        criteria={criteria}
        onChange={updateCriteria}
        onSearch={runSearch}
        searching={searching}
      />
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-brand">
          <button onClick={() => setRoute({ name: "landing" })} aria-label="Kilo home">
            <Wordmark size={17} />
          </button>
        </div>

        <nav className="topbar-nav">
          {NAV.map((n) => {
            const active =
              route.name === n.key ||
              (n.key === "search" && (route.name === "pathway" || route.name === "request"));
            return (
              <button
                key={n.key}
                className={`navitem${active ? " active" : ""}`}
                onClick={() => navTo(n.key)}
              >
                {n.label}
                {n.badge && <span className="navitem-badge">{n.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="topbar-spacer" />

        <div className="topbar-right">
          <div className="topbar-meta">
            <span className="live-dot" />
            <span>MARKET DATA LIVE</span>
          </div>
          <span className="topbar-sep" />
          <div className="topbar-meta">
            <span>{PORTFOLIO_TOTAL_MW} MW UNDER EVALUATION</span>
          </div>
          <span className="topbar-sep" />
          <div className="topbar-meta">
            <span>
              {clock.toLocaleTimeString("en-US", { hour12: false })} ET
            </span>
          </div>
          <span className="demo-chip">Demo</span>
          <div className="avatar">MF</div>
        </div>
      </header>

      <div className="app-body" key={route.name + ("id" in route ? route.id : "")}>
        {route.name === "search" && (
          <SearchView
            criteria={criteria}
            filters={filters}
            onFilterChange={(next) => setFilters((f) => ({ ...f, ...next }))}
            onFilterReset={() => setFilters(defaultFilters(criteria))}
            onOpenPathway={(id) => setRoute({ name: "pathway", id })}
            onEditSearch={() => setRoute({ name: "landing" })}
          />
        )}

        {route.name === "pathway" && (
          <PathwayDetail
            id={route.id}
            criteria={criteria}
            onBack={() => setRoute({ name: "search" })}
            onRequestCapacity={() => setRoute({ name: "request", pathwayId: route.id })}
          />
        )}

        {route.name === "request" && (
          <RequestFlow
            pathwayId={route.pathwayId}
            criteria={criteria}
            onBack={() => setRoute({ name: "pathway", id: route.pathwayId })}
            onDone={() => setRoute({ name: "projects" })}
          />
        )}

        {route.name === "projects" && (
          <ProjectsView
            onOpenPathway={(id) => setRoute({ name: "pathway", id })}
            onNewSearch={() => setRoute({ name: "landing" })}
          />
        )}

        {route.name === "market" && <MarketView onSearch={() => setRoute({ name: "landing" })} />}

        {route.name === "requests" && (
          <RequestsView
            onOpenPathway={(id) => setRoute({ name: "pathway", id })}
            onOpenRequest={(pathwayId) => setRoute({ name: "request", pathwayId })}
          />
        )}
      </div>
    </div>
  );
}
