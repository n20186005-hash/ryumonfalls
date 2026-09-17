/**
 * 予報値から「今日どう動けばいいか」を組み立てる。
 *
 * - 条件を満たさない項目は配列に入れない。画面側は配列が空ならそのブロックを出さない。
 * - 専門用語を避け、滝・渓谷を歩く観光客がそのまま行動に移せる表現にする。
 * - 正式な警報・注意報は気象庁の情報が正なので、このモジュールは予報値からの目安だけを扱う。
 */

import { beaufort } from "./format";
import type { CurrentWeather, DailyWeather, Forecast } from "./weather";
import { describeCode } from "./weather";

export interface WeatherAdvice {
  /** 「現在：晴れ 26℃ 最高31／最低19℃ 降水確率20% 風は弱い」の1行まとめ。 */
  summary: string;
  /** 命・行程に関わる注意。高いものから最大3件。 */
  warnings: string[];
  /** 服装の目安。 */
  outfits: string[];
  /** 現地での回り方の目安。 */
  plans: string[];
  /** あると助かる持ちもの。 */
  items: string[];
}

const THUNDER_CODES = [95, 96, 99];
const SNOW_CODES = [71, 73, 75, 77, 85, 86];
const FOG_CODES = [45, 48];
const DRIZZLE_CODES = [51, 53, 55, 56, 57];
const HEAVY_RAIN_CODES = [65, 67, 82];
const RAIN_CODES = [61, 63, 65, 66, 67, 80, 81, 82];

function windLabel(level: number | null): string {
  if (level === null) return "風の情報なし";
  if (level <= 1) return "風はほとんどなし";
  if (level <= 3) return "風は弱め";
  if (level <= 4) return "風あり";
  if (level <= 5) return "風がやや強い";
  if (level <= 6) return "風が強い";
  return "非常に強い風";
}

function uvLabel(uv: number | null): string | null {
  if (typeof uv !== "number" || !Number.isFinite(uv)) return null;
  if (uv >= 8) return "紫外線が非常に強い";
  if (uv >= 6) return "紫外線が強い";
  if (uv >= 3) return "紫外線は中程度";
  return "紫外線は弱い";
}

function rounded(value: number | null, fallback = "—"): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return `${Math.round(value)}`;
}

/** 予報値を1行にまとめる。数値だけの羅列にしないのが狙い。 */
export function summarizeForecast(current: CurrentWeather | null, day: DailyWeather | undefined): string {
  if (!day) return "予報を取得できませんでした。出発前に最新の天気・警報をご確認ください。";

  const parts: string[] = [describeCode(current?.code ?? day.code).label];

  if (typeof current?.temperature === "number") {
    const apparent =
      typeof current.apparentTemperature === "number" ? `（体感 ${rounded(current.apparentTemperature)}℃）` : "";
    parts.push(`${rounded(current.temperature)}℃${apparent}`);
  }

  if (typeof day.max === "number" || typeof day.min === "number") {
    parts.push(`${rounded(day.max)}〜${rounded(day.min)}℃`);
  }

  if (typeof day.precipitationProbability === "number") {
    parts.push(`降水確率 ${rounded(day.precipitationProbability)}%`);
  }

  const uvText = uvLabel(typeof day.uvIndexMax === "number" ? day.uvIndexMax : null);
  if (uvText) parts.push(uvText);

  parts.push(windLabel(beaufort(day.windSpeedMax ?? current?.windSpeed)));

  return `現在：${parts.join("・")}`;
}

/**
 * 当日の予報から提案を組み立てる。
 * 降水確率は「確率」なので断定せず、準備の必要性にだけ使う。
 */
