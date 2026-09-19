# しゅうの物置 — Phase 1

添付デザインを基に作り直した「しゅうの物置」のAstroサイトです。GitHub Pagesへの自動公開、RSS、検索登録の準備を含みます。

## 起動

Node.js 20.3 以上を用意し、このディレクトリで実行します。

```sh
npm install
npm run dev
```

表示先は `http://127.0.0.1:4321/` です。pnpm を使う場合は `pnpm install`、`pnpm dev` でも起動できます。

## ファイル

- `src/pages/index.astro`: トップページ
- `src/pages/about.astro`: 「私について」ページ
- `src/pages/works.astro`: 「作ったもの」ページ。タイトルを押すと内容が開く
- `src/pages/articles/index.astro`: 記事一覧
- `src/pages/articles/making-of-shu-monooki.astro`: 最初の記事の本文草案
- `src/pages/articles/making-of-kanji-test.astro`: 漢字小テスト作成ツールの記事の本文草案
- `src/pages/search.astro`: 記事と「作ったもの」を探すページ
- `src/pages/photos.astro`: 写真と撮影情報の切り替えができるギャラリー
- `src/pages/wishlist.astro`: やりたいことリスト
- `src/pages/404.astro`: 猫のドット絵ランゲーム付きの404ページ
- `src/pages/rss.xml.ts`: 公開済みの記事から自動生成するRSS
- `写真登録.csv`: 写真のタイトル・ひとこと・撮影情報の元データ
- `src/data/photos.ts`: CSVと写真ファイルをギャラリーに結びつける処理
- `やりたいことリスト.csv`: Excelで直接編集する、やりたいことの一覧
- `src/data/wishlist.ts`: 一覧ファイルをサイトに読み込む処理
- `src/data/profile.ts`: 自己紹介・好きなもの・外部リンクの文言とURL
- `src/layouts/BaseLayout.astro`: 共通 HTML、ヘッダー、SEO 用の枠
- `src/components/`: ヘッダー、フッター、記事カード、タグ、テープ、写真枠
- `src/data/articles.ts`: 仮記事と Featured の表示条件
- `src/data/updates.ts`: トップのお知らせ（記事の文言生成、作品・ギャラリーの更新）
- `src/styles/global.css`: 既存の共通デザイン
- `src/styles/reference.css`: 添付デザインに合わせたトップページの見た目とレスポンシブ
- `src/styles/about.css`: 「私について」ページの見た目とレスポンシブ
- `src/styles/works.css`: 「作ったもの」ページの見た目とレスポンシブ
- `src/styles/journal.css`: 記事一覧・本文ページの見た目とレスポンシブ
- `src/styles/search.css`: 検索ページの見た目とレスポンシブ
- `src/styles/photos.css`: ギャラリーの見た目とレスポンシブ
- `public/images/`: 差し替え用のローカル素材

トップページは、机の上のHero、4枚の案内カード、お知らせ、紙のメモ、フッターで構成しています。添付画像の配置を優先したため、前版の Featured・最新記事6件のホーム表示は外しています。記事データと Featured の判定関数は `src/data/articles.ts` に残してあります。お知らせ欄には記事・作品・ギャラリーの更新を新しい順に3件まで表示します。記事は `src/data/articles.ts` から自動生成され、下書きの場合は「下書きを追加しました」と表示します。作品や写真の更新を知らせる場合は `src/data/updates.ts` の一覧に追加してください。青いメモから「やりたいことリスト」へ進めます。

トップページと「私について」で使っている写真・木目の一部は仮素材です。ホームの人物と猫の線画は、提供された猫のキャラクターをペン画に描き直した `public/images/hero-cat-mage-pen.webp` に差し替えました。ギャラリーの案内カードには本人が撮影した東京タワーの写真 `public/images/about-user-photo.webp` を使っています。ほかの仮写真は `photo-sheet.webp` の3列×2段からCSSで切り出しています。ギャラリーの3枚は本人が提供した実際の写真です。サイト名や文章は `src/pages/index.astro` で変更できます。

「私について」は、机の上の方眼紙と貼った写真でトップページの雰囲気を引き継ぎ、工作・美術・写真の3つ、作ったもの・ギャラリーへの紙のリンク、SNSの紙片風リンクを配置しました。略歴は載せていません。美術には提供されたキャラクターの衣装案 `public/images/about-user-art.webp`、写真には提供された東京タワーの写真 `public/images/about-user-photo.webp` を使用しています。美術画像はCSSで90度反時計回りに表示します。工作など残りの仮画像は後で差し替える予定です。GitHub・Instagram・Xは本人のプロフィールURLへつながります。紹介文やリンク先は `src/data/profile.ts` で変更できます。

「作ったもの」は「大学での制作」「教育・学習」「ウェブ・技術」「そのほか」の4分野に分けています。大学での制作には非公式の「東京学芸大学 空き教室検索 2026」、教育・学習には漢字の小テスト作成支援ツール、ウェブ・技術には同じようなサイトを作りたい人向けの構造・作成手順を折りたたみ式で掲載しました。そのほかは今後の追加に備えた空欄です。各ツールは利用ページとGitHubのコードページにリンクしています。このサイト自体のソースは `https://github.com/Syu-Syuto/Syu-Syuto.github.io` で公開しています。

