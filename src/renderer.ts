import { glyphs, type GlyphEntry } from "./glyphs/glyphs.js";

const PUNCTUATION = new Set([".", ",", "!", "?", "'", "-"]);
const LETTER_HEIGHT = 24;
const STAGGER_MS = 60;
const STROKE_MS = 400;

/** Tracks the last variant index picked per character so the same glyph never repeats back-to-back. */
const lastVariant = new Map<string, number>();

function pickVariant(char: string, entry: GlyphEntry): number {
  const prev = lastVariant.get(char);
  if (entry.variants.length === 1) return 0;
  let index = Math.floor(Math.random() * entry.variants.length);
  while (index === prev) {
    index = Math.floor(Math.random() * entry.variants.length);
  }
  lastVariant.set(char, index);
  return index;
}

function splitText(text: string): string[] {
  return text.split(/(\s+)/).filter((part) => part.length > 0);
}

const JITTER_ROTATE_DEG = 7;
const JITTER_BASELINE = 1;
const JITTER_SCALE = 0.1;

/** Small per-instance wobble (rotation, baseline drift, scale) layered on top of the picked variant, so no two renders of the same letter sit identically even when they share a path. */
export function randomJitter(): { rotate: number; dy: number; scale: number } {
  return {
    rotate: (Math.random() * 2 - 1) * JITTER_ROTATE_DEG,
    dy: (Math.random() * 2 - 1) * JITTER_BASELINE,
    scale: 1 + (Math.random() * 2 - 1) * JITTER_SCALE,
  };
}

function renderWord(
  word: string,
  delayOffset: number,
  animate: boolean,
): { svg: string; letterCount: number } {
  let x = 0;
  const paths: string[] = [];
  let letterIndex = 0;

  for (const rawChar of word) {
    const char = PUNCTUATION.has(rawChar)
      ? rawChar
      : glyphs[rawChar]
        ? rawChar
        : rawChar.toLowerCase();
    const entry = glyphs[char];
    if (!entry) continue;

    const variantIndex = pickVariant(char, entry);
    const d = entry.variants[variantIndex];
    const width = entry.variantWidths?.[variantIndex] ?? entry.width;
    const style = animate
      ? `stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset ${STROKE_MS}ms ease ${
          (delayOffset + letterIndex) * STAGGER_MS
        }ms;`
      : "";

    if (d) {
      const { rotate, dy, scale } = randomJitter();
      const cx = width / 2;
      const cy = LETTER_HEIGHT / 2;
      // Position first, then rotate/scale around the letter's own center (not the SVG origin)
      // so the jitter can't nudge later letters in long words out of position.
      const transform =
        `translate(${x} ${dy.toFixed(2)}) translate(${cx} ${cy}) ` +
        `rotate(${rotate.toFixed(1)}) scale(${scale.toFixed(3)}) translate(${-cx} ${-cy})`;

      paths.push(
        `<path d="${d}" transform="${transform}" stroke="var(--hw-color, #000)" fill="none" ` +
          `stroke-width="2" stroke-linecap="round" pathLength="1" style="${style}" class="hw-letter" />`,
      );
    }

    x += width;
    letterIndex++;
  }

  const svg =
    `<svg class="hw-word" xmlns="http://www.w3.org/2000/svg" width="${x}" height="${LETTER_HEIGHT}" ` +
    `viewBox="0 0 ${x} ${LETTER_HEIGHT}" aria-hidden="true">${paths.join("")}</svg>`;

  return { svg, letterCount: letterIndex };
}

function renderWhitespace(
  whitespace: string,
  delayOffset: number,
  animate: boolean,
): { markup: string; letterCount: number } {
  let letterCount = 0;
  const markup: string[] = [];

  for (const chunk of whitespace.split(/(\r\n|\r|\n)/)) {
    if (!chunk) continue;
    if (/^(\r\n|\r|\n)$/.test(chunk)) {
      markup.push("<br />");
      continue;
    }

    const { svg, letterCount: count } = renderWord(
      chunk.replace(/\s/g, " "),
      delayOffset + letterCount,
      animate,
    );
    markup.push(svg);
    letterCount += count;
  }

  return { markup: markup.join(""), letterCount };
}

export interface RenderTextOptions {
  /** Draw letters in via stroke-dashoffset when the word scrolls into view (default true). Set false for static, fully-drawn output. */
  animate?: boolean;
}

/**
 * Renders text as a sentence wrapper containing one <svg> per word.
 * When animate (default), each word's letters draw in via stroke-dashoffset once `.hw-visible`
 * is toggled on it — pass the result to observer.ts's `attach()` to trigger that on scroll.
 */
export function renderText(
  text: string,
  options: RenderTextOptions = {},
): string {
  const { animate = true } = options;
  const parts = splitText(text);
  let delayOffset = 0;
  const markup: string[] = [];
  let pendingWhitespace = "";

  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      pendingWhitespace += part;
      continue;
    }

    const word = part;
    const { svg, letterCount } = renderWord(word, delayOffset, animate);
    const { markup: space, letterCount: spaceCount } = renderWhitespace(
      pendingWhitespace,
      delayOffset,
      animate,
    );
    markup.push(
      `<span class="hw-token" style="display:inline-flex;align-items:baseline">${space}${svg}</span>`,
    );
    pendingWhitespace = "";
    delayOffset += spaceCount + letterCount;
  }

  if (pendingWhitespace) {
    const { markup: space } = renderWhitespace(
      pendingWhitespace,
      delayOffset,
      animate,
    );
    markup.push(
      `<span class="hw-token" style="display:inline-flex;align-items:baseline">${space}</span>`,
    );
  }

  return `<span class="hw-sentence" aria-label="${escapeAttr(text)}">${markup.join("")}</span>`;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Toggles the class that starts the draw-in transition for a rendered word's strokes. */
export function animateWriting(el: Element): void {
  el.classList.add("hw-visible");
  for (const path of el.querySelectorAll<SVGPathElement>(".hw-letter")) {
    path.style.strokeDashoffset = "0";
  }
}
