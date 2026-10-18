import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://www.mostpomocy.pl').replace(/\/$/, '');

  const staticPaths = [
    '/',
    '/wsparcie/',
    '/blog/',
    '/sosnowiec/',
    '/sosnowiec/blog/',
    '/kompas-pomocy/',
    '/bezpiecznik/',
    '/edukacja/',
    '/o-projekcie/',
    '/polityka-prywatnosci/',
    '/admin/',
  ];

  const [support, blogPolska, blogSosnowiec] = await Promise.all([
    getCollection('wsparcie'),
    getCollection('blog-polska', ({ data }) => !data.draft),
    getCollection('blog-sosnowiec', ({ data }) => !data.draft),
  ]);

  const dynamicPaths = [
    ...support.map((entry) => `/wsparcie/${entry.slug}/`),
    ...blogPolska.map((entry) => `/blog/${entry.slug}/`),
    ...blogSosnowiec.map((entry) => `/sosnowiec/blog/${entry.slug}/`),
  ];

  const urls = [...staticPaths, ...dynamicPaths]
    .map((path) => `<url><loc>${base}${path}</loc></url>`)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
