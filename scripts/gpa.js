import { initializeShell } from './layout.js';
import { STORAGE_KEYS, loadData, saveData } from './storage.js';
import { escapeHtml, makeId, announce } from './utils.js';

// GPA is a focused page: it only owns course input, calculation, and removal.
initializeShell();
let courses = loadData(STORAGE_KEYS.courses, [], 'courses');

const form = document.querySelector('#gpa-form');
const courseName = form?.querySelector('[name="courseName"]');
const gradeSelect = form?.querySelector('[name="grade"]');
const gradeLabel = form?.querySelector('[name="label"]');
const list = document.querySelector('#course-list');
const result = document.querySelector('#gpa-result');
const feedback = document.querySelector('#gpa-feedback');

function render() {
  // Each grade is stored as a number, so the average stays easy to explain.
  const totalPoints = courses.reduce((sum, course) => sum + Number(course.grade), 0);
  const currentGpa = courses.length ? (totalPoints / courses.length).toFixed(2) : '0.00';
  result.textContent = `GPA ${currentGpa}`;
  list.innerHTML = courses.length ? courses.map((course) => `
    <li class="course-item"><span>${escapeHtml(course.courseName)}</span><strong>${course.label}</strong><button class="course-delete" type="button" data-id="${course.id}" aria-label="Remove ${escapeHtml(course.courseName)}">×</button></li>
  `).join('') : '<li class="empty-state">Add a course to calculate your GPA.</li>';
}

// The visible grade and hidden label are kept synchronized before submission.
gradeSelect?.addEventListener('change', () => {
  gradeLabel.value = gradeSelect.selectedOptions[0].dataset.label;
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  courses.push({ id: makeId(), courseName: data.get('courseName').trim(), grade: Number(data.get('grade')), label: data.get('label') });
  saveData(STORAGE_KEYS.courses, courses);
  render();
  form.reset();
  gradeLabel.value = gradeSelect.selectedOptions[0].dataset.label;
  announce(feedback, 'Course added.');
});

list?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-id]');
  if (!button) return;
  courses = courses.filter((course) => course.id !== button.dataset.id);
  saveData(STORAGE_KEYS.courses, courses);
  render();
  announce(feedback, 'Course removed.');
});

render();
