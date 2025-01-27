/*
Diese Datei implementiert die Dark Mode Funktionalität mit Toast-Benachrichtigung und Icon-Anpassungen.
*/

import { showToast, resetToast } from "/assets/js/components/toast.js";

const darkModeToggle = document.getElementById("darkModeToggle");
const modeLabel = document.getElementById("modeLabel");

if (darkModeToggle) {
  darkModeToggle.addEventListener("change", () => {
    const icons = document.querySelectorAll(".fas, .toggle-password i");
    if (darkModeToggle.checked) {
      document.body.classList.add("dark-mode");
      if (modeLabel) modeLabel.textContent = "🌙 Dark Mode";
      icons.forEach((icon) => {
        icon.style.color = "#fff";
      });

      showToast(
        "Dark Mode ist in diesem Prototyp nur auf der aktuellen Seite verfügbar"
      );
    } else {
      document.body.classList.remove("dark-mode");
      if (modeLabel) modeLabel.textContent = "☀️ Light Mode";
      icons.forEach((icon) => {
        icon.style.color = "";
      });
    }
  });
}

window.addEventListener("beforeunload", () => resetToast());
