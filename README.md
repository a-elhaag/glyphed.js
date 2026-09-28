# glyphed.js

Renders text, icons, annotations, and charts as animated hand-drawn SVG. Each letter is a real monoline glyph path (not a font), drawn in with a stroke animation as its word scrolls into view — with per-letter randomness (rotation, baseline drift, scale, and multiple hand-drawn variants per character) so the same word never renders identically twice.

- Zero dependencies, ESM, TypeScript strict, ~small
- Full a–z, A–Z, 0–9, and punctuation (`. , ! ? ' - & ( ) — " \` { } [ ] * = + @ :`) coverage
- Scroll-triggered draw-in animation via `IntersectionObserver`, or static fully-drawn output
- Styleable with one CSS custom property (`--hw-color`)
- 68 hand-drawn icons, text annotations (underline, circle, highlight…), and sketchy bar / line / pie / donut charts — all drawn by the same engine, so they match the lettering

## Install

```bash
npm install glyphed.js
```

## Usage

### Quick start — `write()`

The simplest way to use the library: one call renders the text and wires up the animation.

```html
<div id="hello"></div>
<script type="module">
  import { write } from "glyphed.js";

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
import { renderText, attach } from "glyphed.js";

const el = document.getElementById("hello");
el.innerHTML = renderText("Hello, world!"); // animate: true by default
attach(el); // wires the scroll-triggered draw-in
```

`renderText()` returns a plain HTML string, so it also works outside the browser (no `document` access needed) — only `attach()` and `animateWriting()` touch the DOM.

### Triggering the animation manually

If you don't want scroll-triggering at all — e.g. you want the animation to start on a button click, a timer, or a route transition — skip `attach()` and call `animateWriting()` yourself on each rendered word:

```js
import { renderText, animateWriting } from "glyphed.js";

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

### Icons

Icons are drawn on the same 24-unit grid as the letters, with the same 2-unit pen, and go through the same wobble and draw-in. Each render is a slightly different hand.

```js
import { drawIcon, renderIcon } from "glyphed.js";
import { rocket, heart } from "glyphed.js/icons"; // tree-shakable: import only what you use

drawIcon("#logo", rocket, { size: 48, label: "Launch" });
const svg = renderIcon(heart, { color: "#c63d24", animate: false }); // SSR-safe string
```

Icons can also sit inside handwritten text as `:name:` shortcodes:

```js
import { icons } from "glyphed.js/icons"; // the whole set, keyed by name

write("#hello", "Ship it :rocket: with :heart:", { icons });
```

Bundled: `activity` `alert` `arrow-down` `arrow-left` `arrow-right` `arrow-up` `arrow-up-right` `bar-chart` `bell` `bolt` `bookmark` `bulb` `calendar` `camera` `cart` `check` `chevron-down` `chevron-left` `chevron-right` `chevron-up` `clock` `cloud` `code` `coffee` `download` `edit` `external-link` `eye` `file` `flag` `flame` `folder` `gift` `globe` `heart` `help` `home` `image` `info` `leaf` `link` `lock` `mail` `menu` `message` `minus` `moon` `music` `pie-chart` `pin` `plus` `refresh` `rocket` `search` `send` `sliders` `smile` `sparkle` `star` `sun` `terminal` `trash` `trending-down` `trending-up` `unlock` `upload` `user` `x`.

Make your own with `icon(name, strokes)` — strokes are path strings (absolute `M L C Z`) or built with the `shapes` helpers:

```js
import { icon, shapes } from "glyphed.js";

const target = icon("target", [shapes.circle(12, 12, 9), shapes.circle(12, 12, 4), shapes.dot(12, 12)]);
```

### Annotations

Hand-drawn marks on any element: `underline`, `circle`, `box`, `highlight`, `strike`, `cross`, `bracket`.

```js
import { annotate } from "glyphed.js";

const mark = annotate("#price", { type: "circle", color: "#c63d24", delay: 800 });
mark.redraw(); // after layout changes
mark.remove();
```

`renderAnnotation(width, height, options)` returns the SVG string without touching the DOM.

### Charts

Bar, line, pie, and donut charts with hatched fills and handwritten labels. No charting dependency.

```js
import { drawChart, renderSparkline } from "glyphed.js";

drawChart("#stats", {
  type: "bar", // "line" | "pie" | "donut"
  data: [
    { label: "Mon", value: 12 },
    { label: "Tue", value: 19 },
  ],
  title: "Commits per weekday",
});

