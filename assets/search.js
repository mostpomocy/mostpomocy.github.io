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
    var article = document.createElement('article');
    article.className = 'post-card';
    article.setAttribute('role', 'listitem');

    if (doc.image) {
      var imgLink = document.createElement('a');
      imgLink.href = doc.url;
      imgLink.className = 'post-card__img-wrap';
      imgLink.tabIndex = -1;
      imgLink.setAttribute('aria-hidden', 'true');

      var image = document.createElement('img');
      image.src = doc.image;
      image.alt = doc.alt || doc.title || '';
      image.className = 'post-card__img';
      image.loading = 'lazy';
      image.addEventListener('error', function () {
        imgLink.classList.add('post-card__img-wrap--empty');
        image.remove();
      });
      imgLink.appendChild(image);
      article.appendChild(imgLink);
    } else {
      var imgFallback = document.createElement('div');
      imgFallback.className = 'post-card__img-wrap post-card__img-wrap--empty';
      imgFallback.setAttribute('aria-hidden', 'true');
      article.appendChild(imgFallback);
    }

    var body = document.createElement('div');
    body.className = 'post-card__body';

    var meta = document.createElement('div');
    meta.className = 'post-card__meta';

    if (doc.date) {
      var time = document.createElement('time');
      time.textContent = doc.date;
      meta.appendChild(time);
    }

    if (doc.category) {
      var category = document.createElement('a');
      category.href = '/mapa/' + doc.category + '/';
      category.className = 'category-pill';
      category.textContent = doc.category;
      meta.appendChild(category);
    }
    body.appendChild(meta);

    var title = document.createElement('h3');
    title.className = 'post-card__title';
    var titleLink = document.createElement('a');
    titleLink.href = doc.url;
    titleLink.textContent = doc.title || '';
    title.appendChild(titleLink);
    body.appendChild(title);

    if (doc.excerpt) {
      var excerpt = document.createElement('p');
      excerpt.className = 'post-card__excerpt';
      excerpt.textContent = doc.excerpt;
      body.appendChild(excerpt);
    }

    if (doc.tags && doc.tags.length) {
      var tagsWrap = document.createElement('div');
      tagsWrap.className = 'post-card__tags';
      doc.tags.slice(0, 3).forEach(function (tag) {
        var tagEl = document.createElement('span');
        tagEl.className = 'tag-chip tag-chip--sm';
        tagEl.textContent = tag;
        tagsWrap.appendChild(tagEl);
      });
      body.appendChild(tagsWrap);
    }

    var readMore = document.createElement('a');
    readMore.href = doc.url;
    readMore.className = 'post-card__link btn btn--outline btn--sm';
    readMore.textContent = 'Czytaj dalej →';
    body.appendChild(readMore);

    article.appendChild(body);
    return article;
  }

  /* ── Perform search and render results ────── */
  function doSearch(query) {
    var resultsEl = document.getElementById('search-results');
    var statusEl  = document.getElementById('search-status');
    if (!resultsEl) { return; }

    var q = (query || '').trim();
    if (!q) {
      if (statusEl) { statusEl.textContent = ''; }
      resultsEl.replaceChildren();
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
      var noResults = document.createElement('div');
      noResults.className = 'search-no-results';

      var p1 = document.createElement('p');
      p1.appendChild(document.createTextNode('Nie znaleziono artykułów pasujących do zapytania '));
      var strong = document.createElement('strong');
      strong.textContent = '„' + q + '"';
      p1.appendChild(strong);
      p1.appendChild(document.createTextNode('.'));

      var p2 = document.createElement('p');
      p2.textContent = 'Sprawdź pisownię lub spróbuj innych słów kluczowych.';

      noResults.appendChild(p1);
      noResults.appendChild(p2);
      resultsEl.replaceChildren(noResults);
      return;
    }

    var fragment = document.createDocumentFragment();
    raw.forEach(function (r) {
      var doc = docsMap[r.ref];
      if (doc) {
        fragment.appendChild(renderCard(doc));
      }
    });
    resultsEl.replaceChildren(fragment);
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