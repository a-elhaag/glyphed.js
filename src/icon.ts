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
  /** Give the icon a little motion of its own while hovered (default false). */
  hover?: boolean;
}

/** Hover motions, keyed by icon name; anything not listed gets a gentle bob. */
const HOVER_MOTION: Record<string, [string, string]> = {
  heart: ["1s ease-in-out infinite", "50%{transform:scale(1.18)}"],
  bolt: ["0.8s ease-in-out infinite", "50%{transform:scale(1.12)}"],
  star: ["0.6s cubic-bezier(.34,1.56,.64,1)", "to{transform:rotate(72deg)}"],
  sun: ["6s linear infinite", "to{transform:rotate(360deg)}"],
  sparkle: ["3s linear infinite", "to{transform:rotate(360deg)}"],
  "pie-chart": ["4s linear infinite", "to{transform:rotate(360deg)}"],
  refresh: ["1.2s linear infinite", "to{transform:rotate(-360deg)}"],
  bell: ["1s ease-out infinite", "15%{transform:rotate(16deg)}30%{transform:rotate(-12deg)}45%{transform:rotate(7deg)}60%{transform:rotate(-3deg)}75%{transform:rotate(0)}"],
  globe: ["2s ease-in-out infinite", "25%{transform:rotate(14deg)}75%{transform:rotate(-14deg)}"],
  rocket: ["1s ease-in-out infinite", "50%{transform:translate(1px,-4px)}"],
  music: ["0.6s ease-in-out infinite", "50%{transform:translateY(-3px) rotate(8deg)}"],
  search: ["2s linear infinite", "25%{transform:translate(2px,1px)}50%{transform:translate(0,2px)}75%{transform:translate(-2px,1px)}"],
  flame: ["0.3s ease-in-out infinite alternate", "to{transform:scale(1.06,1.1)}"],
  mail: ["0.8s ease-in-out infinite", "50%{transform:translateY(-3px)}"],
  gift: ["0.5s ease-in-out infinite", "25%{transform:rotate(6deg)}75%{transform:rotate(-6deg)}"],
  cart: ["1.2s ease-in-out infinite", "50%{transform:translateX(3px)}"],
  "arrow-right": ["0.8s ease-in-out infinite", "50%{transform:translateX(4px)}"],
  "trending-up": ["0.8s ease-in-out infinite", "50%{transform:translate(1px,-2px)}"],
  smile: ["1.2s ease-in-out infinite", "25%{transform:rotate(10deg) scale(1.1)}75%{transform:rotate(-10deg)}"],
  download: ["0.8s ease-in-out infinite", "50%{transform:translateY(3px)}"],
  upload: ["0.8s ease-in-out infinite", "50%{transform:translateY(-3px)}"],
};
const HOVER_BOB: [string, string] = ["1s ease-in-out infinite", "50%{transform:translateY(-2px)}"];

function hoverStyle(name: string): string {
  const [timing, frames] = HOVER_MOTION[name] ?? HOVER_BOB;
  const id = `hw-hover-${name.replace(/[^a-z0-9-]/gi, "")}`;
  return (
    `<style>:where(.hw-hover){transform-box:fill-box;transform-origin:50% 50%}` +
    `@keyframes ${id}{${frames}}` +
    `@media (prefers-reduced-motion:no-preference){:where(.hw-icon:hover) .${id}{animation:${id} ${timing}}}</style>`
  );
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
    hover = false,
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
    (hover
      ? `${hoverStyle(icon.name)}<g transform="${transform}"><g class="hw-hover hw-hover-${escapeAttr(icon.name.replace(/[^a-z0-9-]/gi, ""))}">${strokes}</g></g>`
      : `<g transform="${transform}">${strokes}</g>`) +
    `</svg>`
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
