import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { isTauri } from "./lib/platform";
import "./styles.css";

// Add platform class for CSS styling differences
if (isTauri) {
  document.documentElement.classList.add("tauri");
}

if (import.meta.env.PROD && !isTauri) {
  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://umami.ffinfra.com/script.js";
  script.dataset.websiteId = "897372a4-d0d0-42ad-8ce1-17a5d2968241";
  document.head.appendChild(script);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
