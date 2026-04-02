/* MostPomocy – Mapa Pomocy | app.js
   Minimal progressive enhancement – no frameworks
   -------------------------------------------------- */

(function () {
  'use strict';

  /* ── Mobile navigation toggle ─────────────────────── */
  var toggle = document.querySelector('.nav-toggle');
  var nav    = document.querySelector('.site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });

    /* Close when a nav link is clicked (mobile) */
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Mark current page link ───────────────────────── */
  var currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.site-nav a').forEach(function (link) {
    var href = link.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === currentPath || (href !== '' && currentPath.startsWith(href))) {
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ── Formspree AJAX (contact form) ───────────────── */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          status.textContent = 'Wiadomość wysłana. Dziękujemy!';
          status.className = 'info-box info-box--success mt-md';
          status.removeAttribute('hidden');
          form.reset();
        } else {
          return response.json().then(function (json) { throw json; });
        }
      }).catch(function () {
        status.textContent = 'Wystąpił błąd. Spróbuj ponownie lub napisz bezpośrednio na adres e-mail.';
        status.className = 'info-box info-box--warning mt-md';
        status.removeAttribute('hidden');
      });
    });
  }
})();
