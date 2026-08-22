export interface IconEntry {
  width: number;
  height: number;
  variants: string[];
}

export type IconDatabase = Record<string, IconEntry>;
