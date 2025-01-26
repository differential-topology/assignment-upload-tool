/*
Diese Datei implementiert ein einfaches Toast-Benachrichtigungssystem mit automatischem Ausblenden.
*/

/* Verhindert mehrfache Toast-Anzeigen gleichzeitig */
let toastDisplayed = false;

export function showToast(message) {
  if (toastDisplayed) return;

  toastDisplayed = true;
  const toast = document.createElement("div");
  toast.className = "toast show";
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

export function resetToast() {
  toastDisplayed = false;
}
