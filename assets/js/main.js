/*
Diese Datei ist der zentrale Einstiegspunkt der Anwendung und koordiniert das Laden aller Module sowie die Initialisierung der Hauptkomponenten.
*/

/* Grundlegende Utilities und Komponenten */
import "./utils/i18n.js";
import "./utils/language-switch.js";
import "./utils/dark-mode.js";
import "./components/password-toggle.js";
import "./components/not-implemented-links.js";
import "./components/assignment-timer.js";
import "./components/robot.js";
import "./components/login.js";
import "./components/table-sort-not-functional.js";

/* Seitenspezifische Funktionalitäten */
import "./pages/dashboard.js";
import "./pages/pdf-editor.js";
import "./pages/upload-assignment.js";

/* Chat und Fortschrittsanzeigen */
import "./components/chat.js";
import "./components/progress-tooltips.js";

/* Basis-Layout und Navigation */
import { setGlobalSidebarContainer } from "./utils/global-state.js";
import { setupHeaderJS } from "./base/header.js";
import { setupSidebarJS } from "./base/sidebar.js";
import { getCurrentPage } from "./utils/page-utils.js";

/* Seitenladelogik zur Vermeidung von FOUC */
document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("dom-loading");

  const sidebar = document.getElementById("sidebar");
  setGlobalSidebarContainer(sidebar);

  setupHeaderJS();
  setupSidebarJS();

  const currentPage = getCurrentPage();
});

window.addEventListener("load", () => {
  document.body.classList.remove("dom-loading");
});