export function buildWeatherAdvice(forecast: Forecast | null): WeatherAdvice | null {
  const day = forecast?.days?.[0];
  if (!forecast || !day) return null;

  const current = forecast.current ?? null;
  const max = day.max;
  const min = day.min;
  const pop = day.precipitationProbability ?? 0;
  const amount = day.precipitation ?? 0;
  const snow = day.snowfall ?? 0;
  const code = day.code;
  const uv = day.uvIndexMax ?? 0;
  const apparentMax = day.apparentTemperatureMax ?? max;
  const apparentMin = day.apparentTemperatureMin ?? min;
  const windLevel = beaufort(day.windSpeedMax ?? current?.windSpeed);
  const gust = day.windGustMax ?? null;
  const range = typeof max === "number" && typeof min === "number" ? max - min : null;

  const isThunder = code !== null && THUNDER_CODES.includes(code);
  const isSnow = (code !== null && SNOW_CODES.includes(code)) || snow > 0;
  const isFog = code !== null && FOG_CODES.includes(code);
  const isDrizzle = code !== null && DRIZZLE_CODES.includes(code);
  const isHeavyRain = (code !== null && HEAVY_RAIN_CODES.includes(code)) || amount >= 15;
  const hasRain = isThunder || isDrizzle || isHeavyRain || (code !== null && RAIN_CODES.includes(code)) || amount > 0;
  const isClear = code === 0 || code === 1 || code === 2;
  const isCloudy = code === 3;
  const isHot = (apparentMax ?? max ?? 0) >= 32 || (max ?? 0) >= 32;
  const isWarm = !isHot && (max ?? 0) >= 27;
  const isCold = (max ?? 99) <= 5 || (apparentMin ?? 99) <= -3;
  const isFreezing = snow > 0 || (min ?? 99) <= 0;

  const warnings: string[] = [];
  const outfits: string[] = [];
  const plans: string[] = [];
  const items: string[] = [];

  // --- もっとも強いリスクから順に並べる -------------------------------------
  if (isThunder) {
    warnings.push(
      "雷のおそれがあります。滝つぼへ下りる階段や開けた水辺、高い木のそばは避け、車か屋内施設へ早めに移れるようにしてください。"
    );
  }

  if (isHeavyRain || (amount >= 8 && pop >= 70) || pop >= 85) {
    warnings.push(
      "まとまった雨で滝の水量が増える見込みです。増水と足元の緩みに注意し、柵やロープの外側へは出ないでください。"
    );
  }

  if (isSnow || (isFreezing && (max ?? 99) <= 8)) {
    warnings.push(
      "凍結・積雪が考えられます。遊歩道や駐車場が滑りやすくなるため、滑り止め付きの靴で、時間に余裕を持って行動してください。"
    );
  }

  if ((windLevel ?? 0) >= 7 || (gust ?? 0) >= 17) {
    warnings.push(
      "非常に強い風が予想されます。倒木・飛来物に注意し、滝つぼへ下りる階段や高所の見晴らし台は控えめにしてください。"
    );
  }

  if ((apparentMax ?? 0) >= 35) {
    warnings.push(
      "体感で猛暑になる時間帯があります。日中の長時間の滞在は避け、早朝か夕方に短く回る計画に見直してください。"
    );
  }

  if (isCold) {
    warnings.push("冷え込みが厳しい予報です。長時間の屋外滞在は体を冷やすので、防寒具を車に積んだうえで短時間ずつ回ってください。");
  }

  // --- 服装 -----------------------------------------------------------------
  if (isHot) {
    outfits.push("通気性の良い軽装が基本。濡れても乾きやすい素材だと水しぶきのあとも快適です。");
  } else if (isWarm) {
    outfits.push("半袖で歩けますが、日差しと水しぶき対策に薄手の羽織りものが一枚あると安心です。");
  } else if ((max ?? 0) >= 20) {
    outfits.push("長袖に軽い上着を合わせる程度で歩けます。朝夕は少し冷えるので調整しやすい服装に。");
  } else if ((max ?? 0) >= 12) {
    outfits.push("ジャケットやセーターなど、しっかりした上着が必要です。");
  } else if ((max ?? 99) < 12) {
    outfits.push("重ね着の上に風を通しにくいアウターを。首元・手先の防寒があると滞在時間が伸びます。");
  }

  if ((max ?? 0) >= 27 && (current?.humidity ?? 0) >= 75) {
    outfits.push("湿度が高く汗が乾きにくい予報です。吸汗・速乾のインナーと汗拭きタオルが快適さを左右します。");
  }

  if (range !== null && range > 8) {
    outfits.push("最高と最低の差が8℃以上あります。脱ぎ着しやすい服装にして、夕方の冷え込みに備えてください。");
  }

  if (isHeavyRain || amount >= 5) {
    outfits.push("上下が濡れても動けるレインウェアと、滑りにくい靴が向きます。傘は視界をふさぐ場面があります。");
  } else if (hasRain || pop >= 60) {
    outfits.push("濡れても乾きやすい靴と、風で反り返りにくい丈夫な傘を用意してください。");
  }

  if (windLevel !== null && windLevel >= 5) {
    outfits.push("風で飛ばされにくい帽子と、まとめられる髪型が無難です。長い傘は風に弱いので避けてください。");
  }

  if (uv >= 5 && (isClear || isCloudy)) {
    outfits.push("つば広の帽子と薄手の長袖で、腕や首の日焼けを抑える格好が向きます。");
  }

  // --- 回り方 ---------------------------------------------------------------
  if (isThunder || isHeavyRain || amount >= 8) {
    plans.push(
      "滝つぼへの階段・渓谷沿いの遊歩道は後回しにし、駐車場から近い展望位置と屋内の休憩・展示スペースを組み合わせる回り方に変更するのが安全です。"
    );
  } else if (hasRain || isDrizzle || pop >= 60) {
    plans.push(
      "降水確率が高い日です（必ず降るわけではありません）。濡れた岩と木道が滑りやすいので、柵の内側だけで見学し、切り上げ時刻を決めておきましょう。"
    );
  } else if (pop >= 30) {
    plans.push("にわか雨の可能性があります。屋内で過ごせる予定を一つ用意しておくと、降られても行程が崩れません。");
  }

  if (isFog) {
    plans.push("霧で滝の全景が隠れやすいコンディションです。水辺ぎわの足元を優先して確認し、運転は視界に余裕を持ってください。");
  } else if (isClear) {
    plans.push(
      "晴れていれば日が差す時間帯に水しぶきへ虹が出やすく、滝の全景もはっきり撮れます。撮影は午前〜昼が狙い目です。"
    );
  } else if (isCloudy) {
    plans.push("光がやわらかく、白い水流の階調が出やすい日和です。長めに歩いても疲れにくく、のんびり見学に向きます。");
  }

  if (isHot) {
    plans.push("日中の滞在は短く区切り、日陰と水分補給をこまめに。朝か夕方の涼しい時間帯に主な見学を寄せるのが快適です。");
  } else if (isWarm && uv >= 6) {
    plans.push("日差しの強い時間帯は日陰の少ない遊歩道がこたえます。こまめな休憩と水分補給を前提に組み立ててください。");
  }

  if (windLevel !== null && windLevel >= 5) {
    plans.push("風で帽子や荷物が飛びやすい日です。滝つぼへ下りる階段や見晴らし台では手すり側を歩き、両手を空けておきましょう。");
  }

  if (snow > 0 || (isSnow && (max ?? 99) <= 5)) {
    plans.push("雪や氷瀑の時期は足場が滑りやすく、つららや落枝にも注意が必要です。無理に水辺へ近づかず、展望位置から楽しんでください。");
  }

  // --- 持ちもの -------------------------------------------------------------
  if (isHeavyRain || amount >= 5 || ((hasRain || pop >= 60) && (windLevel ?? 0) >= 5)) {
    items.push("雨合羽（レインウェア）");
  } else if (hasRain || pop >= 60) {
    items.push("折りたたみ傘");
  } else if (pop >= 30) {
    items.push("念のための雨具");
  }

  if (hasRain || isSnow || isFreezing || pop >= 60) {
    items.push("滑りにくい靴");
  }

  if (isThunder) {
    items.push("車内待機用の上着・飲みもの（雷が収まるまでの待ち時間用）");
  }

  if (uv >= 5) {
    items.push("日焼け止め・サングラス・帽子");
  }

  if (isHot || (isWarm && uv >= 6)) {
    items.push("飲みもの（できれば冷たいものと常温の両方）");
  }

  if ((apparentMax ?? 0) >= 32) {
    items.push("冷却タオル・塩分補給のできるもの");
  }

  if (isCold || isFreezing) {
    items.push("手袋・マフラー・使い捨てカイロ");
  }

  if (snow > 0 || isFreezing) {
    items.push("滑り止め（簡易アイゼンや靴用スパイク）");
  }

  if (!hasRain && pop < 30 && (isClear || isCloudy)) {
    items.push("カメラ・スマホのレンズ拭き（水しぶきで曇りやすいため）");
  }

  return {
    summary: summarizeForecast(current, day),
    warnings: warnings.slice(0, 3),
    outfits: dedupe(outfits),
    plans: dedupe(plans),
    items: dedupe(items)
  };
}

