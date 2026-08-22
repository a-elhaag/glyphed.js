import {
  attach,
  renderText,
  write,
} from "https://cdn.jsdelivr.net/npm/strokes-js@0.2.3/+esm";

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function renderAnimated(target, text, color, animate) {
  target.style.setProperty("--hw-color", color);
  target.innerHTML = renderText(text, { animate });

  if (animate) {
    attach(target);
  }
}

const hero = document.querySelector("#hero-writing");
if (hero) renderAnimated(hero, "strokes.js", "#c63d24", !reduceMotion);

for (const wordmark of document.querySelectorAll(".wordmark")) {
  renderAnimated(wordmark, "strokes.js", "#171b2e", !reduceMotion);
}

for (const heading of document.querySelectorAll(".handwritten-heading")) {
  const text = heading.textContent.trim();
  heading.setAttribute("aria-label", text);
  renderAnimated(heading, text, "#171b2e", true);
}

const preview = document.querySelector("#writing-preview");
const input = document.querySelector("#writing-input");
const animation = document.querySelector("#animation-toggle");
const redraw = document.querySelector("#redraw");
const swatches = document.querySelectorAll(".swatch");
let ink = "#171b2e";

function redrawPreview() {
  if (!preview || !input || !animation) return;
  renderAnimated(
    preview,
    input.value || " ",
    ink,
    animation.checked && !reduceMotion,
  );
}

for (const swatch of swatches) {
  swatch.addEventListener("click", () => {
    ink = swatch.dataset.color;
    for (const button of swatches)
      button.classList.toggle("is-selected", button === swatch);
    redrawPreview();
  });
}

input?.addEventListener("input", redrawPreview);
animation?.addEventListener("change", redrawPreview);
redraw?.addEventListener("click", redrawPreview);
redrawPreview();

const specimens = document.querySelector("#specimens");
if (specimens) {
  const samples = [
    ["Aa", "#c63d24"],
    ["Bb", "#2458be"],
    ["12", "#077d62"],
    ["?!", "#171b2e"],
  ];

  for (const [text, color] of samples) {
    const sample = document.createElement("div");
    sample.className = "specimen";
    renderAnimated(sample, text, color, !reduceMotion);
    specimens.append(sample);
  }
}

const docsDemo = document.querySelector("#docs-demo");
if (docsDemo) write(docsDemo, "Hello, world!", { animate: !reduceMotion });

const glyphSets = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  punctuation: ".,!?'-&()—\"`{}[]*=+@:",
};
const glyphGrid = document.querySelector("#glyph-grid");
const glyphCount = document.querySelector("#glyph-count");
const glyphFilters = document.querySelectorAll(".glyph-filter");

function glyphsFor(set) {
  return set === "all" ? Object.values(glyphSets).join("") : glyphSets[set];
}

function renderGlyphs(set = "all") {
  if (!glyphGrid || !glyphCount) return;
  const characters = glyphsFor(set);
  glyphGrid.replaceChildren();

  for (const character of characters) {
    const tile = document.createElement("div");
    tile.className = "glyph-tile";
    tile.setAttribute("aria-label", `Glyph ${character}`);

    const label = document.createElement("span");
    label.className = "glyph-label";
    label.textContent = character;

    const drawing = document.createElement("div");
    drawing.className = "glyph-drawing";
    renderAnimated(drawing, character, "#171b2e", false);

    tile.append(label, drawing);
    glyphGrid.append(tile);
  }

  glyphCount.textContent = `${characters.length} glyphs`;
}

for (const filter of glyphFilters) {
  filter.addEventListener("click", () => {
    for (const button of glyphFilters)
      button.classList.toggle("is-active", button === filter);
    renderGlyphs(filter.dataset.glyphSet);
  });
}

renderGlyphs();

const variationSamples = document.querySelector("#variation-samples");
const rerollVariations = document.querySelector("#reroll-variations");

