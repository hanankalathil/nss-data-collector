/**
 * Submission Engine, Google Forms API Integration, Canvas Confetti & Summary Generator
 */

const SubmitEngine = (() => {
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfy2NiGpQ50D3aQoM0gNidX_JaD6f2m2AGHgcJlV5HMcgDdCw/formResponse';

  const entryMapping = {
    fullName: 'entry.25191227',
    dob: 'entry.986506903',
    classDivision: 'entry.1782338167',
    houseName: 'entry.1814808793',
    aadhaar: 'entry.1885108592',
    fatherName: 'entry.1267336884',
    motherName: 'entry.155583555',
    bloodGroup: 'entry.244503853',
    religion: 'entry.149326405',
    place: 'entry.1167135396',
    district: 'entry.1749947510',
    pin: 'entry.919847019',
    mobile: 'entry.484960338',
    whatsapp: 'entry.375984256',
    email: 'entry.1690771946'
  };

  /**
   * Render Review Summary Card on Step 7
   */
  function renderReviewSummary() {
    const container = document.getElementById('review-summary-container');
    if (!container) return;

    const data = window.AppController ? window.AppController.getFormData() : {};

    const sections = [
      {
        step: 1,
        title: 'Personal & Academic Details',
        items: [
          { label: 'Full Name', value: data.fullName },
          { label: 'Date of Birth', value: data.dob ? data.dob.split('-').reverse().join('/') : '' },
          { label: 'Calculated Age', value: data.age ? `${data.age} Years` : 'N/A' },
          { label: 'Blood Group', value: data.bloodGroup === 'Other' ? `Other (${data.customBloodGroup || ''})` : data.bloodGroup },
          { label: 'Religion', value: data.religion === 'others' ? `Other (${data.customReligion || ''})` : data.religion },
          { label: 'Aadhaar Number', value: data.aadhaar ? window.Verhoeff.format(data.aadhaar) : '' },
          { label: 'Class', value: data.class }
        ]
      },
      {
        step: 2,
        title: 'Contact Details',
        items: [
          { label: 'Mobile Number', value: data.mobile },
          { label: 'WhatsApp Number', value: data.whatsapp },
          { label: 'Email Address', value: data.email }
        ]
      },
      {
        step: 3,
        title: 'Address Details',
        items: [
          { label: 'House Name', value: data.houseName },
          { label: 'Place', value: data.place },
          { label: 'District', value: data.district },
          { label: 'PIN Code', value: data.pin }
        ]
      },
      {
        step: 4,
        title: 'Family Details',
        items: [
          { label: 'Father Name', value: data.fatherName },
          { label: 'Mother Name', value: data.motherName }
        ]
      }
    ];

    container.innerHTML = sections.map(sec => `
      <div class="review-section-card glass-card">
        <div class="review-header">
          <h4 class="review-title">
            <span class="review-step-tag">Step ${sec.step}</span>
            ${sec.title}
          </h4>
          <button type="button" class="btn-text edit-step-btn" data-target-step="${sec.step}">
            ✏️ Edit
          </button>
        </div>
        <div class="review-grid">
          ${sec.items.map(item => `
            <div class="review-item">
              <span class="review-label">${item.label}</span>
              <span class="review-val">${item.value || '<span class="text-muted">Not specified</span>'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Attach edit button listeners
    container.querySelectorAll('.edit-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stepNum = parseInt(btn.dataset.targetStep, 10);
        const pages = ['index.html', 'contact.html', 'address.html', 'family.html', 'review.html'];
        if (stepNum >= 1 && stepNum <= pages.length) {
          window.location.href = pages[stepNum - 1];
        }
      });
    });
  }

  /**
   * Submit to Google Form
   */
  async function handleSubmit(e) {
    if (e) e.preventDefault();

    const submitBtn = document.getElementById('final-submit-btn');
    if (!window.AppController || !window.AppController.getFormData) return;

    const data = window.AppController.getFormData();

    // Final full validation check
    const isAllValid = window.AppController.validateAll();
    if (!isAllValid) {
      if (window.StorageManager) {
        window.StorageManager.showToast('Please fix invalid fields before submitting.', 'warning');
      }
      return;
    }

    // Set Loading State
    if (submitBtn) {
      submitBtn.disabled = true;
    }
    const loadingModal = document.getElementById('loading-modal');
    if (loadingModal) {
      loadingModal.classList.remove('hidden');
      loadingModal.classList.add('animate-fade-in');
      document.body.classList.add('no-scroll');
    }

    // Build form inputs dynamically
    const hiddenForm = document.getElementById('hidden-gform');
    const iframe = document.getElementById('hiddenConfirm');
    
    if (!hiddenForm || !iframe) {
      console.error('Hidden form or iframe not found!');
      return;
    }

    hiddenForm.action = GOOGLE_FORM_URL;
    hiddenForm.innerHTML = ''; // Clear previous inputs

    // Map each field to its Google Form entry ID
    for (const [key, entryId] of Object.entries(entryMapping)) {
      let val = data[key] || '';
      
      // Formatting fields to exactly match Google Forms expectations

      if (key === 'classDivision') {
        val = data.class || '';
      }
      
      if (key === 'dob' && val) {
        // Google Forms POST expects Date fields to be split into year, month, and day
        const parts = val.split('-'); // Expected format: YYYY-MM-DD
        if (parts.length === 3) {
          const yearInput = document.createElement('input');
          yearInput.type = 'hidden';
          yearInput.name = entryId + '_year';
          yearInput.value = parts[0];
          hiddenForm.appendChild(yearInput);

          const monthInput = document.createElement('input');
          monthInput.type = 'hidden';
          monthInput.name = entryId + '_month';
          monthInput.value = parts[1];
          hiddenForm.appendChild(monthInput);

          const dayInput = document.createElement('input');
          dayInput.type = 'hidden';
          dayInput.name = entryId + '_day';
          dayInput.value = parts[2];
          hiddenForm.appendChild(dayInput);
        }
        continue; // Skip the default single input creation for dob
      }

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = entryId;
      input.value = val;
      hiddenForm.appendChild(input);
    }

    try {
      let submitted = false;
      iframe.onload = function() {
        if (submitted) {
          submitted = false; // Prevent double execution
          // Iframe has loaded the response
          setTimeout(() => {
            const loadingModal = document.getElementById('loading-modal');
            if (loadingModal) {
              loadingModal.classList.add('hidden');
              loadingModal.classList.remove('animate-fade-in');
            }
            if (window.StorageManager) {
              window.StorageManager.clearDraft();
            }
            showSuccessModal(data);
          }, 800);
        }
      };

      // Submit the form
      submitted = true;
      hiddenForm.submit();

      // Fallback timeout in case iframe onload is blocked by browser security policies
      setTimeout(() => {
        if (submitted) {
          console.warn('Iframe onload fallback triggered.');
          iframe.onload();
        }
      }, 3500);

    } catch (err) {
      console.error('Submission error:', err);
      const loadingModal = document.getElementById('loading-modal');
      if (loadingModal) {
        loadingModal.classList.add('hidden');
        loadingModal.classList.remove('animate-fade-in');
        document.body.classList.remove('no-scroll');
      }
      if (window.StorageManager) {
        window.StorageManager.showToast('Submission error. Please check your data.', 'warning');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
      }
    }
  }

  /**
   * Display Animated Success Screen with Confetti
   */
  function showSuccessModal(data) {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    // Fill Summary Badge Info
    const nameEl = document.getElementById('success-student-name');
    if (nameEl) nameEl.textContent = data.fullName || 'Student';

    const classEl = document.getElementById('success-class-info');
    if (classEl) classEl.textContent = `${data.class || ''}`;

    const refEl = document.getElementById('success-ref-id');
    if (refEl) refEl.textContent = 'NSS-' + Math.floor(100000 + Math.random() * 900000);

    const timeEl = document.getElementById('success-timestamp');
    if (timeEl) timeEl.textContent = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    modal.classList.remove('hidden');
    modal.classList.add('animate-fade-in');
    document.body.classList.add('no-scroll');

    // Trigger Canvas Confetti
    launchConfetti();

    // Attach actions
    const newEntryBtn = document.getElementById('success-new-entry-btn');
    const printPdfBtn = document.getElementById('success-pdf-btn');
    const homeBtn = document.getElementById('success-home-btn');

    if (newEntryBtn) {
      newEntryBtn.onclick = () => {
        modal.classList.add('hidden');
        window.location.href = 'index.html';
      };
    }

    if (homeBtn) {
      homeBtn.onclick = () => {
        modal.classList.add('hidden');
        window.location.href = 'index.html';
      };
    }

    if (printPdfBtn) {
      printPdfBtn.onclick = () => {
        window.print();
      };
    }
  }

  /**
   * Pure Handcrafted Canvas Particle Confetti Animation
   */
  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const numberOfPieces = 150;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    for (let i = 0; i < numberOfPieces; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 4 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      });
    }

    let animationFrame;
    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pieces.forEach(p => {
        p.y += p.speed;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animationFrame = requestAnimationFrame(update);
    }

    update();

    // Stop after 6 seconds to optimize CPU
    setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 6000);
  }

  return {
    renderReviewSummary,
    handleSubmit,
    showSuccessModal,
    launchConfetti
  };
})();

if (typeof window !== 'undefined') {
  window.SubmitEngine = SubmitEngine;
}
