// Lunr.js search for Jekyll blog
var idx;
fetch('/assets/search-index.json').then(res => res.json()).then(data => {
  idx = lunr(function () {
    this.field('title');
    this.field('content');
    this.field('tags');
    this.field('category');
    data.forEach(doc => this.add(doc));
  });
});
document.addEventListener('DOMContentLoaded', function() {
  var searchForm = document.getElementById('search-form');
  if(!searchForm) return;
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var q = document.getElementById('search-input').value;
    var results = idx.search(q);
    var resultsDiv = document.getElementById('search-results');
    if(resultsDiv && results.length > 0) {
      resultsDiv.innerHTML = results.map(r => `<a href="${data[r.ref].url}">${data[r.ref].title}</a>`).join('<br>');
    } else if(resultsDiv) {
      resultsDiv.innerHTML = 'Brak wyników.';
    }
  });
});