「記事」には「このホームページを作ってみた」「漢字テストを作る道具を作った」「東京学芸大の空き教室を探せるページを作った」の3本を掲載しています。いずれもサイト上の下書き表示はありません。記事の一覧用データは `src/data/articles.ts`、本文は `src/pages/articles/` で編集できます。記事を追加するときは、`image` と `imageAlt` にサムネイル画像と代替テキストを必ず指定し、同じ slug の本文ページも作成してください。同日公開の記事は `publicationOrder` の小さい順が古い記事です。`public/images/homepage-thumbnail.png` は実際のトップ画面を撮った画像で、`public/images/kanji-test-thumbnail.svg` と `public/images/tgu-open-classrooms-thumbnail.svg` は各ツールの実画面をもとに描いたイメージです。タグは付箋風に表示しています。一覧カードの淡い背景色は記事の slug ごとに固定されます。記事下の関連記事は同じタグを持つ新しい3件を表示し、「記録」タグは判定から除外します。前後の記事は日付と `publicationOrder` の順に選びます。公開サイトは `https://syu-syuto.github.io/` です。

画面幅によって検索ボタンに重なっていた装飾を移動し、狭い幅ではヘッダーを早めに折りたたむようにしました。写真の背景は縦横比を保って切り抜く指定に統一しています。

検索ページは記事と「作ったもの」のタイトル・紹介文・タグをブラウザ内で絞り込みます。「記事／作ったもの」はジャンルとしてタグとは分けています。タグは紙片風のプルダウンにまとめ、記事と作品を合わせた使用件数が多い順に表示します。タグ名で候補を探すこともでき、キーワード・ジャンルの切り替えと同時に使えます。「Astro」は検索語としては残し、タグにはしていません。作品の検索用データは `src/data/search.ts` に置き、結果から作品を開くと折りたたみが自動でひらきます。開発中の画面にツールバーが重ならないよう、Astro の devToolbar は無効にしています。

ギャラリーは `写真登録.csv` の行順に表示します。通常は写真・タイトル・ひとことだけを見せ、ボタンを押すとカメラ・レンズ・焦点距離・シャッタースピード・F値・ISO感度を表示します。写真を押すと縦横比を保ったまま拡大でき、閉じるボタン・背景のクリック・Escキーで元に戻れます。空欄の情報は出しません。2枚目の「ひとこと」はCSVで空欄のため、サイトでも表示していません。追加するときはJPEGと同じファイル名をCSVに書き、写真を `public/images/gallery/` に置きます。最初の3枚はWebで読み込みやすい英数字の名前のコピーを置いており、元のファイル名との対応は `src/data/photos.ts` に記録しています。元の写真は変更していません。

今後の写真登録では、一覧表示にはWebページ用の軽量画像を使い、クリックして拡大したときは軽量版とは別の高画質画像を表示します。拡大表示は通信量より画質を優先しますが、カメラの元データをそのまま公開せず、位置情報などの撮影データを除いた公開用の高画質画像を作成します。

「やりたいことリスト」は、プロジェクト直下の `やりたいことリスト.csv` をExcelで開いて編集できます。新しいことを追加するときは、見出し行のすぐ下に行を入れ、`追加日`（例：`2026-09-17`）と `やりたいこと` を書いて保存してください。`補足` は空欄で構いません。達成したら、その行の `達成日` に日付を入れます。ページにはチェックと手描き風の取り消し線が付きます。表示は追加日の新しい順で、同じ日付ならCSVで上にある行が先です。達成しても順番は変わりません。Excelから保存するときは「CSV UTF-8」形式のまま保存し、ファイル名と1行目の見出しを変えないでください。ローカルの開発画面は保存後に再読み込みして確認できます。公開済みサイトへ反映するには、更新版をビルドして再公開する必要があります。

公開URLは `https://syu-syuto.github.io/` を想定し、canonical、OGP、`robots.txt`、`sitemap.xml` を生成します。検索ページは操作によって内容が変わるため検索登録の対象外です。Google Search Console の所有権確認コードは、公開時に `PUBLIC_GOOGLE_SITE_VERIFICATION` として設定できます。元写真・生成元画像は `source-images/` に保存し、Gitと公開データから除外します。

存在しないURLでは専用の `404.html` を表示します。方眼紙の上で猫の魔法使いを走らせ、鉛筆・消しゴム・テープをジャンプで避ける軽量なゲームです。スペースキー、上矢印キー、画面タップに対応し、ゲームをせずトップへ戻るリンクも常に表示します。

## 公開と更新

GitHubの `Syu-Syuto/Syu-Syuto.github.io` リポジトリへ置くことを想定しています。`.github/workflows/deploy.yml` により、`main` ブランチへ更新を送るたびにサイトを確認・作成し、GitHub Pagesへ自動公開します。GitHub側では Pages の公開元を「GitHub Actions」にします。

記事のRSSは `/rss.xml` で配信し、フッターからも開けます。`src/data/articles.ts` に公開記事を追加すると、RSSにも自動で加わります。

アクセス解析はCookieを使わない軽量なGoatCounterを想定しています。GitHubリポジトリの変数 `GOATCOUNTER_CODE` にGoatCounterで取得したサイトコードを登録したときだけ有効になります。Google Search Consoleの確認コードは同じ場所の `GOOGLE_SITE_VERIFICATION` に登録できます。どちらも公開情報なので、GitHub SecretsではなくActions variablesで構いません。