/** 週間予報の各行に添える短いタグ。条件を満たさないものは入れない。 */
export function dailyHints(day: DailyWeather | undefined): string[] {
  if (!day) return [];

  const hints: string[] = [];
  const pop = day.precipitationProbability ?? 0;
  const amount = day.precipitation ?? 0;
  const code = day.code;
  const max = day.max ?? 99;
  const uv = day.uvIndexMax ?? 0;
  const level = beaufort(day.windSpeedMax);

  if (code !== null && THUNDER_CODES.includes(code)) hints.push("雷雨に注意");
  if ((code !== null && SNOW_CODES.includes(code)) || (day.snowfall ?? 0) > 0) hints.push("積雪・凍結");
  if (pop >= 60 || amount >= 3) hints.push("傘が必要");
  else if (pop >= 30) hints.push("念のため雨具");

  if ((day.apparentTemperatureMax ?? max) >= 35) hints.push("猛暑");
  else if (max >= 32) hints.push("暑さ対策");
  else if (max <= 5) hints.push("厳しい冷え込み");

  if (uv >= 6) hints.push("紫外線が強い");
  if ((level ?? 0) >= 5) hints.push("風が強い");
  if (code !== null && FOG_CODES.includes(code)) hints.push("霧");
  if (hints.length === 0 && pop < 20 && amount < 1) hints.push("傘は不要な見込み");

  return dedupe(hints).slice(0, 2);
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}
