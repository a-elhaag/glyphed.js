import { glyphs, type GlyphEntry } from "./glyphs/glyphs.js";
import type { Icon } from "./icons/types.js";
import { sketch } from "./engine/sketch.js";
import {
  DRAW_CLASS,
  STAGGER_MS,
  STROKE_CLASS,
  escapeAttr,
  escapeText,
  fmt,
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

export interface LineOptions {
  /** Stagger slot the first mark starts at (each slot is one letter's delay). */
  delayOffset?: number;
  animate?: boolean;
  icons?: Record<string, Icon>;
  dots?: boolean;
}

/**
 * Lays out a run of characters (spaces included) as positioned stroke paths.
 * `:name:` shortcodes become inline icons when `icons` has that name.
 */
export function layoutLine(text: string, options: LineOptions = {}): LineLayout {
  const { delayOffset = 0, animate = true, icons, dots = false } = options;
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
        paths.push(inlineIcon(icon, x, delay, animate, dots));
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
      paths.push(strokePath({ d, transform, animate, delay, dots, className: "hw-letter" }));
    }

    x += width;
    index++;
  }

  return { paths: paths.join(""), width: x, count: index };
}

function inlineIcon(icon: Icon, x: number, delay: number, animate: boolean, dots: boolean): string {
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
        dots,
        delay: delay + i * ICON_STROKE_STAGGER_MS,
        // Compensate for the scale so icon ink matches letter ink.
        width: 2 / INLINE_ICON_SCALE,
        className: "hw-icon-stroke",
      }),
    )
    .join("");
  return `<g transform="${transform}" class="hw-inline-icon">${strokes}</g>`;
}

interface WordOptions extends LineOptions {
  copyable: boolean;
}

/** Monospace advance at the copy layer's 20px size; used to stretch the text across the drawn word. */
const COPY_FONT_PX = 20;
const COPY_CHAR_PX = COPY_FONT_PX * 0.6;

/**
 * Invisible real text laid over the drawn word (pulled back over the svg with a negative margin), so
 * selecting the handwriting highlights roughly the right area and copying gives the original characters.
 * Kept in normal inline flow on purpose: absolutely positioned, flex, or in-SVG text makes browsers
 * insert line breaks between words when copying. `overflow:hidden` puts its baseline at its bottom
 * edge, the same place an inline svg sits, so the two line up without extra rules.
 */
function copyLayer(text: string, width: number): string {
  const length = [...text].length;
  if (!length || width <= 0) return "";
  const spacing = (width - length * COPY_CHAR_PX) / length;
  return (
    `<span class="hw-copy" aria-hidden="true" style="display:inline-block;width:${fmt(width)}px;height:${LETTER_HEIGHT}px;` +
    `margin-left:${fmt(-width)}px;overflow:hidden;color:transparent;white-space:pre;` +
    `font:${COPY_FONT_PX}px/${LETTER_HEIGHT}px monospace;letter-spacing:${fmt(spacing)}px">${escapeText(text)}</span>`
  );
}

function renderWord(word: string, options: WordOptions): { svg: string; letterCount: number } {
  const { paths, width, count } = layoutLine(word, options);
  const svg =
    `<svg class="hw-word ${DRAW_CLASS}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${LETTER_HEIGHT}" ` +
    `viewBox="0 0 ${width} ${LETTER_HEIGHT}" aria-hidden="true">${paths}</svg>` +
    (options.copyable ? copyLayer(word, width) : "");

  return { svg, letterCount: count };
}

function renderWhitespace(
  whitespace: string,
  options: WordOptions,
): { markup: string; letterCount: number } {
  const delayOffset = options.delayOffset ?? 0;
  let letterCount = 0;
  const markup: string[] = [];

  for (const chunk of whitespace.split(/(\r\n|\r|\n)/)) {
    if (!chunk) continue;
    if (/^(\r\n|\r|\n)$/.test(chunk)) {
      markup.push("<br />");
      continue;
    }

    const { svg, letterCount: count } = renderWord(chunk.replace(/\s/g, " "), {
      ...options,
      icons: undefined,
      delayOffset: delayOffset + letterCount,
    });
    markup.push(svg);
    letterCount += count;
  }

  return { markup: markup.join(""), letterCount };
}

/**
 * Browsers paint selected text in the selection color even when it's transparent, which would reveal
 * the plain copy text over the handwriting; a translucent highlight keeps the ink visible beneath.
 * `::selection` can't be set inline, so each copyable render
 * carries this one rule (low specificity via :where, so page CSS can override it).
 */
const COPY_STYLE = `<style>:where(.hw-copy)::selection{color:transparent;-webkit-text-fill-color:transparent;background:rgba(66,133,244,.3)}</style>`;

/** A word and the whitespace before it never wrap apart. Plain inline (not flex) so copied text has no stray line breaks. */
const TOKEN_OPEN = `<span class="hw-token" style="white-space:nowrap">`;

export interface RenderTextOptions {
  /** Draw letters in via stroke-dashoffset when the word scrolls into view (default true). Set false for static, fully-drawn output. */
  animate?: boolean;
  /**
   * Icons available as `:name:` shortcodes inside the text, e.g. `{ icons }` from `glyphed.js/icons`
   * or just the ones you use: `{ icons: { rocket, heart } }`. Unknown shortcodes render as plain text.
   */
  icons?: Record<string, Icon>;
  /**
   * Show a dot where each stroke will start before the pen reaches it (default false). Round pen
   * caps paint that dot on an undrawn stroke; off, every stroke stays hidden until its own turn.
   */
  dots?: boolean;
  /**
   * Put invisible real text over the handwriting so it can be selected and copied like normal
   * text (default true). Set false for purely decorative output.
   */
  copyable?: boolean;
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
  const { animate = true, icons, dots = false, copyable = true } = options;
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
    const { svg, letterCount } = renderWord(word, { delayOffset, animate, icons, dots, copyable });
    const { markup: space, letterCount: spaceCount } = renderWhitespace(pendingWhitespace, {
      delayOffset,
      animate,
      dots,
      copyable,
    });
    markup.push(`${TOKEN_OPEN}${space}${svg}</span>`);
    pendingWhitespace = "";
    delayOffset += spaceCount + letterCount;
  }

  if (pendingWhitespace) {
    const { markup: space } = renderWhitespace(pendingWhitespace, { delayOffset, animate, dots, copyable });
    markup.push(`${TOKEN_OPEN}${space}</span>`);
  }

  const label = icons
    ? text.replace(/:([a-z0-9-]+):/g, (code, name: string) => (icons[name] ? name : code))
    : text;
  return `<span class="hw-sentence" aria-label="${escapeAttr(label)}">${copyable ? COPY_STYLE : ""}${markup.join("")}</span>`;
}

/**
 * Starts the draw-in transition for everything glyphed.js drew inside `el` — words, icons,
 * annotations, charts: adds `hw-visible` and sets each stroke's `stroke-dashoffset` to `0`.
 */
export function animateWriting(el: Element): void {
  el.classList.add("hw-visible");
  for (const path of el.querySelectorAll<SVGPathElement>(`.${STROKE_CLASS}`)) {
    path.style.strokeDashoffset = "0";
    // Hidden strokes (dots: false) become visible exactly when their own delay starts.
    path.style.visibility = "visible";
  }
}
