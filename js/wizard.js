/**
 * Multi-Step Wizard Engine with Smooth Horizontal Slide Animations
 */

const WizardEngine = (() => {
  let currentStep = 1;
  const totalSteps = 6;

  const stepTitles = [
    'Personal Details',
    'Academic Details',
    'Contact Details',
    'Address Details',
    'Family Details',
    'Review Enrolment Data'
  ];

  /**
   * Initializes Wizard Controls
   */
  function initWizard() {
    setupButtons();
    setupStepPills();
    setupKeyboardNav();
    updateWizardUI();
  }

  function setupButtons() {
    const prevBtn = document.getElementById('wizard-prev-btn');
    const nextBtn = document.getElementById('wizard-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
          goToStep(currentStep - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
          if (validateCurrentStep()) {
            goToStep(currentStep + 1);
          }
        }
      });
    }
  }

  function setupStepPills() {
    const pills = document.querySelectorAll('.step-pill');
    pills.forEach((pill, idx) => {
      pill.addEventListener('click', () => {
        const targetStep = idx + 1;
        if (targetStep < currentStep) {
          // Allow going backwards anytime
          goToStep(targetStep);
        } else if (targetStep > currentStep) {
          // Going forward requires current step to be valid
          if (validateCurrentStep()) {
            goToStep(targetStep);
          }
        }
      });
    });
  }

  function setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger when user is typing inside textareas
      if (e.target.tagName === 'TEXTAREA') return;

      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentStep < totalSteps && validateCurrentStep()) {
          goToStep(currentStep + 1);
        }
      } else if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentStep > 1) {
          goToStep(currentStep - 1);
        }
      } else if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'submit') {
        // Prevent default submit on enter, validate and focus next if applicable
        e.preventDefault();
        const activeFormStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (activeFormStep) {
          const inputs = Array.from(activeFormStep.querySelectorAll('input, select'));
          const idx = inputs.indexOf(e.target);
          if (idx >= 0 && idx < inputs.length - 1) {
            inputs[idx + 1].focus();
          } else {
            if (currentStep < totalSteps && validateCurrentStep()) {
              goToStep(currentStep + 1);
            }
          }
        }
      }
    });
  }

  function goToStep(stepNum) {
    if (stepNum < 1 || stepNum > totalSteps) return;

    const currentSection = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const targetSection = document.querySelector(`.form-step[data-step="${stepNum}"]`);

    if (currentSection && targetSection && currentStep !== stepNum) {
      // Set slide direction classes
      if (stepNum > currentStep) {
        currentSection.classList.remove('active', 'slide-in-left', 'slide-in-right');
        currentSection.classList.add('slide-out-left');

        targetSection.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left');
        targetSection.classList.add('active', 'slide-in-right');
      } else {
        currentSection.classList.remove('active', 'slide-in-left', 'slide-in-right');
        currentSection.classList.add('slide-out-right');

        targetSection.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-right');
        targetSection.classList.add('active', 'slide-in-left');
      }

      currentStep = stepNum;
      updateWizardUI();

      // If stepping into Review (Step 6), populate review data
      if (currentStep === 6 && window.SubmitEngine) {
        window.SubmitEngine.renderReviewSummary();
      }

      // Scroll top of wizard container into view smoothly
      const wizardTop = document.getElementById('wizard-header');
      if (wizardTop) {
        wizardTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function updateWizardUI() {
    // Update step text
    const titleEl = document.getElementById('wizard-step-title');
    const badgeEl = document.getElementById('wizard-step-badge');
    const progressFill = document.getElementById('wizard-progress-fill');

    if (titleEl) titleEl.textContent = stepTitles[currentStep - 1];
    if (badgeEl) badgeEl.textContent = `Step ${currentStep} of ${totalSteps}`;

    if (progressFill) {
      const pct = ((currentStep) / totalSteps) * 100;
      progressFill.style.width = `${pct}%`;
    }

    // Update Pills
    const pills = document.querySelectorAll('.step-pill');
    pills.forEach((pill, idx) => {
      const stepVal = idx + 1;
      pill.classList.remove('active', 'completed');
      if (stepVal === currentStep) {
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
      } else if (stepVal < currentStep) {
        pill.classList.add('completed');
        pill.setAttribute('aria-selected', 'false');
      } else {
        pill.setAttribute('aria-selected', 'false');
      }
    });

    // Prev / Next button states
    const prevBtn = document.getElementById('wizard-prev-btn');
    const nextBtn = document.getElementById('wizard-next-btn');

    if (prevBtn) {
      prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    }

    if (nextBtn) {
      if (currentStep === totalSteps) {
        nextBtn.classList.add('hidden-btn');
      } else {
        nextBtn.classList.remove('hidden-btn');
        nextBtn.innerHTML = `<span>Next Step</span> <svg viewBox="0 0 24 24" class="btn-icon"><path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>`;
      }
    }
  }

  function validateCurrentStep() {
    const activeStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (!activeStepEl) return true;

    const fieldsToValidate = activeStepEl.querySelectorAll('[data-validate]');
    let isValid = true;
    let firstErrorEl = null;

    fieldsToValidate.forEach((field) => {
      if (window.AppController && window.AppController.validateField) {
        const result = window.AppController.validateField(field);
        if (!result.valid) {
          isValid = false;
          if (!firstErrorEl) firstErrorEl = field;
        }
      }
    });

    if (!isValid) {
      if (window.StorageManager) {
        window.StorageManager.showToast('Please fix highlighted errors before proceeding.', 'warning');
      }
      if (firstErrorEl) {
        firstErrorEl.focus();
        firstErrorEl.classList.add('shake-error');
        setTimeout(() => firstErrorEl.classList.remove('shake-error'), 500);
      }
      return false;
    }

    return true;
  }

  function getCurrentStep() {
    return currentStep;
  }

  return {
    initWizard,
    goToStep,
    validateCurrentStep,
    getCurrentStep,
    stepTitles
  };
})();

if (typeof window !== 'undefined') {
  window.WizardEngine = WizardEngine;
}
