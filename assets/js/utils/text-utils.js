/*
Diese Datei implementiert einen Text-Typing-Effekt mit spezieller Behandlung von Emojis für dynamische Textanzeigen.
*/

/* Tracking der aktiven Typing-Timeouts für sauberes Abbrechen */
let typingTimeouts = [];
/* Erzeugt einen Schreibmaschineneffekt mit Emoji-Unterstützung */
export function typeText(element, text, delay = 50) {
  if (!element || !text) return;
  cancelTyping();

  /* Spezielles Handling für das Emoji 😊 */
  const tokens = Array.from(text).map((ch) => {
    return { char: ch, isEmoji: ch === "😊" };
  });

  element.innerHTML = "";
  let output = "";

  tokens.forEach((token, index) => {
    const timeout = setTimeout(() => {
      if (token.isEmoji) {
        /* Unsichtbares Emoji während des Typing-Effekts */
        output += `<span class="invisible-emoji">${token.char}</span>`;
      } else {
        output += token.char;
      }
      element.innerHTML = output;

      /* Emojis nach Abschluss sichtbar machen */
      if (index === tokens.length - 1) {
        const emojiSpans = element.querySelectorAll(".invisible-emoji");
        emojiSpans.forEach((span) => {
          span.classList.remove("invisible-emoji");
          span.classList.add("visible-emoji");
          span.style.opacity = "1";
        });
      }
    }, delay * index);
    typingTimeouts.push(timeout);
  });
}

export function cancelTyping() {
  typingTimeouts.forEach(clearTimeout);
  typingTimeouts = [];
}
