import { initializeShell } from './layout.js';
import { STORAGE_KEYS, loadData, saveData } from './storage.js';
import { escapeHtml, formatDate, makeId, announce } from './utils.js';

initializeShell();
let notes = loadData(STORAGE_KEYS.notes, [], 'notes');
const form = document.querySelector('#note-form'); const text = document.querySelector('#note-text'); const list = document.querySelector('#note-list'); const feedback = document.querySelector('#note-feedback');
function render() { list.innerHTML = notes.length ? notes.map((note) => `<li class="note-item"><p>${escapeHtml(note.text)}</p><div class="note-item-footer"><time datetime="${note.createdAt}">${formatDate(new Date(note.createdAt))}</time><button class="note-delete" type="button" data-id="${note.id}" aria-label="Delete note">Delete</button></div></li>`).join('') : '<li class="empty-state">No saved notes yet. Add your first thought above.</li>'; }
form?.addEventListener('submit', (event) => { event.preventDefault(); const value = text.value.trim(); if (!value) return; notes.unshift({ id: makeId(), text: value, createdAt: new Date().toISOString() }); saveData(STORAGE_KEYS.notes, notes); render(); form.reset(); announce(feedback, 'Note saved.'); });
list?.addEventListener('click', (event) => { const button = event.target.closest('[data-id]'); if (!button) return; notes = notes.filter((note) => note.id !== button.dataset.id); saveData(STORAGE_KEYS.notes, notes); render(); announce(feedback, 'Note deleted.'); });
render();
