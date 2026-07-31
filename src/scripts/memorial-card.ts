type RatioKey = "square" | "postcard" | "story";
type StyleKey = "moss" | "mist" | "sakura";

const sizes: Record<RatioKey, { width: number; height: number; label: string }> = {
  square: { width: 1600, height: 1600, label: "1:1" },
  postcard: { width: 1200, height: 1800, label: "縦長ポストカード" },
  story: { width: 1080, height: 1920, label: "9:16" }
};

const palettes: Record<StyleKey, { bg: string; fg: string; sub: string; line: string; wash: string }> = {
  moss: { bg: "#102f3f", fg: "#fff8e5", sub: "#cfe7de", line: "#caa96a", wash: "rgba(16,47,63,.42)" },
  mist: { bg: "#e6f1ee", fg: "#102f3f", sub: "#315b59", line: "#1f6f67", wash: "rgba(230,241,238,.58)" },
  sakura: { bg: "#f7e6df", fg: "#32272a", sub: "#6f4a4f", line: "#a77d37", wash: "rgba(247,230,223,.55)" }
};

const canvas = document.querySelector<HTMLCanvasElement>("#memorial-canvas");
const photoInputs = document.querySelectorAll<HTMLInputElement>("[data-photo-input]");
const ratioInput = document.querySelector<HTMLSelectElement>("#ratio-input");
const styleInput = document.querySelector<HTMLSelectElement>("#style-input");
const titleInput = document.querySelector<HTMLInputElement>("#title-input");
const dateInput = document.querySelector<HTMLInputElement>("#date-input");
const noteInput = document.querySelector<HTMLInputElement>("#note-input");
const downloadButton = document.querySelector<HTMLButtonElement>("#download-card");
const resetButton = document.querySelector<HTMLButtonElement>("#reset-photo");

let sourceImage = new Image();
sourceImage.src = "/images/ryumon-falls-hero.webp";
sourceImage.decoding = "async";

function todayValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const ratio = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / ratio;
  const sh = h / ratio;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function formatDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${year}.${month}.${day}`;
}

function drawCard() {
  if (!canvas) return;
  const ratio = (ratioInput?.value as RatioKey) || "square";
  const style = (styleInput?.value as StyleKey) || "moss";
  const size = sizes[ratio];
  const palette = palettes[style];
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = size.width;
  canvas.height = size.height;
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, size.width, size.height);

  if (sourceImage.complete && sourceImage.naturalWidth > 0) {
    drawCover(ctx, sourceImage, 0, 0, size.width, size.height);
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, size.height);
  gradient.addColorStop(0, "rgba(0,0,0,.08)");
  gradient.addColorStop(.55, "rgba(0,0,0,.08)");
  gradient.addColorStop(1, style === "mist" ? "rgba(238,246,243,.78)" : "rgba(9,26,32,.78)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size.width, size.height);

  const margin = Math.round(size.width * .055);
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = Math.max(8, size.width * .006);
  roundRect(ctx, margin, margin, size.width - margin * 2, size.height - margin * 2, Math.round(size.width * .04));
  ctx.stroke();

  ctx.fillStyle = palette.wash;
  roundRect(ctx, margin * 1.45, size.height - margin * 3.85, size.width - margin * 2.9, margin * 2.75, Math.round(size.width * .035));
  ctx.fill();

  const title = titleInput?.value.trim() || "龍門の滝";
  const date = formatDate(dateInput?.value || todayValue());
  const note = noteInput?.value.trim() || "水音と列車の余韻を持ち帰る";

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = palette.fg;
  ctx.font = `700 ${Math.round(size.width * .085)}px serif`;
  ctx.fillText(title, margin * 1.85, size.height - margin * 2.35);

  ctx.font = `500 ${Math.round(size.width * .029)}px sans-serif`;
  ctx.fillStyle = palette.sub;
  ctx.fillText(`RYUMON FALLS  /  ${date}`, margin * 1.9, size.height - margin * 1.55);

  ctx.textAlign = "right";
  ctx.font = `500 ${Math.round(size.width * .032)}px serif`;
  ctx.fillStyle = palette.fg;
  ctx.fillText(note, size.width - margin * 1.85, size.height - margin * .92);

  ctx.save();
  ctx.translate(size.width - margin * 1.25, margin * 1.75);
  ctx.rotate(Math.PI / 2);
  ctx.textAlign = "left";
  ctx.font = `700 ${Math.round(size.width * .026)}px sans-serif`;
  ctx.fillStyle = palette.line;
  ctx.fillText("写真は端末内だけで処理", 0, 0);
  ctx.restore();
}

function readFile(file: File) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    sourceImage = img;
    drawCard();
  };
  img.src = url;
}

if (dateInput && !dateInput.value) dateInput.value = todayValue();
sourceImage.onload = drawCard;
[ratioInput, styleInput, titleInput, dateInput, noteInput].forEach((element) => {
  element?.addEventListener("input", drawCard);
  element?.addEventListener("change", drawCard);
});
photoInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) readFile(file);
  });
});
resetButton?.addEventListener("click", () => {
  sourceImage = new Image();
  sourceImage.onload = drawCard;
  sourceImage.src = "/images/ryumon-falls-hero.webp";
  photoInputs.forEach((input) => { input.value = ""; });
});
downloadButton?.addEventListener("click", () => {
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = "ryumon-falls-memorial-card.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

if (sourceImage.complete) drawCard();
