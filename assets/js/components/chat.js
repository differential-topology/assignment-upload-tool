/*
Diese Datei implementiert die Chat-Funktionalität mit OpenRouter-API-Integration, Fehlerbehandlung und UI-Feedback.
*/

import {
  adjustChatLayout,
  displayUserMessage,
  appendBotMessageToChat,
  playAntennaWiggle,
  stopAntennaWiggle,
} from "/assets/js/components/robot.js";

import {
  getApiKeyStatus,
  getSelectedModels,
  requestOpenRouterWithFallback,
} from "/assets/js/utils/openrouter.js";

import {
  getIsGenerating,
  setIsGenerating,
  getCurrentAbortController,
  setCurrentAbortController,
} from "/assets/js/utils/global-state.js";

import { getLogger } from "/assets/js/utils/openrouter.js";
import { appendPredefinedErrorMessage } from "/assets/js/utils/system-prompt-config.js";
import { buildSystemPrompt } from "/assets/js/utils/system-prompt-builder.js";

let logger = null;
/* Event-Handler für Chat-Interaktionen und Statusverwaltung */
document.addEventListener("DOMContentLoaded", function () {
  const chatBubble = document.querySelector(".robot-chat-bubble");
  if (!chatBubble) {
    return;
  }

  logger = getLogger();

  const btnSend = chatBubble.querySelector(".btn-send");
  const userInput = chatBubble.querySelector(".chat-input textarea");
  const chatMessages = chatBubble.querySelector(".robot-chatbox");

  if (btnSend && userInput && chatMessages) {
    const checkInputStatus = function () {
      const textValue = userInput.value;
      const textLength = textValue.length;

      if (!getIsGenerating()) {
        if (!textValue.trim()) {
          btnSend.setAttribute("disabled", "disabled");
          btnSend.classList.add("disabled");
          btnSend.title = "Bitte Text eingeben, um zu senden.";
        } else if (textLength > 5000) {
          btnSend.setAttribute("disabled", "disabled");
          btnSend.classList.add("disabled");
          btnSend.title = `Text zu lang (${textLength} / 5000)`;
        } else {
          btnSend.removeAttribute("disabled");
          btnSend.classList.remove("disabled");
          btnSend.title = "Senden";
        }
      } else {
        btnSend.removeAttribute("disabled");
        btnSend.classList.remove("disabled");
        btnSend.title = "Stopp";
      }
    };

    checkInputStatus();
    userInput.addEventListener("input", checkInputStatus);

    userInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!btnSend.disabled) {
          btnSend.click();
        }
      }
    });
    /* Hauptfunktion für das Senden und Empfangen von Nachrichten */
    btnSend.addEventListener("click", async function (e) {
      e.preventDefault();

      if (getIsGenerating()) {
        const currentCtrl = getCurrentAbortController();
        if (currentCtrl) {
          currentCtrl.abort();
          if (logger) {
            logger.warn("Anfrage abgebrochen");
          }
        } else {
        }

        finishRequest();
        return;
      }

      const inputValue = userInput.value.trim();
      if (!inputValue || inputValue.length > 5000) {
        return;
      }

      displayUserMessage(inputValue);

      playAntennaWiggle();

      setIsGenerating(true);
      btnSend.innerHTML = `<i class="fa-solid fa-stop"></i>`;
      btnSend.title = "Stopp";

      const newCtrl = new AbortController();
      setCurrentAbortController(newCtrl);

      let finalBotResponse = "";

      let errorOccurred = false;

      let usedApiKey = "";
      const apiKeyInput = document.getElementById("apiKeyInput");
      if (apiKeyInput) {
        usedApiKey = apiKeyInput.value.trim();
      } else {
        const storedKey = localStorage.getItem("devApiKey") || "";
        usedApiKey = storedKey.trim();
      }

      const keyStatusResult = await getApiKeyStatus(usedApiKey);

      if (keyStatusResult.status === "no-internet") {
        finalBotResponse =
          "Entschuldige, ich habe derzeit keinen Internetzugriff.";
        appendBotMessageToChat(finalBotResponse);
        errorOccurred = true;
        finishRequest(true);
        return;
      } else if (keyStatusResult.status === "invalid-key") {
        appendPredefinedErrorMessage("INVALID_KEY");
        appendBotMessageToChat(
          "Bitte kontaktiere die Entwickler vom Assignment Upload Tool. [Fehlermeldung: Ungültiger API-Key]"
        );
        errorOccurred = true;
        finishRequest(true);
        return;
      } else if (keyStatusResult.status === "empty-key") {
        appendPredefinedErrorMessage("NO_API_KEY");
        appendBotMessageToChat(
          "Bitte kontaktiere die Entwickler vom Assignment Upload Tool. [Fehlermeldung: Kein API-Key eingetragen]"
        );
        errorOccurred = true;
        finishRequest(true);
        return;
      } else if (keyStatusResult.status !== "valid-key") {
        appendPredefinedErrorMessage("NO_QUOTA_OR_OTHER_ERROR");
        appendBotMessageToChat(
          "Bitte kontaktiere die Entwickler vom Assignment Upload Tool. [Fehler: Kein Kontingent mehr oder anderweitiger Fehler]"
        );
        errorOccurred = true;
        finishRequest(true);
        return;
      }

      const finalApiKey = keyStatusResult.apiKey;
      const selectedModels = getSelectedModels();

      if (logger) {
        logger.debug("Sende Chatnachricht an openrouter.ai", {
          userMessage: inputValue,
          models: selectedModels,
        });
      }

      try {
        const systemPrompt = buildSystemPrompt();

        const responseText = await requestOpenRouterWithFallback(
          selectedModels,
          systemPrompt,
          finalApiKey
        );

        if (!responseText) {
          if (logger) {
            logger.warn("Leere Antwort", { response: responseText });
          }
        } else if (responseText.length > 500) {
          finalBotResponse = responseText;
          if (logger) {
            logger.warn("Antwort zu lang", {
              length: responseText.length,
              response: responseText,
            });
          }
        } else {
          finalBotResponse = responseText;
          if (logger) {
            logger.info("Antwort erhalten", {
              request: { userText: inputValue },
              response: responseText,
            });
          }
        }
        appendBotMessageToChat(finalBotResponse);
      } catch (err) {
        if (err.name === "AbortError") {
          if (logger) {
            logger.warn("Generierung abgebrochen (AbortError).");
          }
        } else if (err.message === "AllRequestsFailed") {
          finalBotResponse =
            "Bitte kontaktiere die Entwickler. [Fehler: Keine Antwort, alle Modelle schlugen fehl]";
          appendBotMessageToChat(finalBotResponse);
          errorOccurred = true;
          finishRequest(true);
          if (logger) {
            logger.error("Keine Antwort erhalten (AllRequestsFailed)", {
              error: err.toString(),
            });
          }
        } else {
          finalBotResponse =
            "Bitte kontaktiere die Entwickler vom Assignment Upload Tool. [Fehler: unknown issue]";
          appendBotMessageToChat(finalBotResponse);
          errorOccurred = true;
          finishRequest(true);
        }
      } finally {
        if (!errorOccurred) {
          finishRequest(false);
        }
      }
    });
    /* Beendet eine Anfrage und setzt UI-Elemente zurück */
    function finishRequest(hasError) {
      setIsGenerating(false);
      btnSend.innerHTML = `<i class="fa-solid fa-paper-plane"></i>`;
      btnSend.title = "Senden";
      adjustChatLayout();

      stopAntennaWiggle(hasError);

      userInput.dispatchEvent(new Event("input"));
    }
  }
});
