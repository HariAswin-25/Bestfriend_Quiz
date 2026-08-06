import { sounds } from './utils.js';

// Global Toast System
export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Theme Engine Initialization
function initTheme() {
  const savedTheme = localStorage.getItem('bf_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    themeBtn.addEventListener('click', () => {
      sounds.playClick();
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('bf_theme', next);
      themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }
}

// Global Sound Toggle Setup
function initSoundToggle() {
  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    soundBtn.textContent = sounds.muted ? '🔇' : '🔊';
    soundBtn.addEventListener('click', () => {
      const muted = sounds.toggleMute();
      soundBtn.textContent = muted ? '🔇' : '🔊';
      showToast(muted ? 'Sound Muted' : 'Sound Enabled', 'info');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSoundToggle();

  // Add click sound listeners to interactive buttons
  document.querySelectorAll('.btn, .avatar-item').forEach(el => {
    el.addEventListener('click', () => sounds.playClick());
  });
});
