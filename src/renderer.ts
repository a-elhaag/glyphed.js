import { glyphs, type GlyphEntry } from "./glyphs/glyphs.js";
import type { Icon } from "./icons/types.js";
import { sketch } from "./engine/sketch.js";
import {
  DRAW_CLASS,
  STAGGER_MS,
  STROKE_CLASS,
  escapeAttr,
  jitterTransform,
  randomJitter,
  strokePath,
} from "./engine/stroke.js";

const PUNCTUATION = new Set([".", ",", "!", "?", "'", "-"]);
export const LETTER_HEIGHT = 24;

/** Icons sit inside a line of text a touch taller than cap height: 24-unit grid scaled to ~20 units, 1 unit of side bearing. */
const INLINE_ICON_SCALE = 0.85;
const INLINE_ICON_BEARING = 1;
const INLINE_ICON_ADVANCE = 24 * INLINE_ICON_SCALE + INLINE_ICON_BEARING * 2;
const ICON_STROKE_STAGGER_MS = 45;
const SHORTCODE = /^:([a-z0-9-]+):/;

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

export interface LineLayout {
  /** Stroke <path> markup, positioned from x = 0. */
  paths: string;
  width: number;
  /** Number of marks (letters + icons) laid out; drives the stagger of whatever follows. */
  count: number;
}

/**
 * Lays out a run of characters (spaces included) as positioned stroke paths.
 * `:name:` shortcodes become inline icons when `icons` has that name.
 */
export function layoutLine(
  text: string,
  delayOffset: number,
  animate: boolean,
  icons?: Record<string, Icon>,
): LineLayout {
  let x = 0;
  const paths: string[] = [];
  let index = 0;
  const chars = [...text];

  for (let i = 0; i < chars.length; i++) {
    const rawChar = chars[i];
    const delay = (delayOffset + index) * STAGGER_MS;

    if (rawChar === ":" && icons) {
      const match = SHORTCODE.exec(chars.slice(i, i + 40).join(""));
      const icon = match && icons[match[1]];
      if (icon) {
        paths.push(inlineIcon(icon, x, delay, animate));
        x += INLINE_ICON_ADVANCE;
        index++;
        i += match[0].length - 1;
        continue;
      }
    }

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

    if (d) {
      const transform = jitterTransform(x, 0, width / 2, LETTER_HEIGHT / 2, randomJitter());
      paths.push(strokePath({ d, transform, animate, delay, className: "hw-letter" }));
    }

    x += width;
    index++;
  }

  return { paths: paths.join(""), width: x, count: index };
}

function inlineIcon(icon: Icon, x: number, delay: number, animate: boolean): string {
  const transform = jitterTransform(
    x + INLINE_ICON_BEARING,
    (LETTER_HEIGHT - 24 * INLINE_ICON_SCALE) / 2,
    12,
    12,
    randomJitter(Math.random, 0.5),
    INLINE_ICON_SCALE,
  );
  const strokes = icon.strokes
    .map((d, i) =>
      strokePath({
        d: sketch(d),
        animate,
        delay: delay + i * ICON_STROKE_STAGGER_MS,
        // Compensate for the scale so icon ink matches letter ink.
        width: 2 / INLINE_ICON_SCALE,
        className: "hw-icon-stroke",
      }),
    )
    .join("");
  return `<g transform="${transform}" class="hw-inline-icon">${strokes}</g>`;
}

function renderWord(
  word: string,
  delayOffset: number,
  animate: boolean,
  icons?: Record<string, Icon>,
): { svg: string; letterCount: number } {
  const { paths, width, count } = layoutLine(word, delayOffset, animate, icons);
  const svg =
    `<svg class="hw-word ${DRAW_CLASS}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${LETTER_HEIGHT}" ` +
    `viewBox="0 0 ${width} ${LETTER_HEIGHT}" aria-hidden="true">${paths}</svg>`;

  return { svg, letterCount: count };
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
  /**
   * Icons available as `:name:` shortcodes inside the text, e.g. `{ icons }` from `glyphed.js/icons`
   * or just the ones you use: `{ icons: { rocket, heart } }`. Unknown shortcodes render as plain text.
   */
  icons?: Record<string, Icon>;
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
  const { animate = true, icons } = options;
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
    const { svg, letterCount } = renderWord(word, delayOffset, animate, icons);
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

  const label = icons
    ? text.replace(/:([a-z0-9-]+):/g, (code, name: string) => (icons[name] ? name : code))
    : text;
  return `<span class="hw-sentence" aria-label="${escapeAttr(label)}">${markup.join("")}</span>`;
}

/**
 * Starts the draw-in transition for everything glyphed.js drew inside `el` — words, icons,
 * annotations, charts: adds `hw-visible` and sets each stroke's `stroke-dashoffset` to `0`.
 */
export function animateWriting(el: Element): void {
  el.classList.add("hw-visible");
  for (const path of el.querySelectorAll<SVGPathElement>(`.${STROKE_CLASS}`)) {
    path.style.strokeDashoffset = "0";
  }
}
