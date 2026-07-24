/**
 * LocalStorage & State Persistence Manager
 */

const StorageManager = (() => {
  const STORAGE_KEY = 'nss_student_form_draft_v1';
  const THEME_KEY = 'nss_theme_preference';

  /**
   * Save draft object to LocalStorage
   * @param {Object} data 
   */
  function saveDraft(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        timestamp: new Date().toISOString(),
        formData: data
      }));
    } catch (e) {
      console.warn('Unable to save draft to LocalStorage', e);
    }
  }

  /**
   * Get draft object from LocalStorage
   * @returns {Object|null}
   */
  function getDraft() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return parsed.formData || null;
    } catch (e) {
      console.warn('Unable to parse draft from LocalStorage', e);
      return null;
    }
  }

  /**
   * Clear saved draft from LocalStorage
   */
  function clearDraft() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Unable to clear draft', e);
    }
  }

  /**
   * Theme persistence
   */
  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Unable to save theme', e);
    }
  }

  function getTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || 'light';
    } catch (e) {
      return 'light';
    }
  }

  /**
   * Toast notification helper
   * @param {string} message 
   * @param {string} type 'success' | 'info' | 'warning'
   * @param {number} duration 
   */
  function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type} animate-slide-up`;
    
    const iconSvg = type === 'success' 
      ? '<svg viewBox="0 0 24 24" class="toast-icon"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
      : '<svg viewBox="0 0 24 24" class="toast-icon"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 300);
    });

    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  return {
    saveDraft,
    getDraft,
    clearDraft,
    saveTheme,
    getTheme,
    showToast
  };
})();

if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}
