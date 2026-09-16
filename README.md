# 龍門の滝 非公式ガイドサイト

栃木県那須烏山市「龍門の滝（Ryumon Falls）」の日本語・非公式の観光ガイドサイトです。Astro + Tailwind CSS + TypeScript で実装し、生成物（`dist/`）を Cloudflare の Workers（静的アセット）に手動で配置する前提で運用します。

- 本番ドメイン：`https://ryumonfalls.com`（`astro.config.mjs` の `site`）

## 技術スタック

- Astro `7.1.6`（`output: "static"`）
- `@astrojs/sitemap` `3.7.3`
- Tailwind CSS `4.3.3` + `@tailwindcss/vite` `4.3.3`
- TypeScript `5.9.3`
- Wrangler `4.115.0`
- pnpm `11.18.0` / Node.js `24`

## ページ構成

| パス | 内容 |
| --- | --- |
| `/` | トップ（ランディング）。見どころ、概要と地理階層、料金、駐車場、四季、設備、天気、交通、モデルコース、目的別ルート、歴史、地質・生態、訪れる人の責任、評価、写真、FAQ、情報源 |
| `/guide/` | 見どころ（滝・甌穴・伝説・列車撮影・季節） |
| `/access/` | 交通・駐車場（空港からの経路、公共交通、タクシー、車、レンタカー、Google マップ、設備一覧、評価、周辺スポット） |
| `/planning/` | 旅の計画（現在の天気と複数日の予報、季節別戦略、設備・サービス一覧、同行者別ルート、持ち物） |
| `/gallery/` | 写真ギャラリー（レスポンシブ・遅延読み込み・クリック拡大） |
| `/memorial-card/` | 端末内 Canvas でつくる旅の記念カード（1:1 / 縦長ポストカード / 9:16、PNG 保存） |
| `/faq/` | よくある質問 + `FAQPage` JSON-LD |

## 天気モジュール

- `src/lib/weather.ts` でサーバー側（描画時）に観測値と複数日の予報を取得し、30 分のメモリキャッシュを行います。
- 取得に失敗してもビルド・表示を止めず、季節の目安と気象庁公式情報への導線にフォールバックします。
- ページ描画後、`src/scripts/weather.ts` が同じ値を最新の観測値に静かに更新します。
- 画面に表示するのは「気温・降水確率・雨具と服装の目安」のみです。取得経路の宣伝や、一般の来訪者に不要な技術的な注釈は表示していません。
- 出典・注意喚起は気象庁の防災情報へリンクしています。

## 掲載方針（非営利・中立）

- 飲食・宿泊・買い物・給油・EV 充電などの商業施設は**店名・施設名を一切紹介しません**。設備の「種類」と「おおよその距離帯」のみを記載しています。
- Google マップの評価は画面表示のみで、JSON-LD（`aggregateRating` / `Review`）には含めていません。表示は「出典・同期時期・著作権の帰属」を明記したうえで行っています。
- 所要時間・運賃・気温などの数値はすべて「一般的な目安」であり、最新情報の確認を促す補足を併記しています。

## SEO・構造化データ

- `TouristAttraction` + `LocalBusiness`：`@id`、`alternateName`、`image`、`isAccessibleForFree`、`address`（JP / 321-0633 / 那須烏山市 / 栃木県）、`geo`、`hasMap`、`sameAs`
- `FAQPage`：全ページ共通の質問データ
- `BreadcrumbList`：下層ページ
- canonical / OG（`og:image:alt` 含む）/ Twitter カード
- `sitemap-index.xml` と `robots.txt`

## PWA

- `public/manifest.webmanifest`（`display: standalone`、アイコン、ショートカット）
- `public/sw.js`：主要ページと静的アセットをプリキャッシュ。HTML はネットワーク優先＋キャッシュフォールバック、画像等はキャッシュ優先
- アイコン：`public/icons/`（192 / 512 / maskable 512 / apple-touch-icon 180）

## ローカル開発

```bash
corepack enable
corepack prepare pnpm@11.18.0 --activate
pnpm install
pnpm check
pnpm build
```

## 手動デプロイ（Cloudflare Workers の静的アセット）

```bash
pnpm build
pnpm deploy        # wrangler deploy
```

- `wrangler.jsonc` は `assets.directory = "./dist"` のみの構成です（Worker スクリプトは置きません）。
- アップロードするのは `dist/` の中身だけです。`node_modules/`、`.astro/`、`.wrangler/`、`dist/` などの生成物は `.gitignore` で除外しています。

## 注意

- 非公式の観光ガイドです。
- 写真は公開観光ページの実景写真をローカル配置しています。公開運用前に権利者・配布元の利用条件を確認してください。
- 評価・口コミ・所要時間・運賃・気温は変動します。最新値は Google マップ、各事業者、気象庁の案内で確認してください。
