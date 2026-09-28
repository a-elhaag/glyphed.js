import { rngFor, signed, type Rng } from "./engine/random.js";
import { sketch } from "./engine/sketch.js";
import { ellipse, line, poly, rect } from "./engine/shapes.js";
import { DRAW_CLASS, fmt, strokePath } from "./engine/stroke.js";
import { attach, type AttachOptions } from "./observer.js";
import { animateWriting } from "./renderer.js";

export type AnnotationType =
  | "underline"
  | "circle"
  | "box"
  | "highlight"
  | "strike"
  | "cross"
  | "bracket";

export interface AnnotationOptions {
  type: AnnotationType;
  /** Stroke color. Default `var(--hw-color, #000)`; highlight defaults to a marker yellow. */
  color?: string;
  /** Pen width in px (default 2; highlight defaults to the element's height). */
  strokeWidth?: number;
  /** Space between the element and the mark, in px (default 4). */
  padding?: number;
  /** Times the pen goes over the mark (default 1; 2 reads as emphatic). */
  passes?: number;
  roughness?: number;
  seed?: number;
  animate?: boolean;
  /** ms before drawing starts — e.g. let the words finish writing first. */
  delay?: number;
  /** ms for each pass to draw (default scales with the mark's length). */
  duration?: number;
  /** Show a dot where each stroke will start before it draws (default false: strokes stay hidden until their turn). */
  dots?: boolean;
}

/** Margin around the element's box inside the overlay, so wobble and overshoot never clip. */
const BLEED = 12;
const HIGHLIGHTER = "#ffd54a";

function shapes(type: AnnotationType, w: number, h: number, pad: number, rng: Rng): string[] {
  const [l, t, r, b] = [BLEED - pad, BLEED - pad, BLEED + w + pad, BLEED + h + pad];
  const midY = BLEED + h / 2;
  switch (type) {
    case "underline": {
      const y = BLEED + h + pad / 2;
      return [line(l + signed(rng, 2), y + signed(rng, 1), r + signed(rng, 2), y + signed(rng, 1))];
    }
    case "strike":
      return [line(l, midY + signed(rng, 1), r, midY + signed(rng, 1))];
    case "cross":
      return [line(l, t, r, b), line(r, t, l, b)];
    case "box":
      return [rect(l, t, r - l, b - t)];
    case "circle":
      // An ellipse circumscribing the box, not inscribed in it, so it doesn't cut through the text.
      return [ellipse(BLEED + w / 2, midY, (w / 2 + pad) * 1.12, (h / 2 + pad) * 1.3, -160 + signed(rng, 20))];
    case "highlight":
      return [line(l, midY + signed(rng, 1), r, midY + signed(rng, 1))];
    case "bracket": {
      const arm = Math.min(8, w / 4);
      return [
        poly([[l + arm, t], [l, t], [l, b], [l + arm, b]]),
        poly([[r - arm, t], [r, t], [r, b], [r - arm, b]]),
      ];
    }
  }
}

/**
 * Renders an annotation sized for a `width` × `height` box as an <svg> string. The svg is larger than
 * the box by a fixed bleed (`annotationBleed`) on every side; place it at (-bleed, -bleed) from the box.
 * Pure — no DOM, SSR-safe. `annotate()` does the measuring and placing for you.
 */
export function renderAnnotation(width: number, height: number, options: AnnotationOptions): string {
  const {
    type,
    padding = 4,
    passes = 1,
    roughness = 1,
    seed,
    animate = true,
    delay = 0,
    dots,
  } = options;
  const rng = rngFor(seed);
  const highlight = type === "highlight";
  const color = options.color ?? (highlight ? HIGHLIGHTER : undefined);
  const strokeWidth = options.strokeWidth ?? (highlight ? height + padding : 2);
  const duration = options.duration ?? Math.min(900, 300 + (width + height) * 1.5);
  const w = width + BLEED * 2;
  const h = height + BLEED * 2;

  const paths: string[] = [];
  for (let pass = 0; pass < passes; pass++) {
    const parts = shapes(type, width, height, padding, rng);
    parts.forEach((d, i) => {
      paths.push(
        strokePath({
          d: sketch(d, rng, { roughness: roughness * 1.4 }),
          animate,
          dots,
          delay: delay + (pass * parts.length + i) * duration * 0.8,
          duration,
          color,
          width: strokeWidth,
          opacity: highlight ? 0.55 : undefined,
          linecap: highlight ? "butt" : "round",
          className: `hw-annotation-stroke`,
        }),
      );
    });
  }

  return (
    `<svg class="hw-annotation ${DRAW_CLASS}" data-annotation="${type}" xmlns="http://www.w3.org/2000/svg" ` +
    `width="${fmt(w)}" height="${fmt(h)}" viewBox="0 0 ${fmt(w)} ${fmt(h)}" aria-hidden="true" ` +
    `style="position:absolute;left:${-BLEED}px;top:${-BLEED}px;pointer-events:none;overflow:visible;` +
    `${highlight ? "mix-blend-mode:multiply;z-index:-1;" : ""}">${paths.join("")}</svg>`
  );
}

/** How far a rendered annotation svg extends past its box on each side, in px. */
export const annotationBleed = BLEED;

export interface Annotation {
  /** Re-measures the element and draws a fresh mark (new wobble unless seeded). */
  redraw(): void;
  remove(): void;
}

export interface AnnotateOptions extends AnnotationOptions, AttachOptions {}

/**
 * Draws a hand-drawn mark around, under, or through `target` — underline, circle, box, highlight,
 * strike, cross, bracket. Draws in when scrolled into view (unless `animate: false`).
 */
export function annotate(target: HTMLElement | string, options: AnnotateOptions): Annotation {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  const noop: Annotation = { redraw() {}, remove() {} };
  if (!el) return noop;

  if (getComputedStyle(el).position === "static") el.style.position = "relative";
  if (options.type === "highlight") el.style.isolation = "isolate";

  const host = document.createElement("span");
  host.className = "hw-annotation-host";
  host.style.cssText = "position:absolute;left:0;top:0;width:0;height:0;pointer-events:none";
  el.append(host);

  const draw = (animate: boolean) => {
    host.innerHTML = renderAnnotation(el.offsetWidth, el.offsetHeight, { ...options, animate });
  };

  draw(options.animate !== false);
  if (options.animate !== false) attach(host, options);

  return {
    redraw() {
      draw(options.animate !== false);
      if (options.animate === false) return;
      host.getBoundingClientRect(); // flush styles so the fresh strokes start hidden, then draw them
      for (const svg of host.querySelectorAll(`.${DRAW_CLASS}`)) animateWriting(svg);
    },
    remove() {
      host.remove();
    },
  };
}
