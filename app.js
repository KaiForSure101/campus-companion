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
const noteForm = document.querySelector("#note-form");
const noteText = document.querySelector("#note-text");
const noteList = document.querySelector("#note-list");
const feedbackMessage = document.querySelector("#feedback-message");
const assignmentForm = document.querySelector("#assignment-form");
const assignmentList = document.querySelector("#assignment-list");
const assignmentFilter = document.querySelector("#assignment-filter");
const assignmentCount = document.querySelector("#assignment-count");
const gpaForm = document.querySelector("#gpa-form");
const courseName = document.querySelector("#course-name");
const courseList = document.querySelector("#course-list");
const gpaResult = document.querySelector("#gpa-result");
const gpaFeedback = document.querySelector("#gpa-feedback");
const timetableForm = document.querySelector("#timetable-form");
const timetableList = document.querySelector("#timetable-list");
const timetableFeedback = document.querySelector("#timetable-feedback");
const timerDisplay = document.querySelector("#timer-display");
const timerModeLabel = document.querySelector("#timer-mode");
const timerStart = document.querySelector("#timer-start");
const timerReset = document.querySelector("#timer-reset");
const timerFeedback = document.querySelector("#timer-feedback");
const themeToggle = document.querySelector("#theme-toggle");
const reduceMotionToggle = document.querySelector("#reduce-motion-toggle");
const authForm = document.querySelector("#auth-form");
const authEmail = document.querySelector("#auth-email");
const authStatus = document.querySelector("#auth-status");
const authActions = document.querySelector(".auth-actions");
const authSignout = document.querySelector("#auth-signout");
const cloudSync = document.querySelector("#cloud-sync");
const authFeedback = document.querySelector("#auth-feedback");

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
const starterTimetable = [
  { id: "web-development", time: "10:00", className: "Web Development", room: "B204", duration: 90 },
  { id: "academic-writing", time: "13:00", className: "Academic Writing", room: "A103", duration: 60 },
  { id: "mathematics", time: "15:00", className: "Mathematics", room: "C301", duration: 90 },
];

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
const noteStorageKey = "campus-companion-notes";
const courseStorageKey = "campus-companion-courses";
const timetableStorageKey = "campus-companion-timetable";
const themeStorageKey = "campus-companion-theme";
const motionStorageKey = "campus-companion-reduced-motion";
let assignments = loadAssignments();
let notes = loadNotes();
let courses = loadCourses();
let timetable = loadTimetable();
let activeAssignmentFilter = "all";
let currentUser = null;

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

function readStoredData(key, fallback, itemName) {
  const savedData = localStorage.getItem(key);
  if (!savedData) return fallback;

  try {
    return JSON.parse(savedData);
  } catch (error) {
    console.warn(`Saved ${itemName} could not be read. Using starter data instead.`);
    return fallback;
  }
}

function writeStoredData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadAssignments() {
  return readStoredData(assignmentStorageKey, starterAssignments, "assignments");
}

function saveAssignments() {
  writeStoredData(assignmentStorageKey, assignments);
}

function loadNotes() {
  return readStoredData(noteStorageKey, [], "notes");
}

function saveNotes() {
  writeStoredData(noteStorageKey, notes);
}

function loadCourses() {
  return readStoredData(courseStorageKey, [], "courses");
}

function saveCourses() {
  writeStoredData(courseStorageKey, courses);
}

function loadTimetable() {
  return readStoredData(timetableStorageKey, starterTimetable, "timetable");
}

function saveTimetable() {
  writeStoredData(timetableStorageKey, timetable);
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

// ---------------------------------
// 6. Render and interact with classes
// ---------------------------------
function renderTimetable() {
  const sortedClasses = [...timetable].sort((first, second) => first.time.localeCompare(second.time));

  timetableList.innerHTML = sortedClasses
    .map((classItem) => `
      <li class="timeline-item">
        <time datetime="2026-09-08T${classItem.time}">${classItem.time}</time>
        <div>
          <h3>${escapeHtml(classItem.className)}</h3>
          <p>Room ${escapeHtml(classItem.room)} · ${classItem.duration} minutes</p>
        </div>
        <button class="class-delete" type="button" data-class-id="${classItem.id}" aria-label="Remove ${escapeHtml(classItem.className)}">×</button>
      </li>
    `)
    .join("");
}

timetableForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(timetableForm);

  timetable.push({
    id: window.crypto?.randomUUID?.() ?? String(Date.now()),
    time: formData.get("time"),
    className: formData.get("className").trim(),
    room: formData.get("room").trim(),
    duration: Number(formData.get("duration")),
  });

  saveTimetable();
  renderTimetable();
  timetableForm.reset();
  timetableFeedback.textContent = "Class added to your timetable.";
});