el.innerHTML = renderSparkline([3, 5, 4, 8, 12], { label: "Rising" }); // one text-line tall
```

Pie and donut slices take colors from `chartPalette` in order (colorblind-checked) and alternate hatch direction as a second cue; slices past the palette fold into "Other". Each mark carries a native hover tooltip.

## API

### `write(target, text, options?)`

One-call entry point: renders `text` into `target` and (unless `animate: false`) wires up the scroll-triggered draw-in animation.

| Param     | Type                    | Description                                                                                 |
| --------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| `target`  | `HTMLElement \| string` | Element to render into, or a CSS selector. No-ops silently if the selector matches nothing. |
| `text`    | `string`                | Text to render.                                                                             |
| `options` | `WriteOptions`          | See below.                                                                                  |

`WriteOptions` = `RenderTextOptions & AttachOptions` (all fields optional, documented below).

### `renderText(text, options?)`

Returns an HTML string: a `<span class="hw-sentence">` wrapping one `<svg class="hw-word">` per word. Pure string output — safe to call without a `document` (e.g. during SSR).

**`RenderTextOptions`**

| Option    | Type      | Default | Description                                                                                                                                                                                                                                         |
| --------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `animate` | `boolean` | `true`  | When `true`, each letter's path is rendered with `stroke-dasharray/dashoffset` primed for the draw-in transition (invisible until `animateWriting()` runs on it). When `false`, letters render fully drawn immediately, with no transition styling. |
| `icons`   | `Record<string, Icon>` | — | Icons available as `:name:` shortcodes (see [Icons](#icons)). |
| `dots`    | `boolean` | `false` | Show a dot where each stroke will start before the pen gets there (round caps paint one on every undrawn stroke). Off, each stroke stays hidden until its own turn, so the reader never sees what's coming. |
| `copyable` | `boolean` | `true` | Lay invisible real text over the handwriting so it can be selected and copied like normal text. Set `false` for purely decorative output. |

### `attach(el, options?)`

Wires an `IntersectionObserver` to `el` so that when it scrolls into view, every `.hw-draw` svg inside it (words, icons, annotations, charts) is passed to `animateWriting()`.

**`AttachOptions`** (a subset of standard `IntersectionObserverInit`, plus `once`)

| Option       | Type                 | Default           | Description                                                                                                                                                                                                                 |
| ------------ | -------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`       | `Element \| null`    | `null` (viewport) | Passed through to `IntersectionObserver`.                                                                                                                                                                                   |
| `rootMargin` | `string`             | `"0px"`           | Passed through to `IntersectionObserver`.                                                                                                                                                                                   |
| `threshold`  | `number \| number[]` | `0`               | Passed through to `IntersectionObserver`.                                                                                                                                                                                   |
| `once`       | `boolean`            | `true`            | If `true`, stops observing `el` after the first time it intersects (animation fires once). Set `false` to re-trigger every time it re-enters the viewport (combine with re-rendering if you want fresh variants each time). |

### `animateWriting(el)`

