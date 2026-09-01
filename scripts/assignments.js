import { initializeShell } from './layout.js';
import { STORAGE_KEYS, starterAssignments, loadData, saveData } from './storage.js';
import { escapeHtml, formatDueDate, makeId, announce } from './utils.js';

initializeShell();
let assignments = loadData(STORAGE_KEYS.assignments, starterAssignments, 'assignments');
let filter = 'all';
const form = document.querySelector('#assignment-form');
const list = document.querySelector('#assignment-list');
const filterSelect = document.querySelector('#assignment-filter');
const feedback = document.querySelector('#assignment-feedback');

function render() {
  const visible = assignments.filter((item) => filter === 'all' || (filter === 'open' && !item.completed) || (filter === 'completed' && item.completed));
  list.innerHTML = visible.length ? visible.map((item) => `
    <li class="assignment-item${item.completed ? ' assignment-item--completed' : ''}">
      <button class="assignment-toggle" type="button" data-action="toggle" data-id="${item.id}" aria-label="${item.completed ? 'Mark as open' : 'Mark as complete'} ${escapeHtml(item.title)}" aria-pressed="${item.completed}"><span class="status-dot ${item.priority === 'urgent' ? 'status-dot--urgent' : ''}" aria-hidden="true"></span></button>
      <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.subject)} · ${item.completed ? 'Completed' : `Due ${formatDueDate(item.dueDate)}`}</p></div>
      <span class="priority-label priority-label--${item.priority}">${item.priority}</span>
      <button class="assignment-delete" type="button" data-action="delete" data-id="${item.id}" aria-label="Delete ${escapeHtml(item.title)}">×</button>
    </li>`).join('') : '<li class="empty-state">No assignments match this filter.</li>';
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  assignments.push({ id: makeId(), title: data.get('title').trim(), subject: data.get('subject').trim(), dueDate: data.get('dueDate'), priority: data.get('priority'), completed: false });
  saveData(STORAGE_KEYS.assignments, assignments); render(); form.reset(); announce(feedback, 'Assignment added.');
});
filterSelect?.addEventListener('change', (event) => { filter = event.target.value; render(); });
list?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]'); if (!button) return;
  const item = assignments.find((entry) => entry.id === button.dataset.id); if (!item) return;
  if (button.dataset.action === 'toggle') { item.completed = !item.completed; announce(feedback, item.completed ? 'Assignment completed.' : 'Assignment reopened.'); }
  if (button.dataset.action === 'delete') { assignments = assignments.filter((entry) => entry.id !== item.id); announce(feedback, 'Assignment deleted.'); }
  saveData(STORAGE_KEYS.assignments, assignments); render();
});
render();
