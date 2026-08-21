# strokes-js

Renders text as animated hand-drawn SVG. Each letter is a real monoline glyph path (not a font), drawn in with a stroke animation as its word scrolls into view — with per-letter randomness (rotation, baseline drift, scale, and multiple hand-drawn variants per character) so the same word never renders identically twice.

- Zero dependencies, ESM, TypeScript strict, ~small
- Full a–z, A–Z, 0–9, and punctuation (`. , ! ? ' -`) coverage
- Scroll-triggered draw-in animation via `IntersectionObserver`, or static fully-drawn output
- Styleable with one CSS custom property (`--hw-color`)

## Install

```bash
npm install strokes-js
```

## Usage

### Quick start — `write()`

The simplest way to use the library: one call renders the text and wires up the animation.

```html
<div id="hello"></div>
<script type="module">
  import { write } from "strokes-js";

  write("#hello", "Hello, world!");
</script>
```

`write()` accepts a CSS selector string or an `HTMLElement` directly:

```js
write(document.getElementById("hello"), "Hello, world!");
```

By default, letters draw themselves in when the target element scrolls into view. Pass `{ animate: false }` for static, fully-drawn output with no scroll observer:

```js
write("#hello", "Static text", { animate: false });
```

### Manual control — `renderText()` + `attach()`

For cases where you want the markup without the library touching the DOM directly (e.g. server-side rendering, or inserting the HTML yourself), use the two lower-level pieces `write()` is built from:

```js
import { renderText, attach } from "strokes-js";

const el = document.getElementById("hello");
el.innerHTML = renderText("Hello, world!"); // animate: true by default
attach(el); // wires the scroll-triggered draw-in
```

`renderText()` returns a plain HTML string, so it also works outside the browser (no `document` access needed) — only `attach()` and `animateWriting()` touch the DOM.

### Triggering the animation manually

If you don't want scroll-triggering at all — e.g. you want the animation to start on a button click, a timer, or a route transition — skip `attach()` and call `animateWriting()` yourself on each rendered word:

```js
import { renderText, animateWriting } from "strokes-js";

el.innerHTML = renderText("Hello, world!");
button.addEventListener("click", () => {
  for (const word of el.querySelectorAll(".hw-word")) {
    animateWriting(word);
  }
});
```

### Styling color

Stroke color is controlled entirely through the `--hw-color` CSS custom property (falls back to `#000`):

```css
#hello {
  --hw-color: #c0392b;
}
```

or per-render from JS:

```js
el.style.setProperty("--hw-color", "#c0392b");
```

## API

### `write(target, text, options?)`

One-call entry point: renders `text` into `target` and (unless `animate: false`) wires up the scroll-triggered draw-in animation.

| Param | Type | Description |
|---|---|---|
| `target` | `HTMLElement \| string` | Element to render into, or a CSS selector. No-ops silently if the selector matches nothing. |
| `text` | `string` | Text to render. |
| `options` | `WriteOptions` | See below. |

`WriteOptions` = `RenderTextOptions & AttachOptions` (all fields optional, documented below).

### `renderText(text, options?)`

Returns an HTML string: a `<span class="hw-sentence">` wrapping one `<svg class="hw-word">` per word. Pure string output — safe to call without a `document` (e.g. during SSR).

**`RenderTextOptions`**

| Option | Type | Default | Description |
|---|---|---|---|
| `animate` | `boolean` | `true` | When `true`, each letter's path is rendered with `stroke-dasharray/dashoffset` primed for the draw-in transition (invisible until `animateWriting()` runs on it). When `false`, letters render fully drawn immediately, with no transition styling. |

### `attach(el, options?)`

Wires an `IntersectionObserver` to `el` so that when it scrolls into view, every `.hw-word` inside it is passed to `animateWriting()`.

**`AttachOptions`** (a subset of standard `IntersectionObserverInit`, plus `once`)

| Option | Type | Default | Description |
|---|---|---|---|
| `root` | `Element \| null` | `null` (viewport) | Passed through to `IntersectionObserver`. |
| `rootMargin` | `string` | `"0px"` | Passed through to `IntersectionObserver`. |
| `threshold` | `number \| number[]` | `0` | Passed through to `IntersectionObserver`. |
| `once` | `boolean` | `true` | If `true`, stops observing `el` after the first time it intersects (animation fires once). Set `false` to re-trigger every time it re-enters the viewport (combine with re-rendering if you want fresh variants each time). |

### `animateWriting(el)`

