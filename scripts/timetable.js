import { initializeShell } from './layout.js';
import { STORAGE_KEYS, starterTimetable, loadData, saveData } from './storage.js';
import { escapeHtml, makeId, announce } from './utils.js';

// This page owns classes and the focus timer, so neither feature has to share a long dashboard.
initializeShell();
let timetable = loadData(STORAGE_KEYS.timetable, starterTimetable, 'timetable');
const defaultTimerSettings = { focusMinutes: 25, breakMinutes: 5 };
const storedTimerSettings = loadData(STORAGE_KEYS.timerSettings, defaultTimerSettings, 'timer settings');
let timerSettings = {
  focusMinutes: clampMinutes(storedTimerSettings.focusMinutes, 1, 120, defaultTimerSettings.focusMinutes),
  breakMinutes: clampMinutes(storedTimerSettings.breakMinutes, 1, 60, defaultTimerSettings.breakMinutes),
};
let timerMode = 'focus';
let secondsRemaining = timerSettings.focusMinutes * 60;
let timerId = null;

const form = document.querySelector('#timetable-form');
const list = document.querySelector('#timetable-list');
const feedback = document.querySelector('#timetable-feedback');
const timerModeLabel = document.querySelector('#timer-mode');
const timerDisplay = document.querySelector('#timer-display');
const timerDescription = document.querySelector('#timer-description');
const timerFocusMinutes = document.querySelector('#timer-focus-minutes');
const timerBreakMinutes = document.querySelector('#timer-break-minutes');
const timerApply = document.querySelector('#timer-apply');
const timerStart = document.querySelector('#timer-start');
const timerReset = document.querySelector('#timer-reset');
const timerFeedback = document.querySelector('#timer-feedback');
const timerSoundToggle = document.querySelector('#timer-sound-toggle');

function clampMinutes(value, minimum, maximum, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, minimum), maximum);
}

function getModeMinutes() {
  return timerMode === 'focus' ? timerSettings.focusMinutes : timerSettings.breakMinutes;
}

function getModeLabel() {
  return timerMode === 'focus' ? 'Focus session' : 'Break session';
}

function updateTimerInputs() {
  if (timerFocusMinutes) timerFocusMinutes.value = timerSettings.focusMinutes;
  if (timerBreakMinutes) timerBreakMinutes.value = timerSettings.breakMinutes;
}

// Browsers allow audio after a user gesture, and pressing Start focus is one.
let audioContext;
function playCompletionSound() {
  if (!timerSoundToggle?.checked) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioContext ??= new AudioContext();
  const startTime = audioContext.currentTime;
  [0, 0.22, 0.44].forEach((offset, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = index === 2 ? 880 : 660;
    gain.gain.setValueAtTime(0.0001, startTime + offset);
    gain.gain.exponentialRampToValueAtTime(0.18, startTime + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + offset + 0.18);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(startTime + offset);
    oscillator.stop(startTime + offset + 0.2);
  });
}

function renderTimetable() {
  const sorted = [...timetable].sort((a, b) => a.time.localeCompare(b.time));
  list.innerHTML = sorted.length ? sorted.map((item) => `
    <li class="timeline-item"><time datetime="${item.time}">${item.time}</time><div><h3>${escapeHtml(item.className)}</h3><p>Room ${escapeHtml(item.room)} · ${item.duration} minutes</p></div><button class="class-delete" type="button" data-id="${item.id}" aria-label="Remove ${escapeHtml(item.className)}">×</button></li>
  `).join('') : '<li class="empty-state">No classes added yet.</li>';
}

function renderTimer() {
  const minutes = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
  const seconds = (secondsRemaining % 60).toString().padStart(2, '0');
  const modeLabel = getModeLabel();
  timerModeLabel.textContent = modeLabel;
  timerDisplay.textContent = `${minutes}:${seconds}`;
  timerDisplay.setAttribute('aria-label', `${minutes} minutes ${seconds} seconds remaining in ${modeLabel.toLowerCase()}`);
  timerStart.textContent = timerId ? 'Pause timer' : secondsRemaining === 0 ? 'Start again' : timerMode === 'focus' ? 'Start focus' : 'Start break';
  timerDescription.textContent = timerMode === 'focus'
    ? `${timerSettings.focusMinutes}-minute focus block, followed by a ${timerSettings.breakMinutes}-minute break.`
    : `${timerSettings.breakMinutes}-minute break. Your next focus block will be ${timerSettings.focusMinutes} minutes.`;
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function completeTimerCycle() {
  stopTimer();
  playCompletionSound();

  if (timerMode === 'focus') {
    timerMode = 'break';
    secondsRemaining = timerSettings.breakMinutes * 60;
    announce(timerFeedback, timerSoundToggle?.checked
      ? 'Focus session complete. A sound played; your break timer is ready.'
      : 'Focus session complete. Your break timer is ready.');
  } else {
    timerMode = 'focus';
    secondsRemaining = timerSettings.focusMinutes * 60;
    announce(timerFeedback, timerSoundToggle?.checked
      ? 'Break complete. A sound played; your next focus timer is ready.'
      : 'Break complete. Your next focus timer is ready.');
  }
  renderTimer();
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  timetable.push({ id: makeId(), time: data.get('time'), className: data.get('className').trim(), room: data.get('room').trim(), duration: Number(data.get('duration')) });
  saveData(STORAGE_KEYS.timetable, timetable);
  renderTimetable();
  form.reset();
  announce(feedback, 'Class added to your timetable.');
});

list?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-id]');
  if (!button) return;
  timetable = timetable.filter((item) => item.id !== button.dataset.id);
  saveData(STORAGE_KEYS.timetable, timetable);
  renderTimetable();
  announce(feedback, 'Class removed from your timetable.');
});

timerApply?.addEventListener('click', () => {
  const focusMinutes = clampMinutes(timerFocusMinutes?.value, 1, 120, timerSettings.focusMinutes);
  const breakMinutes = clampMinutes(timerBreakMinutes?.value, 1, 60, timerSettings.breakMinutes);
  timerSettings = { focusMinutes, breakMinutes };
  saveData(STORAGE_KEYS.timerSettings, timerSettings);
  updateTimerInputs();
  stopTimer();
  timerMode = 'focus';
  secondsRemaining = timerSettings.focusMinutes * 60;
  renderTimer();
  announce(timerFeedback, `Timer updated to ${focusMinutes} minutes of focus and ${breakMinutes} minutes of break.`);
});

timerStart?.addEventListener('click', () => {
  if (timerId) {
    stopTimer();
    announce(timerFeedback, 'Timer paused.');
    renderTimer();
    return;
  }

  if (secondsRemaining === 0) secondsRemaining = getModeMinutes() * 60;
  timerId = setInterval(() => {
    secondsRemaining -= 1;
    renderTimer();
    if (secondsRemaining <= 0) completeTimerCycle();
  }, 1000);
  announce(timerFeedback, `${getModeLabel()} started.`);
  renderTimer();
});

timerReset?.addEventListener('click', () => {
  stopTimer();
  timerMode = 'focus';
  secondsRemaining = timerSettings.focusMinutes * 60;
  renderTimer();
  announce(timerFeedback, `Timer reset to a ${timerSettings.focusMinutes}-minute focus session.`);
});

updateTimerInputs();
renderTimetable();
renderTimer();
