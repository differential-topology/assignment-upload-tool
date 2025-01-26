/*
Diese Datei verwaltet Platzhalter-Links, die im Prototyp noch nicht implementiert sind.
*/

function showNotFunctionalMessage(event) {
  event.preventDefault();
  alert("Dieser Link ist im aktuellen Prototyp nicht funktionsfähig.");
}

/* Verknüpft Platzhalter-Links mit einer Hinweismeldung */
function initializeNotFunctionalLinks() {
  const notFunctionalLinks = [
    ".forgot-password",
    ".login-links p a",
    "[data-i18n='solution_link']",
    ".not-implemented-link",
  ];
  notFunctionalLinks.forEach((selector) => {
    const links = document.querySelectorAll(selector);
    links.forEach((link) => {
      link.addEventListener("click", showNotFunctionalMessage);
    });
  });
}

document.addEventListener("DOMContentLoaded", initializeNotFunctionalLinks);