Starts the draw-in transition immediately on a rendered `.hw-word` element (or any element containing `.hw-letter` paths): adds the `hw-visible` class and sets each letter path's `stroke-dashoffset` to `0`. This is what `attach()` calls automatically on intersection — call it directly if you're driving the animation from something other than scroll (see [Triggering the animation manually](#triggering-the-animation-manually)).

## How the animation works

Each letter is an SVG `<path>` with `pathLength="1"`, `stroke-dasharray:1`, and `stroke-dashoffset:1` — the path is drawn but entirely hidden behind its own dash gap. `animateWriting()` sets `stroke-dashoffset` to `0`, and a CSS `transition` (declared inline per-path, staggered by letter index) animates the stroke drawing in left to right, letter by letter, word by word. Stagger and stroke duration are fixed internally (60ms per letter offset, 400ms draw per letter) — not currently configurable via options.

## Handwriting randomness

Two independent layers of randomness make repeated text look hand-written rather than stamped:

1. **Variant selection** — most glyphs ship with multiple (typically 3) hand-drawn path variants. Each time a character is rendered, a variant is picked at random, with one rule: it never repeats the same variant used the previous time that character was rendered (tracked per-character, process-wide), so runs of the same letter don't look identical back to back.
2. **Per-instance jitter** — independent of variant, every rendered letter gets a small random `rotate` (±7°), baseline `dy` drift (±1 unit), and `scale` (±10%), applied via an SVG transform pivoted around the letter's own center (so jitter never shifts later letters in a word out of position). This is freshly randomized on every render — it is not seeded or reproducible.

Both layers use `Math.random()` directly and are **not deterministic** — re-rendering the same text will look slightly different each time. This is intentional (it's what makes it read as handwriting rather than a font).

## Styling & class names

| Class | Applied to | Purpose |
|---|---|---|
| `hw-sentence` | outer `<span>` | Wraps all words for one `renderText()` call; carries `aria-label` with the original text. |
| `hw-word` | one `<svg>` per word | The unit `attach()`/`animateWriting()` operate on. |
| `hw-letter` | one `<path>` per letter | Individual glyph stroke. |
| `hw-visible` | added to `hw-word` elements | Set by `animateWriting()` once triggered; useful as a CSS hook if you want to react to "this word has started drawing." |

Color is the one themeable value, via the `--hw-color` custom property (see [Styling color](#styling-color)). Stroke width (`2`) and letter height (`24` units, viewBox-relative) are currently fixed, not configurable.

## Accessibility

- The outer `hw-sentence` span carries `aria-label="<original text>"` (HTML-escaped), so screen readers announce the real text rather than trying to parse decorative SVG paths.
- Every `hw-word` SVG has `aria-hidden="true"`, removing the decorative glyph paths from the accessibility tree.

## Glyph coverage

| Set | Characters |
|---|---|
| Lowercase | `a`–`z` |
| Uppercase | `A`–`Z` |
| Digits | `0`–`9` |
| Punctuation | `.` `,` `!` `?` `'` `-` |

Characters outside this set (other punctuation, whitespace beyond the plain space used to split words, non-Latin scripts, emoji) are silently skipped — they contribute no path and no width. Unsupported *uppercase* input falls back to the lowercase glyph if one exists (e.g. an accidental extra capital); punctuation is matched exactly, with no case folding.

## Project structure

```
src/
  index.ts                     — write(), public exports
  renderer.ts                  — renderText(), animateWriting(), jitter/variant logic
  observer.ts                  — attach(), IntersectionObserver wiring
  glyphs/
    types.ts                   — GlyphEntry / GlyphDatabase types
    glyphs.ts                  — aggregates every glyph module into one lookup table
    letters/letter-<x>.ts      — one file per lowercase letter (width + variant paths)
    letters/letter-<x>-upper.ts — one file per uppercase letter
    digits/digit-<n>.ts        — one file per digit
    punctuation/punct-<name>.ts — one file per punctuation glyph
scripts/
  extract-glyphs.ts            — stub, not implemented
demo/
  index.html                   — live playground + full glyph gallery
```

Each glyph file exports a single `GlyphEntry`:

```ts
export interface GlyphEntry {
  width: number;      // advance width, in the same units as the 24-unit-tall viewBox
  variants: string[];  // one or more monoline SVG path `d` strings, hand-drawn within 0 0 width 24
}
```

Adding or editing a glyph means editing its own file under `glyphs/letters`, `glyphs/digits`, or `glyphs/punctuation` — no other file needs to change except `glyphs.ts`'s import/lookup if you're adding a brand-new character.

## Demo

`demo/index.html` is a static page (loads `../dist/index.js`, so run `npm run build` first) with:
- a live playground — type any text, change stroke color, toggle animate on/off, replay
- the full glyph gallery — every supported letter, digit, and punctuation mark, animated on scroll

Open it with any static file server, e.g. `npx serve .` then visit `/demo/`.

## License

ISC
