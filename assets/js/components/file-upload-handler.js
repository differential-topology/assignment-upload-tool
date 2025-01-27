/*
Diese Datei steuert die Verarbeitung hochgeladener Dateien und deren Validierung im Upload-Dialog.
*/

import { removeFile } from "assets/js/components/file-remove.js";

/* Hauptfunktion für die Dateiannahme und Tabellenaktualisierung */

export function handleFiles(files) {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  const maxFileSize = 5 * 1024 * 1024;

  const fileTable = document.getElementById("fileTable");
  const fileList = document.getElementById("fileList");
  const submitButton = document.getElementById("submitButton");

  if (!fileTable || !fileList || !submitButton) return;
  /* Prüft jede Datei auf Typ und Größe, erstellt bei Validität einen Tabelleneintrag */
  let validFileAdded = false;

  Array.from(files).forEach((file) => {
    if (!allowedTypes.includes(file.type)) {
      alert(
        `Dateityp "${file.type}" nicht erlaubt. Erlaubt sind: PDF, DOCX und TXT.`
      );
      return;
    }

    if (file.size > maxFileSize) {
      alert(`Datei "${file.name}" überschreitet die maximale Größe von 5 MB.`);
      return;
    }

    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = file.name;

    const sizeCell = document.createElement("td");
    sizeCell.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;

    const statusCell = document.createElement("td");
    statusCell.textContent = "Bereit";

    const actionCell = document.createElement("td");
    actionCell.classList.add("action");
    const removeLink = document.createElement("a");
    removeLink.textContent = "Entfernen";
    removeLink.href = "#";
    removeLink.addEventListener("click", (e) => {
      e.preventDefault();
      removeFile(file.name, row);
    });
    actionCell.appendChild(removeLink);

    row.appendChild(nameCell);
    row.appendChild(sizeCell);
    row.appendChild(statusCell);
    row.appendChild(actionCell);
    fileList.appendChild(row);

    validFileAdded = true;
  });

  if (validFileAdded) {
    fileTable.style.display = "table";
    submitButton.style.display = "block";
  } else if (!fileList.children.length) {
    fileTable.style.display = "none";
    submitButton.style.display = "none";
  }

  checkSubmitButtonVisibility();
}

export function checkSubmitButtonVisibility() {
  const fileList = document.getElementById("fileList");
  const submitButton = document.getElementById("submitButton");
  if (!fileList || !submitButton) return;

  const rows = fileList.querySelectorAll("tr");
  let hasPending = false;

  rows.forEach((row) => {
    const status = row.children[2].textContent.trim();
    if (status !== "Eingereicht") {
      hasPending = true;
    }
  });

  if (hasPending) {
    submitButton.style.display = "block";
  } else {
    submitButton.style.display = "none";
  }
}
