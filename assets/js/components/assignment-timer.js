/*
Diese Datei implementiert einen Countdown-Timer für Abgabefristen mit automatischer Aktualisierung und Formatierung.
*/

/* Formatiert die Zeitangabe in lesbare Form mit korrekten Pluralendungen */
function formatRemainingTime(days, hours, minutes, seconds) {
  const parts = [];
  if (days > 0) parts.push(`${days} Tag${days === 1 ? "" : "e"}`);
  if (hours > 0) parts.push(`${hours} Stunde${hours === 1 ? "" : "n"}`);
  if (minutes > 0) parts.push(`${minutes} Minute${minutes === 1 ? "" : "n"}`);

  parts.push(`${seconds} Sekunde${seconds === 1 ? "" : "n"}`);

  return parts.join(", ");
}
/* Hauptfunktion für die Berechnung und Anzeige der Restzeit */

function displayRemainingTime() {
  const deadline = new Date(2025, 0, 29, 23, 59);
  const now = new Date();
  const remainingTimeEl = document.getElementById("remainingTime");

  if (!remainingTimeEl) return;

  const diffMs = deadline - now;

  if (diffMs <= 0) {
    remainingTimeEl.textContent = "Die Abgabefrist ist abgelaufen.";
    return;
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const diffSeconds = Math.floor((diffMs / 1000) % 60);

  remainingTimeEl.textContent = `Verbleibende Zeit: ${formatRemainingTime(
    diffDays,
    diffHours,
    diffMinutes,
    diffSeconds
  )}`;
}

document.addEventListener("DOMContentLoaded", function () {
  displayRemainingTime();

  setInterval(displayRemainingTime, 1000);
});
