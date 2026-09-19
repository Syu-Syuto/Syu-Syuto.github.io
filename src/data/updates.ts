import type { Article } from './articles';

type UpdateKind = 'article' | 'work' | 'gallery';

export type HomeUpdate = {
  kind: UpdateKind;
  date: string;
  order: number;
  href: string;
  label: string;
  message: string;
};

// 作品・写真を追加したときは、ここに新しいお知らせを加える。
const manualUpdates: HomeUpdate[] = [
  {
    kind: 'work',
    date: '2026-09-18',
    order: 3,
    href: '/works/#tgu-open-classrooms-2026',
    label: '作ったもの',
    message: '「東京学芸大学 空き教室検索 2026」を公開しました',
  },
  {
    kind: 'gallery',
    date: '2026-09-18',
    order: 2,
    href: '/photos/',
    label: 'ギャラリー',
    message: 'ギャラリーに写真を追加しました',
  },
  {
    kind: 'work',
    date: '2026-09-18',
    order: 1,
    href: '/works/#kanji-test-tool',
    label: '作ったもの',
    message: '「漢字の小テスト作成支援ツール」を公開しました',
  },
];

export function getHomeUpdates(articles: Article[], limit = 3): HomeUpdate[] {
  const articleUpdates: HomeUpdate[] = articles.map((article) => ({
    kind: 'article',
    date: article.publishedAt,
    order: article.publicationOrder,
    href: `/articles/${article.slug}/`,
    label: '記事',
    message: article.draft
      ? `「${article.title}」の下書きを追加しました`
      : `「${article.title}」を公開しました`,
  }));

  return [...manualUpdates, ...articleUpdates]
    .sort((a, b) => b.date.localeCompare(a.date) || b.order - a.order)
    .slice(0, limit);
}
