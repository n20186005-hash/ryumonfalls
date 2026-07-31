# Self-check status

実装済み確認:

- `package.json` は `latest` / `*` / 浮動範囲なしの固定バージョン。
- `packageManager` は `pnpm@11.18.0`。
- `.node-version` と `engines.node` は `24.18.1`。
- `pnpm-workspace.yaml` は作成していません。
- `astro.config.mjs` の `site` は一箇所のみ。空でもビルド可能な条件分岐にしています。
- `@astrojs/sitemap` は `site` がある場合のみ有効化します。
- Google Map iframe は `!1sja!2sjp` に変更済み。
- 禁止された仮 URL / 拡張機能 URL の文字列スキャンはソース内で該当なし。
- TypeScript だけで構成される `src/data` / `src/lib` / `src/scripts` は、ローカルの `tsc 5.8.3` で構文・型確認済み。

未完了:

- この実行環境では npm registry / Corepack から Astro 依存関係を取得できませんでした。内部 registry は `astro` を 404 とし、public registry への直接 DNS 接続も失敗したため、`pnpm-lock.yaml` の生成、`CI=1 corepack pnpm install --frozen-lockfile`、`pnpm check`、`pnpm build` は完了していません。

実行ログの要旨:

```text
npm view astro@7.1.3 version
404 Not Found - internal npm registry has no astro package

NPM_CONFIG_REGISTRY=https://registry.npmjs.org npm view astro version
EAI_AGAIN / DNS resolution failure

corepack prepare pnpm@11.18.0 --activate
failed while requesting https://registry.npmjs.org/pnpm/-/pnpm-11.18.0.tgz
```

npm に接続できる環境で以下を実行してください。

```bash
corepack enable
corepack prepare pnpm@11.18.0 --activate
pnpm install
pnpm check
pnpm build
```

その後 `pnpm-lock.yaml` をコミットしてください。
