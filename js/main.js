/**
 * ANDES CONSTRUCTORA — main.js
 * Funcionalidades: Navbar scroll, contadores animados, barras de progreso,
 * reveal on scroll, formulario multi-campo con validación y estado de envío.
 */

'use strict';

/* ============================================================
   NAVBAR — efecto scroll
   ============================================================ */
const mainNav = document.getElementById('main-nav');

function handleNavScroll() {
  if (window.scrollY > 60) {
    mainNav.classList.add('scrolled');
  } else {
    mainNav.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });

/* ============================================================
   ACTIVE LINK — highlight según sección visible
   ============================================================ */
const navLinks = document.querySelectorAll('.navbar-nav .nav-link[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  },
  { threshold: 0.35 }
);

document.querySelectorAll('section[id]').forEach((section) => {
  sectionObserver.observe(section);
});

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setupReveal() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
}

/* ============================================================
   CONTADORES ANIMADOS — contar de 0 al valor final
   ============================================================ */
function animateCounter(el) {
  const target  = parseInt(el.getAttribute('data-target'), 10);
  const suffix  = el.getAttribute('data-suffix') || '';
  const duration = prefersReducedMotion ? 0 : 1800; // ms

  if (duration === 0) {
    el.textContent = target.toLocaleString('es-CL') + suffix;
    return;
  }

  const startTime = performance.now();
  const easingOut = (t) => 1 - Math.pow(1 - t, 4); // easeOutQuart

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easingOut(progress);
    const current  = Math.round(eased * target);

    el.textContent = current.toLocaleString('es-CL') + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toLocaleString('es-CL') + suffix;
    }
  }

  requestAnimationFrame(tick);
}

function setupCounters() {
  const counterEls  = document.querySelectorAll('[data-target]');
  const counterBars = document.querySelectorAll('.counter-bar');
  const triggered   = new Set();

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !triggered.has(entry.target)) {
          triggered.add(entry.target);

          // Animar número
          const numEl = entry.target.querySelector('[data-target]') || entry.target;
          if (numEl.hasAttribute('data-target')) {
            animateCounter(numEl);
          }

          // Animar barra correspondiente
          const bar = entry.target.querySelector('.counter-bar');
          if (bar) {
            setTimeout(() => bar.classList.add('animate'), 100);
          }

          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll('.counter-card').forEach((card) => {
    counterObserver.observe(card);
  });
}

/* ============================================================
   BARRAS DE PROGRESO — se llenan al entrar en viewport
   ============================================================ */
function setupProgressBars() {
  const progressObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fills = entry.target.querySelectorAll('.progress-fill');
          fills.forEach((fill, i) => {
            setTimeout(() => {
              fill.classList.add('animate');
            }, i * 150);
          });
          progressObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('.progress-section').forEach((section) => {
    progressObserver.observe(section);
  });
}

/* ============================================================
   VALIDACIÓN DEL FORMULARIO DE COTIZACIÓN
   ============================================================ */
const quotForm   = document.getElementById('cotizacion-form');
const formFields = {
  tipo_obra:   { el: null, errorEl: null, rule: (v) => v !== '', msg: 'Selecciona el tipo de obra.' },
  metros:      { el: null, errorEl: null, rule: (v) => v !== '' && parseInt(v) >= 1 && parseInt(v) <= 99999, msg: 'Ingresa un valor entre 1 y 99.999 m².' },
  plazo:       { el: null, errorEl: null, rule: (v) => v !== '', msg: 'Selecciona el plazo deseado.' },
  presupuesto: { el: null, errorEl: null, rule: (v) => v !== '', msg: 'Selecciona un rango de presupuesto.' },
  nombre:      { el: null, errorEl: null, rule: (v) => v.trim().length >= 3, msg: 'Ingresa tu nombre completo (mínimo 3 caracteres).' },
  telefono:    {
    el: null, errorEl: null,
    rule: (v) => /^(\+56|56)?[\s-]?(9[\s-]?\d{4}[\s-]?\d{4}|2\d{7,8})$/.test(v.trim().replace(/\s/g, '')),
    msg: 'Ingresa un teléfono válido (ej: +56 9 1234 5678).'
  },
  correo:      {
    el: null, errorEl: null,
    rule: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    msg: 'Ingresa un correo electrónico válido.'
  },
  mensaje:     { el: null, errorEl: null, rule: (v) => v.trim().length === 0 || v.trim().length >= 10, msg: 'El mensaje debe tener al menos 10 caracteres.' },
};

