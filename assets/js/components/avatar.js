/*
Diese Datei steuert das Avatar-Popup mit Benutzermenü und Logout-Funktionalität.
*/

import { resetSystemPromptVariables } from "/assets/js/utils/system-prompt-config.js";

export function initializeAvatarPopup() {
  const avatarIcon = document.getElementById("avatarIcon");
  const avatarPopup = document.getElementById("avatarPopup");
  const logoutButton = document.getElementById("logoutButton");
  const editProfile = document.getElementById("editProfile");
  const helpButton = document.getElementById("help");

  if (avatarIcon && avatarPopup) {
    avatarIcon.addEventListener("click", (event) => {
      event.stopPropagation();
      avatarPopup.classList.toggle("show");
    });

    /* Schließt Popup bei Klick außerhalb */
    document.addEventListener("click", (event) => {
      if (!avatarPopup.contains(event.target) && event.target !== avatarIcon) {
        avatarPopup.classList.remove("show");
      }
    });

    /* Logout-Funktion mit Zurücksetzen aller Benutzerdaten */
    if (logoutButton) {
      logoutButton.addEventListener("click", (event) => {
        event.preventDefault();

        localStorage.removeItem("assignment11Uploaded");
        localStorage.removeItem("assignment11SubmittedFiles");
        localStorage.removeItem("analysis10CorrectionDone");
        localStorage.removeItem("closedNotifications");
        localStorage.removeItem("openNotifications");
        localStorage.removeItem("sessionNotificationsInitialized");

        localStorage.removeItem("lastOverallProgressSegments");
        localStorage.removeItem("lastCorrectionProgressSegments");

        localStorage.removeItem("newOverallData");
        localStorage.removeItem("overallProgressUpdateDone");

        localStorage.setItem("resetChatOnNextLoad", "true");

        resetSystemPromptVariables();

        window.location.href = "index.html";
      });
    }
  }
}
