import { signed, type Rng } from "./random.js";

/** Delay between consecutive strokes (letters, icon parts, chart marks). */
export const STAGGER_MS = 60;
/** How long one stroke takes to draw in. */
export const STROKE_MS = 400;
/** Every drawn stroke carries this class; `animateWriting()` flips its dashoffset to 0. */
export const STROKE_CLASS = "hw-stroke";
/** Every drawn <svg> carries this class; `attach()` animates whatever it finds with it. */
export const DRAW_CLASS = "hw-draw";

const JITTER_ROTATE_DEG = 7;
const JITTER_BASELINE = 1;
const JITTER_SCALE = 0.1;

export interface Jitter {
  rotate: number;
  dy: number;
  scale: number;
}

/** Small per-instance wobble (rotation, baseline drift, scale). `amount` scales all three (1 = letter-sized wobble). */
export function randomJitter(rng: Rng = Math.random, amount = 1): Jitter {
  return {
    rotate: signed(rng, JITTER_ROTATE_DEG * amount),
    dy: signed(rng, JITTER_BASELINE * amount),
    scale: 1 + signed(rng, JITTER_SCALE * amount),
  };
}

/**
 * Positions a mark at (x, y), then rotates/scales it around its own center (cx, cy) so the
 * jitter can't nudge neighbouring marks out of place. `scale` is an extra fixed scale applied last.
 */
export function jitterTransform(
  x: number,
  y: number,
  cx: number,
  cy: number,
  jitter: Jitter,
  scale = 1,
): string {
  const fixed = scale === 1 ? "" : ` scale(${fmt(scale)})`;
  return (
    `translate(${fmt(x)} ${fmt(y + jitter.dy)})${fixed} translate(${fmt(cx)} ${fmt(cy)}) ` +
    `rotate(${jitter.rotate.toFixed(1)}) scale(${jitter.scale.toFixed(3)}) translate(${fmt(-cx)} ${fmt(-cy)})`
  );
}

export interface StrokeOptions {
  d: string;
  animate: boolean;
  /** ms before this stroke starts drawing. */
  delay?: number;
  /** ms this stroke takes to draw. */
  duration?: number;
  transform?: string;
  color?: string;
  width?: number;
  opacity?: number;
  linecap?: "round" | "butt" | "square";
  /** Extra classes after `hw-stroke`. */
  className?: string;
}

/** The one place a drawn stroke's markup is built: letters, icons, annotations and charts all go through here. */
export function strokePath(options: StrokeOptions): string {
  const {
    d,
    animate,
    delay = 0,
    duration = STROKE_MS,
    transform,
    color = "var(--hw-color, #000)",
    width = 2,
    opacity,
    linecap = "round",
    className,
  } = options;
  const style = animate
    ? `stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset ${Math.round(duration)}ms ease ${Math.round(delay)}ms;`
    : "";
  const cls = className ? `${STROKE_CLASS} ${className}` : STROKE_CLASS;

  return (
    `<path d="${d}"${transform ? ` transform="${transform}"` : ""} stroke="${escapeAttr(color)}" fill="none" ` +
    `stroke-width="${fmt(width)}" stroke-linecap="${linecap}" stroke-linejoin="round"` +
    `${opacity === undefined ? "" : ` stroke-opacity="${fmt(opacity)}"`} pathLength="1" style="${style}" class="${cls}" />`
  );
}

export function fmt(n: number): string {
  return String(Math.round(n * 100) / 100);
}

export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