function initFormFields() {
  Object.keys(formFields).forEach((key) => {
    const config  = formFields[key];
    config.el     = document.getElementById(`field-${key}`);
    config.errorEl = document.getElementById(`error-${key}`);

    if (!config.el) return;

    // Validar en tiempo real al salir del campo
    config.el.addEventListener('blur', () => validateField(key));
    config.el.addEventListener('input', () => {
      if (config.el.classList.contains('is-invalid')) {
        validateField(key);
      }
    });
  });
}

function validateField(key) {
  const config = formFields[key];
  if (!config.el) return true;

  const value = config.el.value;
  const valid = config.rule(value);

  config.el.classList.toggle('is-invalid', !valid);
  config.el.classList.toggle('is-valid', valid);

  if (config.errorEl) {
    config.errorEl.textContent = valid ? '' : config.msg;
    config.errorEl.classList.toggle('visible', !valid);
  }

  // ARIA
  config.el.setAttribute('aria-invalid', valid ? 'false' : 'true');
  if (config.errorEl) {
    config.el.setAttribute('aria-describedby', valid ? '' : config.errorEl.id);
  }

  return valid;
}

function validateAll() {
  let allValid = true;
  Object.keys(formFields).forEach((key) => {
    const valid = validateField(key);
    if (!valid) allValid = false;
  });
  return allValid;
}

function simulateSend(formEl) {
  const btn = formEl.querySelector('.btn-submit');
  const spinner = formEl.querySelector('.btn-spinner');
  const btnText  = formEl.querySelector('.btn-text');

  btn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';
  if (btnText) btnText.textContent = 'Enviando…';

  setTimeout(() => {
    // Ocultar formulario y mostrar confirmación
    document.getElementById('form-fields').style.display = 'none';
    document.getElementById('form-success').style.display = 'block';

    // Scroll al mensaje de confirmación
    document.getElementById('form-success').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 1600);
}

function setupForm() {
  if (!quotForm) return;

  initFormFields();

  quotForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const valid = validateAll();

    if (!valid) {
      // Focus en el primer campo con error
      const firstInvalid = quotForm.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    simulateSend(quotForm);
  });
}

/* ============================================================
   NAVBAR — cerrar menú móvil al hacer click en enlace
   ============================================================ */
function setupMobileNav() {
  const toggler  = document.querySelector('.navbar-toggler');
  const collapse = document.getElementById('navbarCollapse');

  if (!collapse) return;

  document.querySelectorAll('#navbarCollapse .nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      const bsCollapse = window.bootstrap?.Collapse.getInstance(collapse);
      if (bsCollapse) bsCollapse.hide();
    });
  });
}

/* ============================================================
   SMOOTH SCROLL — para links internos
   ============================================================ */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = mainNav ? mainNav.offsetHeight + 8 : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });
}

/* ============================================================
   FAQ — abrir primera pregunta por defecto
   ============================================================ */
function setupFaq() {
  const firstBtn = document.querySelector('.faq-accordion .accordion-button');
  if (firstBtn && firstBtn.classList.contains('collapsed')) {
    // Dejar la primera FAQ abierta por default (ya configurado en HTML)
  }
}

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  handleNavScroll();
  setupReveal();
  setupCounters();
  setupProgressBars();
  setupForm();
  setupMobileNav();
  setupSmoothScroll();
  setupFaq();
});
