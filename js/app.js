/**
 * Core Application Controller
 * Coordinates validation, inputs, auto-save draft, and UI states.
 */

const AppController = (() => {
  let saveTimeout = null;

  function init() {
    // 1. Initialize UI Controls & Options
    if (window.UIRenderer) window.UIRenderer.initDynamicControls();

    // 2. Initialize Multi-Step Wizard
    if (window.WizardEngine) window.WizardEngine.initWizard();

    // 3. Attach Live Validation & Input Masking
    setupInputListeners();

    // 4. Check & Restore Saved Draft
    restoreDraft();

    // 5. Setup Form Submit Handler
    const form = document.getElementById('nss-main-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (window.SubmitEngine) {
          window.SubmitEngine.handleSubmit(e);
        }
      });
    }

    const finalSubmitBtn = document.getElementById('final-submit-btn');
    if (finalSubmitBtn) {
      finalSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.SubmitEngine) {
          window.SubmitEngine.handleSubmit(e);
        }
      });
    }
  }

  function setupInputListeners() {
    const inputs = document.querySelectorAll('#nss-main-form input, #nss-main-form select, #nss-main-form textarea');

    inputs.forEach(input => {
      // Real time formatting / masking while typing
      input.addEventListener('input', (e) => {
        handleFormatting(e.target);
        validateField(e.target);
        triggerAutoSave();
      });

      input.addEventListener('blur', (e) => {
        validateField(e.target);
        triggerAutoSave();
      });

      input.addEventListener('change', (e) => {
        validateField(e.target);
        triggerAutoSave();
      });
    });
  }

  /**
   * Auto formatting masks while typing
   */
  function handleFormatting(el) {
    const id = el.id;

    if (id === 'aadhaar' && window.Verhoeff) {
      const rawPos = el.selectionStart;
      const formatted = window.Verhoeff.format(el.value);
      el.value = formatted;
    } else if (id === 'mobile' || id === 'whatsapp') {
      el.value = el.value.replace(/\D/g, '').slice(0, 10);
    } else if (id === 'pin') {
      el.value = el.value.replace(/\D/g, '').slice(0, 6);
    } else if (id === 'dob') {
      // Auto format DD/MM/YYYY slash insertion
      let v = el.value.replace(/\D/g, '').slice(0, 8);
      if (v.length >= 5) {
        el.value = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4, 8)}`;
      } else if (v.length >= 3) {
        el.value = `${v.slice(0, 2)}/${v.slice(2, 4)}`;
      } else {
        el.value = v;
      }
    }
  }

  /**
   * Individual Field Validation Routing
   */
  function validateField(field) {
    const id = field.id;
    const val = field.value;
    const wrapper = field.closest('.form-group') || field.parentElement;
    const errorEl = wrapper ? wrapper.querySelector('.error-msg') : null;

    let res = { valid: true, message: '' };

    if (!window.ValidationEngine) return res;

    // Only validate fields with data-validate or required
    if (!field.hasAttribute('data-validate') && !field.required) {
      return res;
    }

    switch (id) {
      case 'fullName':
        res = window.ValidationEngine.validateName(val);
        break;
      case 'dob':
        res = window.ValidationEngine.validateDOB(val);
        // Live Age display update
        const ageDisplay = document.getElementById('calculated-age-badge');
        const ageInput = document.getElementById('age');
        if (res.valid && res.age !== null) {
          if (ageDisplay) {
            ageDisplay.textContent = `🎂 Age: ${res.age} Years`;
            ageDisplay.classList.remove('hidden');
          }
          if (ageInput) ageInput.value = res.age;
        } else {
          if (ageDisplay) ageDisplay.classList.add('hidden');
          if (ageInput) ageInput.value = '';
        }
        break;
      case 'mobile':
        res = window.ValidationEngine.validateMobile(val);
        break;
      case 'whatsapp':
        res = window.ValidationEngine.validateWhatsApp(val);
        break;
      case 'email':
        res = window.ValidationEngine.validateEmail(val);
        break;
      case 'aadhaar':
        res = window.ValidationEngine.validateAadhaar(val);
        break;
      case 'pin':
        res = window.ValidationEngine.validatePIN(val);
        break;
      default:
        if (field.required || field.hasAttribute('data-required')) {
          const fieldLabel = field.getAttribute('aria-label') || field.placeholder || 'Field';
          res = window.ValidationEngine.validateRequired(val, fieldLabel);
        }
        break;
    }

    // Apply visual error/valid classes to container & field
    if (!res.valid) {
      field.classList.add('input-invalid');
      field.classList.remove('input-valid');
      if (wrapper) wrapper.classList.add('has-error');
      if (errorEl) {
        errorEl.textContent = res.message;
        errorEl.classList.remove('hidden');
      }
    } else {
      field.classList.remove('input-invalid');
      if (val.trim()) field.classList.add('input-valid');
      if (wrapper) wrapper.classList.remove('has-error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
      }
    }

    return res;
  }

  function validateAll() {
    const fields = document.querySelectorAll('#nss-main-form [data-validate], #nss-main-form [required]');
    let allValid = true;

    fields.forEach(f => {
      const r = validateField(f);
      if (!r.valid) allValid = false;
    });

    return allValid;
  }

  /**
   * Aggregate all form input values into a clean data object
   */
  function getFormData() {
    const data = {};

    // Standard inputs, selects, textareas
    const fields = [
      'fullName', 'dob', 'age', 'bloodGroup', 'customBloodGroup', 'religion', 'customReligion', 'aadhaar',
      'class', 'division',
      'mobile', 'whatsapp', 'email',
      'houseName', 'place', 'district', 'pin',
      'fatherName', 'motherName'
    ];

    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) data[id] = el.value.trim();
    });

    return data;
  }

  /**
   * Auto-save draft debouncer
   */
  function triggerAutoSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      if (window.StorageManager) {
        const data = getFormData();
        window.StorageManager.saveDraft(data);
      }
    }, 400);
  }

  /**
   * Restore draft from LocalStorage
   */
  function restoreDraft() {
    if (!window.StorageManager) return;
    const draft = window.StorageManager.getDraft();
    if (!draft) return;

    // Populate inputs
    Object.keys(draft).forEach(key => {
      const el = document.getElementById(key);
      if (el && draft[key] !== undefined && draft[key] !== null) {
        el.value = draft[key];
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Populate District
    if (draft.district) {
      const districtEl = document.getElementById('district');
      if (districtEl) {
        districtEl.value = draft.district;
      }
    }

    window.StorageManager.showToast('Draft Restored — Continue where you left off', 'info', 4000);
  }

  return {
    init,
    validateField,
    validateAll,
    getFormData
  };
})();

// Bootstrap app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  AppController.init();
});

if (typeof window !== 'undefined') {
  window.AppController = AppController;
}
