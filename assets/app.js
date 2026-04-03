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
  /* ── Accessibility Widget ──────────────────────────── */
  var A11Y_KEY      = 'mp-a11y';
  var A11Y_FONT_MAX =  4;
  var A11Y_FONT_MIN = -2;
  var a11yPrefs = { fontSize: 0, contrast: false, links: false, dyslexia: false };

  try {
    var saved = localStorage.getItem(A11Y_KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      a11yPrefs.fontSize = parseInt(parsed.fontSize, 10) || 0;
      a11yPrefs.contrast = !!parsed.contrast;
      a11yPrefs.links    = !!parsed.links;
      a11yPrefs.dyslexia = !!parsed.dyslexia;
    }
  } catch (e) { console.warn('Failed to load accessibility preferences:', e); }

  function a11ySave() {
    try { localStorage.setItem(A11Y_KEY, JSON.stringify(a11yPrefs)); } catch (e) { console.warn('Failed to save accessibility preferences:', e); }
  }

  function a11yApplyFont() {
    document.documentElement.style.fontSize = (100 + a11yPrefs.fontSize * 10) + '%';
  }

  function a11yApplyClasses() {
    var h = document.documentElement;
    h.classList.toggle('a11y-contrast', a11yPrefs.contrast);
    h.classList.toggle('a11y-links',    a11yPrefs.links);
    h.classList.toggle('a11y-dyslexia', a11yPrefs.dyslexia);
  }

  a11yApplyFont();
  a11yApplyClasses();

  function a11yUpdatePanel() {
    var bC = document.getElementById('a11y-contrast');
    var bL = document.getElementById('a11y-links');
    var bD = document.getElementById('a11y-dyslexia');
    if (bC) bC.setAttribute('aria-pressed', a11yPrefs.contrast ? 'true' : 'false');
    if (bL) bL.setAttribute('aria-pressed', a11yPrefs.links    ? 'true' : 'false');
    if (bD) bD.setAttribute('aria-pressed', a11yPrefs.dyslexia ? 'true' : 'false');
  }

  var a11yTrigger = document.getElementById('a11y-trigger');
  var a11yPanel   = document.getElementById('a11y-panel');

  if (a11yTrigger && a11yPanel) {
    a11yUpdatePanel();

    a11yTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var opening = a11yPanel.hasAttribute('hidden');
      if (opening) {
        a11yPanel.removeAttribute('hidden');
        a11yTrigger.setAttribute('aria-expanded', 'true');
      } else {
        a11yPanel.setAttribute('hidden', '');
        a11yTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('click', function (e) {
      if (!a11yPanel.hasAttribute('hidden') && !a11yPanel.contains(e.target) && !a11yTrigger.contains(e.target)) {
        a11yPanel.setAttribute('hidden', '');
        a11yTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !a11yPanel.hasAttribute('hidden')) {
        a11yPanel.setAttribute('hidden', '');
        a11yTrigger.setAttribute('aria-expanded', 'false');
        a11yTrigger.focus();
      }
    });

    var bFI = document.getElementById('a11y-font-inc');
    var bFD = document.getElementById('a11y-font-dec');
    var bFR = document.getElementById('a11y-font-reset');
    var bCT = document.getElementById('a11y-contrast');
    var bLK = document.getElementById('a11y-links');
    var bDY = document.getElementById('a11y-dyslexia');

    if (bFI) bFI.addEventListener('click', function () { if (a11yPrefs.fontSize < A11Y_FONT_MAX)  { a11yPrefs.fontSize++; a11yApplyFont(); a11ySave(); } });
    if (bFD) bFD.addEventListener('click', function () { if (a11yPrefs.fontSize > A11Y_FONT_MIN) { a11yPrefs.fontSize--; a11yApplyFont(); a11ySave(); } });
    if (bFR) bFR.addEventListener('click', function () { a11yPrefs.fontSize = 0; a11yApplyFont(); a11ySave(); });
    if (bCT) bCT.addEventListener('click', function () { a11yPrefs.contrast = !a11yPrefs.contrast; a11yApplyClasses(); a11yUpdatePanel(); a11ySave(); });
    if (bLK) bLK.addEventListener('click', function () { a11yPrefs.links    = !a11yPrefs.links;    a11yApplyClasses(); a11yUpdatePanel(); a11ySave(); });
    if (bDY) bDY.addEventListener('click', function () { a11yPrefs.dyslexia = !a11yPrefs.dyslexia; a11yApplyClasses(); a11yUpdatePanel(); a11ySave(); });

    var bRA = document.getElementById('a11y-reset-all');
    if (bRA) bRA.addEventListener('click', function () {
      a11yPrefs = { fontSize: 0, contrast: false, links: false, dyslexia: false };
      a11yApplyFont();
      a11yApplyClasses();
      a11yUpdatePanel();
      a11ySave();
    });
  }

})();
