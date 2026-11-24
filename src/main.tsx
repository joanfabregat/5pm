import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { isTauri } from "./lib/platform";
import "./styles.css";

// Add platform class for CSS styling differences
if (isTauri) {
  document.documentElement.classList.add("tauri");

  if (import.meta.env.PROD) {
    const pixel = new Image(1, 1);
    pixel.alt = "";
    pixel.hidden = true;
    pixel.referrerPolicy = "no-referrer";
    // Ensure each launch reaches Umami instead of the WebView's image cache.
    pixel.src = `https://umami.ffinfra.com/p/AGbhDKfG6?t=${Date.now()}`;
    document.body.appendChild(pixel);
  }
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
