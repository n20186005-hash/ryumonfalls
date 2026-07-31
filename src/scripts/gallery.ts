const triggers = document.querySelectorAll<HTMLButtonElement>("[data-gallery-trigger]");
const lightbox = document.querySelector<HTMLElement>("[data-lightbox]");
const image = document.querySelector<HTMLImageElement>("[data-lightbox-image]");
const title = document.querySelector<HTMLElement>("[data-lightbox-title]");
const caption = document.querySelector<HTMLElement>("[data-lightbox-text]");
const closeButton = document.querySelector<HTMLButtonElement>("[data-lightbox-close]");

function openLightbox(button: HTMLButtonElement) {
  if (!lightbox || !image || !title || !caption) return;
  const src = button.dataset.src ?? "";
  const label = button.dataset.title ?? "龍門の滝";
  const text = button.dataset.caption ?? "";
  image.src = src;
  image.alt = label;
  title.textContent = label;
  caption.textContent = text;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox || !image) return;
  lightbox.hidden = true;
  image.removeAttribute("src");
  document.body.style.overflow = "";
}

triggers.forEach((button) => button.addEventListener("click", () => openLightbox(button)));
closeButton?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});
