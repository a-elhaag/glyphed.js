import type { Icon } from "./icons/types.js";
import { rngFor } from "./engine/random.js";
import { sketch } from "./engine/sketch.js";
import { DRAW_CLASS, escapeAttr, fmt, jitterTransform, randomJitter, strokePath } from "./engine/stroke.js";
import { attach, type AttachOptions } from "./observer.js";

const ICON_STROKE_STAGGER_MS = 90;

export interface RenderIconOptions {
  /** Draw strokes in one after another (default true). False renders fully drawn. */
  animate?: boolean;
  /** Rendered size in px (default 24 — one line of glyphed text). */
  size?: number;
  /** Stroke color (default `var(--hw-color, #000)`). */
  color?: string;
  /** Pen width in grid units (default 2, same as the letters). */
  strokeWidth?: number;
  /** How shaky the hand is: 0 = clean, 1 = default, 2 = loose. */
  roughness?: number;
  /** Seed for a repeatable drawing (e.g. to match SSR and client). Omit for a fresh hand every render. */
  seed?: number;
  /** ms to wait before the first stroke. */
  delay?: number;
  /** Accessible name. Without it the icon is decorative (`aria-hidden`). */
  label?: string;
  /** Show a dot where each stroke will start before it draws (default false: strokes stay hidden until their turn). */
  dots?: boolean;
}

/** Renders an icon as a hand-drawn <svg> string. Pure — no DOM needed, SSR-safe. */
export function renderIcon(icon: Icon, options: RenderIconOptions = {}): string {
  const {
    animate = true,
    size = 24,
    color,
    strokeWidth = 2,
    roughness = 1,
    seed,
    delay = 0,
    label,
    dots,
  } = options;
  const rng = rngFor(seed);
  const transform = jitterTransform(0, 0, 12, 12, randomJitter(rng, 0.5 * roughness));
  const strokes = icon.strokes
    .map((d, i) =>
      strokePath({
        d: sketch(d, rng, { roughness }),
        animate,
        dots,
        delay: delay + i * ICON_STROKE_STAGGER_MS,
        color,
        width: strokeWidth,
        className: "hw-icon-stroke",
      }),
    )
    .join("");
  const a11y = label ? `role="img" aria-label="${escapeAttr(label)}"` : `aria-hidden="true"`;

  return (
    `<svg class="hw-icon ${DRAW_CLASS}" data-icon="${escapeAttr(icon.name)}" xmlns="http://www.w3.org/2000/svg" ` +
    `width="${fmt(size)}" height="${fmt(size)}" viewBox="0 0 24 24" style="overflow:visible" ${a11y}>` +
    `<g transform="${transform}">${strokes}</g></svg>`
  );
}

export interface DrawIconOptions extends RenderIconOptions, AttachOptions {}

/** Renders `icon` into `target` and draws it in when scrolled into view (unless `animate: false`). */
export function drawIcon(target: HTMLElement | string, icon: Icon, options: DrawIconOptions = {}): void {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;

  el.innerHTML = renderIcon(icon, options);
  if (options.animate !== false) attach(el, options);
}
