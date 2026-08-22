import { icons } from "./icons/icons.js";
import { randomJitter } from "./renderer.js";

const STROKE_MS = 400;

export interface RenderIconOptions {
  /** Draw the icon in via stroke-dashoffset when it scrolls into view (default true). */
  animate?: boolean;
  /** Pixel size of the rendered icon (square). Defaults to the icon's native size. */
  size?: number;
}

/**
 * Renders a single named icon as one <svg>, reusing the same dasharray-based
 * draw-in trick as word glyphs so it works with the existing attach()/animateWriting().
 */
export function renderIcon(name: string, options: RenderIconOptions = {}): string {
  const { animate = true, size } = options;
  const entry = icons[name];
  if (!entry) return "";

  const variantIndex = Math.floor(Math.random() * entry.variants.length);
  const dimension = size ?? entry.width;

  const { rotate, dy, scale } = randomJitter();
  const cx = entry.width / 2;
  const cy = entry.height / 2;
  const transform =
    `translate(0 ${dy.toFixed(2)}) translate(${cx} ${cy}) ` +
    `rotate(${rotate.toFixed(1)}) scale(${scale.toFixed(3)}) translate(${-cx} ${-cy})`;

  const path = entry.variants[variantIndex];
  const style = animate
    ? `stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset ${STROKE_MS}ms ease;`
    : "";

  return (
    `<svg class="hw-icon" xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}" ` +
    `viewBox="0 0 ${entry.width} ${entry.height}" aria-hidden="true" role="img">` +
    `<path d="${path}" transform="${transform}" stroke="var(--hw-color, #000)" fill="none" ` +
    `stroke-width="2" stroke-linecap="round" pathLength="1" style="${style}" class="hw-letter" /></svg>`
  );
}
