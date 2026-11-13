import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const articleDir = path.join(root, 'src/pages/articles');
const built = process.argv.includes('--built');
const failures = [];
let count = 0;
for (const file of await readdir(articleDir)) {
  if (!file.endsWith('.astro') || file === 'index.astro') continue;
  const source = await readFile(path.join(articleDir, file), 'utf8');
  if (!source.includes('article.tags') && !source.includes('<ArticleTags')) continue;
  count++;
  if (!source.includes('<ArticleTags tags={article.tags} />') || !source.includes("import ArticleTags from '../../components/ArticleTags.astro'")) {
    failures.push(`${file}: 記事タグには共通のArticleTagsを使用してください。`);
  }
  if (source.includes('article.tags.map')) failures.push(`${file}: 個別のタグ実装が残っています。`);
  if (!built) continue;
  const html = await readFile(path.join(root, 'dist/articles', file.replace(/\.astro$/, ''), 'index.html'), 'utf8');
  const tags = html.match(/<div\b[^>]*aria-label="記事のタグ"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  if (!tags) { failures.push(`${file}: 生成された記事にタグがありません。`); continue; }
  if (/<span\b/.test(tags)) failures.push(`${file}: クリックできないタグがあります。`);
  const links = [...tags.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)];
  const expectedCount = Number(html.match(/aria-label="記事のタグ"[^>]*data-tag-count="(\d+)"/)?.[1]);
  if (!Number.isInteger(expectedCount) || links.length !== expectedCount) failures.push(`${file}: タグ件数とリンク数が一致しません。`);
  for (const [, encodedHref, encodedLabel] of links) {
    const decodeHtml = (text) => text.replace(/&#38;|&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const url = new URL(decodeHtml(encodedHref), 'https://syu-syuto.github.io');
    if (url.pathname !== '/search/' || url.searchParams.get('type') !== 'article' || url.searchParams.get('tag') !== decodeHtml(encodedLabel)) failures.push(`${file}: 不正なタグURL ${encodedHref}`);
  }
}
if (!count) failures.push('検査対象の記事がありません。');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`${count}記事のタグ${built ? '（生成HTML）' : '（作成時ソース）'}を確認しました。`);
