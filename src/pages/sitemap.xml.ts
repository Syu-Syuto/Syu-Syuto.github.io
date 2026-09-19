import type { APIRoute } from 'astro';
import { articles } from '../data/articles';

const staticPages = [
  '/',
  '/articles/',
  '/works/',
  '/photos/',
  '/wishlist/',
  '/about/',
];

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site ?? new URL('https://syu-syuto.github.io');
  const staticEntries: Array<{ path: string; lastmod?: string }> = staticPages.map((path) => ({ path }));
  const articleEntries = articles
    .filter((article) => !article.draft)
    .map((article) => ({
      path: `/articles/${article.slug}/`,
      lastmod: article.publishedAt,
    }));

  const entries = [...staticEntries, ...articleEntries]
    .map(({ path, lastmod }) => {
      const location = escapeXml(new URL(path, siteUrl).href);
      return `  <url>\n    <loc>${location}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
