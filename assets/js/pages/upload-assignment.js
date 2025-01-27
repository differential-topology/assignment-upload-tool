/*
Diese Datei implementiert die Upload-Funktionalität für Hausaufgaben mit Drag&Drop, Fortschrittsanzeige und Benachrichtigungen.
*/
import { getCurrentPage } from "/assets/js/utils/page-utils.js";
import {
  handleFiles,
  checkSubmitButtonVisibility,
} from "/assets/js/components/file-upload-handler.js";
import { loadSubmittedFiles } from "/assets/js/components/file-storage-loader.js";
import {
  updateNotificationDisplay,
  setNotificationTimestamp,
} from "/assets/js/components/notifications.js";
import { globalSidebarContainer } from "/assets/js/utils/global-state.js";
import { setSubmittedFilesForHA11 } from "/assets/js/utils/system-prompt-config.js";
/* Hauptlogik nur auf der Upload-Seite */
const currentPage = getCurrentPage();

if (currentPage === "upload-assignment") {
  loadSubmittedFiles();

  const uploadArea = document.getElementById("uploadArea");
  const submitButton = document.getElementById("submitButton");
  const cancelIcon = document.getElementById("cancelIcon");
  const uploadProgress = document.getElementById("uploadProgress");
  const progressFill = document.getElementById("progressFill");
  const progressPercentage = document.getElementById("progressPercentage");
  /* Simulierter Upload-Prozess mit Fortschrittsanzeige */
  let uploadInterval = null;

  if (cancelIcon) {
    cancelIcon.style.display = "none";
  }

  if (uploadArea) {
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("upload-hover");
    });
    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("upload-hover");
    });
    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("upload-hover");
      handleFiles(e.dataTransfer.files);
    });
    uploadArea.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.multiple = true;
      fileInput.addEventListener("change", () => handleFiles(fileInput.files));
      fileInput.click();
    });
  }

  if (submitButton) {
    submitButton.addEventListener("click", () => {
      submitButton.disabled = true;

      if (uploadProgress) {
        uploadProgress.style.display = "block";
        if (cancelIcon) {
          cancelIcon.style.display = "inline-block";
        }
      }
      if (progressFill) progressFill.style.width = "0%";
      if (progressPercentage) {
        progressPercentage.style.display = "block";
        progressPercentage.textContent = "0%";
      }

      let progress = 0;
      uploadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress > 100) progress = 100;

        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressPercentage) progressPercentage.textContent = `${progress}%`;

        if (progress === 100) {
          clearInterval(uploadInterval);
          uploadInterval = null;

          const fileList = document.getElementById("fileList");
          const rows = fileList ? fileList.querySelectorAll("tr") : [];
          const submittedFiles = [];

          rows.forEach((row) => {
            const statusCell = row.children[2];
            statusCell.textContent = "Eingereicht";
            const fileName = row.children[0].textContent.trim();
            const fileSize = row.children[1].textContent.trim();
            submittedFiles.push({ name: fileName, size: fileSize });
          });

          if (uploadProgress) uploadProgress.style.display = "none";
          if (progressPercentage) progressPercentage.style.display = "none";
          if (cancelIcon) cancelIcon.style.display = "none";

          localStorage.setItem("assignment11Uploaded", "true");
          localStorage.setItem(
            "assignment11SubmittedFiles",
            JSON.stringify(submittedFiles)
          );

          const fileNames = submittedFiles.map((item) => item.name);
          setSubmittedFilesForHA11(fileNames);
          checkSubmitButtonVisibility();
          submitButton.disabled = false;

          const alreadyIncremented =
            localStorage.getItem("overallProgressUpdateDone") === "true";

          if (!alreadyIncremented) {
            localStorage.setItem("overallProgressUpdateDone", "true");

            localStorage.setItem(
              "newOverallData",
              JSON.stringify({
                overallText: "88%",
                segments: {
                  achieved: { width: "78%", tooltip: "Erhalten: 78%" },
                  remaining: { width: "10%", tooltip: "Ausstehend: 10%" },
                  potential: { width: "0%", tooltip: "Offen: 0%" },
                },
                tooltipGMCI: {
                  achieved: { width: "50%", tooltip: "50%" },
                  remaining: { width: "15%", tooltip: "15%" },
                  potential: { width: "10%", tooltip: "max. 10%" },
                },
              })
            );
          }

          const ha11Notification = document.getElementById("notificationHA11");
          if (ha11Notification) {
            ha11Notification.style.display = "";
            let openNotifs = JSON.parse(
              localStorage.getItem("openNotifications") || "[]"
            );
            if (!openNotifs.includes("ha11")) {
              openNotifs.push("ha11");
            }
            localStorage.setItem(
              "openNotifications",
              JSON.stringify(openNotifs)
            );

            setNotificationTimestamp("ha11", Date.now());
          }

          updateNotificationDisplay(globalSidebarContainer || document.body);
        }
      }, 500);
    });
  }

  if (cancelIcon) {
    cancelIcon.addEventListener("click", () => {
      if (uploadInterval) {
        clearInterval(uploadInterval);
        uploadInterval = null;
      }
      if (progressFill) progressFill.style.width = "0%";
      if (progressPercentage) {
        progressPercentage.textContent = "";
        progressPercentage.style.display = "none";
      }
      if (uploadProgress) uploadProgress.style.display = "none";
      cancelIcon.style.display = "none";
      submitButton.disabled = false;
    });
  }
  /* Verhindert unvollständige Uploads beim Verlassen der Seite */

  window.addEventListener("beforeunload", () => {
    const fileList = document.getElementById("fileList");
    const fileTable = document.getElementById("fileTable");
    const submitButton = document.getElementById("submitButton");
    if (fileList) fileList.innerHTML = "";
    if (fileTable) fileTable.style.display = "none";
    if (submitButton) submitButton.style.display = "none";
  });
}
