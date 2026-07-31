# 龍門の滝 非公式ガイドサイト

栃木県那須烏山市「龍門の滝」の日本語・非公式ガイドサイトです。Astro + Tailwind CSS + TypeScript で実装し、Cloudflare Workers Static Assets にデプロイする構成です。

## 技術スタック

- Astro `7.1.6`
- `@astrojs/cloudflare` `14.1.7`
- `@astrojs/sitemap` `3.7.3`
- Tailwind CSS `4.3.3` + `@tailwindcss/vite` `4.3.3`
- TypeScript `5.9.3`
- Wrangler `4.115.0`
- pnpm `11.18.0`
- Node.js `24.18.1`

## ページ構成

- `/` トップ：見どころ、料金、駐車場、季節、交通、周辺グルメ、周辺スポット、写真ギャラリー、FAQ
- `/guide/` 見どころ：滝、甌穴、伝説、列車撮影、季節
- `/access/` 詳細交通・駐車場・Google マップ
- `/gallery/` 写真ギャラリー：レスポンシブ、遅延読み込み、クリック拡大
- `/memorial-card/` 端末内 Canvas 記念カード：1:1 / 縦長ポストカード / 9:16、PNG ダウンロード
- `/faq/` よくある質問 + FAQPage JSON-LD

## URL 設定

正式ドメインが決まったら、`astro.config.mjs` の `site` だけを設定してください。

```js
const site = "https://<正式ドメイン>";
```

`site` が空のままでもビルドできる設計です。この場合、canonical / OG URL / JSON-LD URL は絶対 URL を無理に出さず、sitemap 統合も無効化されます。仮ドメインは入れていません。

## ローカル確認

```bash
corepack enable
corepack prepare pnpm@11.18.0 --activate
CI=1 corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
```

## Cloudflare Workers デプロイ

```bash
pnpm deploy
```

`wrangler.jsonc` は `dist/_worker.js/index.js` と `dist` assets を前提にしています。

## 注意

- このサイトは非公式ガイドです。
- 写真は公開観光ページの実景写真をローカル配置しています。公開運用前に権利者・配布元の利用条件を必ず確認してください。サイト内では写真の権利について虚偽表示をしていません。
- Google Analytics は `G-HXM22WWPKP` を設定済みです。
- Google マップ iframe は日本語・日本地域パラメータに変更済みです。