function renderVariations() {
  if (!variationSamples) return;
  variationSamples.replaceChildren();

  for (const color of ["#c63d24", "#2458be", "#077d62"]) {
    const sample = document.createElement("div");
    sample.className = "variation-sample";
    renderAnimated(sample, "Human", color, false);
    variationSamples.append(sample);
  }
}

rerollVariations?.addEventListener("click", renderVariations);
renderVariations();

// Preview of the unreleased renderIcon() API — mirrors src/icons/*.ts and
// src/icon-renderer.ts. Swap for the real import once it ships on npm.
const ICON_VARIANTS = {
  check: [
    "M6 17 C 8 19.5 11 22.5 13 24 C 17 18 21.5 12.5 26 8",
    "M6.3 16.7 C 8.7 19 11.4 22.1 12.8 24.3 C 16.6 18.6 21.8 12.8 25.7 8.3",
    "M5.7 17.4 C 7.8 20.1 10.6 22.7 13.3 23.6 C 17.3 17.6 21.2 12.1 26.3 7.7",
  ],
  x: [
    "M7 7 C 13 13 19 19 25 25 M25 7 C 19 13 13 19 7 25",
    "M6.8 7.3 C 13.2 12.7 19.4 18.6 25.2 24.8 M25.3 6.9 C 19.1 12.9 13.4 18.7 7.1 25.2",
    "M7.3 6.8 C 13.4 13.4 19.1 19.2 24.8 25.1 M24.7 7.2 C 18.7 13.1 12.9 19.3 6.9 24.9",
  ],
  plus: [
    "M16 6 C 15.5 13 16.5 20 16 26 M6 16 C 13 15.5 20 16.5 26 16",
    "M15.8 6.2 C 15.2 12.9 16.7 19.8 16.2 25.7 M6.2 16.3 C 13.3 15.2 19.8 16.8 25.8 15.8",
    "M16.2 5.8 C 16.6 13.1 15.4 19.9 15.8 26.2 M5.8 15.7 C 12.9 16.4 19.9 15.3 26.2 16.2",
  ],
  minus: [
    "M6 16 C 13 15.3 20 16.7 26 16",
    "M6.2 15.8 C 13.3 16.4 19.7 15.4 25.8 16.3",
    "M5.8 16.3 C 12.9 15.6 20.2 16.3 26.2 15.7",
  ],
  "arrow-right": [
    "M6 16 C 13 15.5 19 16.5 24 16 M17 9 C 19.5 11.5 23 13.5 25.5 16 M25.5 16 C 23 18.5 19.5 20.5 17 23",
    "M6.2 16.3 C 13.2 15.2 18.8 16.7 23.8 15.8 M16.8 8.8 C 19.7 11.3 23.2 13.7 25.3 16.2 M25.3 15.8 C 22.8 18.7 19.3 20.8 17.2 23.2",
    "M5.8 15.7 C 12.9 16.4 19.2 15.3 24.2 16.2 M17.2 9.2 C 19.3 11.7 22.8 13.3 25.7 15.8 M25.7 16.2 C 23.2 18.3 19.7 20.2 16.8 22.8",
  ],
  "arrow-left": [
    "M26 16 C 19 15.5 13 16.5 8 16 M15 9 C 12.5 11.5 9 13.5 6.5 16 M6.5 16 C 9 18.5 12.5 20.5 15 23",
    "M25.8 16.3 C 18.8 15.2 13.2 16.7 8.2 15.8 M15.2 8.8 C 12.3 11.3 8.8 13.7 6.7 16.2 M6.7 15.8 C 9.2 18.7 12.7 20.8 14.8 23.2",
    "M26.2 15.7 C 19.1 16.4 12.8 15.3 7.8 16.2 M14.8 9.2 C 12.7 11.7 9.2 13.3 6.3 15.8 M6.3 16.2 C 8.8 18.3 12.3 20.2 15.2 22.8",
  ],
  "arrow-up": [
    "M16 26 C 15.5 19 16.5 13 16 8 M9 15 C 11.5 12.5 13.5 9 16 6.5 M16 6.5 C 18.5 9 20.5 12.5 23 15",
    "M15.8 25.8 C 15.2 18.8 16.7 12.8 16.2 8.2 M8.8 15.2 C 11.3 12.7 13.7 9.2 16.2 6.7 M15.8 6.7 C 18.7 9.2 20.8 12.7 23.2 14.8",
    "M16.2 26.2 C 16.6 19.1 15.4 12.8 15.8 7.8 M9.2 14.8 C 11.7 12.7 13.3 9.2 15.8 6.3 M16.2 6.3 C 18.3 8.8 20.2 12.3 22.8 15.2",
  ],
  "arrow-down": [
    "M16 6 C 16.5 13 15.5 19 16 24 M9 17 C 11.5 19.5 13.5 23 16 25.5 M16 25.5 C 18.5 23 20.5 19.5 23 17",
    "M15.8 6.2 C 16.3 13.2 14.8 19.2 15.3 23.8 M8.8 16.8 C 11.3 19.3 13.7 22.8 16.2 25.3 M15.8 25.3 C 18.7 22.8 20.8 19.3 23.2 17.2",
    "M16.2 5.8 C 16.6 12.9 15.3 19.2 15.7 24.2 M9.2 17.2 C 11.7 19.3 13.3 22.8 15.8 25.7 M16.2 25.7 C 18.3 23.2 20.2 19.7 22.8 16.8",
  ],
  "chevron-down": [
    "M8 12 C 10.5 15.5 13.5 18.5 16 21 C 18.5 18.5 21.5 15.5 24 12",
    "M7.8 12.3 C 10.3 15.7 13.7 18.3 16.2 21.2 C 18.3 18.3 21.2 15.7 24.2 11.8",
    "M8.2 11.7 C 10.7 15.3 13.3 18.7 15.8 20.8 C 18.7 18.7 21.7 15.3 23.8 12.2",
  ],
  search: [
    "M20 13 C 20 9.5 17.5 6.5 13.5 6.5 C 9.5 6.5 7 10 7 13.5 C 7 17.5 9.5 20.5 13.5 20.5 C 17 20.5 20 17.5 20 13 M19 19 C 21 21 23.5 23.5 25.5 25.5",
    "M20.2 12.8 C 20.1 9.3 17.6 6.7 13.7 6.3 C 9.6 6.6 6.8 9.8 7.2 13.3 C 6.9 17.6 9.6 20.7 13.6 20.7 C 17.2 20.3 20.2 17.7 19.8 13.2 M18.8 19.2 C 20.8 21.3 23.7 23.3 25.7 25.8",
    "M19.8 13.2 C 19.9 9.7 17.4 6.3 13.3 6.7 C 9.4 6.4 7.2 10.2 6.8 13.7 C 7.1 17.4 9.4 20.3 13.4 20.3 C 16.8 20.7 19.8 17.3 20.2 13.8 M19.2 18.8 C 21.2 20.7 23.3 23.7 25.3 25.2",
  ],
  heart: [
    "M16 25 C 6 17 4 10 9 7 C 13 5 16 9 16 12 C 16 9 19 5 23 7 C 28 10 26 17 16 25",
    "M16.2 24.8 C 6.3 16.8 3.8 10.3 8.8 6.8 C 13.2 5.3 16.3 9.2 15.8 12.2 C 16.3 8.8 19.3 4.8 23.2 6.8 C 27.8 9.8 26.3 17.3 15.8 25.2",
    "M15.8 25.2 C 5.8 17.2 4.2 9.8 9.2 7.2 C 12.8 4.7 16.3 8.8 16.2 11.8 C 15.7 9.2 18.7 5.2 22.8 7.2 C 28.2 10.2 25.7 16.7 16.2 24.8",
  ],
  email: [
    "M6 9 L26 9 L26 23 L6 23 L6 9 M6 9 L16 17 L26 9",
    "M6.2 8.8 L26.2 9.2 L25.8 23.2 L5.8 22.8 L6.2 8.8 M6.2 9.2 L16.2 16.8 L25.8 8.8",
    "M5.8 9.2 L25.8 8.8 L26.2 22.8 L6.2 23.2 L5.8 9.2 M5.8 8.8 L15.8 17.2 L26.2 9.2",
  ],
  github: [
    "M9 7 C 7 9 6 12 6 15 C 6 20 9 24 16 25 C 23 24 26 20 26 15 C 26 12 25 9 23 7 C 21 8 19 6 16 6 C 13 6 11 8 9 7 M11 25 C 10 27 9 28 9 29 M21 25 C 22 27 23 28 23 29",
    "M8.8 7.2 C 6.8 9.2 5.8 12.2 6.2 15.2 C 5.8 20.2 9.2 24.2 16.2 25.2 C 23.2 23.8 26.2 19.8 25.8 14.8 C 26.2 11.8 24.8 8.8 22.8 6.8 C 20.8 8.2 19.2 5.8 16.2 5.8 C 12.8 6.2 11.2 8.2 8.8 7.2 M11.2 25.2 C 9.8 27.2 8.8 28.2 9.2 29.2 M20.8 24.8 C 22.2 26.8 23.2 27.8 22.8 28.8",
    "M9.2 6.8 C 7.2 8.8 6.2 11.8 5.8 14.8 C 6.2 19.8 8.8 23.8 15.8 24.8 C 22.8 24.2 25.8 20.2 26.2 15.2 C 25.8 12.2 25.2 9.2 23.2 7.2 C 21.2 7.8 18.8 6.2 15.8 6.2 C 13.2 5.8 10.8 7.8 9.2 6.8 M10.8 24.8 C 10.2 26.8 9.2 27.8 8.8 28.8 M21.2 25.2 C 21.8 27.2 22.8 28.2 23.2 29.2",
  ],
  circle: [
    "M23 16 C 23 11.5 19.5 8 15.5 8 C 11 8 8 11.5 8 16 C 8 20.5 11 24 15.5 24 C 19.5 24 23 20 23 16",
    "M23.2 15.8 C 23.1 11.3 19.6 7.7 15.7 7.6 C 11.6 7.9 7.8 11.6 8.2 16.3 C 7.9 20.6 11.6 23.8 15.6 23.7 C 19.2 23.4 23.2 20.2 22.8 15.7",
    "M22.8 16.2 C 22.9 11.7 19.4 8.3 15.3 8.4 C 11.4 8.1 8.2 11.4 7.8 15.7 C 8.1 20.4 11.4 24.3 15.4 24.3 C 19.8 24.6 22.8 19.8 23.2 16.3",
  ],
  bell: [
    "M16 6 C 12 6 10 9.5 10 14 C 10 19 8 21 8 22 L24 22 C 24 21 22 19 22 14 C 22 9.5 20 6 16 6 M13.5 24 C 14 25.5 15 26.5 16 26.5 C 17 26.5 18 25.5 18.5 24",
    "M16.2 5.8 C 12.2 6.2 9.8 9.7 10.2 14.2 C 9.8 19.2 7.8 20.8 8.2 22.2 L24.2 21.8 C 23.8 20.8 21.8 19.2 22.2 14.2 C 21.8 9.7 19.8 5.8 16.2 5.8 M13.3 24.2 C 13.8 25.7 14.8 26.3 16.2 26.7 C 17.2 26.3 18.2 25.7 18.7 23.8",
    "M15.8 6.2 C 11.8 5.8 10.2 9.3 9.8 13.8 C 10.2 18.8 8.2 21.2 7.8 21.8 L23.8 22.2 C 24.2 21.2 22.2 18.8 21.8 13.8 C 22.2 9.3 20.2 6.2 15.8 6.2 M13.7 23.8 C 14.2 25.3 15.2 26.7 15.8 26.3 C 16.8 26.7 17.8 25.3 18.3 24.2",
  ],
  trash: [
    "M9 11 L23 11 M13 8 L19 8 M11 11 L12 26 L20 26 L21 11",
    "M8.8 11.2 L23.2 10.8 M13.2 7.8 L18.8 8.2 M11.2 10.8 L12.2 26.2 L19.8 25.8 L20.8 11.2",
    "M9.2 10.8 L22.8 11.2 M12.8 8.2 L19.2 7.8 M10.8 11.2 L11.8 25.8 L20.2 26.2 L21.2 10.8",
  ],
};

