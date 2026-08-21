import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: monoline "m", 3 wobble variants. */
export const letterM: GlyphEntry = {
  width: 11,
  variants: [
    "M1 20 L1 9 C 1 9 4 7.5 4.5 11 L4.5 20 M4.5 11 C 4.5 9 7.5 7.5 8 11 L8 20",
    "M0.8 19.8 L0.8 8.8 C 1.1 8.9 4.2 7.7 4.3 10.9 L4.4 20.0 M4.4 11.1 C 4.3 8.8 7.7 7.4 8.2 10.9 L8.1 20.2",
    "M0.9 20.2 L0.8 9.2 C 1.0 9.2 4.1 7.6 4.3 11.2 L4.7 19.9 M4.7 11.2 C 4.4 8.8 7.6 7.7 8.0 11.0 L8.0 19.9",
  ],
};
