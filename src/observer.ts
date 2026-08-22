import { animateWriting } from "./renderer.js";

export interface AttachOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
}

/** Wires an IntersectionObserver to a container so its hw-word svgs animate in once scrolled into view. */
export function attach(el: HTMLElement, options: AttachOptions = {}): void {
  const { once = true, ...observerOptions } = options;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const word of entry.target.querySelectorAll(".hw-word, .hw-icon")) {
        animateWriting(word);
      }
      if (once) observer.unobserve(entry.target);
    }
  }, observerOptions);

  observer.observe(el);
}
