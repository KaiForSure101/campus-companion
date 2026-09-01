import { initializeShell } from './layout.js';
import { STORAGE_KEYS, loadData } from './storage.js';

// Settings owns comfort and account controls so the other pages stay focused.
initializeShell();

const motionToggle = document.querySelector('#reduce-motion-toggle');
const settingsFeedback = document.querySelector('#settings-feedback');
const authForm = document.querySelector('#auth-form');
const authEmail = document.querySelector('#auth-email');
const authPassword = document.querySelector('#auth-password');
const authStatus = document.querySelector('#auth-status');
const authActions = document.querySelector('.auth-actions');
const authSignup = document.querySelector('#auth-signup');
const authLogin = document.querySelector('#auth-login');
const authSignout = document.querySelector('#auth-signout');
const cloudSync = document.querySelector('#cloud-sync');
const authFeedback = document.querySelector('#auth-feedback');

// Reduced motion is a browser preference, so it is stored locally.
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

function credentials() {
  return { email: authEmail.value.trim(), password: authPassword.value };
}

// Demo sign-up uses password authentication, so no email provider is required.
authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  authFeedback.textContent = 'Creating your demo account…';
  const { email, password } = credentials();
  const { data, error } = await campusSupabase.auth.signUp({ email, password });
  if (error) {
    authFeedback.textContent = `Could not create the account: ${error.message}`;
    return;
  }
  renderAuthState(data.session);
  authFeedback.textContent = data.session ? 'Demo account created and signed in.' : 'Account created. Check the Supabase email-confirmation setting if sign-in is not immediate.';
});

authLogin.addEventListener('click', async () => {
  authFeedback.textContent = 'Signing you in…';
  const { email, password } = credentials();
  const { error } = await campusSupabase.auth.signInWithPassword({ email, password });
  authFeedback.textContent = error ? `Could not sign in: ${error.message}` : 'Signed in successfully.';
});

authSignout.addEventListener('click', async () => {
  const { error } = await campusSupabase.auth.signOut();
  authFeedback.textContent = error ? error.message : 'You have been signed out. Local data remains in this browser.';
});

// The first cloud action copies all local records in one readable step.
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
