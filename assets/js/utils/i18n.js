/*
Diese Datei implementiert die Internationalisierung (i18n) mit dynamischem Nachladen von Sprachdateien.
*/

export function loadTranslations(language) {
  const languageFilePath = `assets/translations/${language}.json`;

  fetch(languageFilePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Translation file not found: ${languageFilePath}`);
      }
      return response.json();
    })
    .then((translations) => {
      /* Aktualisiert Text, Platzhalter und Attribute aller i18n-markierten Elemente */
      document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.getAttribute("data-i18n");
        if (translations[key]) {
          element.textContent = translations[key];
        }
      });

      document
        .querySelectorAll("[data-i18n-placeholder]")
        .forEach((element) => {
          const key = element.getAttribute("data-i18n-placeholder");
          if (translations[key]) {
            element.placeholder = translations[key];
          }
        });

      document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
        const key = element.getAttribute("data-i18n-alt");
        if (translations[key]) {
          element.alt = translations[key];
        }
      });

      document.querySelectorAll("[data-i18n-title]").forEach((element) => {
        const key = element.getAttribute("data-i18n-title");
        if (translations[key]) {
          element.title = translations[key];
        }
      });
    })
    .catch((error) => {
      /* Bei Fehler Fallback auf Deutsch */

      if (language !== "de") {
        loadTranslations("de");
      }
    });
}
