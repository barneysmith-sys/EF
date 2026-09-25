import { useMemo, useState } from "react";
import { Button } from "./ui";
import { nextDecision, useProjects } from "../domain/store";

export default function ProjectsView({
  onOpenProject,
  onNewSearch,
}: {
  onOpenProject: (id: string) => void;
  onNewSearch: () => void;
}) {
  const { projects } = useProjects();
  const [phase, setPhase] = useState("All");
  const [utility, setUtility] = useState("All");
  const [geography, setGeography] = useState("All");
  const rows = useMemo(
    () =>
      projects.filter((project) => {
        if (phase !== "All" && project.phase !== phase) return false;
        if (utility !== "All" && project.utility !== utility) return false;
        if (geography !== "All" && project.geography !== geography) return false;
        return true;
      }),
    [projects, phase, utility, geography],
  );
  const phases = unique(projects.map((project) => project.phase));
  const utilities = unique(projects.map((project) => project.utility));
  const geographies = unique(projects.map((project) => project.geography));

  return (
    <div className="pageview">
      <div className="subbar">
        <div className="subbar-title">Portfolio</div>
        <div className="subbar-sub">Demo projects. Unsupported fields stay unknown.</div>
        <div className="subbar-spacer" />
        <span className="demo-chip">Demo</span>
        <Button size="sm" onClick={onNewSearch}>New search</Button>
      </div>
      <div className="page">
        <div className="page-inner">
          <div className="portfolio-tools">
            <select value={phase} onChange={(event) => setPhase(event.target.value)}>
              <option>All</option>
              {phases.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={utility} onChange={(event) => setUtility(event.target.value)}>
              <option>All</option>
              {utilities.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={geography} onChange={(event) => setGeography(event.target.value)}>
              <option>All</option>
              {geographies.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <table className="portfolio-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Requirement</th>
                <th>Geography</th>
                <th>Utility</th>
                <th>Target</th>
                <th>Phase</th>
                <th>Primary blocker</th>
                <th>Next decision</th>
                <th>Supported energization</th>
                <th>Last change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((project) => (
                <tr key={project.id}>
                  <td><button onClick={() => onOpenProject(project.id)}>{project.name}</button></td>
                  <td>{project.mw} MW</td>
                  <td>{project.geography}</td>
                  <td>{project.utility}</td>
                  <td>{project.target}</td>
                  <td>{project.phase}</td>
                  <td>Utility feasibility</td>
                  <td>{nextDecision(project).title}</td>
                  <td className="unknown">Unknown</td>
                  <td>{project.activity[0]?.label ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function unique(values: string[]) {
  return [...new Set(values)];
}
