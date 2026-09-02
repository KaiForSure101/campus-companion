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

function isNetworkError(error) {
  const message = error?.message?.toLowerCase() ?? '';
  return message.includes('fetch') || message.includes('network');
}

// A direct fetch gives the browser one simpler path if the client wrapper fails.
async function directAuthRequest(path, body) {
  const response = await fetch(`${window.CAMPUS_SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: window.CAMPUS_SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return { error: { message: payload.msg || payload.error_description || 'Authentication request failed.', status: response.status } };
  return { data: payload, error: null };
}

// Demo sign-up uses password authentication, so no email provider is required.
authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  authFeedback.textContent = 'Creating your demo account…';
  const { email, password } = credentials();
  let { data, error } = await campusSupabase.auth.signUp({ email, password });
  if (error && isNetworkError(error)) ({ data, error } = await directAuthRequest('signup', { email, password }));
  if (error) {
    const networkHint = isNetworkError(error)
      ? ' Check your connection, disable an ad blocker for this site, and try again.'
      : '';
    authFeedback.textContent = `Could not create the account: ${error.message}.${networkHint}`;
    return;
  }
  // The direct REST response does not automatically update the client session.
  if (data?.access_token && data?.refresh_token) {
    await campusSupabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
  }
  const session = (await campusSupabase.auth.getSession()).data.session;
  renderAuthState(session);
  authFeedback.textContent = session ? 'Demo account created and signed in.' : 'Account created. You can now use Sign in.';
});

authLogin.addEventListener('click', async () => {
  authFeedback.textContent = 'Signing you in…';
  const { email, password } = credentials();
  let { error } = await campusSupabase.auth.signInWithPassword({ email, password });
  if (error && isNetworkError(error)) ({ error } = await directAuthRequest('token?grant_type=password', { email, password }));
  if (error) {
    const networkHint = isNetworkError(error)
      ? ' Check your connection, disable an ad blocker for this site, and try again.'
      : '';
    authFeedback.textContent = `Could not sign in: ${error.message}.${networkHint}`;
    return;
  }
  authFeedback.textContent = 'Signed in successfully.';
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
