/*
Diese Datei steuert die Sichtbarkeit des Passworts durch ein Toggle-Icon im Eingabefeld.
*/
const togglePasswordBtn = document.querySelector(".toggle-password");
if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener("click", () => {
    const passwordField = document.getElementById("password");
    const icon = togglePasswordBtn.querySelector("i");
    if (passwordField.type === "password") {
      passwordField.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      passwordField.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
}
