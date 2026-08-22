import {
  attach,
  renderText,
  write,
} from "https://cdn.jsdelivr.net/npm/glyphed.js/+esm";

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
if (hero) renderAnimated(hero, "glyphed.js", "#c63d24", !reduceMotion);

for (const wordmark of document.querySelectorAll(".wordmark")) {
  renderAnimated(wordmark, "glyphed.js", "#171b2e", !reduceMotion);
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
