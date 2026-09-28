// Icons, annotations, and charts. Loaded separately from site.js so the rest of the showcase keeps
// working against older published versions. Add `?local` to the URL to use the repo's own ../dist build.
const local = new URLSearchParams(location.search).has("local");
const base = local
  ? "../dist/"
  : "https://cdn.jsdelivr.net/npm/glyphed.js@^1.1.0/dist/";
const suffix = local ? "" : "/+esm";

const [{ annotate, attach, renderChart, renderIcon, renderSparkline, renderText }, { icons }] =
  await Promise.all([
    import(`${base}index.js${suffix}`),
    import(`${base}icons/index.js${suffix}`),
  ]);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const animate = !reduceMotion;

const showcase = [
  "heart", "star", "rocket", "sparkle", "bulb", "coffee", "sun", "moon",
  "cloud", "bolt", "flame", "leaf", "home", "search", "mail", "bell",
  "calendar", "clock", "camera", "music", "globe", "pin", "gift", "smile",
  "code", "terminal", "edit", "trash", "lock", "eye", "link", "send",
  "check", "x", "arrow-right", "refresh", "download", "trending-up", "bar-chart", "pie-chart",
];

const grid = document.querySelector("#icon-grid");
function drawIcons() {
  if (!grid) return;
  grid.innerHTML = showcase
    .filter((name) => icons[name])
    .map(
      (name, i) =>
        `<div class="icon-cell">${renderIcon(icons[name], { size: 44, animate, delay: (i % 8) * 80, label: name })}<code>${name}</code></div>`,
    )
    .join("");
  if (animate) attach(grid);
}

const marks = [];
function drawMarks() {
  for (const mark of marks.splice(0)) mark.remove();
  document.querySelectorAll("[data-mark]").forEach((el, i) => {
    marks.push(annotate(el, { type: el.dataset.mark, animate, delay: 300 + i * 350 }));
  });

  const inline = document.querySelector("#inline-sample");
  if (inline) {
    inline.innerHTML =
      renderText("Ship it :rocket: with :heart:", { animate, icons }) +
      " " +
      renderSparkline([3, 4, 3, 6, 5, 8, 11], { animate, delay: 900, color: "#077d62", label: "Rising trend" });
    if (animate) attach(inline);
  }
}

function drawCharts() {
  const bar = document.querySelector("#bar-chart");
  if (bar) {
    bar.innerHTML = renderChart({
      type: "bar",
      color: "#2458be",
      data: [
        { label: "Mon", value: 12 },
        { label: "Tue", value: 19 },
        { label: "Wed", value: 7 },
        { label: "Thu", value: 15 },
        { label: "Fri", value: 22 },
      ],
      title: "Commits per weekday",
      animate,
    });
    if (animate) attach(bar);
  }

  const donut = document.querySelector("#donut-chart");
  if (donut) {
    donut.innerHTML = renderChart({
      type: "donut",
      data: [
        { label: "Design", value: 35 },
        { label: "Code", value: 40 },
        { label: "Docs", value: 15 },
        { label: "Coffee", value: 10 },
      ],
      title: "Where the week went",
      animate,
    });
    if (animate) attach(donut);
  }
}

function drawAll() {
  drawIcons();
  drawMarks();
  drawCharts();
}

document.querySelector("#redraw-marks")?.addEventListener("click", drawAll);
drawAll();
