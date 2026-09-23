import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
