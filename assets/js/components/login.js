/*
Diese Datei implementiert die Login/Logout-Logik und die rollenbasierte Benutzerauthentifizierung.
*/

import { setUserRole, setUsername } from "../utils/system-prompt-config.js";

/* Verarbeitet Login-Formular und setzt Benutzerrolle */
function initializeLoginForm() {
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const usernameValue = document
        .getElementById("username")
        .value.trim()
        .toLowerCase();
      /* Einfache Rollenzuweisung: "tutor" = Tutor, alle anderen = Student */
      if (usernameValue === "tutor") {
        localStorage.setItem("userRole", "tutor");
      } else {
        localStorage.setItem("userRole", "student");
      }

      setUserRole(localStorage.getItem("userRole"));
      setUsername(usernameValue);

      window.location.href = "dashboard.html";
    });
  }
}

/* Bereinigt beim Logout alle benutzerspezifischen Daten */
function initializeLogoutButton() {
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();

      localStorage.removeItem("notificationTimestamps");
      localStorage.removeItem("openNotifications");
      localStorage.removeItem("assignment11SubmittedFiles");
      localStorage.removeItem("assignment11Uploaded");
      localStorage.removeItem("analysis10CorrectionDone");
      localStorage.removeItem("prevBadgeCount");
      localStorage.removeItem("sessionNotificationsInitialized");

      localStorage.removeItem("lastCorrectionProgressSegments");

      localStorage.removeItem("userRole");

      window.location.href = "index.html";
    });
  }
}

initializeLoginForm();
initializeLogoutButton();
