/**
 * 画面表示用の整形。サーバー側（Astro）とブラウザ側（自動更新スクリプト）で共通に使う。
 * 数値をそのまま出すのではなく、判断に使える粒度に丸めるのが狙い。
 */

/** ビューフォート風力階級（風速 m/s → 0〜12）。 */
export function beaufort(speed: number | null | undefined): number | null {
  if (typeof speed !== "number" || !Number.isFinite(speed)) return null;
  const limits = [0.2, 1.5, 3.3, 5.4, 7.9, 10.7, 13.8, 17.1, 20.7, 24.4, 28.4, 32.6];
  for (let level = 0; level < limits.length; level += 1) {
    if (speed < limits[level]) return level;
  }
  return 12;
}

export function formatTemperature(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value)}℃` : "—";
}

export function formatWindSpeed(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(1)} m/s` : "—";
}

export function formatPrecipitation(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(1)} mm` : "—";
}

export function formatProbability(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value)}%` : "—";
}

/** 紫外線指数は数字だけでは伝わらないので、強さの言葉を併記する。 */
export function formatUvIndex(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const level = value >= 8 ? "非常に強い" : value >= 6 ? "強い" : value >= 3 ? "中程度" : "弱い";
  return `${Math.round(value)}（${level}）`;
}

export function formatWindLevel(level: number | null | undefined): string {
  return typeof level === "number" ? `風力 ${level} 程度` : "—";
}
