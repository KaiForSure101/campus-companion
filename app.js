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
const assignmentForm = document.querySelector("#assignment-form");
const assignmentList = document.querySelector("#assignment-list");
const assignmentFilter = document.querySelector("#assignment-filter");
const assignmentCount = document.querySelector("#assignment-count");

// --------------------------------
// 2. Store the dashboard's first data
// --------------------------------
const dashboardState = {
  studentName: "student",
  classesToday: 3,
  nextClass: "Web Development at 10:00",
  openAssignments: 5,
  assignmentsDueThisWeek: 2,
  studyStreak: 7,
};

// This is sample data for the first tracker version. It will be replaced by
// records from a backend after the localStorage version is understood.
const starterAssignments = [
  {
    id: "portfolio-wireframes",
    title: "Portfolio wireframes",
    subject: "Web Development",
    dueDate: "2026-09-09",
    priority: "urgent",
    completed: false,
  },
  {
    id: "research-summary",
    title: "Research summary",
    subject: "Academic Writing",
    dueDate: "2026-09-11",
    priority: "medium",
    completed: false,
  },
  {
    id: "functions-practice",
    title: "Functions practice set",
    subject: "Mathematics",
    dueDate: "2026-09-12",
    priority: "low",
    completed: false,
  },
];

const assignmentStorageKey = "campus-companion-assignments";
let assignments = loadAssignments();
let activeAssignmentFilter = "all";

// ----------------------------------
// 3. Create reusable helper functions
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

function formatDueDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

// User-entered text is escaped before being inserted into a template string.
// This keeps the simple HTML-rendering approach safe for the first prototype.
function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => {
    const htmlEntities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return htmlEntities[character];
  });
}

function loadAssignments() {
  const savedAssignments = localStorage.getItem(assignmentStorageKey);

  if (!savedAssignments) return starterAssignments;

  try {
    return JSON.parse(savedAssignments);
  } catch (error) {
    console.warn("Saved assignments could not be read. Using starter data instead.");
    return starterAssignments;
  }
}

function saveAssignments() {
  localStorage.setItem(assignmentStorageKey, JSON.stringify(assignments));
}

// ---------------------------------------
// 4. Render state data into the dashboard
// ---------------------------------------
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

function updateAssignmentSummary() {
  const openAssignments = assignments.filter((assignment) => !assignment.completed);
  const urgentAssignments = openAssignments.filter(
    (assignment) => assignment.priority === "urgent"
  );

  openAssignmentsValue.textContent = openAssignments.length;
  assignmentsWeekNote.textContent = `${urgentAssignments.length} urgent assignment${urgentAssignments.length === 1 ? "" : "s"}`;
}

// ---------------------------------------
// 5. Render and interact with assignments
// ---------------------------------------
function getVisibleAssignments() {
  if (activeAssignmentFilter === "open") {
    return assignments.filter((assignment) => !assignment.completed);
  }

  if (activeAssignmentFilter === "completed") {
    return assignments.filter((assignment) => assignment.completed);
  }

  return assignments;
}

function renderAssignments() {
  const visibleAssignments = getVisibleAssignments();
  assignmentCount.textContent = `${assignments.length} task${assignments.length === 1 ? "" : "s"}`;

  if (visibleAssignments.length === 0) {
    assignmentList.innerHTML = '<li class="empty-state">No assignments match this filter.</li>';
    return;
  }

  assignmentList.innerHTML = visibleAssignments
    .map((assignment) => {
      const completedClass = assignment.completed ? " assignment-item--completed" : "";
      const checkedText = assignment.completed ? "Mark as open" : "Mark as complete";
      const statusText = assignment.completed ? "Completed" : `Due ${formatDueDate(assignment.dueDate)}`;

      return `
        <li class="assignment-item${completedClass}">
          <button class="assignment-toggle" type="button" data-action="toggle" data-id="${assignment.id}" aria-label="${checkedText} ${escapeHtml(assignment.title)}" aria-pressed="${assignment.completed}">
            <span class="status-dot ${assignment.priority === "urgent" ? "status-dot--urgent" : ""}" aria-hidden="true"></span>
          </button>
          <div>
            <h3>${escapeHtml(assignment.title)}</h3>
            <p>${escapeHtml(assignment.subject)} · ${statusText}</p>
          </div>
          <span class="priority-label priority-label--${assignment.priority}">${assignment.priority}</span>
          <button class="assignment-delete" type="button" data-action="delete" data-id="${assignment.id}" aria-label="Delete ${escapeHtml(assignment.title)}">×</button>
        </li>
      `;
    })
    .join("");
}

assignmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(assignmentForm);

  const newAssignment = {
    id: window.crypto?.randomUUID?.() ?? String(Date.now()),
    title: formData.get("title").trim(),
    subject: formData.get("subject").trim(),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    completed: false,
  };

  assignments.push(newAssignment);
  saveAssignments();
  renderAssignments();
  updateAssignmentSummary();
  assignmentForm.reset();
  feedbackMessage.textContent = "Assignment added to your plan.";
});

assignmentFilter.addEventListener("change", (event) => {
  activeAssignmentFilter = event.target.value;
  renderAssignments();
});

// One listener on the list handles buttons for every current and future assignment.
assignmentList.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const assignmentId = actionButton.dataset.id;
  const assignment = assignments.find((item) => item.id === assignmentId);
  if (!assignment) return;

  if (actionButton.dataset.action === "toggle") {
    assignment.completed = !assignment.completed;
    feedbackMessage.textContent = assignment.completed
      ? "Assignment marked complete."
      : "Assignment moved back to open.";
  }

  if (actionButton.dataset.action === "delete") {
    assignments = assignments.filter((item) => item.id !== assignmentId);
    feedbackMessage.textContent = "Assignment removed from your plan.";
  }

  saveAssignments();
  renderAssignments();
  updateAssignmentSummary();
});

// ----------------------------------------
// 6. Keep the mobile menu accessible
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
// 7. Give the placeholder action feedback
// -------------------------------------
noteAction.addEventListener("click", () => {
  feedbackMessage.textContent = "Note creation will be available in the next phase.";
});

// -----------------------------------
// 8. Start the page with current data
// -----------------------------------
renderDashboard({
  ...dashboardState,
  openAssignments: assignments.filter((assignment) => !assignment.completed).length,
});
renderAssignments();
updateAssignmentSummary();
