// Select the two elements that work together to control the mobile menu.
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#primary-navigation");
const navigationLinks = navigation.querySelectorAll("a");

// Keep the menu state and accessibility attributes synchronized in one place.
function setMenuState(isOpen) {
  navigation.classList.toggle("is-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
}

// A button click toggles the menu between open and closed states.
menuButton.addEventListener("click", () => {
  const isCurrentlyOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenuState(!isCurrentlyOpen);
});

// Selecting a destination closes the menu so the user can see the section they chose.
navigationLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

// Escape is a familiar keyboard shortcut for closing an open menu.
document.addEventListener("keydown", (event) => {
  const isMenuOpen = menuButton.getAttribute("aria-expanded") === "true";

  if (event.key === "Escape" && isMenuOpen) {
    setMenuState(false);
    menuButton.focus();
  }
});

// Clicking outside the navigation also closes it, which prevents it from covering content.
document.addEventListener("click", (event) => {
  const clickedInsideNavigation = navigation.contains(event.target);
  const clickedMenuButton = menuButton.contains(event.target);

  if (!clickedInsideNavigation && !clickedMenuButton) {
    setMenuState(false);
  }
});
