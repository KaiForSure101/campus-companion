// -----------------------------
// 1. Read the page elements once
// -----------------------------
// Keeping DOM references together makes it clear which HTML elements JavaScript controls.
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#primary-navigation");
const navigationLinks = navigation.querySelectorAll("a");
const pageTitle = document.querySelector("#page-title");
const dashboardDate = document.querySelector("#dashboard-date");
const classesTodayValue = document.querySelector("#classes-today-value");
const nextClassNote = document.querySelector("#next-class-note");
const openAssignmentsValue = document.querySelector("#open-assignments-value");
const assignmentsWeekNote = document.querySelector("#assignments-week-note");
const studyStreakValue = document.querySelector("#study-streak-value");
const studyStreakNote = document.querySelector("#study-streak-note");
const noteAction = document.querySelector("#note-action");
const feedbackMessage = document.querySelector("#feedback-message");

// --------------------------------
// 2. Store the dashboard's first data
// --------------------------------
// This plain object is temporary sample data. Later phases can replace it with
// localStorage data and eventually records returned by Supabase.
const dashboardState = {
  studentName: "student",
  classesToday: 3,
  nextClass: "Web Development at 10:00",
  openAssignments: 5,
  assignmentsDueThisWeek: 2,
  studyStreak: 7,
};

// ----------------------------------
// 3. Create small reusable functions
// ----------------------------------
function getGreeting(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

// ---------------------------------------
// 4. Render state data into the dashboard
// ---------------------------------------
// Rendering means taking JavaScript data and reflecting it in the DOM.
function renderDashboard(state) {
  const currentDate = new Date();
  const greeting = getGreeting(currentDate.getHours());

  pageTitle.textContent = `${greeting}, ${state.studentName}.`;
  dashboardDate.textContent = formatDate(currentDate);
  classesTodayValue.textContent = state.classesToday;
  nextClassNote.textContent = `Next: ${state.nextClass}`;
  openAssignmentsValue.textContent = state.openAssignments;
  assignmentsWeekNote.textContent = `${state.assignmentsDueThisWeek} are due this week`;
  studyStreakValue.textContent = `${state.studyStreak} days`;
  studyStreakNote.textContent = "You are building momentum";
}

// ----------------------------------------
// 5. Keep the mobile menu accessible
// ----------------------------------------
function setMenuState(isOpen) {
  navigation.classList.toggle("is-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
}

menuButton.addEventListener("click", () => {
  const isCurrentlyOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenuState(!isCurrentlyOpen);
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

document.addEventListener("keydown", (event) => {
  const isMenuOpen = menuButton.getAttribute("aria-expanded") === "true";

  if (event.key === "Escape" && isMenuOpen) {
    setMenuState(false);
    menuButton.focus();
  }
});

document.addEventListener("click", (event) => {
  const clickedInsideNavigation = navigation.contains(event.target);
  const clickedMenuButton = menuButton.contains(event.target);

  if (!clickedInsideNavigation && !clickedMenuButton) {
    setMenuState(false);
  }
});

// -------------------------------------
// 6. Give the placeholder action feedback
// -------------------------------------
// The notes feature is not built yet, but a clear message tells users their click worked.
noteAction.addEventListener("click", () => {
  feedbackMessage.textContent = "Note creation will be available in the next phase.";
});

// -----------------------------------
// 7. Start the page with current data
// -----------------------------------
renderDashboard(dashboardState);
