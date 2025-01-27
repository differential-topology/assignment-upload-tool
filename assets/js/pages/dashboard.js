/*
Diese Datei steuert die Dashboard-Logik mit Fortschrittsanzeigen, Korrekturen und Statusupdates.
*/
import { getCurrentPage } from "/assets/js/utils/page-utils.js";
import {
  initOverallProgressAnimation,
  initTooltipProgressAnimations,
  initCorrectionProgressAnimation,
} from "/assets/js/components/progress-animations.js";
/* Prüfung und Aktualisierung des HA11-Status in der Tabelle */
const currentPage = getCurrentPage();

if (currentPage === "dashboard") {
  const rows = document.querySelectorAll(".table-tasks tbody tr");
  let hasSubmittedHA11 = false;

  rows.forEach((row) => {
    const kursCell = row.cells[0]?.textContent.trim();
    const aufgabeCell = row.cells[1]?.textContent.trim();

    if (kursCell === "GMCI" && aufgabeCell.includes("Hausaufgabe 11")) {
      const isUploaded =
        localStorage.getItem("assignment11Uploaded") === "true";
      const tdStatus = row.cells[3];

      if (tdStatus) {
        if (isUploaded) {
          tdStatus.innerHTML = `
            <i class="fa-solid fa-circle-check" style="color: #4da352; margin-right: 5px; font-size: 16px;"></i>
            <span data-i18n="status_submitted">Eingereicht</span>
          `;
          hasSubmittedHA11 = true;
        } else {
          tdStatus.innerHTML = `
            <i class="fa-solid fa-circle-exclamation" style="color: #A4A4AE; margin-right: 5px; font-size: 16px;"></i>
            <span data-i18n="status_not_submitted">Nicht abgegeben</span>
          `;
        }
      }
    }
  });

  const progressText = document.getElementById(
    "dashboardOverallProgressPercent"
  );
  if (progressText) {
    const newPercent = hasSubmittedHA11 ? 84 : 82;
    progressText.textContent = `Gesamtfortschritt: ${newPercent}%`;
  }

  /* Dynamische Aktualisierung der Fortschrittsanzeigen aus dem LocalStorage */
  const storedOverall = localStorage.getItem("newOverallData");
  if (storedOverall) {
    const overallObj = JSON.parse(storedOverall);

    if (overallObj.overallText && progressText) {
      progressText.textContent = `Gesamtfortschritt: ${overallObj.overallText}`;
    }

    const overallWrapper = document.querySelector(
      "#overall-progress-section .progress-sections"
    );
    if (overallWrapper && overallObj.segments) {
      const achievedEl = overallWrapper.querySelector(".achieved");
      const remainingEl = overallWrapper.querySelector(".remaining");
      const potentialEl = overallWrapper.querySelector(".potential");
      if (achievedEl && remainingEl && potentialEl) {
        achievedEl.style.width = overallObj.segments.achieved.width;
        achievedEl.setAttribute(
          "data-tooltip",
          overallObj.segments.achieved.tooltip
        );

        remainingEl.style.width = overallObj.segments.remaining.width;
        remainingEl.setAttribute(
          "data-tooltip",
          overallObj.segments.remaining.tooltip
        );

        potentialEl.style.width = overallObj.segments.potential.width;
        potentialEl.setAttribute(
          "data-tooltip",
          overallObj.segments.potential.tooltip
        );
      }
    }

    const tooltipProgressItems = document.querySelectorAll(
      "#overall-progress-section .custom-tooltip .progress-tooltip-container .progress-item"
    );

    const gmciIndex = 2;
    if (tooltipProgressItems[gmciIndex] && overallObj.tooltipGMCI) {
      const gmciItem = tooltipProgressItems[gmciIndex];
      const gmciAchieved = gmciItem.querySelector(".achieved");
      const gmciRemaining = gmciItem.querySelector(".remaining");
      const gmciPotential = gmciItem.querySelector(".potential");
      if (gmciAchieved && gmciRemaining && gmciPotential) {
        gmciAchieved.style.width = overallObj.tooltipGMCI.achieved.width;
        gmciAchieved.setAttribute(
          "data-tooltip",
          overallObj.tooltipGMCI.achieved.tooltip
        );

        gmciRemaining.style.width = overallObj.tooltipGMCI.remaining.width;
        gmciRemaining.setAttribute(
          "data-tooltip",
          overallObj.tooltipGMCI.remaining.tooltip
        );

        gmciPotential.style.width = overallObj.tooltipGMCI.potential.width;
        gmciPotential.setAttribute(
          "data-tooltip",
          overallObj.tooltipGMCI.potential.tooltip
        );
      }
    }
  }

  /* Tutor-spezifische Funktionen und Korrektur-Fortschritt */
  const userRole = localStorage.getItem("userRole");
  if (userRole === "tutor") {
    const tutorSection = document.getElementById("tutorDashboardSection");
    if (tutorSection) {
      tutorSection.style.display = "block";
    }
  }

  const analysis10Done =
    localStorage.getItem("analysis10CorrectionDone") === "true";

  if (analysis10Done) {
    const tutorTableRows = document.querySelectorAll(
      "#tutorDashboardSection table.table-tasks tbody tr"
    );

    tutorTableRows.forEach((row) => {
      const correctionLink = row.querySelector(".correction-link");
      if (correctionLink) {
        correctionLink.textContent = "Abgeschlossen";
        correctionLink.removeAttribute("href");
        correctionLink.style.pointerEvents = "none";

        correctionLink.removeAttribute("data-i18n");
      }
    });

    const newDataStr = localStorage.getItem("newCorrectionData");
    const tutorProgressPercent = document.getElementById(
      "tutorProgressPercent"
    );

    if (newDataStr) {
      const newData = JSON.parse(newDataStr);

      const bigBarAchieved = document.querySelector(
        "#correction-progress-section .progress-sections .achieved"
      );
      const bigBarRemaining = document.querySelector(
        "#correction-progress-section .progress-sections .remaining"
      );
      const bigBarPotential = document.querySelector(
        "#correction-progress-section .progress-sections .potential"
      );

      if (
        newData.bigBar &&
        bigBarAchieved &&
        bigBarRemaining &&
        bigBarPotential &&
        tutorProgressPercent
      ) {
        tutorProgressPercent.textContent = `Korrekturfortschritt: ${newData.bigBar.progressText}`;

        bigBarAchieved.style.width = newData.bigBar.achieved.width;
        bigBarAchieved.setAttribute(
          "data-tooltip",
          newData.bigBar.achieved.tooltip
        );

        bigBarRemaining.style.width = newData.bigBar.remaining.width;
        bigBarRemaining.setAttribute(
          "data-tooltip",
          newData.bigBar.remaining.tooltip
        );

        bigBarPotential.style.width = newData.bigBar.potential.width;
        bigBarPotential.setAttribute(
          "data-tooltip",
          newData.bigBar.potential.tooltip
        );
      }

      const tooltipItems = document.querySelectorAll(
        "#correction-progress-section .progress-tooltip-container .progress-item"
      );

      if (tooltipItems.length >= 2 && newData.tooltipBars) {
        const analysisItem = tooltipItems[0];
        const aAchieved = analysisItem.querySelector(".achieved");
        const aRemaining = analysisItem.querySelector(".remaining");
        const aPotential = analysisItem.querySelector(".potential");

        const stochItem = tooltipItems[1];
        const sAchieved = stochItem.querySelector(".achieved");
        const sRemaining = stochItem.querySelector(".remaining");
        const sPotential = stochItem.querySelector(".potential");

        if (
          newData.tooltipBars.analysis1 &&
          aAchieved &&
          aRemaining &&
          aPotential
        ) {
          aAchieved.style.width = newData.tooltipBars.analysis1.achieved.width;
          aAchieved.setAttribute(
            "data-tooltip",
            newData.tooltipBars.analysis1.achieved.tooltip
          );

          aRemaining.style.width =
            newData.tooltipBars.analysis1.remaining.width;
          aRemaining.setAttribute(
            "data-tooltip",
            newData.tooltipBars.analysis1.remaining.tooltip
          );

          aPotential.style.width =
            newData.tooltipBars.analysis1.potential.width;
          aPotential.setAttribute(
            "data-tooltip",
            newData.tooltipBars.analysis1.potential.tooltip
          );
        }

        if (
          newData.tooltipBars.stochI &&
          sAchieved &&
          sRemaining &&
          sPotential
        ) {
          sAchieved.style.width = newData.tooltipBars.stochI.achieved.width;
          sAchieved.setAttribute(
            "data-tooltip",
            newData.tooltipBars.stochI.achieved.tooltip
          );

          sRemaining.style.width = newData.tooltipBars.stochI.remaining.width;
          sRemaining.setAttribute(
            "data-tooltip",
            newData.tooltipBars.stochI.remaining.tooltip
          );

          sPotential.style.width = newData.tooltipBars.stochI.potential.width;
          sPotential.setAttribute(
            "data-tooltip",
            newData.tooltipBars.stochI.potential.tooltip
          );
        }
      }
    } else {
      if (tutorProgressPercent) {
        tutorProgressPercent.textContent = "Korrekturfortschritt: 100%";
      }
    }

    const notificationTutorCorrection = document.getElementById(
      "notificationTutorCorrection"
    );
    if (notificationTutorCorrection) {
      notificationTutorCorrection.style.display = "block";
    }
  }

  /* Initialisierung der Fortschrittsbalken-Animationen */
  const overallProgressSection = document.querySelector(
    "#overall-progress-section .progress-wrapper"
  );

  initOverallProgressAnimation(overallProgressSection);

  const overallTooltip =
    overallProgressSection?.querySelector(".custom-tooltip");
  initTooltipProgressAnimations(overallTooltip);

  const correctionProgressSection = document.getElementById(
    "correction-progress-section"
  );
  if (correctionProgressSection) {
    initCorrectionProgressAnimation(correctionProgressSection);

    const corrTooltip =
      correctionProgressSection.querySelector(".custom-tooltip");
    initTooltipProgressAnimations(corrTooltip);
  }
}
