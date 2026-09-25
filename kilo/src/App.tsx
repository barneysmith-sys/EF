import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
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
import { useLiveBoard } from "./components/LiveTape";
import { DiscoveryProvider, PERSPECTIVES, useDiscovery } from "./components/DiscoveryContext";
import ResearchPanel from "./components/ResearchPanel";
import ResearchDesk from "./components/ResearchDesk";
import AtlasWorkspace from "./components/atlas/AtlasWorkspace";
import { track } from "./lib/analytics";
import type { AtlasSection } from "./domain/types";

export type Route =
  | { name: "landing" }
  | { name: "search" }
  | { name: "pathway"; id: string }
  | { name: "request"; pathwayId: string }
  | { name: "projects" }
  | { name: "project"; id: string; section: AtlasSection }
  | { name: "market" }
  | { name: "requests" }
  | { name: "research" };

const NAV: { key: Route["name"]; label: string; badge?: string }[] = [
  { key: "search", label: "Search" },
  { key: "projects", label: "Portfolio", badge: String(PROJECTS.length) },
  { key: "market", label: "Intelligence" },
  { key: "requests", label: "Requests", badge: String(REQUESTS.filter((r) => r.status !== "Closed").length) },
];

export default function App() {
  const [route, setRoute] = useState<Route>({ name: "landing" });
  const [criteria, setCriteria] = useState<SearchCriteria>(DEFAULT_CRITERIA);
  const [filters, setFilters] = useState<Filters>(() => defaultFilters(DEFAULT_CRITERIA));
  const [searching, setSearching] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const { board: live } = useLiveBoard();

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
      track("search submitted");
      setRoute({ name: "search" });
    }, 1150);
  }, [criteria]);

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
    <DiscoveryProvider>
      <AppChrome
        route={route}
        setRoute={setRoute}
        criteria={criteria}
        filters={filters}
        setFilters={setFilters}
        clock={clock}
        live={live}
      />
    </DiscoveryProvider>
  );
}

function AppChrome({
  route,
  setRoute,
  criteria,
  filters,
  setFilters,
  clock,
  live,
}: {
  route: Route;
  setRoute: (route: Route) => void;
  criteria: SearchCriteria;
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  clock: Date;
  live: ReturnType<typeof useLiveBoard>["board"];
}) {
  const { perspective, setPerspective, research } = useDiscovery();
  const screen =
    route.name === "pathway" || route.name === "request" || route.name === "market" ? route.name : "search";

  const navTo = (name: Route["name"]) => {
    if (name === "search") setRoute({ name: "search" });
    else setRoute({ name } as Route);
  };

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
              (n.key === "projects" && route.name === "project") ||
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
          <div className="persp" role="group" aria-label="Demo perspective">
            {PERSPECTIVES.map((p) => (
              <button
                key={p.id}
                className={perspective === p.id ? "active" : ""}
                onClick={() => setPerspective(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            className={`research-toggle${research ? " on" : ""}`}
            onClick={() => setRoute({ name: "research" })}
          >
            Research
          </button>
          <div className="topbar-meta" title={live?.miso?.asOf ?? "MISO public API"}>
            <span className={`live-dot${live?.miso ? "" : " idle"}`} />
            <span>
              {live?.miso
                ? `MISO $${live.miso.marginalEnergy.toFixed(2)}`
                : live
                  ? "MISO OFFLINE"
                  : "READING MISO"}
            </span>
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
            onOpenPathway={(id) => {
              track("pathway opened", id);
              setRoute({ name: "pathway", id });
            }}
            onEditSearch={() => setRoute({ name: "landing" })}
          />
        )}

        {route.name === "pathway" && (
          <PathwayDetail
            id={route.id}
            criteria={criteria}
            onBack={() => setRoute({ name: "search" })}
            onRequestCapacity={() => setRoute({ name: "request", pathwayId: route.id })}
            onOpenProject={(id) => setRoute({ name: "project", id, section: "overview" })}
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
            onOpenProject={(id) => setRoute({ name: "project", id, section: "overview" })}
            onNewSearch={() => setRoute({ name: "landing" })}
          />
        )}

        {route.name === "project" && (
          <AtlasWorkspace
            projectId={route.id}
            section={route.section}
            onSection={(section) => setRoute({ name: "project", id: route.id, section })}
            onClose={() => setRoute({ name: "projects" })}
          />
        )}

        {route.name === "market" && <MarketView onSearch={() => setRoute({ name: "landing" })} />}

        {route.name === "research" && <ResearchDesk onBack={() => setRoute({ name: "search" })} />}

        {route.name === "requests" && (
          <RequestsView
            onOpenPathway={(id) => setRoute({ name: "pathway", id })}
            onOpenRequest={(pathwayId) => setRoute({ name: "request", pathwayId })}
          />
        )}
      </div>
      <ResearchPanel screen={screen} />
    </div>
  );
}
