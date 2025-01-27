/*
Diese Datei initialisiert und verwaltet die Seitenleiste mit Benachrichtigungen und Kalender.
*/

import {
  updateNotificationDisplay,
  initializeNotifications,
} from "/assets/js/components/notifications.js";
import { generateCalendar } from "/assets/js/components/calendar.js";

export function setupSidebarJS() {
  const sidebarContainer = document.querySelector(".sidebar");
  if (sidebarContainer) {
    initializeNotifications(sidebarContainer);

    updateNotificationDisplay(sidebarContainer);

    const calendarContainer =
      sidebarContainer.querySelector("#calendarContainer");
    if (calendarContainer) {
      calendarContainer.innerHTML = generateCalendar();
    }
  }
}
