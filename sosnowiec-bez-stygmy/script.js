/* Sosnowiec bez stygmy – script.js
   Minimal progressive enhancement for the campaign page.
   Core navigation / a11y widget is handled by ../assets/app.js.
   ------------------------------------------------------------ */

(function () {
  'use strict';

  /* ── Smooth-scroll anchor links within this page ───────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
