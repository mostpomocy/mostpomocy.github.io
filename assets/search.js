/* MostPomocy – search.js
   Lunr.js client-side search for Jekyll blog
   ------------------------------------------ */
(function () {
  'use strict';

  var lunrIndex = null;
  var docsMap = {};   // ref (url) → document
  var indexReady = false;
  var loadError = false;

  /* ── Build lunr index from JSON data ──────── */
  function buildIndex(data) {
    data.forEach(function (doc) {
      docsMap[doc.id] = doc;
    });
    lunrIndex = lunr(function () {
      this.ref('id');
      this.field('title', { boost: 10 });
      this.field('category', { boost: 5 });
      this.field('tags', { boost: 5 });
      this.field('excerpt', { boost: 3 });
      this.field('content');
      data.forEach(function (doc) { this.add(doc); }, this);
    });
    indexReady = true;
  }

  /* ── Fetch search index ───────────────────── */
  var indexUrl = (typeof SEARCH_INDEX_URL !== 'undefined')
    ? SEARCH_INDEX_URL
    : '/assets/search-index.json';

  var indexPromise = fetch(indexUrl)
    .then(function (res) {
      if (!res.ok) { throw new Error('HTTP ' + res.status); }
      return res.json();
    })
    .then(function (data) {
      buildIndex(data);
    })
    .catch(function (err) {
      loadError = true;
      console.warn('MostPomocy search: failed to load index:', err);
    });

  /* ── Render a single result card ─────────── */
  function renderCard(doc) {
    var categoryHtml = doc.category
      ? '<a href="/mapa/' + doc.category + '/" class="category-pill">' + doc.category + '</a>'
      : '';
    var tagsHtml = '';
    if (doc.tags && doc.tags.length) {
      tagsHtml = '<div class="post-card__tags">' +
        doc.tags.slice(0, 3).map(function (t) {
          return '<span class="tag-chip tag-chip--sm">' + t + '</span>';
        }).join('') +
        '</div>';
    }
    var excerpt = doc.excerpt ? '<p class="post-card__excerpt">' + doc.excerpt + '</p>' : '';
    return '<article class="post-card" role="listitem">' +
      '<div class="post-card__body">' +
        '<div class="post-card__meta">' + categoryHtml + '</div>' +
        '<h3 class="post-card__title"><a href="' + doc.url + '">' + doc.title + '</a></h3>' +
        excerpt +
        tagsHtml +
        '<a href="' + doc.url + '" class="post-card__link btn btn--outline btn--sm">Czytaj dalej →</a>' +
      '</div>' +
    '</article>';
  }

  /* ── Perform search and render results ────── */
  function doSearch(query) {
    var resultsEl = document.getElementById('search-results');
    var statusEl  = document.getElementById('search-status');
    if (!resultsEl) { return; }

    var q = (query || '').trim();
    if (!q) {
      if (statusEl) { statusEl.textContent = ''; }
      resultsEl.innerHTML = '';
      return;
    }

    if (loadError) {
      if (statusEl) { statusEl.textContent = 'Błąd ładowania indeksu wyszukiwania.'; }
      return;
    }
    if (!indexReady) {
      /* Index still loading – retry after it's done */
      indexPromise.then(function () { doSearch(query); });
      if (statusEl) { statusEl.textContent = 'Ładowanie indeksu…'; }
      return;
    }

    var raw;
    try {
      raw = lunrIndex.search(q);
    } catch (e) {
      /* lunr throws on some query syntax errors – try wildcard fallback */
      try {
        raw = lunrIndex.search(q + '*');
      } catch (e2) {
        raw = [];
      }
    }

    if (statusEl) {
      statusEl.textContent = raw.length
        ? 'Znaleziono ' + raw.length + ' wynik' + (raw.length === 1 ? '' : raw.length < 5 ? 'i' : 'ów') + ' dla „' + q + '"'
        : 'Brak wyników dla „' + q + '"';
    }

    if (raw.length === 0) {
      resultsEl.innerHTML =
        '<div class="search-no-results">' +
          '<p>Nie znaleziono artykułów pasujących do zapytania <strong>„' + q + '"</strong>.</p>' +
          '<p>Sprawdź pisownię lub spróbuj innych słów kluczowych.</p>' +
        '</div>';
      return;
    }

    resultsEl.innerHTML = raw.map(function (r) {
      var doc = docsMap[r.ref];
      return doc ? renderCard(doc) : '';
    }).join('');
  }

  /* ── Wire up form ─────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var form    = document.getElementById('search-form');
    var input   = document.getElementById('search-input');
    var statusEl = document.getElementById('search-status');

    if (!form || !input) { return; }

    /* Auto-search from ?q= URL parameter */
    var params  = new URLSearchParams(window.location.search);
    var qParam  = params.get('q') || '';
    if (qParam) {
      input.value = qParam;
      /* Wait for index, then search */
      indexPromise.then(function () { doSearch(qParam); });
      if (statusEl) { statusEl.textContent = 'Szukam…'; }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value;
      /* Update URL without reloading */
      if (history.replaceState) {
        var newUrl = window.location.pathname + '?q=' + encodeURIComponent(q);
        history.replaceState(null, '', newUrl);
      }
      doSearch(q);
    });
  });

})();