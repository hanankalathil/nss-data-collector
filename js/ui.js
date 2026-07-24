/**
 * UI Renderer, Dynamic Options Builder, and Interactive Features
 */

const UIRenderer = (() => {
  // Option Datasets
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Other'];
  const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'others'];
  const classes = ['+1 Science', '+1 Commerce', '+1 Humanities', '+2 Science', '+2 Commerce', '+2 Humanities', 'UG 1st Year', 'UG 2nd Year', 'UG 3rd Year', 'PG 1st Year', 'PG 2nd Year'];
  const divisions = ['A', 'B', 'C', 'D', 'E', 'F', 'NSS Batch 1', 'NSS Batch 2'];
  const nssBatches = ['2024-2026', '2025-2027', '2026-2028'];
  const genders = [
    { value: 'Male', label: 'Male', icon: '👨' },
    { value: 'Female', label: 'Female', icon: '👩' },
    { value: 'Other', label: 'Other / Non-binary', icon: '🧑' }
  ];
  const defaultSkills = ['First Aid & Rescue', 'Public Speaking & Anchoring', 'Leadership & Event Management', 'Media & Photography', 'Coding & Web Design', 'Cultural & Arts', 'Sports & Fitness', 'Disaster Management'];
  const languagesList = ['Malayalam', 'English', 'Hindi', 'Tamil', 'Kannada', 'Arabic'];

  /**
   * Initializes all dynamic DOM components
   */
  function initDynamicControls() {
    renderDropdownOptions('bloodGroup', bloodGroups, 'Choose Blood Group');
    renderDropdownOptions('religion', religions, 'Choose Religion');
    renderDropdownOptions('class', classes, 'Select Class');
    renderDropdownOptions('division', divisions, 'Select Division');
    renderDistrictOptions();
    setupCharacterCounters();
    setupConditionalFields();
    setupThemeToggle();
    setupWhatsAppCopy();
  }



  function renderDropdownOptions(selectId, options, placeholder) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = `<option value="" disabled selected>${placeholder}</option>` +
      options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
  }

  function renderDistrictOptions() {
    const districtSelect = document.getElementById('district');
    if (!districtSelect || !window.DistrictData) return;

    const districts = window.DistrictData.getDistricts();
    districtSelect.innerHTML = `<option value="" disabled selected>Select District</option>` +
      districts.map(d => `<option value="${d}">${d}</option>`).join('');
  }

  function setupCharacterCounters() {
    const countedFields = [
      { id: 'fullName', max: 60, counterId: 'name-counter' }
    ];

    countedFields.forEach(field => {
      const input = document.getElementById(field.id);
      const counter = document.getElementById(field.counterId);
      if (input && counter) {
        const updateCount = () => {
          const len = input.value.length;
          counter.textContent = `${len}/${field.max}`;
          if (len >= field.max) {
            counter.classList.add('counter-limit');
          } else {
            counter.classList.remove('counter-limit');
          }
        };
        input.addEventListener('input', updateCount);
        updateCount();
      }
    });
  }

  function setupConditionalFields() {
    // Religion Other toggle
    const religionSelect = document.getElementById('religion');
    const customReligionWrapper = document.getElementById('custom-religion-wrapper');
    if (religionSelect && customReligionWrapper) {
      religionSelect.addEventListener('change', () => {
        if (religionSelect.value === 'others') {
          customReligionWrapper.classList.remove('hidden-field');
          document.getElementById('customReligion')?.focus();
        } else {
          customReligionWrapper.classList.add('hidden-field');
        }
      });
    }

    // Blood Group Other toggle
    const bloodGroupSelect = document.getElementById('bloodGroup');
    const customBloodWrapper = document.getElementById('custom-bloodgroup-wrapper');
    if (bloodGroupSelect && customBloodWrapper) {
      bloodGroupSelect.addEventListener('change', () => {
        if (bloodGroupSelect.value === 'Other') {
          customBloodWrapper.classList.remove('hidden-field');
          document.getElementById('customBloodGroup')?.focus();
        } else {
          customBloodWrapper.classList.add('hidden-field');
        }
      });
    }
  }



  function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (!toggleBtn) return;

    // Apply saved theme on boot
    const savedTheme = window.StorageManager ? window.StorageManager.getTheme() : 'light';
    applyTheme(savedTheme);

    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      if (window.StorageManager) {
        window.StorageManager.saveTheme(newTheme);
        window.StorageManager.showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info', 2000);
      }
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.innerHTML = theme === 'dark'
        ? '<path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.02 0-1.41zM7.05 18.36l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.02-.39-1.41 0z"/>'
        : '<path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4C12.92 3.04 12.46 3 12 3z"/>';
    }
  }

  function setupWhatsAppCopy() {
    const copyBtn = document.getElementById('copy-mobile-to-wa-btn');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', () => {
      const mobileVal = document.getElementById('mobile')?.value || '';
      const waInput = document.getElementById('whatsapp');
      if (waInput && mobileVal) {
        waInput.value = mobileVal;
        waInput.dispatchEvent(new Event('input', { bubbles: true }));
        if (window.StorageManager) {
          window.StorageManager.showToast('Copied Mobile Number to WhatsApp', 'success', 2000);
        }
      }
    });
  }

  return {
    initDynamicControls,
    applyTheme
  };
})();

if (typeof window !== 'undefined') {
  window.UIRenderer = UIRenderer;
}
