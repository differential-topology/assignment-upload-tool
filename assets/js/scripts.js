/**
 * Datei: scripts.js
 * 
 * Zweck:
 * - Zentrale Steuerung der Web-App, Laden von Sidebar, Header-Funktionen usw.
 * - Initialisierung und Verwaltung aller Funktionen (z.B. Kalender, Datei-Uploads, Dark-Mode).
 */

document.addEventListener("DOMContentLoaded", function () {
  // --------------------------------------------------
  // GLOBALE VARIABLEN & KONSTANTEN
  // --------------------------------------------------

  /** 
   * Speichert den aktuell angezeigten Monat (0 = Januar, 11 = Dezember).
   * Wird für die Kalenderfunktion verwendet.
   */
  let currentMonthGlobal = new Date().getMonth();

  /**
   * Speichert das aktuelle Jahr, das im Kalender angezeigt wird.
   */
  let currentYearGlobal = new Date().getFullYear();

  /**
   * Enthält die Referenz auf das geladene Sidebar-Element (wird dynamisch geladen).
   */
  let globalSidebarContainer = null;

  /**
   * Dient zur Bestimmung, auf welcher Seite sich der Nutzer befindet.
   * (Ermittelt aus dem Dateinamen der aktuellen URL.)
   */
  const currentPage = location.pathname.split("/").pop().replace(".html", "");

  /**
   * Liste von Terminen (Aufgaben-/Abgabe-Termine) für den Kalender.
   * Der Key ist im Format "YYYY-M-D", um die einzelnen Tage zu identifizieren.
   */
  const eventsByDate = {
    "2025-0-3": "Abgabe: HA12 – Stochastik II",
    "2025-0-13": "Abgabe: HA11 – Grundlagen der MCI",
    "2025-0-24": "Abgabe: HA13 – Stochastik II",
    "2025-0-28": "Abgabe: HA14 – Analysis II",
  };


  // --------------------------------------------------
  // FUNKTIONSDEFINITIONEN
  // --------------------------------------------------

  /**
   * Initialisiert Navigationsmarkierungen (aktive Seite),
   * Avatar-Popup und Hamburger-Menü für mobile Navigation.
   */
  function setupHeaderJS() {
    const currentPageName = location.pathname.split("/").pop().replace(".html", "");
    const navLinks = document.querySelectorAll(".main-nav a");

    // Markiert in der Navigation den aktiven Menüpunkt
    navLinks.forEach((link) => {
      if (link.dataset.nav === currentPageName) {
        link.parentElement.classList.add("active");
      } else {
        link.parentElement.classList.remove("active");
      }
    });

    // Avatar-Popup und Logout-Button
    initializeAvatarPopup();

    // Hamburger-Menü für mobile Darstellung
    const hamburgerMenu = document.getElementById("hamburgerMenu");
    const navUl = document.querySelector(".main-nav ul");
    if (hamburgerMenu && navUl) {
      hamburgerMenu.addEventListener("click", () => {
        navUl.classList.toggle("show");
      });
    }
  }

  /**
   * Bindet das Klicken auf das Profilbild an das Avatar-Popup.
   * Regelt das Ausloggen, sowie Klickverhalten außerhalb des Popups.
   */
  function initializeAvatarPopup() {
    const avatarIcon = document.getElementById("avatarIcon");
    const avatarPopup = document.getElementById("avatarPopup");
    const logoutButton = document.getElementById("logoutButton");
    const editProfile = document.getElementById("editProfile");
    const helpButton = document.getElementById("help");

    if (avatarIcon && avatarPopup) {
      // Avatar-Popup ein-/ausblenden
      avatarIcon.addEventListener("click", (event) => {
        event.stopPropagation();
        avatarPopup.classList.toggle("show");
      });

      // Klick außerhalb schließt das Avatar-Popup
      document.addEventListener("click", (event) => {
        if (!avatarPopup.contains(event.target) && event.target !== avatarIcon) {
          avatarPopup.classList.remove("show");
        }
      });

      // Logout-Button
      if (logoutButton) {
        logoutButton.addEventListener("click", (event) => {
          event.preventDefault();
          localStorage.removeItem("assignment11Uploaded");
          localStorage.removeItem("assignment11SubmittedFiles");
          window.location.href = "index.html";
        });
      }
    }
  }

  /**
   * Entfernt eine hochgeladene Datei aus der Tabelle und dem LocalStorage.
   * Wird im Upload-Dialog (z.B. upload-assignment.html) verwendet.
   * 
   * @param {string} fileName - Name der zu entfernenden Datei.
   * @param {HTMLElement} row - Zeilen-Element, das entfernt werden soll.
   */
  function removeFile(fileName, row) {
    row.remove();

    const fileTable = document.getElementById("fileTable");
    const fileList = document.getElementById("fileList");
    const submitButton = document.getElementById("submitButton");

    // Tabelle und Button ausblenden, wenn keine Dateien mehr vorhanden
    if (fileList && !fileList.children.length) {
      if (fileTable) fileTable.style.display = "none";
      if (submitButton) submitButton.style.display = "none";
    }

    // Aus LocalStorage entfernen
    const savedFilesJson = localStorage.getItem("assignment11SubmittedFiles");
    if (savedFilesJson) {
      const savedFiles = JSON.parse(savedFilesJson);
      if (Array.isArray(savedFiles) && savedFiles.length) {
        const updatedFiles = savedFiles.filter((file) => file.name !== fileName);
        localStorage.setItem("assignment11SubmittedFiles", JSON.stringify(updatedFiles));
        if (!updatedFiles.length) {
          localStorage.removeItem("assignment11Uploaded");
        }
      }
    }

    // Aktualisiert die Sichtbarkeit des Abgabe-Buttons und Benachrichtigungen
    checkSubmitButtonVisibility();
    updateNotificationDisplay(globalSidebarContainer || document);
  }

  /**
   * Lädt bereits im LocalStorage gespeicherte Dateien
   * (z.B. nach einem Neuladen der Seite) in die Tabelle.
   */
  function loadSubmittedFiles() {
    const fileTable = document.getElementById("fileTable");
    const fileList = document.getElementById("fileList");
    if (!fileList) return;

    const savedFilesJson = localStorage.getItem("assignment11SubmittedFiles");
    if (!savedFilesJson) return;

    const savedFiles = JSON.parse(savedFilesJson);
    if (!savedFiles || !Array.isArray(savedFiles)) return;

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

  /**
   * Verarbeitet hochgeladene Dateien (Drag & Drop oder Dateidialog),
   * erstellt Tabelleneinträge und zeigt den Abgabe-Button an.
   * 
   * @param {FileList} files - Liste der ausgewählten/hochgeladenen Dateien.
   */
  function handleFiles(files) {
    const fileTable = document.getElementById("fileTable");
    const fileList = document.getElementById("fileList");
    const submitButton = document.getElementById("submitButton");

    if (!fileTable || !fileList || !submitButton) return;

    Array.from(files).forEach((file) => {
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
    });

    fileTable.style.display = "table";
    submitButton.style.display = "block";

    checkSubmitButtonVisibility();
  }

  /**
   * Zeigt oder versteckt den Abgabe-Button je nach Datei-Status.
   * (Nur wenn eine Datei den Status != 'Eingereicht' hat, wird er gezeigt.)
   */
  function checkSubmitButtonVisibility() {
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

  /**
   * Effektsimulation für das Schreiben von Text (z.B. Chat-Titel).
   * 
   * @param {HTMLElement} element - Das Element, in das geschrieben wird.
   * @param {string} text - Der anzuzeigende Text.
   * @param {number} speed - Geschwindigkeit, in Millisekunden pro Zeichen.
   */
  function typeText(element, text, speed = 50) {
    let i = 0;
    const timer = setInterval(() => {
      element.textContent += text.charAt(i);
      i++;
      if (i === text.length) clearInterval(timer);
    }, speed);
  }

  /**
   * Aktualisiert gewisse Elemente der Sidebar und den Notification-Badge,
   * je nachdem ob eine Abgabe erfolgte.
   * 
   * @param {HTMLElement} [container=document] - Das übergeordnete Container-Element (z.B. Sidebar).
   */
  function updateNotificationDisplay(container = document) {
    const notificationHA11 = container.querySelector("#notificationHA11");
    const savedFilesJson = localStorage.getItem("assignment11SubmittedFiles");
    let ha11Visible = false;

    if (savedFilesJson) {
      const savedFiles = JSON.parse(savedFilesJson);
      if (Array.isArray(savedFiles) && savedFiles.length > 0) {
        ha11Visible = true;
      }
    }

    if (notificationHA11) {
      notificationHA11.style.display = ha11Visible ? "block" : "none";
    }

    updateNotificationBadge();
  }

  /**
   * Setzt die Zahl im roten Notifications-Badge (in der Profil-Icon-Ecke).
   * Basis-Logik: 1 Notification (Neue Korrektur) + 1 wenn HA11 eingereicht.
   */
  function updateNotificationBadge() {
    let count = 1;
    const savedFilesJson = localStorage.getItem("assignment11SubmittedFiles");
    if (savedFilesJson) {
      const savedFiles = JSON.parse(savedFilesJson);
      if (Array.isArray(savedFiles) && savedFiles.length > 0) {
        count = 2;
      }
    }
    const badge = document.querySelector(".notification-badge");
    if (badge) {
      badge.textContent = count;
    }
  }

  /**
   * Erzeugt das HTML für den Kalender (Monatsübersicht).
   * Greift auf eventsByDate zu, um entsprechende Tages-Events zu markieren.
   * 
   * @returns {string} - HTML-String des gesamten Kalenderbereichs.
   */
  function generateCalendar() {
    const monthNames = [
      "Januar","Februar","März","April","Mai","Juni",
      "Juli","August","September","Oktober","November","Dezember"
    ];
    const daysOfWeek = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

    const firstDay = new Date(currentYearGlobal, currentMonthGlobal, 1).getDay();
    const lastDate = new Date(currentYearGlobal, currentMonthGlobal + 1, 0).getDate();

    let calendarHTML = `
      <div class="calendar">
        <div class="calendar-header">
          <span class="prev-month" id="prevMonth">&#10094;</span>
          <span class="month-year">${monthNames[currentMonthGlobal]} ${currentYearGlobal}</span>
          <span class="next-month" id="nextMonth">&#10095;</span>
        </div>
        <table class="calendar-table">
          <thead>
            <tr>`;

    // Kopfzeile (Wochentage)
    daysOfWeek.forEach((day) => {
      calendarHTML += `<th>${day}</th>`;
    });
    calendarHTML += `</tr></thead><tbody><tr>`;

    // Wochentage anpassen (Mo=1, Di=2 ... So=7) => JavaScript getDay() (So=0...Sa=6)
    let startDay = firstDay === 0 ? 6 : firstDay - 1;

    // Leere Felder vor dem 1. Tag
    for (let i = 0; i < startDay; i++) {
      calendarHTML += `<td></td>`;
    }

    // Heutiges Datum identifizieren (für Markierung)
    const today = new Date();

    // Gesamter Monat
    for (let date = 1; date <= lastDate; date++) {
      const currentDate = new Date(currentYearGlobal, currentMonthGlobal, date);
      const isToday =
        date === today.getDate() &&
        currentMonthGlobal === today.getMonth() &&
        currentYearGlobal === today.getFullYear();

      // Neue Reihe anfangen, wenn die Woche voll ist
      if ((startDay + date - 1) % 7 === 0 && date !== 1) {
        calendarHTML += `</tr><tr>`;
      }

      let eventsHTML = "";
      const eventKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;

      // Gibt es ein Event an diesem Tag?
      if (eventsByDate[eventKey]) {
        const eventText = eventsByDate[eventKey];
        const eventDate = new Date(currentYearGlobal, currentMonthGlobal, date);
        const isPast = eventDate < today;
        const dotClass = isPast ? "event-dot past-event" : "event-dot";
        eventsHTML = `
          <div class="${dotClass}"></div>
          <div class="event-popup" id="popup-${date}">${eventText}</div>`;
      } else {
        // Kein Event
        eventsHTML = `<div class="event-dot no-event"></div>`;
      }

      // Heute besonders kennzeichnen
      if (isToday) {
        calendarHTML += `
          <td class="today event-day" data-date="${date}">
            <span class="day-number">${date}</span>
            ${eventsHTML}
          </td>`;
      } else {
        const hasRealEvent = eventsByDate[eventKey] ? "event-day" : "";
        calendarHTML += `
          <td class="${hasRealEvent}" data-date="${date}">
            <span class="day-number">${date}</span>
            ${eventsHTML}
          </td>`;
      }
    }

    // Restliche Felder bis zum Ende der letzten Kalenderzeile
    const totalCells = startDay + lastDate;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remainingCells; i++) {
      calendarHTML += `<td></td>`;
    }

    calendarHTML += `</tr></tbody></table></div>`;

    // Timeout, damit das DOM das HTML bereits gerendert hat
    setTimeout(() => {
      const prevBtn = document.getElementById("prevMonth");
      const nextBtn = document.getElementById("nextMonth");
      if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => changeMonth(-1));
        nextBtn.addEventListener("click", () => changeMonth(1));
      }

      // Event-Popups positionieren
      const eventDays = document.querySelectorAll(".event-day");
      eventDays.forEach((td) => {
        const popup = td.querySelector(".event-popup");
        if (popup) {
          td.addEventListener("mouseenter", () => {
            positionPopup(td, popup);
            popup.style.display = "block";
          });
          td.addEventListener("mouseleave", () => {
            popup.style.display = "none";
          });
        }
      });
    }, 0);

    return calendarHTML;
  }

  /**
   * Ändert den Monat im Kalender (vorwärts oder rückwärts).
   * 
   * @param {number} direction - -1 (Vormonat) oder +1 (Nächster Monat).
   */
  function changeMonth(direction) {
    currentMonthGlobal += direction;
    if (currentMonthGlobal < 0) {
      currentMonthGlobal = 11;
      currentYearGlobal -= 1;
    } else if (currentMonthGlobal > 11) {
      currentMonthGlobal = 0;
      currentYearGlobal += 1;
    }
    const sidebarContent = document.querySelector("#calendarContainer");
    if (sidebarContent) {
      sidebarContent.innerHTML = generateCalendar();
    }
  }

  /**
   * Berechnet die korrekte Position eines angezeigten Event-Popups im Kalender,
   * damit es nicht aus dem sichtbaren Fensterbereich herausragt.
   * 
   * @param {HTMLElement} td - Das Tabellenfeld, über dem sich das Popup befinden soll.
   * @param {HTMLElement} popup - Das Popup-Element selbst.
   */
  function positionPopup(td, popup) {
    popup.style.display = "block";
    popup.style.visibility = "hidden";

    const rect = td.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();

    let top = rect.bottom + window.scrollY;
    let left = rect.left + rect.width / 2 - popupRect.width / 2 + window.scrollX;

    // Verhindert Überlappen des Popups über den rechten Fensterrand
    if (left + popupRect.width > window.innerWidth) {
      left = window.innerWidth - popupRect.width - 10;
    }
    // Verhindert Überlappen des Popups über den linken Fensterrand
    if (left < 0) {
      left = 10;
    }
    // Verhindert Überlappen des Popups nach unten
    if (top + popupRect.height > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - popupRect.height;
    }

    popup.style.position = "fixed";
    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
    popup.style.visibility = "visible";
  }


  // --------------------------------------------------
  // HAUPT-INITIALISIERUNG & EVENT-LISTENER
  // --------------------------------------------------

  // Header-Funktionen starten (Navigation, AvatarPopup etc.)
  setupHeaderJS();

  // Sidebar laden (falls existiert) und darin Kalender platzieren
  const sidebarContainer = document.getElementById("sidebar");
  if (sidebarContainer) {
    fetch("../assets/components/sidebar.html")
      .then((response) => response.text())
      .then((data) => {
        sidebarContainer.innerHTML = data;
        globalSidebarContainer = sidebarContainer;
        updateNotificationDisplay(globalSidebarContainer);

        // KalenderContainer im Sidebar-DOM suchen und Kalender erzeugen
        const calendarContainer = sidebarContainer.querySelector("#calendarContainer");
        if (calendarContainer) {
          calendarContainer.innerHTML = generateCalendar();
        }
      })
      .catch((error) => console.error("Fehler beim Laden von sidebar.html:", error));
  }

  // --------------------------------
  // Passwort-Feld (Auge-Icon) - Umschalten "Password" <-> "Text"
  // --------------------------------
  const togglePasswordBtn = document.querySelector(".toggle-password");
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", () => {
      const passwordField = document.getElementById("password");
      const icon = togglePasswordBtn.querySelector("i");
      if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        passwordField.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  }

  // --------------------------------
  // Dark Mode Umschalten
  // --------------------------------
  const darkModeToggle = document.getElementById("darkModeToggle");
  const modeLabel = document.getElementById("modeLabel");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      const icons = document.querySelectorAll(".fas, .toggle-password i");

      if (darkModeToggle.checked) {
        document.body.classList.add("dark-mode");
        if (modeLabel) modeLabel.textContent = "🌙 Dark Mode";
        icons.forEach((icon) => {
          icon.style.color = "#fff";
        });
      } else {
        document.body.classList.remove("dark-mode");
        if (modeLabel) modeLabel.textContent = "☀️ Light Mode";
        icons.forEach((icon) => {
          icon.style.color = "";
        });
      }
    });
  }

  // --------------------------------
  // Login-Formular (Umleitung zur dashboard.html)
  // --------------------------------
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      window.location.href = "dashboard.html";
    });
  }

  // --------------------------------
  // Upload-Bereich für Hausaufgaben
  // (Nur aktiv auf Seite upload-assignment.html)
  // --------------------------------
  if (currentPage === "upload-assignment") {
    loadSubmittedFiles();

    const uploadArea = document.getElementById("uploadArea");
    const submitButton = document.getElementById("submitButton");
    const uploadProgress = document.getElementById("uploadProgress");
    const progressFill = document.getElementById("progressFill");
    const progressPercentage = document.getElementById("progressPercentage");

    // Drag & Drop
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

    // Abgabe-Button
    if (submitButton) {
      submitButton.addEventListener("click", () => {
        submitButton.disabled = true;
        if (uploadProgress) uploadProgress.style.display = "block";
        if (progressFill) progressFill.style.width = "0%";
        if (progressPercentage) {
          progressPercentage.style.display = "block";
          progressPercentage.textContent = "0%";
        }

        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 10) + 5;
          if (progress > 100) progress = 100;
          if (progressFill) progressFill.style.width = `${progress}%`;
          if (progressPercentage) progressPercentage.textContent = `${progress}%`;

          if (progress === 100) {
            clearInterval(interval);
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

            localStorage.setItem("assignment11Uploaded", "true");
            localStorage.setItem("assignment11SubmittedFiles", JSON.stringify(submittedFiles));

            checkSubmitButtonVisibility();
            submitButton.disabled = false;
            updateNotificationDisplay(globalSidebarContainer || document);
          }
        }, 500);
      });
    }

    // Beim Verlassen der Seite alles zurücksetzen
    window.addEventListener("beforeunload", () => {
      const fileList = document.getElementById("fileList");
      const fileTable = document.getElementById("fileTable");
      const submitButton = document.getElementById("submitButton");
      if (fileList) fileList.innerHTML = "";
      if (fileTable) fileTable.style.display = "none";
      if (submitButton) submitButton.style.display = "none";
    });
  }

  // --------------------------------
  // Dashboard-spezifische Logik
  // --------------------------------
  if (currentPage === "dashboard") {
    const rows = document.querySelectorAll(".table-tasks tbody tr");
    let hasSubmittedHA11 = false;

    // Prüft, ob HA11 bereits hochgeladen wurde
    rows.forEach((row) => {
      const kursCell = row.cells[0]?.textContent.trim();
      const aufgabeCell = row.cells[1]?.textContent.trim();

      if (
        kursCell === "Grundlagen der MCI" &&
        aufgabeCell.includes("Hausaufgabe 11")
      ) {
        const isUploaded = localStorage.getItem("assignment11Uploaded") === "true";
        const tdStatus = row.cells[3];
        if (tdStatus) {
          const checkbox = tdStatus.querySelector('input[type="checkbox"]');
          if (checkbox) {
            if (isUploaded) {
              checkbox.checked = true;
              tdStatus.innerHTML = `<input type="checkbox" checked disabled /> Abgegeben`;
              hasSubmittedHA11 = true;
            } else {
              checkbox.checked = false;
              tdStatus.innerHTML = `<input type="checkbox" disabled /> Nicht abgegeben`;
            }
          }
        }
      }
    });

    // Fortschrittsbalken aktualisieren
    const progressFill = document.getElementById("dashboardOverallProgressFill");
    const progressText = document.getElementById("dashboardOverallProgressPercent");
    if (progressFill && progressText) {
      const newPercent = hasSubmittedHA11 ? 84 : 82;
      progressFill.style.width = `${newPercent}%`;
      progressText.textContent = `Gesamtfortschritt: ${newPercent}%`;
    }
  }

  // --------------------------------
  // Roboter-Avatar mit Chat-Funktion (gilt global, außer auf Login-Seite)
  // --------------------------------
  const robotAvatar = document.querySelector(".robot-avatar img");
  if (robotAvatar) {
    // Chat-Bubble anlegen
    const chatBubble = document.createElement("div");
    chatBubble.classList.add("robot-chat-bubble");
    chatBubble.innerHTML = `
      <span class="chat-close"><i class="fa-solid fa-xmark"></i></span>
      <div class="robot-chat-title"></div>
      <div class="robot-chatbox">
        <div class="chat-input">
          <input type="text" placeholder="Deine Frage..." />
          <button class="btn-send"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
    `;
    document.body.appendChild(chatBubble);
    chatBubble.style.display = "none";

    // Chat-Bubble nur anzeigen, wenn nicht auf Login-Seite
    const isLoginPage = document.body.classList.contains("page-login");
    if (!isLoginPage && localStorage.getItem("chatOpen") === "true") {
      chatBubble.style.display = "block";
      const chatTitleEl = chatBubble.querySelector(".robot-chat-title");
      chatTitleEl.textContent = "Wie kann ich dir weiterhelfen?";
    }

    // Klick auf das Roboterbild: Chat-Bubble ein-/ausblenden
    robotAvatar.addEventListener("click", () => {
      if (chatBubble.style.display === "none") {
        chatBubble.style.display = "block";
        localStorage.setItem("chatOpen", "true");
        const chatTitleEl = chatBubble.querySelector(".robot-chat-title");
        chatTitleEl.textContent = "";
        typeText(chatTitleEl, "Wie kann ich dir weiterhelfen?");
      } else {
        chatBubble.style.display = "none";
        localStorage.setItem("chatOpen", "false");
        const userInput = chatBubble.querySelector(".chat-input input");
        if (userInput) {
          userInput.value = "";
        }
      }
    });

    // Positionierung des Chat-Bubbles
    chatBubble.style.bottom = `20px`;
    chatBubble.style.right = `80px`;

    // Schließen-Button (X) in der Chat-Bubble
    const closeBtn = chatBubble.querySelector(".chat-close");
    closeBtn.addEventListener("click", () => {
      chatBubble.style.display = "none";
      localStorage.setItem("chatOpen", "false");
      const userInput = chatBubble.querySelector(".chat-input input");
      if (userInput) {
        userInput.value = "";
      }
    });
  }
});