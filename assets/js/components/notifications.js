/*
Diese Datei implementiert ein Benachrichtigungssystem mit dynamischer Zeitanzeige, Sortierung und Badge-Counter.
*/

import { globalSidebarContainer } from "/assets/js/utils/global-state.js";

/* Lokaler Storage für Benachrichtigungen und deren Status */
function getPrevBadgeCount() {
  return parseInt(localStorage.getItem("prevBadgeCount") || "0", 10);
}
function setPrevBadgeCount(val) {
  localStorage.setItem("prevBadgeCount", String(val));
}

function getOpenNotifications() {
  const stored = localStorage.getItem("openNotifications");
  return stored ? JSON.parse(stored) : [];
}
function setOpenNotifications(openNotifs) {
  localStorage.setItem("openNotifications", JSON.stringify(openNotifs));
}

function ensureNewCorrectionDefault() {
  if (!localStorage.getItem("sessionNotificationsInitialized")) {
    let openNotifs = getOpenNotifications();
    if (!openNotifs.includes("newCorrection")) {
      openNotifs.push("newCorrection");
      setOpenNotifications(openNotifs);
    }
    localStorage.setItem("sessionNotificationsInitialized", "true");
  }
}

/* Timestamp-Verwaltung für die relative Zeitanzeige */
function getNotificationTimestamps() {
  return JSON.parse(localStorage.getItem("notificationTimestamps") || "{}");
}
function setNotificationTimestamps(map) {
  localStorage.setItem("notificationTimestamps", JSON.stringify(map));
}

function setNotificationTimestamp(notifId, timestamp) {
  const tsMap = getNotificationTimestamps();
  tsMap[notifId] = timestamp;
  setNotificationTimestamps(tsMap);
}

function getNotificationTimestamp(notifId) {
  const tsMap = getNotificationTimestamps();
  return tsMap.hasOwnProperty(notifId) ? parseInt(tsMap[notifId], 10) : null;
}

function removeNotificationTimestamp(notifId) {
  const tsMap = getNotificationTimestamps();
  if (tsMap.hasOwnProperty(notifId)) {
    delete tsMap[notifId];
    setNotificationTimestamps(tsMap);
  }
}

/* Kernfunktionen für das Hinzufügen und Aktualisieren von Benachrichtigungen */
export function addNewNotification(title, time) {
  const sidebar =
    globalSidebarContainer instanceof HTMLElement
      ? globalSidebarContainer
      : document.documentElement;

  const newNotif = document.createElement("div");
  newNotif.classList.add("notification");
  const notifId = "dynamic_" + Date.now();
  newNotif.setAttribute("data-notification-id", notifId);
  newNotif.setAttribute("data-dynamic-time", "true");
  newNotif.innerHTML = `
    <span class="notification-close"><i class="fa-solid fa-xmark"></i></span>
    <p class="notification-title">${title}</p>
    <p class="notification-time">${time}</p>
  `;

  let openNotifs = getOpenNotifications();
  openNotifs.push(notifId);
  setOpenNotifications(openNotifs);

  setNotificationTimestamp(notifId, Date.now());

  const existingNotifs = sidebar.querySelectorAll(".notification");
  if (existingNotifs.length > 0) {
    existingNotifs[0].parentNode.insertBefore(newNotif, existingNotifs[0]);
  } else {
    const sidebarContent = sidebar.querySelector(".sidebar-content");
    if (sidebarContent) {
      sidebarContent.appendChild(newNotif);
    } else {
      sidebar.appendChild(newNotif);
    }
  }

  initializeNotifications(sidebar);
  updateNotificationDisplay(sidebar);
}

export function initializeNotifications(container = document.documentElement) {
  ensureNewCorrectionDefault();
  setupNotificationCloseButtons(container);
  startDynamicTimeUpdater(container);
}

function setupNotificationCloseButtons(container) {
  const closeButtons = container.querySelectorAll(".notification-close");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const notificationEl = btn.closest(".notification");
      if (!notificationEl) return;

      const notifId = notificationEl.getAttribute("data-notification-id");
      if (notifId) {
        let openNotifs = getOpenNotifications();
        openNotifs = openNotifs.filter((id) => id !== notifId);
        setOpenNotifications(openNotifs);

        removeNotificationTimestamp(notifId);
      }

      notificationEl.style.display = "none";
      updateNotificationBadge(container);
      updateNoNotificationsPlaceholder(container);
    });
  });
}

export function updateNotificationDisplay(
  container = document.documentElement
) {
  const notifications = container.querySelectorAll(".notification");

  notifications.forEach((notif) => {
    const notifId = notif.getAttribute("data-notification-id");
    if (!notifId) return;

    if (isNotificationClosed(notifId)) {
      notif.style.display = "none";
    } else {
      notif.style.display = "";
    }
  });

  updateNotificationBadge(container);
  updateNoNotificationsPlaceholder(container);

  updateDynamicTimes(container);

  reorderOpenNotifications(container);
}

