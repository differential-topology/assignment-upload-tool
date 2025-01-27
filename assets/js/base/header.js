/*
Diese Datei steuert die Header-Funktionalitäten wie Navigation, Avatar-Popup und mobiles Menü.
*/
import { initializeAvatarPopup } from "/assets/js/components/avatar.js";

/* Hauptfunktion für die Header-Initialisierung */
export function setupHeaderJS() {
  const currentPageName = location.pathname
    .split("/")
    .pop()
    .replace(".html", "");
  const navLinks = document.querySelectorAll(".main-nav a");

  /* Aktuelle Seite in der Navigation hervorheben */
  navLinks.forEach((link) => {
    if (link.dataset.nav === currentPageName) {
      link.parentElement.classList.add("active");
    } else {
      link.parentElement.classList.remove("active");
    }
  });

  initializeAvatarPopup();

  /* Mobile Navigation Toggle */
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const navUl = document.querySelector(".main-nav ul");
  if (hamburgerMenu && navUl) {
    hamburgerMenu.addEventListener("click", () => {
      navUl.classList.toggle("show");
    });
  }
}
