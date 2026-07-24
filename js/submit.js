/**
 * Submission Engine, Google Forms API Integration, Canvas Confetti & Summary Generator
 */

const SubmitEngine = (() => {
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSftpfMlvc2WZMsf4HfMzY7QBDWG0GlHHt03138JupTBDHf9_g/formResponse';

  const entryMapping = {
    fullName: 'entry.1755851047',
    dob: 'entry.809208091',
    classDivision: 'entry.682591191',
    houseName: 'entry.365868519',
    aadhaar: 'entry.1146880959',
    fatherName: 'entry.1138625124',
    motherName: 'entry.77290248',
    bloodGroup: 'entry.1051116503',
    religion: 'entry.1636673135',
    place: 'entry.1996158432',
    district: 'entry.1230899810',
    pin: 'entry.1654456109',
    mobile: 'entry.1214021817',
    whatsapp: 'entry.1984168505',
    email: 'entry.218111412'
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
        title: 'Personal Details',
        items: [
          { label: 'Full Name', value: data.fullName },
          { label: 'Date of Birth', value: data.dob ? data.dob.split('-').reverse().join('/') : '' },
          { label: 'Calculated Age', value: data.age ? `${data.age} Years` : 'N/A' },
          { label: 'Blood Group', value: data.bloodGroup === 'Other' ? `Other (${data.customBloodGroup || ''})` : data.bloodGroup },
          { label: 'Religion', value: data.religion === 'others' ? `Other (${data.customReligion || ''})` : data.religion },
          { label: 'Aadhaar Number', value: data.aadhaar ? window.Verhoeff.format(data.aadhaar) : '' }
        ]
      },
      {
        step: 2,
        title: 'Academic Details',
        items: [
          { label: 'Class', value: data.class },
          { label: 'Division', value: data.division }
        ]
      },
      {
        step: 3,
        title: 'Contact Details',
        items: [
          { label: 'Mobile Number', value: data.mobile },
          { label: 'WhatsApp Number', value: data.whatsapp },
          { label: 'Email Address', value: data.email }
        ]
      },
      {
        step: 4,
        title: 'Address Details',
        items: [
          { label: 'House Name', value: data.houseName },
          { label: 'Place', value: data.place },
          { label: 'District', value: data.district },
          { label: 'PIN Code', value: data.pin }
        ]
      },
      {
        step: 5,
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
        if (window.WizardEngine) {
          window.WizardEngine.goToStep(stepNum);
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
      submitBtn.innerHTML = `
        <span class="spinner"></span>
        <span>Submitting to NSS Portal...</span>
      `;
    }

    // Build URLSearchParams for Google Form
    const formData = new URLSearchParams();

    // Map each field to its Google Form entry ID
    for (const [key, entryId] of Object.entries(entryMapping)) {
      let val = data[key] || '';
      if (key === 'classDivision') {
        val = `${data.class || ''} ${data.division || ''}`.trim();
      }
      if (key === 'religion' && val === 'others') {
        val = data.customReligion || 'others';
      }
      if (key === 'bloodGroup' && val === 'Other') {
        val = data.customBloodGroup || 'Other';
      }
      if (key === 'aadhaar') {
        val = window.Verhoeff ? window.Verhoeff.unformat(val) : val;
      }
      if (key === 'dob' && val) {
        val = val.split('-').reverse().join('/');
      }
      formData.append(entryId, val);
    }

    try {
      // Send fetch POST with no-cors as Google Forms blocks cross-origin reading
      await fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      // Show Success Screen
      setTimeout(() => {
        if (window.StorageManager) {
          window.StorageManager.clearDraft();
        }
        showSuccessModal(data);
      }, 800);

    } catch (err) {
      console.error('Submission error:', err);
      // Even if fetch fails or network drops, show graceful notification
      if (window.StorageManager) {
        window.StorageManager.showToast('Network issue during submission. Your draft is preserved.', 'warning');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Submit Application</span>`;
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
    document.getElementById('success-student-name').textContent = data.fullName || 'Student';
    document.getElementById('success-class-info').textContent = `${data.class || ''} - Div ${data.division || ''}`;
    document.getElementById('success-ref-id').textContent = 'NSS-' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('success-timestamp').textContent = new Date().toLocaleDateString('en-IN', {
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
        window.location.reload();
      };
    }

    if (homeBtn) {
      homeBtn.onclick = () => {
        modal.classList.add('hidden');
        window.location.reload();
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
