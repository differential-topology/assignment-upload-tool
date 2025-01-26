/*
Diese Datei implementiert maßgeschneiderte Tooltips für die Fortschrittsbalken-Segmente mit Mausfolge-Funktion.
*/

function createTooltip(text, x, y) {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.innerHTML = text.replace(/&#013;/g, "<br>");
  tooltip.style.left = x + 15 + "px";
  tooltip.style.top = y - 15 + "px";
  document.body.appendChild(tooltip);
  return tooltip;
}

document.querySelectorAll(".progress-sections > div").forEach((section) => {
  let currentTooltip = null;
  section.addEventListener("mouseenter", (e) => {
    section.classList.add("section-hover");
    const tooltipText = section.getAttribute("data-tooltip");
    if (tooltipText) {
      currentTooltip = createTooltip(tooltipText, e.clientX, e.clientY);
    }
  });
  section.addEventListener("mouseleave", () => {
    section.classList.remove("section-hover");
    if (currentTooltip) {
      currentTooltip.remove();
      currentTooltip = null;
    }
  });
  section.addEventListener("mousemove", (e) => {
    if (currentTooltip) {
      currentTooltip.style.left = e.clientX + 15 + "px";
      currentTooltip.style.top = e.clientY - 15 + "px";
    }
  });
});
