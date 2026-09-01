import { initializeShell } from './layout.js';
import { STORAGE_KEYS, starterTimetable, loadData, saveData } from './storage.js';
import { escapeHtml, makeId, announce } from './utils.js';

// This page owns classes and the focus timer, so neither feature has to share a long dashboard.
initializeShell();
let timetable = loadData(STORAGE_KEYS.timetable, starterTimetable, 'timetable');
let secondsRemaining = 25 * 60;
let timerId = null;

const form = document.querySelector('#timetable-form');
const list = document.querySelector('#timetable-list');
const feedback = document.querySelector('#timetable-feedback');
const timerDisplay = document.querySelector('#timer-display');
const timerStart = document.querySelector('#timer-start');
const timerReset = document.querySelector('#timer-reset');
const timerFeedback = document.querySelector('#timer-feedback');
const timerSoundToggle = document.querySelector('#timer-sound-toggle');

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
  timerDisplay.textContent = `${minutes}:${seconds}`;
  timerDisplay.setAttribute('aria-label', `${minutes} minutes ${seconds} seconds remaining`);
  timerStart.textContent = timerId ? 'Pause focus' : secondsRemaining === 0 ? 'Start again' : 'Start focus';
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
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

timerStart?.addEventListener('click', () => {
  if (timerId) {
    stopTimer();
    announce(timerFeedback, 'Focus timer paused.');
    renderTimer();
    return;
  }

  if (secondsRemaining === 0) secondsRemaining = 25 * 60;
  timerId = setInterval(() => {
    secondsRemaining -= 1;
    renderTimer();
    if (secondsRemaining <= 0) {
      stopTimer();
      playCompletionSound();
      announce(timerFeedback, timerSoundToggle?.checked ? 'Focus session complete. A sound played; take a short break.' : 'Focus session complete. Take a short break.');
    }
  }, 1000);
  announce(timerFeedback, 'Focus timer started.');
  renderTimer();
});

timerReset?.addEventListener('click', () => {
  stopTimer();
  secondsRemaining = 25 * 60;
  renderTimer();
  announce(timerFeedback, 'Timer reset to a fresh focus session.');
});

renderTimetable();
renderTimer();
