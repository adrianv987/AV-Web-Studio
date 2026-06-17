/**
 * AV Web Studio — script.js
 *
 * Vanilla JS for:
 *   1. Sticky navbar (adds .scrolled class on scroll)
 *   2. Mobile menu toggle
 *   3. Smooth scroll for anchor links
 *   4. Active nav link highlighting
 *   5. Scroll reveal animations via IntersectionObserver
 *   6. Subtle parallax tilt on portfolio cards (desktop only)
 *   7. Process step hover glow
 *   8. Auto-update copyright year
 */

'use strict';

/* ----------------------------------------------------------------
   1. Sticky Navbar
   Adds .scrolled class once user scrolls past 60px.
   CSS uses this to apply backdrop-blur and border.
---------------------------------------------------------------- */
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

handleNavbarScroll();
window.addEventListener('scroll', handleNavbarScroll, { passive: true });


/* ----------------------------------------------------------------
   2. Mobile Menu Toggle
---------------------------------------------------------------- */
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

function openMenu() {
  navToggle.classList.add('open');
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Close menu');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  navToggle.classList.remove('open');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';
}

navToggle.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
});


/* ----------------------------------------------------------------
   3. Smooth Scroll for Anchor Links
   Accounts for the fixed navbar height.
---------------------------------------------------------------- */
const NAV_HEIGHT = 80;

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offsetTop = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  });
});


/* ----------------------------------------------------------------
   4. Active Nav Link Highlighting
---------------------------------------------------------------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

function setActiveNavLink() {
  let currentId = '';
  const scrollPos = window.scrollY + NAV_HEIGHT + 80;

  sections.forEach(section => {
    if (scrollPos >= section.offsetTop) {
      currentId = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').replace('#', '') === currentId) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', setActiveNavLink, { passive: true });
setActiveNavLink();


/* ----------------------------------------------------------------
   5. Scroll Reveal Animations
   IntersectionObserver adds .is-visible to animate elements in.
---------------------------------------------------------------- */
const revealEls = document.querySelectorAll(
  '.reveal-up, .reveal-left, .reveal-right, .reveal-fade'
);

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  revealEls.forEach(el => revealObserver.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}


/* ----------------------------------------------------------------
   6. Subtle Card Tilt on Hover (fine pointer / desktop only)
---------------------------------------------------------------- */
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.portfolio-card, .testimonial-card, .service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const tiltX = (((e.clientY - rect.top)  / rect.height) - 0.5) * -6;
      const tiltY = (((e.clientX - rect.left) / rect.width)  - 0.5) *  6;
      card.style.transform  = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
      card.style.transition = 'transform 0.08s ease-out';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  });
}


/* ----------------------------------------------------------------
   7. Process Step Hover Glow
---------------------------------------------------------------- */
document.querySelectorAll('.process-step').forEach(step => {
  const num = step.querySelector('.step-num');
  step.addEventListener('mouseenter', () => {
    num.style.boxShadow = '0 0 0 6px rgba(200, 169, 110, 0.1), 0 0 20px rgba(200, 169, 110, 0.2)';
  });
  step.addEventListener('mouseleave', () => {
    num.style.boxShadow = '';
  });
});


/* ----------------------------------------------------------------
   8. Auto-update Copyright Year
---------------------------------------------------------------- */
const copyrightEl = document.querySelector('.footer-bottom p');
if (copyrightEl) {
  copyrightEl.textContent = `© ${new Date().getFullYear()} AV Web Studio. All rights reserved.`;
}

/**
 * AV Web Studio — form.js
 *
 * Self-contained contact form handler.
 * - Custom JS validation (no browser popups — form has novalidate)
 * - Inline animated error messages
 * - Live error clearing on input / blur after first error
 * - Loading / sent / error button states with spinner
 * - Success banner reveal on submit
 * - Async fetch to FormSubmit (AJAX endpoint)
 *
 * Assumes form.html markup and form-css.css are already present.
 * Load this script at the bottom of <body> or with defer.
 */

'use strict';

/* ----------------------------------------------------------------
   FormSubmit endpoint — replace EMAIL with your actual address
---------------------------------------------------------------- */
const FORM_SUBMIT_URL = 'https://formsubmit.co/ajax/avwebstudio@outlook.com';

/* ----------------------------------------------------------------
   Grab elements
---------------------------------------------------------------- */
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('cf-submit');
const btnLabel  = submitBtn ? submitBtn.querySelector('.btn-label') : null;
const successBanner = document.getElementById('cf-success');

if (!form) {
  // Form not present on this page — exit silently
  throw new Error('AV form.js: #contactForm not found.');
}


/* ================================================================
   Field config
   Each entry maps a field id to its validation rule and
   the id of the corresponding error <span>.
================================================================ */
const FIELDS = [
  {
    id:       'cf-name',
    errorId:  'cf-name-error',
    label:    'Name',
    validate: (v) => v.trim().length >= 2 ? null : 'Please enter your full name (at least 2 characters).',
  },
  {
    id:       'cf-email',
    errorId:  'cf-email-error',
    label:    'Email',
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Please enter a valid email address.',
  },
  {
    id:       'cf-mobile',
    errorId:  'cf-mobile-error',
    label:    'Mobile',
    validate: (v) => {
      const digits = v.replace(/\D/g, '');
      return (digits.length >= 10 && digits.length <= 11)
        ? null
        : 'Please enter a valid Australian mobile number (10–11 digits).';
    },
  },
  {
    id:       'cf-service',
    errorId:  'cf-service-error',
    label:    'Service',
    validate: (v) => v !== '' ? null : 'Please select a service.',
  },
  {
    id:       'cf-message',
    errorId:  'cf-message-error',
    label:    'Message',
    validate: (v) => v.trim().length >= 10 ? null : 'Please tell me a little about your project (at least 10 characters).',
  },
];


