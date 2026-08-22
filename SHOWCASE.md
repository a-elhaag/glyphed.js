# Showcase Film — Plan

The promo asset for strokes-js: one 12s looping film, cut down to a 6s social edit.
This document is the spec. No production code is written until it is signed off.

## Goal

A developer scrolling GitHub or npm sees the GIF, understands what the library does
within two seconds, and wants to type `npm i strokes-js` before the loop finishes.

The conversion job is not "look pretty." It is three claims, in this order:

1. Text writes itself, in ink, in the browser.
2. It is never the same twice — this is not a font.
3. It costs one line of code and zero dependencies.

Everything in the timeline serves one of those three. Anything that serves none is cut.

## Format

| Output | Size | FPS | Duration | Budget | Where |
| --- | --- | --- | --- | --- | --- |
| `showcase.gif` | 900x506 | 20 | 12.0s | < 5 MB | README, npm |
| `showcase.mp4` (h264, yuv420p) | 1440x810 | 60 | 12.0s | < 3 MB | docs site hero, X/LinkedIn |
| `showcase.webm` (vp9) | 1440x810 | 60 | 12.0s | < 2 MB | docs site `<video>` primary |
| `showcase-short.gif` | 900x506 | 20 | 6.0s | < 2.5 MB | X reply, issue threads |
| `poster.png` | 1440x810 | — | — | — | `<video poster>`, social card |

Master capture is 1440x810 PNG frames; every output is derived from that one render.

GIF suits this library unusually well: flat paper, one ink color at a time, no gradients,
no video noise. A 64-colour palette is lossless to the eye here, which is why the budget
above is realistic at 900px.

### Constraints the format imposes

- **Autoplays, loops forever, no sound, no scrubbing.** No audio cues, no text that needs
  more than ~1.2s to read, no information that only makes sense on a second viewing.
- **First frame is the poster frame.** GitHub and some clients show frame 0 statically. It
  must not be an empty page.
- **The loop seam is visible.** Never fade to black; land the last frame exactly on the first.
- **README renders at ~880px, and on mobile at ~360px.** Every glyph and every label must
  survive a 40% downscale. Test by squinting at a thumbnail, not at the master.

## Timeline — 12.0s

Persistent through every beat: paper `oklch(0.97 0.018 88)`, the faint workshop grid, and a
small static `strokes-js` wordmark bottom-left in Martian Mono. The wordmark is what makes
frame 0 a legitimate poster frame and what hides the loop seam.

| # | In–Out | Beat | On screen | Serves |
| --- | --- | --- | --- | --- |
| 0 | 0.0–0.4 | Cold open | Blank paper, grid, wordmark. A single ink dot pulses once where the first stroke will land. | poster frame + loop seam |
| 1 | 0.4–2.2 | The hook | `strokes.js` writes itself, large, centred, ink. Holds 0.4s. Sub-line fades in beneath in Spline Sans: *text that writes itself.* | claim 1 |
| 2 | 2.2–4.6 | Cause and effect | Pinned code note types out `write("#hello", "Hello, world!")` char by char (1.2s). The instant the closing paren lands, `Hello, world!` draws in beside it. Hold 0.5s. | claim 3 |
| 3 | 4.6–7.2 | The differentiator | `handwritten` drawn three times down a column, 0.7s apart — visibly different rotation, drift, scale. Then all three **reroll simultaneously** (0.6s) into three new hands. Label: *same word. a different hand. every time.* | claim 2 |
| 4 | 7.2–9.2 | Range | Same phrase re-inks vermilion -> cobalt -> mint, 0.35s each, over a caption `--hw-color`. Then a glyph ribbon tracks horizontally: `A–Z 0–9 . , ! ? & @ { } [ ] — *`, all drawing in as they pass. | coverage, theming |
| 5 | 9.2–11.2 | The receipt | Four hand-drawn ticks stamp in 0.25s apart: *0 dependencies* / *ESM + TypeScript* / *scroll-triggered* / *one CSS variable*. Then `npm i strokes-js` in Martian Mono with a blinking caret. | claim 3, the CTA |
| 6 | 11.2–12.0 | Retract | Every stroke reverses — `stroke-dashoffset` animates 0 -> 1 — un-writing the page back to bare paper. Final frame is byte-identical to frame 0. | seamless loop |

