/*
Diese Datei implementiert den Chat-Bot mit animiertem Roboter-Avatar, Chat-Verlauf und Animationssteuerung.
*/

import { typeText, cancelTyping } from "../utils/text-utils.js";
import { openDeveloperSettings } from "./developer-settings-panel.js";
import {
  setUserHasMessaged,
  MAX_BUBBLE_HEIGHT,
  INNER_MAX_HEIGHT,
} from "../utils/global-state.js";
import { pushToConversationHistory } from "../utils/system-prompt-config.js";
/* Chat-Verlauf und Zustandsverwaltung */
let conversationData = [];
let userHasWritten = false;

function loadConversationData() {
  const stored = localStorage.getItem("chatConversation");
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

function saveConversationData() {
  localStorage.setItem("chatConversation", JSON.stringify(conversationData));
}

function setUserHasWritten(value) {
  userHasWritten = value;
  localStorage.setItem("userHasWritten", value ? "true" : "false");
}
/* UI-Elemente für den Chat */
let chatBubble = null;
let chatInput = null;
let userInput = null;
let chatMessages = null;
let closeBtn = null;

/* Animationssteuerung für verschiedene Roboter-Zustände */
let headShakeAnimation = null;
let antennaWiggleAnimation = null;

export let staticRobotAnimation = null;
/* Chat-Initialisierung und Grundfunktionen */
export function initializeChat() {
  if (localStorage.getItem("resetChatOnNextLoad") === "true") {
    localStorage.removeItem("resetChatOnNextLoad");
    localStorage.removeItem("chatConversation");
    localStorage.removeItem("chatOpen");
    localStorage.removeItem("userHasWritten");
  }

  conversationData = loadConversationData();
  userHasWritten = localStorage.getItem("userHasWritten") === "true";

  const robotAvatarContainer = document.querySelector(".robot-avatar");

  if (!robotAvatarContainer) {
    return;
  }

  let existingChatBubble = document.querySelector(".robot-chat-bubble");
  if (!existingChatBubble) {
    chatBubble = document.createElement("div");
    chatBubble.classList.add("robot-chat-bubble");
    chatBubble.innerHTML = `
      <span class="chat-close"><i class="fa-solid fa-xmark"></i></span>
      <div class="robot-chatbox"></div>
      <div class="chat-input">
        <textarea rows="1" placeholder="Deine Frage..."></textarea>
        <button type="button" class="btn-send"><i class="fa-solid fa-paper-plane"></i></button>
      </div>
    `;
    document.body.appendChild(chatBubble);
  } else {
    chatBubble = existingChatBubble;
  }

  chatBubble.style.display = "none";
  chatMessages = chatBubble.querySelector(".robot-chatbox");
  chatInput = chatBubble.querySelector(".chat-input");
  userInput = chatBubble.querySelector(".chat-input textarea");
  closeBtn = chatBubble.querySelector(".chat-close");

  robotAvatarContainer.addEventListener("click", toggleChatBubble);
  closeBtn.addEventListener("click", closeChatBubble);
  userInput.addEventListener("input", adjustChatLayout);

  if (localStorage.getItem("chatOpen") === "true") {
    chatBubble.style.display = "block";
  }

  chatBubble.style.bottom = `20px`;
  chatBubble.style.right = `80px`;

  renderConversationUI();
  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (localStorage.getItem("chatOpen") === "true") {
    if (conversationData.length === 0) {
      if (!userHasWritten) {
        displayDefaultText(true);
      } else {
        displayDefaultText(false);
      }
    }
  }

  setupDeveloperPanel(robotAvatarContainer);
  return chatBubble;
}
/* Stellt den Chat-Verlauf im UI dar */
function renderConversationUI() {
  chatMessages.innerHTML = "";
  for (const msg of conversationData) {
    if (msg.role === "default") {
      const defaultMessageContainer = createBotMessageElement();
      defaultMessageContainer.classList.add("default-text-container");
      defaultMessageContainer.textContent = msg.text;
      chatMessages.appendChild(defaultMessageContainer);
    } else if (msg.role === "user") {
      const userMessageContainer = document.createElement("div");
      userMessageContainer.classList.add("user-message");
      const userAvatar = document.createElement("img");
      userAvatar.src = "https://differential-topology.github.io/assignment-upload-tool/assets/images/profile-picture.png";
      userAvatar.alt = "User Avatar";
      const userMessageBubble = document.createElement("div");
      userMessageBubble.classList.add("user-chat-bubble");
      userMessageBubble.textContent = msg.text;

      userMessageContainer.appendChild(userAvatar);
      userMessageContainer.appendChild(userMessageBubble);
      chatMessages.appendChild(userMessageContainer);
    } else if (msg.role === "bot") {
      const botElem = createBotMessageElement();
      botElem.textContent = msg.text;
      chatMessages.appendChild(botElem);
    }
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
  adjustChatLayout();
}
/* Schaltet die Chat-Bubble ein/aus */
function toggleChatBubble() {
  if (chatBubble.style.display === "none") {
    chatBubble.style.display = "block";
    localStorage.setItem("chatOpen", "true");
    cancelTyping();
    adjustChatLayout();

    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (conversationData.length === 0) {
      if (!userHasWritten) {
        displayDefaultText(true);
      } else {
        displayDefaultText(false);
      }
    }
  } else {
    closeChatBubble();
  }
}
/* Schließt die Chat-Bubble und bereinigt den Zustand */
function closeChatBubble() {
  cancelTyping();
  if (!userHasWritten) {
    conversationData = [];
    saveConversationData();
    chatMessages.innerHTML = "";
  }
  chatBubble.style.display = "none";
  localStorage.setItem("chatOpen", "false");

  if (userInput) {
    userInput.value = "";
  }
}
/* Zeigt die Standard-Begrüßung an */
function displayDefaultText(animate) {
  if (conversationData.some((msg) => msg.role === "default")) {
    return;
  }
  const defaultMessageContainer = createBotMessageElement();
  defaultMessageContainer.classList.add("default-text-container");
  chatMessages.appendChild(defaultMessageContainer);

  if (animate) {
    typeText(defaultMessageContainer, "Wie kann ich dir weiterhelfen 😊?");
  } else {
    defaultMessageContainer.textContent = "Wie kann ich dir weiterhelfen 😊?";
  }

  conversationData.push({
    role: "default",
    text: "Wie kann ich dir weiterhelfen 😊?",
  });
  saveConversationData();
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
/* Erzeugt ein neues Bot-Nachrichten-Element */
export function createBotMessageElement() {
  const botMessageContainer = document.createElement("div");
  botMessageContainer.classList.add("bot-message");
  botMessageContainer.style.textAlign = "left";
  botMessageContainer.style.margin = "0.5rem 0";
  return botMessageContainer;
}
/* Fügt eine Benutzer-Nachricht zum Chat hinzu */
export function displayUserMessage(text) {
  setUserHasWritten(true);
  setUserHasMessaged(true);

  const userMessageContainer = document.createElement("div");
  userMessageContainer.classList.add("user-message");
  const userAvatar = document.createElement("img");
  userAvatar.src = "https://differential-topology.github.io/assignment-upload-tool/assets/images/profile-picture.png";
  userAvatar.alt = "User Avatar";
  const userMessageBubble = document.createElement("div");
  userMessageBubble.classList.add("user-chat-bubble");
  userMessageBubble.textContent = text;

  userMessageContainer.appendChild(userAvatar);
  userMessageContainer.appendChild(userMessageBubble);
  chatMessages.appendChild(userMessageContainer);

  conversationData.push({ role: "user", text });
  saveConversationData();
  pushToConversationHistory({
    role: "user",
    text,
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
  userInput.value = "";
  userInput.style.height = "auto";
  adjustChatLayout();
}
/* Fügt eine Bot-Antwort zum Chat hinzu */
export function appendBotMessageToChat(text) {
  const botElem = createBotMessageElement();
  botElem.textContent = text;
  chatMessages.appendChild(botElem);

  if (!isPredefinedErrorText(text)) {
    pushToConversationHistory({ role: "bot", text });
  } else {
  }

  conversationData.push({ role: "bot", text });
  saveConversationData();
  chatMessages.scrollTop = chatMessages.scrollHeight;
  adjustChatLayout();
}
/* Passt die Chat-Layout-Größen dynamisch an */
export function adjustChatLayout() {
  if (!chatBubble || chatBubble.style.display === "none") return;

  userInput.style.height = "auto";
  const maxTextareaHeight = 150;
  const newHeight = Math.min(userInput.scrollHeight, maxTextareaHeight);
  userInput.style.height = newHeight + "px";
  userInput.style.overflowY =
    userInput.scrollHeight > maxTextareaHeight ? "auto" : "hidden";

  const chatInputHeight = chatInput.offsetHeight;
  const messagesContentHeight = chatMessages.scrollHeight;
  const totalContentHeight = messagesContentHeight + chatInputHeight;

  if (totalContentHeight <= INNER_MAX_HEIGHT) {
    chatBubble.style.height = "auto";
    chatMessages.style.height = "auto";
    chatMessages.style.overflowY = "visible";
  } else {
    chatBubble.style.height = MAX_BUBBLE_HEIGHT + "px";
    const messagesHeight = INNER_MAX_HEIGHT - chatInputHeight;
    chatMessages.style.height = messagesHeight + "px";
    chatMessages.style.overflowY = "auto";
  }
}
/* Initialisiert das versteckte Entwickler-Panel */
function setupDeveloperPanel(robotAvatarContainer) {
  const REQUIRED_CLICKS = 4;
  const CLICK_TIMEOUT = 500;
  let clickCount = 0;
  let clickTimer = null;

  robotAvatarContainer.addEventListener("click", () => {
    clickCount++;
    if (clickTimer) {
      clearTimeout(clickTimer);
    }
    clickTimer = setTimeout(() => {
      clickCount = 0;
    }, CLICK_TIMEOUT);

    if (clickCount >= REQUIRED_CLICKS) {
      clickCount = 0;
      openDeveloperSettings();
    }
  });
}
/* Prüft auf vordefinierte Fehlermeldungen */
function isPredefinedErrorText(text) {
  return (
    text.includes("[Fehlermeldung: Kein API-Key eingetragen]") ||
    text.includes("[Fehlermeldung: Ungültiger API-Key]") ||
    text.includes("[Fehler: Kein Kontingent mehr oder anderweitiger Fehler]") ||
    text.includes("[Fehler: unknown issue]") ||
    text.includes("Keine Antwort, alle Modelle schlugen fehl") ||
    text.includes("Entschuldige, ich habe derzeit keinen Internetzugriff")
  );
}

document.addEventListener("DOMContentLoaded", initializeChat);

/* Lädt die statische Roboter-Animation */
export function initializeAnimations() {
  const animationContainer = document.getElementById("animationRobot");
  const staticRobot = document.getElementById("staticRobot");
  if (!animationContainer || !staticRobot) {
    return;
  }

  staticRobotAnimation = lottie.loadAnimation({
    container: staticRobot,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "https://differential-topology.github.io/assignment-upload-tool/assets/animations/static_robot.json",
  });
}
/* Lädt die Kopfschüttel-Animation */

function loadHeadShakeAnimation() {
  const animationContainer = document.getElementById("animationRobot");
  if (!animationContainer) return null;
  return lottie.loadAnimation({
    container: animationContainer,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "https://differential-topology.github.io/assignment-upload-tool/assets/animations/headshake.json",
  });
}
/* Lädt die Antennen-Wackel-Animation */
function loadAntennaWiggleAnimation() {
  const animationContainer = document.getElementById("animationRobot");
  if (!animationContainer) return null;
  return lottie.loadAnimation({
    container: animationContainer,
    renderer: "svg",
    loop: true,
    autoplay: false,
    path: "https://differential-topology.github.io/assignment-upload-tool/assets/animations/antenna-wiggle.json",
  });
}

let animationTimeout = null;
/* Spielt die Kopfschüttel-Animation ab */
export function playHeadShake() {
  const animationContainer = document.getElementById("animationRobot");
  const staticRobot = document.getElementById("staticRobot");
  if (!animationContainer || !staticRobot) {
    return;
  }

  animationContainer.innerHTML = "";
  if (headShakeAnimation) {
    headShakeAnimation.destroy();
    headShakeAnimation = null;
  }
  if (antennaWiggleAnimation) {
    antennaWiggleAnimation.destroy();
    antennaWiggleAnimation = null;
  }

  staticRobot.style.display = "none";
  animationContainer.style.display = "block";

  headShakeAnimation = loadHeadShakeAnimation();
  if (!headShakeAnimation) return;

  headShakeAnimation.goToAndPlay(0, true);

  function handleHeadShakeDone() {
    headShakeAnimation.removeEventListener("complete", handleHeadShakeDone);
    headShakeAnimation.destroy();
    headShakeAnimation = null;
    showStaticRobot();
  }
  headShakeAnimation.addEventListener("complete", handleHeadShakeDone);
}
/* Spielt die Antennen-Wackel-Animation ab */
export function playAntennaWiggle() {
  const animationContainer = document.getElementById("animationRobot");
  const staticRobot = document.getElementById("staticRobot");
  if (!animationContainer || !staticRobot) {
    return;
  }

  animationContainer.innerHTML = "";
  if (headShakeAnimation) {
    headShakeAnimation.destroy();
    headShakeAnimation = null;
  }
  if (antennaWiggleAnimation) {
    antennaWiggleAnimation.destroy();
    antennaWiggleAnimation = null;
  }

  staticRobot.style.display = "none";
  animationContainer.style.display = "block";

  antennaWiggleAnimation = loadAntennaWiggleAnimation();
  if (!antennaWiggleAnimation) return;

  antennaWiggleAnimation.goToAndPlay(0, true);
}

/* Beendet die Antennen-Animation sauber */
export function stopAntennaWiggle(hasError) {
  if (!antennaWiggleAnimation) {
    if (hasError) {
      playHeadShake();
    } else {
      showStaticRobot();
    }
    return;
  }

  antennaWiggleAnimation.loop = false;

  function onWiggleComplete() {
    antennaWiggleAnimation.removeEventListener("complete", onWiggleComplete);
    antennaWiggleAnimation.destroy();
    antennaWiggleAnimation = null;

    if (hasError) {
      showStaticRobot();
      setTimeout(() => {
        playHeadShake();
      }, 200);
    } else {
      showStaticRobot();
    }
  }

  antennaWiggleAnimation.addEventListener("complete", onWiggleComplete);
}

/* Zeigt den statischen Roboter-Zustand */
export function showStaticRobot() {
  const animationContainer = document.getElementById("animationRobot");
  const staticRobot = document.getElementById("staticRobot");
  if (!animationContainer || !staticRobot) {
    return;
  }

  animationContainer.style.display = "none";

  animationContainer.innerHTML = "";

  staticRobot.style.display = "block";

  if (antennaWiggleAnimation) {
    antennaWiggleAnimation.destroy();
    antennaWiggleAnimation = null;
  }
  if (headShakeAnimation) {
    headShakeAnimation.destroy();
    headShakeAnimation = null;
  }

  if (staticRobotAnimation) {
    staticRobotAnimation.goToAndStop(0, true);
  }

  if (animationTimeout) {
    clearTimeout(animationTimeout);
    animationTimeout = null;
  }
}

document.addEventListener("DOMContentLoaded", initializeAnimations);
