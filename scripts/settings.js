import { initializeShell } from './layout.js';
import { STORAGE_KEYS, loadData } from './storage.js';

// Settings owns comfort and account controls so the other pages stay focused.
initializeShell();

const motionToggle = document.querySelector('#reduce-motion-toggle');
const settingsFeedback = document.querySelector('#settings-feedback');
const authForm = document.querySelector('#auth-form');
const authEmail = document.querySelector('#auth-email');
const authStatus = document.querySelector('#auth-status');
const authActions = document.querySelector('.auth-actions');
const authSignout = document.querySelector('#auth-signout');
const cloudSync = document.querySelector('#cloud-sync');
const authFeedback = document.querySelector('#auth-feedback');

// Reduced-motion preference is stored locally because it belongs to this browser.
const savedMotion = localStorage.getItem(STORAGE_KEYS.reducedMotion) === 'true';
motionToggle.checked = savedMotion;
document.documentElement.classList.toggle('reduce-motion', savedMotion);
motionToggle.addEventListener('change', () => {
  localStorage.setItem(STORAGE_KEYS.reducedMotion, String(motionToggle.checked));
  document.documentElement.classList.toggle('reduce-motion', motionToggle.checked);
  settingsFeedback.textContent = motionToggle.checked ? 'Reduced motion enabled.' : 'Reduced motion disabled.';
});

let currentUser = null;
function renderAuthState(session) {
  currentUser = session?.user ?? null;
  const signedIn = Boolean(currentUser);
  authForm.hidden = signedIn;
  authActions.hidden = !signedIn;
  authStatus.textContent = signedIn
    ? `Signed in as ${currentUser.email}. Your data can be synced to the cloud.`
    : 'Not signed in. Your current data is stored only in this browser.';
}

async function initializeAuth() {
  const { data, error } = await campusSupabase.auth.getSession();
  if (error) {
    authFeedback.textContent = 'Cloud account is unavailable. Local mode is still working.';
    return;
  }
  renderAuthState(data.session);
  campusSupabase.auth.onAuthStateChange((_event, session) => renderAuthState(session));
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  authFeedback.textContent = 'Sending your secure sign-in link…';
  const { error } = await campusSupabase.auth.signInWithOtp({
    email: authEmail.value.trim(),
    options: { emailRedirectTo: SUPABASE_REDIRECT_URL },
  });
  authFeedback.textContent = error ? `Could not send the sign-in link: ${error.message}` : 'Check your email for a secure sign-in link.';
});

authSignout.addEventListener('click', async () => {
  const { error } = await campusSupabase.auth.signOut();
  authFeedback.textContent = error ? error.message : 'You have been signed out. Local data remains in this browser.';
});

// The first cloud action deliberately copies all local records in one readable step.
async function syncLocalData() {
  if (!currentUser) return;
  cloudSync.disabled = true;
  authFeedback.textContent = 'Syncing local data…';
  const assignments = loadData(STORAGE_KEYS.assignments, []);
  const notes = loadData(STORAGE_KEYS.notes, []);
  const courses = loadData(STORAGE_KEYS.courses, []);
  const timetable = loadData(STORAGE_KEYS.timetable, []);
  const groups = {
    assignments: assignments.map(({ title, subject, dueDate, priority, completed }) => ({ user_id: currentUser.id, title, subject, due_date: dueDate, priority, completed })),
    notes: notes.map(({ text }) => ({ user_id: currentUser.id, text })),
    courses: courses.map(({ courseName, grade }) => ({ user_id: currentUser.id, course_name: courseName, grade })),
    timetable: timetable.map(({ time, className, room, duration }) => ({ user_id: currentUser.id, class_time: time, class_name: className, room, duration })),
  };
  for (const [table, rows] of Object.entries(groups)) {
    if (!rows.length) continue;
    const { error } = await campusSupabase.from(table).insert(rows);
    if (error) { authFeedback.textContent = `Sync stopped while saving ${table}. ${error.message}`; cloudSync.disabled = false; return; }
  }
  authFeedback.textContent = 'Local data copied to your private Supabase workspace.';
  cloudSync.disabled = false;
}

cloudSync.addEventListener('click', syncLocalData);
initializeAuth();
