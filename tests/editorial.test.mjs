import test from 'node:test';
import assert from 'node:assert/strict';
import { clean } from '../src/lib/schema.mjs';
import { pageArticles } from '../src/lib/page-news.mjs';

const page = { id: 'studenci-wns', title: 'Sprawy studentów', slug: 'studenci-wns', body: '<p>Treść podstrony.</p>' };
test('page keeps tiles and image metadata', () => {
  const result = clean('pages', { ...page, tiles: [{title: 'Aktualności', url: '/studenci-wns/#aktualnosci'}], image: '/uploads/photo.jpg', image_alt: 'Budynek' });
  assert.equal(result.tiles.length, 1);
  assert.equal(result.image_alt, 'Budynek');
  assert.throws(() => clean('pages', {...page, tiles: [{title: 'Link', url: 'javascript:alert(1)'}]}));
});
test('SEO uses content defaults and preserves editorial overrides', () => {
  assert.equal(clean('pages', page).seo_description, 'Treść podstrony.');
  assert.equal(clean('pages', {...page, excerpt: 'Wprowadzenie.'}).seo_description, 'Wprowadzenie.');
  assert.equal(clean('pages', {...page, seo_description: 'Własny opis'}).seo_description, 'Własny opis');
});
test('student updates only select linked articles', () => {
  assert.deepEqual(pageArticles(page, [{id: 'yes', related_page_ids: [page.id]}, {id: 'no'}]).map(p => p.id), ['yes']);
});
