import { eventsByDate } from "../data/events.js";
import {
  currentMonthGlobal,
  currentYearGlobal,
  setCurrentMonthGlobal,
  setCurrentYearGlobal,
} from "../utils/global-state.js";

/* Generiert die HTML-Struktur des Kalenders und bindet Event-Handler ein */
export function generateCalendar() {
  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];
  const daysOfWeek = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const firstDay = new Date(currentYearGlobal, currentMonthGlobal, 1).getDay();
  const lastDate = new Date(
    currentYearGlobal,
    currentMonthGlobal + 1,
    0
  ).getDate();
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

  daysOfWeek.forEach((day) => {
    calendarHTML += `<th>${day}</th>`;
  });
  calendarHTML += `</tr></thead><tbody><tr>`;

  let startDay = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < startDay; i++) {
    calendarHTML += `<td></td>`;
  }

  const today = new Date();

  for (let date = 1; date <= lastDate; date++) {
    const currentDate = new Date(currentYearGlobal, currentMonthGlobal, date);
    const isToday =
      date === today.getDate() &&
      currentMonthGlobal === today.getMonth() &&
      currentYearGlobal === today.getFullYear();

    if ((startDay + date - 1) % 7 === 0 && date !== 1) {
      calendarHTML += `</tr><tr>`;
    }
    let eventsHTML = "";
    const eventKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;

    if (eventsByDate[eventKey]) {
      const event = eventsByDate[eventKey];
      const eventText = event.text;
      const eventColor = event.color;
      const eventDate = new Date(currentYearGlobal, currentMonthGlobal, date);
      const isPast = eventDate < today;
      const dotClass = isPast ? "event-dot past-event" : "event-dot";

      const dotStyle = isPast ? "" : `style="background-color: ${eventColor};"`;
      eventsHTML = `
                <div class="${dotClass}" ${dotStyle}></div>
                <div class="event-popup" id="popup-${date}">${eventText}</div>`;
    } else {
      eventsHTML = `<div class="event-dot no-event"></div>`;
    }

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

  const totalCells = startDay + lastDate;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 0; i < remainingCells; i++) {
    calendarHTML += `<td></td>`;
  }
  calendarHTML += `</tr></tbody></table></div>`;

  setTimeout(() => {
    const prevBtn = document.getElementById("prevMonth");
    const nextBtn = document.getElementById("nextMonth");
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", () => changeMonth(-1));
      nextBtn.addEventListener("click", () => changeMonth(1));
    }

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

/* Navigationslogik zwischen den Monaten */
function changeMonth(direction) {
  let newMonth = currentMonthGlobal + direction;
  let newYear = currentYearGlobal;
  if (newMonth < 0) {
    newMonth = 11;
    newYear -= 1;
  } else if (newMonth > 11) {
    newMonth = 0;
    newYear += 1;
  }

  setCurrentMonthGlobal(newMonth);
  setCurrentYearGlobal(newYear);
  const calendarContainer = document.querySelector("#calendarContainer");
  if (calendarContainer) {
    calendarContainer.innerHTML = generateCalendar();
  }
}

/* Intelligente Positionierung der Event-Popups innerhalb des sichtbaren Bereichs */
function positionPopup(td, popup) {
  popup.style.display = "block";
  popup.style.visibility = "hidden";
  const rect = td.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  let top = rect.bottom + window.scrollY;
  let left = rect.left + rect.width / 2 - popupRect.width / 2 + window.scrollX;

  if (left + popupRect.width > window.innerWidth) {
    left = window.innerWidth - popupRect.width - 10;
  }

  if (left < 0) {
    left = 10;
  }

  if (top + popupRect.height > window.innerHeight + window.scrollY) {
    top = rect.top + window.scrollY - popupRect.height;
  }
  popup.style.position = "fixed";
  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;
  popup.style.visibility = "visible";
}
