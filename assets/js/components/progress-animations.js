/*
Diese Datei steuert die Animationen der Fortschrittsbalken im Dashboard und in Tooltips, inkl. Marker-Anzeige und Zustandsspeicherung.
*/

/* Hilfsfunktionen für die Breiten-Verwaltung der Segmente */
function cacheFinalWidth(segmentEl) {
  if (!segmentEl.dataset.finalWidth) {
    segmentEl.dataset.finalWidth = segmentEl.style.width || "0%";
  }
}

function setWidthFromDataset(segmentEl) {
  segmentEl.style.transition = "none";
  segmentEl.style.width = segmentEl.dataset.finalWidth || "0%";
}

function getFinalWidth(segmentEl) {
  const finalString = segmentEl.dataset.finalWidth || "0%";
  return parseFloat(finalString) || 0;
}

/* Animiert drei Fortschrittsbalken-Segmente von 0% auf ihre Zielwerte */
function animateThreeSegments(
  achievedEl,
  remainingEl,
  potentialEl,
  onComplete
) {
  const achievedFinal = getFinalWidth(achievedEl);
  const remainingFinal = getFinalWidth(remainingEl);
  const potentialFinal = getFinalWidth(potentialEl);

  achievedEl.style.transition = "none";
  achievedEl.style.width = "0%";

  remainingEl.style.transition = "none";
  remainingEl.style.width = "0%";

  potentialEl.style.transition = "none";
  potentialEl.style.width = "0%";

  // Zweistufige Animation für flüssigen Übergang
  requestAnimationFrame(() => {
    achievedEl.offsetWidth;
    remainingEl.offsetWidth;
    potentialEl.offsetWidth;

    achievedEl.style.transition = "width 1s ease";
    remainingEl.style.transition = "width 1s ease";
    potentialEl.style.transition = "width 1s ease";

    requestAnimationFrame(() => {
      achievedEl.style.width = achievedFinal + "%";
      remainingEl.style.width = remainingFinal + "%";
      potentialEl.style.width = potentialFinal + "%";

      setTimeout(() => {
        onComplete && onComplete();
      }, 1100);
    });
  });
}

/* Steuert die zeitversetzte Einblendung der Marker (Zulassung vor Prognose) */
function showMarkersSequentially(progressBarEl) {
  const markers = progressBarEl.querySelectorAll(".marker");
  let zulassungEl = null;
  let prognoseEl = null;

  markers.forEach((marker) => {
    const label = marker.querySelector(".marker-label");
    if (!label) return;
    const text = label.textContent.trim().toLowerCase();
    if (text.includes("zulassung")) {
      zulassungEl = marker;
    } else if (text.includes("prognose")) {
      prognoseEl = marker;
    }
  });

  [zulassungEl, prognoseEl].forEach((markerEl) => {
    if (markerEl) {
      markerEl.style.opacity = "0";
      markerEl.style.transition = "opacity 0.5s ease";
    }
  });

  if (zulassungEl) {
    setTimeout(() => {
      zulassungEl.style.opacity = "1";
    }, 0);
  }

  if (prognoseEl) {
    setTimeout(() => {
      prognoseEl.style.opacity = "1";
    }, 600);
  }
}

function resetThreeSegmentsToFinal(container) {
  const achievedEl = container.querySelector(".achieved");
  const remainingEl = container.querySelector(".remaining");
  const potentialEl = container.querySelector(".potential");
  if (!achievedEl || !remainingEl || !potentialEl) return;

  setWidthFromDataset(achievedEl);
  setWidthFromDataset(remainingEl);
  setWidthFromDataset(potentialEl);

  const markers = container.querySelectorAll(".marker");
  markers.forEach((m) => {
    m.style.transition = "none";
    m.style.opacity = "1";
  });
}

function resetThreeSegmentsToZero(container) {
  const achievedEl = container.querySelector(".achieved");
  const remainingEl = container.querySelector(".remaining");
  const potentialEl = container.querySelector(".potential");
  if (!achievedEl || !remainingEl || !potentialEl) return;

  achievedEl.style.transition = "none";
  achievedEl.style.width = "0%";

  remainingEl.style.transition = "none";
  remainingEl.style.width = "0%";

  potentialEl.style.transition = "none";
  potentialEl.style.width = "0%";

  const markers = container.querySelectorAll(".marker");
  markers.forEach((m) => {
    m.style.transition = "none";
    m.style.opacity = "0";
  });
}

