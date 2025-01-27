/*
Diese Datei implementiert die Sprachauswahl mit Browsersprachen-Erkennung und LocalStorage-Persistenz.
*/
import { loadTranslations } from "assets/js/utils/i18n.js";

/* Initialisierung mit Fallback auf Browsersprache oder Deutsch */
document.addEventListener("DOMContentLoaded", () => {
  const languageSelector = document.getElementById("language");

  const defaultLanguage = "de";

  let savedLanguage = localStorage.getItem("language");

  if (!savedLanguage) {
    const userLanguage = navigator.language.slice(0, 2);
    savedLanguage = ["de", "en"].includes(userLanguage)
      ? userLanguage
      : defaultLanguage;

    localStorage.setItem("language", savedLanguage);
  }

  loadTranslations(savedLanguage);

  if (languageSelector) {
    languageSelector.value = savedLanguage;

    languageSelector.addEventListener("change", (event) => {
      const selectedLanguage = event.target.value;
      localStorage.setItem("language", selectedLanguage);
      loadTranslations(selectedLanguage);
    });
  }
});
