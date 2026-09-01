// Small pure helpers are shared by page modules and are easy to test.
export const makeId = () => window.crypto?.randomUUID?.() ?? String(Date.now());
export const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
export const formatDate = (date) => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
export const formatDueDate = (value) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`));
export const announce = (element, message) => { if (element) element.textContent = message; };