Starts the draw-in transition immediately on a rendered `.hw-word` element (or any element containing `.hw-stroke` paths — words, icons, annotations, charts): adds the `hw-visible` class and sets each stroke's `stroke-dashoffset` to `0`. This is what `attach()` calls automatically on intersection — call it directly if you're driving the animation from something other than scroll (see [Triggering the animation manually](#triggering-the-animation-manually)).

### `renderIcon(icon, options?)` / `drawIcon(target, icon, options?)`

| Option        | Type      | Default                   | Description                                                   |
| ------------- | --------- | ------------------------- | ------------------------------------------------------------- |
| `animate`     | `boolean` | `true`                    | Draw strokes in one after another.                            |
| `size`        | `number`  | `24`                      | Rendered px size (24 = one line of text).                     |
| `color`       | `string`  | `var(--hw-color, #000)`   | Stroke color.                                                 |
| `strokeWidth` | `number`  | `2`                       | Pen width in grid units, same as letters.                     |
| `roughness`   | `number`  | `1`                       | `0` clean, `1` default hand, `2` loose.                       |
| `seed`        | `number`  | —                         | Repeatable drawing (e.g. match SSR and client).               |
| `delay`       | `number`  | `0`                       | ms before the first stroke.                                   |
| `label`       | `string`  | —                         | Accessible name; without it the icon is `aria-hidden`.        |
| `dots`        | `boolean` | `false`                   | Show each stroke's start dot before it draws.                 |

`drawIcon` also takes the `AttachOptions`.

### `annotate(target, options)` / `renderAnnotation(width, height, options)`

Options: `type` (required), `color`, `strokeWidth`, `padding` (px, default 4), `passes` (times the pen goes over, default 1), `roughness`, `seed`, `animate`, `delay`, `duration`, `dots`. `annotate` also takes the `AttachOptions` and returns `{ redraw(), remove() }`.

### `renderChart(options)` / `drawChart(target, options)`

Options: `type` (`"bar" | "line" | "pie" | "donut"`), `data` (`{ label, value, color? }[]`, non-negative values), `width` (360), `height` (220), `color` (bar/line), `colors` (pie/donut, default `chartPalette`), `fill` (`"hatch"` or `"none"`), `format` (value → label string), `title`, `animate`, `roughness`, `seed`, `dots`.

### `renderSparkline(values, options?)`

Options: `width` (64), `color`, `animate`, `roughness`, `seed`, `delay`, `label`, `dots`.

### `renderText` option: `icons`

`renderText(text, { icons })` / `write(target, text, { icons })` turns `:name:` into that icon, drawn inline at text size. Unknown shortcodes render as plain text; the `aria-label` reads the icon's name.

## How the animation works

Each letter is an SVG `<path>` with `pathLength="1"`, `stroke-dasharray:1`, and `stroke-dashoffset:1` — the path is drawn but entirely hidden behind its own dash gap. A zero-length dash still gets its round cap painted, which would show as a dot at every undrawn stroke, so strokes also start `visibility:hidden` and flip visible (a `0s` transition) at the same moment their own draw begins — pass `dots: true` to keep the dots. `animateWriting()` sets `stroke-dashoffset` to `0`, and a CSS `transition` (declared inline per-path, staggered by letter index) animates the stroke drawing in left to right, letter by letter, word by word. Stagger and stroke duration are fixed internally (60ms per letter offset, 400ms draw per letter) — not currently configurable via options.

## Handwriting randomness

Two independent layers of randomness make repeated text look hand-written rather than stamped:

1. **Variant selection** — most glyphs ship with multiple (typically 3) hand-drawn path variants. Each time a character is rendered, a variant is picked at random, with one rule: it never repeats the same variant used the previous time that character was rendered (tracked per-character, process-wide), so runs of the same letter don't look identical back to back.
2. **Per-instance jitter** — independent of variant, every rendered letter gets a small random `rotate` (±7°), baseline `dy` drift (±1 unit), and `scale` (±10%), applied via an SVG transform pivoted around the letter's own center (so jitter never shifts later letters in a word out of position). This is freshly randomized on every render — it is not seeded or reproducible.

Both layers use `Math.random()` directly and are **not deterministic** — re-rendering the same text will look slightly different each time. This is intentional (it's what makes it read as handwriting rather than a font).

## Styling & class names

| Class         | Applied to                  | Purpose                                                                                                                 |
| ------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `hw-sentence` | outer `<span>`              | Wraps all words for one `renderText()` call; carries `aria-label` with the original text.                               |
| `hw-word`     | one `<svg>` per word        | The unit `attach()`/`animateWriting()` operate on.                                                                      |
| `hw-letter`   | one `<path>` per letter     | Individual glyph stroke.                                                                                                |
| `hw-stroke`   | every drawn `<path>`        | Letters, icon strokes, annotation and chart strokes — what `animateWriting()` reveals.                                  |
| `hw-copy`     | one `<span>` per word       | Invisible selectable text over the drawn word (`copyable`).                                                             |
| `hw-draw`     | every drawn `<svg>`         | What `attach()` looks for. Also: `hw-icon`, `hw-annotation`, `hw-chart`, `hw-sparkline`.                                |
| `hw-visible`  | added to `hw-word` elements | Set by `animateWriting()` once triggered; useful as a CSS hook if you want to react to "this word has started drawing." |

Color is the one themeable value, via the `--hw-color` custom property (see [Styling color](#styling-color)). Stroke width (`2`) and letter height (`24` units, viewBox-relative) are currently fixed, not configurable.

## Copying text

With `copyable` on (the default), each word carries a transparent `<span class="hw-copy">` holding the real characters, stretched over the drawn word. Selecting the handwriting highlights it like text, and copying gives the original string, spaces and line breaks included. Each copyable render also includes one small `<style>` rule so selected copy text stays invisible under a translucent highlight; override it with your own `.hw-copy::selection` rule.

The copy layer is sized for words at their natural 24px height. If your CSS scales the word svgs (e.g. `height: 1em`), scale the copy layer by the same factor so the highlight lines up:

```css
.big .hw-word { height: 1em; width: auto; }
.big .hw-copy { zoom: 2.667; } /* 64px font-size ÷ 24px word height */
```

Keep `.hw-sentence` and `.hw-token` inline (not flex or grid): browsers add line breaks between flex items when copying.

## Accessibility

- The outer `hw-sentence` span carries `aria-label="<original text>"` (HTML-escaped), so screen readers announce the real text rather than trying to parse decorative SVG paths.
- Every `hw-word` SVG has `aria-hidden="true"`, removing the decorative glyph paths from the accessibility tree.

## Glyph coverage

| Set         | Characters              |
| ----------- | ----------------------- |
| Lowercase   | `a`–`z`                 |
| Uppercase   | `A`–`Z`                 |
| Digits      | `0`–`9`                 |
| Punctuation | `.` `,` `!` `?` `'` `-` `&` `(` `)` `—` `"` `` ` `` `{` `}` `[` `]` `*` `=` `+` `@` `:` |

Characters outside this set (other punctuation, whitespace beyond the plain space used to split words, non-Latin scripts, emoji) are silently skipped — they contribute no path and no width. Unsupported _uppercase_ input falls back to the lowercase glyph if one exists (e.g. an accidental extra capital); punctuation is matched exactly, with no case folding.

## Project structure

```
src/
  index.ts                     — write(), public exports
  renderer.ts                  — renderText(), animateWriting(), variant logic, inline icons
  observer.ts                  — attach(), IntersectionObserver wiring
  icon.ts                      — renderIcon(), drawIcon()
  annotate.ts                  — annotate(), renderAnnotation()
  chart.ts                     — renderChart(), drawChart(), renderSparkline()
  engine/
    stroke.ts                  — the one stroke markup builder, jitter, animation timing
    shapes.ts                  — clean geometry (line, curve, arc, ellipse, rect, star, hatch…)
    sketch.ts                  — turns clean geometry into a hand-drawn stroke
    random.ts                  — Math.random or a seeded generator
  icons/
    index.ts                   — named exports + `icons` map (the `glyphed.js/icons` entry)
    arrows.ts, interface.ts, objects.ts — icon definitions
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
  width: number; // advance width, in the same units as the 24-unit-tall viewBox
  variants: string[]; // one or more monoline SVG path `d` strings, hand-drawn within 0 0 width 24
}
```

Adding or editing a glyph means editing its own file under `glyphs/letters`, `glyphs/digits`, or `glyphs/punctuation` — no other file needs to change except `glyphs.ts`'s import/lookup if you're adding a brand-new character.

## Development

```bash
npm run build      # tsc — compiles src/ to dist/ (ESM + .d.ts)
npm run typecheck  # tsc --noEmit
```

There is no test suite or lint script yet.

## Demo

`demo/index.html` is a static page (loads `../dist/index.js`, so run `npm run build` first) with:

- a live playground — type any text, change stroke color, toggle animate on/off, replay
- the full glyph gallery — every supported letter, digit, and punctuation mark, animated on scroll

Open it with any static file server, e.g. `npx serve .` then visit `/demo/`.

## Showcase video

`docs/social/glyphed-js-showcase.mp4` is a 52-second, 1080p60 tour of the library: handwriting, icons, annotations, charts, and copyable text, cut to a 120 BPM track synthesised from the same timeline, so every pop and bounce lands on the beat.

It's rendered from `docs/social/showcase/showcase.html`, which uses the built package. Open that file directly to preview it in real time (add `?t=12` to start 12 seconds in). To render the video:

```bash
npm run showcase   # needs ffmpeg with libx264 on PATH, or FFMPEG=/path/to/ffmpeg
```

The renderer drives the page on a virtual clock and captures every frame, so output is smooth and identical on every run. Set `FPS`, `FROM`, and `TO` for quick partial drafts.

## License

ISC
