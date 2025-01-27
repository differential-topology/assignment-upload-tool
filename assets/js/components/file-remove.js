/*
Diese Datei verwaltet das Entfernen von hochgeladenen Dateien, einschließlich UI-Updates und LocalStorage-Bereinigung.
*/

import { checkSubmitButtonVisibility } from "assets/js/components/file-upload-handler.js";
import { globalSidebarContainer } from "assets/js/utils/global-state.js";
import {
  updateNotificationDisplay,
  getOpenNotifications,
  setOpenNotifications,
  removeNotificationTimestamp,
} from "assets/js/components/notifications.js";
import { setSubmittedFilesForHA11 } from "assets/js/utils/system-prompt-config.js";
/* Zentrale Funktion zum Entfernen einer Datei mit allen Nebeneffekten */
export function removeFile(fileName, row) {
  const statusCell = row.children[2];
  const statusText = statusCell ? statusCell.textContent.trim() : "";

  /* Sicherheitsabfrage für eingereichte Dateien */
  if (statusText === "Eingereicht") {
    if (
      !window.confirm("Sind Sie sicher, dass Sie diese Datei löschen möchten?")
    ) {
      return;
    }
  }

  /* UI-Updates und Fortschrittsrücksetzung wenn keine Einreichungen mehr existieren */
  row.remove();

  const fileTable = document.getElementById("fileTable");
  const fileList = document.getElementById("fileList");
  const submitButton = document.getElementById("submitButton");

  if (fileList && !fileList.children.length) {
    if (fileTable) fileTable.style.display = "none";
    if (submitButton) submitButton.style.display = "none";
  }

  const rows = fileList.querySelectorAll("tr");
  let hasAtLeastOneSubmitted = false;
  rows.forEach((r) => {
    const statusCell = r.children[2];
    if (statusCell && statusCell.textContent.trim() === "Eingereicht") {
      hasAtLeastOneSubmitted = true;
    }
  });

  if (!hasAtLeastOneSubmitted) {
    localStorage.removeItem("newOverallData");
    localStorage.removeItem("overallProgressUpdateDone");
  }
  /* LocalStorage-Bereinigung und Benachrichtigungsaktualisierung */
  if (statusText === "Eingereicht") {
    const savedFilesJson = localStorage.getItem("assignment11SubmittedFiles");
    if (savedFilesJson) {
      const savedFiles = JSON.parse(savedFilesJson) || [];
      if (Array.isArray(savedFiles) && savedFiles.length) {
        const updatedFiles = savedFiles.filter((f) => f.name !== fileName);

        if (updatedFiles.length !== savedFiles.length) {
          localStorage.setItem(
            "assignment11SubmittedFiles",
            JSON.stringify(updatedFiles)
          );

          const fileNames = updatedFiles.map((f) => f.name);
          setSubmittedFilesForHA11(fileNames);
        }
      }
    }

    let anyEingereicht = false;
    const allRows = document.querySelectorAll("#fileList tr");
    allRows.forEach((r) => {
      const st = r.children[2].textContent.trim();
      if (st === "Eingereicht") {
        anyEingereicht = true;
      }
    });

    if (!anyEingereicht) {
      localStorage.removeItem("assignment11Uploaded");

      let openNotifs = getOpenNotifications();
      if (openNotifs.includes("ha11")) {
        openNotifs = openNotifs.filter((id) => id !== "ha11");
        setOpenNotifications(openNotifs);
        removeNotificationTimestamp("ha11");
      }

      const ha11El = document.getElementById("notificationHA11");
      if (ha11El) {
        ha11El.style.display = "none";
      }
    }
  }

  checkSubmitButtonVisibility();
  updateNotificationDisplay(globalSidebarContainer || document.body);
}
