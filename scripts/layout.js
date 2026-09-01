// Every page imports this module so navigation and preferences behave the same way.
export function initializeShell() {
  const menuButton = document.querySelector('.menu-button');
  const navigation = document.querySelector('#primary-navigation');
  const themeToggle = document.querySelector('#theme-toggle');
  const currentPage = document.body.dataset.page;

  navigation?.querySelectorAll('a').forEach((link) => {
    if (link.dataset.page === currentPage) link.setAttribute('aria-current', 'page');
  });

  const setMenu = (open) => {
    if (!menuButton || !navigation) return;
    navigation.classList.toggle('site-nav--open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', (event) => { if (!event.target.closest('.site-header')) setMenu(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });

  const savedTheme = localStorage.getItem('campus-companion-theme') || 'light';
  document.documentElement.dataset.theme = savedTheme;
  const updateThemeButton = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    themeToggle?.setAttribute('aria-pressed', String(dark));
    themeToggle?.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    if (themeToggle) themeToggle.querySelector('.theme-toggle-label').textContent = dark ? 'Light' : 'Dark';
  };
  themeToggle?.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('campus-companion-theme', nextTheme);
    updateThemeButton();
  });
  updateThemeButton();
}
