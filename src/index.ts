export { renderText, animateWriting, type RenderTextOptions } from "./renderer.js";
export { attach, type AttachOptions } from "./observer.js";
export { renderIcon, drawIcon, type RenderIconOptions, type DrawIconOptions } from "./icon.js";
export { icon, type Icon } from "./icons/types.js";
export {
  annotate,
  renderAnnotation,
  annotationBleed,
  type Annotation,
  type AnnotationType,
  type AnnotationOptions,
  type AnnotateOptions,
} from "./annotate.js";
export {
  renderChart,
  drawChart,
  renderSparkline,
  chartPalette,
  type ChartDatum,
  type ChartOptions,
  type DrawChartOptions,
  type SparklineOptions,
} from "./chart.js";
export { sketch, type SketchOptions } from "./engine/sketch.js";
export * as shapes from "./engine/shapes.js";

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
