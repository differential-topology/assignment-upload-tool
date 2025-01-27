/*
Diese Datei steuert den PDF-Editor für Korrekturen mit Punktevergabe und Upload-Funktionalität.
*/
import { getCurrentPage } from "/assets/js/utils/page-utils.js";
import {
  updateNotificationBadge,
  updateNotificationDisplay,
} from "/assets/js/components/notifications.js";
import { setIsCorrectionSubmitted } from "/assets/js/utils/system-prompt-config.js";

/* Hauptlogik nur auf der PDF-Editor Seite */
const currentPage = getCurrentPage();

if (currentPage === "pdf-editor") {
  /* Automatische Summierung der Teilpunkte */
  const points101 = document.getElementById("points101");
  const points102 = document.getElementById("points102");
  const points103 = document.getElementById("points103");
  const pointsTotal = document.getElementById("pointsTotal");

  function updateTotalPoints() {
    const val101 = parseInt(points101.value) || 0;
    const val102 = parseInt(points102.value) || 0;
    const val103 = parseInt(points103.value) || 0;
    pointsTotal.textContent = val101 + val102 + val103;
  }

  if (points101 && points102 && points103) {
    [points101, points102, points103].forEach((input) => {
      input.addEventListener("input", updateTotalPoints);
    });
  }

  /* Simulierter Upload-Prozess mit Fortschrittsanzeige */
  const uploadBtn = document.getElementById("uploadCorrectionBtn");
  const cancelIcon = document.getElementById("correctionCancelIcon");
  const progressBar = document.getElementById("correctionProgress");
  const progressFill = document.getElementById("correctionProgressFill");
  const progressPercent = document.getElementById("correctionProgressPercent");
  let uploadInterval = null;

  if (uploadBtn) {
    uploadBtn.addEventListener("click", () => {
      uploadBtn.disabled = true;

      if (progressBar) {
        progressBar.style.display = "block";
      }
      if (progressPercent) {
        progressPercent.style.display = "inline";
        progressPercent.textContent = "0%";
      }
      if (cancelIcon) {
        cancelIcon.style.display = "inline-block";
      }
      if (progressFill) progressFill.style.width = "0%";

      let progress = 0;
      uploadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress > 100) progress = 100;
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressPercent) progressPercent.textContent = `${progress}%`;
        if (progress === 100) {
          clearInterval(uploadInterval);
          uploadInterval = null;

          if (progressBar) {
            progressBar.style.display = "none";
          }
          if (progressPercent) {
            progressPercent.style.display = "none";
          }
          if (cancelIcon) cancelIcon.style.display = "none";
          uploadBtn.disabled = false;

          const tutorNotification = document.getElementById(
            "notificationTutorCorrection"
          );
          if (tutorNotification) {
            tutorNotification.style.display = "";
            let openNotifs = JSON.parse(
              localStorage.getItem("openNotifications") || "[]"
            );
            if (!openNotifs.includes("tutorCorrection")) {
              openNotifs.push("tutorCorrection");
              localStorage.setItem(
                "openNotifications",
                JSON.stringify(openNotifs)
              );
            }
          }
          updateNotificationBadge();
          updateNotificationDisplay();

          localStorage.setItem("analysis10CorrectionDone", "true");

          setIsCorrectionSubmitted(true);

          localStorage.setItem(
            "newCorrectionData",
            JSON.stringify({
              bigBar: {
                progressText: "57%",
                achieved: {
                  width: "44%",
                  tooltip: "Bereits korrigiert: 44%",
                },
                remaining: {
                  width: "13%",
                  tooltip: "Korrigiert, aber Fragen offen: 13%",
                },
                potential: {
                  width: "20%",
                  tooltip: "Noch nicht korrigiert: 20%",
                },
              },
              tooltipBars: {
                analysis1: {
                  achieved: {
                    width: "58%",
                    tooltip: "58%",
                  },
                  remaining: {
                    width: "15%",
                    tooltip: "15%",
                  },
                  potential: {
                    width: "0%",
                    tooltip: "0%",
                  },
                },

                stochI: {
                  achieved: {
                    width: "30%",
                    tooltip: "30%",
                  },
                  remaining: {
                    width: "10%",
                    tooltip: "10%",
                  },
                  potential: {
                    width: "40%",
                    tooltip: "40%",
                  },
                },
              },
            })
          );
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
      if (progressPercent) {
        progressPercent.textContent = "";
        progressPercent.style.display = "none";
      }
      if (progressBar) progressBar.style.display = "none";
      if (cancelIcon) cancelIcon.style.display = "none";
      if (uploadBtn) uploadBtn.disabled = false;
    });
  }

  /* Aufräumen beim Verlassen der Seite */
  window.addEventListener("beforeunload", () => {
    if (progressFill) progressFill.style.width = "0%";
    if (progressPercent) {
      progressPercent.textContent = "";
      progressPercent.style.display = "none";
    }
    if (progressBar) progressBar.style.display = "none";
    if (cancelIcon) cancelIcon.style.display = "none";
    if (uploadBtn) uploadBtn.disabled = false;
  });
}