/* ================================================================
   Error helpers
================================================================ */

/**
 * Show an inline error for a field.
 * Marks the input invalid; animates the error span in.
 */
function showError(fieldConfig, message) {
  const el    = document.getElementById(fieldConfig.id);
  const errEl = document.getElementById(fieldConfig.errorId);
  if (!el || !errEl) return;

  el.classList.add('field-invalid');
  el.classList.remove('field-valid');
  el.setAttribute('aria-invalid', 'true');
  el.setAttribute('aria-describedby', fieldConfig.errorId);

  errEl.textContent = message;
  errEl.classList.add('is-visible');
}

/**
 * Clear the inline error for a field.
 */
function clearError(fieldConfig) {
  const el    = document.getElementById(fieldConfig.id);
  const errEl = document.getElementById(fieldConfig.errorId);
  if (!el || !errEl) return;

  el.classList.remove('field-invalid');
  el.classList.add('field-valid');
  el.removeAttribute('aria-invalid');
  el.removeAttribute('aria-describedby');

  errEl.textContent = '';
  errEl.classList.remove('is-visible');
}

/**
 * Validate a single field.
 * Returns the error string or null if valid.
 */
function validateField(fieldConfig) {
  const el = document.getElementById(fieldConfig.id);
  if (!el) return null;
  const error = fieldConfig.validate(el.value);
  if (error) {
    showError(fieldConfig, error);
  } else {
    clearError(fieldConfig);
  }
  return error;
}


/* ================================================================
   Live validation listeners
   Attached after first submission attempt so the form
   doesn't shout at the user before they've typed anything.
================================================================ */
let liveListenersAttached = false;

function attachLiveListeners() {
  if (liveListenersAttached) return;
  liveListenersAttached = true;

  FIELDS.forEach((fieldConfig) => {
    const el = document.getElementById(fieldConfig.id);
    if (!el) return;

    // Clear on input (while user is typing / selecting)
    el.addEventListener('input', () => {
      // Only clear if it's currently in error state
      if (el.classList.contains('field-invalid')) {
        validateField(fieldConfig);
      }
    });

    // Validate on blur (when user leaves the field)
    el.addEventListener('blur', () => {
      if (el.classList.contains('field-invalid') || el.value !== '') {
        validateField(fieldConfig);
      }
    });
  });
}


/* ================================================================
   Button state helpers
================================================================ */

function setLoading() {
  submitBtn.classList.add('is-loading');
  submitBtn.disabled = true;
}

function setSent() {
  submitBtn.classList.remove('is-loading');
  submitBtn.classList.add('is-sent');
  if (btnLabel) {
    btnLabel.style.fontSize = '';   // restore font size
    btnLabel.textContent = 'Sent!';
  }
}

function setServerError() {
  submitBtn.classList.remove('is-loading');
  submitBtn.classList.add('is-error');
  if (btnLabel) {
    btnLabel.style.fontSize = '';
    btnLabel.textContent = 'Something went wrong — try again';
  }

  // Auto-reset after 4 seconds
  setTimeout(() => {
    submitBtn.classList.remove('is-error');
    submitBtn.disabled = false;
    if (btnLabel) btnLabel.textContent = 'Send Enquiry';
  }, 4000);
}

function resetButton() {
  submitBtn.classList.remove('is-loading', 'is-sent', 'is-error');
  submitBtn.disabled = false;
  if (btnLabel) {
    btnLabel.style.fontSize = '';
    btnLabel.textContent = 'Send Enquiry';
  }
}


/* ================================================================
   Scroll + focus first invalid field
================================================================ */
function focusFirstError() {
  const firstInvalid = form.querySelector('.field-invalid');
  if (!firstInvalid) return;

  const offset = 100; // account for fixed nav height
  const top = firstInvalid.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });

  // Slight delay so scroll completes before focus
  setTimeout(() => firstInvalid.focus(), 350);
}


/* ================================================================
   Form submit handler
================================================================ */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // --- Validate all fields ---
  attachLiveListeners();

  const errors = FIELDS.map((fieldConfig) => validateField(fieldConfig)).filter(Boolean);

  if (errors.length > 0) {
    focusFirstError();
    return;
  }

  // --- All valid — start loading ---
  setLoading();

  const formData = new FormData(form);

  try {
    const response = await fetch(FORM_SUBMIT_URL, {
      method: 'POST',
      body:   formData,
      // Don't set Content-Type — browser sets it with boundary for FormData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    // FormSubmit returns { success: "true" } on success
    if (result.success === 'true' || result.success === true) {
      setSent();
      form.reset();

      // Clear any lingering valid/invalid classes
      FIELDS.forEach((fc) => {
        const el = document.getElementById(fc.id);
        if (el) {
          el.classList.remove('field-valid', 'field-invalid');
          el.removeAttribute('aria-invalid');
        }
      });

      // Show success banner
      if (successBanner) {
        successBanner.removeAttribute('hidden');
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      throw new Error('FormSubmit returned success: false');
    }

  } catch (err) {
    console.error('AV Web Studio contact form error:', err);
    setServerError();
  }
});