import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { articles, getRecentArticles } from '../data/articles';

export const GET: APIRoute = (context) => {
  const publishedArticles = getRecentArticles(
    articles.filter((article) => !article.draft),
    articles.length,
  );

  return rss({
    title: 'しゅうの物置の記事',
    description: '作ったこと、調べたこと、日々の記録を置いていく「しゅうの物置」の記事更新です。',
    site: context.site ?? 'https://syu-syuto.github.io',
    customData: '<language>ja</language>',
    items: publishedArticles.map((article) => ({
      title: article.title,
      description: article.excerpt ?? '',
      pubDate: new Date(`${article.publishedAt}T00:00:00+09:00`),
      link: `/articles/${article.slug}/`,
      categories: article.tags,
    })),
  });
};
