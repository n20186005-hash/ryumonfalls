/**
 * ブラウザ側の自動更新。
 *
 * - 予報APIの取得と整形、提案文の生成は lib 側（サーバーと共通）に寄せている。
 * - 通信に失敗したときはサーバー側で描画した値をそのまま残す。
 * - 提案ブロックは条件を満たさないものを非表示にするため、ここでも出し分けを更新する。
 */

import { buildWeatherAdvice, dailyHints } from "../lib/advice";
import {
  formatPrecipitation,
  formatProbability,
  formatTemperature,
  formatUvIndex,
  formatWindLevel,
  formatWindSpeed,
  beaufort
} from "../lib/format";
import { buildEndpoint, describeCode, normalizeForecast, type RawForecast } from "../lib/weather";

const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

function setText(scope: ParentNode, field: string, value: string): void {
  const target = scope.querySelector<HTMLElement>(`[data-field="${field}"]`);
  if (target) target.textContent = value;
}

function setList(scope: ParentNode, slot: string, values: string[]): void {
  const list = scope.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
  if (!list) return;
  list.textContent = "";
  values.forEach((value) => {
    const item = document.createElement("li");
    item.textContent = value;
    list.appendChild(item);
  });
}

function setBlockVisible(scope: ParentNode, name: string, visible: boolean): void {
  const block = scope.querySelector<HTMLElement>(`[data-block="${name}"]`);
  if (block) block.hidden = !visible;
}

function update(root: HTMLElement, raw: RawForecast): void {
  const forecast = normalizeForecast(raw, new Date().toISOString());
  const current = forecast.current;
  const days = forecast.days;

  const currentShape = describeCode(current?.code ?? null);
  setText(root, "current-symbol", currentShape.symbol);
  setText(root, "current-label", currentShape.label);
  setText(root, "current-temp", formatTemperature(current?.temperature));
  setText(root, "current-apparent", formatTemperature(current?.apparentTemperature));
  setText(root, "current-humidity", formatProbability(current?.humidity));
  setText(root, "current-wind", formatWindSpeed(current?.windSpeed));
  setText(root, "current-wind-level", formatWindLevel(beaufort(current?.windSpeed ?? days[0]?.windSpeedMax)));
  setText(root, "current-precip", formatPrecipitation(current?.precipitation));
  setText(root, "today-uv", formatUvIndex(days[0]?.uvIndexMax));

  const advice = buildWeatherAdvice(forecast);
  if (advice) {
    setText(root, "advice-summary", advice.summary);
    setList(root, "warnings", advice.warnings);
    setBlockVisible(root, "warnings", advice.warnings.length > 0);
    setBlockVisible(root, "safe", advice.warnings.length === 0);
    setList(root, "outfits", advice.outfits);
    setBlockVisible(root, "outfits", advice.outfits.length > 0);
    setList(root, "plans", advice.plans);
    setBlockVisible(root, "plans", advice.plans.length > 0);
    setList(root, "items", advice.items);
    setBlockVisible(root, "items", advice.items.length > 0);
  }

  days.forEach((day, index) => {
    const row = root.querySelector<HTMLElement>(`[data-day="${index}"]`);
    if (!row) return;

    const shape = describeCode(day.code);
    setText(row, "symbol", shape.symbol);
    setText(row, "desc", day.label);
    setText(row, "date", day.date.replace(/^\d{4}-/, ""));
    setText(row, "range", `${formatTemperature(day.max)} ／ ${formatTemperature(day.min)}`);
    setText(row, "pop", `降水確率 ${formatProbability(day.precipitationProbability)}`);
    setText(row, "hints", dailyHints(day).join("／"));
  });
}

async function refresh(root: HTMLElement): Promise<void> {
  const lat = Number(root.dataset.lat);
  const lng = Number(root.dataset.lng);
  const days = Number(root.dataset.days ?? 7);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

  try {
    const response = await fetch(buildEndpoint(lat, lng, days), { cache: "no-store" });
    if (!response.ok) return;
    update(root, (await response.json()) as RawForecast);
  } catch {
    // 通信に失敗した場合はサーバー側で描画した値をそのまま表示する。
  }
}

function refreshAll(): void {
  document.querySelectorAll<HTMLElement>("[data-weather]").forEach((root) => {
    void refresh(root);
  });
}

/** コンポーネントが複数回描画されても更新タイマーは1つだけにする。 */
export function startForecastRefresh(): void {
  const flag = "__ryumonForecastRefresh";
  const scope = window as Window & Record<string, boolean | undefined>;

  if (scope[flag]) return;
  scope[flag] = true;

  refreshAll();
  setInterval(refreshAll, REFRESH_INTERVAL_MS);
}
