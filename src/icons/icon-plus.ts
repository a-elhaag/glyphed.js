import type { IconEntry } from "./types.js";

/** Real hand-drawn glyph: "plus", 3 wobble variants. */
export const iconPlus: IconEntry = {
  width: 32,
  height: 32,
  variants: [
    "M16 6 C 15.5 13 16.5 20 16 26 M6 16 C 13 15.5 20 16.5 26 16",
    "M15.8 6.2 C 15.2 12.9 16.7 19.8 16.2 25.7 M6.2 16.3 C 13.3 15.2 19.8 16.8 25.8 15.8",
    "M16.2 5.8 C 16.6 13.1 15.4 19.9 15.8 26.2 M5.8 15.7 C 12.9 16.4 19.9 15.3 26.2 16.2",
  ],
};
