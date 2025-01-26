/*
Diese Datei stellt Platzhalter-Funktionalität für die noch nicht implementierte Tabellensortierung bereit.
*/

document.addEventListener("DOMContentLoaded", function () {
  const sortButtons = document.querySelectorAll(".sort-btn");

  function showSortNotFunctionalMessage(event) {
    event.preventDefault();
    alert(
      "Die Tabellensortierung ist im aktuellen Prototyp nicht funktionsfähig."
    );
  }

  sortButtons.forEach((button) => {
    button.addEventListener("click", showSortNotFunctionalMessage);
  });
});
