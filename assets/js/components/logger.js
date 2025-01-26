/*
Diese Datei implementiert einen erweiterten Logger für das Developer-Panel mit Speicherfunktion und JSON-Parsing.
*/

export class Logger {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.logs = [];
    this.setupCopyAllButton();

    this.restoreLogsFromStorage();
  }

  setupCopyAllButton() {
    const copyAllButton = document.getElementById("copyAllLogs");
    if (!copyAllButton) return;
    copyAllButton.addEventListener("click", () => {
      const allLogs = this.logs
        .map((log) => {
          let logText = `${log.time} [${log.level}] ${log.message}`;
          if (log.details) {
            const cloneForCopy = structuredClone(log.details);
            const deepParsed = parseNestedJsonStrings(cloneForCopy);
            logText += "\n" + JSON.stringify(deepParsed, null, 2);
          }
          return logText;
        })
        .join("\n");
      navigator.clipboard.writeText(allLogs).then(() => {
        copyAllButton.className = "fas fa-check copy-icon";
        setTimeout(() => {
          copyAllButton.className = "fas fa-copy copy-icon";
        }, 1000);
      });
    });
  }

  /* Speichert und lädt Logs im LocalStorage für Persistenz */

  saveLogsToStorage() {
    localStorage.setItem("developerLogs", JSON.stringify(this.logs));
  }

  restoreLogsFromStorage() {
    const savedLogs = localStorage.getItem("developerLogs");
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);
        parsedLogs.forEach((log) => {
          this.renderLog(log.time, log.level, log.message, log.details);
          this.logs.push(log);
        });
      } catch (e) {
        console.error("Fehler beim Wiederherstellen der Logs", e);
      }
    }
  }
  /* Hauptfunktion für das Logging mit Zeitstempel */

  log(level, message, details = null) {
    const date = new Date();
    const timeZoneOffset = -date.getTimezoneOffset();
    const sign = timeZoneOffset >= 0 ? "+" : "-";
    const offsetHours = String(
      Math.floor(Math.abs(timeZoneOffset) / 60)
    ).padStart(2, "0");
    const offsetMinutes = String(Math.abs(timeZoneOffset) % 60).padStart(
      2,
      "0"
    );
    const time =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0") +
      "T" +
      String(date.getHours()).padStart(2, "0") +
      ":" +
      String(date.getMinutes()).padStart(2, "0") +
      ":" +
      String(date.getSeconds()).padStart(2, "0") +
      "." +
      String(date.getMilliseconds()).padStart(3, "0") +
      sign +
      offsetHours +
      ":" +
      offsetMinutes;

    this.logs.push({ time, level, message, details });

    this.saveLogsToStorage();

    this.renderLog(time, level, message, details);
  }

  renderLog(time, level, message, details) {
    const entry = document.createElement("div");
    entry.className = "log-entry";
    const header = document.createElement("div");
    header.className = "log-header";
    const headerContent = document.createElement("div");
    headerContent.className = "log-header-content";
    const arrow = document.createElement("span");
    arrow.className = "log-arrow";

    if (details) {
      arrow.textContent = "►";
      headerContent.style.cursor = "pointer";
    } else {
      arrow.textContent = " ";
      headerContent.style.cursor = "default";
    }

    const headerText = document.createElement("span");
    headerText.innerHTML = `
      <span class="log-time">${time}</span>
      <span class="log-level-${level.toLowerCase()}">[${level}]</span>
      ${message}
    `;

    const copyIcon = document.createElement("i");
    copyIcon.className = "fas fa-copy copy-icon";
    copyIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      let textToCopy = `${time} [${level}] ${message}`;
      if (details) {
        const cloneForCopy = structuredClone(details);
        const deepParsed = parseNestedJsonStrings(cloneForCopy);
        textToCopy += "\n" + JSON.stringify(deepParsed, null, 2);
      }
      navigator.clipboard.writeText(textToCopy).then(() => {
        copyIcon.className = "fas fa-check copy-icon";
        setTimeout(() => {
          copyIcon.className = "fas fa-copy copy-icon";
        }, 1000);
      });
    });

    headerContent.appendChild(arrow);
    headerContent.appendChild(headerText);
    header.appendChild(headerContent);
    header.appendChild(copyIcon);
    entry.appendChild(header);

    if (details) {
      const content = document.createElement("div");
      content.className = "log-content";
      if (typeof details === "object") {
        const cloneForDisplay = structuredClone(details);
        const deepParsed = parseNestedJsonStrings(cloneForDisplay);
        content.innerHTML = `<code>${JSON.stringify(
          deepParsed,
          null,
          2
        )}</code>`;
      } else {
        const deepParsed = parseNestedJsonStrings(details);
        content.innerHTML = `<code>${JSON.stringify(
          deepParsed,
          null,
          2
        )}</code>`;
      }
      entry.appendChild(content);
      headerContent.addEventListener("click", () => {
        arrow.classList.toggle("expanded");
        content.classList.toggle("expanded");
      });
    }

    this.container.appendChild(entry);
    this.container.scrollTop = this.container.scrollHeight;
  }

  error(message, details = null) {
    this.log("ERROR", message, details);
  }

  warn(message, details = null) {
    this.log("WARN", message, details);
  }

  info(message, details = null) {
    this.log("INFO", message, details);
  }

  debug(message, details = null) {
    this.log("DEBUG", message, details);
  }
}

/* Rekursive Hilfsfunktion zum Parsen verschachtelter JSON-Strings */
function parseNestedJsonStrings(value) {
  if (Array.isArray(value)) {
    return value.map((el) => parseNestedJsonStrings(el));
  } else if (value !== null && typeof value === "object") {
    for (const key of Object.keys(value)) {
      value[key] = parseNestedJsonStrings(value[key]);
    }
    return value;
  } else if (typeof value === "string") {
    let current = value;
    while (true) {
      try {
        current = JSON.parse(current);
      } catch (e) {
        break;
      }
    }
    return current;
  } else {
    return value;
  }
}