function renderIconSvg(name) {
  const variants = ICON_VARIANTS[name];
  const path = variants[Math.floor(Math.random() * variants.length)];
  const animate = !reduceMotion;
  const style = animate
    ? "stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 400ms ease;"
    : "";

  const rotate = (Math.random() * 2 - 1) * 7;
  const dy = (Math.random() * 2 - 1) * 1;
  const scale = 1 + (Math.random() * 2 - 1) * 0.1;
  const transform =
    `translate(0 ${dy.toFixed(2)}) translate(16 16) ` +
    `rotate(${rotate.toFixed(1)}) scale(${scale.toFixed(3)}) translate(-16 -16)`;

  return (
    `<svg class="hw-icon" width="48" height="48" viewBox="0 0 32 32" aria-hidden="true" role="img">` +
    `<path d="${path}" transform="${transform}" stroke="var(--hw-color, #171b2e)" fill="none" ` +
    `stroke-width="2" stroke-linecap="round" pathLength="1" style="${style}" class="hw-letter" /></svg>`
  );
}

function renderIconDemo(target, name) {
  if (!target) return;
  target.innerHTML = renderIconSvg(name);

  if (reduceMotion) return;
  requestAnimationFrame(() => {
    const drawnPath = target.querySelector(".hw-letter");
    if (drawnPath) drawnPath.style.strokeDashoffset = "0";
  });
}

