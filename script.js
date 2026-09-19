// ----- Loading screen (ignition sequence) -----
// Cycles the status text through an ignition sequence, fills the rev
// bar, reveals a "Welcome, Sean" dashboard readout near the end, then
// removes the "loading" class once the page has loaded AND a minimum
// time has passed (so it doesn't just flash on fast connections).

const MIN_LOAD_TIME = 2800; // milliseconds
const startTime = Date.now();
const loaderFill = document.getElementById('loaderFill');
const loaderText = document.getElementById('loaderText');
const loaderWelcome = document.getElementById('loaderWelcome');

if (loaderFill) {
  requestAnimationFrame(() => {
    loaderFill.style.width = '100%';
  });
}

if (loaderText) {
  setTimeout(() => {
    loaderText.textContent = 'Systems online';
  }, 1100);
}

if (loaderWelcome) {
  setTimeout(() => {
    loaderWelcome.classList.add('show');
  }, MIN_LOAD_TIME - 900);
}

function hideLoader() {
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(MIN_LOAD_TIME - elapsed, 0);
  setTimeout(() => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  }, remaining);
}

if (document.readyState === 'complete') {
  hideLoader();
} else {
  window.addEventListener('load', hideLoader);
}

// ----- Project modals -----
// Each button with [data-modal] opens the matching #id modal-backdrop.
// Modals close on the close button, backdrop click, or Escape key.

const projectButtons = document.querySelectorAll('[data-modal]');
const modals = document.querySelectorAll('.modal-backdrop');

function openModal(modal) {
  modal.classList.add('open');
  const panel = modal.querySelector('.modal-panel');
  if (panel) panel.focus();
}

function closeModal(modal) {
  modal.classList.remove('open');
}

projectButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const modal = document.getElementById(button.dataset.modal);
    if (modal) openModal(modal);
  });
});

modals.forEach((modal) => {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal(modal);
  });

  const closeBtn = modal.querySelector('[data-close]');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeModal(modal));
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    modals.forEach((modal) => closeModal(modal));
  }
});

// ----- Scroll reveal -----
// Each .reveal section fades and slides in from the left the first
// time it enters the viewport, then stops being observed (a single
// entrance, not a repeating effect).

const revealTargets = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealTargets.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  // No IntersectionObserver support: just show everything.
  revealTargets.forEach((target) => target.classList.add('in-view'));
}

// ----- Typewriter effect -----
// The .about-lead sentence types itself out character by character the
// first time it scrolls into view, with a blinking cursor while typing.

const typewriterEl = document.querySelector('.typewriter');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function typeText(el, speed) {
  const fullText = el.textContent;
  el.textContent = '';
  el.classList.add('typing');

  let i = 0;
  function step() {
    if (i <= fullText.length) {
      el.textContent = fullText.slice(0, i);
      i++;
      setTimeout(step, speed);
    } else {
      el.classList.remove('typing');
    }
  }
  step();
}

if (typewriterEl) {
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // Skip the animation, just show the full text.
    typewriterEl.classList.remove('typewriter');
  } else {
    const typeObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            typeText(entry.target, 28);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    typeObserver.observe(typewriterEl);
  }
}

// ----- Tech stack scroll parallax -----
// Each column loops vertically on its own (CSS animation on the inner
// track). On top of that, this nudges the outer column further up or
// down as the page scrolls, alternating direction per column, so the
// stack visibly responds to scrolling instead of just looping in place.

const techCols = document.querySelectorAll('.tech-col');

if (techCols.length) {
  let ticking = false;

  function updateTechParallax() {
    const scrollY = window.scrollY || window.pageYOffset;
    techCols.forEach((col, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      const offset = (scrollY * 0.04 * direction) % 40;
      col.style.transform = `translateY(${offset}px)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateTechParallax);
      ticking = true;
    }
  });

  updateTechParallax();
}