/**
 * 現地の天気・週間予報の取得。
 *
 * - サーバー側（ビルド時・描画時）で取得し、一定時間メモリキャッシュする。
 * - 取得に失敗してもビルドやページ表示を止めないため、失敗時は null を返す。
 * - 画面に表示するのは観測・予報の値そのもののみ。取得経路の宣伝は行わない。
 */

const ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const TIMEZONE = "Asia/Tokyo";
const CACHE_TTL_MS = 30 * 60 * 1000;

let cache: { expiresAt: number; value: Forecast | null } | null = null;

export interface WeatherLabel {
  label: string;
  symbol: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number | null;
  apparentTemperature: number | null;
  humidity: number | null;
  precipitation: number | null;
  windSpeed: number | null;
  windGust: number | null;
  code: number | null;
}

export interface DailyWeather {
  date: string;
  weekday: string;
  label: string;
  code: number | null;
  max: number | null;
  min: number | null;
  precipitation: number | null;
  precipitationProbability: number | null;
  windSpeedMax: number | null;
  windGustMax: number | null;
  uvIndexMax: number | null;
  apparentTemperatureMax: number | null;
  apparentTemperatureMin: number | null;
  snowfall: number | null;
}

export interface Forecast {
  updatedAt: string;
  current: CurrentWeather | null;
  days: DailyWeather[];
}

/** WMO の天気コードを日本語表現に置き換える。 */
export function describeCode(code: number | null | undefined): WeatherLabel {
  if (code === null || code === undefined) return { label: "情報なし", symbol: "–" };

  if (code === 0) return { label: "快晴", symbol: "☀" };
  if (code === 1) return { label: "おおむね晴れ", symbol: "☀" };
  if (code === 2) return { label: "晴れ時々くもり", symbol: "🌤" };
  if (code === 3) return { label: "くもり", symbol: "☁" };
  if (code === 45 || code === 48) return { label: "霧", symbol: "🌫" };
  if (code === 51 || code === 53 || code === 55) return { label: "霧雨", symbol: "🌦" };
  if (code === 56 || code === 57) return { label: "凍る霧雨", symbol: "🌧" };
  if (code === 61 || code === 63 || code === 65) return { label: "雨", symbol: "☂" };
  if (code === 66 || code === 67) return { label: "凍る雨", symbol: "☂" };
  if (code === 71 || code === 73 || code === 75) return { label: "雪", symbol: "❄" };
  if (code === 77) return { label: "あられ", symbol: "❄" };
  if (code === 80 || code === 81 || code === 82) return { label: "にわか雨", symbol: "☂" };
  if (code === 85 || code === 86) return { label: "にわか雪", symbol: "❄" };
  if (code === 95) return { label: "雷雨", symbol: "⛈" };
  if (code === 96 || code === 99) return { label: "雷雨・ひょう", symbol: "⛈" };

  return { label: "情報なし", symbol: "–" };
}

function toWeekday(date: string): string {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  if (!year || !month || !day) return "";
  const utc = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("ja-JP", { weekday: "short", timeZone: "UTC" }).format(utc);
}

export interface RawForecast {
  current?: Record<string, number | string | null>;
  daily?: Record<string, Array<number | string | null>>;
}

function num(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function normalizeForecast(raw: RawForecast, updatedAt: string): Forecast {
  const currentRaw = raw.current ?? {};
  const current: CurrentWeather | null = currentRaw.time
    ? {
        time: String(currentRaw.time),
        temperature: num(currentRaw.temperature_2m),
        apparentTemperature: num(currentRaw.apparent_temperature),
        humidity: num(currentRaw.relative_humidity_2m),
        precipitation: num(currentRaw.precipitation),
        windSpeed: num(currentRaw.wind_speed_10m),
        windGust: num(currentRaw.wind_gusts_10m),
        code: num(currentRaw.weather_code)
      }
    : null;

  const daily = raw.daily ?? {};
  const dates: string[] = (daily.time ?? []).map((value) => String(value ?? ""));

  const days: DailyWeather[] = dates.map((date, index) => {
    const code = num(daily.weather_code?.[index]);
    return {
      date,
      weekday: toWeekday(date),
      label: describeCode(code).label,
      code,
      max: num(daily.temperature_2m_max?.[index]),
      min: num(daily.temperature_2m_min?.[index]),
      precipitation: num(daily.precipitation_sum?.[index]),
      precipitationProbability: num(daily.precipitation_probability_max?.[index]),
      windSpeedMax: num(daily.wind_speed_10m_max?.[index]),
      windGustMax: num(daily.wind_gusts_10m_max?.[index]),
      uvIndexMax: num(daily.uv_index_max?.[index]),
      apparentTemperatureMax: num(daily.apparent_temperature_max?.[index]),
      apparentTemperatureMin: num(daily.apparent_temperature_min?.[index]),
      snowfall: num(daily.snowfall_sum?.[index])
    };
  });

  return { updatedAt, current, days };
}

export function buildEndpoint(latitude: number, longitude: number, forecastDays: number): string {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max",
    timezone: TIMEZONE,
    forecast_days: String(forecastDays)
  });
  return `${ENDPOINT}?${params.toString()}`;
}

export const FORECAST_ENDPOINT = ENDPOINT;
export const FORECAST_TIMEZONE = TIMEZONE;

/**
 * 天気を取得する。サーバー側でのみ呼び出し、一定時間キャッシュする。
 * 失敗時は null を返す（ページ側で季節の目安にフォールバックする）。
 */
export async function getForecast(
  latitude: number,
  longitude: number,
  forecastDays = 7
): Promise<Forecast | null> {
  const now = Date.now();

  if (cache && cache.expiresAt > now) return cache.value;

  try {
    const response = await fetch(buildEndpoint(latitude, longitude, forecastDays), {
      signal: AbortSignal.timeout(9000)
    });

    if (!response.ok) throw new Error(`forecast request failed: ${response.status}`);

    const raw = (await response.json()) as RawForecast;
    const value = normalizeForecast(raw, new Date().toISOString());
    cache = { expiresAt: now + CACHE_TTL_MS, value };
    return value;
  } catch {
    cache = { expiresAt: now + CACHE_TTL_MS, value: null };
    return null;
  }
}