const iconDemo = document.querySelector("#icon-demo");
const iconRedraw = document.querySelector("#icon-redraw");
const iconSelect = document.querySelector("#icon-select");

if (iconSelect) {
  for (const name of Object.keys(ICON_VARIANTS)) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    iconSelect.append(option);
  }
}

iconSelect?.addEventListener("change", () =>
  renderIconDemo(iconDemo, iconSelect.value),
);
iconRedraw?.addEventListener("click", () =>
  renderIconDemo(iconDemo, iconSelect?.value ?? "check"),
);
renderIconDemo(iconDemo, iconSelect?.value ?? "check");

const iconNameList = document.querySelector("#icon-name-list");
if (iconNameList) {
  iconNameList.innerHTML = Object.keys(ICON_VARIANTS)
    .map((name) => `<code>${name}</code>`)
    .join(", ");
}

async function copyText(text) {
  try {
    await navigator.clipboard?.writeText(text);
    if (navigator.clipboard?.writeText) return;
  } catch {
    // Use the document fallback when browser clipboard permissions are unavailable.
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function addCopyButton(target, text) {
  const button = document.createElement("button");
  button.className = "copy-button";
  button.type = "button";
  button.textContent = "Copy";
  button.addEventListener("click", async () => {
    await copyText(text);
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = "Copy";
    }, 1600);
  });
  target.append(button);
}

for (const command of document.querySelectorAll(".copy-command")) {
  command.addEventListener("click", async () => {
    await copyText(command.dataset.copy);
    const label = command.querySelector("span");
    label.textContent = "Copied";
    window.setTimeout(() => {
      label.textContent = "Copy";
    }, 1600);
  });
}

for (const block of document.querySelectorAll("pre[data-copy]")) {
  addCopyButton(block, block.textContent.trim());
}
