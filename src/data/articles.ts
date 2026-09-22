export type Article = {
  slug: string;
  title: string;
  excerpt?: string;
  draft?: boolean;
  publishedAt: string;
  // 同じ日に記事を追加した場合も前後・新着順を決められる番号。
  publicationOrder: number;
  tags: string[];
  // 記事一覧に表示するサムネイルと代替テキストは、新しい記事でも必須。
  image: string;
  imageAlt: string;
  featured?: {
    enabled: boolean;
    start?: string;
    end?: string;
    priority?: number;
  };
};

export const articles: Article[] = [
  {
    slug: 'making-of-shu-monooki',
    title: 'このホームページを作ってみた',
    excerpt: '先輩の個人サイトに触発されて、自分のツールや記録の置き場を作り始めた話。',
    publishedAt: '2026-09-17',
    publicationOrder: 1,
    tags: ['情報系', 'サイト制作', '記録'],
    image: '/images/homepage-thumbnail.png',
    imageAlt: '「しゅうの物置」トップページの画面',
  },
  {
    slug: 'making-of-kanji-test',
    title: '漢字テストを作る道具を作った',
    excerpt: '塾での漢字総テスト作りを少し楽にしたくて、AIと一緒にツールを作り直した話。',
    publishedAt: '2026-09-17',
    publicationOrder: 2,
    tags: ['教育', '情報系', 'ツール制作'],
    image: '/images/kanji-test-thumbnail.svg',
    imageAlt: '漢字小テスト作成ツールの入力画面と縦書きプレビューを表したイラスト',
  },
  {
    slug: 'tgu-open-classrooms-2026',
    title: '東京学芸大の空き教室を探せるページを作った',
    excerpt: '曜日と時限から空き教室の候補を探せる、非公式ツールを作った話。',
    publishedAt: '2026-09-18',
    publicationOrder: 1,
    tags: ['東京学芸大学', '空き教室検索', '情報系', 'ツール制作'],
    image: '/images/tgu-open-classrooms-thumbnail.svg',
    imageAlt: '東京学芸大学 空き教室検索の実画面をもとに、開講期・曜日・時限の選択と教室一覧を描いたサムネイル',
  },
  {
    slug: 'diary-1',
    title: '日記#1',
    excerpt: '大学用の自転車を買ったり、ブラウン管テレビを分解したり、謎メンツで飯を食べたりした一週間。',
    publishedAt: '2026-09-22',
    publicationOrder: 1,
    tags: ['日記', '工作'],
    image: '/images/articles/diary-1/crt-tv.webp',
    imageAlt: '作業机に置かれた古いブラウン管テレビ',
  },
];

export function getRecentArticles(items: Article[], limit = 6): Article[] {
  return [...items].sort((a, b) => compareArticlesByDate(b, a)).slice(0, limit);
}

const compareArticlesByDate = (a: Article, b: Article) =>
  a.publishedAt.localeCompare(b.publishedAt) || a.publicationOrder - b.publicationOrder || a.slug.localeCompare(b.slug);

export function getRelatedArticles(items: Article[], current: Article, limit = 3): Article[] {
  const relevantTags = new Set(current.tags.filter((tag) => tag !== '記録'));
  if (relevantTags.size === 0) return [];

  return items
    .filter((candidate) => candidate.slug !== current.slug && candidate.tags.some((tag) => relevantTags.has(tag)))
    .sort((a, b) => compareArticlesByDate(b, a))
    .slice(0, limit);
}

export function getAdjacentArticles(items: Article[], current: Article): { previous?: Article; next?: Article } {
  const chronological = [...items].sort(compareArticlesByDate);
  const index = chronological.findIndex(({ slug }) => slug === current.slug);
  if (index === -1) return {};

  return { previous: chronological[index - 1], next: chronological[index + 1] };
}

export function getFeaturedArticles(items: Article[], now = new Date()): Article[] {
  const today = now.toISOString().slice(0, 10);
  return items.filter(({ featured }) =>
    featured?.enabled &&
    (!featured.start || featured.start <= today) &&
    (!featured.end || featured.end >= today)
  ).sort((a, b) => (a.featured?.priority ?? 999) - (b.featured?.priority ?? 999));
}
