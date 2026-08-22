import type { GlyphEntry } from "../types.js";

/** Real hand-drawn glyph: "=", 3 wobble variants. */
export const punctEquals: GlyphEntry = {
  width: 10,
  variants: [
    "M1 10 L9 10 M1 14 L9 14",
    "M0.9 10.1 L9.1 9.9 M0.9 14.1 L9.1 13.9",
    "M1.1 9.9 L8.9 10.1 M1.1 14.1 L8.9 13.9",
  ],
};
