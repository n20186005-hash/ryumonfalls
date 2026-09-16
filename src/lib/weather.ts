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
  uvIndexMax: number | null;
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

/** 傘・レインウェアの目安。一般人にとって意味のある表現に落とし込む。 */
export function umbrellaAdvice(day?: DailyWeather): { level: string; text: string } {
  if (!day) return { level: "情報なし", text: "予報を取得できませんでした。出発前に最新の天気情報をご確認ください。" };

  const pop = day.precipitationProbability ?? 0;
  const amount = day.precipitation ?? 0;

  if (pop >= 70 || amount >= 10) {
    return { level: "傘が必須", text: "雨具の上着と滑りにくい靴を用意してください。増水・足元の緩みに注意が必要です。" };
  }
  if (pop >= 40 || amount >= 3) {
    return { level: "折りたたみ傘", text: "にわか雨に備えて、たためる傘があると安心です。降水の有無は直前の予報で再確認してください。" };
  }
  if (pop >= 20) {
    return { level: "念のため携帯", text: "天気は崩れにくい見込みですが、念のため雨具を携帯すると安心です。" };
  }
  return { level: "傘は不要な見込み", text: "降水の可能性は低めです。日差しと気温差への対策を優先してください。" };
}

/** 気温差にもとづく服装の目安。 */
export function clothingAdvice(max: number | null, min: number | null): string {
  if (max === null) return "服装の目安を算出できませんでした。重ね着を用意しておくと安心です。";
  if (max >= 30) return "暑さ対策を最優先に。帽子・飲み物・汗拭きタオルを用意してください。";
  if (max >= 24) return "半袖で過ごせますが、日差し対策と水分補給を忘れずに。";
  if (max >= 17) return "薄手の上着があると朝夕も快適です。重ね着が向きます。";
  if (max >= 10) return "ジャケットやセーターなど、しっかりした上着が必要です。";
  if (min !== null && min <= 0) return "真冬の装備を。手袋・帽子・滑りにくい冬用の靴が安心です。";
  return "防寒着を重ね、冷え込みと路面凍結に備えてください。";
}

function toWeekday(date: string): string {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  if (!year || !month || !day) return "";
  const utc = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("ja-JP", { weekday: "short", timeZone: "UTC" }).format(utc);
}

interface RawForecast {
  current?: Record<string, number | string | null>;
  daily?: Record<string, Array<number | string | null>>;
}

function num(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalize(raw: RawForecast, updatedAt: string): Forecast {
  const currentRaw = raw.current ?? {};
  const current: CurrentWeather | null = currentRaw.time
    ? {
        time: String(currentRaw.time),
        temperature: num(currentRaw.temperature_2m),
        apparentTemperature: num(currentRaw.apparent_temperature),
        humidity: num(currentRaw.relative_humidity_2m),
        precipitation: num(currentRaw.precipitation),
        windSpeed: num(currentRaw.wind_speed_10m),
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
      uvIndexMax: num(daily.uv_index_max?.[index])
    };
  });

  return { updatedAt, current, days };
}

export function buildEndpoint(latitude: number, longitude: number, forecastDays: number): string {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max",
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
    const value = normalize(raw, new Date().toISOString());
    cache = { expiresAt: now + CACHE_TTL_MS, value };
    return value;
  } catch {
    cache = { expiresAt: now + CACHE_TTL_MS, value: null };
    return null;
  }
}
