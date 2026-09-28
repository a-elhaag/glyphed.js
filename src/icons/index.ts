import * as arrows from "./arrows.js";
import * as interfaceIcons from "./interface.js";
import * as objects from "./objects.js";
import type { Icon } from "./types.js";

export { icon, type Icon } from "./types.js";
export * from "./arrows.js";
export * from "./interface.js";
export * from "./objects.js";

/**
 * Every bundled icon keyed by its kebab-case name (`"arrow-right"`, `"bar-chart"`, …).
 * Importing this pulls in the whole set; import icons by name to keep only what you use.
 */
export const icons: Record<string, Icon> = Object.fromEntries(
  [...Object.values(arrows), ...Object.values(interfaceIcons), ...Object.values(objects)].map((i) => [i.name, i]),
);