timetableList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-class-id]");
  if (!deleteButton) return;

  timetable = timetable.filter((classItem) => classItem.id !== deleteButton.dataset.classId);
  saveTimetable();
  renderTimetable();
  timetableFeedback.textContent = "Class removed from your timetable.";
});

// -----------------------------
// 7. Render and interact with notes
// -----------------------------
function renderNotes() {
  if (notes.length === 0) {
    noteList.innerHTML = '<li class="empty-state">No saved notes yet. Add your first thought above.</li>';
    return;
  }

  noteList.innerHTML = notes
    .map((note) => `
      <li class="note-item">
        <p>${escapeHtml(note.text)}</p>
        <div class="note-item-footer">
          <time datetime="${note.createdAt}">${formatDate(new Date(note.createdAt))}</time>
          <button class="note-delete" type="button" data-note-id="${note.id}" aria-label="Delete note">Delete</button>
        </div>
      </li>
    `)
    .join("");
}

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = noteText.value.trim();
  if (!text) return;

  notes.unshift({
    id: window.crypto?.randomUUID?.() ?? String(Date.now()),
    text,
    createdAt: new Date().toISOString(),
  });

  saveNotes();
  renderNotes();
  noteForm.reset();
  feedbackMessage.textContent = "Note saved to your ideas.";
});

noteList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-note-id]");
  if (!deleteButton) return;

  notes = notes.filter((note) => note.id !== deleteButton.dataset.noteId);
  saveNotes();
  renderNotes();
  feedbackMessage.textContent = "Note deleted.";
});

// --------------------------------
// 7. Calculate and render the GPA
// --------------------------------
function calculateGpa() {
  if (courses.length === 0) return 0;

  const totalGradePoints = courses.reduce(
    (total, course) => total + course.gradePoints,
    0
  );

  return totalGradePoints / courses.length;
}

function renderCourses() {
  gpaResult.textContent = `GPA ${calculateGpa().toFixed(2)}`;

  if (courses.length === 0) {
    courseList.innerHTML = '<li class="empty-state">Add a course to calculate your GPA.</li>';
    return;
  }

  courseList.innerHTML = courses
    .map((course) => `
      <li class="course-item">
        <div>
          <strong>${escapeHtml(course.name)}</strong>
          <span>Grade ${course.letterGrade}</span>
        </div>
        <button class="course-delete" type="button" data-course-id="${course.id}" aria-label="Remove ${escapeHtml(course.name)}">Remove</button>
      </li>
    `)
    .join("");
}

gpaForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedGrade = document.querySelector("#course-grade");

  courses.push({
    id: window.crypto?.randomUUID?.() ?? String(Date.now()),
    name: courseName.value.trim(),
    letterGrade: selectedGrade.options[selectedGrade.selectedIndex].text,
    gradePoints: Number(selectedGrade.value),
  });

  saveCourses();
  renderCourses();
  gpaForm.reset();
  gpaFeedback.textContent = "Course added to your GPA calculation.";
});

courseList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-course-id]");
  if (!deleteButton) return;

  courses = courses.filter((course) => course.id !== deleteButton.dataset.courseId);
  saveCourses();
  renderCourses();
  gpaFeedback.textContent = "Course removed from your GPA calculation.";
});

// ----------------------------
// 8. Run the Pomodoro timer
// ----------------------------
const focusDuration = 25 * 60;
let timerMode = "focus";
let timerSeconds = focusDuration;
let timerInterval = null;

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTimer(timerSeconds);
  timerDisplay.setAttribute("aria-label", `${formatTimer(timerSeconds)} remaining`);
  timerModeLabel.textContent = timerMode === "focus" ? "Focus session" : "Short break";
  timerStart.textContent = timerInterval ? "Pause focus" : "Start focus";
}

function switchTimerMode() {
  timerMode = timerMode === "focus" ? "break" : "focus";
  timerSeconds = timerMode === "focus" ? focusDuration : 5 * 60;
  timerFeedback.textContent = timerMode === "focus" ? "New focus session ready." : "Focus session complete. Take a short break.";
}

timerStart.addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerFeedback.textContent = "Timer paused.";
    renderTimer();
    return;
  }

  timerFeedback.textContent = "Focus timer started.";
  timerInterval = setInterval(() => {
    timerSeconds -= 1;

    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      switchTimerMode();
    }

    renderTimer();
  }, 1000);

  renderTimer();
});

