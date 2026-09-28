import {
  attach,
  drawChart,
  renderIcon,
  renderText,
  write,
} from "https://cdn.jsdelivr.net/npm/glyphed.js@^2.0.1/+esm";
import { icons as iconLibrary } from "https://cdn.jsdelivr.net/npm/glyphed.js@^2.0.1/icons/+esm";

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

const headings = document.querySelectorAll(".handwritten-heading");
for (const heading of headings) {
  const text = heading.textContent.trim();
  heading.setAttribute("aria-label", text);
  renderAnimated(heading, text, "#171b2e", true);
}

// Heading words are drawn 1em tall; scale the invisible copy text to match so selection lines up.
function fitCopyLayers() {
  for (const heading of headings) {
    const size = parseFloat(getComputedStyle(heading).fontSize);
    heading.style.setProperty("--copy-zoom", String(size / 24));
  }
}
fitCopyLayers();
window.addEventListener("resize", fitCopyLayers);

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

const docsIconGrid = document.querySelector("#docs-icon-grid");
const iconSearch = document.querySelector("#icon-search");
const iconCount = document.querySelector("#icon-count");

function iconExportName(name) {
  return name.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

async function copyIconExample(icon) {
  const exportName = iconExportName(icon.name);
  const code = `import { drawIcon } from "glyphed.js";
import { ${exportName} } from "glyphed.js/icons";

drawIcon("#icon", ${exportName}, {
  size: 48,
  label: "${icon.name}",
});`;
  await copyText(code);
}

function renderIconCatalog(query = "") {
  if (!docsIconGrid) return;
  const normalizedQuery = query.trim().toLowerCase();
  const visibleIcons = Object.values(iconLibrary)
    .sort((first, second) => first.name.localeCompare(second.name))
    .filter((icon) => icon.name.includes(normalizedQuery));

  docsIconGrid.replaceChildren();
  for (const icon of visibleIcons) {
    const button = document.createElement("button");
    button.className = "docs-icon-button";
    button.type = "button";
    button.setAttribute("aria-label", `Copy code for ${icon.name} icon`);
    button.innerHTML = `${renderIcon(icon, { size: 32, label: icon.name, animate: false })}<code>${icon.name}</code><span>Copy code</span>`;
    button.addEventListener("click", async () => {
      await copyIconExample(icon);
      const feedback = button.querySelector("span");
      feedback.textContent = "Copied";
      window.setTimeout(() => {
        feedback.textContent = "Copy code";
      }, 1600);
    });
    docsIconGrid.append(button);
  }

  if (iconCount) {
    iconCount.textContent = `${visibleIcons.length} icon${visibleIcons.length === 1 ? "" : "s"}`;
  }
}

iconSearch?.addEventListener("input", () =>
  renderIconCatalog(iconSearch.value),
);
renderIconCatalog();

const chartPreview = document.querySelector("#chart-preview");
const chartCode = document.querySelector("#chart-code");
const copyChartCode = document.querySelector("#copy-chart-code");
const chartButtons = document.querySelectorAll("[data-chart-type]");

const chartData = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 19 },
  { label: "Wed", value: 15 },
  { label: "Thu", value: 24 },
];

function chartExample(type) {
  return `import { drawChart } from "glyphed.js";

drawChart("#chart", {
  type: "${type}",
  data: [
    { label: "Mon", value: 12 },
    { label: "Tue", value: 19 },
    { label: "Wed", value: 15 },
    { label: "Thu", value: 24 },
  ],
  title: "Weekly activity",
});`;
}

function renderChartExample(type) {
  if (!chartPreview || !chartCode) return;
  drawChart(chartPreview, {
    type,
    data: chartData,
    width: 520,
    height: 270,
    title: "Weekly activity",
    animate: !reduceMotion,
  });
  chartCode.textContent = chartExample(type);
  for (const button of chartButtons) {
    const selected = button.dataset.chartType === type;
    button.setAttribute("aria-selected", String(selected));
  }
}

for (const button of chartButtons) {
  button.addEventListener("click", () =>
    renderChartExample(button.dataset.chartType),
  );
}

copyChartCode?.addEventListener("click", async () => {
  await copyText(chartCode?.textContent ?? "");
  copyChartCode.textContent = "Copied";
  window.setTimeout(() => {
    copyChartCode.textContent = "Copy";
  }, 1600);
});

renderChartExample("bar");
