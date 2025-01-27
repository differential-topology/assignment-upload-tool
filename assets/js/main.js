/*
Diese Datei ist der zentrale Einstiegspunkt der Anwendung und koordiniert das Laden aller Module sowie die Initialisierung der Hauptkomponenten.
*/

/* Grundlegende Utilities und Komponenten */
import "/assets/js/utils/i18n.js";
import "/assets/js/utils/language-switch.js";
import "/assets/js/utils/dark-mode.js";
import "/assets/js/components/password-toggle.js";
import "/assets/js/components/not-implemented-links.js";
import "/assets/js/components/assignment-timer.js";
import "/assets/js/components/robot.js";
import "/assets/js/components/login.js";
import "/assets/js/components/table-sort-not-functional.js";

/* Seitenspezifische Funktionalitäten */
import "/assets/js/pages/dashboard.js";
import "/assets/js/pages/pdf-editor.js";
import "/assets/js/pages/upload-assignment.js";

/* Chat und Fortschrittsanzeigen */
import "/assets/js/components/chat.js";
import "/assets/js/components/progress-tooltips.js";

/* Basis-Layout und Navigation */
import { setGlobalSidebarContainer } from "/assets/js/utils/global-state.js";
import { setupHeaderJS } from "/assets/js/base/header.js";
import { setupSidebarJS } from "/assets/js/base/sidebar.js";
import { getCurrentPage } from "/assets/js/utils/page-utils.js";

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
