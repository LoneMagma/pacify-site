const root = document.documentElement;
root.classList.replace('no-js', 'js');
const media = window.matchMedia('(prefers-color-scheme: dark)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const weatherButton = document.getElementById('weather-toggle');
const weatherImg = document.querySelector('.weather-icon img');

function readTheme() {
  try {
    const stored = localStorage.getItem('pacify-theme-mode');
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

function saveTheme(mode) {
  try {
    localStorage.setItem('pacify-theme-mode', mode);
  } catch {
    // The weather still changes when storage is unavailable.
  }
}

function systemTheme() {
  return media.matches ? 'dark' : 'light';
}

function setTheme(mode, persist = true) {
  const theme = mode === 'system' ? systemTheme() : mode;
  root.dataset.theme = theme;
  root.dataset.themeMode = mode;

  if (weatherButton) {
    const dark = theme === 'dark';
    weatherButton.setAttribute('aria-pressed', String(dark));
    weatherButton.setAttribute('aria-label', dark ? 'Switch to day weather' : 'Switch to night weather');
  }

  if (weatherImg) {
    weatherImg.src = theme === 'dark' ? 'assets/weather-dark.svg' : 'assets/weather-light.svg';
  }

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#182027' : '#efe4d0');
  if (persist) saveTheme(mode);
}

setTheme(readTheme(), false);

weatherButton?.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

function handleSystemChange() {
  if (root.dataset.themeMode === 'system') setTheme('system', false);
}

if (typeof media.addEventListener === 'function') {
  media.addEventListener('change', handleSystemChange);
} else if (typeof media.addListener === 'function') {
  media.addListener(handleSystemChange);
}

if (!reducedMotion.matches) {
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      root.style.setProperty('--map-shift', `${Math.sin(window.scrollY / 900) * 18}px`);
      ticking = false;
    });
  }, { passive: true });
}
