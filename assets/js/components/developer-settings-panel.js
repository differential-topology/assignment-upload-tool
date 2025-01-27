/*
Diese Datei implementiert das Entwickler-Einstellungspanel mit API-Key-Verwaltung, Modellauswahl und Logger.
*/

import { getApiKeyStatus } from "assets/js/utils/openrouter.js";

/* Erstellt oder zeigt das Entwickler-Panel mit allen Einstellungen */
export function openDeveloperSettings() {
  let devPanel = document.getElementById("devSettingsPanel");
  if (!devPanel) {
    // Panel-Erstellung mit HTML-Template
    devPanel = document.createElement("div");
    devPanel.id = "devSettingsPanel";
    devPanel.classList.add("dev-panel");
    devPanel.innerHTML = `
      <!-- Schließen-Icon: bleibt oben rechts, "position: absolute" zum Panel -->
      <span id="devSettingsClose" class="chat-close" title="Schließen">
        <i class="fa-solid fa-xmark"></i>
      </span>

      <!-- Innerer Scroll-Container -->
      <div class="dev-panel-content">
        <h2>Entwicklereinstellungen</h2>
        <form id="devSettingsForm">

          <div class="form-group">
            <label for="apiKeyInput">OpenRouter API-Schlüssel:</label>
            <div class="api-field">
              <input type="password" id="apiKeyInput" name="apiKey" placeholder="API-Schlüssel hier eintragen">
              <button type="button" class="toggle-apikey">
                <i class="fas fa-eye"></i>
              </button>
            </div>
            <div class="api-status">
              <span id="statusIndicator" class="status-dot pulsating-gray"></span>
              <span id="statusDescription">Status wird ermittelt…</span>
            </div>
            <small class="info-text">
              Hinweise:
              <ul>
                <li>Auf der Website <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">openrouter.ai</a> kann ein API-Schlüssel ohne Zahlungsdaten erstellt werden.</li>
                <li>Im kostenlosen Tarif sind maximal 20 Anfragen pro Minute und 200 Anfragen pro Tag möglich. <a href="https://openrouter.ai/activity" target="_blank" rel="noopener noreferrer">Mein Kontingent prüfen</a></li>
                <li>In den Einstellungen unter „Privacy“ lassen sich Logging und Model Training deaktivieren.</li>
              </ul>
            </small>
          </div>

          <div class="form-group">
            <label for="modelSelect1">Primäres KI-Modell:</label>
            <select id="modelSelect1" name="model1">
              <option value="google_gemini_experimental_1206">Google: Gemini Experimental 1206 (Score 1374 🏆)</option>
              <option value="google_gemini_flash_thinking_experimental">Google: Gemini 2.0 Flash Thinking Experimental (Score 1363)</option>
              <option value="google_gemini_flash_2_experimental">Google: Gemini Flash 2.0 Experimental (Score 1352)</option>
              <option value="meta_llama_3_1_405b_instruct">Meta: Llama 3.1 405B Instruct (Score 1248)</option>
              <option value="meta_llama_3_1_70b_instruct" selected>Meta: Llama 3.1 70B Instruct (Score 1223)</option>
              <option value="meta_llama_3_1_8b_instruct">Meta: Llama 3.1 8B Instruct (Score 1139)</option>
              <option value="microsoft_phi_3_mini_128k_instruct">Microsoft: Phi - 3 Mini 128K Instruct (Score 1009)</option>
              <option value="mistral_mistral_7b_instruct">Mistral: Mistral 7B Instruct (Score 925)</option>
            </select>
            <small class="info-text">
              Hinweise:
              <ul>
                <li>Einige Modelle haben möglicherweise niedrigere Ratelimits als andere.</li>
                <li>Die Scores basieren auf dem <a href="https://lmarena.ai/?leaderboard" target="_blank" rel="noopener noreferrer">Chatbot Arena LLM Leaderboard</a> für Deutsch.</li>
              </ul>
            </small>
          </div>

          <div class="form-group">
            <label for="modelSelect2">Fallback KI-Modell:</label>
            <select id="modelSelect2" name="model2">
              <option value="">-- Kein Modell ausgewählt --</option>
              <option value="google_gemini_experimental_1206">Google: Gemini Experimental 1206 (Score 1374 🏆)</option>
              <option value="google_gemini_flash_thinking_experimental">Google: Gemini 2.0 Flash Thinking Experimental (Score 1363)</option>
              <option value="google_gemini_flash_2_experimental">Google: Gemini Flash 2.0 Experimental (Score 1352)</option>
              <option value="meta_llama_3_1_405b_instruct">Meta: Llama 3.1 405B Instruct (Score 1248)</option>
              <option value="meta_llama_3_1_70b_instruct">Meta: Llama 3.1 70B Instruct (Score 1223)</option>
              <option value="meta_llama_3_1_8b_instruct">Meta: Llama 3.1 8B Instruct (Score 1139)</option>
              <option value="microsoft_phi_3_mini_128k_instruct">Microsoft: Phi - 3 Mini 128K Instruct (Score 1009)</option>
              <option value="mistral_mistral_7b_instruct" selected>Mistral: Mistral 7B Instruct (Score 925)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="modelSelect3">Fallback KI-Modell 2:</label>
            <select id="modelSelect3" name="model3">
              <option value="">-- Kein Modell ausgewählt --</option>
              <option value="google_gemini_experimental_1206">Google: Gemini Experimental 1206 (Score 1374 🏆)</option>
              <option value="google_gemini_flash_thinking_experimental">Google: Gemini 2.0 Flash Thinking Experimental (Score 1363)</option>
              <option value="google_gemini_flash_2_experimental">Google: Gemini Flash 2.0 Experimental (Score 1352)</option>
              <option value="meta_llama_3_1_405b_instruct">Meta: Llama 3.1 405B Instruct (Score 1248)</option>
              <option value="meta_llama_3_1_70b_instruct">Meta: Llama 3.1 70B Instruct (Score 1223)</option>
              <option value="meta_llama_3_1_8b_instruct">Meta: Llama 3.1 8B Instruct (Score 1139)</option>
              <option value="microsoft_phi_3_mini_128k_instruct" selected>Microsoft: Phi - 3 Mini 128K Instruct (Score 1009)</option>
              <option value="mistral_mistral_7b_instruct">Mistral: Mistral 7B Instruct (Score 925)</option>
            </select>
          </div>

        </form>

        <!-- Logger -->
        <div id="developerLoggerWrapper">
          <div class="logger-wrapper">
            <div class="logger-header">
              <div class="logger-title">Logger</div>
              <i class="fas fa-copy copy-icon" id="copyAllLogs" title="Alle Logs kopieren"></i>
            </div>
            <div id="logger" class="logger-container"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(devPanel);

    const existingLogger = document.getElementById("logger");
    if (existingLogger) {
      const placeholderLogger = devPanel.querySelector("#logger");
      if (placeholderLogger && placeholderLogger !== existingLogger) {
        placeholderLogger.replaceWith(existingLogger);
      }
    }

    const toggleApiKeyBtn = devPanel.querySelector(".toggle-apikey");
    if (toggleApiKeyBtn) {
      toggleApiKeyBtn.addEventListener("click", () => {
        const apiKeyField = document.getElementById("apiKeyInput");
        const icon = toggleApiKeyBtn.querySelector("i");
        if (apiKeyField.type === "password") {
          apiKeyField.type = "text";
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        } else {
          apiKeyField.type = "password";
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
      });
    }

    const devSettingsClose = document.getElementById("devSettingsClose");
    devSettingsClose.addEventListener("click", () => {
      devPanel.style.display = "none";
    });

    const modelSelect1 = document.getElementById("modelSelect1");
    const modelSelect2 = document.getElementById("modelSelect2");
    const modelSelect3 = document.getElementById("modelSelect3");

    modelSelect1.addEventListener("change", () => {
      if (modelSelect1.value === "") {
        modelSelect2.value = "";
        modelSelect3.value = "";
      }
      localStorage.setItem("devModel1", modelSelect1.value);
    });

    modelSelect2.addEventListener("change", () => {
      localStorage.setItem("devModel2", modelSelect2.value);
    });

    modelSelect3.addEventListener("change", () => {
      localStorage.setItem("devModel3", modelSelect3.value);
    });

    const apiKeyInput = document.getElementById("apiKeyInput");
    apiKeyInput.addEventListener("blur", () => {
      apiKeyInput.value = apiKeyInput.value.trim();

      localStorage.setItem("devApiKey", apiKeyInput.value);
      updateApiStatus();
    });

    /* Wiederherstellen der gespeicherten Einstellungen */
    function restoreDevSettingsFromStorage() {
      const storedApi = localStorage.getItem("devApiKey");
      const storedModel1 = localStorage.getItem("devModel1");
      const storedModel2 = localStorage.getItem("devModel2");
      const storedModel3 = localStorage.getItem("devModel3");

      if (storedApi) apiKeyInput.value = storedApi;
      if (storedModel1) modelSelect1.value = storedModel1;
      if (storedModel2) modelSelect2.value = storedModel2;
      if (storedModel3) modelSelect3.value = storedModel3;
    }

    restoreDevSettingsFromStorage();
    updateApiStatus();
  } else {
    devPanel.style.display = "block";
    updateApiStatus();
  }
}

/* Prüft und aktualisiert den API-Key-Status mit visueller Rückmeldung */
async function updateApiStatus() {
  const apiKeyInput = document.getElementById("apiKeyInput");
  const statusIndicator = document.getElementById("statusIndicator");
  const statusDescription = document.getElementById("statusDescription");

  statusIndicator.className = "status-dot pulsating-gray";
  statusDescription.textContent = "Status wird ermittelt…";

  const key = apiKeyInput.value;
  const result = await getApiKeyStatus(key);

  switch (result.status) {
    case "empty-key":
      statusIndicator.className = "status-dot yellow";
      statusDescription.textContent = "Status: Kein API-Schlüssel eingetragen";
      break;
    case "valid-key":
      statusIndicator.className = "status-dot green";
      statusDescription.textContent = "Status: Gültiger API-Schlüssel";
      break;
    case "invalid-key":
      statusIndicator.className = "status-dot red";
      statusDescription.textContent = "Status: Ungültiger API-Schlüssel";
      break;
    case "no-internet":
    default:
      statusIndicator.className = "status-dot orange";
      statusDescription.textContent = "Status: Netzwerk-/Serverfehler";
      break;
  }
}
