import type { IconEntry } from "./types.js";

/** Real hand-drawn glyph: "x", 3 wobble variants. */
export const iconX: IconEntry = {
  width: 32,
  height: 32,
  variants: [
    "M7 7 C 13 13 19 19 25 25 M25 7 C 19 13 13 19 7 25",
    "M6.8 7.3 C 13.2 12.7 19.4 18.6 25.2 24.8 M25.3 6.9 C 19.1 12.9 13.4 18.7 7.1 25.2",
    "M7.3 6.8 C 13.4 13.4 19.1 19.2 24.8 25.1 M24.7 7.2 C 18.7 13.1 12.9 19.3 6.9 24.9",
  ],
};
