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
