import { rngFor, type Rng } from "./engine/random.js";
import { sketch } from "./engine/sketch.js";
import { arcTo, circle, curve, hatch, line, poly, polar, rect, type Point } from "./engine/shapes.js";
import { DRAW_CLASS, STAGGER_MS, escapeAttr, escapeText, fmt, strokePath } from "./engine/stroke.js";
import { attach, type AttachOptions } from "./observer.js";
import { LETTER_HEIGHT, layoutLine } from "./renderer.js";

export interface ChartDatum {
  label: string;
  value: number;
  /** Overrides the series / palette color for this one mark. */
  color?: string;
}

export interface ChartOptions {
  type: "bar" | "line" | "pie" | "donut";
  /** Non-negative values. Pie and donut fold anything past the palette length into "Other". */
  data: ChartDatum[];
  width?: number;
  height?: number;
  /** Mark color for bar and line charts (one series, one color). Default `var(--hw-color, #000)`. */
  color?: string;
  /** Categorical colors for pie and donut slices, assigned in order. Default `chartPalette`. */
  colors?: string[];
  /** Hatched shading inside bars, slices, and under lines (default), or outlines only. */
  fill?: "hatch" | "none";
  /** How values print in labels. Stick to characters glyphed.js can draw (digits, `. , - + :`, letters). */
  format?: (value: number) => string;
  /** Accessible name. Defaults to a summary of the data. */
  title?: string;
  animate?: boolean;
  roughness?: number;
  seed?: number;
  /** Show a dot where each stroke will start before it draws (default false: strokes stay hidden until their turn). */
  dots?: boolean;
}

/** Colorblind-checked categorical order (validated against the paper surface). */
export const chartPalette = ["#2458be", "#c63d24", "#077d62", "#8a4fb8", "#b06f00", "#0a7fa8"];

const INK = "var(--hw-color, #000)";
const LABEL_SCALE = 0.5;
const VALUE_SCALE = 0.42;
const AXIS_MS = 700;
const MARK_MS = 500;
const HATCH_MS = 900;

let clipCounter = 0;

/** Everything one chart render shares: the pen, the clock, and the output buffer. */
class Canvas {
  readonly parts: string[] = [];
  readonly defs: string[] = [];
  /** ms at which the next stroke starts. */
  clock = 0;

  constructor(
    readonly rng: Rng,
    readonly animate: boolean,
    readonly roughness: number,
    readonly dots: boolean,
  ) {}

  stroke(d: string, opts: { color?: string; width?: number; duration?: number; opacity?: number; roughness?: number; advance?: number } = {}) {
    const duration = opts.duration ?? MARK_MS;
    const markup = strokePath({
      d: sketch(d, this.rng, { roughness: opts.roughness ?? this.roughness }),
      animate: this.animate,
      dots: this.dots,
      delay: this.clock,
      duration,
      color: opts.color ?? INK,
      width: opts.width ?? 2,
      opacity: opts.opacity,
      className: "hw-chart-stroke",
    });
    this.clock += opts.advance ?? duration * 0.35;
    return markup;
  }

  /** Hatch lines clipped to `shape` — one path, so it shades in as a single zig-zag stroke. */
  hatch(shape: string, box: [number, number, number, number], color: string, deg: number, gap = 4.5) {
    const id = `hw-clip-${++clipCounter}`;
    this.defs.push(`<clipPath id="${id}"><path d="${shape}" /></clipPath>`);
    const d = hatch(...box, gap, deg);
    const markup = this.stroke(d, { color, width: 1.3, duration: HATCH_MS, opacity: 0.75, roughness: this.roughness * 0.6, advance: 90 });
    return `<g clip-path="url(#${id})">${markup}</g>`;
  }

  /** Handwritten label. `y` is the vertical center of the text. */
  text(value: string, x: number, y: number, anchor: "start" | "middle" | "end", scale = LABEL_SCALE, maxWidth = Infinity) {
    const layout = layoutLine(value, { delayOffset: this.clock / STAGGER_MS, animate: this.animate, dots: this.dots });
    const s = Math.min(scale, maxWidth / Math.max(layout.width, 1));
    const w = layout.width * s;
    const left = anchor === "start" ? x : anchor === "middle" ? x - w / 2 : x - w;
    this.clock += layout.count * STAGGER_MS * 0.5;
    return `<g class="hw-chart-label" transform="translate(${fmt(left)} ${fmt(y - (LETTER_HEIGHT * s) / 2)}) scale(${fmt(s)})">${layout.paths}</g>`;
  }
}

function hitArea(shape: string, tip: string, marks: string): string {
  return `<g class="hw-chart-mark"><title>${escapeText(tip)}</title><path d="${shape}" fill="transparent" stroke="none" />${marks}</g>`;
}

