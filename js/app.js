/**
 * StudentKit India - Master Application Logic & Router
 */

import { initPercentageCalculator } from './calculators/percentage.js';
import { initCgpaCalculator } from './calculators/cgpa.js';
import { initMarksCalculator } from './calculators/marks.js';
import { initAttendanceCalculator } from './calculators/attendance.js';
import { initGradeCalculator } from './calculators/grade.js';
import { initAgeCalculator } from './calculators/age.js';
import { initEmiCalculator } from './calculators/emi.js';
import { initUnitConverter } from './calculators/unit.js';
import { initImageCompressor } from './media/compressor.js';
import { initImageResizer } from './media/resizer.js';

// Global Toast Notification Helper
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Management (Dark / Light)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('studentkit-theme', theme);
    if (theme === 'light') {
      if (themeIcon) themeIcon.textContent = '🌙';
      if (themeText) themeText.textContent = 'Dark Mode';
    } else {
      if (themeIcon) themeIcon.textContent = '☀️';
      if (themeText) themeText.textContent = 'Light Mode';
    }
  }

  const savedTheme = localStorage.getItem('studentkit-theme') || 'dark';
  setTheme(savedTheme);

  themeToggleBtn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'light' ? 'dark' : 'light');
  });

  // 2. Mobile Sidebar Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

  function openSidebar() {
    sidebar?.classList.add('mobile-open');
  }

  function closeSidebar() {
    sidebar?.classList.remove('mobile-open');
  }

  mobileMenuBtn?.addEventListener('click', openSidebar);
  sidebarCloseBtn?.addEventListener('click', closeSidebar);

  // Close sidebar on item click (on mobile)
  document.querySelectorAll('.nav-item-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });

  // 3. Hash Router
  const navLinks = document.querySelectorAll('.nav-item-link');
  const views = document.querySelectorAll('.tool-view');

  function navigateTo(hash) {
    const targetHash = hash || '#home';
    const targetViewId = targetHash.replace('#', '') + '-view';

    let found = false;
    views.forEach(v => {
      if (v.id === targetViewId) {
        v.classList.add('active');
        found = true;
      } else {
        v.classList.remove('active');
      }
    });

    if (!found) {
      document.getElementById('home-view')?.classList.add('active');
    }

    navLinks.forEach(link => {
      if (link.getAttribute('href') === targetHash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.addEventListener('hashchange', () => {
    navigateTo(window.location.hash);
  });

  // Initial Route
  navigateTo(window.location.hash || '#home');

  // 4. Global Search Filter
  const searchInput = document.getElementById('global-search-input');
  const toolCards = document.querySelectorAll('.tool-card');

  searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      toolCards.forEach(c => c.style.display = 'flex');
      return;
    }

    // Auto-switch to home if searching from a subpage
    if (window.location.hash !== '#home') {
      window.location.hash = '#home';
    }

    toolCards.forEach(card => {
      const title = card.querySelector('.tool-card-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.tool-card-desc')?.textContent.toLowerCase() || '';
      const tags = card.dataset.tags ? card.dataset.tags.toLowerCase() : '';

      if (title.includes(query) || desc.includes(query) || tags.includes(query)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // Keyboard shortcut Ctrl+K or / to focus search
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement !== searchInput && document.activeElement.tagName !== 'INPUT')) {
      e.preventDefault();
      searchInput?.focus();
      searchInput?.select();
    }
  });

  // 5. Global Copy-to-Clipboard Buttons
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.copy-btn');
    if (copyBtn) {
      const targetId = copyBtn.dataset.copyTarget;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const textToCopy = targetEl.innerText || targetEl.textContent;
        navigator.clipboard.writeText(textToCopy.trim()).then(() => {
          showToast('Copied to clipboard!', 'success');
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = `✓ Copied`;
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
          }, 1500);
        }).catch(() => {
          showToast('Failed to copy', 'error');
        });
      }
    }
  });

  // 6. Initialize all 10 tools
  try {
    initPercentageCalculator();
    initCgpaCalculator();
    initMarksCalculator();
    initAttendanceCalculator();
    initGradeCalculator();
    initAgeCalculator();
    initEmiCalculator();
    initUnitConverter();
    initImageCompressor(showToast);
    initImageResizer(showToast);
  } catch (err) {
    console.error('Initialization error:', err);
  }
});
