import { animateWriting } from "./renderer.js";
import { DRAW_CLASS } from "./engine/stroke.js";

export interface AttachOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
}

/** Wires an IntersectionObserver to a container so everything glyphed.js drew inside it (words, icons, annotations, charts) animates in once scrolled into view. */
export function attach(el: HTMLElement, options: AttachOptions = {}): void {
  const { once = true, ...observerOptions } = options;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (entry.target.classList.contains(DRAW_CLASS)) animateWriting(entry.target);
      for (const drawing of entry.target.querySelectorAll(`.${DRAW_CLASS}`)) {
        animateWriting(drawing);
      }
      if (once) observer.unobserve(entry.target);
    }
  }, observerOptions);

  observer.observe(el);
}
