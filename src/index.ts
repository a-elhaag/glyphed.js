export { renderText, animateWriting, type RenderTextOptions } from "./renderer.js";
export { attach, type AttachOptions } from "./observer.js";

import { renderText, type RenderTextOptions } from "./renderer.js";
import { attach, type AttachOptions } from "./observer.js";

export interface WriteOptions extends RenderTextOptions, AttachOptions {}

/**
 * One-call entry point: renders `text` into `target` and wires up the scroll-triggered
 * draw-in animation. Pass `{ animate: false }` for static, fully-drawn output (no observer).
 */
export function write(
  target: HTMLElement | string,
  text: string,
  options: WriteOptions = {}
): void {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;

  el.innerHTML = renderText(text, options);
  if (options.animate !== false) attach(el, options);
}