timerReset.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerMode = "focus";
  timerSeconds = focusDuration;
  timerFeedback.textContent = "Timer reset to a fresh focus session.";
  renderTimer();
});

// ----------------------------------
// 9. Connect the Supabase account
// ----------------------------------
function renderAuthState(session) {
  currentUser = session?.user ?? null;
  const isSignedIn = Boolean(currentUser);

  authForm.hidden = isSignedIn;
  authActions.hidden = !isSignedIn;
  authStatus.textContent = isSignedIn
    ? `Signed in as ${currentUser.email}. Your dashboard can be synced to the cloud.`
    : "Not signed in. Your current data is stored only in this browser.";
}

async function initializeAuth() {
  const { data, error } = await campusSupabase.auth.getSession();

  if (error) {
    authFeedback.textContent = "Cloud account is unavailable right now. Local mode is still working.";
    return;
  }

  renderAuthState(data.session);
  campusSupabase.auth.onAuthStateChange((_event, session) => renderAuthState(session));
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = authEmail.value.trim();
  authFeedback.textContent = "Sending your secure sign-in link…";

  const { error } = await campusSupabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: SUPABASE_REDIRECT_URL },
  });

  authFeedback.textContent = error
    ? `Could not send the sign-in link: ${error.message}`
    : "Check your email for a secure sign-in link.";
});

authSignout.addEventListener("click", async () => {
  const { error } = await campusSupabase.auth.signOut();
  authFeedback.textContent = error ? error.message : "You have been signed out. Local data remains on this browser.";
});

// The first sync copies browser data into the signed-in user's private rows.
// Later feature work can replace this with per-action cloud mutations.
async function syncLocalData() {
  if (!currentUser) return;

  cloudSync.disabled = true;
  authFeedback.textContent = "Syncing local data…";

  const cloudRows = {
    assignments: assignments.map(({ id, title, subject, dueDate, priority, completed }) => ({
      user_id: currentUser.id, title, subject, due_date: dueDate, priority, completed,
    })),
    notes: notes.map(({ text }) => ({ user_id: currentUser.id, text })),
    courses: courses.map(({ courseName, grade }) => ({ user_id: currentUser.id, course_name: courseName, grade })),
    timetable: timetable.map(({ time, className, room, duration }) => ({
      user_id: currentUser.id, class_time: time, class_name: className, room, duration,
    })),
  };

  for (const [tableName, rows] of Object.entries(cloudRows)) {
    if (!rows.length) continue;
    const { error } = await campusSupabase.from(tableName).insert(rows);
    if (error) {
      authFeedback.textContent = `Sync stopped while saving ${tableName}. ${error.message}`;
      cloudSync.disabled = false;
      return;
    }
  }

  authFeedback.textContent = "Local data copied to your private Supabase workspace.";
  cloudSync.disabled = false;
}

cloudSync.addEventListener("click", syncLocalData);

// --------------------------------
// 10. Apply visual preferences
// --------------------------------
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDarkTheme = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDarkTheme));
  themeToggle.setAttribute("aria-label", isDarkTheme ? "Switch to light theme" : "Switch to dark theme");
  themeToggle.querySelector(".theme-toggle-label").textContent = isDarkTheme ? "Light" : "Dark";
}

function applyMotionPreference(shouldReduceMotion) {
  document.documentElement.classList.toggle("reduce-motion", shouldReduceMotion);
  reduceMotionToggle.checked = shouldReduceMotion;
}

function initializePreferences() {
  const savedTheme = localStorage.getItem(themeStorageKey) || "light";
  const savedMotionPreference = localStorage.getItem(motionStorageKey) === "true";

  applyTheme(savedTheme);
  applyMotionPreference(savedMotionPreference);
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(themeStorageKey, nextTheme);
  applyTheme(nextTheme);
});

reduceMotionToggle.addEventListener("change", () => {
  localStorage.setItem(motionStorageKey, String(reduceMotionToggle.checked));
  applyMotionPreference(reduceMotionToggle.checked);
});

// ----------------------------------------
// 11. Keep the mobile menu accessible
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

// -----------------------------------
// 12. Start the page with current data
// -----------------------------------
initializePreferences();
initializeAuth();
renderDashboard({
  ...dashboardState,
  openAssignments: assignments.filter((assignment) => !assignment.completed).length,
});
renderAssignments();
updateAssignmentSummary();
renderNotes();
renderCourses();
renderTimetable();
renderTimer();
