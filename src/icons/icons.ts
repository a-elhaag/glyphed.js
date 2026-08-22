import type { IconDatabase } from "./types.js";
import { iconCheck } from "./icon-check.js";
import { iconX } from "./icon-x.js";
import { iconPlus } from "./icon-plus.js";
import { iconMinus } from "./icon-minus.js";
import { iconArrowRight } from "./icon-arrow-right.js";
import { iconArrowLeft } from "./icon-arrow-left.js";
import { iconArrowUp } from "./icon-arrow-up.js";
import { iconArrowDown } from "./icon-arrow-down.js";
import { iconChevronDown } from "./icon-chevron-down.js";
import { iconSearch } from "./icon-search.js";
import { iconHeart } from "./icon-heart.js";
import { iconEmail } from "./icon-email.js";
import { iconGithub } from "./icon-github.js";
import { iconCircle } from "./icon-circle.js";
import { iconBell } from "./icon-bell.js";
import { iconTrash } from "./icon-trash.js";

export type { IconEntry, IconDatabase } from "./types.js";

export const icons: IconDatabase = {
  check: iconCheck,
  x: iconX,
  plus: iconPlus,
  minus: iconMinus,
  "arrow-right": iconArrowRight,
  "arrow-left": iconArrowLeft,
  "arrow-up": iconArrowUp,
  "arrow-down": iconArrowDown,
  "chevron-down": iconChevronDown,
  search: iconSearch,
  heart: iconHeart,
  email: iconEmail,
  github: iconGithub,
  circle: iconCircle,
  bell: iconBell,
  trash: iconTrash,
};