/* Öffentliche Funktionen für verschiedene Animationsszenarien */
// Gesamtfortschritt-Animation
export function initOverallProgressAnimation(progressWrapper) {
  if (!progressWrapper) return;

  const achievedEl = progressWrapper.querySelector(".achieved");
  const remainingEl = progressWrapper.querySelector(".remaining");
  const potentialEl = progressWrapper.querySelector(".potential");
  if (!achievedEl || !remainingEl || !potentialEl) return;

  cacheFinalWidth(achievedEl);
  cacheFinalWidth(remainingEl);
  cacheFinalWidth(potentialEl);

  const aVal = getFinalWidth(achievedEl);
  const rVal = getFinalWidth(remainingEl);
  const pVal = getFinalWidth(potentialEl);
  const currentValString = `${aVal}-${rVal}-${pVal}`;

  const storedVal = localStorage.getItem("lastOverallProgressSegments");

  progressWrapper.style.opacity = "1";

  if (!storedVal || storedVal !== currentValString) {
    localStorage.setItem("lastOverallProgressSegments", currentValString);

    animateThreeSegments(achievedEl, remainingEl, potentialEl, () => {
      showMarkersSequentially(progressWrapper);
    });
  } else {
    resetThreeSegmentsToFinal(progressWrapper);
  }

  window.addEventListener("beforeunload", () => {
    resetThreeSegmentsToFinal(progressWrapper);
  });
}

// Tooltip-spezifische Animationen
export function initTooltipProgressAnimations(tooltipEl) {
  if (!tooltipEl) return;
  const infoIcon = tooltipEl.parentElement;
  if (!infoIcon) return;

  infoIcon.addEventListener("mouseenter", () => {
    const progressItems = tooltipEl.querySelectorAll(".progress-item");
    progressItems.forEach((item) => {
      const a = item.querySelector(".achieved");
      const r = item.querySelector(".remaining");
      const p = item.querySelector(".potential");
      if (a) cacheFinalWidth(a);
      if (r) cacheFinalWidth(r);
      if (p) cacheFinalWidth(p);

      resetThreeSegmentsToZero(item);

      if (a && r && p) {
        animateThreeSegments(a, r, p, () => {
          showMarkersSequentially(item.querySelector(".progress-bar"));
        });
      }
    });
  });

  infoIcon.addEventListener("mouseleave", (e) => {
    if (tooltipEl.contains(e.relatedTarget)) {
      return;
    }

    const progressItems = tooltipEl.querySelectorAll(".progress-item");
    progressItems.forEach((item) => {
      resetThreeSegmentsToZero(item);
    });
  });

  tooltipEl.addEventListener("mouseleave", (e) => {
    if (infoIcon.contains(e.relatedTarget)) {
      return;
    }

    const progressItems = tooltipEl.querySelectorAll(".progress-item");
    progressItems.forEach((item) => {
      resetThreeSegmentsToZero(item);
    });
  });
}

// Korrektur-Fortschritt-Animation
export function initCorrectionProgressAnimation(progressWrapper) {
  if (!progressWrapper) return;

  const achievedEl = progressWrapper.querySelector(".achieved");
  const remainingEl = progressWrapper.querySelector(".remaining");
  const potentialEl = progressWrapper.querySelector(".potential");
  if (!achievedEl || !remainingEl || !potentialEl) return;

  cacheFinalWidth(achievedEl);
  cacheFinalWidth(remainingEl);
  cacheFinalWidth(potentialEl);

  const aVal = getFinalWidth(achievedEl);
  const rVal = getFinalWidth(remainingEl);
  const pVal = getFinalWidth(potentialEl);
  const currentValString = `CORR:${aVal}-${rVal}-${pVal}`;

  const storedVal = localStorage.getItem("lastCorrectionProgressSegments");

  progressWrapper.style.opacity = "1";

  if (!storedVal || storedVal !== currentValString) {
    localStorage.setItem("lastCorrectionProgressSegments", currentValString);

    animateThreeSegments(achievedEl, remainingEl, potentialEl, () => {});
  } else {
    resetThreeSegmentsToFinal(progressWrapper);
  }

  window.addEventListener("beforeunload", () => {
    resetThreeSegmentsToFinal(progressWrapper);
  });
}
