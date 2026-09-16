interface Shape {
  label: string;
  symbol: string;
}

interface SnapshotCurrent {
  time?: string;
  temperature_2m?: number;
  apparent_temperature?: number;
  relative_humidity_2m?: number;
  precipitation?: number;
  weather_code?: number;
  wind_speed_10m?: number;
}

interface SnapshotDaily {
  time?: string[];
  weather_code?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_probability_max?: number[];
}

interface Snapshot {
  current?: SnapshotCurrent;
  daily?: SnapshotDaily;
}

const endpoint = "https://api.open-meteo.com/v1/forecast";

function describe(code: number | null | undefined): Shape {
  if (code === null || code === undefined) return { label: "情報なし", symbol: "–" };
  if (code === 0 || code === 1) return { label: code === 0 ? "快晴" : "おおむね晴れ", symbol: "☀" };
  if (code === 2) return { label: "晴れ時々くもり", symbol: "🌤" };
  if (code === 3) return { label: "くもり", symbol: "☁" };
  if (code === 45 || code === 48) return { label: "霧", symbol: "🌫" };
  if (code === 51 || code === 53 || code === 55) return { label: "霧雨", symbol: "🌦" };
  if (code === 56 || code === 57) return { label: "凍る霧雨", symbol: "🌧" };
  if (code === 61 || code === 63 || code === 65 || code === 80 || code === 81 || code === 82)
    return { label: "雨", symbol: "☂" };
  if (code === 66 || code === 67) return { label: "凍る雨", symbol: "☂" };
  if (code === 71 || code === 73 || code === 75 || code === 85 || code === 86) return { label: "雪", symbol: "❄" };
  if (code === 77) return { label: "あられ", symbol: "❄" };
  if (code === 95 || code === 96 || code === 99) return { label: "雷雨", symbol: "⛈" };
  return { label: "情報なし", symbol: "–" };
}

function buildUrl(latitude: number, longitude: number, days: number): string {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "Asia/Tokyo",
    forecast_days: String(days)
  });
  return `${endpoint}?${params.toString()}`;
}

function temp(value: number | undefined): string {
  return typeof value === "number" ? `${Math.round(value)}℃` : "—";
}

function percent(value: number | undefined): string {
  return typeof value === "number" ? `${Math.round(value)}%` : "—";
}

function update(root: HTMLElement, snapshot: Snapshot): void {
  const current = snapshot.current;
  const shape = describe(current?.weather_code);

  const set = (field: string, value: string): void => {
    const target = root.querySelector<HTMLElement>(`[data-field="${field}"]`);
    if (target) target.textContent = value;
  };

  const setIn = (scope: Element, field: string, value: string): void => {
    const target = scope.querySelector<HTMLElement>(`[data-field="${field}"]`);
    if (target) target.textContent = value;
  };

  set("current-symbol", shape.symbol);
  set("current-label", shape.label);
  set("current-temp", temp(current?.temperature_2m));
  set("current-apparent", temp(current?.apparent_temperature));
  set("current-humidity", percent(current?.relative_humidity_2m));
  set("current-wind", typeof current?.wind_speed_10m === "number" ? `${current.wind_speed_10m.toFixed(1)} m/s` : "—");
  set(
    "current-precip",
    typeof current?.precipitation === "number" ? `${current.precipitation.toFixed(1)} mm` : "—"
  );

  const days = snapshot.daily;
  if (!days?.time) return;

  days.time.forEach((date, index) => {
    const row = root.querySelector<HTMLElement>(`[data-day="${index}"]`);
    if (!row) return;

    const code = days.weather_code?.[index];
    const rowShape = describe(code);
    const max = days.temperature_2m_max?.[index];
    const min = days.temperature_2m_min?.[index];

    setIn(row, "symbol", rowShape.symbol);
    setIn(row, "desc", rowShape.label);
    setIn(row, "date", String(date).replace(/^\d{4}-/, ""));
    setIn(row, "range", `${temp(max)} ／ ${temp(min)}`);
    setIn(row, "pop", `降水確率 ${percent(days.precipitation_probability_max?.[index])}`);
  });

  const first = root.querySelector<HTMLElement>('[data-day="0"]');
  if (!first) return;

  const pop = days.precipitation_probability_max?.[0] ?? 0;
  if (pop >= 70) {
    set("umbrella-level", "今日の雨具の目安：傘が必須");
    set("umbrella-text", "雨具の上着と滑りにくい靴を用意してください。増水・足元の緩みに注意が必要です。");
  } else if (pop >= 40) {
    set("umbrella-level", "今日の雨具の目安：折りたたみ傘");
    set("umbrella-text", "にわか雨に備えて、たためる傘があると安心です。直前の予報で再確認してください。");
  } else if (pop >= 20) {
    set("umbrella-level", "今日の雨具の目安：念のため携帯");
    set("umbrella-text", "天気は崩れにくい見込みですが、念のため雨具を携帯すると安心です。");
  } else {
    set("umbrella-level", "今日の雨具の目安：傘は不要な見込み");
    set("umbrella-text", "降水の可能性は低めです。日差しと気温差への対策を優先してください。");
  }

  const max = days.temperature_2m_max?.[0];
  if (typeof max === "number") {
    const advice =
      max >= 30
        ? "暑さ対策を最優先に。帽子・飲み物・汗拭きタオルを用意してください。"
        : max >= 24
          ? "半袖で過ごせますが、日差し対策と水分補給を忘れずに。"
          : max >= 17
            ? "薄手の上着があると朝夕も快適です。重ね着が向きます。"
            : max >= 10
              ? "ジャケットやセーターなど、しっかりした上着が必要です。"
              : "防寒着を重ね、冷え込みと路面凍結に備えてください。";
    set("clothing-text", `服装の目安：${advice}`);
  }
}

async function refresh(root: HTMLElement): Promise<void> {
  const lat = Number(root.dataset.lat);
  const lng = Number(root.dataset.lng);
  const days = Number(root.dataset.days ?? 7);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

  try {
    const response = await fetch(buildUrl(lat, lng, days), { cache: "no-store" });
    if (!response.ok) return;
    update(root, (await response.json()) as Snapshot);
  } catch {
    // 通信に失敗した場合はサーバー側で描画した値をそのまま表示する。
  }
}

function refreshAll(): void {
  document.querySelectorAll<HTMLElement>("[data-weather]").forEach((root) => {
    void refresh(root);
  });
}

refreshAll();
setInterval(refreshAll, 30 * 60 * 1000);