Beat 3 is the beat that sells the library. It is the only claim a webfont cannot make, so it
gets the most screen time and the clearest label. If any beat has to be cut for size, cut
beat 4 first, then beat 2's hold — never beat 3.

Beat 6's retract is free: the draw-in already works by animating `stroke-dashoffset` from 1
to 0, so the un-write is the same transition run backwards. No new mechanism.

### The 6s social edit

Beats 1, 3 and 5 only, with beat 3 shortened to two samples plus the reroll:

`0.0–0.4` cold open, `0.4–2.0` hook, `2.0–4.2` never-the-same-twice, `4.2–5.6` receipt +
`npm i`, `5.6–6.0` retract. Cut from the same frame sequence, not re-recorded.

## Production architecture

The library animates off CSS transitions and wall-clock time. Recording that directly gives
dropped frames, timing drift, and a different render every run. So the harness owns the clock
and the randomness, and the capture is a pure function of frame index.

```
showcase/
  index.html        # recording stage, fixed 1440x810, fonts inlined as base64
  timeline.ts       # the beat table above as data: { at, dur, action }
  driver.ts         # window.__seek(tMs) -> renders the exact state at t. No rAF, no timers.
  seed.ts           # xorshift PRNG; stubs Math.random before any renderText() call
scripts/
  record-showcase.ts    # Playwright: for each frame, __seek(i * 1000/60), screenshot
  encode-showcase.sh    # ffmpeg: frames -> mp4 / webm / gif / short / poster
docs/media/
  showcase.{gif,mp4,webm}  showcase-short.gif  poster.png
```

Four decisions worth stating up front, because they are the ones that make or break the render:

1. **Drive `stroke-dashoffset` directly; disable the CSS transition.** `renderText()` emits an
   inline `transition` per path. The harness overrides it with
   `.hw-letter { transition: none !important }` and sets `stroke-dashoffset` itself each frame
   from `progress(t, letterIndex)`. This buys exact seeking, arbitrary playback speed, and the
   beat-6 retract — none of which the fixed 60ms/400ms constants allow.
2. **Slow the draw to ~1.6x for beats 1 and 3.** Native speed reads as a flicker; ~1.5s for
   `strokes.js` reads as writing. Beats 4 and 5 stay near native so the film keeps pace.
3. **Seed `Math.random` before the first render.** Frames become reproducible, re-runs are
   byte-identical, and beat 3's three samples can be chosen from a seed where the difference
   is obvious rather than left to chance.
4. **Inline the fonts as base64 and `await document.fonts.ready`.** Spline Sans and Martian
   Mono loading mid-capture would show up as a FOUT stutter in the middle of the film.

### Encoding

ffmpeg is not on `PATH` but ships with the Playwright bundle at
`/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux`.

GIF needs a two-pass palette or it will band badly on the paper colour:

```sh
ffmpeg -framerate 60 -i frames/%05d.png -vf \
  "fps=20,scale=900:-1:flags=lanczos,palettegen=max_colors=64:stats_mode=diff" palette.png

ffmpeg -framerate 60 -i frames/%05d.png -i palette.png -lavfi \
  "fps=20,scale=900:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" \
  -loop 0 docs/media/showcase.gif
```

If the GIF lands over 5 MB, in order: drop to 15fps, then 800px, then ship the 6s edit as the
README asset and keep the 12s as the docs-site video.

## Checklist before it ships

- [ ] Frame 0 and the final frame are pixel-identical (`cmp` them).
- [ ] Legible at 360px wide — check as an actual thumbnail, not zoomed out in a viewer.
- [ ] Nothing on screen for less than 0.5s that has to be read.
- [ ] `npm i strokes-js` is on screen for at least 1.2s.
- [ ] Two consecutive recordings produce identical frames (proves the seed works).
- [ ] Beat 3's three samples are visibly different in a still, not just in motion.
- [ ] Ink colours match DESIGN.md exactly: vermilion, cobalt, mint.
- [ ] GIF under 5 MB, mp4 under 3 MB.
- [ ] README embeds the GIF above the fold, before the install block.

## Known issue to fix first

`docs/site.js:5` loads `strokes-js@0.1.4` from jsDelivr while the package is at `0.2.3`. The
live docs site is two minor versions behind and is missing the punctuation glyphs added in
0.2.0–0.2.3. The showcase harness should import from the local `dist/` build, not the CDN, and
the site pin should be bumped separately.
