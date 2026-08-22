import type { IconDatabase } from "./types.js";
import { iconCheck } from "./icon-check.js";
import { iconX } from "./icon-x.js";
import { iconPlus } from "./icon-plus.js";
import { iconMinus } from "./icon-minus.js";
import { iconArrowRight } from "./icon-arrow-right.js";
import { iconArrowLeft } from "./icon-arrow-left.js";

export type { IconEntry, IconDatabase } from "./types.js";

export const icons: IconDatabase = {
  check: iconCheck,
  x: iconX,
  plus: iconPlus,
  minus: iconMinus,
  "arrow-right": iconArrowRight,
  "arrow-left": iconArrowLeft,
};
