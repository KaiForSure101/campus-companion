import { initializeShell } from './layout.js';
import { STORAGE_KEYS, starterAssignments, starterTimetable, loadData } from './storage.js';
import { formatDate } from './utils.js';

initializeShell();
const assignments = loadData(STORAGE_KEYS.assignments, starterAssignments);
const timetable = loadData(STORAGE_KEYS.timetable, starterTimetable);
const now = new Date();
document.querySelector('#page-title').textContent = `${now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'}, student.`;
document.querySelector('#dashboard-date').textContent = formatDate(now);
document.querySelector('#classes-today-value').textContent = timetable.length;
document.querySelector('#open-assignments-value').textContent = assignments.filter((item) => !item.completed).length;
document.querySelector('#next-class-note').textContent = timetable.length ? `Next: ${timetable[0].className} at ${timetable[0].time}` : 'No classes planned';
document.querySelector('#assignments-week-note').textContent = `${assignments.filter((item) => item.priority === 'urgent' && !item.completed).length} urgent assignments`;
