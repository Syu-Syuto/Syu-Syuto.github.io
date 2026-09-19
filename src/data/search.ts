// 「作ったもの」は現在 works.astro に本文があるため、検索用の見出しと要約をここにも登録する。
// 作品を追加・改名したときは、この一覧も更新する。
export const worksSearchEntries = [
  {
    title: '東京学芸大学 空き教室検索 2026',
    excerpt: '2026年度の時間割データをもとに、開講期・曜日・時限から空き教室の候補を探せる非公式ツール。正確性・利用可否は保証しません。',
    tags: ['東京学芸大学', '空き教室検索', '情報系', 'ツール制作'],
    keywords: '大学 教室 時間割 シラバス ターム 空き教室 非公式',
    href: '/works/#tgu-open-classrooms-2026',
    icon: 'grid',
  },
  {
    title: '漢字の小テスト作成支援ツール',
    excerpt: '文章から読み・書きの漢字小テストを作り、縦書きの用紙を印刷できるブラウザ用ツール。JSONの保存・読み込みにも対応。',
    tags: ['教育・学習', '漢字', 'ツール'],
    keywords: '総テスト 定期テスト 問題 作成 印刷 JSON 読み 書き 学習塾',
    href: '/works/#kanji-test-tool',
    icon: 'pencil',
  },
  {
    title: 'このサイトの作り方',
    excerpt: '「しゅうの物置」の基本構造と、Astroでページを作るまでの流れをまとめたメモ。',
    tags: ['ウェブ・技術', 'サイト制作'],
    keywords: 'Astro ホームページ プログラム コード HTML CSS 構造',
    href: '/works/#site-building-guide',
    icon: 'grid',
  },
] as const;
