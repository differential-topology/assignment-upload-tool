/*
Diese Datei implementiert die OpenRouter.ai API-Integration mit Modellverwaltung, Fallback-Logik und Logger-System.
*/

/* API-Key-Validierung und Status-Management */
import { getCurrentAbortController } from "/assets/js/utils/global-state.js";
import { Logger } from "/assets/js/components/logger.js";

let loggerInstance = null;
/* Logger-Initialisierung mit DOM-Fallback */
export function getLogger() {
  if (loggerInstance) {
    return loggerInstance;
  }

  /* Fallback-Container für Logger falls #logger nicht existiert */
  let loggerDiv = document.getElementById("logger");
  if (!loggerDiv) {
    let tempDiv = document.getElementById("tempLoggerContainer");
    if (!tempDiv) {
      tempDiv = document.createElement("div");
      tempDiv.id = "tempLoggerContainer";
      tempDiv.style.display = "none";
      document.body.appendChild(tempDiv);
    }
    loggerDiv = document.createElement("div");
    loggerDiv.id = "logger";
    loggerDiv.classList.add("logger-container");
    tempDiv.appendChild(loggerDiv);
  }

  loggerInstance = new Logger("logger");
  return loggerInstance;
}

/* API-Key-Validierung mit Status-Rückgabe */
export async function getApiKeyStatus(key) {
  const logger = getLogger();
  const trimmedKey = key ? key.trim() : "";
  /* Validierungslogik mit Fehlermeldungen */
  if (!trimmedKey) {
    if (logger) {
      logger.warn("Kein API-Schlüssel");
    }
    return { status: "empty-key" };
  }

  if (!navigator.onLine) {
    if (logger) {
      logger.warn("Keine Internetverbindung", {
        reason: "Navigator offline",
      });
    }
    return { status: "no-internet" };
  }

  let response = null;
  let responseText = null;
  /* API-Validierungsanfrage */
  try {
    response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${trimmedKey}`,
      },
    });
    responseText = await response.text();
  } catch (error) {
    if (logger) {
      logger.warn("Keine Internetverbindung", {
        error: error.toString(),
      });
    }
    return { status: "no-internet" };
  }
  if (!response.ok) {
    if (logger) {
      logger.error("Ungültiger API-Schlüssel", {
        httpStatus: response.status,
        body: responseText,
      });
    }
    return { status: "invalid-key" };
  } else {
    if (logger) {
      logger.info("Gültiger API-Schlüssel", {
        httpStatus: response.status,
        body: responseText,
      });
    }
    return { status: "valid-key", apiKey: trimmedKey };
  }
}

/* Modell-Mapping und Auswahl-Logik */
const modelMapping = {
  google_gemini_experimental_1206: "google/gemini-exp-1206:free",
  google_gemini_flash_thinking_experimental:
    "google/gemini-2.0-flash-thinking-exp:free",
  google_gemini_flash_2_experimental: "google/gemini-2.0-flash-exp:free",
  meta_llama_3_1_405b_instruct: "meta-llama/llama-3.1-405b-instruct:free",
  meta_llama_3_1_70b_instruct: "meta-llama/llama-3.1-70b-instruct:free",
  meta_llama_3_1_8b_instruct: "meta-llama/llama-3.1-8b-instruct:free",
  microsoft_phi_3_mini_128k_instruct: "microsoft/phi-3-mini-128k-instruct:free",
  mistral_mistral_7b_instruct: "mistralai/mistral-7b-instruct:free",
};
/* Modellauswahl mit Fallback */
export function getSelectedModels() {
  const m1 = document.getElementById("modelSelect1")?.value || "";
  const m2 = document.getElementById("modelSelect2")?.value || "";
  const m3 = document.getElementById("modelSelect3")?.value || "";
  const arr = [];
  if (m1 && modelMapping[m1]) arr.push(modelMapping[m1]);
  if (m2 && modelMapping[m2]) arr.push(modelMapping[m2]);
  if (m3 && modelMapping[m3]) arr.push(modelMapping[m3]);

  if (arr.length === 0) {
    arr.push("mistralai/mistral-7b-instruct:free");
  }
  return arr;
}
/* OpenRouter API-Anfrage ohne Streaming */

async function openRouterRequestNoStream(modelIdentifier, userText, apiKey) {
  const logger = getLogger();
  const requestPayload = {
    model: modelIdentifier,
    stream: false,
    messages: [{ role: "user", content: userText }],
  };
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost",
          "X-Title": "ChatbotApp",
        },
        body: JSON.stringify(requestPayload),
        signal: getCurrentAbortController()?.signal,
      }
    );
    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      if (logger) {
        logger.error("Parsing-Fehler", {
          originalResponse: rawText,
          parseError: parseError.toString(),
        });
      }
      throw parseError;
    }
    if (!response.ok) {
      const errorMsg = "Keine Antwort erhalten";
      if (logger) {
        logger.error(errorMsg, {
          httpStatus: response.status,
          responseData: data,
        });
      }
      throw new Error(errorMsg);
    }
    return data.choices?.[0]?.message?.content || "";
  } catch (err) {
    throw err;
  }
}

/* Fallback-Mechanismus für mehrere Modelle */
export async function requestOpenRouterWithFallback(models, userText, apiKey) {
  const logger = getLogger();

  const attemptDetails = [];
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const answer = await openRouterRequestNoStream(model, userText, apiKey);

      if (!answer || !answer.trim()) {
        if (logger) {
          logger.warn("Leere Antwort", { response: answer, model });
        }

        throw new Error("EmptyResponse");
      }

      if (i > 0 && logger) {
        logger.info("Fallback genutzt", {
          attempts: attemptDetails,
          successfulModel: model,
        });
      }
      return answer;
    } catch (err) {
      attemptDetails.push({
        model,
        error: err.toString(),
      });

      if (err.name === "AbortError") {
        throw err;
      }
    }
  }

  const errorMessage = "Alle angefragten Modelle sind fehlgeschlagen";
  if (logger) {
    logger.error("Alle Fallbacks fehlgeschlagen", {
      attempts: attemptDetails,
    });
  }
  throw new Error("AllRequestsFailed");
}
