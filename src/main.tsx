import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { isTauri } from "./lib/platform";
import "./styles.css";

// Add platform class for CSS styling differences
if (isTauri) {
  document.documentElement.classList.add("tauri");
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
