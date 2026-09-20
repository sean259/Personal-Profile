/* Loading screen */

const MIN_LOAD_TIME = 2800; // ms
const startTime = Date.now();
const gaugeProgress = document.getElementById('gaugeProgress');
const gaugeNeedle = document.getElementById('gaugeNeedle');
const gaugePercent = document.getElementById('gaugePercent');
const loaderText = document.getElementById('loaderText');
const loaderWelcome = document.getElementById('loaderWelcome');

const GAUGE_ARC_LENGTH = 226.19; // matches the 270-degree track's visible arc length
const REDLINE_THRESHOLD = 0.85;

function animateGauge(duration) {
  const gaugeStart = performance.now();
  function frame(now) {
    const elapsed = now - gaugeStart;
    const progress = Math.min(elapsed / duration, 1);

    if (gaugeProgress) {
      gaugeProgress.style.strokeDashoffset = String(GAUGE_ARC_LENGTH * (1 - progress));
      gaugeProgress.classList.toggle('redline', progress >= REDLINE_THRESHOLD);
    }
    if (gaugeNeedle) {
      const angle = progress * 270 - 135;
      gaugeNeedle.style.transform = `rotate(${angle}deg)`;
      gaugeNeedle.classList.toggle('redline', progress >= REDLINE_THRESHOLD);
    }
    if (gaugePercent) {
      gaugePercent.textContent = String(Math.round(progress * 100));
    }
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

animateGauge(MIN_LOAD_TIME - 300);

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

/* Mobile nav */

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function setNav(open) {
  if (!navToggle || !navLinks) return;
  navToggle.classList.toggle('open', open);
  navLinks.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    setNav(!navLinks.classList.contains('open'));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNav(false));
  });
}

/* About panel: hover opens it via CSS; the button covers touch and keyboard */

const aboutTrigger = document.getElementById('aboutTrigger');
const aboutReveal = document.getElementById('aboutReveal');

if (aboutTrigger && aboutReveal) {
  aboutTrigger.addEventListener('click', () => {
    const open = aboutReveal.classList.toggle('open');
    aboutTrigger.setAttribute('aria-expanded', String(open));
  });
}

/* Project modals */

const projectButtons = document.querySelectorAll('[data-modal]');
const modals = document.querySelectorAll('.modal-backdrop');
let lastFocused = null;

function anyModalOpen() {
  return Array.from(modals).some((modal) => modal.classList.contains('open'));
}

function openModal(modal) {
  lastFocused = document.activeElement;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const panel = modal.querySelector('.modal-panel');
  if (panel) panel.focus();
}

function closeModal(modal) {
  if (!modal.classList.contains('open')) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
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
  if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
});

/* Project covers: a missing image falls back to the car outline placeholder */

document.querySelectorAll('.project-img').forEach((img) => {
  const markEmpty = () => {
    const media = img.closest('.project-media');
    if (media) media.classList.add('is-empty');
  };

  img.addEventListener('error', markEmpty);
  if (img.complete && img.naturalWidth === 0) markEmpty();
});

/* Scroll reveal */

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
  revealTargets.forEach((target) => target.classList.add('in-view'));
}

/* Gear selector: N is home, 1-6 are the sections in page order */

const sections = Array.from(document.querySelectorAll('.hero-stage[id], .section-row[id]'));
const sectionNames = {
  home: 'Home',
  about: 'About',
  'tech-stack': 'Skills',
  projects: 'Projects',
  hobbies: 'Hobbies',
  education: 'Education',
  contact: 'Contact'
};

const gearGate = document.getElementById('gearGate');
const gearKnob = document.getElementById('gearKnob');
const gearReadout = document.getElementById('gearReadout');
const gearButtons = document.querySelectorAll('.gear');
const topLinks = document.querySelectorAll('.nav-links a');

let currentIndex = 0;
let navLockUntil = 0; // ignore the observer while a gear-triggered scroll is running

function labelFor(index) {
  const section = sections[index];
  return section ? (sectionNames[section.id] || section.id) : '';
}

function gearLabel(index) {
  return index === 0 ? 'N' : String(index);
}

function updateNav() {
  if (gearGate && gearKnob) {
    gearGate.style.setProperty('--gear-i', String(currentIndex));
    gearKnob.textContent = gearLabel(currentIndex);
  }
  if (gearReadout) gearReadout.textContent = labelFor(currentIndex);

  gearButtons.forEach((button) => {
    const index = Number(button.dataset.index);
    button.classList.toggle('passed', index < currentIndex);
    if (index === currentIndex) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  });

  const id = sections[currentIndex] ? sections[currentIndex].id : '';
  topLinks.forEach((link) => {
    link.classList.toggle('current', link.getAttribute('href') === `#${id}`);
  });
}

function goToSection(index) {
  if (index < 0 || index >= sections.length) return;
  currentIndex = index;
  navLockUntil = Date.now() + 1100;
  sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  updateNav();
}

gearButtons.forEach((button) => {
  button.addEventListener('click', () => goToSection(Number(button.dataset.index)));
});

// releases the lock as soon as the smooth scroll lands, where supported
window.addEventListener('scrollend', () => { navLockUntil = 0; });

if ('IntersectionObserver' in window && sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      if (Date.now() < navLockUntil) return;

      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        const index = sections.indexOf(visible.target);
        if (index !== -1 && index !== currentIndex) {
          currentIndex = index;
          updateNav();
        }
      }
    },
    { threshold: [0.3, 0.55], rootMargin: '-68px 0px 0px 0px' }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

updateNav();

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    modals.forEach((modal) => closeModal(modal));
    setNav(false);
    return;
  }

  if (anyModalOpen()) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const tag = document.activeElement ? document.activeElement.tagName : '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    goToSection(currentIndex + 1);
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    goToSection(currentIndex - 1);
  } else if (/^[0-6]$/.test(event.key)) {
    goToSection(Number(event.key));
  }
});