/*
Diese Datei verwaltet die Konfiguration und Persistenz der System-Prompt-Variablen inkl. Konversationshistorie, Seitenzustände und Nutzerdaten.
*/

const STORAGE_KEY = "systemPromptVars";
/* Standardkonfiguration für System-Prompt-Variablen */
const systemPromptVariables = {
  conversationHistory: [],
  currentPage: null,
  submittedFilesForHA11: [],
  isCorrectionSubmitted: false,
  userRole: "student",
  username: "",
};

/* Vordefinierte Fehlermeldungen für verschiedene Systemzustände */
const PREDEFINED_BOT_ERRORS = {
  NO_API_KEY:
    "Bitte kontaktiere die Entwickler vom Assignt Upload Tool. [Fehlermeldung: Kein API-Key eingetragen]",
  INVALID_KEY:
    "Bitte kontaktiere die Entwickler vom Assignt Upload Tool. [Fehlermeldung: Ungültiger API-Key]",
  NO_QUOTA_OR_OTHER_ERROR:
    "Bitte kontaktiere die Entwickler vom Assignt Upload Tool. [Fehler: Kein Kontingent mehr oder anderweitiger Fehler]",
  ALL_REQUESTS_FAILED:
    "Bitte kontaktiere die Entwickler. [Fehler: Keine Antwort, alle Modelle schlugen fehl]",
  UNKNOWN_ISSUE:
    "Bitte kontaktiere die Entwickler vom Assignt Upload Tool. [Fehler: unknown issue]",
  NO_INTERNET: "Entschuldige, ich habe derzeit keinen Internetzugriff.",
};

/* LocalStorage-Management für Persistenz über Seitenwechsel */
function loadSystemPromptFromLocalStorage() {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) return;
  try {
    const parsed = JSON.parse(json);

    if (typeof parsed === "object" && parsed) {
      Object.assign(systemPromptVariables, parsed);
    }
  } catch (e) {}
}

function saveSystemPromptToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(systemPromptVariables));
}

loadSystemPromptFromLocalStorage();
/* Getter und Setter für System-Prompt-Variablen */

export function getSystemPromptVariables() {
  return { ...systemPromptVariables };
}

export function setCurrentPage(pageEnumValue) {
  systemPromptVariables.currentPage = pageEnumValue;
  saveSystemPromptToLocalStorage();
}

export function setUserRole(role) {
  systemPromptVariables.userRole = role;
  saveSystemPromptToLocalStorage();
}

export function setUsername(nameStr) {
  systemPromptVariables.username = nameStr;
  saveSystemPromptToLocalStorage();
}

export function setSubmittedFilesForHA11(fileNamesArray) {
  systemPromptVariables.submittedFilesForHA11 = fileNamesArray;
  saveSystemPromptToLocalStorage();
}

export function setIsCorrectionSubmitted(boolValue) {
  systemPromptVariables.isCorrectionSubmitted = boolValue;
  saveSystemPromptToLocalStorage();
}

export function pushToConversationHistory(messageObj) {
  systemPromptVariables.conversationHistory.push(messageObj);
  // Nach jedem Push => speichert in LocalStorage
  saveSystemPromptToLocalStorage();
}

export function resetSystemPromptVariables() {
  systemPromptVariables.conversationHistory = [];
  systemPromptVariables.currentPage = null;
  systemPromptVariables.submittedFilesForHA11 = [];
  systemPromptVariables.isCorrectionSubmitted = false;
  systemPromptVariables.userRole = "student";
  systemPromptVariables.username = "";

  localStorage.removeItem(STORAGE_KEY);
}

export function appendPredefinedErrorMessage(errorKey) {
  const errorMessage = PREDEFINED_BOT_ERRORS[errorKey];
  if (errorMessage) {
    pushToConversationHistory({
      role: "bot",
      errorRef: errorKey,
    });
  }
}

export { PREDEFINED_BOT_ERRORS };
