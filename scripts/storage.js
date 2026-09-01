// Shared browser storage helpers keep every page consistent.
export const STORAGE_KEYS = {
  assignments: 'campus-companion-assignments',
  notes: 'campus-companion-notes',
  courses: 'campus-companion-courses',
  timetable: 'campus-companion-timetable',
  theme: 'campus-companion-theme',
  reducedMotion: 'campus-companion-reduced-motion',
};

export const starterAssignments = [
  { id: 'portfolio-wireframes', title: 'Portfolio wireframes', subject: 'Web Development', dueDate: '2026-09-09', priority: 'urgent', completed: false },
  { id: 'research-summary', title: 'Research summary', subject: 'Academic Writing', dueDate: '2026-09-11', priority: 'medium', completed: false },
  { id: 'functions-practice', title: 'Functions practice set', subject: 'Mathematics', dueDate: '2026-09-12', priority: 'low', completed: false },
];

export const starterTimetable = [
  { id: 'web-development', time: '10:00', className: 'Web Development', room: 'B204', duration: 90 },
  { id: 'academic-writing', time: '13:00', className: 'Academic Writing', room: 'A103', duration: 60 },
  { id: 'mathematics', time: '15:00', className: 'Mathematics', room: 'C301', duration: 90 },
];

export function loadData(key, fallback, name = 'data') {
  const saved = localStorage.getItem(key);
  if (!saved) return structuredClone(fallback);
  try { return JSON.parse(saved); }
  catch { console.warn(`Saved ${name} could not be read. Using starter data.`); return structuredClone(fallback); }
}

export function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
