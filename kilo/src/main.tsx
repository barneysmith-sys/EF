import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ProjectProvider } from "./domain/store";

import "./styles/tokens.css";
import "./styles/shell.css";
import "./styles/map.css";
import "./styles/landing.css";
import "./styles/opening.css";
import "./styles/search.css";
import "./styles/detail.css";
import "./styles/request.css";
import "./styles/pages.css";
import "./styles/live.css";
import "./styles/discovery.css";
import "./styles/atlas.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProjectProvider>
      <App />
    </ProjectProvider>
  </StrictMode>,
);
