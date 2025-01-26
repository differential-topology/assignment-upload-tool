/*
Diese Datei stellt Hilfsfunktionen zur Seitenverwaltung und URL-basierten Initialisierung bereit.
*/

import { setCurrentPage } from "./system-prompt-config.js";

/* Ermittelt den Seitennamen aus der URL */
export function getCurrentPage() {
  return location.pathname.split("/").pop().replace(".html", "");
}
/* Automatische Seiteninitialisierung beim Laden des Skripts */
function initializePageAutomatically() {
  const pageName = getCurrentPage();
  if (pageName) {
    setCurrentPage(pageName);
  }
}

initializePageAutomatically();
