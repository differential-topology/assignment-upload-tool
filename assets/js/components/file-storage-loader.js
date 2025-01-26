/*
Diese Datei ist für das Laden und Wiederherstellen von zwischengespeicherten Dateien aus dem LocalStorage zuständig.
*/

import { removeFile } from "./file-remove.js";

/* Lädt gespeicherte Dateien in die Tabelle und fügt Entfernen-Funktionalität hinzu */
export function loadSubmittedFiles() {
  const fileTable = document.getElementById("fileTable");
  const fileList = document.getElementById("fileList");
  if (!fileList) return;

  const savedFilesJson = localStorage.getItem("assignment11SubmittedFiles");
  if (!savedFilesJson) return;

  const savedFiles = JSON.parse(savedFilesJson);
  if (!savedFiles || !Array.isArray(savedFiles)) return;
  /* Rekonstruiert die Tabelle aus den gespeicherten Dateien */
  savedFiles.forEach((fileObj) => {
    const row = document.createElement("tr");
    row.dataset.fileName = fileObj.name;

    const nameCell = document.createElement("td");
    nameCell.textContent = fileObj.name;

    const sizeCell = document.createElement("td");
    sizeCell.textContent = fileObj.size;

    const statusCell = document.createElement("td");
    statusCell.textContent = "Eingereicht";

    const actionCell = document.createElement("td");
    actionCell.classList.add("action");
    const removeLink = document.createElement("a");
    removeLink.textContent = "Entfernen";
    removeLink.href = "#";
    removeLink.addEventListener("click", (e) => {
      e.preventDefault();
      removeFile(fileObj.name, row);
    });
    actionCell.appendChild(removeLink);

    row.appendChild(nameCell);
    row.appendChild(sizeCell);
    row.appendChild(statusCell);
    row.appendChild(actionCell);
    fileList.appendChild(row);
  });

  if (fileTable && fileList.children.length > 0) {
    fileTable.style.display = "table";
  }
}
