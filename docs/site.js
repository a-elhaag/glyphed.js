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

function renderIconDemo(target) {
  if (!target) return;
  const animate = !reduceMotion;
  target.innerHTML = Object.keys(ICON_VARIANTS)
    .map((name) => renderIconSvg(name))
    .join("");

  if (!animate) return;
  requestAnimationFrame(() => {
    for (const drawnPath of target.querySelectorAll(".hw-letter")) {
      drawnPath.style.strokeDashoffset = "0";
    }
  });
}

const iconDemo = document.querySelector("#icon-demo");
const iconRedraw = document.querySelector("#icon-redraw");
renderIconDemo(iconDemo);
iconRedraw?.addEventListener("click", () => renderIconDemo(iconDemo));

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