/* Zeitaktualisierung und Sortierung der Benachrichtigungen */
function reorderOpenNotifications(container) {
  const sidebarEl = container.querySelector(".sidebar") || container;
  const calendarContainer = sidebarEl.querySelector("#calendarContainer");

  const allNotifs = Array.from(sidebarEl.querySelectorAll(".notification"));

  const openNotifs = allNotifs.filter(
    (n) => !isNotificationClosed(n.getAttribute("data-notification-id"))
  );

  const newCorrection = openNotifs.find(
    (n) => n.getAttribute("data-notification-id") === "newCorrection"
  );
  const others = openNotifs.filter((n) => n !== newCorrection);

  others.sort((a, b) => {
    const tsA =
      getNotificationTimestamp(a.getAttribute("data-notification-id")) || 0;
    const tsB =
      getNotificationTimestamp(b.getAttribute("data-notification-id")) || 0;

    return tsB - tsA;
  });

  others.forEach((notif) => {
    sidebarEl.insertBefore(notif, calendarContainer);
  });

  if (newCorrection) {
    sidebarEl.insertBefore(newCorrection, calendarContainer);
  }
}

function isNotificationClosed(notificationId) {
  const openNotifs = getOpenNotifications();
  return !openNotifs.includes(notificationId);
}
/* Badge-Counter und Platzhalter-Management */

export function updateNotificationBadge(container = document.documentElement) {
  const openNotifs = getOpenNotifications();
  const visibleCount = openNotifs.length;
  const badge = document.querySelector(".notification-badge");
  const oldCount = getPrevBadgeCount();

  if (badge) {
    if (visibleCount > 0) {
      badge.style.display = "inline-block";
      if (visibleCount > oldCount) {
        badge.textContent = String(visibleCount);
        badge.classList.add("badge-increment");
        setTimeout(() => {
          badge.classList.remove("badge-increment");
        }, 500);
      } else {
        badge.textContent = String(visibleCount);
      }
    } else {
      badge.style.display = "none";
    }
  }
  setPrevBadgeCount(visibleCount);
}

function updateNoNotificationsPlaceholder(container) {
  const openNotifs = getOpenNotifications();
  const sidebarEl = container.querySelector(".sidebar") || container;
  let placeholderEl = sidebarEl.querySelector(".no-notifications-placeholder");

  if (openNotifs.length === 0) {
    if (!placeholderEl) {
      placeholderEl = document.createElement("div");
      placeholderEl.classList.add("no-notifications-placeholder");
      placeholderEl.textContent = "Keine neuen Benachrichtigungen";
      const sidebarContent = sidebarEl.querySelector(".sidebar-content");
      if (sidebarContent) {
        sidebarEl.insertBefore(placeholderEl, sidebarContent);
      } else {
        sidebarEl.appendChild(placeholderEl);
      }
    }
  } else {
    if (placeholderEl) {
      placeholderEl.remove();
    }
  }
}

function startDynamicTimeUpdater(container) {
  updateDynamicTimes(container);

  setInterval(() => {
    updateDynamicTimes(container);
  }, 60000);
}

function updateDynamicTimes(container) {
  const dynamicNotifs = container.querySelectorAll(
    ".notification[data-dynamic-time='true']"
  );

  dynamicNotifs.forEach((notif) => {
    const notifId = notif.getAttribute("data-notification-id");
    if (!notifId) return;
    if (isNotificationClosed(notifId)) {
      return;
    }
    const timeEl = notif.querySelector(".notification-time");
    if (!timeEl) return;

    let createdTs = getNotificationTimestamp(notifId);

    if (createdTs === null) {
      const htmlData = timeEl.getAttribute("data-created-ts");
      if (htmlData) {
        const fromHtml = parseInt(htmlData, 10);
        if (!isNaN(fromHtml)) {
          createdTs = fromHtml;
        }
      }

      if (!createdTs) {
        createdTs = Date.now();
      }
      setNotificationTimestamp(notifId, createdTs);
    }

    const diffMs = Date.now() - createdTs;
    const diffMin = Math.floor(diffMs / (1000 * 60));

    if (diffMin < 1) {
      timeEl.textContent = "Gerade eben";
    } else if (diffMin === 1) {
      timeEl.textContent = "Vor einer Minute";
    } else {
      timeEl.textContent = `Vor ${diffMin} Minuten`;
    }
  });
}

export {
  getOpenNotifications,
  setOpenNotifications,
  getNotificationTimestamp,
  setNotificationTimestamp,
  removeNotificationTimestamp,
};