function barChart(c: Canvas, data: ChartDatum[], w: number, h: number, o: Required<Pick<ChartOptions, "color" | "fill" | "format">>) {
  const [left, right, top, bottom] = [14, w - 14, 26, h - 30];
  const max = Math.max(...data.map((d) => d.value), 0) || 1;
  const slot = (right - left) / data.length;
  const barW = Math.min(slot * 0.62, 64);

  c.parts.push(c.stroke(line(left - 6, bottom, right + 6, bottom), { duration: AXIS_MS }));

  data.forEach((d, i) => {
    const cx = left + slot * (i + 0.5);
    const x = cx - barW / 2;
    const barTop = bottom - (Math.max(d.value, 0) / max) * (bottom - top);
    const color = d.color ?? o.color;
    const outline = rect(x, barTop, barW, bottom - barTop);
    const marks = [c.stroke(poly([[x, bottom], [x, barTop], [x + barW, barTop], [x + barW, bottom]]), { color })];
    if (o.fill === "hatch" && bottom - barTop > 3) {
      marks.push(c.hatch(outline, [x, barTop, barW, bottom - barTop], color, 45));
    }
    marks.push(c.text(o.format(d.value), cx, barTop - 10, "middle", VALUE_SCALE, slot - 4));
    marks.push(c.text(d.label, cx, bottom + 15, "middle", LABEL_SCALE, slot - 4));
    c.parts.push(hitArea(rect(x - 4, top - 20, barW + 8, bottom - top + 44), `${d.label}: ${o.format(d.value)}`, marks.join("")));
  });
}

function lineChart(c: Canvas, data: ChartDatum[], w: number, h: number, o: Required<Pick<ChartOptions, "color" | "fill" | "format">>) {
  const [left, right, top, bottom] = [22, w - 22, 26, h - 30];
  const values = data.map((d) => Math.max(d.value, 0));
  const max = Math.max(...values, 0) || 1;
  const step = data.length > 1 ? (right - left) / (data.length - 1) : 0;
  const points: Point[] = values.map((v, i) => [left + step * i, bottom - (v / max) * (bottom - top)]);

  c.parts.push(c.stroke(line(left - 10, bottom, right + 10, bottom), { duration: AXIS_MS }));
  c.parts.push(c.stroke(line(left - 10, bottom, left - 10, top - 8), { duration: AXIS_MS }));
  if (points.length === 0) return;

  // Low tension: a data line should pass through its points, not swing past them.
  const path = curve(points, false, 0.45);
  // Pen draws the line first, then shades under it; shading sits beneath the line in the markup.
  const trend = c.stroke(path, { color: o.color, duration: 400 + data.length * 120, roughness: c.roughness * 0.7 });
  if (o.fill === "hatch" && points.length > 1) {
    const area = `${path} L${fmt(right)} ${fmt(bottom)} L${fmt(left)} ${fmt(bottom)} Z`;
    c.parts.push(c.hatch(area, [left, top, right - left, bottom - top], o.color, 135, 5.5));
  }
  c.parts.push(trend);

  // Direct labels only where they earn it: first, last, and the peak.
  const peak = values.indexOf(Math.max(...values));
  const labelled = new Set([0, data.length - 1, peak]);
  const every = Math.ceil(data.length / Math.max(1, Math.floor((right - left) / 44)));

  data.forEach((d, i) => {
    const [px, py] = points[i];
    const marks = [c.stroke(circle(px, py, 3.2), { color: o.color, duration: 200, advance: 40 })];
    if (labelled.has(i)) marks.push(c.text(o.format(d.value), px, py - 13, "middle", VALUE_SCALE));
    if (i % every === 0 || i === data.length - 1) marks.push(c.text(d.label, px, bottom + 15, "middle", LABEL_SCALE, Math.max(step, 40) - 4));
    c.parts.push(hitArea(rect(px - 10, top - 20, 20, bottom - top + 44), `${d.label}: ${o.format(d.value)}`, marks.join("")));
  });
}

function pieChart(c: Canvas, data: ChartDatum[], w: number, h: number, donut: boolean, colors: string[], o: Required<Pick<ChartOptions, "fill" | "format">>) {
  const total = data.reduce((sum, d) => sum + Math.max(d.value, 0), 0) || 1;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.max(20, Math.min(h / 2 - 22, w / 2 - 84));
  const inner = donut ? r * 0.55 : 0;
  let angle = -90;

  data.forEach((d, i) => {
    const sweep = (Math.max(d.value, 0) / total) * 360;
    if (sweep <= 0) return;
    const a0 = angle;
    const a1 = angle + sweep;
    angle = a1;
    const color = d.color ?? colors[i] ?? INK;
    const [sx, sy] = polar(cx, cy, r, r, a0);
    let shape: string;
    if (donut) {
      const [ix, iy] = polar(cx, cy, inner, inner, a1);
      shape = `M${fmt(sx)} ${fmt(sy)}${arcTo(cx, cy, r, r, a0, a1)} L${fmt(ix)} ${fmt(iy)}${arcTo(cx, cy, inner, inner, a1, a0)} Z`;
    } else {
      shape = sweep >= 359.9 ? circle(cx, cy, r, a0) : `M${fmt(cx)} ${fmt(cy)} L${fmt(sx)} ${fmt(sy)}${arcTo(cx, cy, r, r, a0, a1)} Z`;
    }

    const marks = [c.stroke(shape, { color, duration: 350 + sweep * 2 })];
    if (o.fill === "hatch") {
      // Alternate hatch direction as a second cue beside color, so neighbours read apart without it.
      marks.push(c.hatch(shape, [cx - r, cy - r, r * 2, r * 2], color, i % 2 === 0 ? 45 : 135, 4 + (i % 3)));
    }

    const mid = (a0 + a1) / 2;
    const [lx, ly] = polar(cx, cy, r + 12, r + 12, mid);
    const anchor = Math.cos((mid * Math.PI) / 180) >= 0 ? "start" : "end";
    marks.push(c.text(d.label, lx, ly - 5, anchor, LABEL_SCALE, 80));
    marks.push(c.text(o.format(d.value), lx, ly + 8, anchor, VALUE_SCALE, 80));
    c.parts.push(hitArea(shape, `${d.label}: ${o.format(d.value)}`, marks.join("")));
  });
}

