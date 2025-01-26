/*
Diese Datei verwaltet den globalen Zustand der Anwendung mit Variablen für Kalender, Chat und UI-Konfiguration.
*/

/* Basis-Variablen für Kalender und Sidebar */
export let currentMonthGlobal = new Date().getMonth();
export let currentYearGlobal = new Date().getFullYear();
export let globalSidebarContainer = null;

export function setCurrentMonthGlobal(month) {
  currentMonthGlobal = month;
}
export function setCurrentYearGlobal(year) {
  currentYearGlobal = year;
}
export function setGlobalSidebarContainer(sidebar) {
  globalSidebarContainer = sidebar;
}

/* Chat-Status und Steuerung der KI-Generierung */
let _userHasMessaged = false;
let _isGenerating = false;
let _currentAbortController = null;

/* Konstanten für Chat-Bubble Layout */
export const MAX_BUBBLE_HEIGHT = 500;

export const INNER_MAX_HEIGHT = MAX_BUBBLE_HEIGHT - 2;

export function getUserHasMessaged() {
  return _userHasMessaged;
}
export function setUserHasMessaged(value) {
  _userHasMessaged = value;
}

export function getIsGenerating() {
  return _isGenerating;
}
export function setIsGenerating(value) {
  _isGenerating = value;
}

export function getCurrentAbortController() {
  return _currentAbortController;
}
export function setCurrentAbortController(controller) {
  _currentAbortController = controller;
}
