export interface GlyphEntry {
  width: number;
  variants: string[];
}

export type GlyphDatabase = Record<string, GlyphEntry>;
