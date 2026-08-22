import type { IconEntry } from "./types.js";

/** Real hand-drawn glyph: "arrow-down", 3 wobble variants. */
export const iconArrowDown: IconEntry = {
  width: 32,
  height: 32,
  variants: [
    "M16 6 C 16.5 13 15.5 19 16 24 M9 17 C 11.5 19.5 13.5 23 16 25.5 M16 25.5 C 18.5 23 20.5 19.5 23 17",
    "M15.8 6.2 C 16.3 13.2 14.8 19.2 15.3 23.8 M8.8 16.8 C 11.3 19.3 13.7 22.8 16.2 25.3 M15.8 25.3 C 18.7 22.8 20.8 19.3 23.2 17.2",
    "M16.2 5.8 C 16.6 12.9 15.3 19.2 15.7 24.2 M9.2 17.2 C 11.7 19.3 13.3 22.8 15.8 25.7 M16.2 25.7 C 18.3 23.2 20.2 19.7 22.8 16.8",
  ],
};