/** Folds slices past the palette into one "Other" slice, so no hue is ever invented or reused. */
function foldOther(data: ChartDatum[], limit: number): ChartDatum[] {
  if (data.length <= limit) return data;
  const kept = data.slice(0, limit - 1);
  const rest = data.slice(limit - 1).reduce((sum, d) => sum + Math.max(d.value, 0), 0);
  return [...kept, { label: "Other", value: rest, color: INK }];
}

/** Renders a hand-drawn chart as an <svg> string. Pure — no DOM, SSR-safe. */
export function renderChart(options: ChartOptions): string {
  const {
    type,
    width = 360,
    height = 220,
    color = INK,
    colors = chartPalette,
    fill = "hatch",
    format = (v: number) => String(Math.round(v * 100) / 100),
    animate = true,
    roughness = 1,
    seed,
    dots = false,
  } = options;
  const round = type === "pie" || type === "donut";
  const data = round ? foldOther(options.data, colors.length) : options.data;
  const c = new Canvas(rngFor(seed), animate, roughness, dots);

  if (type === "bar") barChart(c, data, width, height, { color, fill, format });
  else if (type === "line") lineChart(c, data, width, height, { color, fill, format });
  else pieChart(c, data, width, height, type === "donut", colors, { fill, format });

  const title =
    options.title ?? `${type} chart: ${data.map((d) => `${d.label} ${format(d.value)}`).join(", ")}`;

  return (
    `<svg class="hw-chart ${DRAW_CLASS}" data-chart="${type}" xmlns="http://www.w3.org/2000/svg" width="${fmt(width)}" ` +
    `height="${fmt(height)}" viewBox="0 0 ${fmt(width)} ${fmt(height)}" role="img" aria-label="${escapeAttr(title)}" ` +
    `style="overflow:visible"><defs>${c.defs.join("")}</defs>${c.parts.join("")}</svg>`
  );
}

export interface DrawChartOptions extends ChartOptions, AttachOptions {}

/** Renders a chart into `target` and draws it in when scrolled into view (unless `animate: false`). */
export function drawChart(target: HTMLElement | string, options: DrawChartOptions): void {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;

  el.innerHTML = renderChart(options);
  if (options.animate !== false) attach(el, options);
}

export interface SparklineOptions {
  /** Width in px (default 64). Height matches one line of glyphed text (24). */
  width?: number;
  color?: string;
  animate?: boolean;
  roughness?: number;
  seed?: number;
  /** ms before it starts drawing — e.g. after the sentence it sits in. */
  delay?: number;
  label?: string;
  /** Show a dot where each stroke will start before it draws (default false: strokes stay hidden until their turn). */
  dots?: boolean;
}

/** A tiny hand-drawn trend line sized to sit inline with glyphed text. */
export function renderSparkline(values: number[], options: SparklineOptions = {}): string {
  const { width = 64, color = INK, animate = true, roughness = 1, seed, delay = 0, label, dots } = options;
  const top = 5;
  const bottom = LETTER_HEIGHT - 4;
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const step = values.length > 1 ? (width - 6) / (values.length - 1) : 0;
  const points: Point[] = values.map((v, i) => [3 + step * i, bottom - ((v - min) / span) * (bottom - top)]);
  const rng = rngFor(seed);
  const [ex, ey] = points[points.length - 1] ?? [0, 0];
  const strokes =
    points.length > 0 &&
    strokePath({ d: sketch(curve(points, false, 0.45), rng, { roughness: roughness * 0.6 }), animate, dots, delay, duration: 700, color, className: "hw-chart-stroke" }) +
    strokePath({ d: sketch(circle(ex, ey, 1.6), rng, { roughness: 0.3 }), animate, dots, delay: delay + 650, duration: 150, color, className: "hw-chart-stroke" });
  const a11y = label ? `role="img" aria-label="${escapeAttr(label)}"` : `aria-hidden="true"`;

  return (
    `<svg class="hw-sparkline ${DRAW_CLASS}" xmlns="http://www.w3.org/2000/svg" width="${fmt(width)}" height="${LETTER_HEIGHT}" ` +
    `viewBox="0 0 ${fmt(width)} ${LETTER_HEIGHT}" style="overflow:visible;vertical-align:middle" ${a11y}>${strokes || ""}</svg>`
  );
}
